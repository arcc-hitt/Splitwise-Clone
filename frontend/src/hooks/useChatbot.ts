import { useState } from 'react';
import { api } from '../api';

export interface ChatMessage {
  from: "user" | "bot";
  text: string;
}

export function useChatbot(userId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const send = async (text: string) => {
    setError(null);
    setLoading(true);
    // append user message
    setMessages((m) => [...m, { from: "user", text }]);
    try {
      const res = await api.post<{ answer: string }>("/chat", {
        query: text,
        user_id: userId,
      });
      setMessages((m) => [...m, { from: "bot", text: res.data.answer }]);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  return { messages, send, loading, error };
}
