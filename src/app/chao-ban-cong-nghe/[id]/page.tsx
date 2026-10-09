"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  Award,
  Building2,
  FileText,
  Lock,
  Download,
  Share2,
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { fetchOfferById } from "@/services/api/technology-offer";
import { TechnologyOffer } from "@/types/technology-offer";

export default function ChiTietChaoBanPage() {
  const params = useParams();
  const id = params?.id as string;

  const [offer, setOffer] = useState<TechnologyOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "dataroom">("overview");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetchOfferById(id).then((data) => {
        setOffer(data);
        setIsLoading(false);
      });
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4 max-w-md w-full animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          <div className="h-24 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Không tìm thấy hồ sơ công nghệ</h2>
          <p className="text-xs text-slate-500">Hồ sơ này không tồn tại hoặc đã được chuyển vào kho lưu trữ.</p>
          <Link
            href="/chao-ban-cong-nghe"
            className="inline-flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại sàn giao dịch
          </Link>
        </div>
      </div>
    );
  }

  const getTrlDescription = (level?: number | null) => {
    switch (level) {
      case 9:
        return "Hệ thống đã hoàn thiện và vận hành thương mại thành công trên quy mô công nghiệp.";
      case 8:
        return "Hệ thống hoàn chỉnh và đạt đầy đủ các tiêu chuẩn kiểm định thực tế.";
      case 7:
        return "Nguyên mẫu quy mô bán công nghiệp đã được thử nghiệm vận hành tại hiện trường.";
      case 6:
        return "Mô hình thử nghiệm quy mô pilot đã kiểm chứng trong môi trường mô phỏng.";
      default:
        return "Công nghệ đang trong giai đoạn phát triển và hoàn thiện các bước R&D tiếp theo.";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* BREADCRUMB HEADER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/chao-ban-cong-nghe"
            className="text-xs font-bold text-slate-600 hover:text-emerald-600 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Về danh sách chào bán
          </Link>

          <div className="flex items-center gap-2">
            <span className="mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {offer.offerCode}
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {offer.status === "APPROVED" ? "Đã xác thực & Niêm yết" : "Đang xử lý"}
            </span>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg">
              {offer.sectorName}
            </span>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
              {offer.offerType === "SOLUTION" ? "Giải pháp công nghệ" : "Thiết bị công nghiệp"}
            </span>
            {offer.hasTechTransfer && (
              <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Có chuyển giao SHTT
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {offer.title}
          </h1>

          {offer.developerOrigin && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Đơn vị nghiên cứu / Sở hữu:</span>
              <strong className="text-slate-900">{offer.developerOrigin}</strong>
            </div>
          )}
        </div>
      </section>

      {/* BODY CONTENT & SIDEBAR */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT NỘI DUNG CHÍNH (2 CỘT) */}
        <div className="lg:col-span-2 space-y-6">
          {/* KHỐI BỘ TỨ SHTT & TRL NỔI BẬT */}
          {offer.hasTechTransfer && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                <h3 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Bộ Tứ Sở Hữu Trí Tuệ & Mức Độ Sẵn Sàng Công Nghệ (IP Quad)
                </h3>
                <span className="text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  Chuẩn hóa NacenTwin
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Thang TRL */}
                <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    1. Mức Độ Sẵn Sàng (TRL)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-emerald-700">
                      TRL {offer.trlLevel || 8}/9
                    </span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                      Bán công nghiệp & Đạt chuẩn
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
                    {getTrlDescription(offer.trlLevel)}
                  </p>
                </div>

                {/* 2. Tình trạng SHTT */}
                <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    2. Bản Quyền & SHTT
                  </span>
                  <p className="text-xs font-extrabold text-slate-900">
                    {offer.ipStatus === "PATENT_GRANTED" && "Bằng Độc Quyền Sáng Chế"}
                    {offer.ipStatus === "UTILITY_MODEL" && "Giải Pháp Hữu Ích Đã Cấp"}
                    {offer.ipStatus === "TRADE_SECRET" && "Bí Quyết Công Nghệ (Know-how)"}
                    {!offer.ipStatus && "Chưa xác định"}
                  </p>
                  {offer.ipRegistrationNumber && (
                    <div className="mono text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded inline-block border border-emerald-200">
                      Số văn bằng: {offer.ipRegistrationNumber}
                    </div>
                  )}
                </div>

                {/* 3. Hình thức chuyển giao */}
                <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    3. Hình Thức Chuyển Giao
                  </span>
                  <p className="text-xs font-extrabold text-slate-900">
                    {offer.transferMethod === "EXCLUSIVE_LICENSE" && "Li-xăng độc quyền"}
                    {offer.transferMethod === "NON_EXCLUSIVE_LICENSE" && "Li-xăng không độc quyền"}
                    {offer.transferMethod === "ASSIGNMENT_SALE" && "Chuyển nhượng toàn bộ quyền"}
                    {offer.transferMethod === "JOINT_RD" && "Hợp tác R&D đồng phát triển"}
                    {!offer.transferMethod && "Thỏa thuận song phương"}
                  </p>
                  <p className="text-xs text-slate-500">Kèm đào tạo chuyển giao công nghệ</p>
                </div>

                {/* 4. Trạng thái thương mại */}
                <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    4. Trạng Thái Thương Mại
                  </span>
                  <p className="text-xs font-extrabold text-slate-900">
                    {offer.commercialStatus === "COMMERCIALLY_READY" && "Sẵn sàng thương mại hóa"}
                    {offer.commercialStatus === "PILOT_TESTING" && "Vận hành thử nghiệm hiện trường"}
                    {offer.commercialStatus === "LAB_PROTOTYPE" && "Nguyên mẫu phòng thí nghiệm"}
                    {!offer.commercialStatus && "Đang cập nhật"}
                  </p>
                  <p className="text-xs text-slate-500">Có dây chuyền mẫu để thẩm định</p>
                </div>
              </div>
            </div>
          )}

          {/* TABS NỘI DUNG CHI TIẾT */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 text-xs font-bold">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-3 border-b-2 transition ${
                  activeTab === "overview"
                    ? "border-emerald-600 text-emerald-800"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Tổng Quan & Bài Toán Giải Quyết
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={`pb-3 border-b-2 transition ${
                  activeTab === "specs"
                    ? "border-emerald-600 text-emerald-800"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Thông Số Kỹ Thuật (18 Ngành)
              </button>
              <button
                onClick={() => setActiveTab("dataroom")}
                className={`pb-3 border-b-2 transition ${
                  activeTab === "dataroom"
                    ? "border-emerald-600 text-emerald-800"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Hồ Sơ DataRoom & Tài Liệu
              </button>
            </div>

            <div className="p-6 space-y-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                      Mô Tả Tóm Tắt Giải Pháp
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{offer.summary}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                      Bài Toán Kỹ Thuật Giải Quyết Cho Bên Mua
                    </h4>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm text-slate-700 leading-relaxed">
                      {offer.problemSolved}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "specs" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Bảng Thông Số Kỹ Thuật Chi Tiết
                  </h4>
                  <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 font-bold text-slate-600 w-1/3">Công suất vận hành:</td>
                        <td className="py-2.5 text-slate-900 font-medium">50 - 200 kg nguyên liệu/mẻ</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-slate-600">Áp suất chân không đạt được:</td>
                        <td className="py-2.5 text-slate-900 font-medium">&le; 0.05 mbar (High Vacuum)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-slate-600">Nhiệt độ thăng hoa:</td>
                        <td className="py-2.5 text-slate-900 font-medium">-40°C đến -50°C</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-slate-600">Thuật toán điều khiển:</td>
                        <td className="py-2.5 text-slate-900 font-medium">AI Fuzzy Logic tối ưu nhiệt thời gian thực</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "dataroom" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Danh Mục Tài Liệu Thẩm Định (DataRoom)
                    </h4>
                    <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Yêu cầu ký NDA
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: "Teaser_Tom_Tat_Cong_Nghe.pdf", size: "2.4 MB", isPublic: true },
                      { name: "Ban_Sao_Van_Bang_Sang_Che_Cuc_SHTT.pdf", size: "1.8 MB", isPublic: false },
                      { name: "Ket_Qua_Thu_Nghiem_Hien_Truong_Pilot.pdf", size: "4.1 MB", isPublic: false },
                    ].map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{doc.name}</p>
                            <p className="text-xs text-slate-400">{doc.size}</p>
                          </div>
                        </div>

                        {doc.isPublic ? (
                          <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" /> Tải về
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Cần cấp quyền
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CỘT SIDEBAR HÀNH ĐỘNG (1 CỘT) */}
        <div className="space-y-6">
          {/* Card Giá & Kết nối */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Mức Giá Đề Xuất / Chuyển Giao
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {offer.pricingType === "CONTACT" && "Thỏa Thuận Trực Tiếp"}
                {offer.pricingType === "FIXED" &&
                  offer.priceAmount &&
                  `${(offer.priceAmount / 1_000_000).toLocaleString("vi-VN")} Triệu VND ${
                    offer.unit ? "/" + offer.unit : ""
                  }`}
                {offer.pricingType === "RANGE" &&
                  offer.priceMin &&
                  offer.priceMax &&
                  `${(offer.priceMin / 1_000_000).toLocaleString("vi-VN")} - ${(
                    offer.priceMax / 1_000_000
                  ).toLocaleString("vi-VN")} Triệu VND`}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Đã bao gồm hướng dẫn chuyển giao kỹ thuật</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowConnectModal(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-extrabold transition shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Gửi Yêu Cầu Chuyển Giao / Mua
              </button>

              <button
                onClick={() => setActiveTab("dataroom")}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                Yêu Cầu Truy Cập DataRoom
              </button>
            </div>

            {/* Thông tin hỗ trợ sàn */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1 text-center">
              <p className="text-xs font-bold text-slate-700">Đầu Mối Hỗ Trợ Giao Dịch</p>
              <p className="text-xs font-extrabold text-emerald-800">Hotline Sàn: 1900 6868</p>
              <p className="text-xs text-slate-500">Viện ĐMST Quốc Gia bảo chứng quy trình</p>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL GỬI KẾT NỐI */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                Gửi Yêu Cầu Kết Nối Với Đơn Vị Chào Bán
              </h3>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {connectSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Yêu cầu đã được gửi thành công!</h4>
                <p className="text-xs text-slate-500">
                  Đơn vị chủ quản sẽ liên hệ lại với bạn trong vòng 24 - 48 giờ làm việc.
                </p>
                <button
                  onClick={() => {
                    setShowConnectModal(false);
                    setConnectSuccess(false);
                  }}
                  className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-bold"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setConnectSuccess(true);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Doanh nghiệp / Tổ chức của bạn:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Công ty CP Công Nghệ Xanh"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Người liên hệ:</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Số điện thoại:</label>
                    <input
                      type="tel"
                      required
                      placeholder="0912 345 678"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nội dung đề xuất hợp tác:</label>
                  <textarea
                    rows={3}
                    placeholder="Nêu rõ nhu cầu chuyển giao, li-xăng hoặc mua thiết bị..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  ></textarea>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold"
                  >
                    Xác nhận gửi yêu cầu
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
