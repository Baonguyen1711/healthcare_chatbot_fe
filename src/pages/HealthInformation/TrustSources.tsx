import { Card, CardContent } from "@/components/ui/card";
import { Shield, Globe, Heart } from "lucide-react";

const TrustSources = () => {
  return (
    <Card className="mt-8 border-0 bg-blue-50">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <Shield className="text-blue-600 mx-auto mb-2" size={32} />
          <h3 className="font-semibold text-gray-900">
            Nguồn tin đáng tin cậy
          </h3>
        </div>
        <p className="text-gray-600 text-sm text-center mb-4">
          Tất cả thông tin được tham khảo và xác thực từ các tổ chức y tế uy
          tín:
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4 text-sm font-medium text-gray-600">
          <div className="flex items-center gap-2">
            <Globe size={16} />
            <span>World Health Organization (WHO)</span>
          </div>
          <span className="hidden md:inline">•</span>
          <div className="flex items-center gap-2">
            <Globe size={16} />
            <span>Centers for Disease Control (CDC)</span>
          </div>
          <span className="hidden md:inline">•</span>
          <div className="flex items-center gap-2">
            <Heart size={16} />
            <span>Bộ Y tế Việt Nam</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrustSources;
