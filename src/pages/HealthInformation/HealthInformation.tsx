import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  ArrowLeft,
  Search,
  Shield,
  Brain,
  Utensils,
  Loader2,
} from "lucide-react";
import { Article } from "@/services/healthInfoService";
import {
  useArticles,
  useAllArticles,
  useArticleById,
} from "@/hooks/use-healthInfo";
import FeaturedArticles from "./FeaturedArticles";
import AllArticles from "./AllArticles";
import CategoryArticles from "./CategoryArticles";
import TrustSources from "./TrustSources";
import ArticleDetail from "./ArticleDetail";

const HealthInformation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | undefined>(
    undefined
  );
  const [tab, setTab] = useState<string>("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null
  );

  const handleTabChange = (value: string) => {
    setTab(value);

    if (value === "all") {
      setActiveCategory(undefined);
    } else {
      setActiveCategory(Number(value));
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch featured articles (top 6)
  const { articles: featuredArticles, loading: featuredLoading } =
    useAllArticles({ limit: 3 });

  // Fetch articles based on search/category
  const { articles, loading, error } = useArticles({
    keyword: debouncedSearch || undefined,
    category: activeCategory,
    limit: 50,
  });

  // Fetch selected article by ID
  const { article: selectedArticle, loading: articleLoading } =
    useArticleById(selectedArticleId);

  const categories = [
    {
      id: 1,
      key: "prevention",
      title: "Phòng ngừa",
      icon: Shield,
      color: "text-green-600",
    },
    {
      id: 2,
      key: "nutrition",
      title: "Dinh dưỡng",
      icon: Utensils,
      color: "text-blue-600",
    },
    {
      id: 3,
      key: "mental-health",
      title: "Sức khỏe tâm thần",
      icon: Brain,
      color: "text-purple-600",
    },
  ];

  const getCategoryArticles = (categoryId: number) => {
    return articles.filter(
      (article) => article.category === categoryId.toString()
    );
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticleId(article.id);
  };

  const handleBackToList = () => {
    setSelectedArticleId(null);
  };

  // If an article is selected, show detail view
  if (selectedArticleId) {
    if (articleLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="text-gray-600">Đang tải bài viết...</span>
          </div>
        </div>
      );
    }

    if (selectedArticle) {
      return (
        <ArticleDetail article={selectedArticle} onBack={handleBackToList} />
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-red-600">Không tìm thấy bài viết</p>
            <Button onClick={handleBackToList} className="mt-4">
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Otherwise, show list view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={20} className="mr-2" />
            Về trang chủ
          </Button>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <FileText className="text-blue-600" size={32} />
              <h1 className="text-3xl font-bold text-gray-900">
                Thông tin y tế
              </h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Thông tin y tế đáng tin cậy từ WHO, CDC và Bộ Y tế Việt Nam. Cập
              nhật liên tục các kiến thức mới nhất về sức khỏe.
            </p>
          </div>

          {/* Search */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  placeholder="Tìm kiếm thông tin y tế..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Featured Articles - only show when no search query */}
          {!searchQuery && !featuredLoading && featuredArticles.length > 0 && (
            <FeaturedArticles
              articles={featuredArticles}
              onArticleClick={handleArticleClick}
            />
          )}

          {/* Categories Tabs */}
          <Tabs
            value={tab}
            className="space-y-6"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Tất cả</TabsTrigger>

              {categories.map((category) => (
                <TabsTrigger
                  key={category.key}
                  value={category.id.toString()}
                  className="flex items-center gap-2"
                >
                  <category.icon size={16} />
                  {category.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Content with loading state */}
            <TabsContent value="all">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                  <span className="ml-3 text-gray-600">
                    Đang tải dữ liệu...
                  </span>
                </div>
              ) : error ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <p className="text-red-600">{error}</p>
                  </CardContent>
                </Card>
              ) : (
                <AllArticles
                  articles={articles}
                  onArticleClick={handleArticleClick}
                />
              )}
            </TabsContent>

            {categories.map((category) => (
              <TabsContent key={category.key} value={category.id.toString()}>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <span className="ml-3 text-gray-600">
                      Đang tải dữ liệu...
                    </span>
                  </div>
                ) : error ? (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-8 text-center">
                      <p className="text-red-600">{error}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <CategoryArticles
                    category={category}
                    articles={getCategoryArticles(category.id)}
                    onArticleClick={handleArticleClick}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Trust Sources */}
          <TrustSources />
        </div>
      </div>
    </div>
  );
};

export default HealthInformation;
