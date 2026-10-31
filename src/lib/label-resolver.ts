/**
 * Universal Label Resolver Engine
 * Phân giải toàn bộ mã định danh (Code/ID) sang Tên tiếng Việt rõ nghĩa,
 * giải quyết triệt để tình trạng hiển thị mã thô trên các màn hình quản trị.
 */

import { PROVINCES_34 } from "@/lib/constants/provinces";

// Từ điển 10 vai trò chuẩn 3D Scoped RBAC
export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Quản trị Tối cao (NacenTech)",
  OPERATOR_ADMIN: "Quản trị Vận hành Sàn",
  PROVINCIAL_ADMIN: "Lãnh đạo Sở KH&CN Tỉnh/Thành",
  CLUSTER_ADMIN: "Chuyên viên Thẩm định Sở Tỉnh",
  SECTOR_ADMIN: "Trưởng Ban Quản lý Ngành TT17",
  INNOVATION_ENTITY: "Đại diện Viện, Trường, Doanh nghiệp ĐMST",
  VERIFIED_EXPERT: "Chuyên gia Khoa học & Công nghệ",
  SELLER: "Nhà Cung Ứng Công Nghệ",
  BUYER: "Bên Mua / Doanh Nghiệp Đặt Hàng",
  PUBLIC_USER: "Thành Viên Đại Chúng",
  GUEST: "Khách Vãng Lai",
};

// Từ điển loại hồ sơ kiểm duyệt theo chuẩn hành chính công V7
export const REQUEST_TYPE_LABELS: Record<string, string> = {
  EXPERT: "Chuyên Gia KH&CN",
  SHOP: "Chào Bán Công Nghệ",
  TECH_SUPPLY: "Chào Bán Công Nghệ",
  DEMAND: "Nhu Cầu Công Nghệ",
  TECH_DEMAND: "Nhu Cầu Công Nghệ",
  ACCOUNT: "Tài Khoản Tổ Chức",
  FACILITY: "Doanh Nghiệp ĐMST",
  ENTERPRISE: "Doanh Nghiệp ĐMST",
  INSTITUTION: "Viện / Trường Đại học Liên kết",
  INNOVATION_ENTITY: "Doanh Nghiệp ĐMST",
};

// Từ điển 18 lĩnh vực công nghệ theo TT17/2019/TT-BKHCN
export const DEFAULT_SECTOR_LABELS: Record<string, string> = {
  "01": "Công nghệ thông tin & Truyền thông",
  "02": "Năng lượng & Tự động hóa",
  "03": "Vật liệu mới & Công nghệ Nano",
  "04": "Công nghệ Sinh học & Y Dược",
  "05": "Nông nghiệp Công nghệ cao & Chế biến Thực phẩm",
  "06": "Môi trường & Xử lý Rác thải",
  "07": "Cơ khí Chế tạo Máy & Thiết bị",
  "08": "Giao thông Vận tải & Logistics",
  "09": "Xây dựng & Kiến trúc Thông minh",
  "10": "Hóa chất & Dược liệu",
  "11": "Công nghệ Vũ trụ & Viễn thám",
  "12": "Hải dương & Kinh tế Biển",
  "13": "Điện tử & Bán dẫn",
  "14": "Trí tuệ Nhân tạo & Robot",
  "15": "An ninh Mạng & An toàn Dữ liệu",
  "16": "Kinh tế Tuần hoàn & Giảm phát thải",
  "17": "Khoa học Giáo dục & Đào tạo Số",
  "18": "Sở hữu Trí tuệ & Tiêu chuẩn Đo lường",
};

/**
 * Phân giải mã Tỉnh/Thành phố sang Tên tiếng Việt chính thức
 * @example resolveProvinceName("HN") -> "TP. Hà Nội"
 * @example resolveProvinceName("SG") -> "TP. Hồ Chí Minh"
 */
export function resolveProvinceName(code?: string | null): string {
  if (!code || code === "ALL") return "Toàn quốc (34 Tỉnh/Thành ĐMST)";
  const clean = code.trim().toUpperCase();

  const found = PROVINCES_34.find((p) => p.code.toUpperCase() === clean);
  if (found) {
    return found.name.startsWith("TP.") || found.name.startsWith("Tỉnh")
      ? found.name
      : (clean === "HN" || clean === "SG" || clean === "HP" || clean === "CT" || clean === "DN"
        ? `TP. ${found.name}`
        : `Tỉnh ${found.name}`);
  }

  // Fallback map các mã phổ biến
  const fallbackMap: Record<string, string> = {
    HN: "TP. Hà Nội",
    SG: "TP. Hồ Chí Minh",
    HCM: "TP. Hồ Chí Minh",
    HP: "TP. Hải Phòng",
    DN: "TP. Đà Nẵng",
    CT: "TP. Cần Thơ",
  };

  return fallbackMap[clean] || `Địa phương (${code})`;
}

/**
 * Phân giải mã vai trò sang tên vai trò tiếng Việt
 */
export function resolveRoleName(role?: string | null): string {
  if (!role) return "Chưa xác định vai trò";
  const upper = role.trim().toUpperCase();
  return ROLE_LABELS[upper] || role;
}

/**
 * Phân giải loại yêu cầu sang tên tiếng Việt
 */
export function resolveRequestTypeLabel(type?: string | null): string {
  if (!type) return "Hồ sơ Thẩm định";
  const upper = type.trim().toUpperCase();
  return REQUEST_TYPE_LABELS[upper] || type;
}

/**
 * Phân giải mã ngành sang tên ngành tiếng Việt
 */
export function resolveSectorName(
  code?: string | null,
  customDict?: Record<string, string>
): string {
  if (!code) return "Chưa phân ngành";
  const clean = code.trim();

  // Ưu tiên đọc từ dictionary động từ API
  if (customDict && customDict[clean]) return customDict[clean];

  // Map chuẩn mã 2 chữ số (ví dụ: "01", "1", "SECTOR_01")
  const normalized = clean.replace(/^SECTOR[-_]/i, "").padStart(2, "0");
  if (DEFAULT_SECTOR_LABELS[normalized]) return DEFAULT_SECTOR_LABELS[normalized];

  return DEFAULT_SECTOR_LABELS[clean] || clean;
}

/**
 * Phân giải hành vi kiểm toán sang Badge tiếng Việt kèm màu sắc chuẩn
 */
export function resolveActionBadge(action?: string | null): {
  label: string;
  badgeClass: string;
} {
  const act = (action || "").trim().toUpperCase();

  switch (act) {
    case "APPROVED":
    case "APPROVE":
      return {
        label: "Phê Duyệt",
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800",
      };
    case "OVERRIDE_APPROVE":
    case "OVERRIDE":
      return {
        label: "Can Thiệp Tầng 0",
        badgeClass: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-extrabold",
      };
    case "REJECTED":
    case "REJECT":
      return {
        label: "Từ Chối",
        badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800",
      };
    case "CHANGES_REQUESTED":
    case "REQUEST_CHANGES":
      return {
        label: "Yêu Cầu Bổ Sung",
        badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800",
      };
    case "SUBMITTED":
    case "SUBMIT":
      return {
        label: "Nộp Hồ Sơ Mới",
        badgeClass: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700",
      };
    case "REVOKE":
    case "REVOKED":
      return {
        label: "Thu Hồi Quyền",
        badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800",
      };
    default:
      return {
        label: action || "Thao Tác",
        badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      };
  }
}

/**
 * Rút gọn mã định danh hồ sơ phê duyệt sang mã thân thiện dễ nhớ chuẩn V7 (VD: #HS-058915)
 * @param id UUID hoặc ID gốc
 * @param type Loại hồ sơ (tùy chọn)
 * @param scope Phạm vi (tùy chọn)
 */
export function formatApprovalRecordCode(
  id?: string | null,
  type?: string | null,
  scope?: string | null
): string {
  if (!id) return "#HS-000000";
  const clean = id.trim().replace(/-/g, "");
  const suffix = clean.length >= 6 ? clean.slice(-6).toUpperCase() : clean.toUpperCase();
  return `#HS-${suffix}`;
}
