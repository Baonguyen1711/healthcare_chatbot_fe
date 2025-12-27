import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Pill, Plus, ArrowLeft, Clock, Bell, Trash2, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ReminderService } from "@/services/reminder";

// SỬA SCHEMA: time -> times (mảng) để đáp ứng yêu cầu nhập nhiều giờ
const medicationSchema = z.object({
  name: z.string().min(1, "Tên thuốc không được để trống"),
  dosage: z.string().min(1, "Liều lượng không được để trống"),
  frequency: z.string().min(1, "Vui lòng chọn tần suất"),
  times: z.array(z.string()).min(1, "Vui lòng nhập thời gian"),
  withFood: z.boolean().default(false),
});

type MedicationForm = z.infer<typeof medicationSchema>;

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string; // Trong data thuốc vẫn giữ time đơn lẻ để dễ quản lý
  withFood: boolean;
  isActive: boolean;
  nextDose: string;
  lastTakenDate?: string; 
}

const MedicationReminder = () => {
  const reminderService = new ReminderService()
  
  // Giữ nguyên logic tính toán của bạn bạn
  const calculateNextDose = (time: string): string => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    // Tạo mốc thời gian của thuốc trong hôm nay
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // Nếu giờ thuốc nhỏ hơn giờ hiện tại -> đã qua -> là ngày mai
    if (scheduledTime < now) {
      return `${time} ngày mai`;
    }
    return `${time} hôm nay`;
  };

  const [medications, setMedications] = useState<Medication[]>([
  ]);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const form = useForm<MedicationForm>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "once-day",
      times: ["08:00"], // Mặc định 1 giờ
      withFood: false,
    },
  });

  const frequencies = [
    { value: "once-day", label: "1 lần/ngày", count: 1 },
    { value: "twice-day", label: "2 lần/ngày", count: 2 },
    { value: "3-times-day", label: "3 lần/ngày", count: 3 },
    { value: "4-times-day", label: "4 lần/ngày", count: 4 },
    { value: "as-needed", label: "Khi cần thiết", count: 0 },
  ];

  // --- LOGIC MỚI: Tự động cập nhật số ô nhập giờ (Yêu cầu của bạn) ---
  const selectedFrequency = form.watch("frequency");
  useEffect(() => {
    const count = frequencies.find(f => f.value === selectedFrequency)?.count || 1;
    const currentTimes = form.getValues("times");
    // Nếu số ô nhập không khớp với tần suất thì reset lại mảng times
    if (currentTimes.length !== count && count > 0) {
        const newTimes = Array(count).fill("").map((_, i) => currentTimes[i] || "08:00");
        form.setValue("times", newTimes);
    }
  }, [selectedFrequency, form]);

  // --- LOGIC MỚI: Tải API & Check cuối ngày (Yêu cầu của bạn) ---
  useEffect(() => {
    const fetchDataAndCheck = async () => {
        try {
            // Gọi API getReminder (đã mở trong service)
            const data = await reminderService.getReminder();
            if (Array.isArray(data)) {
                setMedications(data as Medication[]);

                // Logic check cuối ngày (sau 21h)
                const now = new Date();
                if (now.getHours() >= 21) {
                    const todayStr = now.toDateString();
                    // Lọc thuốc cần uống hôm nay nhưng chưa uống (active + chưa có lastTakenDate hôm nay)
                    const missed = (data as Medication[]).filter(m => m.isActive && m.lastTakenDate !== todayStr);
                    
                    // Kiểm tra session để không báo lặp lại liên tục
                    if (sessionStorage.getItem("lastCheck") !== todayStr) {
                         if (missed.length === 0 && data.length > 0) {
                             new Notification("Tổng kết cuối ngày", { body: "Bạn đã uống đủ thuốc. Tuyệt vời! 🎉" });
                         } else if (missed.length > 0) {
                             new Notification("Nhắc nhở cuối ngày", { body: `Bạn chưa uống ${missed.length} liều thuốc hôm nay!` });
                         }
                         sessionStorage.setItem("lastCheck", todayStr);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    };
    fetchDataAndCheck();
  }, []); // Chạy 1 lần khi vào trang

  // Giữ nguyên Logic kiểm tra và thông báo local (Code của bạn bạn)
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); 
      const todayStr = now.toDateString();

      medications.forEach((med) => {
        const isTakenToday = med.lastTakenDate === todayStr;

        // Chỉ báo khi: Đúng giờ + Đang bật + CHƯA uống hôm nay
        if (med.time === currentTime && med.isActive && !isTakenToday) {
           new Notification("💊 Đến giờ uống thuốc!", {
             body: `Đừng quên uống: ${med.name} - ${med.dosage}`,
             icon: "/vite.svg"
           });

           toast({
             title: "Nhắc nhở",
             description: `Đã đến giờ uống ${med.name}`,
             className: "bg-red-500 text-white border-none"
           });
        }
      });
    }, 5000); // Check mỗi 5 giây để đảm bảo bắt đúng giờ

    return () => clearInterval(interval);
  }, [medications, toast]);

  // SỬA: Hàm onSubmit để xử lý nhiều giờ + Gọi API
  const onSubmit = async (data: MedicationForm) => {
    // Duyệt qua từng giờ trong mảng times
    for (const time of data.times) {
        // 1. Tạo object thuốc
        const newMedication: Medication = {
            id: Date.now().toString() + Math.random().toString(), 
            name: data.name,
            dosage: data.dosage,
            frequency: data.frequency,
            time: time, 
            withFood: data.withFood,
            isActive: true,
            nextDose: calculateNextDose(time)
        };

        // 2. Cập nhật UI ngay lập tức
        setMedications(prev => [...prev, newMedication]);

        // 3. Gọi API Create (Thêm của bạn)
try {
    const service = new ReminderService();
    const currentMedicineIds = medications.map((item) => item.id);
    
    if (currentMedicineIds.length > 0) {
        await service.syncMedicineToStorage(currentMedicineIds);
    }
} catch (error) {
    console.error(error);
}

    setShowForm(false);
    form.reset();
    toast({
      title: "Thêm thuốc thành công!",
      description: `Đã thêm lịch nhắc.`,
    });
  };

  // SỬA: Thêm gọi API update vào toggle
  const toggleMedication = async (id: string) => {
    const med = medications.find(m => m.id === id);
    if (med) {
        const updated = { ...med, isActive: !med.isActive };
        // Gọi API
        await reminderService.updateReminder(id, updated).catch(console.error);
        // Update State
        setMedications(meds => meds.map(m => m.id === id ? updated : m));
    }
  };

  // SỬA: Thêm gọi API delete
  const deleteMedication = async (id: string) => {
    await reminderService.deleteReminder(id).catch(console.error);
    setMedications(medications.filter(med => med.id !== id));
    toast({
      title: "Đã xóa thuốc",
      description: "Lời nhắc uống thuốc đã được hủy.",
    });
  };

  // SỬA: Thêm gọi API update khi uống
  const markAsTaken = async (id: string) => {
    const med = medications.find(m => m.id === id);
    if (med) {
        const updatedMed = { 
            ...med, 
            lastTakenDate: new Date().toDateString(),
            nextDose: calculateNextDose(med.time)
        };
        // Gọi API
        await reminderService.updateReminder(id, updatedMed).catch(console.error);

        setMedications(meds => meds.map(m => m.id === id ? updatedMed : m));
        toast({
          title: "Đã uống thuốc!",
          description: "Cảm ơn bạn đã tuân thủ đúng giờ. Hệ thống sẽ ngừng nhắc nhở hôm nay.",
          className: "bg-green-600 text-white border-none"
        });
    }
  };

  // Helper check xem hôm nay đã uống chưa để render UI
  const isTakenToday = (med: Medication) => {
      return med.lastTakenDate === new Date().toDateString();
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Pill className="text-success" size={32} />
              <h1 className="text-3xl font-bold text-foreground">Nhắc uống thuốc</h1>
            </div>
            <p className="text-muted-foreground">
              Theo dõi và nhắc nhở uống thuốc đúng giờ, tuân thủ đúng liều lượng
            </p>
          </div>

          {/* Today's Medications */}
          <Card className="mb-6 border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="text-primary" size={24} />
                Thuốc cần uống hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.filter(med => med.isActive).map((medication) => {
                  const taken = isTakenToday(medication);
                  return (
                    <div key={medication.id} className={`flex items-center justify-between p-4 rounded-lg border ${taken ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                        <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${taken ? 'bg-green-100' : 'bg-blue-100'}`}>
                            <Pill className={taken ? 'text-green-600' : 'text-blue-600'} size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">{medication.name}</h3>
                                {taken && <Badge className="bg-green-600">Đã uống</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">
                            {medication.dosage} • {frequencies.find(f => f.value === medication.frequency)?.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                            Lần tiếp theo: {medication.nextDose}
                            {medication.withFood && " • Uống cùng thức ăn"}
                            </p>
                        </div>
                        </div>
                        
                        {!taken ? (
                            <Button
                            size="sm"
                            onClick={() => markAsTaken(medication.id)}
                            className="flex items-center gap-2"
                            >
                            <CheckCircle2 size={16} />
                            Xác nhận
                            </Button>
                        ) : (
                            <Button variant="ghost" disabled className="text-green-600">
                                <CheckCircle2 size={16} className="mr-1"/> Hoàn thành
                            </Button>
                        )}
                    </div>
                  );
                })}
                {medications.filter(med => med.isActive).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Pill size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Chưa có thuốc nào được thiết lập nhắc nhở</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* All Medications */}
          <Card className="mb-6 border-0 shadow-elegant">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="text-primary" size={24} />
                  Tất cả thuốc đang theo dõi
                </CardTitle>
                <Button onClick={() => setShowForm(true)}>
                  <Plus size={20} className="mr-2" />
                  Thêm thuốc
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.map((medication) => (
                  <div key={medication.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={medication.isActive}
                        onCheckedChange={() => toggleMedication(medication.id)}
                      />
                      <div>
                        <h3 className="font-semibold text-foreground">{medication.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {medication.dosage} • {frequencies.find(f => f.value === medication.frequency)?.label} • {medication.time}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={medication.isActive ? "default" : "secondary"}>
                            {medication.isActive ? "Đang hoạt động" : "Tạm dừng"}
                          </Badge>
                          {medication.withFood && (
                            <Badge variant="outline">Uống cùng thức ăn</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMedication(medication.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Medication Form */}
          {showForm && (
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle>Thêm thuốc mới</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên thuốc *</FormLabel>
                            <FormControl>
                              <Input placeholder="VD: Paracetamol" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dosage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Liều lượng *</FormLabel>
                            <FormControl>
                              <Input placeholder="VD: 500mg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tần suất *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn tần suất" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {frequencies.map((freq) => (
                                  <SelectItem key={freq.value} value={freq.value}>
                                    {freq.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    {/* THAY ĐỔI Ở ĐÂY: Dùng .map để render nhiều ô nhập giờ dựa trên mảng times */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {form.watch("times").map((_, index) => (
                            <FormField key={index} control={form.control} name={`times.${index}`} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Thời gian lần {index + 1}</FormLabel>
                                    <FormControl><Input type="time" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        ))}
                    </div>

                    <FormField
                      control={form.control}
                      name="withFood"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Uống cùng thức ăn
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Bật tính năng này nếu thuốc cần uống cùng bữa ăn
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1">
                        Thêm thuốc
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        className="flex-1"
                      >
                        Hủy
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="border-0 bg-success/5">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-success mb-2">
                  {medications.filter(m => m.isActive).length}
                </div>
                <p className="text-sm text-muted-foreground">Thuốc đang theo dõi</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-primary/5">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">95%</div>
                <p className="text-sm text-muted-foreground">Tỷ lệ tuân thủ</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-primary-dark/5">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary-dark mb-2">12</div>
                <p className="text-sm text-muted-foreground">Lần uống tuần này</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
}
export default MedicationReminder;