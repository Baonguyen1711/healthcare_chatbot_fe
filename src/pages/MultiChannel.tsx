import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Smartphone, 
  ArrowLeft, 
  Globe, 
  MessageCircle, 
  Download,
  QrCode,
  CheckCircle2,
  Clock,
  Users,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const MultiChannel = () => {
  const channels = [
    {
      id: "web",
      name: "Website",
      icon: Globe,
      description: "Truy cập đầy đủ tính năng trên trình duyệt web",
      features: [
        "Đặt lịch hẹn trực tuyến",
        "Xem kết quả xét nghiệm",
        "Thanh toán viện phí",
        "Chat với bác sĩ",
        "Lưu trữ hồ sơ y tế"
      ],
      url: "https://healthcarebot.com",
      status: "Đang hoạt động",
      users: "25,000+ người dùng"
    },
    {
      id: "mobile",
      name: "Mobile App",
      icon: Smartphone,
      description: "Ứng dụng di động với thông báo push và tính năng offline",
      features: [
        "Nhận thông báo lịch hẹn",
        "Nhắc uống thuốc",
        "Tìm kiếm bệnh viện gần nhất",
        "Gọi cấp cứu nhanh",
        "Đồng bộ dữ liệu đám mây"
      ],
      url: "#",
      status: "Sắp ra mắt",
      users: "Pre-register"
    },
    {
      id: "zalo",
      name: "Zalo OA",
      icon: MessageCircle,
      description: "Tương tác nhanh chóng qua Zalo Official Account",
      features: [
        "Chat bot thông minh",
        "Đặt lịch qua tin nhắn",
        "Nhận kết quả xét nghiệm",
        "Hỗ trợ 24/7",
        "Chia sẻ thông tin y tế"
      ],
      url: "https://zalo.me/healthcarebot",
      status: "Đang hoạt động",
      users: "15,000+ followers"
    }
  ];

  const stats = [
    { label: "Tổng người dùng", value: "40,000+", icon: Users },
    { label: "Thời gian phản hồi", value: "< 30s", icon: Clock },
    { label: "Tỷ lệ hài lòng", value: "96%", icon: CheckCircle2 },
    { label: "Uptime", value: "99.9%", icon: Zap }
  ];

  const getChannelIcon = (channel: typeof channels[0]) => {
    const IconComponent = channel.icon;
    return <IconComponent className="text-primary" size={32} />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đang hoạt động":
        return "default";
      case "Sắp ra mắt":
        return "secondary";
      default:
        return "outline";
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

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Smartphone className="text-success" size={32} />
              <h1 className="text-3xl font-bold text-foreground">Đa kênh</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Truy cập dịch vụ chăm sóc sức khỏe mọi lúc, mọi nơi thông qua nhiều kênh khác nhau
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-elegant">
                <CardContent className="p-6 text-center">
                  <stat.icon className="text-primary mx-auto mb-3" size={28} />
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Channels Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {channels.map((channel) => (
              <Card key={channel.id} className="border-0 shadow-elegant hover:shadow-medium transition-smooth">
                <CardHeader className="text-center">
                  <div className="mb-4">{getChannelIcon(channel)}</div>
                  <CardTitle className="flex items-center justify-center gap-2">
                    {channel.name}
                    <Badge variant={getStatusColor(channel.status)}>
                      {channel.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">{channel.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {channel.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={16} className="text-success" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center mb-4">
                    <Badge variant="outline" className="text-xs">
                      {channel.users}
                    </Badge>
                  </div>

                  {channel.status === "Đang hoạt động" ? (
                    <Button asChild className="w-full">
                      <Link to={channel.url} target="_blank">
                        Truy cập ngay
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      {channel.status}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Tabs */}
          <Tabs defaultValue="web" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              {channels.map((channel) => (
                <TabsTrigger key={channel.id} value={channel.id} className="flex items-center gap-2">
                  <channel.icon size={16} />
                  {channel.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="web">
              <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="text-primary" size={24} />
                  Website - Trải nghiệm đầy đủ
                </CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Tính năng nổi bật:</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 size={18} className="text-success mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Giao diện responsive</p>
                            <p className="text-sm text-muted-foreground">Tối ưu cho mọi thiết bị</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 size={18} className="text-success mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Bảo mật cao</p>
                            <p className="text-sm text-muted-foreground">Mã hóa SSL và xác thực 2FA</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 size={18} className="text-success mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Tích hợp đầy đủ</p>
                            <p className="text-sm text-muted-foreground">Kết nối với hệ thống bệnh viện</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gradient-soft p-6 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-3">Hướng dẫn sử dụng:</h4>
                      <ol className="space-y-2 text-sm text-muted-foreground">
                        <li>1. Truy cập website và đăng ký tài khoản</li>
                        <li>2. Xác thực email và thiết lập mật khẩu</li>
                        <li>3. Hoàn thiện thông tin cá nhân</li>
                        <li>4. Bắt đầu sử dụng các tính năng</li>
                      </ol>
                      <Button variant="outline" className="w-full mt-4">
                        <QrCode className="mr-2" size={16} />
                        Tạo QR Code truy cập
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mobile">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="text-primary" size={24} />
                    Mobile App - Tiện lợi di động
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="text-center mb-6">
                        <div className="w-32 h-32 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                          <Smartphone size={48} className="text-white" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">HealthCare Bot</h3>
                        <Badge variant="secondary">Sắp ra mắt</Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <Button className="w-full" disabled>
                          <Download className="mr-2" size={16} />
                          Tải về từ App Store
                        </Button>
                        <Button className="w-full" disabled>
                          <Download className="mr-2" size={16} />
                          Tải về từ Google Play
                        </Button>
                        <Button variant="outline" className="w-full">
                          Đăng ký nhận thông báo
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Tính năng sắp có:</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <Clock size={18} className="text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Thông báo thông minh</p>
                            <p className="text-sm text-muted-foreground">Nhắc nhở uống thuốc, lịch hẹn</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Globe size={18} className="text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Offline mode</p>
                            <p className="text-sm text-muted-foreground">Truy cập thông tin cơ bản không cần mạng</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Users size={18} className="text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Quản lý gia đình</p>
                            <p className="text-sm text-muted-foreground">Theo dõi sức khỏe cả gia đình</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="zalo">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="text-primary" size={24} />
                    Zalo OA - Hỗ trợ nhanh chóng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="text-center mb-6">
                        <div className="w-32 h-32 bg-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                          <MessageCircle size={48} className="text-white" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Healthcare Bot OA</h3>
                        <Badge variant="default">Đang hoạt động</Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <Button asChild className="w-full">
                          <Link to="https://zalo.me/healthcarebot" target="_blank">
                            <MessageCircle className="mr-2" size={16} />
                            Kết nối Zalo OA
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full">
                          <QrCode className="mr-2" size={16} />
                          Hiển thị QR Code
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-4">Cách sử dụng Zalo OA:</h3>
                      <div className="space-y-4">
                        <div className="p-3 bg-gradient-soft rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">Bước 1: Kết nối</h4>
                          <p className="text-sm text-muted-foreground">
                            Quét QR code hoặc tìm kiếm "Healthcare Bot" trên Zalo
                          </p>
                        </div>
                        <div className="p-3 bg-gradient-soft rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">Bước 2: Đăng ký</h4>
                          <p className="text-sm text-muted-foreground">
                            Cung cấp thông tin cơ bản để tạo hồ sơ
                          </p>
                        </div>
                        <div className="p-3 bg-gradient-soft rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">Bước 3: Sử dụng</h4>
                          <p className="text-sm text-muted-foreground">
                            Chat với bot hoặc sử dụng menu nhanh
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Integration Benefits */}
          <Card className="mt-8 border-0 bg-primary/5">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Zap className="text-primary mx-auto mb-3" size={32} />
                <h3 className="font-semibold text-foreground mb-2">Tích hợp đa kênh</h3>
                <p className="text-muted-foreground">
                  Dữ liệu được đồng bộ tự động giữa các kênh, đảm bảo trải nghiệm nhất quán
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <CheckCircle2 className="text-success mx-auto mb-2" size={24} />
                  <h4 className="font-medium text-foreground mb-1">Đồng bộ dữ liệu</h4>
                  <p className="text-sm text-muted-foreground">
                    Thông tin được cập nhật realtime
                  </p>
                </div>
                <div className="text-center">
                  <Users className="text-primary mx-auto mb-2" size={24} />
                  <h4 className="font-medium text-foreground mb-1">Tài khoản thống nhất</h4>
                  <p className="text-sm text-muted-foreground">
                    Một tài khoản cho tất cả kênh
                  </p>
                </div>
                <div className="text-center">
                  <Clock className="text-primary-dark mx-auto mb-2" size={24} />
                  <h4 className="font-medium text-foreground mb-1">Hỗ trợ 24/7</h4>
                  <p className="text-sm text-muted-foreground">
                    Luôn sẵn sàng hỗ trợ bạn
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MultiChannel;