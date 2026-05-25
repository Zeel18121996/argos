import { baseApi } from '@/app/baseApi'

export interface TrevorHistoryItem {
  role: 'user' | 'assistant'
  text: string
}

export interface TrevorChatRequest {
  sessionId: string
  message: string
  history?: TrevorHistoryItem[]
}

export interface TrevorChatResponse {
  reply: string
  productSlugs: string[]
}

export const trevorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendTrevorMessage: builder.mutation<TrevorChatResponse, TrevorChatRequest>({
      query: (body) => ({
        url: '/trevor/chat',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useSendTrevorMessageMutation } = trevorApi
