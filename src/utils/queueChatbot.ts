// utils/queueChatbot.ts
import { QueueService } from "@/services/queueService";
import type {
    QueueType,
    CheckInInput,
    StatusQueryInput,
    ReissueTicketInput,
    TicketResponse,
} from "@/services/queueService";

// =========================
// Types
// =========================
export type QueueFlow = "idle" | "checkin" | "status" | "reissue";
export type QueueNeed =
    | "fullName"
    | "phoneNumber"
    | "nationalId"
    | "queueType"
    | null;

export type QueueContext = {
    flow: QueueFlow;
    need: QueueNeed;
    lastIntent?: Exclude<QueueFlow, "idle">;

    // patient identity
    fullName?: string;
    phoneNumber?: string;
    nationalId?: string;

    // queue
    queueType?: QueueType;
    ticketCode?: string;

    updatedAt?: number;
};

type QueueResult = {
    response: string;
    context: QueueContext;
    done?: boolean;
};

// =========================
// Service
// =========================
const queueService = new QueueService();

// =========================
// Helpers: query detect
// =========================
export const checkQueueQuery = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();

    const queueKeywords = [
        "check in",
        "checkin",
        "lấy số",
        "lay so",
        "cấp số",
        "cap so",
        "số thứ tự",
        "so thu tu",
        "trạng thái",
        "trang thai",
        "hàng đợi",
        "hang doi",
        "đợi bao lâu",
        "doi bao lau",
        "còn bao nhiêu",
        "con bao nhieu",
        "bao nhiêu số",
        "bao nhieu so",
        "mấy số",
        "may so",
        "tới lượt",
        "toi luot",
        "đến lượt",
        "den luot",
        "cấp lại",
        "cap lai",
        "bhyt",
        "bảo hiểm",
        "bao hiem",
        "dịch vụ",
        "dich vu",
        "dv",
        "hủy",
        "huy",
        "reset",
        "làm lại",
        "lam lai",
    ];

    return queueKeywords.some((k) => lowerMessage.includes(k));
};

type QueryType = "checkin" | "status" | "reissue" | "general";

export const getQueueQueryType = (message: string): QueryType => {
    const lower = message.toLowerCase();
    const trimmed = lower.trim();

    if (/^(hủy|huy|reset|làm lại|lam lai)\b/i.test(trimmed)) return "general";

    // checkin intent
    if (
        lower.includes("check in") ||
        lower.includes("checkin") ||
        lower.includes("lấy số") ||
        lower.includes("lay so") ||
        lower.includes("cấp số") ||
        lower.includes("cap so")
    ) {
        return "checkin";
    }

    // status intent (bổ sung nhiều case thực tế)
    if (
        lower.includes("trạng thái") ||
        lower.includes("trang thai") ||
        lower.includes("đợi bao lâu") ||
        lower.includes("doi bao lau") ||
        lower.includes("còn bao nhiêu") ||
        lower.includes("con bao nhieu") ||
        lower.includes("bao nhiêu số") ||
        lower.includes("bao nhieu so") ||
        lower.includes("mấy số") ||
        lower.includes("may so") ||
        lower.includes("tới lượt") ||
        lower.includes("toi luot") ||
        lower.includes("đến lượt") ||
        lower.includes("den luot") ||
        lower.includes("số của tôi") ||
        lower.includes("so cua toi") ||
        lower.includes("đến đâu") ||
        lower.includes("den dau")
    ) {
        return "status";
    }

    // reissue intent
    if (
        lower.includes("cấp lại") ||
        lower.includes("cap lai") ||
        lower.includes("làm lại") ||
        lower.includes("lam lai") ||
        lower.includes("mất số") ||
        lower.includes("mat so")
    ) {
        return "reissue";
    }

    return "general";
};

// =========================
// Strong intent detectors (message override context)
// =========================
const isStrongCheckin = (message: string) => {
    const s = message.toLowerCase();
    return (
        s.includes("check in") ||
        s.includes("checkin") ||
        s.includes("lấy số") ||
        s.includes("lay so") ||
        s.includes("cấp số") ||
        s.includes("cap so")
    );
};

const isStrongStatus = (message: string) => {
    const s = message.toLowerCase();
    return (
        s.includes("trạng thái") ||
        s.includes("trang thai") ||
        s.includes("đợi bao lâu") ||
        s.includes("doi bao lau") ||
        s.includes("còn bao nhiêu") ||
        s.includes("con bao nhieu") ||
        s.includes("bao nhiêu số") ||
        s.includes("bao nhieu so") ||
        s.includes("mấy số") ||
        s.includes("may so") ||
        s.includes("tới lượt") ||
        s.includes("toi luot") ||
        s.includes("đến lượt") ||
        s.includes("den luot") ||
        s.includes("đến đâu") ||
        s.includes("den dau") ||
        s.includes("số của tôi") ||
        s.includes("so cua toi")
    );
};

const isStrongReissue = (message: string) => {
    const s = message.toLowerCase();
    return (
        s.includes("cấp lại") ||
        s.includes("cap lai") ||
        s.includes("làm lại số") ||
        s.includes("lam lai so") ||
        s.includes("mất số") ||
        s.includes("mat so")
    );
};

// =========================
// Extractors
// =========================
const normalizeSpaces = (s: string) => s.replace(/\s+/g, " ").trim();

const extractFullName = (message: string): string | null => {
    const patterns = [
        /(?:tên|ten|họ tên|ho ten|tôi là|toi la|mình là|minh la)[\s:]+([a-zA-ZÀ-ỹ\s]+)/i,
    ];
    for (const p of patterns) {
        const m = message.match(p);
        if (m?.[1]) return normalizeSpaces(m[1]);
    }

    // fallback: nếu là 2-5 từ chữ cái, coi là tên (khi bot đang hỏi họ tên)
    const raw = normalizeSpaces(message);
    if (/^[A-Za-zÀ-ỹ]+(?:\s+[A-Za-zÀ-ỹ]+){1,4}$/.test(raw)) return raw;

    return null;
};

const extractPhoneNumber = (message: string): string | null => {
    const patterns = [
        /(?:số điện thoại|so dien thoai|sdt|phone)[\s:]*([0-9]{10,11})/i,
        /\b([0-9]{10,11})\b/,
    ];
    for (const p of patterns) {
        const m = message.match(p);
        if (m?.[1] && m[1].length >= 10) return m[1];
    }
    return null;
};

const extractNationalId = (message: string): string | null => {
    const patterns = [
        /(?:cmnd|cccd|căn cước|can cuoc)[\s:]*([0-9]{9,12})/i,
        /\b([0-9]{12}|[0-9]{9})\b/,
    ];
    for (const p of patterns) {
        const m = message.match(p);
        if (!m?.[1]) continue;
        if (m[1].length === 9 || m[1].length === 12) return m[1];
    }
    return null;
};

const extractQueueType = (message: string): QueueType | null => {
    const lower = message.toLowerCase();

    // BHYT
    if (
        /\bbhyt\b/.test(lower) ||
        lower.includes("bảo hiểm") ||
        lower.includes("bao hiem")
    ) {
        return "BHYT";
    }

    // DV
    if (
        lower.includes("dịch vụ") ||
        lower.includes("dich vu") ||
        /\bdv\b/.test(lower)
    ) {
        return "DV";
    }

    return null;
};

// =========================
// Ticket formatter
// =========================
const formatTicketResponse = (ticket: TicketResponse): string => {
    const statusText =
        (
            {
                WAITING: "🟡 Đang chờ",
                CALLING: "🟢 Đang gọi",
                DONE: "✅ Đã hoàn thành",
                CANCELLED: "❌ Đã hủy",
                MISSED: "⚠️ Đã bỏ lỡ",
            } as const
        )[ticket.ticketStatus] ?? ticket.ticketStatus;

    const queueTypeText = ticket.queueType === "BHYT" ? "BHYT" : "Dịch vụ";

    return `📋 **Thông tin số của bạn:**

- Mã số: **${ticket.ticketCode}**
- Số thứ tự: **${ticket.ticketNumber}**
- Loại: **${queueTypeText}**
- Trạng thái: **${statusText}**
- Ngày khám: **${new Date(ticket.visitDate).toLocaleDateString("vi-VN")}**

📊 **Tình trạng hàng đợi:**
- Số đang gọi: **${ticket.currentNumber}**
- Số người chờ trước: **${ticket.waitingBefore}**
- Thời gian chờ dự kiến: **${ticket.estimatedWaitMinutes} phút**

👤 **Thông tin bệnh nhân:**
- Họ tên: ${ticket.patientInfo.fullName}
- SĐT: ${ticket.patientInfo.phoneNumber}${
        ticket.patientInfo.nationalId
            ? `\n- CMND/CCCD: ${ticket.patientInfo.nationalId}`
            : ""
    }

🕐 Đã cấp lúc: ${new Date(ticket.issuedAt).toLocaleTimeString("vi-VN")}`;
};

// =========================
// Context utilities
// =========================
const now = () => Date.now();
const CONTEXT_TTL_MS = 10 * 60 * 1000; // 10 phút

const ensureContext = (ctx?: any): QueueContext => {
    const base: QueueContext = {
        flow: "idle",
        need: null,
    };

    if (!ctx || typeof ctx !== "object") return { ...base, updatedAt: now() };

    const merged: QueueContext = { ...base, ...ctx };

    const last = merged.updatedAt ?? 0;
    if (last && now() - last > CONTEXT_TTL_MS) {
        return {
            flow: "idle",
            need: null,
            ticketCode: merged.ticketCode,
            queueType: merged.queueType,
            updatedAt: now(),
        };
    }

    return { ...merged, updatedAt: now() };
};

const isResetCommand = (message: string) =>
    /^(hủy|huy|reset|làm lại|lam lai)\b/i.test(message.trim());

// Khi bot đang hỏi field nào đó, user trả lời, mình apply luôn vào context
const applyUserAnswerToNeed = (
    message: string,
    context: QueueContext
): QueueContext => {
    if (!context.need) return context;

    const need = context.need;

    if (need === "phoneNumber") {
        const phoneNumber = extractPhoneNumber(message);
        return phoneNumber ? { ...context, phoneNumber, need: null } : context;
    }

    if (need === "nationalId") {
        const nationalId = extractNationalId(message);
        return nationalId ? { ...context, nationalId, need: null } : context;
    }

    if (need === "queueType") {
        const queueType = extractQueueType(message);
        return queueType ? { ...context, queueType, need: null } : context;
    }

    return context;
};

// normalize result from handlers to QueueResult
const wrap = (
    flow: QueueFlow,
    r: {
        response: string;
        needsInput?: QueueNeed;
        context?: Partial<QueueContext>;
    },
    base: QueueContext,
    opts?: { exitToIdleOnSuccess?: boolean }
): QueueResult => {
    const next: QueueContext = {
        ...base,
        ...r.context,
        flow,
        lastIntent: flow === "idle" ? base.lastIntent : (flow as any),
        need: r.needsInput ?? null,
        updatedAt: now(),
    };

    // Nếu checkin thành công (không cần input nữa) thì thoát flow nhưng vẫn giữ ticketCode/queueType
    if (opts?.exitToIdleOnSuccess && flow === "checkin" && !next.need) {
        return {
            response: r.response,
            context: { ...next, flow: "idle" },
            done: true,
        };
    }

    return {
        response: r.response,
        context: next,
        done: !next.need && flow !== "checkin",
    };
};

// =========================
// Handlers
// =========================
const askPhone = () => ({
    response: `📱 **Vui lòng cung cấp số điện thoại của bạn.**

Ví dụ: "Số điện thoại 0912345678"`,
    needsInput: "phoneNumber" as const,
});

const askNationalId = () => ({
    response: `🆔 **Vui lòng cung cấp số CMND/CCCD của bạn.**

Ví dụ: "CCCD 001234567890"`,
    needsInput: "nationalId" as const,
});

const askQueueTypeForCheckin = () => ({
    response: `🎫 **Bạn muốn lấy số loại nào?**

1️⃣ **BHYT** - Khám theo bảo hiểm y tế  
2️⃣ **Dịch vụ** - Khám dịch vụ  

Vui lòng chọn: "BHYT" hoặc "Dịch vụ"`,
    needsInput: "queueType" as const,
});

const askQueueTypeForStatus = () => ({
    response: `🎫 **Bạn muốn xem trạng thái số loại nào?**

- **BHYT** - Bảo hiểm y tế  
- **Dịch vụ** - Dịch vụ  

Vui lòng chọn: "BHYT" hoặc "Dịch vụ"`,
    needsInput: "queueType" as const,
});

const askQueueTypeForReissue = () => ({
    response: `🔄 **Bạn muốn cấp lại số loại nào?**

- **BHYT** - Bảo hiểm y tế  
- **Dịch vụ** - Dịch vụ  

Vui lòng chọn: "BHYT" hoặc "Dịch vụ"`,
    needsInput: "queueType" as const,
});

export const handleCheckIn = async (message: string, context: QueueContext) => {
    const fullName = localStorage.getItem("userName");
    const phoneNumber = extractPhoneNumber(message) || context.phoneNumber;
    const nationalId = extractNationalId(message) || context.nationalId;
    const queueType = extractQueueType(message) || context.queueType;

    const newContext: Partial<QueueContext> = {
        fullName,
        phoneNumber,
        nationalId,
        queueType,
    };

    if (!phoneNumber) return { ...askPhone(), context: newContext };
    if (!nationalId) return { ...askNationalId(), context: newContext };
    if (!queueType) return { ...askQueueTypeForCheckin(), context: newContext };

    try {
        const checkInData: CheckInInput = {
            fullName,
            phoneNumber,
            nationalId,
            queueType,
        };
        const ticket = await queueService.checkIn(checkInData);

        return {
            response: `✅ **Check-in thành công!**

${formatTicketResponse(ticket)}

Bạn có thể hỏi "trạng thái số của tôi" bất cứ lúc nào!`,
            context: {
                ...newContext,
                ticketCode: ticket.ticketCode,
                queueType: ticket.queueType,
            },
        };
    } catch (error: any) {
        return {
            response: `❌ **Không thể check-in**

${error?.message || "Vui lòng thử lại sau hoặc liên hệ quầy tiếp nhận."}`,
            context: newContext,
        };
    }
};

export const handleQueueStatus = async (
    message: string,
    context: QueueContext
) => {
    const queueType = extractQueueType(message) || context.queueType;
    const newContext: Partial<QueueContext> = { queueType };

    if (!queueType) return { ...askQueueTypeForStatus(), context: newContext };

    try {
        // NOTE: Giữ nguyên theo backend hiện tại của bạn (chỉ queueType).
        // Nếu backend support ticketCode, ưu tiên ticketCode sẽ đúng "số của tôi" hơn.
        const queryData: StatusQueryInput = { queueType };

        const ticket = await queueService.getStatus(queryData);

        return {
            response: formatTicketResponse(ticket),
            context: {
                ...newContext,
                ticketCode: ticket.ticketCode ?? context.ticketCode,
            },
        };
    } catch (error: any) {
        return {
            response: `❌ **Không thể lấy thông tin trạng thái**

${error?.message || "Bạn đã check-in chưa? Vui lòng thử lại."}`,
            context: newContext,
        };
    }
};

export const handleReissue = async (message: string, context: QueueContext) => {
    const queueType = extractQueueType(message) || context.queueType;
    const newContext: Partial<QueueContext> = { queueType };

    if (!queueType) return { ...askQueueTypeForReissue(), context: newContext };

    try {
        const reissueData: ReissueTicketInput = { queueType };
        const ticket = await queueService.reissueTicket(reissueData);

        return {
            response: `✅ **Cấp lại số thành công!**

${formatTicketResponse(ticket)}

Vui lòng chú ý gọi số lần này nhé!`,
            context: {
                ...newContext,
                ticketCode: ticket.ticketCode,
            },
        };
    } catch (error: any) {
        return {
            response: `❌ **Không thể cấp lại số**

${error?.message || "Vui lòng liên hệ quầy tiếp nhận."}`,
            context: newContext,
        };
    }
};

// =========================
// Main router
// =========================
export const getQueueResponse = async (
    message: string,
    ctx?: any
): Promise<QueueResult> => {
    let context = ensureContext(ctx);

    // reset / cancel
    if (isResetCommand(message)) {
        return {
            response:
                "✅ Đã hủy quy trình hàng đợi. Bạn muốn **check-in** hay **xem trạng thái**?",
            context: { flow: "idle", need: null, updatedAt: now() },
            done: true,
        };
    }

    // 1) Nếu đang hỏi dở, ưu tiên apply câu trả lời vào field đang thiếu
    if (context.need) {
        const updated = applyUserAnswerToNeed(message, context);

        // Nếu user trả lời không khớp (vd need phone nhưng họ gõ chữ), nhắc lại đúng format
        if (updated.need === context.need) {
            if (context.need === "phoneNumber") {
                return wrap(
                    context.flow === "idle" ? "checkin" : context.flow,
                    {
                        response: `📱 Mình chưa thấy **số điện thoại** hợp lệ (10-11 số).  
Bạn gửi lại giúp mình nhé. Ví dụ: **0912345678**`,
                        needsInput: "phoneNumber",
                    },
                    context
                );
            }

            if (context.need === "nationalId") {
                return wrap(
                    context.flow === "idle" ? "checkin" : context.flow,
                    {
                        response: `🆔 Mình chưa thấy **CMND/CCCD** hợp lệ (9 hoặc 12 số).  
Bạn gửi lại giúp mình nhé. Ví dụ: **001234567890**`,
                        needsInput: "nationalId",
                    },
                    context
                );
            }

            if (context.need === "queueType") {
                return wrap(
                    context.flow === "idle" ? "checkin" : context.flow,
                    {
                        response: `🎫 Bạn chọn giúp mình: **BHYT** hoặc **Dịch vụ**`,
                        needsInput: "queueType",
                    },
                    context
                );
            }

            return wrap(
                context.flow === "idle" ? "checkin" : context.flow,
                askPhone(),
                context
            );
        }

        context = updated;
    }

    // 2) Xác định intent: MESSAGE OVERRIDE CONTEXT
    const intentFromMsg = getQueueQueryType(message);

    let forced: QueueFlow | null = null;
    if (isStrongStatus(message)) forced = "status";
    else if (isStrongCheckin(message)) forced = "checkin";
    else if (isStrongReissue(message)) forced = "reissue";

    let intent: QueueFlow | "general";

    if (forced) {
        intent = forced;
        // optional: nếu user đổi intent rõ ràng thì bỏ "need" cũ để khỏi bị kẹt
        // context.need = null;
        context.flow = forced;
    } else {
        // fallback: nếu đang flow thì tiếp tục, không thì theo message
        intent =
            context.flow !== "idle" ? context.flow : (intentFromMsg as any);
    }

    // Nếu user chỉ trả lời "BHYT/DV" mà không keyword, suy theo lastIntent
    if (
        (intent === "general" || intent === "idle") &&
        extractQueueType(message) &&
        context.lastIntent
    ) {
        intent = context.lastIntent;
    }

    // 3) Route
    if (intent === "checkin") {
        const r = await handleCheckIn(message, context);
        return wrap("checkin", r as any, context, {
            exitToIdleOnSuccess: true,
        });
    }

    if (intent === "status") {
        const r = await handleQueueStatus(message, context);
        return wrap("status", r as any, context);
    }

    if (intent === "reissue") {
        const r = await handleReissue(message, context);
        return wrap("reissue", r as any, context);
    }

    // 4) General help
    return {
        response: `🎫 **Dịch vụ Hàng đợi Thông minh**

Mình có thể giúp bạn:

1️⃣ **Check-in & Lấy số**
   💬 "Tôi muốn lấy số BHYT, tên Nguyễn Văn A, SĐT 0912345678, CCCD 001234567890"

2️⃣ **Xem trạng thái**
   💬 "Còn bao nhiêu số nữa tới lượt tôi?" / "Số BHYT của tôi đến đâu rồi?"

3️⃣ **Cấp lại số**
   💬 "Cấp lại số dịch vụ cho tôi"

🧹 **Hủy quy trình**
   💬 "Hủy" / "Reset"

Bạn muốn làm gì?`,
        context: { ...context, flow: "idle", need: null, updatedAt: now() },
        done: true,
    };
};
