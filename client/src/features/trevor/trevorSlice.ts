import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'

export interface TrevorMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  /** Product slugs to render as cards beneath an assistant message. */
  productSlugs?: string[]
  /** True while the assistant message is being streamed/awaited. */
  pending?: boolean
}

export interface TrevorState {
  isOpen: boolean
  sessionId: string
  messages: TrevorMessage[]
  isSending: boolean
  error: string | null
}

const STORAGE_KEY = 'trevor:v1'

function loadFromStorage(): Partial<TrevorState> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}
    return {
      sessionId: typeof parsed.sessionId === 'string' ? parsed.sessionId : undefined,
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    }
  } catch {
    return {}
  }
}

function persist(state: TrevorState): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sessionId: state.sessionId,
        // Persist only the last 20 messages to keep storage small.
        messages: state.messages.slice(-20),
      }),
    )
  } catch {
    /* ignore quota errors */
  }
}

const stored = loadFromStorage()

const initialState: TrevorState = {
  isOpen: false,
  sessionId: stored.sessionId ?? crypto.randomUUID(),
  messages: stored.messages ?? [],
  isSending: false,
  error: null,
}

const trevorSlice = createSlice({
  name: 'trevor',
  initialState,
  reducers: {
    setTrevorOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload
    },
    addUserMessage: {
      prepare: (text: string) => ({
        payload: { id: nanoid(), role: 'user' as const, text },
      }),
      reducer: (state, action: PayloadAction<TrevorMessage>) => {
        state.messages.push(action.payload)
        persist(state)
      },
    },
    addPendingAssistantMessage: {
      prepare: () => ({
        payload: { id: nanoid(), role: 'assistant' as const, text: '', pending: true },
      }),
      reducer: (state, action: PayloadAction<TrevorMessage>) => {
        state.messages.push(action.payload)
        state.isSending = true
      },
    },
    resolveAssistantMessage: (
      state,
      action: PayloadAction<{ id: string; text: string; productSlugs: string[] }>,
    ) => {
      const msg = state.messages.find((m) => m.id === action.payload.id)
      if (msg) {
        msg.text = action.payload.text
        msg.productSlugs = action.payload.productSlugs
        msg.pending = false
      }
      state.isSending = false
      state.error = null
      persist(state)
    },
    failAssistantMessage: (state, action: PayloadAction<{ id: string; error: string }>) => {
      const msg = state.messages.find((m) => m.id === action.payload.id)
      if (msg) {
        msg.text = action.payload.error
        msg.pending = false
      }
      state.isSending = false
      state.error = action.payload.error
      persist(state)
    },
    clearTrevorHistory: (state) => {
      state.messages = []
      state.sessionId = crypto.randomUUID()
      state.error = null
      persist(state)
    },
  },
})

export const {
  setTrevorOpen,
  addUserMessage,
  addPendingAssistantMessage,
  resolveAssistantMessage,
  failAssistantMessage,
  clearTrevorHistory,
} = trevorSlice.actions

export default trevorSlice.reducer
