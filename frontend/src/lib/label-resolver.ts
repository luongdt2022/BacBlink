/**
 * Universal Label Resolver Engine
 * Phân giải toàn bộ mã định danh (Code/ID) sang Tên tiếng Việt rõ nghĩa,
 * giải quyết triệt để tình trạng hiển thị mã thô trên các màn hình quản trị.
 */

import { BAC_NINH_LOCATIONS } from "@/lib/constants/provinces";

// Từ điển 8 ngành công nghiệp chuẩn BACLINK (IND_*)
export const BACLINK_SECTOR_LABELS: Record<string, string> = {
  IND_ELEC: "Điện tử, Bán dẫn & Thiết bị điện",
  IND_MECH: "Cơ khí chính xác, Khuôn mẫu & Chế tạo máy",
  IND_AUTO: "Tự động hóa, Robot & Smart Factory",
  IND_PLAS: "Nhựa kỹ thuật, Bao bì & Hóa chất công nghiệp",
  IND_MAT: "Vật liệu mới & Công nghiệp hỗ trợ",
  IND_IT: "Công nghệ thông tin, Phần mềm công nghiệp & MES/ERP",
  IND_GREEN: "Công nghiệp xanh, Năng lượng sạch & ESG",
  IND_LOG: "Logistics công nghiệp, Kho vận & Chuỗi cung ứng",
};

// Từ điển vai trò chuẩn hóa kiến trúc 3 cấp BACLINK
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị Hiệp hội (BACLINK)",
  ENTERPRISE: "Doanh nghiệp Hội viên",
  PUBLIC_USER: "Thành Viên Đại Chúng",
  SUPER_ADMIN: "Quản trị Hiệp hội (BACLINK)",
  OPERATOR_ADMIN: "Quản trị Vận hành BACLINK",
  PROVINCIAL_ADMIN: "Điều phối Địa bàn BACLINK",
  CLUSTER_ADMIN: "Chuyên viên Thẩm định Kỹ thuật BACLINK",
  SECTOR_ADMIN: "Điều phối Ngành Công nghiệp BACLINK",
  INNOVATION_ENTITY: "Doanh nghiệp Hội viên",
  VERIFIED_EXPERT: "Ban Cố vấn Kỹ thuật BACLINK",
  EXPERT: "Ban Cố vấn Kỹ thuật BACLINK",
  SELLER: "Nhà Cung Ứng Sản Phẩm / Công Nghệ",
  BUYER: "Bên Mua / Doanh Nghiệp Đặt Hàng",
  GUEST: "Khách Vãng Lai",
};

// Từ điển loại hồ sơ kiểm duyệt chuẩn BACLINK
export const REQUEST_TYPE_LABELS: Record<string, string> = {
  EXPERT: "Ban Cố Vấn Kỹ Thuật",
  SHOP: "Chào Bán Sản Phẩm / Công Nghệ",
  TECH_SUPPLY: "Chào Bán Sản Phẩm / Công Nghệ",
  DEMAND: "Nhu Cầu Mua & Đặt Hàng",
  TECH_DEMAND: "Nhu Cầu Mua & Đặt Hàng",
  ACCOUNT: "Tài Khoản Doanh Nghiệp Hội Viên",
  FACILITY: "Doanh Nghiệp Hội Viên",
  ENTERPRISE: "Doanh Nghiệp Hội Viên",
  INSTITUTION: "Đơn Vị Liên Kết Công Nghiệp",
  INNOVATION_ENTITY: "Doanh Nghiệp Hội Viên",
};

// Từ điển danh mục ngành công nghệ tương thích dữ liệu lịch sử
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
 * Phân giải mã Địa bàn / KCN Bắc Ninh sang Tên tiếng Việt chính thức
 * @example resolveProvinceName("TP_BN") -> "TP. Bắc Ninh"
 * @example resolveProvinceName("KCN_VSIP_BN") -> "KCN VSIP Bắc Ninh"
 */
export function resolveProvinceName(code?: string | null): string {
  if (!code || code.trim().toUpperCase() === "ALL") {
    return "Tất cả Địa bàn & KCN Bắc Ninh";
  }
  const clean = code.trim().toUpperCase();

  const found = BAC_NINH_LOCATIONS.find((loc) => loc.code.toUpperCase() === clean);
  if (found) {
    return found.name;
  }

  // Fallback map cho dữ liệu lịch sử trước khi chuẩn hóa Bắc Ninh
  const legacyFallbackMap: Record<string, string> = {
    BN: "Tỉnh Bắc Ninh",
    HN: "TP. Hà Nội",
    SG: "TP. Hồ Chí Minh",
    HCM: "TP. Hồ Chí Minh",
    HP: "TP. Hải Phòng",
    DN: "TP. Đà Nẵng",
    CT: "TP. Cần Thơ",
  };

  return legacyFallbackMap[clean] || `Địa bàn (${code})`;
}

export const resolveLocationName = resolveProvinceName;

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
  const upper = clean.toUpperCase();

  // Ưu tiên đọc từ dictionary động từ API
  if (customDict) {
    if (customDict[clean]) return customDict[clean];
    if (customDict[upper]) return customDict[upper];
  }

  // Chuẩn 8 ngành công nghiệp BACLINK (IND_*)
  if (BACLINK_SECTOR_LABELS[upper]) return BACLINK_SECTOR_LABELS[upper];

  // Map chuẩn mã 2 chữ số lịch sử (ví dụ: "01", "1", "SECTOR_01")
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
        label: "Phê Duyệt Đặc Biệt",
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
