import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ChatInterface from "@/components/ChatInterface";
import QuickActions from "@/components/QuickActions";
import {
  MessageCircle,
  Sparkles,
  Activity,
  LogIn,
  UserPlus,
} from "lucide-react";
import healthcareHero from "@/assets/healthcare-hero.jpg";
import { jwtDecode } from "jwt-decode";
import { ChatProvider } from "@/hooks/useChat";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"chat" | "features">("chat");
  const [userName, setUserName] = useState(localStorage.getItem("userName"));

  return (
    <ChatProvider>
      <div className="min-h-screen bg-gradient-soft">
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-sm border-b shadow-soft sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
                  <Activity className="text-primary-foreground" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    HealthBot AI
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Trợ lý chăm sóc sức khỏe thông minh
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={activeTab === "chat" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("chat")}
                  className="transition-smooth"
                >
                  <MessageCircle size={16} className="mr-2" />
                  Chat
                </Button>
                <Button
                  variant={activeTab === "features" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("features")}
                  className="transition-smooth"
                >
                  <Sparkles size={16} className="mr-2" />
                  Tính năng
                </Button>
                <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l">
                  {userName ? (
                    <div>
                      <h1 className="text-xl font-bold text-foreground">
                        Welcome {userName}
                      </h1>
                    </div>
                  ) : (
                    <>
                      <Link to="/login">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="transition-smooth"
                        >
                          <LogIn size={16} className="mr-2" />
                          Đăng nhập
                        </Button>
                      </Link>
                      <Link to="/register">
                        <Button size="sm" className="transition-smooth">
                          <UserPlus size={16} className="mr-2" />
                          Đăng ký
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-12 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero opacity-5" />
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <Sparkles size={16} />
                  AI Healthcare Assistant
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  Chăm sóc sức khỏe
                  <br />
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    thông minh & tiện lợi
                  </span>
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                  Trợ lý AI chuyên nghiệp giúp bạn đặt lịch hẹn bác sĩ, nhắc
                  uống thuốc, cung cấp thông tin y tế đáng tin cậy và hỗ trợ mọi
                  nhu cầu chăm sóc sức khỏe.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-primary hover:bg-primary-dark shadow-medium transition-smooth"
                    onClick={() => setActiveTab("chat")}
                  >
                    <MessageCircle size={20} className="mr-2" />
                    Bắt đầu chat ngay
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-primary/20 hover:bg-primary/5 transition-smooth"
                    onClick={() => setActiveTab("features")}
                  >
                    Xem tính năng
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Card className="overflow-hidden shadow-large border-0 bg-gradient-soft">
                  <img
                    src={healthcareHero}
                    alt="Healthcare AI Assistant"
                    className="w-full h-64 lg:h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-primary/20" />
                </Card>

                {/* Floating stats */}
                <div className="absolute -bottom-4 -left-4 bg-background p-4 rounded-xl shadow-medium border">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Hỗ trợ</div>
                </div>

                <div className="absolute -top-4 -right-4 bg-background p-4 rounded-xl shadow-medium border">
                  <div className="text-2xl font-bold text-success">99%</div>
                  <div className="text-sm text-muted-foreground">
                    Độ chính xác
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {activeTab === "chat" ? (
              <div className="max-w-4xl mx-auto">
                <ChatInterface />
              </div>
            ) : (
              <QuickActions />
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 py-8 border-t bg-background/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Activity className="text-primary-foreground" size={16} />
                </div>
                <span className="font-semibold text-foreground">
                  HealthBot AI
                </span>
              </div>

              <div className="text-sm text-muted-foreground text-center">
                © 2024 HealthBot AI. Được phát triển để chăm sóc sức khỏe của
                bạn.
              </div>

              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Chính sách bảo mật</span>
                <span>•</span>
                <span>Điều khoản sử dụng</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ChatProvider>
  );
};

export default Index;
