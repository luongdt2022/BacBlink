/**
 * Cấu hình 7 menu chính BACLINK — CR-BACLINK-008 (REQ-BL08-IA-001).
 * Theo góp ý khách hàng (260717): 7 menu cấp đầu, không thêm menu cấp đầu khác.
 * Quy tắc: chỉ khai báo menu con khi route đã có nội dung thật (0 link chết).
 * Khi GĐ1–GĐ5 bổ sung trang mới thì thêm vào đây.
 */
import type { ComponentType } from "react";
import { BUSINESS_SERVICES } from "@/lib/constants/services";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Cpu,
  FileSearch,
  FileText,
  Globe,
  GraduationCap,
  HelpCircle,
  Image,
  Megaphone,
  Landmark,
  Layers,
  LogIn,
  Mail,
  Newspaper,
  PlusCircle,
  Radar,
  Scale,
  ShoppingCart,
  Ticket,
  UserPlus,
  Users,
} from "lucide-react";

export interface SubNavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
}

export interface NavItem {
  href: string;
  label: string;
  labelEn: string;
  icon: ComponentType<{ className?: string }>;
  alignRight?: boolean;
  badge?: string;
  /** Các đường dẫn con làm menu này "đang chọn" dù không nằm trong danh sách menu con. */
  activePrefixes?: string[];
  children: SubNavItem[];
}

/** Đích của nút "Gia nhập BACLINK" (wizard 3 bước, CR-BACLINK-008 GĐ1). */
const SERVICE_NAV_ICON: Record<string, ComponentType<{ className?: string }>> = {
  "ho-tro-chinh-sach": Scale,
  "ket-noi-cung-cau": ShoppingCart,
  "dao-tao-nhan-luc": GraduationCap,
  "cong-nghe-chuyen-doi-so": Radar,
  "nang-suat-chat-luong": Award,
  "chuyen-doi-xanh-esg": Globe,
  "xuc-tien-thuong-mai": Megaphone,
  "hop-tac-quoc-te": Globe,
};

export const JOIN_HREF = "/hoi-vien/gia-nhap";
export const SEARCH_HREF = "/tim-kiem";

export const MAIN_NAV: NavItem[] = [
  {
    href: "/gioi-thieu",
    label: "Về BACLINK",
    labelEn: "About",
    activePrefixes: ["/gioi-thieu", "/experts"],
    icon: Landmark,
    children: [
      { href: "/gioi-thieu", label: "Tổng quan, tầm nhìn & pháp lý", icon: Landmark },
      { href: "/gioi-thieu/co-cau-to-chuc", label: "Cơ cấu tổ chức & 9 ban chuyên môn", icon: Layers },
      { href: "/gioi-thieu/dieu-le", label: "Điều lệ & quy chế", icon: Scale },
      { href: "/gioi-thieu/bao-cao-thuong-nien", label: "Thành tựu & báo cáo thường niên", icon: FileText },
      { href: "/experts", label: "Ban Cố vấn Kỹ thuật", icon: Award },
    ],
  },
  {
    href: "/hoi-vien",
    label: "Hội viên",
    labelEn: "Members",
    activePrefixes: ["/hoi-vien", "/enterprises"],
    icon: Users,
    children: [
      { href: "/hoi-vien", label: "Quyền lợi, đối tượng & hội phí", icon: Award },
      { href: "/hoi-vien#quy-trinh", label: "Quy trình gia nhập", icon: Layers },
      { href: JOIN_HREF, label: "Đăng ký hội viên", icon: UserPlus },
      { href: "/enterprises", label: "Danh bạ hội viên", icon: Building2 },
      { href: "/hoi-vien/tieu-bieu", label: "Hội viên tiêu biểu", icon: Award },
      { href: "/hoi-vien/xac-thuc", label: "Xác thực chứng nhận hội viên", icon: FileSearch },
      { href: "/login", label: "Đăng nhập cổng hội viên", icon: LogIn },
    ],
  },
  {
    href: "/dich-vu",
    label: "Dịch vụ",
    labelEn: "Services",
    activePrefixes: ["/dich-vu", "/dich-vu-khac"],
    icon: Briefcase,
    children: [
      { href: "/dich-vu", label: "Tất cả dịch vụ hỗ trợ doanh nghiệp", icon: Briefcase },
      ...BUSINESS_SERVICES.map((s) => ({ href: `/dich-vu/${s.slug}`, label: s.title, icon: SERVICE_NAV_ICON[s.slug] ?? Briefcase })),
      { href: "/dich-vu-khac", label: "Dịch vụ chuyên sâu (SHTT, định giá, FDI)", icon: FileSearch },
    ],
  },
  {
    href: "/co-hoi-kinh-doanh",
    label: "Cơ hội kinh doanh",
    labelEn: "Opportunities",
    activePrefixes: ["/co-hoi-kinh-doanh", "/chao-ban-cong-nghe", "/nhu-cau-cong-nghe", "/doanh-nghiep-dmst"],
    icon: ShoppingCart,
    children: [
      { href: "/co-hoi-kinh-doanh?loai=mua-hang", label: "Nhu cầu mua hàng & tìm nhà cung cấp", icon: ShoppingCart },
      { href: "/co-hoi-kinh-doanh?loai=san-pham", label: "Sản phẩm & năng lực doanh nghiệp", icon: Building2 },
      { href: "/co-hoi-kinh-doanh?loai=doi-tac-cong-nghe", label: "Tìm đối tác công nghệ", icon: Cpu },
      { href: "/co-hoi-kinh-doanh?loai=ket-noi-b2b", label: "Chương trình kết nối B2B", icon: Calendar },
      { href: "/co-hoi-kinh-doanh?loai=dau-tu", label: "Cơ hội đầu tư & hợp tác", icon: Globe },
      { href: "/portal/matching/radar", label: "Radar ghép nối AI", icon: Radar, badge: "AI" },
      { href: "/portal/seller/technologies/create", label: "Đăng sản phẩm / năng lực mới", icon: PlusCircle },
    ],
  },
  {
    href: "/chinh-sach",
    label: "Chính sách & tri thức",
    labelEn: "Knowledge",
    activePrefixes: ["/chinh-sach", "/tai-lieu", "/huong-dan"],
    icon: BookOpen,
    alignRight: true,
    children: [
      { href: "/chinh-sach", label: "Trung tâm chính sách & tri thức", icon: BookOpen },
      { href: "/tin-tuc?category=chinh-sach-moi", label: "Chính sách mới", icon: Scale },
      { href: "/tin-tuc?category=giai-thich-chinh-sach", label: "Giải thích chính sách", icon: HelpCircle },
      { href: "/tin-tuc?category=kien-nghi", label: "Ý kiến & kiến nghị của BACLINK", icon: Megaphone },
      { href: "/tai-lieu?loai=BAO_CAO_NGANH", label: "Báo cáo ngành", icon: FileSearch },
      { href: "/tai-lieu?loai=CAM_NANG", label: "Cẩm nang & biểu mẫu", icon: FileText },
      { href: "/tin-tuc?category=case-study", label: "Case study doanh nghiệp", icon: Award },
      { href: "/huong-dan", label: "Hướng dẫn sử dụng cổng", icon: BookOpen },
    ],
  },
  {
    href: "/tin-tuc",
    label: "Sự kiện & tin tức",
    labelEn: "Events & News",
    activePrefixes: ["/tin-tuc", "/trien-lam", "/elearning", "/thu-vien"],
    icon: Newspaper,
    alignRight: true,
    children: [
      { href: "/trien-lam", label: "Sự kiện sắp tới", icon: Calendar },
      { href: "/elearning", label: "Khóa đào tạo", icon: GraduationCap },
      { href: "/trien-lam/dang-ky-tham-quan", label: "Đăng ký tham dự sự kiện", icon: Ticket },
      { href: "/tin-tuc?category=hoat-dong", label: "Tin hoạt động BACLINK", icon: Newspaper },
      { href: "/tin-tuc?category=tin-hoi-vien", label: "Tin hội viên", icon: Users },
      { href: "/tin-tuc?category=hoat-dong-cac-ban", label: "Hoạt động các ban", icon: Layers },
      { href: "/thu-vien", label: "Thư viện ảnh & video", icon: Image },
      { href: "/tin-tuc", label: "Tất cả tin tức", icon: Newspaper },
    ],
  },
  {
    href: "/lien-he",
    label: "Liên hệ",
    labelEn: "Contact",
    activePrefixes: ["/lien-he"],
    icon: Mail,
    alignRight: true,
    children: [
      { href: "/lien-he", label: "Văn phòng & gửi yêu cầu hỗ trợ", icon: Mail },
      { href: "/lien-he#hop-tac", label: "Hợp tác, tài trợ & truyền thông", icon: Megaphone },
      { href: "/lien-he#dau-moi-cac-ban", label: "Đầu mối các ban", icon: Users },
      { href: "/lien-he#cau-hoi-thuong-gap", label: "Câu hỏi thường gặp", icon: HelpCircle },
    ],
  },
];
