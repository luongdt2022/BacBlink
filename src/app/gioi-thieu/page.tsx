import React from "react";
import Link from "next/link";
import {
  Landmark,
  Layers,
  Users,
  Database,
  Radar,
  Calendar,
  Building,
  Target,
  FileCheck2,
  PhoneCall,
  Mail,
  MapPin,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  GraduationCap
} from "lucide-react";

export const metadata = {
  title: "Giới Thiệu Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK)",
  description: "Thành lập theo Quyết định số 1652/QĐ-UBND ngày 16/06/2025 của Chủ tịch UBND tỉnh Bắc Ninh. Trụ sở: Số 7 Lý Thái Tổ, P. Suối Hoa, TP. Bắc Ninh.",
};

export default function GioiThieuPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* HERO BANNER SECTION */}
      <section className="relative overflow-hidden workspace-banner text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-brand-800 shadow-md">
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-brand-100 border border-white/20 text-xs font-semibold backdrop-blur-sm">
            <Landmark className="w-4 h-4 text-brand-200" />
            <span>Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh • Quyết định số 1652/QĐ-UBND ngày 16/06/2025</span>
          </div>

          <h1 className="type-page-title text-white">
            BACLINK — Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh
          </h1>

          <p className="text-white/85 type-body max-w-3xl">
            Tổ chức xã hội - nghề nghiệp tự nguyện của các doanh nghiệp, tổ chức và chuyên gia hoạt động trong lĩnh vực sản xuất công nghiệp và công nghiệp hỗ trợ trên địa bàn tỉnh Bắc Ninh. Cầu nối thúc đẩy liên kết chuỗi cung ứng giữa doanh nghiệp FDI và doanh nghiệp sản xuất nội địa.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/chao-ban-cong-nghe"
              className="px-5 py-2.5 rounded-control bg-white hover:bg-slate-100 text-brand-700 text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Layers className="w-4 h-4 text-brand-700" />
              <span>Khám Phá Sàn Cung Ứng</span>
            </Link>
            <Link
              href="/experts"
              className="px-5 py-2.5 rounded-control bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/25 transition flex items-center gap-2 backdrop-blur-sm cursor-pointer"
            >
              <Users className="w-4 h-4 text-white/80" />
              <span>Ban Cố Vấn Kỹ Thuật</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 TRỤ CỘT CHIẾN LƯỢC */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-teal-400">
            Trọng Tâm Hoạt Động
          </span>
          <h2 className="type-section-title text-slate-900 dark:text-white">
            3 Trụ Cột Phát Triển BACLINK
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Liên kết mạng lưới 13 Khu công nghiệp trọng điểm và nâng chuẩn năng lực hội viên đáp ứng chuỗi giá trị toàn cầu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center dark:bg-brand-950 dark:text-brand-300">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Danh Bạ Hội Viên KCN</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Dữ liệu năng lực nhà máy, máy móc thiết bị và chứng chỉ ISO/IATF 16949 tại 13 KCN Yên Phong, Quế Võ, VSIP, Tiên Sơn...
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center dark:bg-teal-950 dark:text-teal-300">
              <Radar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Radar AI Ghép Nối B2B</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Tự động ghép nối bài toán đặt hàng gia công, linh kiện cơ khí, điện tử của tập đoàn FDI với nhà máy nội địa phù hợp.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center dark:bg-amber-950 dark:text-amber-300">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Xúc Tiến Giao Thương & MOU</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Tổ chức các phiên B2B Matching, triển lãm sản phẩm công nghiệp hỗ trợ và ký kết biên bản ghi nhớ hợp tác số có chứng thực.
            </p>
          </div>
        </div>
      </section>

      {/* TỔ CHỨC & BỘ MÁY LÃNH ĐẠO HIỆP HỘI */}
      <section className="bg-slate-100 py-10 sm:py-12 px-4 sm:px-6 lg:px-8 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-teal-400">
              Tổ Chức & Pháp Lý
            </span>
            <h2 className="type-section-title text-slate-900 dark:text-white">
              Cơ Cấu Tổ Chức Nhiệm Kỳ I (2025 – 2028)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh được thành lập theo Quyết định số 1652/QĐ-UBND ngày 16/06/2025 của Chủ tịch UBND tỉnh Bắc Ninh. Đại hội lần thứ I đã bầu ra Ban Chấp hành gồm 28 thành viên đại diện cho các doanh nghiệp công nghiệp tiêu biểu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
              <Target className="w-6 h-6 text-brand-700" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Chủ Tịch Hiệp Hội</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Bà Trần Thị Thu Trang</strong> — Chủ tịch HĐQT kiêm Tổng Giám đốc Công ty CP Hanel PT, lãnh đạo chiến lược kết nối mạng lưới hội viên.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
              <Building className="w-6 h-6 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Trụ Sở Chính Thức</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Số 7 Lý Thái Tổ, Phường Suối Hoa, Thành phố Bắc Ninh, Tỉnh Bắc Ninh. Vị trí trung tâm kết nối các KCN trên toàn tỉnh.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 dark:border-slate-800 dark:bg-slate-900">
              <FileCheck2 className="w-6 h-6 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Ban Cố Vấn & Chuyên Gia</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Đội ngũ cố vấn chuyên môn đầu ngành về tự động hóa, IATF 16949, Lean/5S, chuyển đổi số MES và chuyển đổi xanh ESG.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 text-center space-y-6">
        <h2 className="type-section-title text-slate-900 dark:text-white">
          Sẵn Sàng Gia Nhập Mạng Lưới BACLINK?
        </h2>
        <p className="text-xs text-slate-500 max-w-xl mx-auto">
          Đăng ký Doanh nghiệp Hội viên ngay hôm nay để tham gia chuỗi cung ứng FDI, tiếp cận bài toán đặt hàng lớn và nhận tư vấn cải tiến năng lực từ Ban Cố vấn Kỹ thuật.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/register"
            className="px-6 py-2.5 rounded-xl bg-brand-700 text-white font-bold text-xs shadow-md hover:bg-brand-800 transition"
          >
            Đăng Ký Hội Viên Ngay
          </Link>
          <Link
            href="/dich-vu-khac"
            className="px-6 py-2.5 rounded-xl border border-slate-300 font-bold text-xs hover:bg-slate-50 transition dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Tìm Hiểu Dịch Vụ Hỗ Trợ
          </Link>
        </div>
      </section>
    </main>
  );
}
