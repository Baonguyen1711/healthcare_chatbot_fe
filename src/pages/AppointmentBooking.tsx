import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Phone, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const appointmentSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  department: z.string().min(1, "Vui lòng chọn khoa khám"),
  date: z.string().min(1, "Vui lòng chọn ngày khám"),
  time: z.string().min(1, "Vui lòng chọn giờ khám"),
  symptoms: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

const AppointmentBooking = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      department: "",
      date: "",
      time: "",
      symptoms: "",
    },
  });

  const departments = [
    "Nội khoa",
    "Ngoại khoa", 
    "Sản phụ khoa",
    "Nhi khoa",
    "Tai mũi họng",
    "Mắt",
    "Da liễu",
    "Răng hàm mặt",
    "Tim mạch",
    "Thần kinh"
  ];

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  const onSubmit = (data: AppointmentForm) => {
    console.log("Booking appointment:", data);
    setIsSubmitted(true);
    toast({
      title: "Đặt lịch thành công!",
      description: "Chúng tôi sẽ liên hệ xác nhận trong vòng 30 phút.",
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-elegant">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Đặt lịch thành công!
            </h2>
            <p className="text-muted-foreground mb-6">
              Chúng tôi sẽ liên hệ xác nhận lịch hẹn trong vòng 30 phút.
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
                Đặt lịch khác
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

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Calendar className="text-primary" size={32} />
              <h1 className="text-3xl font-bold text-foreground">Đặt lịch hẹn</h1>
            </div>
            <p className="text-muted-foreground">
              Đặt lịch khám với bác sĩ chuyên khoa nhanh chóng và tiện lợi
            </p>
          </div>

          <Card className="border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="text-primary" size={24} />
                Thông tin đặt lịch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ và tên *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập họ và tên" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại *</FormLabel>
                          <FormControl>
                            <Input placeholder="0901234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="example@email.com" {...field} />
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
                        <FormLabel>Khoa khám *</FormLabel>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày khám *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giờ khám *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn giờ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Triệu chứng (tùy chọn)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Mô tả ngắn gọn triệu chứng hoặc lý do khám"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" size="lg">
                    <Clock className="mr-2" size={20} />
                    Đặt lịch ngay
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="mt-6 border-0 bg-primary-light/5">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-3">Lưu ý quan trọng:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Vui lòng đến trước giờ hẹn 15 phút để làm thủ tục</li>
                <li>• Mang theo CMND/CCCD và thẻ bảo hiểm y tế (nếu có)</li>
                <li>• Liên hệ hotline 1900-xxx để thay đổi lịch hẹn</li>
                <li>• Phí khám sẽ được thông báo khi xác nhận lịch hẹn</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;