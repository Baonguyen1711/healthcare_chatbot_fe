import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ArrowLeft, Search, BookOpen, Shield, Globe, Heart, Brain, Utensils } from "lucide-react";
import { Link } from "react-router-dom";

const HealthInformation = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: "prevention",
      title: "Phòng ngừa bệnh",
      icon: Shield,
      color: "text-success",
      articles: [
        {
          title: "10 cách phòng ngừa cảm cúm mùa đông",
          source: "WHO",
          readTime: "5 phút",
          summary: "Hướng dẫn chi tiết cách bảo vệ bản thân khỏi virus cảm cúm"
        },
        {
          title: "Vaccine COVID-19: Những điều cần biết",
          source: "CDC",
          readTime: "8 phút",
          summary: "Thông tin cập nhật về vaccine và lịch tiêm chủng"
        },
        {
          title: "Phòng ngừa bệnh tim mạch ở người trẻ",
          source: "Bộ Y tế",
          readTime: "6 phút",
          summary: "Lối sống lành mạnh để bảo vệ tim mạch từ sớm"
        }
      ]
    },
    {
      id: "nutrition",
      title: "Dinh dưỡng",
      icon: Utensils,
      color: "text-primary",
      articles: [
        {
          title: "Chế độ ăn Địa Trung Hải: Lợi ích cho sức khỏe",
          source: "WHO",
          readTime: "7 phút",
          summary: "Tại sao chế độ ăn này được khuyến nghị cho sức khỏe tim mạch"
        },
        {
          title: "Vitamin D: Vai trò và cách bổ sung",
          source: "CDC",
          readTime: "5 phút",
          summary: "Tầm quan trọng của vitamin D và cách bổ sung đúng cách"
        },
        {
          title: "Dinh dưỡng cho người tiểu đường",
          source: "Bộ Y tế",
          readTime: "10 phút",
          summary: "Hướng dẫn chi tiết về chế độ ăn cho người bệnh tiểu đường"
        }
      ]
    },
    {
      id: "mental-health",
      title: "Sức khỏe tâm thần",
      icon: Brain,
      color: "text-primary-dark",
      articles: [
        {
          title: "Quản lý stress trong cuộc sống hiện đại",
          source: "WHO",
          readTime: "6 phút",
          summary: "Các kỹ thuật giúp giảm stress và cải thiện tinh thần"
        },
        {
          title: "Nhận biết dấu hiệu trầm cảm",
          source: "CDC",
          readTime: "8 phút",
          summary: "Cách nhận biết và xử lý các triệu chứng trầm cảm sớm"
        },
        {
          title: "Cải thiện chất lượng giấc ngủ",
          source: "Bộ Y tế",
          readTime: "5 phút",
          summary: "Những thói quen giúp có giấc ngủ chất lượng hơn"
        }
      ]
    }
  ];

  const featuredArticles = [
    {
      title: "Hướng dẫn khám sức khỏe định kỳ theo từng độ tuổi",
      source: "WHO",
      category: "Khám sức khỏe",
      readTime: "12 phút",
      image: "🩺",
      summary: "Lịch khám sức khỏe định kỳ được khuyến nghị cho từng nhóm tuổi"
    },
    {
      title: "Chương trình tiêm chủng quốc gia mới nhất",
      source: "Bộ Y tế",
      category: "Tiêm chủng",
      readTime: "8 phút",
      image: "💉",
      summary: "Cập nhật lịch tiêm chủng và vaccine mới được đưa vào chương trình"
    },
    {
      title: "Xu hướng dịch bệnh mùa đông 2024",
      source: "CDC",
      category: "Dịch tễ",
      readTime: "6 phút",
      image: "🦠",
      summary: "Dự báo và cách phòng chống các bệnh thường gặp trong mùa đông"
    }
  ];

  const filteredArticles = categories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }));

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
              <FileText className="text-primary-dark" size={32} />
              <h1 className="text-3xl font-bold text-foreground">Thông tin y tế</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Thông tin y tế đáng tin cậy từ WHO, CDC và Bộ Y tế Việt Nam. 
              Cập nhật liên tục các kiến thức mới nhất về sức khỏe.
            </p>
          </div>

          {/* Search */}
          <Card className="mb-8 border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Tìm kiếm thông tin y tế..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Featured Articles */}
          {!searchQuery && (
            <Card className="mb-8 border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="text-primary" size={24} />
                  Bài viết nổi bật
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredArticles.map((article, index) => (
                    <div key={index} className="group cursor-pointer">
                      <div className="text-4xl mb-4 text-center">{article.image}</div>
                      <Badge variant="outline" className="mb-2">{article.category}</Badge>
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-smooth">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Globe size={12} />
                          <span>{article.source}</span>
                        </div>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Categories */}
          <Tabs defaultValue="prevention" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  <category.icon size={16} />
                  {category.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {filteredArticles.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <Card className="border-0 shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className={category.color} size={24} />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {category.articles.length > 0 ? (
                      <div className="space-y-4">
                        {category.articles.map((article, index) => (
                          <div key={index} className="p-4 rounded-lg border hover:shadow-medium transition-smooth cursor-pointer group">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-smooth">
                                {article.title}
                              </h3>
                              <Badge variant="outline">{article.source}</Badge>
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">
                              {article.summary}
                            </p>
                            <div className="flex items-center justify-between">
                              <Button variant="ghost" size="sm" className="h-auto p-0 text-primary">
                                Đọc thêm →
                              </Button>
                              <span className="text-xs text-muted-foreground">
                                {article.readTime}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Không tìm thấy bài viết nào phù hợp với từ khóa "{searchQuery}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Trust Sources */}
          <Card className="mt-8 border-0 bg-primary/5">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <Shield className="text-primary mx-auto mb-2" size={32} />
                <h3 className="font-semibold text-foreground">Nguồn tin đáng tin cậy</h3>
              </div>
              <p className="text-muted-foreground text-sm text-center mb-4">
                Tất cả thông tin được tham khảo và xác thực từ các tổ chức y tế uy tín:
              </p>
              <div className="flex justify-center items-center gap-8 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  <span>World Health Organization (WHO)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  <span>Centers for Disease Control (CDC)</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Heart size={16} />
                  <span>Bộ Y tế Việt Nam</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthInformation;