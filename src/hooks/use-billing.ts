import { useState, useEffect, useCallback } from "react";
import { BillingService } from "@/services/billingService";
import { LatestBillResponse } from "@/types/Response/Billing";

const billingService = new BillingService();

/**
 * Hook lấy thông tin viện phí mới nhất của user
 * Backend tự động lấy userId từ JWT token
 */
export function useLatestBill() {
    const [bill, setBill] = useState<LatestBillResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBill = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await billingService.getLatestBill();
            setBill(response.data);
        } catch (err: any) {
            console.error("❌ Failed to fetch latest bill:", err);
            console.error("Error details:", {
                status: err?.response?.status,
                message: err?.response?.data?.message,
                detail: err?.response?.data?.detail,
            });

            // Error thrown from service is now a standard Error object with message
            const errorMessage = err.message || "Đã xảy ra lỗi khi tải thông tin viện phí";
            console.error("❌ Billing Error:", errorMessage);

            // Tự động detect lỗi dựa trên nội dung message (đã được format từ service hoặc server)
            // Ví dụ: "HTTP 404: Not Found" hoặc "Access token not found"

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBill();
    }, [fetchBill]);

    return { bill, loading, error, refetch: fetchBill };
}

/**
 * Hook test - lấy bill của userId U001 (không cần authentication)
 * Dùng endpoint /billing/test/latest
 */
export function useLatestBillTest() {
    const [bill, setBill] = useState<LatestBillResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBill = useCallback(async () => {
        console.log("🚀 useLatestBillTest: Starting fetch...");
        try {
            setLoading(true);
            setError(null);
            console.log("📡 Calling billingService.getLatestBillTest()...");
            const response = await billingService.getLatestBillTest();
            console.log("✅ Response received:", response);
            console.log("📦 Response data:", response.data);
            setBill(response.data);
        } catch (err: any) {
            console.error("❌ Error in useLatestBillTest:", err);
            console.error("Error response:", err?.response);
            const errorMessage = err?.response?.data?.message ||
                err?.message ||
                "Đã xảy ra lỗi khi tải thông tin viện phí";
            setError(errorMessage);
        } finally {
            setLoading(false);
            console.log("🏁 useLatestBillTest: Fetch completed");
        }
    }, []);

    return { bill, loading, error, refetch: fetchBill };
}

/**
 * @deprecated Sử dụng useLatestBillTest() thay thế
 * Hook test cho phép truyền userId cố định
 * Dùng để test API billing với userId tùy chỉnh
 */
export function useLatestBillWithUserId(userId: string | null) {
    const [bill, setBill] = useState<LatestBillResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBill = useCallback(async () => {
        if (!userId) {
            setError("Vui lòng nhập userId để test");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await billingService.getLatestBillByUserId(userId);
            setBill(response.data);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message ||
                err?.message ||
                "Đã xảy ra lỗi khi tải thông tin viện phí";
            setError(errorMessage);
            console.error("Failed to fetch latest bill:", err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    return { bill, loading, error, refetch: fetchBill };
}
