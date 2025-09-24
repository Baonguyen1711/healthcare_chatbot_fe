import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Pill, 
  FileText, 
  ClipboardList, 
  MessageSquare, 
  Smartphone,
  Heart,
  Shield
} from "lucide-react";

const QuickActions = () => {
  const actions = [
    {
      icon: Calendar,
      title: "Đặt lịch hẹn",
      description: "Đặt lịch khám với bác sĩ chuyên khoa",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Pill,
      title: "Nhắc uống thuốc",
      description: "Thiết lập lời nhắc và theo dõi tuân thủ",
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      icon: FileText,
      title: "Thông tin y tế",
      description: "Thông tin đáng tin cậy từ WHO, CDC, Bộ Y tế",
      color: "text-primary-dark",
      bg: "bg-primary-dark/10",
    },
    {
      icon: ClipboardList,
      title: "Quy trình khám",
      description: "Check-in, số thứ tự, viện phí",
      color: "text-primary-light",
      bg: "bg-primary-light/10",
    },
    {
      icon: MessageSquare,
      title: "Phản hồi & Khảo sát",
      description: "Chia sẻ trải nghiệm và đánh giá dịch vụ",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Smartphone,
      title: "Đa kênh",
      description: "Web, App, Zalo - Mọi lúc mọi nơi",
      color: "text-success",
      bg: "bg-success/10",
    },
  ];

  const actionRoutes: Record<string, string> = {
    "Đặt lịch hẹn": "/appointment",
    "Nhắc uống thuốc": "/medication", 
    "Thông tin y tế": "/information",
    "Quy trình khám": "/process",
    "Phản hồi & Khảo sát": "/feedback",
    "Đa kênh": "/multichannel",
  };

  const handleActionClick = (title: string) => {
    const route = actionRoutes[title];
    if (route) {
      window.location.href = route;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <Heart className="text-primary" size={24} />
          <h2 className="text-2xl font-bold text-foreground">Chức năng chính</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Trợ lý chăm sóc sức khỏe thông minh với đầy đủ tính năng hỗ trợ bạn quản lý sức khỏe hiệu quả
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <Card 
            key={index} 
            className="group hover:shadow-medium transition-smooth border-0 bg-gradient-soft hover:scale-105 cursor-pointer"
            onClick={() => handleActionClick(action.title)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${action.bg} group-hover:scale-110 transition-bounce`}>
                  <action.icon className={`${action.color}`} size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-smooth">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-smooth"
              >
                Sử dụng ngay
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust badges */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <Shield className="text-primary" size={20} />
          <span className="text-sm font-medium text-muted-foreground">
            Tin cậy bởi các tổ chức y tế hàng đầu
          </span>
        </div>
        <div className="flex justify-center items-center gap-8 text-xs text-muted-foreground opacity-70">
          <span className="font-medium">WHO</span>
          <span>•</span>
          <span className="font-medium">CDC</span>
          <span>•</span>
          <span className="font-medium">Bộ Y tế Việt Nam</span>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;