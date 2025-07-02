import { useState } from 'react';
import { api } from '../api';

export interface ChatMessage {
  from: "user" | "bot";
  text: string;
}

const STORAGE_KEY = (uid: number) => `splitwise:user:${uid}:chat`;

export function useChatbot(userId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const json = localStorage.getItem(STORAGE_KEY(userId));
    return json ? JSON.parse(json) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const send = async (text: string) => {
    setError(null);
    setLoading(true);
    const userMsg = { from: "user" as const, text };
    setMessages(m => {
      const next = [...m, userMsg];
      localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(next));
      return next;
    });
    try {
      const res = await api.post<{ answer: string }>("/chat", {
        query: text,
        user_id: userId,
      });
      const botMsg = { from: "bot" as const, text: res.data.answer };
      setMessages(m => {
        const next = [...m, botMsg];
        localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(next));
        return next;
      });
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  return { messages, send, loading, error };
}
