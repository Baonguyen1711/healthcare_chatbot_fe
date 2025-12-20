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
            const errorMessage = err?.response?.data?.message ||
                err?.message ||
                "Đã xảy ra lỗi khi tải thông tin viện phí";
            setError(errorMessage);
            console.error("Failed to fetch latest bill:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBill();
    }, [fetchBill]);

    return { bill, loading, error, refetch: fetchBill };
}
