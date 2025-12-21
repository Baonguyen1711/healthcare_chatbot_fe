import axios from 'axios';
import { createItem, getAll } from './base';
import { BILLING_ENDPOINTS } from '../types/Endpoint/billing';
import { LatestBillResponse } from '@/types/Response/Billing';

// Hardcoded base URL - thay đổi URL này nếu cần
const BILLING_BASE_URL = "https://v04jpxqxm3.execute-api.us-east-1.amazonaws.com/dev";

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

        const api = axios.create({
            baseURL: this.baseUrl,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.accessToken}`,
            },
        });

        const response = await api.get<LatestBillResponse>(
            BILLING_ENDPOINTS.GET_LATEST_BILL
        );

        return response;
    };

    /**
     * Lấy thông tin viện phí test với userId = U001
     * Endpoint test không cần authentication
     * @returns Promise với thông tin viện phí của user U001
     */
    getLatestBillTest = async () => {
        console.log("🔧 BillingService.getLatestBillTest called");
        console.log("🌐 Base URL:", this.baseUrl);
        console.log("📍 Endpoint:", BILLING_ENDPOINTS.GET_LATEST_BILL_TEST);

        const api = axios.create({
            baseURL: this.baseUrl,
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log("📤 Sending GET request...");
        const response = await api.get<LatestBillResponse>(
            BILLING_ENDPOINTS.GET_LATEST_BILL_TEST
        );
        console.log("📥 Response received:", response);

        return response;
    };

    /**
     * @deprecated Sử dụng getLatestBillTest() thay thế
     * Lấy thông tin viện phí mới nhất theo userId cụ thể (dùng để test)
     * @param userId - User ID để test (ví dụ: "U001")
     * @returns Promise với thông tin viện phí mới nhất
     */
    getLatestBillByUserId = async (userId: string) => {
        if (!this.accessToken) {
            throw new Error("Access token not found. Please login first.");
        }

        return createItem<{}, LatestBillResponse>(
            this.baseUrl,
            BILLING_ENDPOINTS.GET_LATEST_BILL,
            { userId }, // Truyền userId vào body để test
            { token: this.accessToken }
        );
    };
}

