import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLatestBillWithUserId } from "@/hooks/use-billing";
import { jwtDecode } from "jwt-decode";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const BillingTest = () => {
    const [autoUserId, setAutoUserId] = useState<string | null>(null);
    const [testUserId, setTestUserId] = useState<string>("U001"); // Default test userId

    // Tự động lấy userId từ token để hiển thị
    useEffect(() => {
        const idToken = localStorage.getItem("idToken");
        if (idToken) {
            try {
                const decoded: any = jwtDecode(idToken);
                const extractedUserId = decoded.sub || decoded.userId || decoded["cognito:username"];
                setAutoUserId(extractedUserId);
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
    }, []);

    const { bill, loading, error, refetch } = useLatestBillWithUserId(testUserId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/" className="flex items-center gap-2">
                            <ArrowLeft size={20} />
                            Về trang chủ
                        </Link>
                    </Button>
                </div>

                <h1 className="text-3xl font-bold mb-8 text-center">🧪 Test Billing API</h1>

                {/* Environment Info */}
                <Card className="mb-6 border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-lg">📋 Thông tin cấu hình</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="font-medium">API Base URL:</span>
                            <code className="bg-white px-2 py-1 rounded text-xs">
                                {import.meta.env.VITE_BILLING_BASE_URL || "❌ Chưa cấu hình"}
                            </code>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Endpoint:</span>
                            <code className="bg-white px-2 py-1 rounded">/billing/latest</code>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Access Token:</span>
                            <code className="bg-white px-2 py-1 rounded text-xs">
                                {localStorage.getItem("accessToken") ? "✅ Có" : "❌ Không có"}
                            </code>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">User ID (từ token):</span>
                            <code className="bg-white px-2 py-1 rounded text-xs">
                                {autoUserId || "❌ Không tìm thấy"}
                            </code>
                        </div>
                    </CardContent>
                </Card>

                {/* Test Button */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>🎯 Test API Request</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="testUserId" className="text-sm font-medium">
                                User ID để test:
                            </label>
                            <Input
                                id="testUserId"
                                type="text"
                                value={testUserId}
                                onChange={(e) => setTestUserId(e.target.value)}
                                placeholder="Nhập userId (ví dụ: U001)"
                                className="font-mono"
                            />
                            <p className="text-xs text-muted-foreground">
                                💡 Mặc định là "U001". Bạn có thể thay đổi để test với userId khác.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={() => refetch()} disabled={loading || !testUserId} className="flex-1">
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={16} />
                                        Đang gọi API...
                                    </>
                                ) : (
                                    "🚀 Test API với userId: " + testUserId
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin text-blue-600" size={20} />
                                    Đang tải...
                                </>
                            ) : error ? (
                                <>
                                    <XCircle className="text-red-600" size={20} />
                                    Lỗi
                                </>
                            ) : bill ? (
                                <>
                                    <CheckCircle2 className="text-green-600" size={20} />
                                    Thành công
                                </>
                            ) : (
                                "Chưa test"
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading && (
                            <div className="text-center py-8">
                                <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
                                <p className="text-muted-foreground">Đang gọi API...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h3 className="font-semibold text-red-800 mb-2">❌ Lỗi khi gọi API</h3>
                                <p className="text-sm text-red-700 mb-4">{error}</p>

                                <div className="bg-white p-3 rounded border border-red-200">
                                    <p className="text-xs font-mono text-gray-700">
                                        <strong>Kiểm tra:</strong><br />
                                        1. VITE_BILLING_BASE_URL đã cấu hình chưa?<br />
                                        2. Access token có hợp lệ không? (Login lại thử)<br />
                                        3. userId trong token có tồn tại trong DynamoDB không?<br />
                                        4. CORS đã được cấu hình chưa?<br />
                                        5. Xem Network tab trong DevTools (F12)
                                    </p>
                                </div>
                            </div>
                        )}

                        {bill && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="text-green-600" size={20} />
                                    <h3 className="font-semibold text-green-800">✅ API hoạt động tốt!</h3>
                                </div>

                                <div className="bg-white rounded-lg p-4 space-y-3">
                                    <h4 className="font-semibold text-gray-800 mb-3">📊 Dữ liệu trả về:</h4>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-600">User ID:</span>
                                            <p className="font-medium">{bill.userId}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Visit ID:</span>
                                            <p className="font-medium">{bill.visitId}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Bệnh viện:</span>
                                            <p className="font-medium">{bill.hospitalName}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Ngày khám:</span>
                                            <p className="font-medium">
                                                {new Date(bill.visitDate).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Loại BHYT:</span>
                                            <p className="font-medium">{bill.insuranceType}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Số dịch vụ:</span>
                                            <p className="font-medium">{bill.services.length}</p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-3 mt-3">
                                        <h5 className="font-semibold text-gray-700 mb-2">Dịch vụ:</h5>
                                        <div className="space-y-2">
                                            {bill.services.map((service, idx) => (
                                                <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                                    <span>{service.serviceName}</span>
                                                    <span className="font-medium">{service.totalPrice.toLocaleString('vi-VN')} ₫</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t pt-3 mt-3 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tổng chi phí:</span>
                                            <span className="font-semibold">{bill.totalBasePrice.toLocaleString('vi-VN')} ₫</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">BHYT chi trả:</span>
                                            <span className="font-semibold text-green-600">
                                                -{bill.totalInsuranceCovered.toLocaleString('vi-VN')} ₫
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                                            <span>Bệnh nhân trả:</span>
                                            <span className="text-blue-600">{bill.totalPatientPay.toLocaleString('vi-VN')} ₫</span>
                                        </div>
                                    </div>

                                    {bill.note && (
                                        <div className="border-t pt-3 mt-3">
                                            <span className="text-gray-600 text-sm">Ghi chú:</span>
                                            <p className="text-sm mt-1">{bill.note}</p>
                                        </div>
                                    )}
                                </div>

                                <details className="bg-white rounded-lg p-4">
                                    <summary className="cursor-pointer font-medium text-gray-700">
                                        🔍 Xem JSON Response
                                    </summary>
                                    <pre className="mt-3 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-96">
                                        {JSON.stringify(bill, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        )}

                        {!loading && !error && !bill && (
                            <div className="text-center py-8 text-muted-foreground">
                                Nhấn "Test API" để bắt đầu
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="border-purple-200 bg-purple-50">
                    <CardHeader>
                        <CardTitle className="text-lg">💡 Hướng dẫn test</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <strong>1. Đảm bảo đã login:</strong>
                            <p className="text-gray-600 mt-1">
                                Bạn cần login trước để có JWT token
                            </p>
                        </div>
                        <div>
                            <strong>2. Kiểm tra userId trong DynamoDB:</strong>
                            <p className="text-gray-600 mt-1">
                                userId từ token ({autoUserId || "N/A"}) phải tồn tại trong table HospitalBills
                            </p>
                        </div>
                        <div>
                            <strong>3. Xem kết quả:</strong>
                            <p className="text-gray-600 mt-1">
                                Nếu thành công sẽ hiển thị dữ liệu viện phí. Nếu lỗi, mở DevTools (F12) để xem chi tiết.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BillingTest;
