import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Pill, Plus, ArrowLeft, Clock, Bell, Trash2, CheckCircle2, PartyPopper, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import urlBase64ToUint8Array from "@/utils/convertToIntArray";
import { ReminderService } from "@/services/reminder";

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
  time: string;
  withFood: boolean;
  isActive: boolean;
  nextDose: string;
  lastTakenDate?: string;
}

const MedicationReminder = () => {
  const reminderService = new ReminderService();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const form = useForm<MedicationForm>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "once-day",
      times: ["08:00"],
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

  const selectedFrequency = form.watch("frequency");
  useEffect(() => {
    const count = frequencies.find(f => f.value === selectedFrequency)?.count || 1;
    const currentTimes = form.getValues("times");
    if (currentTimes.length !== count && count > 0) {
        const newTimes = Array(count).fill("").map((_, i) => currentTimes[i] || "08:00");
        form.setValue("times", newTimes);
    }
  }, [selectedFrequency, form]);

  useEffect(() => {
    const fetchReminders = async () => {
        try {
            const data = await reminderService.getReminders();
            if (Array.isArray(data)) {
                setMedications(data as Medication[]); 
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        }
    };
    fetchReminders();
  }, []);

  const calculateNextDose = (time: string): string => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);
    return scheduledTime < now ? `${time} ngày mai` : `${time} hôm nay`;
  };

  const registerPushNotification = async (time: string) => {
    try {
        let permission = Notification.permission;
        if (permission === "default") permission = await Notification.requestPermission();
        if (permission !== "granted") return null;

        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if(vapidKey) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidKey),
                });
            }
        }

        if (subscription) {
            const now = new Date();
            const [hours, minutes] = time.split(':').map(Number);
            const notifyDate = new Date();
            notifyDate.setHours(hours, minutes, 0, 0);
            if (notifyDate < now) notifyDate.setDate(notifyDate.getDate() + 1);

            return {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey("p256dh") as ArrayBuffer))),
                    auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey("auth") as ArrayBuffer))),
                },
                notifyAt: notifyDate.toISOString()
            };
        }
    } catch (error) {
        console.error("Push Notification Error:", error);
    }
    return null;
  };

  const onSubmit = async (data: MedicationForm) => {
    const newMedicationsToAdd: Medication[] = [];
    for (const time of data.times) {
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
        newMedicationsToAdd.push(newMedication);

        const pushData = await registerPushNotification(time);
        if (pushData) {
            await reminderService.createReminder(pushData).catch(console.error);
        }
    }

    setMedications(prev => [...prev, ...newMedicationsToAdd]);
    setShowForm(false);
    form.reset();
    toast({ title: "Thành công", description: "Đã thêm lịch nhắc nhở." });
  };

  const toggleMedication = async (id: string) => {
    const med = medications.find(m => m.id === id);
    if (med) {
        const updated = { ...med, isActive: !med.isActive };
        await reminderService.updateReminder(id, updated).catch(console.error);
        setMedications(meds => meds.map(m => m.id === id ? updated : m));
    }
  };

  const deleteMedication = async (id: string) => {
    await reminderService.deleteReminder(id).catch(console.error);
    setMedications(medications.filter(med => med.id !== id));
    toast({ title: "Đã xóa", description: "Đã hủy lịch nhắc." });
  };

  const markAsTaken = async (id: string) => {
    const med = medications.find(m => m.id === id);
    if(med) {
        const updatedMed = { 
            ...med, 
            lastTakenDate: new Date().toDateString(),
            nextDose: calculateNextDose(med.time)
        };
        await reminderService.updateReminder(id, updatedMed).catch(console.error);
        setMedications(meds => meds.map(m => m.id === id ? updatedMed : m));
        toast({ title: "Tuyệt vời", description: "Đã ghi nhận uống thuốc!", className: "bg-green-600 text-white" });
    }
  };

  // --- LOGIC MỚI: TỔNG KẾT CUỐI NGÀY (Daily Summary) ---
  useEffect(() => {
    // Hàm kiểm tra và bắn thông báo
    const checkEndOfDaySummary = () => {
        const now = new Date();
        const currentHour = now.getHours();
        
        // Chỉ chạy kiểm tra sau 21:00 (9 giờ tối)
        if (currentHour >= 21) {
            const todayStr = now.toDateString();
            const lastSummaryDate = localStorage.getItem("lastSummaryDate");

            // Nếu hôm nay chưa báo cáo thì mới báo (tránh báo lặp lại mỗi giây)
            if (lastSummaryDate !== todayStr) {
                const activeMeds = medications.filter(m => m.isActive);
                if (activeMeds.length === 0) return;

                const missedMeds = activeMeds.filter(m => m.lastTakenDate !== todayStr);

                if (missedMeds.length === 0) {
                    // TRƯỜNG HỢP 1: Đã uống đủ hết
                    const msg = "Tuyệt vời! Bạn đã hoàn thành uống thuốc đủ cho hôm nay.";
                    new Notification("Tổng kết cuối ngày", { body: msg, icon: "/vite.svg" });
                    toast({ title: "Tổng kết cuối ngày", description: msg, className: "bg-green-600 text-white" });
                } else {
                    // TRƯỜNG HỢP 2: Có thuốc quên -> Gom nhóm đếm số lần
                    // Ví dụ: missedMeds có 2 cái Panadol, 1 cái Vitamin
                    const summary: Record<string, number> = {};
                    missedMeds.forEach(med => {
                        summary[med.name] = (summary[med.name] || 0) + 1;
                    });

                    // Tạo chuỗi thông báo: "Panadol (2 lần), Vitamin C (1 lần)"
                    const detailText = Object.entries(summary)
                        .map(([name, count]) => `${name} (${count} lần)`)
                        .join(", ");
                    
                    const msg = `Bạn quên uống: ${detailText}. Hãy bổ sung ngay nhé!`;
                    
                    new Notification("⚠️ Nhắc nhở cuối ngày", { body: msg, icon: "/vite.svg" });
                    toast({ title: "Chưa hoàn thành!", description: msg, variant: "destructive" });
                }

                // Đánh dấu là hôm nay đã báo rồi
                localStorage.setItem("lastSummaryDate", todayStr);
            }
        }
    };

    // Kiểm tra quyền thông báo
    if (Notification.permission !== "granted") Notification.requestPermission();

    // Thiết lập vòng lặp kiểm tra mỗi phút (60000ms)
    // Để không tốn tài nguyên quá nhiều
    const interval = setInterval(checkEndOfDaySummary, 60000);

    return () => clearInterval(interval);
  }, [medications, toast]); // Chạy lại khi danh sách thuốc thay đổi


  // Logic tính toán hiển thị UI
  const todayStr = new Date().toDateString();
  const activeMeds = medications.filter(m => m.isActive);
  const takenCount = activeMeds.filter(m => m.lastTakenDate === todayStr).length;
  const isDailyComplete = activeMeds.length > 0 && activeMeds.length === takenCount;

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft size={20} /> Về trang chủ
            </Link>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Thông báo chúc mừng UI */}
          {isDailyComplete && (
             <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg flex items-center gap-3 text-green-800 animate-in fade-in slide-in-from-top-4">
                <PartyPopper className="h-6 w-6" />
                <div>
                    <h3 className="font-bold">Bạn đã hoàn thành uống thuốc hôm nay!</h3>
                    <p className="text-sm">Hãy duy trì thói quen tốt này nhé.</p>
                </div>
            </div>
          )}
          
          {/* Thông báo Cảnh báo UI (Nếu đã tối muộn mà chưa uống xong) */}
          {!isDailyComplete && activeMeds.length > 0 && new Date().getHours() >= 21 && (
             <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-center gap-3 text-red-800 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="h-6 w-6" />
                <div>
                    <h3 className="font-bold">Đã cuối ngày nhưng bạn chưa uống đủ thuốc!</h3>
                    <p className="text-sm">Vui lòng kiểm tra danh sách bên dưới.</p>
                </div>
            </div>
          )}

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Pill className="text-success" size={32} />
              <h1 className="text-3xl font-bold text-foreground">Nhắc uống thuốc</h1>
            </div>
            <p className="text-muted-foreground">Theo dõi và nhắc nhở uống thuốc đúng giờ</p>
          </div>

          <Card className="mb-6 border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="text-primary" size={24} /> Thuốc cần uống hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeMeds.map((medication) => {
                    const taken = medication.lastTakenDate === todayStr;
                    return (
                        <div key={medication.id} className={`flex items-center justify-between p-4 rounded-lg border ${taken ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${taken ? 'bg-green-100' : 'bg-blue-100'}`}>
                                    <Pill className={taken ? "text-green-600" : "text-blue-600"} size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">{medication.name}</h3>
                                    <p className="text-sm text-muted-foreground">{medication.dosage} • {medication.time}</p>
                                    <p className="text-xs text-muted-foreground">Lần tiếp: {medication.nextDose}</p>
                                </div>
                            </div>
                            {!taken ? (
                                <Button size="sm" onClick={() => markAsTaken(medication.id)} className="flex items-center gap-2">
                                    <CheckCircle2 size={16} /> Xác nhận
                                </Button>
                            ) : (
                                <Button variant="ghost" disabled className="text-green-600">
                                    <CheckCircle2 size={16} className="mr-1"/> Hoàn thành
                                </Button>
                            )}
                        </div>
                    )
                })}
                {activeMeds.length === 0 && <p className="text-center py-4 text-muted-foreground">Không có lịch nhắc hôm nay</p>}
              </div>
            </CardContent>
          </Card>

          {/* All Medications & Forms Section */}
          <Card className="mb-6 border-0 shadow-elegant">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Clock className="text-primary" size={24} /> Tất cả thuốc</CardTitle>
                <Button onClick={() => setShowForm(true)}><Plus size={20} className="mr-2" /> Thêm thuốc</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.map((medication) => (
                  <div key={medication.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Switch checked={medication.isActive} onCheckedChange={() => toggleMedication(medication.id)} />
                      <div>
                        <h3 className="font-semibold text-foreground">{medication.name}</h3>
                        <p className="text-sm text-muted-foreground">{medication.dosage} • {medication.time}</p>
                        <div className="flex items-center gap-2 mt-1">
                             {medication.withFood && <Badge variant="outline">Uống cùng thức ăn</Badge>}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteMedication(medication.id)} className="text-destructive">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {showForm && (
            <Card className="border-0 shadow-elegant">
              <CardHeader><CardTitle>Thêm thuốc mới</CardTitle></CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem><FormLabel>Tên thuốc</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="dosage" render={({ field }) => (
                          <FormItem><FormLabel>Liều lượng</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="frequency" render={({ field }) => (
                        <FormItem><FormLabel>Tần suất</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Chọn tần suất" /></SelectTrigger></FormControl>
                            <SelectContent>{frequencies.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                            </Select>
                        <FormMessage /></FormItem>
                    )} />

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

                    <FormField control={form.control} name="withFood" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5"><FormLabel>Uống cùng thức ăn</FormLabel></div>
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )} />

                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1">Lưu</Button>
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Hủy</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="border-0 bg-success/5">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-success mb-2">{activeMeds.length}</div>
                <p className="text-sm text-muted-foreground">Thuốc đang theo dõi</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-primary/5">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                    {activeMeds.length > 0 ? Math.round((takenCount / activeMeds.length) * 100) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Tỷ lệ tuân thủ hôm nay</p>
              </CardContent>
            </Card>
             <Card className="border-0 bg-primary-dark/5">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary-dark mb-2">{takenCount}</div>
                <p className="text-sm text-muted-foreground">Lần uống đã xác nhận</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationReminder;