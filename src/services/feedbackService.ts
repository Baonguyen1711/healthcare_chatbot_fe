const API_BASE_URL =
    "https://x99agd36o1.execute-api.us-east-1.amazonaws.com/dev";

// Types
export type FeedbackCategory =
    | "SERVICE_QUALITY"
    | "DOCTOR_EXPERTISE"
    | "FACILITY"
    | "WAIT_TIME"
    | "STAFF_ATTITUDE"
    | "CLEANLINESS"
    | "OTHER";

export type FeedbackStatus = "PENDING" | "REVIEWED" | "RESOLVED";

export interface SubmitFeedbackInput {
    visitDate: string;
    category: FeedbackCategory;
    rating: number;
    comment: string;
    doctorName?: string;
    department?: string;
    isAnonymous: boolean;
    images?: string[];
}

export interface FeedbackResponse {
    feedbackId: string;
    userId: string;
    userName?: string;
    userPhone?: string;
    visitDate: string;
    category: FeedbackCategory;
    rating: number;
    comment: string;
    doctorName?: string;
    department?: string;
    status: FeedbackStatus;
    adminNote?: string;
    createdAt: string;
    images?: string[];
    isAnonymous: boolean;
}

export interface FeedbackStatistics {
    totalFeedbacks: number;
    averageRating: number;
    ratingDistribution: Record<string, number>;
    categoryDistribution: Record<string, number>;
    statusDistribution: Record<string, number>;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
}

export class FeedbackService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = localStorage.getItem("idToken");

        const config: RequestInit = {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        };

        const response = await fetch(url, config);
        const json = await response.json().catch(() => null);

        if (!response.ok) {
            if (json?.error) {
                throw new ApiError(
                    json.error.message || "Có lỗi xảy ra",
                    json.error.code,
                    response.status,
                    json.error.details
                );
            }

            throw new ApiError(
                `HTTP error! status: ${response.status}`,
                "HTTP_ERROR",
                response.status
            );
        }

        if (json?.success === false) {
            throw new ApiError(
                json.error?.message || "API request failed",
                json.error?.code,
                response.status,
                json.error?.details
            );
        }

        return json as T;
    }

    async submitFeedback(
        input: SubmitFeedbackInput
    ): Promise<FeedbackResponse> {
        const response = await this.request<ApiResponse<FeedbackResponse>>(
            "/feedback/submit",
            {
                method: "POST",
                body: JSON.stringify(input),
            }
        );
        return response.data;
    }

    async getUserFeedbacks(): Promise<FeedbackResponse[]> {
        const response = await this.request<
            ApiResponse<{ feedbacks: FeedbackResponse[] }>
        >("/feedback/user");
        return response.data.feedbacks || [];
    }

    async getStatistics(): Promise<FeedbackStatistics> {
        const response = await this.request<ApiResponse<FeedbackStatistics>>(
            "/feedback/statistics"
        );
        return response.data;
    }

    async getAllFeedbacks(filters?: {
        status?: string;
        category?: string;
        minRating?: string;
    }): Promise<FeedbackResponse[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.category) params.append("category", filters.category);
        if (filters?.minRating) params.append("minRating", filters.minRating);

        const response = await this.request<
            ApiResponse<{ feedbacks: FeedbackResponse[] }>
        >(`/feedback/admin/all?${params.toString()}`);
        return response.data.feedbacks || [];
    }

    async updateStatus(
        feedbackId: string,
        status: FeedbackStatus,
        adminNote?: string
    ): Promise<void> {
        await this.request("/feedback/admin/update-status", {
            method: "POST",
            body: JSON.stringify({
                feedbackId,
                status,
                adminNote,
            }),
        });
    }
}

export class ApiError extends Error {
    code?: string;
    status?: number;
    details?: any;

    constructor(
        message: string,
        code?: string,
        status?: number,
        details?: any
    ) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.status = status;
        this.details = details;
    }
}

// Helper constants
export const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
    SERVICE_QUALITY: "Chất lượng dịch vụ",
    DOCTOR_EXPERTISE: "Chuyên môn bác sĩ",
    FACILITY: "Cơ sở vật chất",
    WAIT_TIME: "Thời gian chờ",
    STAFF_ATTITUDE: "Thái độ nhân viên",
    CLEANLINESS: "Vệ sinh",
    OTHER: "Khác",
};

export const STATUS_CONFIG: Record<
    FeedbackStatus,
    { label: string; color: string }
> = {
    PENDING: { label: "Đang xử lý", color: "bg-yellow-100 text-yellow-800" },
    REVIEWED: { label: "Đã xem xét", color: "bg-blue-100 text-blue-800" },
    RESOLVED: { label: "Đã giải quyết", color: "bg-green-100 text-green-800" },
};
