import { useState } from "react";
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
import urlBase64ToUint8Array from "@/utils/convertToIntArray";
import { ReminderService } from "@/services/reminder";

const medicationSchema = z.object({
  name: z.string().min(1, "Tên thuốc không được để trống"),
  dosage: z.string().min(1, "Liều lượng không được để trống"),
  frequency: z.string().min(1, "Vui lòng chọn tần suất"),
  time: z.string().min(1, "Vui lòng chọn thời gian"),
  withFood: z.boolean().default(false),
});

type MedicationForm = z.infer<typeof medicationSchema>;

interface Medication extends MedicationForm {
  id: string;
  isActive: boolean;
  nextDose: string;
}

const MedicationReminder = () => {
  const reminderService = new ReminderService()
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: "1",
      name: "Paracetamol",
      dosage: "500mg",
      frequency: "3-times-day",
      time: "08:00",
      withFood: false,
      isActive: true,
      nextDose: "14:00 hôm nay"
    },
    {
      id: "2",
      name: "Vitamin D3",
      dosage: "1000 IU",
      frequency: "once-day",
      time: "09:00",
      withFood: true,
      isActive: true,
      nextDose: "09:00 ngày mai"
    }
  ]);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

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

  const onSubmit = (data: MedicationForm) => {
    const newMedication: Medication = {
      ...data,
      id: Date.now().toString(),
      isActive: true,
      nextDose: calculateNextDose(data.time, data.frequency)
    };

    setMedications([...medications, newMedication]);
    setShowForm(false);
    form.reset();
    toast({
      title: "Thêm thuốc thành công!",
      description: "Lời nhắc đã được thiết lập.",
    });
  };

  const calculateNextDose = (time: string, frequency: string): string => {
    // Simple calculation for demo
    return `${time} hôm nay`;
  };

  const toggleMedication = async (id: string) => {
    try {
      // 1️⃣ Check and request notification permission
      let permission = Notification.permission;

      if (permission === "default") {
        permission = await Notification.requestPermission();
        console.log("User selected:", permission);
      }

      if (permission === "granted") {
        // Phần này là để set lời nhắc (lưu ý: cần bật thông báo và tắt chế độ không làm phiền trong setting windows)

        // new Notification("✅ Notifications enabled!");

        // 2️⃣ Register the Service Worker
        // const registration = await navigator.serviceWorker.register("/sw.js");

        // console.log("Service Worker registered");

        // // 3️⃣ Subscribe to Push
        // const subscription = await registration.pushManager.subscribe({
        //   userVisibleOnly: true,
        //   applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
        // });

        // const subscriptionData = {
        //   endpoint: subscription.endpoint,
        //   keys: {
        //     p256dh: btoa(String.fromCharCode.apply(
        //       null,
        //       new Uint8Array(subscription.getKey("p256dh"))
        //     )),
        //     auth: btoa(String.fromCharCode.apply(
        //       null,
        //       new Uint8Array(subscription.getKey("auth"))
        //     )),
        //   },
        // };
        // console.log("Clean Subscription object:", subscriptionData);
        // await reminderService.createReminder({
        //   ...subscriptionData,
        //   notifyAt: "2025-11-17T16:22:00.000Z", // Replace with actual notification time
        // });

        // console.log("Push Subscription successful at 2025-11-17T16:22:00.000Z");

      } else {
        console.log("Notifications not allowed.");
      }

      // 5️⃣ Toggle medication state in UI
      setMedications((meds) =>
        meds.map((med) =>
          med.id === id ? { ...med, isActive: !med.isActive } : med
        )
      );
    } catch (error) {
      console.error("Error toggling medication:", error);
    }
  };


  const deleteMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
    toast({
      title: "Đã xóa thuốc",
      description: "Lời nhắc uống thuốc đã được hủy.",
    });
  };

  const markAsTaken = (id: string) => {
    toast({
      title: "Đã uống thuốc!",
      description: "Cảm ơn bạn đã tuân thủ đúng giờ.",
    });
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
                      onClick={() => markAsTaken(medication.id)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 size={16} />
                      Đã uống
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

export default MedicationReminder;