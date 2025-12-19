import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, LucideIcon } from "lucide-react";
import { Article } from "@/services/healthInfoService";

interface Category {
  id: number;
  key: string;
  title: string;
  icon: LucideIcon;
  color: string;
}

interface CategoryArticlesProps {
  category: Category;
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

const CategoryArticles = ({
  category,
  articles,
  onArticleClick,
}: CategoryArticlesProps) => {
  const getSourceDisplay = (source: string) => {
    const sourceMap: Record<string, string> = {
      WHO: "WHO",
      CDC: "CDC",
      MOH_VN: "Bộ Y tế",
    };
    return sourceMap[source] || source;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <category.icon className={category.color} size={24} />
          {category.title} ({articles.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => onArticleClick(article)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{article.emoji || "📄"}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      {article.keywords && article.keywords.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {article.keywords.slice(0, 3).map((keyword, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {getSourceDisplay(article.source)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between ml-11">
                  <span className="text-xs text-gray-500">
                    {formatDate(article.createdAt)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {article.views} lượt xem
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p>Không có bài viết nào trong danh mục này</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryArticles;
