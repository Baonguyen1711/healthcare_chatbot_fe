import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLatestBill } from "@/hooks/use-billing";
import { checkBillingQuery, getBillingResponse } from "@/utils/billingChatbot";
import { useChat } from "@/hooks/useChat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { checkQueueQuery, getQueueResponse } from "@/utils/queueChatbot";
import {
  AppointmentContext,
  checkAppointmentQuery,
  getAppointmentResponse,
} from "@/utils/appointmentChatbot";
import urlBase64ToUint8Array from "@/utils/convertToIntArray";
import { ReminderService } from "@/services/reminder";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  billData?: any;
}

/* =========================
   🔍 REMINDER HELPERS
========================= */

const checkReminderQuery = (text: string) => {
  const keywords = [
    "nhắc uống thuốc",
    "nhắc thuốc",
    "uống thuốc",
    "nhắc tôi uống thuốc",
    "remind",
    "reminder",
  ];
  return keywords.some((k) => text.toLowerCase().includes(k));
};

/**
 * ✅ PARSE TIME – FIX SÁNG / TỐI / TIMEZONE
 */
const parseNotifyTimeFromText = (text: string): Date | null => {
  const now = new Date();
  const lower = text.toLowerCase();

  /* sau X phút */
  const afterMatch = lower.match(/sau\s+(\d+)\s*phút/);
  if (afterMatch) {
    const d = new Date(now);
    d.setMinutes(d.getMinutes() + Number(afterMatch[1]));
    return d;
  }

  /* HH:mm | Hh */
  const timeMatch = lower.match(/(\d{1,2})(?:[:h](\d{1,2}))?/);
  if (timeMatch) {
    let hour = Number(timeMatch[1]);
    const minute = timeMatch[2] ? Number(timeMatch[2]) : 0;

    const isPM = /(tối|chiều|đêm|pm)/i.test(lower);
    const isAM = /(sáng|am)/i.test(lower);

    if (isPM && hour < 12) hour += 12;
    if (isAM && hour === 12) hour = 0;

    const d = new Date(now);
    d.setHours(hour, minute, 0, 0);

    // nếu giờ đã qua → ngày mai
    if (d.getTime() <= now.getTime()) {
      d.setDate(d.getDate() + 1);
    }

    return d;
  }

  /* fallback mơ hồ */
  if (lower.includes("tối nay")) {
    const d = new Date(now);
    d.setHours(21, 0, 0, 0);
    return d;
  }

  if (lower.includes("sáng mai")) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(7, 0, 0, 0);
    return d;
  }

  if (lower.includes("ngày mai")) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(8, 0, 0, 0);
    return d;
  }

  return null;
};

const formatLocalISO = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  // VN = GMT+7
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
};

const ChatInterface = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [queueContext, setQueueContext] = useState<any>({});
  const [appointmentContext, setAppointmentContext] = useState<
    AppointmentContext | undefined
  >();

  const [reminderFlow, setReminderFlow] = useState({
    waitingForTime: false,
  });
  const reminderService = new ReminderService();
  const {
    messages,
    loading: isLoading,
    sendMessage,
    addBotMessage,
    addUserMessage,
  } = useChat();

  // Billing hook để lấy thông tin viện phí
  const { bill, loading: billLoading, error: billError } = useLatestBill();

  useEffect(() => {
    addBotMessage(
      `Xin chào! Tôi là trợ lý chăm sóc sức khỏe thông minh. Tôi có thể giúp bạn:

  - Đặt lịch hẹn bác sĩ
  - Nhắc uống thuốc
  - Xem thông tin viện phí
  - Lấy số thứ tự Check-in
  - Kiểm tra trạng thái số thứ tự
  - Cung cấp thông tin y tế

  Bạn cần hỗ trợ gì hôm nay?`
    );
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const createReminder = async (notifyAt: Date) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        addBotMessage("⚠️ Bạn cần cho phép thông báo.");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY
        ),
      });

      await reminderService.createReminder({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode(
              ...new Uint8Array(subscription.getKey("p256dh")!)
            )
          ),
          auth: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))
          ),
        },
        // 🔥 UTC ISO – ĐÚNG
        notifyAt: formatLocalISO(notifyAt),
      });

      addBotMessage(
        `✅ Đã đặt nhắc uống thuốc lúc **${notifyAt.toLocaleString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
        })}**`
      );
    } catch (e) {
      console.error(e);
      addBotMessage("❌ Có lỗi khi đặt nhắc uống thuốc.");
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const trimmedMessage = inputMessage.trim();

    const isBillingQuery = checkBillingQuery(trimmedMessage);
    const isAppointmentQuery = checkAppointmentQuery(trimmedMessage);
    const isQueueQuery = checkQueueQuery(trimmedMessage);

    setInputMessage("");

    if (reminderFlow.waitingForTime) {
      addUserMessage(trimmedMessage);
      const notifyAt = parseNotifyTimeFromText(trimmedMessage);

      if (!notifyAt) {
        addBotMessage("⏰ Ví dụ: *11h32 tối*, *8h sáng*, *sau 15 phút*");
        return;
      }

      await createReminder(notifyAt);
      setReminderFlow({ waitingForTime: false });
      return;
    }

    if (checkReminderQuery(trimmedMessage)) {
      addUserMessage(trimmedMessage);
      const notifyAt = parseNotifyTimeFromText(trimmedMessage);

      if (!notifyAt) {
        addBotMessage("⏰ Bạn muốn tôi nhắc lúc mấy giờ?");
        setReminderFlow({ waitingForTime: true });
        return;
      }

      await createReminder(notifyAt);
      return;
    }

    if (isBillingQuery) {
      addUserMessage(trimmedMessage);
      const billingResponseText = getBillingResponse(
        bill,
        billLoading,
        billError
      );
      addBotMessage(billingResponseText);
      return;
    }

    const isAppointmentFlowActive = appointmentContext?.flow === "collecting";
    const shouldHandleAppointment =
      isAppointmentFlowActive || isAppointmentQuery;

    if (shouldHandleAppointment) {
      addUserMessage(trimmedMessage);
      try {
        const result = await getAppointmentResponse(
          trimmedMessage,
          appointmentContext
        );
        addBotMessage(result.response);
        setAppointmentContext(result.context);
      } catch (error) {
        console.error("Appointment chatbot error", error);
        addBotMessage(
          "Xin lỗi, hiện tôi chưa thể xử lý yêu cầu đặt lịch. Bạn thử lại sau hoặc sử dụng mục Đặt lịch hẹn trên trang chính nhé."
        );
        setAppointmentContext(undefined);
      }
      return;
    }

    const isQueueMode =
      queueContext?.need != null ||
      (queueContext?.flow !== "idle" && isQueueQuery) ||
      (queueContext?.flow === "idle" && isQueueQuery);

    // auto out nếu user không nói queue nữa
    if (
      !isQueueQuery &&
      queueContext?.flow !== "idle" &&
      queueContext?.need == null
    ) {
      setQueueContext({ flow: "idle", need: null });
    }

    if (isQueueMode) {
      addUserMessage(trimmedMessage);
      const result = await getQueueResponse(trimmedMessage, queueContext);
      addBotMessage(result.response);
      setQueueContext(result.context);
      return;
    }

    await sendMessage(trimmedMessage);
  };

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
              {message.sender === "bot" ? (
                <div
                  className="
      text-sm leading-relaxed
      [&_ul]:list-disc
      [&_ul]:pl-5
      [&_li]:my-1
    "
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.text}
                </p>
              )}

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
