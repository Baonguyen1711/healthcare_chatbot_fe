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
    error?: string;
}

export class QueueService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const config: RequestInit = {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(
                error.message || `HTTP error! status: ${response.status}`
            );
        }

        const result = await response.json();

        if (result.success === false) {
            throw new Error(result.error || "API request failed");
        }

        return result;
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
