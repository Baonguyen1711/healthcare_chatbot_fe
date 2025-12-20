import { createItem } from './base';
import { BILLING_ENDPOINTS } from '../types/Endpoint/billing';
import { LatestBillResponse } from '@/types/Response/Billing';

const BILLING_BASE_URL = import.meta.env.VITE_BILLING_BASE_URL;

export class BillingService {
    private baseUrl: string;
    private accessToken: string | null;

    constructor() {
        this.baseUrl = BILLING_BASE_URL;
        this.accessToken = localStorage.getItem("accessToken");
    }

    /**
     * Lấy thông tin viện phí mới nhất của user
     * Backend sẽ tự động lấy userId từ JWT token
     * @returns Promise với thông tin viện phí mới nhất
     */
    getLatestBill = async () => {
        if (!this.accessToken) {
            throw new Error("Access token not found. Please login first.");
        }

        return createItem<{}, LatestBillResponse>(
            this.baseUrl,
            BILLING_ENDPOINTS.GET_LATEST_BILL,
            {}, // Empty body vì backend lấy userId từ token
            { token: this.accessToken }
        );
    };
}
