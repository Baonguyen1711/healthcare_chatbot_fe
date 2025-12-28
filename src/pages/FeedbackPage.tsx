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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import {
    MessageSquare,
    Star,
    Upload,
    X,
    CheckCircle2,
    RefreshCw,
    History,
    Send,
    AlertCircle,
    Clock,
    Image as ImageIcon,
    ThumbsUp,
    ArrowLeft,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
    FeedbackService,
    type SubmitFeedbackInput,
    type FeedbackResponse,
    type FeedbackCategory,
    CATEGORY_LABELS,
    STATUS_CONFIG,
} from "@/services/feedbackService";

// Form Schema
const feedbackSchema = z.object({
    visitDate: z.string().min(1, "Vui lòng chọn ngày khám"),
    category: z.enum(
        [
            "SERVICE_QUALITY",
            "DOCTOR_EXPERTISE",
            "FACILITY",
            "WAIT_TIME",
            "STAFF_ATTITUDE",
            "CLEANLINESS",
            "OTHER",
        ] as const,
        {
            required_error: "Vui lòng chọn danh mục phản hồi",
        }
    ),
    rating: z.number().min(1, "Vui lòng chọn đánh giá sao").max(5),
    comment: z.string().min(10, "Nhận xét phải có ít nhất 10 ký tự"),
    doctorName: z.string().optional(),
    department: z.string().optional(),
    isAnonymous: z.boolean(),
}) as z.ZodType<Omit<SubmitFeedbackInput, "images">>;

type FeedbackForm = z.infer<typeof feedbackSchema>;

const FeedbackPage = () => {
    const [activeView, setActiveView] = useState<"submit" | "history">(
        "submit"
    );
    const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const { toast } = useToast();
    const feedbackService = new FeedbackService();

    const form = useForm<FeedbackForm>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: {
            visitDate: new Date().toISOString().split("T")[0],
            category: undefined,
            rating: 0,
            comment: "",
            doctorName: "",
            department: "",
            isAnonymous: false,
        },
    });

    const rating = form.watch("rating");

    // Load history when switching to history tab
    useEffect(() => {
        if (activeView === "history") {
            loadFeedbackHistory();
        }
    }, [activeView]);

    const loadFeedbackHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const result = await feedbackService.getUserFeedbacks();
            setFeedbacks(result);
        } catch (error: any) {
            toast({
                title: "Lỗi",
                description: error.message || "Không thể tải lịch sử phản hồi",
                variant: "destructive",
            });
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleSubmit = async (data: FeedbackForm) => {
        setIsLoading(true);
        try {
            await feedbackService.submitFeedback({
                ...data,
                images: images.length > 0 ? images : undefined,
            });

            toast({
                title: "Gửi phản hồi thành công!",
                description: "Cảm ơn bạn đã chia sẻ ý kiến",
            });

            // Reset form
            form.reset({
                visitDate: new Date().toISOString().split("T")[0],
                category: undefined,
                rating: 0,
                comment: "",
                doctorName: "",
                department: "",
                isAnonymous: false,
            });
            setImages([]);

            // Switch to history tab
            setActiveView("history");
        } catch (error: any) {
            toast({
                title: "Lỗi gửi phản hồi",
                description: error.message || "Đã có lỗi xảy ra",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        if (images.length + files.length > 5) {
            toast({
                title: "Vượt quá giới hạn",
                description: "Chỉ có thể tải lên tối đa 5 ảnh",
                variant: "destructive",
            });
            return;
        }

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Clock size={16} />;
            case "REVIEWED":
            case "RESOLVED":
                return <CheckCircle2 size={16} />;
            default:
                return <Clock size={16} />;
        }
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

                <div className="bg-gradient-soft mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft">
                                <MessageSquare
                                    className="text-primary-foreground"
                                    size={24}
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">
                                    Phản hồi & Đánh giá
                                </h1>
                                <p className="text-muted-foreground text-md mt-2">
                                    Ý kiến của bạn giúp chúng tôi cải thiện dịch
                                    vụ
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* View Tabs */}
                    <div className="flex gap-3 mb-8 p-1 bg-muted rounded-xl">
                        <button
                            onClick={() => setActiveView("submit")}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                                activeView === "submit"
                                    ? "bg-background shadow-soft text-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                            }`}
                        >
                            <Send size={18} />
                            <span>Gửi phản hồi</span>
                        </button>
                        <button
                            onClick={() => setActiveView("history")}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                                activeView === "history"
                                    ? "bg-background shadow-soft text-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                            }`}
                        >
                            <History size={18} />
                            <span>Lịch sử</span>
                        </button>
                    </div>

                    {/* Submit View */}
                    {activeView === "submit" && (
                        <Card className="border-0 shadow-elegant">
                            <CardHeader className="border-b">
                                <CardTitle className="text-xl font-semibold flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <MessageSquare
                                            className="text-primary"
                                            size={20}
                                        />
                                    </div>
                                    <span>Gửi phản hồi mới</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(
                                            handleSubmit
                                        )}
                                        className="space-y-5"
                                    >
                                        {/* Visit Date */}
                                        <FormField
                                            control={form.control}
                                            name="visitDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[14px] font-medium">
                                                        Ngày khám
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="date"
                                                            className="h-12 text-[14px]"
                                                            max={
                                                                new Date()
                                                                    .toISOString()
                                                                    .split(
                                                                        "T"
                                                                    )[0]
                                                            }
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Category */}
                                        <FormField
                                            control={form.control}
                                            name="category"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[14px] font-medium">
                                                        Danh mục phản hồi
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        value={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="h-12">
                                                                <SelectValue placeholder="Chọn danh mục..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-background text-[14px]">
                                                            {Object.entries(
                                                                CATEGORY_LABELS
                                                            ).map(
                                                                ([
                                                                    key,
                                                                    label,
                                                                ]) => (
                                                                    <SelectItem
                                                                        key={
                                                                            key
                                                                        }
                                                                        value={
                                                                            key
                                                                        }
                                                                    >
                                                                        <div className="flex items-center gap-2 py-1.5">
                                                                            <ThumbsUp
                                                                                size={
                                                                                    16
                                                                                }
                                                                                className="text-primary"
                                                                            />
                                                                            <span className="text-[14px]">
                                                                                {
                                                                                    label
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Rating */}
                                        <FormField
                                            control={form.control}
                                            name="rating"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[14px] font-medium">
                                                        Đánh giá của bạn
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {[
                                                                1, 2, 3, 4, 5,
                                                            ].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        field.onChange(
                                                                            star
                                                                        )
                                                                    }
                                                                    className="transition-transform hover:scale-110"
                                                                >
                                                                    <Star
                                                                        size={
                                                                            36
                                                                        }
                                                                        className={cn(
                                                                            "transition-colors",
                                                                            star <=
                                                                                rating
                                                                                ? "fill-yellow-400 text-yellow-400"
                                                                                : "text-gray-300"
                                                                        )}
                                                                    />
                                                                </button>
                                                            ))}
                                                            <span className="ml-2 text-sm text-muted-foreground">
                                                                {rating > 0
                                                                    ? `${rating} sao`
                                                                    : "Chọn số sao"}
                                                            </span>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Doctor & Department */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="doctorName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[14px] font-medium text-muted-foreground">
                                                            Tên bác sĩ (tùy
                                                            chọn)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="BS. Nguyễn Văn A"
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
                                                name="department"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[14px] font-medium text-muted-foreground">
                                                            Khoa (tùy chọn)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="VD: Nội khoa"
                                                                className="h-12 text-[14px]"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Comment */}
                                        <FormField
                                            control={form.control}
                                            name="comment"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[14px] font-medium">
                                                        Nhận xét chi tiết
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ khám chữa bệnh..."
                                                            className="min-h-[120px] text-[14px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {field.value.length} /
                                                        2000 ký tự
                                                    </p>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Images Upload */}
                                        <div>
                                            <FormLabel className="text-[14px] font-medium">
                                                Đính kèm ảnh (tối đa 5 ảnh)
                                            </FormLabel>
                                            <div className="mt-2">
                                                <label
                                                    htmlFor="image-upload"
                                                    className="inline-flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                                                >
                                                    <Upload size={20} />
                                                    <span className="text-sm">
                                                        Chọn ảnh
                                                    </span>
                                                </label>
                                                <input
                                                    id="image-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                            </div>

                                            {images.length > 0 && (
                                                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                                                    {images.map(
                                                        (img, index) => (
                                                            <div
                                                                key={index}
                                                                className="relative group"
                                                            >
                                                                <img
                                                                    src={img}
                                                                    alt={`Upload ${
                                                                        index +
                                                                        1
                                                                    }`}
                                                                    className="w-full h-24 object-cover rounded-lg border-2"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeImage(
                                                                            index
                                                                        )
                                                                    }
                                                                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                                >
                                                                    <X
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                </button>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Anonymous Checkbox */}
                                        <FormField
                                            control={form.control}
                                            name="isAnonymous"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-3 p-4 rounded-xl border-2 bg-muted/30">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={
                                                                    field.value
                                                                }
                                                                onCheckedChange={
                                                                    field.onChange
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-[14px] font-medium cursor-pointer">
                                                            Gửi phản hồi ẩn danh
                                                        </FormLabel>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Submit Button */}
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
                                                    Đang gửi
                                                </>
                                            ) : (
                                                <>
                                                    <Send
                                                        size={20}
                                                        className="mr-2"
                                                    />
                                                    Gửi phản hồi
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    )}

                    {/* History View */}
                    {activeView === "history" && (
                        <div className="space-y-6">
                            {isLoadingHistory ? (
                                <Card className="border-0 shadow-elegant">
                                    <CardContent className="flex items-center justify-center py-12">
                                        <RefreshCw
                                            className="animate-spin text-primary mr-3"
                                            size={24}
                                        />
                                        <span className="text-muted-foreground">
                                            Đang tải lịch sử...
                                        </span>
                                    </CardContent>
                                </Card>
                            ) : feedbacks.length === 0 ? (
                                <Card className="border-0 shadow-elegant">
                                    <CardContent className="text-center py-12">
                                        <History
                                            className="mx-auto text-muted-foreground mb-3"
                                            size={48}
                                        />
                                        <p className="text-muted-foreground mb-2 text-[14px]">
                                            Bạn chưa có phản hồi nào
                                        </p>
                                        <p className="text-[14px] text-muted-foreground">
                                            Hãy chia sẻ trải nghiệm của bạn
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    {feedbacks.map((feedback) => (
                                        <Card
                                            key={feedback.feedbackId}
                                            className="border-0 shadow-elegant overflow-hidden"
                                        >
                                            {/* Header with gradient */}
                                            <div className="relative bg-gradient-to-br from-primary via-primary to-primary/90 p-6 text-primary-foreground">
                                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
                                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

                                                <div className="relative">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-white/20 text-white px-4 py-2 text-[14px] border-white/30"
                                                            >
                                                                {
                                                                    CATEGORY_LABELS[
                                                                        feedback
                                                                            .category
                                                                    ]
                                                                }
                                                            </Badge>
                                                            {feedback.isAnonymous && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-white/20 text-white px-4 py-2 text-[14px] border-white/30"
                                                                >
                                                                    Ẩn danh
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="text-center">
                                                            <p className="text-[16px] font-medium text-white mb-1">
                                                                Ngày khám:{" "}
                                                                {new Date(
                                                                    feedback.visitDate
                                                                ).toLocaleDateString(
                                                                    "vi-VN"
                                                                )}
                                                            </p>
                                                            {(feedback.doctorName ||
                                                                feedback.department) && (
                                                                <p className="text-[14px] text-[#00ff97] font-medium">
                                                                    {feedback.doctorName &&
                                                                        `BS: ${feedback.doctorName}`}
                                                                    {feedback.doctorName &&
                                                                        feedback.department &&
                                                                        " • "}
                                                                    {feedback.department &&
                                                                        `Khoa: ${feedback.department}`}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {Array.from({
                                                                length: 5,
                                                            }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={25}
                                                                    className={cn(
                                                                        i <
                                                                            feedback.rating
                                                                            ? "fill-yellow-300 text-yellow-300"
                                                                            : "text-white/30"
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <CardContent className="p-5 space-y-4">
                                                <div className="p-4 rounded-xl bg-muted/60">
                                                    <p className="text-[14px] text-foreground">
                                                        {feedback.comment}
                                                    </p>
                                                </div>

                                                {/* Images */}
                                                {feedback.images &&
                                                    feedback.images.length >
                                                        0 && (
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {feedback.images.map(
                                                                (
                                                                    img,
                                                                    index
                                                                ) => (
                                                                    <img
                                                                        key={
                                                                            index
                                                                        }
                                                                        src={
                                                                            img
                                                                        }
                                                                        alt={`Feedback ${
                                                                            index +
                                                                            1
                                                                        }`}
                                                                        className="w-full h-20 object-cover rounded-lg border"
                                                                    />
                                                                )
                                                            )}
                                                        </div>
                                                    )}

                                                {/* Admin Note */}
                                                {feedback.adminNote && (
                                                    <>
                                                        <Separator />
                                                        <div className="p-4 rounded-xl bg-primary/5 border-l-4 border-primary">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                    <CheckCircle2
                                                                        className="text-primary"
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-xs font-semibold text-primary mb-1">
                                                                        Phản hồi
                                                                        từ bệnh
                                                                        viện:
                                                                    </p>
                                                                    <p className="text-[14px] text-foreground">
                                                                        {
                                                                            feedback.adminNote
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {/* Timestamp */}
                                                <div className="text-sm text-muted-foreground">
                                                    Gửi lúc:{" "}
                                                    {new Date(
                                                        feedback.createdAt
                                                    ).toLocaleString("vi-VN")}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </>
                            )}
                        </div>
                    )}

                    {/* Info Notice */}
                    <Card className="border-0 shadow-sm bg-background/80 mt-6">
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
                                                Mọi phản hồi sẽ được xem xét
                                                trong vòng 24-48 giờ
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                            <p>
                                                Thông tin của bạn được bảo mật
                                                tuyệt đối
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                            <p>
                                                Bạn có thể chọn gửi phản hồi ẩn
                                                danh
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPage;
