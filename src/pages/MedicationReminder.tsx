import { useState, useEffect, useRef } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Pill,
  Plus,
  ArrowLeft,
  Clock,
  Bell,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ReminderService } from "@/services/reminder";
import urlBase64ToUint8Array from "@/utils/convertToIntArray";

/* =========================
   Helpers
========================= */

const STORAGE_KEY = "medications";
const todayKey = () => new Date().toISOString().split("T")[0];

const saveToStorage = (data: Medication[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const loadFromStorage = (): Medication[] =>
  JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const formatLocalISO = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}.000Z`;
};

const parseTimes = (time: string): string[] =>
  time.split(/[,|]/).map(t => t.trim()).filter(Boolean);

const buildNotifyAt = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return formatLocalISO(d);
};

/* =========================
   Push helper (ĐÚNG FLOW)
========================= */

const getPushSubscriptionData = async () => {
  let permission = Notification.permission;

  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    throw new Error("Notification permission denied");
  }

  new Notification("✅ Notifications enabled!");

  const registration = await navigator.serviceWorker.register("/sw.js");

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      "BNVa9eamj2vCqU2tnl58f56XvIs02nnwPzqUGqshhQQlYCqVf9XCOI5ayomr2EvCfC21Gt38O_zNXojLD5vmeF4"
    ),
  });

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: btoa(
        String.fromCharCode.apply(
          null,
          new Uint8Array(subscription.getKey("p256dh")!)
        )
      ),
      auth: btoa(
        String.fromCharCode.apply(
          null,
          new Uint8Array(subscription.getKey("auth")!)
        )
      ),
    },
  };
};

/* =========================
   Schema & types
========================= */

const medicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  time: z.string().min(1, "VD: 08:00,14:00"),
  withFood: z.boolean().default(false),
});

type MedicationForm = z.infer<typeof medicationSchema>;

interface Medication extends MedicationForm {
  id: string;
  isActive: boolean;
  nextDose: string;
  taken: boolean;
  date: string;
}

/* =========================
   Component
========================= */

const MedicationReminder = () => {
  const reminderService = new ReminderService();
  const { toast } = useToast();
  const intervalRef = useRef<number | null>(null);

  const [medications, setMedications] = useState<Medication[]>(() =>
    loadFromStorage()
  );
  const [showForm, setShowForm] = useState(false);
  const activeCount = medications.filter(m => m.isActive).length;
  const totalDoses = medications.filter(m => m.isActive).length;
  const takenDoses = medications.filter(m => m.isActive && m.taken).length;

  const adherenceRate =
    totalDoses === 0
      ? 0
      : Math.round((takenDoses / totalDoses) * 100);



  const form = useForm<MedicationForm>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "",
      time: "",
      withFood: false,
    },
  });

  const frequencies = [
    { value: "once-day", label: "1 lần/ngày" },
    { value: "twice-day", label: "2 lần/ngày" },
    { value: "3-times-day", label: "3 lần/ngày" },
    { value: "4-times-day", label: "4 lần/ngày" },
    { value: "as-needed", label: "Khi cần thiết" },
  ];

  /* ===== Persist ===== */
  useEffect(() => {
    saveToStorage(medications);
  }, [medications]);

  /* ===== Check 21:50 ===== */
  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      console.log("Checking meds at", now.toLocaleTimeString());

      if (minutes >= 22 * 60 + 15 && minutes < 24 * 60) {
        const todayMeds = medications.filter(
          m => m.date === todayKey() && m.isActive
        );

        const allTaken =
          todayMeds.length > 0 && todayMeds.every(m => m.taken);

        toast({
          title: allTaken
            ? "🎉 Bạn đã uống đủ thuốc hôm nay"
            : "⚠️ Bạn chưa uống đủ thuốc hôm nay",
        });

        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [medications]);

  /* ===== Submit ===== */
  const onSubmit = async (data: MedicationForm) => {
    try {
      const times = parseTimes(data.time);

      // Lấy subscription 1 lần
      const subscriptionData = await getPushSubscriptionData();

      const newItems: Medication[] = [];

      for (let i = 0; i < times.length; i++) {
        const t = times[i];
        const notifyAt = buildNotifyAt(t);

        newItems.push({
          ...data,
          id: `${Date.now()}-${i}`,
          time: t,
          nextDose: t,
          isActive: true,
          taken: false,
          date: todayKey(),
        });

        // 🔔 GỌI API ĐÚNG FORMAT
        await reminderService.createReminder({
          ...subscriptionData,
          notifyAt,
        });
      }

      setMedications(prev => [...prev, ...newItems]);
      setShowForm(false);
      form.reset();

      toast({
        title: "Thêm thuốc thành công!",
        description: `Đã tạo ${times.length} lời nhắc`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Không thể tạo nhắc nhở",
        description: "Vui lòng cho phép thông báo",
        variant: "destructive",
      });
    }
  };

  const markAsTaken = (id: string) => {
    setMedications(meds =>
      meds.map(m => (m.id === id ? { ...m, taken: true } : m))
    );

    toast({ title: "✅ Đã uống thuốc" });
  };

  const toggleMedication = (id: string) => {
    setMedications(meds =>
      meds.map(m =>
        m.id === id ? { ...m, isActive: !m.isActive } : m
      )
    );
  };

  const deleteMedication = (id: string) => {
    setMedications(meds => meds.filter(m => m.id !== id));
  };

  /* =========================
     UI giữ nguyên
  ========================= */

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
                {medications.filter(med => med.isActive).map((medication) => (
                  <div key={medication.id} className="flex items-center justify-between p-4 rounded-lg bg-gradient-soft border">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-success/10">
                        <Pill className="text-success" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{medication.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {medication.dosage} • {frequencies.find(f => f.value === medication.frequency)?.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Lần tiếp theo: {medication.nextDose}
                          {medication.withFood && " • Uống cùng thức ăn"}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      disabled={medication.taken}
                      onClick={() => markAsTaken(medication.id)}
                      className={`flex items-center gap-2
    ${medication.taken
                          ? "bg-black text-white hover:bg-black cursor-not-allowed"
                          : ""
                        }
  `}
                    >
                      <CheckCircle2 size={16} />
                      {medication.taken ? "Đã uống" : "Đã uống"}
                    </Button>
                  </div>
                ))}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Thời gian uống *</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* ===== Thuốc đang theo dõi ===== */}
            <Card className="border-0 bg-success/5">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-success mb-2">
                  {activeCount}
                </div>
                <p className="text-sm text-muted-foreground">
                  Thuốc đang theo dõi
                </p>
              </CardContent>
            </Card>

            {/* ===== Tỷ lệ tuân thủ ===== */}
            <Card className="border-0 bg-primary/5">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  {adherenceRate}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Tỷ lệ tuân thủ
                </p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MedicationReminder;
