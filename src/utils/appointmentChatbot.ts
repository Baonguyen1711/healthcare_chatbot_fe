import { addDays, format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import {
  getHospitals,
  getDepartmentsByHospital,
  getDoctorsByDepartment,
  getDoctorSchedule,
  bookAppointment,
} from "@/services/appointment-service";

interface BaseOption {
  id: string;
  label: string;
  detail?: string;
}

export interface SlotOption extends BaseOption {
  date: string;
  time: string;
}

export type AppointmentNeed =
  | "hospital"
  | "department"
  | "doctor"
  | "slot"
  | "fullName"
  | "phone"
  | "email"
  | "symptoms";

export interface AppointmentContext {
  flow: "idle" | "collecting";
  need: AppointmentNeed | null;
  data: {
    hospitalId?: string;
    hospitalName?: string;
    departmentId?: string;
    departmentName?: string;
    doctorId?: string;
    doctorName?: string;
    date?: string;
    time?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    symptoms?: string;
  };
  hospitalOptions?: BaseOption[];
  departmentOptions?: BaseOption[];
  doctorOptions?: BaseOption[];
  slotOptions?: SlotOption[];
  updatedAt?: number;
}

export interface AppointmentResult {
  response: string;
  context: AppointmentContext;
  done?: boolean;
}

const CONTEXT_TTL_MS = 10 * 60 * 1000;
const SLOT_LOOKAHEAD_DAYS = 5;
const MAX_SLOT_OPTIONS = 10;
const DISPLAY_LIMIT = 6;

const initialContext = (): AppointmentContext => ({
  flow: "idle",
  need: null,
  data: {},
  updatedAt: Date.now(),
});

const ensureContext = (ctx?: AppointmentContext): AppointmentContext => {
  if (!ctx) return initialContext();
  if (ctx.updatedAt && Date.now() - ctx.updatedAt > CONTEXT_TTL_MS) {
    return initialContext();
  }
  return { ...ctx, updatedAt: Date.now() };
};

const isCancelCommand = (message: string) =>
  /^(hủy|huy|thoát|thoat|cancel|stop|exit)$/i.test(message.trim());

const formatOptionList = (options: BaseOption[], limit = DISPLAY_LIMIT) =>
  options
    .slice(0, limit)
    .map(
      (opt, index) =>
        `${index + 1}. ${opt.label}${opt.detail ? ` – ${opt.detail}` : ""}`
    )
    .join("\n");

const resolveChoice = <T extends BaseOption>(
  message: string,
  options: T[]
): T | null => {
  if (!options.length) return null;

  const trimmed = message.trim();
  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric) && numeric >= 1 && numeric <= options.length) {
    return options[numeric - 1];
  }

  const normalized = trimmed.toLowerCase();
  return (
    options.find(
      (opt) =>
        opt.id?.toLowerCase() === normalized ||
        opt.label.toLowerCase() === normalized ||
        opt.label.toLowerCase().includes(normalized)
    ) ?? null
  );
};

const determineNextNeed = (
  context: AppointmentContext
): AppointmentNeed | null => {
  const { data } = context;
  if (!data.hospitalId) return "hospital";
  if (!data.departmentId) return "department";
  if (!data.doctorId) return "doctor";
  if (!data.date || !data.time) return "slot";
  if (!data.fullName) return "fullName";
  if (!data.phone) return "phone";
  if (!data.email) return "email";
  if (data.symptoms === undefined) return "symptoms";
  return null;
};

const fetchHospitalOptions = async (): Promise<BaseOption[]> => {
  const hospitals = await getHospitals();
  return (hospitals ?? []).map((item: any) => ({
    id: String(item.hospitalId ?? item.id ?? item.code ?? item.name ?? ""),
    label: item.name ?? "Bệnh viện",
    detail: item.address ?? "",
  }));
};

const fetchDepartmentOptions = async (
  hospitalId: string
): Promise<BaseOption[]> => {
  const departments = await getDepartmentsByHospital(hospitalId);
  return (departments ?? []).map((item: any) => ({
    id: String(item.departmentId ?? item.id ?? item.name ?? ""),
    label: item.name ?? "Chuyên khoa",
  }));
};

const fetchDoctorOptions = async (
  departmentId: string
): Promise<BaseOption[]> => {
  const doctors = await getDoctorsByDepartment(departmentId);
  return (doctors ?? []).map((item: any) => ({
    id: String(item.doctorId ?? item.id ?? item.name ?? ""),
    label: item.name ?? "Bác sĩ",
  }));
};

const buildSlotOptions = async (doctorId: string): Promise<SlotOption[]> => {
  const slots: SlotOption[] = [];
  const today = new Date();

  for (let offset = 1; offset <= SLOT_LOOKAHEAD_DAYS; offset += 1) {
    const day = addDays(today, offset);
    const dateStr = format(day, "yyyy-MM-dd");

    try {
      const schedule = await getDoctorSchedule(doctorId, dateStr);
      const available: string[] = schedule?.availableSlots ?? [];

      for (const time of available) {
        slots.push({
          id: `${dateStr}_${time}`,
          label: `${format(day, "dd/MM")} • ${time}`,
          detail: undefined,
          date: dateStr,
          time,
        });
        if (slots.length >= MAX_SLOT_OPTIONS) {
          return slots;
        }
      }
    } catch {
      // ignore missing schedules for the day
    }
  }

  return slots;
};

const startAppointmentFlow = async (): Promise<AppointmentResult> => {
  try {
    const hospitalOptions = await fetchHospitalOptions();

    if (!hospitalOptions.length) {
      return {
        response:
          "Hiện chưa tải được danh sách bệnh viện hỗ trợ đặt lịch. Bạn có thể sử dụng mục Đặt lịch tại trang chủ để tiếp tục.",
        context: initialContext(),
      };
    }

    return {
      response: [
        "✨ Tôi sẽ giúp bạn đặt lịch khám trực tuyến.",
        "Đầu tiên, bạn muốn khám tại cơ sở nào? Dưới đây là một vài lựa chọn:",
        formatOptionList(hospitalOptions),
        "",
        '👉 Trả lời bằng số thứ tự hoặc nhập tên bệnh viện. Gõ "hủy" để dừng quy trình bất cứ lúc nào.',
      ].join("\n"),
      context: {
        flow: "collecting",
        need: "hospital",
        data: {},
        hospitalOptions,
        updatedAt: Date.now(),
      },
    };
  } catch {
    return {
      response:
        "Xin lỗi, tôi chưa thể tải danh sách bệnh viện. Bạn thử lại sau hoặc sử dụng mục Đặt lịch hẹn ở trang chủ nhé.",
      context: initialContext(),
    };
  }
};

const handleHospitalAnswer = async (
  message: string,
  context: AppointmentContext
): Promise<AppointmentResult> => {
  const hospitalOptions =
    context.hospitalOptions ?? (await fetchHospitalOptions());

  if (!hospitalOptions.length) {
    return {
      response:
        "Tôi chưa có danh sách bệnh viện để gợi ý. Bạn thử lại sau nhé.",
      context: initialContext(),
    };
  }

  const choice = resolveChoice(message, hospitalOptions);
  if (!choice) {
    return {
      response: [
        "Mã bệnh viện chưa hợp lệ. Bạn chọn lại giúp tôi nhé:",
        formatOptionList(hospitalOptions),
      ].join("\n"),
      context: {
        ...context,
        hospitalOptions,
        need: "hospital",
        updatedAt: Date.now(),
      },
    };
  }

  try {
    const departmentOptions = await fetchDepartmentOptions(choice.id);
    if (!departmentOptions.length) {
      return {
        response: `Hiện ${
          choice.label
        } chưa mở đặt lịch qua chatbot. Bạn có thể chọn cơ sở khác:\n${formatOptionList(
          hospitalOptions
        )}`,
        context: {
          ...context,
          hospitalOptions,
          need: "hospital",
          updatedAt: Date.now(),
        },
      };
    }

    return {
      response: [
        `✅ Đã chọn ${choice.label}.`,
        "Bạn muốn khám ở chuyên khoa nào?",
        formatOptionList(departmentOptions),
        "",
        "👉 Nhập số thứ tự hoặc tên chuyên khoa.",
      ].join("\n"),
      context: {
        ...context,
        data: {
          ...context.data,
          hospitalId: choice.id,
          hospitalName: choice.label,
        },
        hospitalOptions,
        departmentOptions,
        need: "department",
        updatedAt: Date.now(),
      },
    };
  } catch {
    return {
      response:
        "Tôi chưa thể tải danh sách chuyên khoa. Bạn thử lại sau hoặc chọn bệnh viện khác nhé.",
      context: {
        ...context,
        hospitalOptions,
        need: "hospital",
        updatedAt: Date.now(),
      },
    };
  }
};

const handleDepartmentAnswer = async (
  message: string,
  context: AppointmentContext
): Promise<AppointmentResult> => {
  const hospitalId = context.data.hospitalId;
  if (!hospitalId) {
    return startAppointmentFlow();
  }

  const departmentOptions =
    context.departmentOptions ?? (await fetchDepartmentOptions(hospitalId));

  if (!departmentOptions.length) {
    return {
      response:
        "Tôi chưa tìm thấy chuyên khoa phù hợp cho cơ sở này. Bạn chọn lại bệnh viện nhé.",
      context: { ...context, need: "hospital", updatedAt: Date.now() },
    };
  }

  const choice = resolveChoice(message, departmentOptions);
  if (!choice) {
    return {
      response: [
        "Tên chuyên khoa chưa đúng. Bạn chọn theo danh sách sau nhé:",
        formatOptionList(departmentOptions),
      ].join("\n"),
      context: {
        ...context,
        departmentOptions,
        need: "department",
        updatedAt: Date.now(),
      },
    };
  }

  try {
    const doctorOptions = await fetchDoctorOptions(choice.id);
    if (!doctorOptions.length) {
      return {
        response: `Khoa ${
          choice.label
        } chưa có bác sĩ khả dụng. Bạn có thể chọn khoa khác:\n${formatOptionList(
          departmentOptions
        )}`,
        context: {
          ...context,
          departmentOptions,
          need: "department",
          updatedAt: Date.now(),
        },
      };
    }

    return {
      response: [
        `👍 Đã chọn khoa ${choice.label}.`,
        "Bạn muốn đặt bác sĩ nào?",
        formatOptionList(doctorOptions),
        "",
        "👉 Nhập số thứ tự hoặc tên bác sĩ.",
      ].join("\n"),
      context: {
        ...context,
        data: {
          ...context.data,
          departmentId: choice.id,
          departmentName: choice.label,
        },
        doctorOptions,
        need: "doctor",
        updatedAt: Date.now(),
      },
    };
  } catch {
    return {
      response: "Tôi chưa thể tải danh sách bác sĩ. Bạn thử lại sau nhé.",
      context: {
        ...context,
        departmentOptions,
        need: "department",
        updatedAt: Date.now(),
      },
    };
  }
};

const handleDoctorAnswer = async (
  message: string,
  context: AppointmentContext
): Promise<AppointmentResult> => {
  const departmentId = context.data.departmentId;
  if (!departmentId) {
    return startAppointmentFlow();
  }

  const doctorOptions =
    context.doctorOptions ?? (await fetchDoctorOptions(departmentId));

  if (!doctorOptions.length) {
    return {
      response:
        "Chưa có bác sĩ khả dụng ở khoa này. Bạn chọn lại chuyên khoa nhé.",
      context: { ...context, need: "department", updatedAt: Date.now() },
    };
  }

  const choice = resolveChoice(message, doctorOptions);
  if (!choice) {
    return {
      response: [
        "Tên bác sĩ chưa chính xác. Bạn chọn theo danh sách nhé:",
        formatOptionList(doctorOptions),
      ].join("\n"),
      context: {
        ...context,
        doctorOptions,
        need: "doctor",
        updatedAt: Date.now(),
      },
    };
  }

  const slotOptions = await buildSlotOptions(choice.id);
  if (!slotOptions.length) {
    return {
      response:
        "Bác sĩ này chưa mở lịch trong vài ngày tới. Bạn có muốn chọn bác sĩ khác không?",
      context: {
        ...context,
        doctorOptions,
        need: "doctor",
        updatedAt: Date.now(),
      },
    };
  }

  return {
    response: [
      `🩺 Bạn đã chọn bác sĩ ${choice.label}.`,
      "Các khung giờ còn trống trong vài ngày tới:",
      formatOptionList(slotOptions),
      "",
      "👉 Nhập số thứ tự để chọn khung giờ.",
    ].join("\n"),
    context: {
      ...context,
      data: {
        ...context.data,
        doctorId: choice.id,
        doctorName: choice.label,
      },
      slotOptions,
      need: "slot",
      updatedAt: Date.now(),
    },
  };
};

const handleSlotAnswer = (
  message: string,
  context: AppointmentContext
): AppointmentResult => {
  const slotOptions = context.slotOptions ?? [];
  if (!slotOptions.length) {
    return {
      response: "Hiện chưa có khung giờ nào khả dụng. Bạn chọn lại bác sĩ nhé.",
      context: { ...context, need: "doctor", updatedAt: Date.now() },
    };
  }

  const choice = resolveChoice(message, slotOptions);
  if (!choice) {
    return {
      response: [
        "Mã khung giờ chưa hợp lệ. Bạn chọn lại theo danh sách nhé:",
        formatOptionList(slotOptions),
      ].join("\n"),
      context: { ...context, slotOptions, need: "slot", updatedAt: Date.now() },
    };
  }

  return {
    response: [
      `🗓️ Đã chọn ${choice.label}.`,
      "Vui lòng cho tôi biết họ tên đầy đủ của bệnh nhân?",
    ].join("\n"),
    context: {
      ...context,
      data: {
        ...context.data,
        date: choice.date,
        time: choice.time,
      },
      need: "fullName",
      updatedAt: Date.now(),
    },
  };
};

const handleFullNameAnswer = (
  message: string,
  context: AppointmentContext
): AppointmentResult => {
  const name = message.trim();
  if (name.length < 3) {
    return {
      response: "Họ tên cần ít nhất 3 ký tự. Bạn nhập lại giúp tôi nhé.",
      context: { ...context, need: "fullName", updatedAt: Date.now() },
    };
  }

  return {
    response: "📞 Số điện thoại của bạn là gì? (10-11 số)",
    context: {
      ...context,
      data: {
        ...context.data,
        fullName: name,
      },
      need: "phone",
      updatedAt: Date.now(),
    },
  };
};

const handlePhoneAnswer = (
  message: string,
  context: AppointmentContext
): AppointmentResult => {
  const digits = message.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 11) {
    return {
      response: "Số điện thoại chưa đúng. Bạn nhập lại 10-11 số nhé.",
      context: { ...context, need: "phone", updatedAt: Date.now() },
    };
  }

  return {
    response: "✉️ Email để chúng tôi gửi xác nhận?",
    context: {
      ...context,
      data: {
        ...context.data,
        phone: digits,
      },
      need: "email",
      updatedAt: Date.now(),
    },
  };
};

const handleEmailAnswer = (
  message: string,
  context: AppointmentContext
): AppointmentResult => {
  const email = message.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      response: "Email chưa đúng định dạng. Bạn nhập lại giúp tôi nhé.",
      context: { ...context, need: "email", updatedAt: Date.now() },
    };
  }

  return {
    response:
      'Bạn có thể mô tả ngắn gọn triệu chứng chính (hoặc nhập "bỏ qua" nếu chưa sẵn sàng chia sẻ)?',
    context: {
      ...context,
      data: {
        ...context.data,
        email,
      },
      need: "symptoms",
      updatedAt: Date.now(),
    },
  };
};

const finalizeBooking = async (
  symptoms: string,
  context: AppointmentContext
): Promise<AppointmentResult> => {
  const data = { ...context.data, symptoms };

  const required = [
    "hospitalId",
    "departmentId",
    "doctorId",
    "date",
    "time",
    "fullName",
    "phone",
    "email",
  ] as const;

  const missing = required.filter((field) => !data[field]);
  if (missing.length) {
    return {
      response:
        'Tôi thiếu một vài thông tin để đặt lịch. Bạn thử bắt đầu lại bằng cách nhắn "đặt lịch" nhé.',
      context: initialContext(),
    };
  }

  const payload = {
    appointmentId: `APPT-${uuidv4()}`,
    patientName: data.fullName!,
    phone: data.phone!,
    email: data.email!,
    hospitalId: data.hospitalId!,
    departmentId: data.departmentId!,
    doctorId: data.doctorId!,
    date: data.date!,
    time: data.time!,
    symptoms: data.symptoms ?? "",
  };

  try {
    const result = await bookAppointment(payload);
    const appointmentCode = result?.appointmentId ?? payload.appointmentId;
    const humanDate = format(
      new Date(`${payload.date}T00:00:00`),
      "dd/MM/yyyy"
    );

    return {
      response: [
        "🎉 Lịch hẹn của bạn đã được tạo thành công!",
        `• Bệnh viện: ${data.hospitalName}`,
        `• Khoa: ${data.departmentName}`,
        `• Bác sĩ: ${data.doctorName}`,
        `• Thời gian: ${humanDate} lúc ${payload.time}`,
        `• Mã lịch hẹn: ${appointmentCode}`,
        "",
        'Chúng tôi sẽ gửi xác nhận qua email/SMS trong ít phút. Nếu cần chỉnh sửa, bạn có thể nhắn "đặt lịch" để tạo lịch mới hoặc truy cập mục Đặt lịch hẹn trên trang chủ.',
      ].join("\n"),
      context: initialContext(),
      done: true,
    };
  } catch (error) {
    console.error("Book appointment error", error);
    return {
      response:
        "Xin lỗi, tôi chưa thể tạo lịch hẹn lúc này. Bạn kiểm tra lại kết nối hoặc thử đặt trực tiếp ở mục Đặt lịch hẹn nhé.",
      context: { ...context, data, need: "symptoms", updatedAt: Date.now() },
    };
  }
};

const handleSymptomsAnswer = async (
  message: string,
  context: AppointmentContext
): Promise<AppointmentResult> => {
  const normalized = message.trim().toLowerCase();
  const symptoms =
    !normalized ||
    normalized === "bỏ qua" ||
    normalized === "bo qua" ||
    normalized === "không" ||
    normalized === "khong"
      ? ""
      : message.trim();

  return finalizeBooking(symptoms, context);
};

export const checkAppointmentQuery = (message: string): boolean => {
  const normalized = message.toLowerCase();
  const keywords = [
    "đặt lịch",
    "dat lich",
    "lịch hẹn",
    "lich hen",
    "lịch khám",
    "lich kham",
    "đăng ký khám",
    "dang ky kham",
    "booking",
    "appointment",
    "hẹn bác sĩ",
    "hen bac si",
    "đặt lịch bác sĩ",
    "dat lich bac si",
  ];

  return keywords.some((keyword) => normalized.includes(keyword));
};

export const getAppointmentResponse = async (
  message: string,
  ctx?: AppointmentContext
): Promise<AppointmentResult> => {
  const context = ensureContext(ctx);

  if (isCancelCommand(message)) {
    return {
      response:
        'Đã dừng quy trình đặt lịch. Khi cần đặt lại bạn cứ nhắn "đặt lịch" nhé.',
      context: initialContext(),
      done: true,
    };
  }

  if (context.flow === "idle") {
    return startAppointmentFlow();
  }

  const activeNeed = context.need ?? determineNextNeed(context);

  switch (activeNeed) {
    case "hospital":
      return handleHospitalAnswer(message, context);
    case "department":
      return handleDepartmentAnswer(message, context);
    case "doctor":
      return handleDoctorAnswer(message, context);
    case "slot":
      return handleSlotAnswer(message, context);
    case "fullName":
      return handleFullNameAnswer(message, context);
    case "phone":
      return handlePhoneAnswer(message, context);
    case "email":
      return handleEmailAnswer(message, context);
    case "symptoms":
      return handleSymptomsAnswer(message, context);
    default:
      return startAppointmentFlow();
  }
};
