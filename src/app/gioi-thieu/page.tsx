import React from "react";
import Link from "next/link";
import {
  Landmark,
  Layers,
  Users,
  Database,
  Award,
  Radar,
  Calendar,
  Building,
  Target,
  FileCheck2,
  PhoneCall,
  Mail,
  MapPin,
  ArrowRight,
  ExternalLink
} from "lucide-react";

export const metadata = {
  title: "Giới Thiệu Viện NacenTech & Nền Tảng NacenTwin",
  description: "Cầu nối số hóa hệ sinh thái đổi mới sáng tạo quốc gia trực thuộc Bộ Khoa học và Công nghệ.",
};

export default function GioiThieuPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* HERO BANNER SECTION (CHUẨN DESIGN SYSTEM NACENTWIN) */}
      <section className="relative overflow-hidden bg-brand-700 text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-brand-800 shadow-md">
        <div aria-hidden="true" className="innovation-hero-art pointer-events-none absolute inset-0 opacity-80" />
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-brand-100 border border-white/20 text-xs font-semibold backdrop-blur-sm">
            <Landmark className="w-4 h-4 text-brand-200" />
            <span>Bộ Khoa học và Công nghệ • Viện Đổi Mới Sáng Tạo Quốc Gia</span>
          </div>

          <h1 className="type-page-title text-white">
            NacenTwin — Cầu Nối Số Hóa Hệ Sinh Thái Đổi Mới Sáng Tạo Quốc Gia
          </h1>

          <p className="text-white/85 type-body max-w-3xl">
            Nền tảng "Bản sao số" (Digital Twin) kết nối cung - cầu công nghệ, chuẩn hóa định giá và đánh giá năng lực công nghệ doanh nghiệp theo Thông tư 17/2019/TT-BKHCN, quy tụ hơn 300+ doanh nghiệp KH&CN và 500+ chuyên gia đầu ngành.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/chao-ban-cong-nghe"
              className="px-5 py-2.5 rounded-control bg-white hover:bg-slate-100 text-brand-700 text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Layers className="w-4 h-4 text-brand-700" />
              <span>Khám Phá Sàn Công Nghệ</span>
            </Link>
            <Link
              href="/experts"
              className="px-5 py-2.5 rounded-control bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/25 transition flex items-center gap-2 backdrop-blur-sm cursor-pointer"
            >
              <Users className="w-4 h-4 text-white/80" />
              <span>Mạng Lưới Chuyên Gia</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 TRỤ CỘT CHIẾN LƯỢC */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-teal-400">
            Kiến Trúc Nền Tảng
          </span>
          <h2 className="type-section-title text-slate-900 dark:text-white">
            4 Trụ Cột Vận Hành Cốt Lõi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Được thiết kế theo tiêu chuẩn công nghệ mở, bảo vệ dữ liệu PDPD và liên thông CSDL quốc gia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center dark:bg-brand-950 dark:text-brand-300">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">CSDL Doanh Nghiệp & Chuyên Gia</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Dữ liệu định danh doanh nghiệp KH&CN, hồ sơ lý lịch khoa học số (LLKH) đã được xác minh bởi các Sở KH&CN.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950 dark:text-emerald-300">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Bộ Tiêu Chí TT17/2019</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Quy trình đánh giá trình độ và năng lực công nghệ doanh nghiệp 26 tiêu chí thuộc 5 nhóm T-E-O-R-I với báo cáo Phụ lục II & IV.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center dark:bg-teal-950 dark:text-teal-300">
              <Radar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Radar AI Ghép Nối</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Thuật toán phân tích ngữ nghĩa matching giữa bài toán của bên mua (Buyer) và sáng chế/giải pháp TRL của bên bán (Seller).
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center dark:bg-amber-950 dark:text-amber-300">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Sàn Chào Giá Techmart</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Không gian trưng bày trực tuyến các kỳ triển lãm Techmart, Techfest và hội chợ giao thương khoa học công nghệ.
            </p>
          </div>
        </div>
      </section>

      {/* SỨ MỆNH & CHỨC NĂNG CỦA VIỆN */}
      <section className="bg-slate-100 py-10 sm:py-12 px-4 sm:px-6 lg:px-8 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-teal-400">
              Thể Chế & Tổ Chức
            </span>
            <h2 className="type-section-title text-slate-900 dark:text-white">
              Viện Đổi Mới Sáng Tạo Quốc Gia (NacenTech)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Viện Đổi Mới Sáng Tạo Quốc Gia là tổ chức khoa học và công nghệ công lập trực thuộc Bộ Khoa học và Công nghệ, giữ vai trò đầu mối nghiên cứu, ươm tạo, chuyển giao công nghệ và thúc đẩy hệ sinh thái đổi mới sáng tạo quốc gia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
              <Target className="w-6 h-6 text-brand-700" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Sứ Mệnh Tiên Phong</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Nghiên cứu, tiếp nhận và chuyển giao các thành tựu khoa học kỹ thuật tiên tiến nhất vào sản xuất công nghiệp và đời sống.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
              <Building className="w-6 h-6 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Hệ Thống Phân Viện</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Mạng lưới các trung tâm nghiên cứu chuyên ngành tại Hà Nội, TP. Hồ Chí Minh và các vùng kinh tế trọng điểm.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
              <FileCheck2 className="w-6 h-6 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Thẩm Định & Định Giá</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Đơn vị đầu mối tư vấn định giá tài sản trí tuệ, thẩm định hồ sơ công nghệ và xếp hạng năng lực doanh nghiệp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 text-center space-y-6">
        <h2 className="type-section-title text-slate-900 dark:text-white">
          Sẵn Sàng Gia Nhập Hệ Sinh Thái NacenTwin?
        </h2>
        <p className="text-xs text-slate-500 max-w-xl mx-auto">
          Đăng ký tài khoản ngay hôm nay để đưa bài toán kỹ thuật hoặc giải pháp công nghệ của bạn đến mạng lưới hơn 300+ doanh nghiệp và viện nghiên cứu.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/register"
            className="px-6 py-2.5 rounded-xl bg-brand-700 text-white font-bold text-xs shadow-md hover:bg-brand-800 transition"
          >
            Đăng Ký Thành Viên Ngay
          </Link>
          <Link
            href="/dich-vu-khac"
            className="px-6 py-2.5 rounded-xl border border-slate-300 font-bold text-xs hover:bg-slate-50 transition dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Tìm Hiểu Dịch Vụ SHTT
          </Link>
        </div>
      </section>
    </main>
  );
}
