import { createContext, useContext, useState, ReactNode } from "react";
import { ApiService } from "@/services/chatService";

export interface ChatMessage {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

interface ChatContextType {
    messages: ChatMessage[];
    loading: boolean;
    error: string | null;
    sendMessage: (text: string) => Promise<void>;
    addBotMessage: (text: string) => void;
    addUserMessage: (text: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

const apiService = new ApiService();

/* ======================
   PROVIDER (ẨN)
====================== */
export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversationId, setConversationId] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const normalizeMarkdown = (text: string) => {
        return text
            .split("\n")
            .map((line) => line.trimStart()) // ❗ bỏ space đầu dòng
            .join("\n");
    };

    const addBotMessage = (text: string) => {
        const formattedText = normalizeMarkdown(text);
        setMessages((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                text: formattedText,
                sender: "bot",
                timestamp: new Date(),
            },
        ]);
    };

    const addUserMessage = (text: string) => {
        setMessages((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                text,
                sender: "user",
                timestamp: new Date(),
            },
        ]);
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        setLoading(true);
        setError(null);

        addUserMessage(text);

        try {
            const res = await apiService.sendChatMessage({
                message: text,
                conversationId,
            });

            /** 🔥 JSON → CONTEXT */
            setConversationId(res.conversationId);
            addBotMessage(res.answer);
        } catch (err: any) {
            const msg = err.message || "Không thể gửi câu hỏi";
            setError(msg);
            addBotMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ChatContext.Provider
            value={{
                messages,
                loading,
                error,
                sendMessage,
                addBotMessage,
                addUserMessage,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

/* ======================
   HOOK PUBLIC
====================== */
export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within ChatProvider");
    }
    return context;
};
