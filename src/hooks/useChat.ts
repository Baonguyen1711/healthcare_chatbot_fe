import { useState } from "react";
import { ApiService, ChatResponse } from "../services/chatService";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const apiService = new ApiService();

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addBotMessage = (text: string) => {
    const botMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
  };

  const addUserMessage = (text: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await apiService.sendChatMessage({
        message: text,
        conversationId,
      });

      setConversationId(response.conversationId);

      addBotMessage(response.answer);
    } catch (err: any) {
      addBotMessage(err.message || "Không thể gửi câu hỏi");
      setError(err.message || "Không thể gửi câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    addBotMessage,
    addUserMessage,
  };
};
