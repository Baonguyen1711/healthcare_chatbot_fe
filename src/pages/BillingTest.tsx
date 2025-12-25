import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    RefreshCw,
    History,
    Receipt,
    Calendar,
    Building2,
    User,
    Stethoscope,
    CreditCard,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
} from "lucide-react";
import { BillingService } from "@/services/billingService";
import { LatestBillResponse, HospitalBill } from "@/types/Response/Billing";
import { cn } from "@/lib/utils";

const BillingTest = () => {
    const [activeView, setActiveView] = useState<"latest" | "history">("latest");
    const [latestBill, setLatestBill] = useState<LatestBillResponse | null>(null);
    const [transactions, setTransactions] = useState<HospitalBill[]>([]);
    const [isLoadingLatest, setIsLoadingLatest] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const billingService = new BillingService();

    // Load latest bill on mount
    useEffect(() => {
        loadLatestBill();
    }, []);

    // Load history when switching to history tab
    useEffect(() => {
        if (activeView === "history" && transactions.length === 0) {
            loadTransactionHistory();
        }
    }, [activeView]);

    const loadLatestBill = async () => {
        setIsLoadingLatest(true);
        setError(null);
        try {
            const response = await billingService.getLatestBill();
            setLatestBill(response.data);
        } catch (err: any) {
            setError(err.message || "Không thể tải thông tin hóa đơn");
        } finally {
            setIsLoadingLatest(false);
        }
    };

    const loadTransactionHistory = async () => {
        setIsLoadingHistory(true);
        setError(null);
        try {
            const response = await billingService.getTransactionHistory();
            setTransactions(response.data.transactions || []);
        } catch (err: any) {
            setError(err.message || "Không thể tải lịch sử giao dịch");
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const getPaymentStatusBadge = (status?: string) => {
        switch (status) {
            case "PAID":
                return (
                    <Badge className="bg-[#9BF73C]/10 text-[#9BF73C] border-[#9BF73C]/20 px-4 py-2 text-base">
                        <CheckCircle2 size={18} className="mr-2" />
                        Đã thanh toán
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-200 px-4 py-2 text-base">
                        <Clock size={18} className="mr-2" />
                        Chờ thanh toán
                    </Badge>
                );
            case "CANCELLED":
                return (
                    <Badge className="bg-red-500/10 text-red-700 border-red-200 px-4 py-2 text-base">
                        <XCircle size={18} className="mr-2" />
                        Đã hủy
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="px-4 py-2 text-base">
                        <Clock size={18} className="mr-2" />
                        Không rõ
                    </Badge>
                );
        }
    };

    const renderBillCard = (bill: LatestBillResponse | HospitalBill, isLatest = false) => (
        <Card className={cn(
            "border-0 shadow-elegant overflow-hidden",
            isLatest && "border-2 border-primary/20"
        )}>
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-br from-primary via-primary to-primary/90 p-6 text-primary-foreground">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

                <div className="relative space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Receipt size={24} />
                            <h3 className="text-xl font-bold">Hóa đơn #{bill.visitId}</h3>
                        </div>
                        {getPaymentStatusBadge(bill.paymentStatus)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="opacity-80" />
                            <span>{new Date(bill.visitDate).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="opacity-80" />
                            <span className="truncate">{bill.hospitalName}</span>
                        </div>
                    </div>

                    {bill.doctorName && (
                        <div className="flex items-center gap-2 text-sm">
                            <Stethoscope size={16} className="opacity-80" />
                            <span>{bill.doctorName}</span>
                            {bill.department && <span className="opacity-60">• {bill.department}</span>}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <CardContent className="p-6 space-y-4">
                {/* Diagnosis */}
                {bill.diagnosis && (
                    <div className="p-4 rounded-xl bg-muted/60">
                        <p className="text-sm text-muted-foreground mb-1">Chẩn đoán</p>
                        <p className="font-medium">{bill.diagnosis}</p>
                    </div>
                )}

                {/* Services */}
                <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Receipt size={18} className="text-primary" />
                        Dịch vụ sử dụng
                    </h4>
                    <div className="space-y-2">
                        {bill.services.map((service, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-muted/40">
                                <div>
                                    <p className="font-medium text-sm">{service.serviceName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {service.quantity} x {service.unitPrice.toLocaleString("vi-VN")} ₫
                                    </p>
                                </div>
                                <span className="font-semibold">{service.totalPrice.toLocaleString("vi-VN")} ₫</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tổng chi phí</span>
                        <span className="font-semibold">{bill.totalBasePrice.toLocaleString("vi-VN")} ₫</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">BHYT chi trả</span>
                        <span className="font-semibold text-green-600">
                            -{bill.totalInsuranceCovered.toLocaleString("vi-VN")} ₫
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
                        <span>Bệnh nhân trả</span>
                        <span className="text-primary">{bill.totalPatientPay.toLocaleString("vi-VN")} ₫</span>
                    </div>
                </div>

                {/* Payment Info */}
                {bill.paymentMethod && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard size={16} />
                        <span>Phương thức: {bill.paymentMethod}</span>
                        {bill.paymentDate && (
                            <>
                                <span>•</span>
                                <span>{new Date(bill.paymentDate).toLocaleDateString("vi-VN")}</span>
                            </>
                        )}
                    </div>
                )}

                {/* Note */}
                {bill.note && (
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                        <p className="text-sm text-blue-900">
                            <strong>Ghi chú:</strong> {bill.note}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-soft">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Back button */}
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/" className="flex items-center gap-2">
                            <ArrowLeft size={20} />
                            Về trang chủ
                        </Link>
                    </Button>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft">
                            <Receipt className="text-primary-foreground" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Quản lý thanh toán</h1>
                            <p className="text-muted-foreground text-md mt-1">
                                Xem và quản lý hóa đơn viện phí của bạn
                            </p>
                        </div>
                    </div>
                </div>

                {/* View Tabs */}
                <div className="flex gap-3 mb-8 p-1 bg-muted rounded-xl">
                    <button
                        onClick={() => setActiveView("latest")}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${activeView === "latest"
                            ? "bg-background shadow-soft text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                            }`}
                    >
                        <Receipt size={18} />
                        <span>Hóa đơn gần nhất</span>
                    </button>
                    <button
                        onClick={() => setActiveView("history")}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${activeView === "history"
                            ? "bg-background shadow-soft text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                            }`}
                    >
                        <History size={18} />
                        <span>Lịch sử giao dịch</span>
                    </button>
                </div>

                {/* Latest Bill View */}
                {activeView === "latest" && (
                    <div className="space-y-6">
                        {/* Refresh Button */}
                        <div className="flex justify-end">
                            <Button
                                onClick={loadLatestBill}
                                disabled={isLoadingLatest}
                                variant="outline"
                                className="gap-2"
                            >
                                <RefreshCw size={16} className={cn(isLoadingLatest && "animate-spin")} />
                                Làm mới
                            </Button>
                        </div>

                        {/* Loading State */}
                        {isLoadingLatest && (
                            <Card className="border-0 shadow-elegant">
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-primary mb-3" size={32} />
                                    <span className="text-muted-foreground">Đang tải thông tin hóa đơn...</span>
                                </CardContent>
                            </Card>
                        )}

                        {/* Error State */}
                        {error && !isLoadingLatest && (
                            <Card className="border-0 shadow-elegant border-red-200">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-3">
                                        <XCircle className="text-red-500 flex-shrink-0" size={24} />
                                        <div>
                                            <h3 className="font-semibold text-red-900 mb-1">Lỗi tải dữ liệu</h3>
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Latest Bill */}
                        {!isLoadingLatest && !error && latestBill && renderBillCard(latestBill, true)}

                        {/* No Data */}
                        {!isLoadingLatest && !error && !latestBill && (
                            <Card className="border-0 shadow-elegant">
                                <CardContent className="text-center py-12">
                                    <Receipt className="mx-auto text-muted-foreground mb-3" size={48} />
                                    <p className="text-muted-foreground mb-2">Chưa có hóa đơn nào</p>
                                    <p className="text-sm text-muted-foreground">
                                        Hóa đơn của bạn sẽ hiển thị ở đây sau khi khám bệnh
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Transaction History View */}
                {activeView === "history" && (
                    <div className="space-y-6">
                        {/* Refresh Button */}
                        <div className="flex justify-end">
                            <Button
                                onClick={loadTransactionHistory}
                                disabled={isLoadingHistory}
                                variant="outline"
                                className="gap-2"
                            >
                                <RefreshCw size={16} className={cn(isLoadingHistory && "animate-spin")} />
                                Làm mới
                            </Button>
                        </div>

                        {/* Loading State */}
                        {isLoadingHistory && (
                            <Card className="border-0 shadow-elegant">
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-primary mb-3" size={32} />
                                    <span className="text-muted-foreground">Đang tải lịch sử giao dịch...</span>
                                </CardContent>
                            </Card>
                        )}

                        {/* Error State */}
                        {error && !isLoadingHistory && (
                            <Card className="border-0 shadow-elegant border-red-200">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-3">
                                        <XCircle className="text-red-500 flex-shrink-0" size={24} />
                                        <div>
                                            <h3 className="font-semibold text-red-900 mb-1">Lỗi tải dữ liệu</h3>
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Transaction List */}
                        {!isLoadingHistory && !error && transactions.length > 0 && (
                            <>
                                <div className="text-sm text-muted-foreground mb-4">
                                    Tổng cộng: <strong>{transactions.length}</strong> giao dịch
                                </div>
                                {transactions.map((transaction) => (
                                    <div key={transaction.visitId}>{renderBillCard(transaction)}</div>
                                ))}
                            </>
                        )}

                        {/* No Data */}
                        {!isLoadingHistory && !error && transactions.length === 0 && (
                            <Card className="border-0 shadow-elegant">
                                <CardContent className="text-center py-12">
                                    <History className="mx-auto text-muted-foreground mb-3" size={48} />
                                    <p className="text-muted-foreground mb-2">Chưa có lịch sử giao dịch</p>
                                    <p className="text-sm text-muted-foreground">
                                        Lịch sử giao dịch của bạn sẽ hiển thị ở đây
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BillingTest;
