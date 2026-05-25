import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Send, X, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/store'
import {
  addPendingAssistantMessage,
  addUserMessage,
  clearTrevorHistory,
  failAssistantMessage,
  resolveAssistantMessage,
  setTrevorOpen,
  type TrevorMessage,
} from '@/features/trevor/trevorSlice'
import { useSendTrevorMessageMutation } from '@/services/trevorApi'
import { useGetProductsBySlugsQuery } from '@/services/productsApi'
import ProductCard from '@/components/Common/ProductCard/ProductCard'
import { cn } from '@/utils/cn'
import TrevorAvatar from './TrevorAvatar'
import { pickRandomPrompts } from './prompts'

// ── Root drawer ───────────────────────────────────────────────────────────────
export default function TrevorDrawer() {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((s) => s.trevor.isOpen)
  const messages = useAppSelector((s) => s.trevor.messages)
  const isSending = useAppSelector((s) => s.trevor.isSending)
  const sessionId = useAppSelector((s) => s.trevor.sessionId)

  const [sendMessage] = useSendTrevorMessageMutation()

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(setTrevorOpen(false))
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, dispatch])

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  const handleSend = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isSending) return

    dispatch(addUserMessage(trimmed))
    const placeholderAction = dispatch(addPendingAssistantMessage())
    const placeholderId = (placeholderAction.payload as TrevorMessage).id

    // Build short history window (last 6 fully-resolved messages, excluding the pending one)
    const history = messages
      .filter((m) => !m.pending)
      .slice(-6)
      .map((m) => ({ role: m.role, text: m.text }))

    try {
      const res = await sendMessage({ sessionId, message: trimmed, history }).unwrap()
      dispatch(
        resolveAssistantMessage({
          id: placeholderId,
          text: res.reply,
          productSlugs: res.productSlugs ?? [],
        }),
      )
    } catch (err) {
      dispatch(
        failAssistantMessage({
          id: placeholderId,
          error: 'Sorry, something went wrong. Please try again in a moment.',
        }),
      )
    }
  }

  if (!isOpen) return null

  const node = (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label="Ask Trevor">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={() => dispatch(setTrevorOpen(false))}
      />

      {/* Drawer panel */}
      <aside
        className={cn(
          'absolute right-0 top-0 h-full w-full sm:w-[600px] bg-white shadow-2xl',
          'flex flex-col animate-[slideInRight_200ms_ease-out]',
        )}
        style={{ fontFamily: 'Barlow, "Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        <Header onClose={() => dispatch(setTrevorOpen(false))} canClear={messages.length > 0} />

        <Conversation messages={messages} />

        {messages.length === 0 && <Greeting />}

        {/* Prompt chips when empty */}
        {messages.length === 0 && <PromptChips onPick={handleSend} disabled={isSending} />}

        <InputBar onSend={handleSend} disabled={isSending} />
      </aside>
    </div>
  )

  return createPortal(node, document.body)
}

// ── Header bar ────────────────────────────────────────────────────────────────
function Header({ onClose, canClear }: { onClose: () => void; canClear: boolean }) {
  const dispatch = useAppDispatch()
  return (
    <div className="flex items-center justify-between px-4 h-14 border-b border-argos-gray-200 shrink-0">
      <div className="flex items-center gap-2">
        <TrevorAvatar size={32} />
        <h2 className="text-[18px] font-bold text-argos-charcoal">Ask Trevor</h2>
      </div>
      <div className="flex items-center gap-1">
        {canClear && (
          <button
            type="button"
            onClick={() => dispatch(clearTrevorHistory())}
            aria-label="Clear conversation"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-argos-gray-50 text-argos-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-argos-blue"
            title="Clear conversation"
          >
            <Trash2 size={18} aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Ask Trevor"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-argos-gray-50 text-argos-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-argos-blue"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// ── Greeting card (shown only when conversation is empty) ─────────────────────
function Greeting() {
  return (
    <div className="px-4 pt-6 pb-2 text-center">
      <TrevorAvatar size={56} className="mx-auto" />
      <h3 className="mt-3 text-[20px] font-bold text-argos-charcoal">Hi, I'm Trevor!</h3>
      <p className="mt-1 text-[14px] text-argos-charcoal max-w-[440px] mx-auto">
        I'll help you search every corner of Argos to find things more easily.
      </p>
      <p className="mt-3 text-[12px] text-argos-gray-mid max-w-[440px] mx-auto">
        So we can improve Ask Trevor, we review chat history and data. Please avoid sharing personal
        information like names and addresses.
      </p>
    </div>
  )
}

// ── Conversation list ─────────────────────────────────────────────────────────
function Conversation({ messages }: { messages: TrevorMessage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages.length, messages[messages.length - 1]?.text])

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
      aria-live="polite"
      aria-atomic="false"
    >
      {messages.map((m) =>
        m.role === 'user' ? (
          <UserBubble key={m.id} text={m.text} />
        ) : (
          <AssistantBubble key={m.id} message={m} />
        ),
      )}
    </div>
  )
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] px-3 py-2 bg-argos-blue text-white rounded-2xl rounded-tr-sm text-[14px] whitespace-pre-wrap">
        {text}
      </div>
    </div>
  )
}

function AssistantBubble({ message }: { message: TrevorMessage }) {
  return (
    <div className="flex items-start gap-2">
      <TrevorAvatar size={28} />
      <div className="flex-1 min-w-0">
        <div className="inline-block max-w-[90%] px-3 py-2 bg-argos-gray-50 text-argos-charcoal rounded-2xl rounded-tl-sm text-[14px] whitespace-pre-wrap">
          {message.pending ? <TypingDots /> : message.text}
        </div>
        {message.productSlugs && message.productSlugs.length > 0 && (
          <ProductStrip slugs={message.productSlugs} />
        )}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 items-center" aria-label="Trevor is typing">
      <span className="w-1.5 h-1.5 rounded-full bg-argos-gray-mid animate-pulse" />
      <span className="w-1.5 h-1.5 rounded-full bg-argos-gray-mid animate-pulse [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-argos-gray-mid animate-pulse [animation-delay:300ms]" />
    </span>
  )
}

// ── Product strip (fetched lazily by slug) ────────────────────────────────────
function ProductStrip({ slugs }: { slugs: string[] }) {
  const { data: products = [], isLoading } = useGetProductsBySlugsQuery(slugs, {
    skip: slugs.length === 0,
  })

  if (isLoading) {
    return (
      <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
        {slugs.map((s) => (
          <div
            key={s}
            className="w-[180px] h-[260px] bg-argos-gray-50 rounded animate-pulse shrink-0"
          />
        ))}
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="flex gap-2 mt-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
      {products.map((p) => (
        <div key={p.id} className="w-[200px] shrink-0 snap-start">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  )
}

// ── Prompt chips ──────────────────────────────────────────────────────────────
function PromptChips({ onPick, disabled }: { onPick: (text: string) => void; disabled: boolean }) {
  const [seed, setSeed] = useState(0)
  const prompts = useMemo(() => pickRandomPrompts(5), [seed])

  return (
    <div className="px-4 pb-3 shrink-0">
      <p className="text-[13px] text-argos-gray-mid mb-2">
        Tell me what you're looking for, or use a prompt to get started…
      </p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPick(p)}
            disabled={disabled}
            className="text-left text-[13px] px-3 py-2 rounded-full border border-argos-gray-200 hover:bg-argos-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-argos-blue disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="text-[13px] font-semibold text-argos-blue px-3 py-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-argos-blue rounded-full"
        >
          More ideas
        </button>
      </div>
    </div>
  )
}

// ── Input bar ─────────────────────────────────────────────────────────────────
function InputBar({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow textarea up to 4 lines
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`
  }, [text])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text)
    setText('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (text.trim() && !disabled) {
        onSend(text)
        setText('')
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-argos-gray-200 px-3 py-3 shrink-0 bg-white"
    >
      <div className="flex items-end gap-2 bg-argos-gray-50 rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-argos-blue">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Trevor a question."
          rows={1}
          maxLength={500}
          aria-label="Ask Trevor a question"
          className="flex-1 resize-none bg-transparent border-0 outline-none text-[14px] text-argos-charcoal placeholder-argos-gray-mid leading-6 max-h-24"
        />
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          aria-label="Send message"
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-argos-green text-white hover:bg-argos-green-dark disabled:bg-argos-gray-200 disabled:text-argos-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}
