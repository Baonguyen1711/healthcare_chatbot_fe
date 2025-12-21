import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLatestBillTest } from "@/hooks/use-billing";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const BillingTestSimple = () => {
    const { bill, loading, error, refetch } = useLatestBillTest();

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

                <h1 className="text-3xl font-bold mb-8 text-center">🧪 Test Billing API (User U001)</h1>

                {/* Environment Info */}
                <Card className="mb-6 border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-lg">📋 Thông tin API</CardTitle>
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
                            <code className="bg-white px-2 py-1 rounded">/billing/test/latest</code>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Method:</span>
                            <code className="bg-white px-2 py-1 rounded">GET</code>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Authentication:</span>
                            <code className="bg-white px-2 py-1 rounded text-green-600">❌ Không cần</code>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Test UserId:</span>
                            <code className="bg-white px-2 py-1 rounded font-bold">U001</code>
                        </div>
                    </CardContent>
                </Card>

                {/* Test Button */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>🎯 Test API</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => {
                                console.log("🔘 Button clicked!");
                                refetch();
                            }}
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    Đang gọi API...
                                </>
                            ) : (
                                "🚀 Test API - Lấy bill của User U001"
                            )}
                        </Button>
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
                                        2. Server backend đã chạy chưa?<br />
                                        3. CORS đã được cấu hình chưa?<br />
                                        4. Xem Network tab trong DevTools (F12)
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
                                            <span className="text-gray-600">Ngày khám:</span>
                                            <p className="font-medium">
                                                {new Date(bill.visitDate).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Loại BHYT:</span>
                                            <p className="font-medium">{bill.insuranceType}</p>
                                        </div>
                                    </div>

                                    {/* Hospital Info */}
                                    <div className="border-t pt-3 mt-3">
                                        <h5 className="font-semibold text-gray-700 mb-2">🏥 Thông tin bệnh viện:</h5>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-600">Bệnh viện:</span>
                                                <p className="font-medium">{bill.hospitalName}</p>
                                            </div>
                                            {bill.hospitalAddress && (
                                                <div>
                                                    <span className="text-gray-600">Địa chỉ:</span>
                                                    <p className="font-medium">{bill.hospitalAddress}</p>
                                                </div>
                                            )}
                                            {bill.doctorName && (
                                                <div>
                                                    <span className="text-gray-600">Bác sĩ:</span>
                                                    <p className="font-medium">{bill.doctorName}</p>
                                                </div>
                                            )}
                                            {bill.department && (
                                                <div>
                                                    <span className="text-gray-600">Khoa:</span>
                                                    <p className="font-medium">{bill.department}</p>
                                                </div>
                                            )}
                                            {bill.diagnosis && (
                                                <div>
                                                    <span className="text-gray-600">Chẩn đoán:</span>
                                                    <p className="font-medium">{bill.diagnosis}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Services */}
                                    <div className="border-t pt-3 mt-3">
                                        <h5 className="font-semibold text-gray-700 mb-2">💊 Dịch vụ ({bill.services?.length || 0}):</h5>
                                        <div className="space-y-2">
                                            {bill.services?.map((service, idx) => (
                                                <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                                    <div>
                                                        <span className="font-medium">{service.serviceName}</span>
                                                        {service.quantity > 1 && (
                                                            <span className="text-gray-500 ml-2">x{service.quantity}</span>
                                                        )}
                                                    </div>
                                                    <span className="font-medium">{service.totalPrice.toLocaleString('vi-VN')} ₫</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Billing Summary */}
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

                                    {/* Payment Info */}
                                    {(bill.paymentStatus || bill.paymentMethod) && (
                                        <div className="border-t pt-3 mt-3">
                                            <h5 className="font-semibold text-gray-700 mb-2">💳 Thông tin thanh toán:</h5>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                {bill.paymentStatus && (
                                                    <div>
                                                        <span className="text-gray-600">Trạng thái:</span>
                                                        <p className="font-medium">
                                                            <span className={`inline-block px-2 py-1 rounded text-xs ${bill.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {bill.paymentStatus}
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}
                                                {bill.paymentMethod && (
                                                    <div>
                                                        <span className="text-gray-600">Phương thức:</span>
                                                        <p className="font-medium">{bill.paymentMethod}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Note */}
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
                        <CardTitle className="text-lg">💡 Thông tin</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <strong>✅ Endpoint test này:</strong>
                            <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                                <li>Không cần JWT token</li>
                                <li>Luôn trả về dữ liệu của userId = U001</li>
                                <li>Dùng để test nhanh mà không cần đăng nhập</li>
                            </ul>
                        </div>
                        <div>
                            <strong>🔐 Endpoint chính (/billing/latest):</strong>
                            <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                                <li>Yêu cầu JWT token trong Authorization header</li>
                                <li>Tự động lấy userId từ token</li>
                                <li>Dùng cho production</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BillingTestSimple;
