import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@lib/api-client'

export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface AssistantResponse {
  message: AssistantMessage
  conversationId: string
  sources: Array<{ title: string; category: string }>
}

export function useAssistantChat() {
  return useMutation({
    mutationFn: ({ message, conversationId }: { message: string; conversationId?: string }) =>
      apiClient.post('/ai/assistant', { message, conversationId }) as Promise<AssistantResponse>,
  })
}
