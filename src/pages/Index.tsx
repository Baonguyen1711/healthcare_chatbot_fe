import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { ChatProvider } from "@/hooks/useChat";

type TabType = "chat" | "features";

const Index = () => {
  const navigate = useNavigate();
  const mainContentRef = useRef<HTMLDivElement | null>(null);

  // 🔹 load tab cuối cùng
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    return (localStorage.getItem("activeTab") as TabType) || "chat";
  });

  const [userName, setUserName] = useState<string | null>(
    localStorage.getItem("userName")
  );

  // 🔹 lưu tab khi đổi
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const scrollToMain = () => {
    setTimeout(() => {
      mainContentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserName(null);
    navigate("/login");
  };

  return (
    <ChatProvider>
      <div className="min-h-screen bg-gradient-soft">
        {/* ================= HEADER ================= */}
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
                <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l">
                  {userName ? (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        Welcome {userName}
                      </span>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Link to="/login">
                        <Button variant="ghost" size="sm">
                          <LogIn size={16} className="mr-2" />
                          Đăng nhập
                        </Button>
                      </Link>
                      <Link to="/register">
                        <Button size="sm">
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

        {/* ================= HERO ================= */}
        <section className="relative py-12 lg:py-20 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-5xl font-bold">
                  Chăm sóc sức khỏe
                  <br />
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    thông minh & tiện lợi
                  </span>
                </h1>

                <p className="text-lg text-muted-foreground">
                  Trợ lý AI giúp bạn đặt lịch, nhắc uống thuốc và tư vấn y tế.
                </p>

                <div className="flex gap-4">
                  <Button
                    size="lg"
                    onClick={() => {
                      setActiveTab("chat");
                      scrollToMain();
                    }}
                  >
                    <MessageCircle size={20} className="mr-2" />
                    Bắt đầu chat ngay
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setActiveTab("features");
                      scrollToMain();
                    }}
                  >
                    Xem tính năng
                  </Button>
                </div>
              </div>

              <Card className="overflow-hidden">
                <img
                  src={healthcareHero}
                  alt="Healthcare AI"
                  className="w-full h-72 object-cover"
                />
              </Card>
            </div>
          </div>
        </section>

        {/* ================= MAIN ================= */}
        <section className="py-12" ref={mainContentRef}>
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

        {/* ================= FOOTER ================= */}
        <footer className="py-8 border-t text-center text-sm text-muted-foreground">
          © 2024 HealthBot AI
        </footer>
      </div>
    </ChatProvider>
  );
};

export default Index;
