import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions'
import { ProductsService } from '../products/products.service'
import { ProductSort } from '../products/dto/query-products.dto'
import { TrevorChatDto, TrevorReply } from './dto/trevor-chat.dto'
import { SEARCH_PRODUCTS_TOOL, TREVOR_SYSTEM_PROMPT } from './prompts/system-prompt'

interface SearchToolArgs {
  query: string
  categorySlug?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
}

/** What we pass back to the LLM as the tool result.
 * Prices are already converted to ₹ (rupees) so the LLM displays them correctly.
 */
interface SearchToolResultItem {
  id: string
  slug: string
  name: string
  brand: string | null
  priceRupees: number // ₹ — paise ÷ 100
  compareAtPriceRupees: number | null
  ratingAverage: number
  reviewCount: number
  inStock: boolean
  categorySlug: string
  imageUrl: string | null
}

@Injectable()
export class TrevorService {
  private readonly logger = new Logger(TrevorService.name)
  private readonly client: OpenAI | null
  private readonly model: string
  private readonly maxTokens: number

  constructor(
    private readonly config: ConfigService,
    private readonly productsService: ProductsService,
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY')
    this.model = this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini'
    this.maxTokens = Number(this.config.get<string>('OPENAI_MAX_TOKENS') ?? 500)
    this.client = apiKey ? new OpenAI({ apiKey }) : null

    if (!this.client) {
      this.logger.warn(
        'OPENAI_API_KEY is not set. Ask Trevor will return a stub response until configured.',
      )
    }
  }

  /**
   * Chat with Trevor.
   * Loops the OpenAI tool-call protocol until the model returns a final answer
   * (max 4 iterations to guard against runaway tool calls).
   */
  async chat(dto: TrevorChatDto): Promise<TrevorReply> {
    // Stub mode (no API key) — useful for local UX dev.
    if (!this.client) {
      return this.stubReply(dto.message)
    }

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: TREVOR_SYSTEM_PROMPT },
      ...(dto.history?.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.text,
      })) ?? []),
      { role: 'user', content: dto.message },
    ]

    const tools: ChatCompletionTool[] = [SEARCH_PRODUCTS_TOOL as ChatCompletionTool]

    let finalText = ''
    let toolProductSlugs: string[] = []

    for (let i = 0; i < 4; i++) {
      let response
      try {
        response = await this.client.chat.completions.create({
          model: this.model,
          messages,
          tools,
          tool_choice: 'auto',
          max_tokens: this.maxTokens,
          temperature: 0.4,
        })
      } catch (err: any) {
        this.logger.error(`OpenAI error: ${err?.message || err}`)
        throw new ServiceUnavailableException('Trevor is taking a break. Please try again.')
      }

      const choice = response.choices[0]?.message
      if (!choice) break

      messages.push(choice as ChatCompletionMessageParam)

      // No tool calls → this is the final answer.
      if (!choice.tool_calls?.length) {
        finalText = choice.content ?? ''
        break
      }

      // Run each tool call and feed results back to the model.
      for (const tc of choice.tool_calls) {
        if (tc.type !== 'function' || tc.function.name !== 'searchProducts') {
          messages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify({ error: 'unknown tool' }),
          })
          continue
        }

        let args: SearchToolArgs
        try {
          args = JSON.parse(tc.function.arguments || '{}') as SearchToolArgs
        } catch {
          args = { query: '' }
        }

        const results = await this.runSearchProducts(args)
        toolProductSlugs = results.map((r) => r.slug)

        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify({ products: results }),
        })
      }
    }

    // Extract <json>...</json> productSlugs from the final reply; fall back to
    // the tool result's slugs if the model forgot to include them.
    const { reply, productSlugs } = this.extractFinalReply(finalText, toolProductSlugs)
    return { reply, productSlugs }
  }

  // ── Tool implementation ────────────────────────────────────────────────────

  private async runSearchProducts(args: SearchToolArgs): Promise<SearchToolResultItem[]> {
    const limit = Math.min(Math.max(args.limit ?? 6, 1), 8)
    const { items } = await this.productsService.findAllPublic({
      q: args.query,
      categorySlug: args.categorySlug,
      minPrice: args.minPrice,
      maxPrice: args.maxPrice,
      page: 1,
      limit,
      sortBy: ProductSort.relevance,
    })

    return items.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      priceRupees: +(p.price / 100).toFixed(2),
      compareAtPriceRupees: p.compareAtPrice != null ? +(p.compareAtPrice / 100).toFixed(2) : null,
      ratingAverage: p.ratingAverage,
      reviewCount: p.reviewCount,
      inStock: p.inStock,
      categorySlug: p.categorySlug,
      imageUrl: p.images[0] ?? null,
    }))
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Strip the trailing <json>{"productSlugs":[...]}</json> sentinel from the
   * assistant reply and parse it. If parsing fails, fall back to the slugs we
   * already collected from the tool result.
   */
  private extractFinalReply(
    rawText: string,
    fallbackSlugs: string[],
  ): { reply: string; productSlugs: string[] } {
    if (!rawText) {
      return {
        reply: "Sorry, I couldn't think of anything. Try rephrasing?",
        productSlugs: [],
      }
    }

    const match = rawText.match(/<json>([\s\S]*?)<\/json>/i)
    let productSlugs: string[] = []
    let reply = rawText

    if (match) {
      reply = rawText.replace(match[0], '').trim()
      try {
        const parsed = JSON.parse(match[1])
        if (Array.isArray(parsed.productSlugs)) {
          productSlugs = parsed.productSlugs.filter((x: unknown) => typeof x === 'string')
        }
      } catch {
        productSlugs = fallbackSlugs
      }
    } else {
      productSlugs = fallbackSlugs
    }

    return { reply: reply || 'Here are some options for you.', productSlugs }
  }

  private stubReply(message: string): TrevorReply {
    return {
      reply: `(Trevor is in stub mode — OPENAI_API_KEY not set.) You said: "${message}".`,
      productSlugs: [],
    }
  }
}
