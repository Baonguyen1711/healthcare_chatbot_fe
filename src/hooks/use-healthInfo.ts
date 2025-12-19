import { useState, useEffect, useCallback } from "react";
import { ApiService, SearchQuery, Article } from "@/services/healthInfoService";

const apiService = new ApiService();

/**
 * Hook tìm kiếm bài viết theo query
 */
export function useArticles(query?: SearchQuery) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.searchArticles(query || {});
      setArticles(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải bài viết"
      );
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  }, [query?.keyword, query?.category, query?.source, query?.limit]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return { articles, loading, error, refetch: fetchArticles };
}

/**
 * Hook lấy tất cả bài viết
 */
export function useAllArticles(query?: SearchQuery) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.searchArticles(query || {});
      setArticles(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải bài viết"
      );
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  }, [query?.keyword, query?.category, query?.source, query?.limit]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return { articles, loading, error, refetch: fetchArticles };
}

/**
 * Hook lấy bài viết theo id
 */
export function useArticleById(id: string | null) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticle = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getArticle(id);
      setArticle(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải bài viết"
      );
      console.error(`Failed to fetch article ${id}:`, err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  return { article, loading, error, refetch: fetchArticle };
}
