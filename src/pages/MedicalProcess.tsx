import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
    ClipboardList,
    ArrowLeft,
    CheckCircle2,
    Clock,
    CreditCard,
    QrCode,
    User,
    FileText,
    MapPin,
    Phone,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLatestBill } from "@/hooks/use-billing";
import { jwtDecode } from "jwt-decode";
import QueueManagement from "./QueueManagement";

const MedicalProcess = () => {
    const [currentStep, setCurrentStep] = useState(2);

    // Fetch billing data từ API (backend tự động lấy userId từ JWT token)
    const { bill, loading: billLoading, error: billError } = useLatestBill();

    const processSteps = [
        {
            id: 1,
            title: "Đặt lịch hẹn",
            description: "Chọn khoa, bác sĩ và thời gian phù hợp",
            status: "completed",
            time: "Đã hoàn thành",
        },
        {
            id: 2,
            title: "Check-in trực tuyến",
            description: "Xác nhận thông tin và check-in trước khi đến",
            status: "current",
            time: "Đang thực hiện",
        },
        {
            id: 3,
            title: "Nhận số thứ tự",
            description: "Lấy số thứ tự khám và theo dõi hàng đợi",
            status: "pending",
            time: "Sắp tới",
        },
        {
            id: 4,
            title: "Khám bệnh",
            description: "Gặp bác sĩ và thực hiện khám chữa bệnh",
            status: "pending",
            time: "Chờ đợi",
        },
        {
            id: 5,
            title: "Thanh toán viện phí",
            description: "Thanh toán chi phí khám và thuốc (nếu có)",
            status: "pending",
            time: "Chờ đợi",
        },
    ];

    const appointmentInfo = {
        patientName: "Nguyễn Văn An",
        department: "Nội khoa",
        doctor: "BS. Trần Thị Minh",
        date: "25/09/2024",
        time: "09:30",
        room: "Phòng 205 - Tòa A",
        queueNumber: "A-12",
        estimatedTime: "09:45",
    };

    // Sử dụng dữ liệu từ API nếu có, nếu không dùng mock data
    const fees = bill?.services || [
        {
            serviceId: "1",
            serviceName: "Phí khám bệnh",
            quantity: 1,
            unitPrice: 150000,
            totalPrice: 150000,
        },
        {
            serviceId: "2",
            serviceName: "Xét nghiệm máu",
            quantity: 1,
            unitPrice: 200000,
            totalPrice: 200000,
        },
        {
            serviceId: "3",
            serviceName: "Chụp X-quang",
            quantity: 1,
            unitPrice: 180000,
            totalPrice: 180000,
        },
    ];

    const totalFee =
        bill?.totalBasePrice ||
        fees.reduce((sum, fee) => sum + fee.totalPrice, 0);
    const totalCovered = bill?.totalInsuranceCovered || 424000;
    const patientPay = bill?.totalPatientPay || totalFee - totalCovered;

    const getStepIcon = (step: (typeof processSteps)[0]) => {
        if (step.status === "completed")
            return <CheckCircle2 className="text-success" size={24} />;
        if (step.status === "current")
            return <Clock className="text-primary" size={24} />;
        return <div className="w-6 h-6 rounded-full border-2 border-muted" />;
    };

    const getStepColor = (step: (typeof processSteps)[0]) => {
        if (step.status === "completed") return "bg-success";
        if (step.status === "current") return "bg-primary";
        return "bg-muted";
    };

    return (
        <div className="min-h-screen bg-gradient-soft">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/" className="flex items-center gap-2">
                            <ArrowLeft size={20} />
                            Về trang chủ
                        </Link>
                    </Button>
                </div>

                <div className="max-w-4xl mx-auto">
                    <QueueManagement />

                    {/* Fee Information */}
                    <Card className="mb-8 border-0 shadow-elegant">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard
                                    className="text-primary"
                                    size={24}
                                />
                                Chi phí khám chữa bệnh
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {billLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2
                                        className="animate-spin text-primary mr-3"
                                        size={24}
                                    />
                                    <span className="text-muted-foreground">
                                        Đang tải thông tin viện phí...
                                    </span>
                                </div>
                            ) : billError ? (
                                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg mb-4">
                                    <AlertCircle
                                        className="text-yellow-600"
                                        size={20}
                                    />
                                    <div>
                                        <p className="text-sm text-yellow-800 font-medium">
                                            Không thể tải dữ liệu từ API
                                        </p>
                                        <p className="text-xs text-yellow-600 mt-1">
                                            {billError}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Đang hiển thị dữ liệu mẫu
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {bill && (
                                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2
                                            className="text-green-600"
                                            size={16}
                                        />
                                        <p className="text-sm text-green-800">
                                            Dữ liệu từ {bill.hospitalName} -
                                            Ngày khám:{" "}
                                            {new Date(
                                                bill.visitDate
                                            ).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {fees.map((fee, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between py-2"
                                    >
                                        <span className="text-foreground">
                                            {fee.serviceName ||
                                                `Dịch vụ ${index + 1}`}
                                        </span>
                                        <div className="text-right">
                                            <p className="font-semibold text-foreground">
                                                {fee.totalPrice.toLocaleString(
                                                    "vi-VN"
                                                )}{" "}
                                                ₫
                                            </p>
                                            {fee.quantity &&
                                                fee.quantity > 1 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {fee.quantity} x{" "}
                                                        {fee.unitPrice.toLocaleString(
                                                            "vi-VN"
                                                        )}{" "}
                                                        ₫
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                ))}
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Tổng chi phí:
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            {totalFee.toLocaleString("vi-VN")} ₫
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            BHYT chi trả:
                                        </span>
                                        <span className="font-semibold text-success">
                                            -
                                            {totalCovered.toLocaleString(
                                                "vi-VN"
                                            )}{" "}
                                            ₫
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between font-bold text-lg">
                                        <span className="text-foreground">
                                            Bệnh nhân thanh toán:
                                        </span>
                                        <span className="text-primary">
                                            {patientPay.toLocaleString("vi-VN")}{" "}
                                            ₫
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2
                                            className="text-green-600"
                                            size={24}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-green-800 text-lg">
                                            Đã thanh toán
                                        </h4>
                                        <p className="text-sm text-green-600">
                                            Hóa đơn này đã được thanh toán đầy
                                            đủ
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Support */}
                    <Card className="border-0 bg-primary/5">
                        <CardContent className="p-6 text-center">
                            <Phone
                                className="text-primary mx-auto mb-3"
                                size={32}
                            />
                            <h3 className="font-semibold text-foreground mb-2">
                                Cần hỗ trợ?
                            </h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Liên hệ với chúng tôi nếu bạn có thắc mắc về quy
                                trình khám bệnh
                            </p>
                            <div className="flex justify-center gap-4">
                                <Button variant="outline" size="sm">
                                    Hotline: 1900-xxx-xxx
                                </Button>
                                <Button variant="outline" size="sm">
                                    Chat trực tuyến
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MedicalProcess;
