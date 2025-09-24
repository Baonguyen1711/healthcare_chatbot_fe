import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  ArrowLeft, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2,
  BarChart3,
  Users,
  TrendingUp
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const feedbackSchema = z.object({
  category: z.string().min(1, "Vui lòng chọn loại phản hồi"),
  rating: z.string().min(1, "Vui lòng đánh giá"),
  department: z.string().optional(),
  doctor: z.string().optional(),
  experience: z.string().min(10, "Vui lòng chia sẻ trải nghiệm chi tiết hơn"),
  improvement: z.string().optional(),
  recommend: z.string().min(1, "Vui lòng cho biết mức độ giới thiệu"),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

const FeedbackSurvey = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("feedback");
  const { toast } = useToast();
  
  const form = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: "",
      rating: "",
      department: "",
      doctor: "",
      experience: "",
      improvement: "",
      recommend: "",
    },
  });

  const categories = [
    "Chất lượng khám chữa bệnh",
    "Thái độ phục vụ",
    "Cơ sở vật chất",
    "Thủ tục hành chính",
    "Ứng dụng/Website",
    "Khác"
  ];

  const departments = [
    "Nội khoa", "Ngoại khoa", "Sản phụ khoa", "Nhi khoa", 
    "Tai mũi họng", "Mắt", "Da liễu", "Răng hàm mặt"
  ];

  const statistics = {
    totalFeedbacks: 2847,
    averageRating: 4.6,
    satisfactionRate: 92,
    responseRate: 78
  };

  const recentFeedbacks = [
    {
      category: "Chất lượng khám chữa bệnh",
      rating: 5,
      comment: "Bác sĩ rất tận tâm, khám kỹ lưỡng và giải thích rõ ràng.",
      date: "23/09/2024",
      department: "Nội khoa"
    },
    {
      category: "Thái độ phục vụ", 
      rating: 4,
      comment: "Nhân viên thân thiện, hỗ trợ nhiệt tình.",
      date: "22/09/2024",
      department: "Ngoại khoa"
    },
    {
      category: "Ứng dụng/Website",
      rating: 5,
      comment: "App rất tiện lợi, đặt lịch nhanh chóng.",
      date: "21/09/2024",
      department: "Nhi khoa"
    }
  ];

  const onSubmit = (data: FeedbackForm) => {
    console.log("Feedback submitted:", data);
    setIsSubmitted(true);
    toast({
      title: "Cảm ơn phản hồi của bạn!",
      description: "Ý kiến của bạn sẽ giúp chúng tôi cải thiện dịch vụ.",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={16} 
        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"} 
      />
    ));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-elegant">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Cảm ơn bạn!
            </h2>
            <p className="text-muted-foreground mb-6">
              Phản hồi của bạn đã được ghi nhận và sẽ giúp chúng tôi cải thiện chất lượng dịch vụ.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/">Về trang chủ</Link>
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsSubmitted(false)}
              >
                Gửi phản hồi khác
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <MessageSquare className="text-primary" size={32} />
              <h1 className="text-3xl font-bold text-foreground">Phản hồi & Khảo sát</h1>
            </div>
            <p className="text-muted-foreground">
              Chia sẻ trải nghiệm của bạn để giúp chúng tôi cải thiện chất lượng dịch vụ
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feedback">Gửi phản hồi</TabsTrigger>
              <TabsTrigger value="statistics">Thống kê</TabsTrigger>
            </TabsList>

            <TabsContent value="feedback">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle>Chia sẻ trải nghiệm của bạn</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Loại phản hồi *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại phản hồi" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="rating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Đánh giá tổng thể *</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <div key={rating} className="flex items-center space-x-2">
                                      <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                                      <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1">
                                        {rating} <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Khoa khám (tùy chọn)</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn khoa khám" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {departments.map((dept) => (
                                    <SelectItem key={dept} value={dept}>
                                      {dept}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="doctor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tên bác sĩ (tùy chọn)</FormLabel>
                              <FormControl>
                                <Input placeholder="Nhập tên bác sĩ" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chia sẻ trải nghiệm *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Hãy chia sẻ chi tiết về trải nghiệm của bạn..."
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="improvement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Đề xuất cải thiện (tùy chọn)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Bạn có đề xuất gì để chúng tôi cải thiện dịch vụ?"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="recommend"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bạn có giới thiệu dịch vụ cho người khác? *</FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-6">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="yes" id="recommend-yes" />
                                  <Label htmlFor="recommend-yes" className="flex items-center gap-2">
                                    <ThumbsUp size={16} className="text-success" />
                                    Có
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="no" id="recommend-no" />
                                  <Label htmlFor="recommend-no" className="flex items-center gap-2">
                                    <ThumbsDown size={16} className="text-destructive" />
                                    Không
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="maybe" id="recommend-maybe" />
                                  <Label htmlFor="recommend-maybe">Có thể</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" size="lg">
                        <MessageSquare className="mr-2" size={20} />
                        Gửi phản hồi
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statistics">
              <div className="space-y-6">
                {/* Statistics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-0 bg-primary/5">
                    <CardContent className="p-6 text-center">
                      <Users className="text-primary mx-auto mb-2" size={32} />
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {statistics.totalFeedbacks.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Tổng phản hồi</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-yellow-500/5">
                    <CardContent className="p-6 text-center">
                      <Star className="text-yellow-500 mx-auto mb-2 fill-current" size={32} />
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {statistics.averageRating}/5
                      </div>
                      <p className="text-sm text-muted-foreground">Đánh giá trung bình</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-success/5">
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="text-success mx-auto mb-2" size={32} />
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {statistics.satisfactionRate}%
                      </div>
                      <p className="text-sm text-muted-foreground">Mức độ hài lòng</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-primary-dark/5">
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="text-primary-dark mx-auto mb-2" size={32} />
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {statistics.responseRate}%
                      </div>
                      <p className="text-sm text-muted-foreground">Tỷ lệ phản hồi</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Feedbacks */}
                <Card className="border-0 shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="text-primary" size={24} />
                      Phản hồi gần đây
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentFeedbacks.map((feedback, index) => (
                        <div key={index} className="p-4 rounded-lg border">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{feedback.category}</Badge>
                              <Badge variant="secondary">{feedback.department}</Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStars(feedback.rating)}
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-2">{feedback.comment}</p>
                          <p className="text-xs text-muted-foreground">{feedback.date}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSurvey;