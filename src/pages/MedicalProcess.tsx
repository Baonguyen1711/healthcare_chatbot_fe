import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  ClipboardList, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  QrCode, 
  User, 
  FileText,
  MapPin,
  Phone
} from "lucide-react";
import { Link } from "react-router-dom";

const MedicalProcess = () => {
  const [currentStep, setCurrentStep] = useState(2);

  const processSteps = [
    {
      id: 1,
      title: "Đặt lịch hẹn",
      description: "Chọn khoa, bác sĩ và thời gian phù hợp",
      status: "completed",
      time: "Đã hoàn thành"
    },
    {
      id: 2,
      title: "Check-in trực tuyến",
      description: "Xác nhận thông tin và check-in trước khi đến",
      status: "current",
      time: "Đang thực hiện"
    },
    {
      id: 3,
      title: "Nhận số thứ tự",
      description: "Lấy số thứ tự khám và theo dõi hàng đợi",
      status: "pending",
      time: "Sắp tới"
    },
    {
      id: 4,
      title: "Khám bệnh",
      description: "Gặp bác sĩ và thực hiện khám chữa bệnh",
      status: "pending",
      time: "Chờ đợi"
    },
    {
      id: 5,
      title: "Thanh toán viện phí",
      description: "Thanh toán chi phí khám và thuốc (nếu có)",
      status: "pending",
      time: "Chờ đợi"
    }
  ];

  const appointmentInfo = {
    patientName: "Nguyễn Văn An",
    department: "Nội khoa",
    doctor: "BS. Trần Thị Minh",
    date: "25/09/2024",
    time: "09:30",
    room: "Phòng 205 - Tòa A",
    queueNumber: "A-12",
    estimatedTime: "09:45"
  };

  const fees = [
    { service: "Phí khám bệnh", amount: 150000, covered: 120000 },
    { service: "Xét nghiệm máu", amount: 200000, covered: 160000 },
    { service: "Chụp X-quang", amount: 180000, covered: 144000 },
  ];

  const totalFee = fees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalCovered = fees.reduce((sum, fee) => sum + fee.covered, 0);
  const patientPay = totalFee - totalCovered;

  const getStepIcon = (step: typeof processSteps[0]) => {
    if (step.status === "completed") return <CheckCircle2 className="text-success" size={24} />;
    if (step.status === "current") return <Clock className="text-primary" size={24} />;
    return <div className="w-6 h-6 rounded-full border-2 border-muted" />;
  };

  const getStepColor = (step: typeof processSteps[0]) => {
    if (step.status === "completed") return "bg-success";
    if (step.status === "current") return "bg-primary";
    return "bg-muted";
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
              <ClipboardList className="text-primary-light" size={32} />
              <h1 className="text-3xl font-bold text-foreground">Quy trình khám bệnh</h1>
            </div>
            <p className="text-muted-foreground">
              Theo dõi tiến trình khám bệnh và quản lý thông tin một cách dễ dàng
            </p>
          </div>

          {/* Current Appointment Info */}
          <Card className="mb-8 border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="text-primary" size={24} />
                Thông tin lịch khám
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bệnh nhân</p>
                      <p className="font-semibold text-foreground">{appointmentInfo.patientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Khoa khám</p>
                      <p className="font-semibold text-foreground">{appointmentInfo.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bác sĩ</p>
                      <p className="font-semibold text-foreground">{appointmentInfo.doctor}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Thời gian</p>
                      <p className="font-semibold text-foreground">
                        {appointmentInfo.time} - {appointmentInfo.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phòng khám</p>
                      <p className="font-semibold text-foreground">{appointmentInfo.room}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <QrCode size={18} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Số thứ tự</p>
                      <Badge variant="default" className="font-bold">
                        {appointmentInfo.queueNumber}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Process Timeline */}
          <Card className="mb-8 border-0 shadow-elegant">
            <CardHeader>
              <CardTitle>Tiến trình khám bệnh</CardTitle>
              <Progress value={(currentStep / processSteps.length) * 100} className="mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {processSteps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      {getStepIcon(step)}
                      {index < processSteps.length - 1 && (
                        <div className={`w-px h-12 mt-2 ${getStepColor(step)}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold ${
                          step.status === "current" ? "text-primary" : "text-foreground"
                        }`}>
                          {step.title}
                        </h3>
                        <Badge 
                          variant={step.status === "completed" ? "default" : "outline"}
                          className={step.status === "current" ? "bg-primary text-primary-foreground" : ""}
                        >
                          {step.time}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                      
                      {step.status === "current" && step.id === 2 && (
                        <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                          <h4 className="font-semibold text-foreground mb-2">Hành động cần thực hiện:</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Xác nhận thông tin cá nhân</li>
                            <li>• Upload ảnh CMND/CCCD (nếu cần)</li>
                            <li>• Xác nhận có mặt tại bệnh viện</li>
                          </ul>
                          <Button className="mt-3" size="sm">
                            Hoàn thành check-in
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Queue Status */}
          <Card className="mb-8 border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="text-primary" size={24} />
                Tình trạng hàng đợi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">A-12</div>
                  <p className="text-sm text-muted-foreground">Số thứ tự của bạn</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">A-09</div>
                  <p className="text-sm text-muted-foreground">Đang khám</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-dark mb-2">3</div>
                  <p className="text-sm text-muted-foreground">Người chờ trước bạn</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Dự kiến đến lượt:</p>
                <p className="text-xl font-bold text-foreground">{appointmentInfo.estimatedTime}</p>
              </div>
            </CardContent>
          </Card>

          {/* Fee Information */}
          <Card className="mb-8 border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="text-primary" size={24} />
                Chi phí khám chữa bệnh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fees.map((fee, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-foreground">{fee.service}</span>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {fee.amount.toLocaleString('vi-VN')} ₫
                      </p>
                      <p className="text-sm text-success">
                        BHYT: -{fee.covered.toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between font-bold text-lg">
                  <span className="text-foreground">Bệnh nhân thanh toán:</span>
                  <span className="text-primary">{patientPay.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Phương thức thanh toán:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="flex items-center gap-2">
                    <CreditCard size={16} />
                    Thẻ ATM/Credit
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <QrCode size={16} />
                    QR Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="border-0 bg-primary/5">
            <CardContent className="p-6 text-center">
              <Phone className="text-primary mx-auto mb-3" size={32} />
              <h3 className="font-semibold text-foreground mb-2">Cần hỗ trợ?</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Liên hệ với chúng tôi nếu bạn có thắc mắc về quy trình khám bệnh
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm">
                  Hotline: 1900-xxx-xxx
                </Button>
                <Button variant="outline" size="sm">
                  Chat trực tuyến
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MedicalProcess;