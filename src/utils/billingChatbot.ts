import { LatestBillResponse } from "@/types/Response/Billing";

/**
 * Kiểm tra xem câu hỏi có liên quan đến viện phí không
 */
export const checkBillingQuery = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    const billingKeywords = [
        'viện phí', 'vien phi', 'viện phi', 'chi phí', 'chi phi', 'tiền viện',
        'hóa đơn', 'hoa don', 'thanh toán', 'thanh toan', 'thanh toán', 'thanh toan', 'tien phi', 'tien', 'tiền',
        'bill', 'billing', 'payment', 'phí khám', 'phi kham',
        'bao nhiêu tiền', 'giá', 'gia', 'phí', 'phi',
        'tổng chi phí', 'tong chi phi', 'tổng tiền', 'tong tien',
        'hospital fee', 'medical bill', 'invoice', 'tien phi', 'phi phi',
    ];

    return billingKeywords.some(keyword => lowerMessage.includes(keyword));
};

/**
 * Tạo response cho câu hỏi về viện phí
 */
export const getBillingResponse = (
    bill: LatestBillResponse | null,
    billLoading: boolean,
    billError: string | null
): string => {
    if (billLoading) {
        return 'Đang tải thông tin viện phí của bạn...';
    }

    if (billError) {
        // Kiểm tra xem user đã đăng nhập chưa
        const isLoggedIn = !!localStorage.getItem("idToken");

        if (isLoggedIn) {
            // Đã đăng nhập nhưng vẫn lỗi -> Có thể do chưa có dữ liệu hoặc lỗi server
            if (billError.includes("404") || billError.includes("Không tìm thấy") || billError.includes("chưa có dữ liệu")) {
                return `ℹ️ Bạn chưa có dữ liệu viện phí nào trong hệ thống.`;
            }
            return `❌ Có lỗi xảy ra: ${billError}`;
        } else {
            // Chưa đăng nhập
            return `❌ Vui lòng đăng nhập để kiểm tra viện phí`;
        }
    }

    if (!bill) {
        return '❌ Không tìm thấy thông tin viện phí của bạn.\n\nVui lòng đăng nhập hoặc liên hệ bộ phận hỗ trợ nếu bạn cho rằng đây là lỗi.';
    }

    return formatBillResponse(bill);
};

/**
 * Format thông tin viện phí thành text đẹp
 */
export const formatBillResponse = (billData: LatestBillResponse): string => {
    const visitDate = new Date(billData.visitDate).toLocaleDateString('vi-VN');

    let response = `📋 **Thông tin viện phí của bạn**\n\n`;
    response += `🏥 Bệnh viện: ${billData.hospitalName}\n`;
    response += `📅 Ngày khám: ${visitDate}\n`;
    response += `🆔 Mã khám: ${billData.visitId}\n\n`;

    response += `💊 **Dịch vụ đã sử dụng:**\n`;
    billData.services.forEach((service, index) => {
        response += `${index + 1}. ${service.serviceName}: ${service.totalPrice.toLocaleString('vi-VN')} ₫\n`;
    });

    response += `\n💰 **Chi tiết thanh toán:**\n`;
    response += `• Tổng chi phí: ${billData.totalBasePrice.toLocaleString('vi-VN')} ₫\n`;
    response += `• BHYT chi trả: ${billData.totalInsuranceCovered.toLocaleString('vi-VN')} ₫\n`;
    response += `• **Bạn cần trả: ${billData.totalPatientPay.toLocaleString('vi-VN')} ₫**\n\n`;

    if (billData.note) {
        response += `📝 Ghi chú: ${billData.note}\n\n`;
    }

    response += `Bạn có câu hỏi gì về viện phí này không?`;

    return response;
};
