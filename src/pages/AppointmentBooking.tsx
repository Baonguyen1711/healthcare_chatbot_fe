import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, ArrowLeft, CheckCircle2, Building2, Stethoscope } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format, addDays } from "date-fns";
import { vi } from "date-fns/locale";

const appointmentSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  hospital: z.string().min(1, "Vui lòng chọn bệnh viện"),
  department: z.string().min(1, "Vui lòng chọn khoa khám"),
  doctor: z.string().min(1, "Vui lòng chọn bác sĩ"),
  date: z.string().min(1, "Vui lòng chọn ngày khám"),
  time: z.string().min(1, "Vui lòng chọn giờ khám"),
  symptoms: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

interface Doctor {
  id: string;
  name: string;
  department: string;
  availableSlots: {
    date: string;
    times: string[];
  }[];
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  doctors: Doctor[];
}

const hospitals: Hospital[] = [
  {
    id: "bv1",
    name: "Bệnh viện Đa khoa Trung ương",
    address: "123 Đường Nguyễn Huệ, Q.1, TP.HCM",
    doctors: [
      {
        id: "bs1",
        name: "BS. Nguyễn Văn A",
        department: "Tim mạch",
        availableSlots: Array.from({ length: 7 }, (_, i) => ({
          date: format(addDays(new Date(), i), "yyyy-MM-dd"),
          times: i % 2 === 0 ? ["08:00", "09:00", "10:00", "14:00", "15:00"] : ["08:30", "09:30", "14:30", "15:30"]
        }))
      },
      {
        id: "bs2",
        name: "BS. Trần Thị B",
        department: "Nội khoa",
        availableSlots: Array.from({ length: 7 }, (_, i) => ({
          date: format(addDays(new Date(), i), "yyyy-MM-dd"),
          times: i % 2 === 0 ? ["08:00", "08:30", "09:00", "14:00"] : ["09:00", "10:00", "15:00", "16:00"]
        }))
      },
      {
        id: "bs3",
        name: "BS. Lê Văn C",
        department: "Nhi khoa",
        availableSlots: Array.from({ length: 7 }, (_, i) => ({
          date: format(addDays(new Date(), i), "yyyy-MM-dd"),
          times: ["08:00", "09:00", "10:00", "14:00", "15:00"]
        }))
      }
    ]
  },
  {
    id: "bv2",
    name: "Phòng khám Đa khoa Gia Đình",
    address: "456 Lê Lợi, Q.3, TP.HCM",
    doctors: [
      {
        id: "bs4",
        name: "BS. Phạm Thị D",
        department: "Da liễu",
        availableSlots: Array.from({ length: 7 }, (_, i) => ({
          date: format(addDays(new Date(), i), "yyyy-MM-dd"),
          times: ["08:00", "09:00", "10:00", "14:00"]
        }))
      },
      {
        id: "bs5",
        name: "BS. Hoàng Văn E",
        department: "Tai mũi họng",
        availableSlots: Array.from({ length: 7 }, (_, i) => ({
          date: format(addDays(new Date(), i), "yyyy-MM-dd"),
          times: i < 5 ? ["08:30", "09:30", "14:30", "15:30"] : []
        }))
      }
    ]
  },
  {
    id: "bv3",
    name: "Bệnh viện Nhi Đồng 1",
    address: "789 Trần Hưng Đạo, Q.5, TP.HCM",
    doctors: [
      {
        id: "bs6",
        name: "BS. Võ Thị F",
        department: "Nhi khoa",
        availableSlots: Array.from({ length: 7 }, (_, i) => ({
          date: format(addDays(new Date(), i), "yyyy-MM-dd"),
          times: ["08:00", "08:30", "09:00", "09:30", "14:00", "14:30"]
        }))
      }
    ]
  }
];

const AppointmentBooking = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const { toast } = useToast();
  
  const form = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      hospital: "",
      department: "",
      doctor: "",
      date: "",
      time: "",
      symptoms: "",
    },
  });

  // Get selected hospital data
  const currentHospital = useMemo(() => 
    hospitals.find(h => h.id === selectedHospital),
    [selectedHospital]
  );

  // Get available departments from selected hospital
  const availableDepartments = useMemo(() => {
    if (!currentHospital) return [];
    const depts = [...new Set(currentHospital.doctors.map(d => d.department))];
    return depts;
  }, [currentHospital]);

  // Get doctors by selected department
  const availableDoctors = useMemo(() => {
    if (!currentHospital || !selectedDepartment) return [];
    return currentHospital.doctors.filter(d => d.department === selectedDepartment);
  }, [currentHospital, selectedDepartment]);

  // Get selected doctor data
  const currentDoctor = useMemo(() => 
    availableDoctors.find(d => d.id === selectedDoctor),
    [availableDoctors, selectedDoctor]
  );

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
                <Building2 className="text-primary" size={24} />
                Chọn bệnh viện & Bác sĩ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Hospital Selection */}
                  <FormField
                    control={form.control}
                    name="hospital"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bệnh viện / Phòng khám *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedHospital(value);
                            setSelectedDepartment("");
                            setSelectedDoctor("");
                            form.setValue("department", "");
                            form.setValue("doctor", "");
                            form.setValue("date", "");
                            form.setValue("time", "");
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn bệnh viện / phòng khám" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background">
                            {hospitals.map((hospital) => (
                              <SelectItem key={hospital.id} value={hospital.id}>
                                <div>
                                  <div className="font-medium">{hospital.name}</div>
                                  <div className="text-xs text-muted-foreground">{hospital.address}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Department Selection - Only show when hospital is selected */}
                  {selectedHospital && (
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Khoa khám *</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedDepartment(value);
                              setSelectedDoctor("");
                              form.setValue("doctor", "");
                              form.setValue("date", "");
                              form.setValue("time", "");
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn khoa khám" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-background">
                              {availableDepartments.map((dept) => (
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
                  )}

                  {/* Doctor Selection - Only show when department is selected */}
                  {selectedDepartment && availableDoctors.length > 0 && (
                    <FormField
                      control={form.control}
                      name="doctor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bác sĩ *</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedDoctor(value);
                              form.setValue("date", "");
                              form.setValue("time", "");
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn bác sĩ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-background">
                              {availableDoctors.map((doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  <div className="flex items-center gap-2">
                                    <Stethoscope size={16} className="text-primary" />
                                    {doctor.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Available Slots - Show when doctor is selected */}
                  {currentDoctor && (
                    <Card className="border-primary/20 bg-primary-light/5">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calendar size={18} className="text-primary" />
                          Lịch trống trong tuần ({currentDoctor.name})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {currentDoctor.availableSlots.map((slot) => {
                            const slotDate = new Date(slot.date);
                            const hasSlots = slot.times.length > 0;
                            
                            return (
                              <div key={slot.date} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <div className="font-semibold text-foreground">
                                      {format(slotDate, "EEEE, dd/MM", { locale: vi })}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {format(slotDate, "yyyy")}
                                    </div>
                                  </div>
                                  {hasSlots ? (
                                    <Badge variant="default">{slot.times.length} slot</Badge>
                                  ) : (
                                    <Badge variant="secondary">Hết chỗ</Badge>
                                  )}
                                </div>
                                {hasSlots && (
                                  <div className="flex flex-wrap gap-2">
                                    {slot.times.map((time) => {
                                      const isSelected = form.watch("date") === slot.date && form.watch("time") === time;
                                      return (
                                        <Button
                                          key={time}
                                          type="button"
                                          size="sm"
                                          variant={isSelected ? "default" : "outline"}
                                          className="h-8"
                                          onClick={() => {
                                            form.setValue("date", slot.date);
                                            form.setValue("time", time);
                                          }}
                                        >
                                          <Clock size={14} className="mr-1" />
                                          {time}
                                        </Button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Hidden fields for date and time (required for validation) */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <User size={20} className="text-primary" />
                      Thông tin liên hệ
                    </h3>
                    <div className="space-y-4">
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
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={!form.watch("date") || !form.watch("time")}
                  >
                    <Clock className="mr-2" size={20} />
                    Xác nhận đặt lịch
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