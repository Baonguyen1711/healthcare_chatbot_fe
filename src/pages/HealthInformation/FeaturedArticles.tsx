import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ExternalLink } from "lucide-react";
import { Article } from "@/services/healthInfoService";

interface FeaturedArticlesProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

const FeaturedArticles = ({
  articles,
  onArticleClick,
}: FeaturedArticlesProps) => {
  const getSourceDisplay = (source: string) => {
    const sourceMap: Record<string, string> = {
      WHO: "WHO",
      CDC: "CDC",
      MOH_VN: "Bộ Y tế",
    };
    return sourceMap[source] || source;
  };

  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      "1": "Phòng ngừa",
      "2": "Dinh dưỡng",
      "3": "Sức khỏe tâm thần",
      "4": "Khác",
    };
    return categoryMap[category] || "Khác";
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-orange-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Bài viết nổi bật</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card
            key={article.id}
            className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
            onClick={() => onArticleClick(article)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{article.emoji || "📄"}</span>
                <Badge variant="outline" className="text-xs">
                  {getSourceDisplay(article.source)}
                </Badge>
              </div>

              <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {article.title}
              </h3>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {article.content}
              </p>

              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {getCategoryName(article.category)}
                </Badge>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  {article.views} lượt xem
                </span>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {article.keywords &&
                    article.keywords.slice(0, 2).map((keyword, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs px-2 py-0"
                      >
                        {keyword}
                      </Badge>
                    ))}
                </div>
                <ExternalLink
                  size={14}
                  className="text-gray-400 group-hover:text-blue-600 transition-colors"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturedArticles;
