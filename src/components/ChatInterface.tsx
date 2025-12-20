import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/useChat";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatInterface = () => {
  const [inputMessage, setInputMessage] = useState("");

  const {
    messages,
    loading: isLoading,
    sendMessage,
    addBotMessage,
  } = useChat();

  useEffect(() => {
    addBotMessage(
      "Xin chào! Tôi là trợ lý chăm sóc sức khỏe thông minh. Tôi có thể giúp bạn đặt lịch hẹn, nhắc uống thuốc, cung cấp thông tin y tế và hỗ trợ các vấn đề sức khỏe. Bạn cần hỗ trợ gì hôm nay?"
    );
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    sendMessage(inputMessage);
    setInputMessage("");
  };

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("đặt lịch") ||
      lowerMessage.includes("hẹn bác sĩ")
    ) {
      return "Tôi sẽ giúp bạn đặt lịch hẹn với bác sĩ. Bạn muốn đặt lịch cho chuyên khoa nào và thời gian nào? Vui lòng cho biết: Chuyên khoa - Ngày mong muốn - Giờ mong muốn.";
    }

    if (
      lowerMessage.includes("uống thuốc") ||
      lowerMessage.includes("nhắc thuốc")
    ) {
      return "Tôi có thể thiết lập lời nhắc uống thuốc cho bạn. Vui lòng cung cấp thông tin: Tên thuốc - Liều lượng - Thời gian uống (sáng/trưa/chiều/tối) - Thời gian bắt đầu.";
    }

    if (lowerMessage.includes("thông tin") || lowerMessage.includes("bệnh")) {
      return "Tôi có thể cung cấp thông tin y tế đáng tin cậy từ WHO, CDC và Bộ Y tế. Bạn muốn tìm hiểu về bệnh gì? Tôi sẽ đưa ra thông tin chính xác và hướng dẫn phù hợp.";
    }

    return "Cảm ơn bạn đã liên hệ. Tôi có thể hỗ trợ bạn đặt lịch hẹn bác sĩ, thiết lập nhắc uống thuốc, cung cấp thông tin y tế, hoặc hướng dẫn quy trình khám chữa bệnh. Bạn cần hỗ trợ gì cụ thể?";
  };

  return (
    <Card className="flex flex-col h-[600px] bg-gradient-soft border-0 shadow-medium">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-gradient-primary text-primary-foreground rounded-t-lg">
        <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
          <Bot size={20} className="text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold">Trợ lý Sức khỏe Thông minh</h3>
          <p className="text-sm text-primary-foreground/80">
            Luôn sẵn sàng hỗ trợ bạn
          </p>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: Message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 max-w-[80%]",
              message.sender === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              )}
            >
              {message.sender === "user" ? (
                <User size={16} />
              ) : (
                <Bot size={16} />
              )}
            </div>

            <div
              className={cn(
                "p-3 rounded-2xl shadow-soft transition-smooth",
                message.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card text-card-foreground rounded-bl-md border"
              )}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <span
                className={cn(
                  "text-xs mt-2 block",
                  message.sender === "user"
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                )}
              >
                {message.timestamp.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-card p-3 rounded-2xl rounded-bl-md border shadow-soft">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-secondary/30">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 border-0 bg-background shadow-soft focus-visible:ring-primary transition-smooth"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-primary hover:bg-primary-dark shadow-soft transition-smooth"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
