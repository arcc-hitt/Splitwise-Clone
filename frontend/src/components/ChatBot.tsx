import React, { useState } from 'react';
import { Spinner } from './layout/Spinner';
import { useChatbot, type ChatMessage } from '../hooks/useChatbot';

type Props = { userId: number };

export default function Chatbot({ userId }: Props) {
  const { messages, send, loading, error } = useChatbot(userId);
  const [input, setInput] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    send(input.trim());
    setInput("");
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Expense Chatbot</h1>
      <div className="h-80 overflow-y-auto border rounded p-2 space-y-2">
        {messages.map((m: ChatMessage, i) => (
          <div
            key={i}
            className={`p-2 rounded ${m.from === "user"
              ? "bg-blue-100 self-end"
              : "bg-gray-100"
            }`}
          >
            <strong>{m.from === "user" ? "You" : "Bot"}:</strong> {m.text}
          </div>
        ))}
        {loading && <Spinner />}
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <form onSubmit={onSubmit} className="flex space-x-2">
        <input
          className="flex-1 p-2 border rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your expenses..."
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
