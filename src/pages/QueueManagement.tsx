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
            fullName: localStorage.getItem("userName") || "",
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
            }, 120000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeView, currentTicket]);

    return (
        <div className="mb-8 bg-gradient-soft">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft">
                        <Users className="text-primary-foreground" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Hàng đợi khám bệnh
                        </h1>
                        <p className="text-muted-foreground text-md mt-2">
                            Lấy số & theo dõi lượt khám
                        </p>
                    </div>
                </div>
            </div>

            {/* View Tabs */}
            <div className="flex gap-3 mb-8 p-1 bg-muted rounded-xl">
                <button
                    onClick={() => setActiveView("checkin")}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                        activeView === "checkin"
                            ? "bg-background shadow-soft text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
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
                            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
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
                                <Ticket className="text-primary" size={20} />
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
                                            <FormLabel className="text-[14px] font-medium">
                                                Loại hàng đợi
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder="Chọn loại hàng đợi" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-background text-[14px]">
                                                    <SelectItem value="BHYT">
                                                        <div className="flex items-center gap-2 py-1.5">
                                                            <Users
                                                                size={16}
                                                                className="text-primary"
                                                            />
                                                            <span className="text-[14px]">
                                                                Bảo hiểm y tế
                                                                (BHYT)
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="DV">
                                                        <div className="flex items-center gap-2 py-1.5">
                                                            <Ticket
                                                                size={16}
                                                                className="text-success"
                                                            />
                                                            <span className="text-[14px]">
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
                                                <FormLabel className="text-[14px] font-medium">
                                                    Họ và tên
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Nguyễn Văn A"
                                                        className="h-12 text-[14px]"
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
                                                <FormLabel className="text-[14px] font-medium">
                                                    Số điện thoại
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="0901234567"
                                                        className="h-12 text-[14px]"
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
                                            <FormLabel className="text-[14px] font-medium text-muted-foreground">
                                                CMND/CCCD
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="001234567890"
                                                    className="h-12 text-[14px]"
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
                                    Chọn loại hàng đợi để xem số thứ tự của bạn
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleGetStatus("BHYT")}
                                        disabled={isLoading}
                                        className="group h-32 rounded-2xl border-[1.5px] border-dashed hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50"
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
                                        onClick={() => handleGetStatus("DV")}
                                        disabled={isLoading}
                                        className="group h-32 rounded-2xl border-[1.5px] border-dashed hover:border-success hover:bg-success/5 transition-all flex flex-col items-center justify-center gap-3 disabled:opacity-50"
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
                            {/* Main Status Display - Compact & Modern */}
                            <Card className="border-0 shadow-elegant overflow-hidden">
                                {/* Ticket Number - Compact Header */}
                                <div className="relative bg-gradient-to-br from-primary via-primary to-primary/90 px-6 pt-6 pb-8 text-primary-foreground">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

                                    <div className="relative">
                                        <div className="flex items-center justify-between mb-2">
                                            {/* Queue Type Selector */}
                                            <button
                                                onClick={() => {
                                                    const otherType =
                                                        currentTicket.queueType ===
                                                        "BHYT"
                                                            ? "DV"
                                                            : "BHYT";
                                                    handleGetStatus(otherType);
                                                }}
                                                disabled={isLoading}
                                                className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all border border-white/30 hover:border-white/50"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {currentTicket.queueType ===
                                                    "BHYT" ? (
                                                        <Ticket
                                                            size={18}
                                                            className="text-white"
                                                        />
                                                    ) : (
                                                        <Users
                                                            size={18}
                                                            className="text-white"
                                                        />
                                                    )}
                                                    <span className="text-[15px] font-medium text-white">
                                                        {getQueueTypeText(
                                                            currentTicket.queueType
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 ml-2 pl-3 border-l border-white/70">
                                                    <RefreshCw
                                                        size={16}
                                                        className="text-white/90"
                                                    />
                                                    <span className="text-[15px] font-medium text-white/90">
                                                        Đổi
                                                    </span>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleGetStatus(
                                                        currentTicket.queueType
                                                    )
                                                }
                                                disabled={isLoading}
                                                className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors disabled:opacity-50"
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
                                            <p className="text-[16px] text-white/80 mb-3 uppercase tracking-wider font-medium">
                                                Số thứ tự của bạn
                                            </p>
                                            <div className="text-5xl font-bold mb-4 tracking-tight">
                                                {currentTicket.ticketCode}
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                                                <div
                                                    className={`w-2 h-2 rounded-full ${
                                                        currentTicket.ticketStatus ===
                                                        "CALLING"
                                                            ? "bg-green-400 animate-pulse"
                                                            : currentTicket.ticketStatus ===
                                                              "WAITING"
                                                            ? "bg-blue-300"
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

                                {/* Content - More Compact */}
                                <CardContent className="p-5 space-y-4">
                                    {/* Current Number - More Prominent */}
                                    <div className="p-4 rounded-xl bg-primary/5 border-l-4 border-primary">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                                                    <Activity
                                                        className="text-primary"
                                                        size={20}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-medium text-muted-foreground mb-0.5">
                                                        Đang gọi số
                                                    </p>
                                                    <p className="text-2xl font-bold text-primary">
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
                                                className="text-primary/50"
                                                size={24}
                                            />
                                        </div>
                                    </div>

                                    {/* Status-specific Content */}
                                    {currentTicket.ticketStatus ===
                                        "WAITING" && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-4 rounded-xl border-2 bg-background">
                                                <div className="flex items-center gap-2 mb-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <Users
                                                            size={14}
                                                            className="text-primary"
                                                        />
                                                    </div>
                                                    <p className="text-xs font-semibold text-muted-foreground">
                                                        Người chờ
                                                    </p>
                                                </div>
                                                <p className="text-3xl font-bold text-primary">
                                                    {
                                                        currentTicket.waitingBefore
                                                    }
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-xl border-2 bg-background">
                                                <div className="flex items-center gap-2 mb-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <Timer
                                                            size={14}
                                                            className="text-primary"
                                                        />
                                                    </div>
                                                    <p className="text-xs font-semibold text-muted-foreground">
                                                        Thời gian
                                                    </p>
                                                </div>
                                                <p className="text-3xl font-bold text-primary">
                                                    {
                                                        currentTicket.estimatedWaitMinutes
                                                    }
                                                    <span className="text-[14px] font-medium text-muted-foreground ml-1">
                                                        phút
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {currentTicket.ticketStatus ===
                                        "CALLING" && (
                                        <div className="p-4 rounded-xl bg-success/10 border-2 border-success/30">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-full bg-success flex items-center justify-center">
                                                    <AlertCircle
                                                        className="text-white"
                                                        size={22}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-success text-base mb-0.5">
                                                        Đến lượt bạn!
                                                    </p>
                                                    <p className="text-[14px] text-success/80">
                                                        Vui lòng vào phòng khám
                                                        ngay
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentTicket.ticketStatus ===
                                        "MISSED" && (
                                        <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center">
                                                    <AlertCircle
                                                        className="text-white"
                                                        size={22}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-amber-700 text-base mb-0.5">
                                                        Đã bỏ lỡ lượt khám
                                                    </p>
                                                    <p className="text-[14px] text-amber-600">
                                                        Vui lòng lấy số mới hoặc
                                                        liên hệ quầy
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Patient Info - Larger & More Prominent */}
                            <Card className="border-0 shadow-soft">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                                            <Users
                                                size={16}
                                                className="text-muted-foreground"
                                            />
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground tracking-wide">
                                            Thông tin bệnh nhân
                                        </h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                                            <span className="text-[14px] font-medium text-muted-foreground">
                                                Họ tên
                                            </span>
                                            <span className="text-[14px] font-semibold text-foreground">
                                                {
                                                    currentTicket.patientInfo
                                                        .fullName
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                                            <span className="text-[14px] font-medium text-muted-foreground">
                                                Điện thoại
                                            </span>
                                            <span className="text-[14px] font-semibold text-foreground">
                                                {
                                                    currentTicket.patientInfo
                                                        .phoneNumber
                                                }
                                            </span>
                                        </div>
                                        {currentTicket.patientInfo
                                            .nationalId && (
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                                                <span className="text-[14px] font-medium text-muted-foreground">
                                                    CMND/CCCD
                                                </span>
                                                <span className="text-[14px] font-semibold text-foreground">
                                                    {
                                                        currentTicket
                                                            .patientInfo
                                                            .nationalId
                                                    }
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                                            <span className="text-[14px] font-medium text-muted-foreground">
                                                Ngày khám
                                            </span>
                                            <span className="text-[14px] font-semibold text-foreground">
                                                {new Date(
                                                    currentTicket.visitDate
                                                ).toLocaleDateString("vi-VN")}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            {(currentTicket.ticketStatus === "WAITING" ||
                                currentTicket.ticketStatus === "MISSED") && (
                                <Button
                                    variant="outline"
                                    className="w-full h-12 rounded-xl border-2 font-medium"
                                    onClick={handleReissue}
                                    disabled={isLoading}
                                >
                                    <RefreshCw size={18} className="mr-2" />
                                    Lấy lại số thứ tự
                                </Button>
                            )}

                            {/* Notice - More Prominent */}
                            <Card className="border-0 shadow-sm bg-background/80">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <AlertCircle
                                                size={18}
                                                className="text-primary"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-foreground text-lg mb-2.5">
                                                Lưu ý quan trọng
                                            </h4>
                                            <div className="space-y-2 text-[14px] text-primary/70">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                    <p>
                                                        Chú ý màn hình và loa
                                                        gọi số tại khu vực chờ
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                    <p>
                                                        Có mặt khi đến lượt để
                                                        tránh bỏ lỡ
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                    <p>
                                                        Tự động cập nhật trạng
                                                        thái mỗi 30 giây
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default QueueManagement;
