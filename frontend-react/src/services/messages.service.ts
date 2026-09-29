import api from '@/lib/api';
import type { Message, Conversation, ChatUser } from '@/types';

interface ApiRes<T> {
  success: boolean;
  data: T;
}

export const messagesService = {
  conversations: () =>
    api.get<ApiRes<Conversation[]>>('/messages/conversations').then((r) => r.data.data),

  history: (userId: string) =>
    api.get<ApiRes<Message[]>>(`/messages/${userId}`).then((r) => r.data.data),

  searchUsers: (q: string) =>
    api
      .get<ApiRes<ChatUser[]>>(`/messages/users/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.data.data),

  deleteMessage: (messageId: string) =>
    api.delete(`/messages/message/${messageId}`).then((r) => r.data),

  clearConversation: (userId: string) =>
    api.delete(`/messages/${userId}`).then((r) => r.data),
};