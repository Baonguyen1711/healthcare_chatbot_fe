import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Article } from "@/services/healthInfoService";

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
}

const ArticleDetail = ({ article, onBack }: ArticleDetailProps) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={20} className="mr-2" />
            Quay lại danh sách
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                {article.emoji && (
                  <span className="text-4xl">{article.emoji}</span>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {getSourceDisplay(article.source)}
                    </Badge>
                    <Badge variant="secondary">
                      {getCategoryName(article.category)}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {article.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatDate(article.createdAt)}</span>
                    <span>•</span>
                    <span>{article.views} lượt xem</span>
                  </div>
                </div>
              </div>

              {article.keywords && article.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {article.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {article.content}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <ExternalLink size={16} />
                  Xem nguồn gốc
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
