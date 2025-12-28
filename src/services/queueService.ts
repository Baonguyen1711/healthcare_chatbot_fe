const API_BASE_URL =
    "https://e6q8bbkgy0.execute-api.us-east-1.amazonaws.com/dev";

// Types
export type QueueType = "BHYT" | "DV";
export type TicketStatus =
    | "WAITING"
    | "CALLING"
    | "DONE"
    | "CANCELLED"
    | "MISSED";

export interface CheckInInput {
    fullName: string;
    phoneNumber: string;
    nationalId?: string;
    queueType: QueueType;
    visitDate?: string;
}

export interface StatusQueryInput {
    queueType: QueueType;
    visitDate?: string;
}

export interface ReissueTicketInput {
    queueType: QueueType;
    visitDate?: string;
}

export interface TicketResponse {
    ticketCode: string;
    ticketNumber: number;
    queueType: QueueType;
    visitDate: string;
    ticketStatus: TicketStatus;
    currentNumber: number;
    waitingBefore: number;
    estimatedWaitMinutes: number;
    issuedAt: string;
    calledAt?: string;
    patientInfo: {
        fullName: string;
        phoneNumber: string;
        nationalId?: string;
    };
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

export class QueueService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const idToken = localStorage.getItem("idToken");

        const config: RequestInit = {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(idToken && { Authorization: `Bearer ${idToken}` }),
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

    async checkIn(input: CheckInInput): Promise<TicketResponse> {
        const response = await this.request<ApiResponse<TicketResponse>>(
            "/queue/checkin",
            {
                method: "POST",
                body: JSON.stringify(input),
            }
        );
        return response.data;
    }

    async getStatus(input: StatusQueryInput): Promise<TicketResponse> {
        const params = new URLSearchParams();
        params.append("queueType", input.queueType);
        if (input.visitDate) params.append("visitDate", input.visitDate);

        const response = await this.request<ApiResponse<TicketResponse>>(
            `/queue/status?${params.toString()}`
        );
        return response.data;
    }

    async reissueTicket(input: ReissueTicketInput): Promise<TicketResponse> {
        const response = await this.request<ApiResponse<TicketResponse>>(
            "/queue/reissue",
            {
                method: "POST",
                body: JSON.stringify(input),
            }
        );
        return response.data;
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
