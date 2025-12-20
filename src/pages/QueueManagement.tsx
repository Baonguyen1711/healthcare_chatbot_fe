import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    ArrowLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    UserCheck,
    Ticket,
    Activity,
    Timer,
    ChevronRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
    QueueService,
    type CheckInInput,
    type TicketResponse,
    type QueueType,
    type TicketStatus,
} from "@/services/queueService";

// Form Schema
const checkInSchema = z.object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    phoneNumber: z.string().min(10, "Số điện thoại không hợp lệ"),
    nationalId: z.string().optional(),
    queueType: z.enum(["BHYT", "DV"], {
        required_error: "Vui lòng chọn loại hàng đợi",
    }),
}) as z.ZodType<CheckInInput>;

type CheckInForm = z.infer<typeof checkInSchema>;

const QueueManagement = () => {
    const [currentTicket, setCurrentTicket] = useState<TicketResponse | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [activeView, setActiveView] = useState<"checkin" | "status">(
        "checkin"
    );
    const { toast } = useToast();
    const queueService = new QueueService();

    const form = useForm<CheckInForm>({
        resolver: zodResolver(checkInSchema),
        defaultValues: {
            fullName: "",
            phoneNumber: "",
            nationalId: "",
            queueType: undefined,
        },
    });

    // Check-in
    const handleCheckIn = async (data: CheckInForm) => {
        setIsLoading(true);
        try {
            const result = await queueService.checkIn(data);
            setCurrentTicket(result);
            setActiveView("status");
            toast({
                title: "Check-in thành công",
                description: `Số của bạn: ${result.ticketCode}`,
            });
        } catch (error: any) {
            toast({
                title: "Lỗi check-in",
                description: error.message || "Đã có lỗi xảy ra",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Get Status
    const handleGetStatus = async (queueType: QueueType) => {
        setIsLoading(true);
        try {
            const result = await queueService.getStatus({ queueType });
            setCurrentTicket(result);
            toast({
                title: "Đã cập nhật",
                description: `Trạng thái: ${getStatusText(
                    result.ticketStatus
                )}`,
            });
        } catch (error: any) {
            toast({
                title: "Không tìm thấy",
                description: "Bạn chưa có số thứ tự nào đang hoạt động",
                variant: "destructive",
            });
            setCurrentTicket(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Reissue Ticket
    const handleReissue = async () => {
        if (!currentTicket) return;

        setIsLoading(true);
        try {
            const result = await queueService.reissueTicket({
                queueType: currentTicket.queueType,
            });
            setCurrentTicket(result);
            toast({
                title: "Đã cấp lại số",
                description: `Số mới: ${result.ticketCode}`,
            });
        } catch (error: any) {
            toast({
                title: "Lỗi",
                description: error.message || "Không thể cấp lại số",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Helper functions
    const getStatusText = (status: TicketStatus): string => {
        const statusMap = {
            WAITING: "Đang chờ",
            CALLING: "Đang gọi",
            DONE: "Hoàn thành",
            CANCELLED: "Đã hủy",
            MISSED: "Bỏ lỡ",
        };
        return statusMap[status] || status;
    };

    const getStatusVariant = (status: TicketStatus) => {
        const variantMap = {
            WAITING: "default",
            CALLING: "default",
            DONE: "secondary",
            CANCELLED: "secondary",
            MISSED: "secondary",
        };
        return variantMap[status] || "secondary";
    };

    const getQueueTypeText = (type: QueueType): string => {
        return type === "BHYT" ? "Bảo hiểm y tế" : "Dịch vụ";
    };

    const getQueueTypeShort = (type: QueueType): string => {
        return type === "BHYT" ? "BHYT" : "DV";
    };

    // Auto-refresh
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (activeView === "status" && currentTicket) {
            interval = setInterval(() => {
                handleGetStatus(currentTicket.queueType);
            }, 30000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeView, currentTicket]);

    return (
        <div className="min-h-screen bg-gradient-soft">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="mb-6 -ml-2"
                    >
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft size={18} />
                            <span>Trang chủ</span>
                        </Link>
                    </Button>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft">
                            <Users
                                className="text-primary-foreground"
                                size={24}
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Hàng đợi khám bệnh
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Lấy số & theo dõi lượt khám
                            </p>
                        </div>
                    </div>
                </div>

                {/* View Tabs */}
                <div className="flex gap-3 mb-8 p-1 bg-muted/50 rounded-xl">
                    <button
                        onClick={() => setActiveView("checkin")}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                            activeView === "checkin"
                                ? "bg-background shadow-soft text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <UserCheck size={18} />
                        <span>Check-in</span>
                    </button>
                    <button
                        onClick={() => setActiveView("status")}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                            activeView === "status"
                                ? "bg-background shadow-soft text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Activity size={18} />
                        <span>Trạng thái</span>
                    </button>
                </div>

                {/* Check-in View */}
                {activeView === "checkin" && (
                    <Card className="border-0 shadow-elegant">
                        <CardHeader className="border-b">
                            <CardTitle className="text-xl font-semibold flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Ticket
                                        className="text-primary"
                                        size={20}
                                    />
                                </div>
                                <span>Lấy số thứ tự</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(handleCheckIn)}
                                    className="space-y-5"
                                >
                                    <FormField
                                        control={form.control}
                                        name="queueType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">
                                                    Loại hàng đợi
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-12">
                                                            <SelectValue placeholder="Chọn loại hàng đợi" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-background">
                                                        <SelectItem value="BHYT">
                                                            <div className="flex items-center gap-2">
                                                                <Users
                                                                    size={16}
                                                                    className="text-primary"
                                                                />
                                                                <span>
                                                                    Bảo hiểm y
                                                                    tế (BHYT)
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="DV">
                                                            <div className="flex items-center gap-2">
                                                                <Ticket
                                                                    size={16}
                                                                    className="text-success"
                                                                />
                                                                <span>
                                                                    Dịch vụ (DV)
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">
                                                        Họ và tên
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Nguyễn Văn A"
                                                            className="h-12"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">
                                                        Số điện thoại
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="0901234567"
                                                            className="h-12"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="nationalId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-muted-foreground">
                                                    CMND/CCCD{" "}
                                                    <span className="text-xs">
                                                        (Tùy chọn)
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="001234567890"
                                                        className="h-12"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-medium"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <RefreshCw
                                                    size={20}
                                                    className="mr-2 animate-spin"
                                                />
                                                Đang xử lý
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2
                                                    size={20}
                                                    className="mr-2"
                                                />
                                                Lấy số thứ tự
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                )}

                {/* Status View */}
                {activeView === "status" && (
                    <div className="space-y-6">
                        {!currentTicket && (
                            <Card className="border-0 shadow-elegant">
                                <CardHeader className="border-b">
                                    <CardTitle className="text-xl font-semibold flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Activity
                                                className="text-primary"
                                                size={20}
                                            />
                                        </div>
                                        <span>Kiểm tra trạng thái</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <p className="text-muted-foreground mb-6 text-center">
                                        Chọn loại hàng đợi để xem số thứ tự của
                                        bạn
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() =>
                                                handleGetStatus("BHYT")
                                            }
                                            disabled={isLoading}
                                            className="group h-32 rounded-2xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            <Users
                                                size={32}
                                                className="text-primary group-hover:scale-110 transition-transform"
                                            />
                                            <span className="font-semibold text-foreground">
                                                BHYT
                                            </span>
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleGetStatus("DV")
                                            }
                                            disabled={isLoading}
                                            className="group h-32 rounded-2xl border-2 border-dashed hover:border-success hover:bg-success/5 transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            <Ticket
                                                size={32}
                                                className="text-success group-hover:scale-110 transition-transform"
                                            />
                                            <span className="font-semibold text-foreground">
                                                Dịch vụ
                                            </span>
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {currentTicket && (
                            <>
                                {/* Main Ticket Card */}
                                <Card className="border-0 shadow-elegant overflow-hidden">
                                    {/* Ticket Header */}
                                    <div className="relative bg-gradient-to-br from-primary via-primary to-primary-dark p-8 text-primary-foreground">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
                                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

                                        <div className="relative">
                                            <div className="flex items-center justify-between mb-6">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-white/20 text-white border-0 backdrop-blur-sm"
                                                >
                                                    {getQueueTypeText(
                                                        currentTicket.queueType
                                                    )}
                                                </Badge>
                                                <button
                                                    onClick={() =>
                                                        handleGetStatus(
                                                            currentTicket.queueType
                                                        )
                                                    }
                                                    disabled={isLoading}
                                                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors disabled:opacity-50"
                                                >
                                                    <RefreshCw
                                                        size={16}
                                                        className={
                                                            isLoading
                                                                ? "animate-spin"
                                                                : ""
                                                        }
                                                    />
                                                </button>
                                            </div>

                                            <div className="text-center">
                                                <p className="text-sm text-white/70 mb-3">
                                                    Số thứ tự của bạn
                                                </p>
                                                <div className="text-6xl font-bold mb-4 tracking-tight">
                                                    {currentTicket.ticketCode}
                                                </div>
                                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${
                                                            currentTicket.ticketStatus ===
                                                            "CALLING"
                                                                ? "bg-green-400 animate-pulse"
                                                                : currentTicket.ticketStatus ===
                                                                  "WAITING"
                                                                ? "bg-blue-400"
                                                                : "bg-gray-400"
                                                        }`}
                                                    />
                                                    <span className="text-sm font-medium">
                                                        {getStatusText(
                                                            currentTicket.ticketStatus
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ticket Body */}
                                    <CardContent className="p-6 space-y-6">
                                        {/* Current Number */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                    <Activity
                                                        className="text-primary"
                                                        size={20}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Đang gọi
                                                    </p>
                                                    <p className="text-2xl font-bold text-foreground">
                                                        {getQueueTypeShort(
                                                            currentTicket.queueType
                                                        )}
                                                        -
                                                        {currentTicket.currentNumber
                                                            .toString()
                                                            .padStart(3, "0")}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight
                                                className="text-muted-foreground"
                                                size={20}
                                            />
                                        </div>

                                        {/* Waiting Info */}
                                        {currentTicket.ticketStatus ===
                                            "WAITING" && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl border bg-background">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Users
                                                            size={16}
                                                            className="text-muted-foreground"
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            Số người chờ
                                                        </p>
                                                    </div>
                                                    <p className="text-3xl font-bold text-primary">
                                                        {
                                                            currentTicket.waitingBefore
                                                        }
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded-xl border bg-background">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Timer
                                                            size={16}
                                                            className="text-muted-foreground"
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            Thời gian chờ
                                                        </p>
                                                    </div>
                                                    <p className="text-3xl font-bold text-primary">
                                                        ~
                                                        {
                                                            currentTicket.estimatedWaitMinutes
                                                        }
                                                        <span className="text-base font-normal text-muted-foreground ml-1">
                                                            phút
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Calling Alert */}
                                        {currentTicket.ticketStatus ===
                                            "CALLING" && (
                                            <div className="p-5 rounded-xl bg-success/10 border-2 border-success/20">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                                                        <AlertCircle
                                                            className="text-white animate-pulse"
                                                            size={20}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-success text-lg">
                                                            Đến lượt bạn!
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Vui lòng vào phòng
                                                            khám
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Missed Alert */}
                                        {currentTicket.ticketStatus ===
                                            "MISSED" && (
                                            <div className="p-5 rounded-xl bg-amber-500/10 border-2 border-amber-500/20">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                                        <AlertCircle
                                                            className="text-amber-600"
                                                            size={20}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-amber-600">
                                                            Đã bỏ lỡ lượt khám
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Vui lòng lấy số mới
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Patient Info */}
                                        <div className="pt-4 border-t">
                                            <p className="text-xs font-medium text-muted-foreground mb-3">
                                                THÔNG TIN
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">
                                                        Họ tên
                                                    </span>
                                                    <span className="text-sm font-medium">
                                                        {
                                                            currentTicket
                                                                .patientInfo
                                                                .fullName
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">
                                                        Điện thoại
                                                    </span>
                                                    <span className="text-sm font-medium">
                                                        {
                                                            currentTicket
                                                                .patientInfo
                                                                .phoneNumber
                                                        }
                                                    </span>
                                                </div>
                                                {currentTicket.patientInfo
                                                    .nationalId && (
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-muted-foreground">
                                                            CMND/CCCD
                                                        </span>
                                                        <span className="text-sm font-medium">
                                                            {
                                                                currentTicket
                                                                    .patientInfo
                                                                    .nationalId
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-muted-foreground">
                                                        Ngày khám
                                                    </span>
                                                    <span className="text-sm font-medium">
                                                        {new Date(
                                                            currentTicket.visitDate
                                                        ).toLocaleDateString(
                                                            "vi-VN"
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Actions */}
                                {(currentTicket.ticketStatus === "WAITING" ||
                                    currentTicket.ticketStatus ===
                                        "MISSED") && (
                                    <Card className="border-0 shadow-soft">
                                        <CardContent className="p-6">
                                            <Button
                                                variant="outline"
                                                className="w-full h-12"
                                                onClick={handleReissue}
                                                disabled={isLoading}
                                            >
                                                <RefreshCw
                                                    size={18}
                                                    className="mr-2"
                                                />
                                                Lấy lại số thứ tự
                                            </Button>
                                            <p className="text-xs text-center text-muted-foreground mt-3">
                                                Số cũ sẽ bị hủy, bạn sẽ nhận số
                                                mới ở cuối hàng
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Info */}
                                <div className="p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground space-y-2">
                                    <p className="font-medium text-foreground mb-2">
                                        Lưu ý
                                    </p>
                                    <p>• Chú ý màn hình và loa gọi số</p>
                                    <p>• Có mặt khi đến lượt</p>
                                    <p>• Tự động cập nhật mỗi 30 giây</p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QueueManagement;
