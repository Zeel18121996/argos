# Ask Trevor — Implementation Notes

> Argos AI shopping assistant, powered by OpenAI GPT-4o-mini with function calling.

---

## Overview

Trevor is a right-side chat drawer that lets users describe what they want in natural language.  
It calls the OpenAI API which uses a `searchProducts` tool to query the real catalogue, then replies with a short recommendation + product cards.

---

## Architecture

```
User types message
      │
      ▼
Client: POST /api/v1/trevor/chat
  { sessionId, message, history (last 6 msgs) }
      │
      ▼
TrevorService (NestJS)
  ├── builds messages array (system + history + user)
  ├── calls OpenAI chat.completions with tools: [searchProducts]
  │
  │   OpenAI returns tool_call → searchProducts({ query, ... })
  │        │
  │        ▼
  │   ProductsService.findAllPublic({ q, categorySlug, ... })
  │        │
  │        ▼
  │   tool result sent back to OpenAI
  │
  └── OpenAI returns final reply + <json>{"productSlugs":[...]}</json>
      │
      ▼
Client: renders assistant bubble + ProductStrip (cards fetched by slug)
```

---

## Files

### Server

| File                                  | Purpose                                                                     |
| ------------------------------------- | --------------------------------------------------------------------------- |
| `src/trevor/trevor.module.ts`         | NestJS module — imports `ProductsModule`                                    |
| `src/trevor/trevor.controller.ts`     | `POST /trevor/chat` — public, throttled 20 req/min/IP                       |
| `src/trevor/trevor.service.ts`        | OpenAI tool-call loop (max 4 iterations); `runSearchProducts`               |
| `src/trevor/dto/trevor-chat.dto.ts`   | Request DTO (`sessionId`, `message`, `history[]`) + `TrevorReply` interface |
| `src/trevor/prompts/system-prompt.ts` | Trevor persona + `SEARCH_PRODUCTS_TOOL` OpenAI tool definition              |

### Client

| File                                     | Purpose                                                                                                          |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `src/features/trevor/trevorSlice.ts`     | Redux state: `isOpen`, `sessionId`, `messages[]`, `isSending`. Persists last 20 msgs to `sessionStorage`         |
| `src/services/trevorApi.ts`              | RTK Query `useSendTrevorMessageMutation` — `POST /trevor/chat`                                                   |
| `src/components/trevor/TrevorDrawer.tsx` | Main drawer shell + all sub-components (greeting, conversation, bubbles, product strip, prompt chips, input bar) |
| `src/components/trevor/TrevorAvatar.tsx` | Reusable Trevor avatar SVG                                                                                       |
| `src/components/trevor/prompts.ts`       | Pool of 20 prompt suggestions + `pickRandomPrompts(n)`                                                           |

### Wiring

| File                                   | Change                                                                  |
| -------------------------------------- | ----------------------------------------------------------------------- |
| `src/app/store.ts`                     | `trevor` reducer registered                                             |
| `src/components/layout/RootLayout.tsx` | `<TrevorDrawer />` mounted (inside Router)                              |
| `src/components/layout/Header.tsx`     | `AskTrevorButton` dispatches `setTrevorOpen(true)`                      |
| `src/config/env.validation.ts`         | `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_MAX_TOKENS` added as optional |
| `src/app.module.ts`                    | `TrevorModule` registered                                               |

---

## Configuration (`.env` at repo root)

```env
# Required for live AI responses. If missing, Trevor returns a stub reply.
OPENAI_API_KEY=sk-...

# Optional overrides
OPENAI_MODEL=gpt-4o-mini       # default
OPENAI_MAX_TOKENS=500          # default
```

---

## Key Behaviours

### Tool-call loop

- Max **4 iterations** to prevent runaway calls.
- If `searchProducts` returns 0 results, the LLM is instructed to **retry with a broader query** (up to 2 retries).
- Tool input: `{ query, categorySlug?, minPrice?, maxPrice?, limit? }` (prices in **paise** for filters).
- Tool output: products with `priceRupees` (already ÷100) so the LLM quotes correct ₹ amounts.

### Product display

- LLM embeds `<json>{"productSlugs":["..."]}</json>` at the end of its reply.
- Service strips this and returns `{ reply, productSlugs[] }` to the client.
- Client fetches product details via existing `useGetProductsBySlugsQuery`.
- Cards render as a **horizontally scrollable strip** inside the assistant bubble.

### State & persistence

- `sessionId` is a UUID generated once per browser session (survives page refresh via `sessionStorage`).
- Last **20 messages** persisted to `sessionStorage` — chat history survives page reload.
- **Clear conversation** button in the drawer header resets history and generates a new `sessionId`.

### Prompt chips

- 5 random prompts shown when conversation is empty; **"More ideas"** reshuffles them.
- Pool of 20 prompts matched to real seeded brands/products (Samsung, Sony, Dyson, Ninja, LEGO, etc.) to ensure results always appear.

### Security & cost guards

- Endpoint is `@Public()` (no auth required).
- `@Throttle({ default: { limit: 20, ttl: 60_000 } })` — 20 req/min per IP.
- `message` max 500 chars, `history` max 12 items (validated by class-validator).
- `max_tokens: 500` caps OpenAI spend per turn (~₹0.02/turn with gpt-4o-mini).

---

## Stub mode

If `OPENAI_API_KEY` is not set, `TrevorService` logs a warning and returns:

```
(Trevor is in stub mode — OPENAI_API_KEY not set.) You said: "<message>".
```

The rest of the app boots normally; no errors are thrown.

---

## Not yet implemented

- **Streaming** (SSE token-by-token) — foundation ready, needs `generateContentStream` swap
- `trevor_messages` analytics table — for reviewing chat quality
- **Mobile keyboard** safe-area padding refinement
- Multi-modal / image upload
