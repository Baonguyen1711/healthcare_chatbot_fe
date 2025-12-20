import { useState, useMemo, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Stethoscope,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { addDays, format } from "date-fns";
import { vi } from "date-fns/locale";

import { getHospitals,getDepartmentsByHospital,getDoctorsByDepartment,getDoctorSchedule,bookAppointment } from "../services/appointment-service";
import { v4 as uuidv4 } from "uuid";
// 🧾 Validation schema
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

interface Department {
  id: string;
  name: string;
  decription?: string;
  hospitalId: string;
  doctors: Doctor[];
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  departments: Department[];
}

export interface WorkingHours {
  start: string;
  end: string;
}

export interface DoctorSchedule {
  doctorId: string;
  hospitalId: string;
  date: string;
  availableSlots: string[];
  bookedSlots: string[];
  workingHours: WorkingHours;
  createdAt: string;
  updatedAt: string;
}

interface ScheduleByDate {
  date: string;
  slots: string[];
}

const AppointmentBooking = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");

  // 🧠 Sau này có thể truyền `hospitals` từ props hoặc gọi API riêng
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schedule, setSchedule] = useState<DoctorSchedule | null>(null);
  const [scheduleWeek, setScheduleWeek] = useState<ScheduleByDate[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await getHospitals();
        const hospitalData: Hospital[] = data.map((item: any) => ({
          id: item.hospitalId,
          name: item.name,
          address: item.address,
          departments: [],
        }));
        console.log('dâd',data)
        setHospitals(hospitalData); // 👉 res nên là mảng [{id, name, ...}]
      } catch (err) {
        console.error("Lỗi khi fetch hospitals:", err);
      }
    };

    fetchHospitals();
  }, []);



  useEffect(() => {
    if (!selectedHospital) {
      setDepartments([]);
      setSelectedDepartment("");
      setSelectedDoctor("");
      return;
    }
  
    const fetchDepartments = async () => {
      try {
        const data = await getDepartmentsByHospital(selectedHospital);
        const departmentData: Department[] = data.map((item: any) => ({
          id: item.departmentId,
          name: item.name,
          hospitalId: item.hospitalId,
          doctors: [],
        }));
        console.log(departmentData)
        setDepartments(departmentData); // ✅ res nên là array [{id, name, ...}]
      } catch (err) {
        console.error("Lỗi khi fetch departments:", err);
        setDepartments([]); // clear khi lỗi
      }
    };
  
    fetchDepartments();
  }, [selectedHospital]);

  useEffect(() => {
    if (!selectedDepartment) {
      setDoctors([]); // clear khi chưa chọn khoa
      return;
    }
  
    const fetchDoctors = async () => {
      try {
        const data = await getDoctorsByDepartment(selectedDepartment);
        console.log(data)
        const doctorData: Doctor[] = data.map((item: any) => ({
          id: item.doctorId,
          name: item.name,
          hospitalId: item.hospitalId
        }));
        setDoctors(doctorData);
      } catch (err) {
        console.error("Lỗi khi fetch doctors:", err);
        setDoctors([]); // clear khi lỗi
      }
    };
  
    fetchDoctors();
  }, [selectedDepartment]);

  useEffect(() => {
    if (!selectedDoctor) {
      setScheduleWeek([]);
      return;
    }
  
    const fetchScheduleWeek = async () => {
      try {
        const today = new Date();
        const schedules: ScheduleByDate[] = [];
  
        for (let i = 1; i <= 2; i++) {
          const day = addDays(today, i);
          const dateStr = format(day, "yyyy-MM-dd");
  
          try {
            const data = await getDoctorSchedule(selectedDoctor, dateStr);
            schedules.push({
              date: dateStr,
              slots: data?.availableSlots || [],
            });
          } catch (err) {
            // Nếu ngày đó không có lịch -> vẫn push rỗng để UI hiển thị
            schedules.push({
              date: dateStr,
              slots: [],
            });
          }
        }
  
        setScheduleWeek(schedules);
      } catch (error) {
        console.error("❌ Lỗi khi fetch lịch tuần:", error);
        setScheduleWeek([]);
      }
    };
  
    fetchScheduleWeek();
  }, [selectedDoctor]);
  

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

  // 🔸 Lấy hospital hiện tại
  const currentHospital = useMemo(
    () => hospitals.find((h) => h.id === selectedHospital),
    [selectedHospital, hospitals]
  );

  // 🔸 Lấy departments theo hospital
  const availableDepartments = useMemo(() => {
    if (!currentHospital) return [];
    return currentHospital.departments;
  }, [currentHospital]);

  // 🔸 Lấy doctors theo department
  const availableDoctors = useMemo(() => {
    const dept = currentHospital?.departments.find(
      (d) => d.id === selectedDepartment
    );
    return dept?.doctors || [];
  }, [currentHospital, selectedDepartment]);

  // 🔸 Lấy doctor hiện tại
  const currentDoctor = useMemo(
    () => availableDoctors.find((d) => d.id === selectedDoctor),
    [availableDoctors, selectedDoctor]
  );

  const onSubmit = async (data: AppointmentForm) => {
    try {
      const appointmentId = `APPT-${uuidv4()}`;
      const payload = {
        appointmentId: appointmentId,
        patientName: data.fullName,
        phone: data.phone,
        email: data.email,
        hospitalId: selectedHospital,
        departmentId: selectedDepartment,
        doctorId: selectedDoctor,
        date: data.date,
        time: data.time,
        symptoms: data.symptoms || "",
      };
  
      console.log("📤 Payload gửi đi:", payload);
      // 👉 Gọi API tạo lịch hẹn
      const res = await bookAppointment(payload);
      console.log(res)
      console.log("✅ Tạo lịch thành công:", res);
  
      toast({
        title: "Đặt lịch thành công!",
        description: `Lịch hẹn đã được xác nhận cho ${format(new Date(data.date), "dd/MM/yyyy")} lúc ${data.time}.`,
      });
  
      setIsSubmitted(true);
    } catch (error) {
      console.error("❌ Lỗi khi tạo lịch hẹn:", error);
      toast({
        title: "Lỗi khi đặt lịch!",
        description: "Vui lòng thử lại hoặc liên hệ tổng đài hỗ trợ.",
        variant: "destructive",
      });
    }
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
              <h1 className="text-3xl font-bold text-foreground">
                Đặt lịch hẹn
              </h1>
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
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Hospital */}
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
                                  <div className="font-medium">
                                    {hospital.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {hospital.address}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Department */}
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
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Doctor */}
                  {selectedDepartment && doctors.length > 0 && (
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
                              {doctors.map((doctor) => (
                                <SelectItem key={doctor.id} value={doctor.id}>
                                  <div className="flex items-center gap-2">
                                    <Stethoscope
                                      size={16}
                                      className="text-primary"
                                    />
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

                  {/* Slots */}
                  {selectedDoctor && (
                    <Card className="border-primary/20 bg-primary-light/5">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calendar size={18} className="text-primary" />
                          Lịch trống trong tuần 
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {scheduleWeek.map((scheduleDay) => {
                            const slotDate = new Date(scheduleDay.date);
                            const hasSlots = scheduleDay.slots.length > 0;

                            return (
                              <div
                                key={scheduleDay.date}
                                className="border rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <div className="font-semibold text-foreground">
                                      {format(slotDate, "EEEE, dd/MM", {
                                        locale: vi,
                                      })}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {format(slotDate, "yyyy")}
                                    </div>
                                  </div>
                                  {hasSlots ? (
                                    <Badge variant="default">
                                      {scheduleDay.slots.length} slot
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">Hết chỗ</Badge>
                                  )}
                                </div>
                                {hasSlots && (
                                  <div className="flex flex-wrap gap-2">
                                    {scheduleDay.slots.map((time) => {
                                      const isSelected =
                                        form.watch("date") === scheduleDay.date &&
                                        form.watch("time") === time;
                                      return (
                                        <Button
                                          key={time}
                                          type="button"
                                          size="sm"
                                          variant={
                                            isSelected ? "default" : "outline"
                                          }
                                          className="h-8"
                                          onClick={() => {
                                            form.setValue("date", scheduleDay.date);
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

                  {/* Hidden date & time */}
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

                  {/* Contact */}
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
                                <Input
                                  placeholder="Nhập họ và tên"
                                  {...field}
                                />
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
                              <Input
                                type="email"
                                placeholder="example@email.com"
                                {...field}
                              />
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
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
