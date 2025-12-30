const API_BASE_URL = "https://jcf0kyq6ck.execute-api.us-east-1.amazonaws.com";

export type Article = {
  id: string;
  title: string;
  content: string;
  source: "WHO" | "CDC" | "MOH_VN";
  category: string;
  url: string;
  keywords: string[];
  emoji?: string;
  views: number;
  createdAt: string;
};

export type SearchQuery = {
  keyword?: string;
  category?: number;
  source?: string;
  limit?: number;
};

interface ApiResponse<T> {
  success: boolean;
  data: T;
  fromCache?: boolean;
}

interface SearchResponse {
  keyword?: string;
  total: number;
  data: Article[];
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

  async getAllArticles(query: SearchQuery): Promise<Article[]> {
    const params = new URLSearchParams();
    if (query.keyword) params.append("keyword", query.keyword);
    if (query.category) params.append("category", query.category.toString());
    if (query.source) params.append("source", query.source);
    if (query.limit) params.append("limit", query.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/articles?${queryString}` : "/articles";

    const response = await this.request<ApiResponse<SearchResponse>>(endpoint);
    return response.data.data;
  }

  async getArticle(id: string): Promise<Article> {
    const response = await this.request<ApiResponse<{ article: Article }>>(
      `/articles/${id}`
    );
    return response.data.article;
  }

  async searchArticles(query: SearchQuery): Promise<Article[]> {
    const params = new URLSearchParams();
    if (query.keyword) params.append("keyword", query.keyword);
    if (query.category) params.append("category", query.category.toString());
    if (query.source) params.append("source", query.source);
    if (query.limit) params.append("limit", query.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/articles/search?${queryString}`
      : "/articles/search";

    const response = await this.request<ApiResponse<SearchResponse>>(endpoint);
    return response.data.data;
  }
}
