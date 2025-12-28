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

const CHECK_HOUR = 22;
const CHECK_MINUTE = 0;

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
  createdAt?: number; 
}

const MedicationReminder = () => {
  const reminderService = new ReminderService();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const calculateNextDose = (time: string): string => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime < now) {
      return `${time} ngày mai`;
    }
    return `${time} hôm nay`;
  };

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
    const fetchData = async () => {
        try {
            const data = await reminderService.getReminder();
            if (Array.isArray(data)) {
                const mappedData = data.map((item: any) => ({
                    ...item,
                    createdAt: item.createdAt || 0 
                }));
                setMedications(mappedData);
            }
        } catch (error) {
            console.error(error);
        }
    };
    fetchData();
  }, []);

  const shouldShowToday = (med: Medication) => {
      if (!med.isActive) return false;
      if (med.lastTakenDate === new Date().toDateString()) return false;

      const now = new Date();
      const [hours, minutes] = med.time.split(':').map(Number);
      
      const medTimeToday = new Date();
      medTimeToday.setHours(hours, minutes, 0, 0);

      if (medTimeToday > now) return true;

      const createdTime = med.createdAt || 0;
      // SỬA: Thêm 60000ms (1 phút) để chấp nhận trường hợp tạo ngay trong phút đó
      if (createdTime <= medTimeToday.getTime() + 60000) {
          return true; 
      }

      return false; 
  };

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

      const isTimeToCheck = now.getHours() > CHECK_HOUR || 
                           (now.getHours() === CHECK_HOUR && now.getMinutes() >= CHECK_MINUTE);

      if (isTimeToCheck && medications.length > 0) {
         const hasCheckedToday = sessionStorage.getItem("lastCheck") === todayStr;
         
         if (!hasCheckedToday) {
             const missed = medications.filter(medItem => {
                 const isTaken = medItem.lastTakenDate === todayStr;
                 if (isTaken) return false; 
                 
                 const [hours, minutes] = medItem.time.split(':').map(Number);
                 const medTime = new Date();
                 medTime.setHours(hours, minutes, 0, 0);
                 const created = medItem.createdAt || 0;
                 
                 return medItem.isActive && (created <= medTime.getTime() + 60000);
             });
             
             setTimeout(() => {
                 if (missed.length === 0) {
                     new Notification("Tổng kết cuối ngày", { body: "Bạn đã uống đủ thuốc. Tuyệt vời! 🎉" });
                 } else {
                     new Notification("Nhắc nhở cuối ngày", { body: `Bạn chưa uống ${missed.length} liều thuốc hôm nay!` });
                 }
             }, 2000);
             
             sessionStorage.setItem("lastCheck", todayStr);
         }
      }

    }, 5000); 

    return () => clearInterval(interval);
  }, [medications, toast]);

  const onSubmit = async (data: MedicationForm) => {
    const newMedicationsList: Medication[] = [];
    const createdTimestamp = Date.now(); 

    for (const time of data.times) {
        const newMedication: Medication = {
            id: createdTimestamp.toString() + Math.random().toString(), 
            name: data.name,
            dosage: data.dosage,
            frequency: data.frequency,
            time: time, 
            withFood: data.withFood,
            isActive: true,
            nextDose: calculateNextDose(time),
            createdAt: createdTimestamp 
        };
        newMedicationsList.push(newMedication);
    }

    setMedications(prev => [...prev, ...newMedicationsList]);

    try {
        const currentIds = medications.map(m => m.id);
        const newIds = newMedicationsList.map(m => m.id);
        const allIds = [...currentIds, ...newIds];
        
        if (allIds.length > 0) {
            // await reminderService.syncMedicineToStorage(allIds);
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

  const toggleMedication = async (id: string) => {
    const med = medications.find(m => m.id === id);
    if (med) {
        const updated = { ...med, isActive: !med.isActive };
        // await reminderService.updateReminder(id, updated).catch(console.error);
        setMedications(meds => meds.map(m => m.id === id ? updated : m));
    }
  };

  const deleteMedication = async (id: string) => {
    // await reminderService.deleteReminder(id).catch(console.error);
    setMedications(medications.filter(med => med.id !== id));
    toast({
      title: "Đã xóa thuốc",
      description: "Lời nhắc uống thuốc đã được hủy.",
    });
  };

  const markAsTaken = async (id: string) => {
    const med = medications.find(m => m.id === id);
    if (med) {
        const updatedMed = { 
            ...med, 
            lastTakenDate: new Date().toDateString(),
            nextDose: calculateNextDose(med.time)
        };
        // await reminderService.updateReminder(id, updatedMed).catch(console.error);

        setMedications(meds => meds.map(m => m.id === id ? updatedMed : m));
        toast({
          title: "Đã uống thuốc!",
          description: "Cảm ơn bạn đã tuân thủ đúng giờ. Hệ thống sẽ ngừng nhắc nhở hôm nay.",
          className: "bg-green-600 text-white border-none"
        });
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

          <Card className="mb-6 border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="text-primary" size={24} />
                Thuốc cần uống hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.filter(shouldShowToday).map((medication) => {
                  return (
                    <div key={medication.id} className={`flex items-center justify-between p-4 rounded-lg border bg-white`}>
                        <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full bg-blue-100`}>
                            <Pill className={'text-blue-600'} size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">{medication.name}</h3>
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
                        
                        <Button
                        size="sm"
                        onClick={() => markAsTaken(medication.id)}
                        className="flex items-center gap-2"
                        >
                        <CheckCircle2 size={16} />
                        Xác nhận
                        </Button>
                    </div>
                  );
                })}
                
                {medications.filter(shouldShowToday).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Pill size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Không có thuốc cần uống hoặc bạn đã uống hết thuốc hôm nay</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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