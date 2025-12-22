const API_BASE_URL = "https://jcf0kyq6ck.execute-api.us-east-1.amazonaws.com";

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  answer: string;
  conversationId: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  fromCache?: boolean;
}

export class ApiService {
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
      throw new Error(result.message || "API request failed");
    }

    return result;
  }

  async sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
    const response = await this.request<ApiResponse<ChatResponse>>("/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response.data;
  }
}
