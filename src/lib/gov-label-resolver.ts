/**
 * GovLabelResolver — Bộ giải nghĩa dữ liệu công vụ chuẩn hóa
 * Căn cứ: CR-BACLINK-003, TT 17/2019/TT-BKHCN, BAC_NINH_LOCATIONS & 8 ngành IND_*
 * Nguyên tắc: 100% Human-Readable Labels (Tuyệt đối không hiển thị mã kỹ thuật thô)
 */

import { BAC_NINH_LOCATIONS } from "./constants/provinces";

export const BACLINK_SECTORS_MAP: Record<string, string> = {
  IND_ELEC: "Điện tử, Bán dẫn & Thiết bị điện",
  IND_MECH: "Cơ khí chính xác, Khuôn mẫu & Chế tạo máy",
  IND_AUTO: "Tự động hóa, Robot & Smart Factory",
  IND_PLAS: "Nhựa kỹ thuật, Bao bì & Hóa chất công nghiệp",
  IND_MAT: "Vật liệu mới & Công nghiệp hỗ trợ",
  IND_IT: "Công nghệ thông tin, Phần mềm công nghiệp & MES/ERP",
  IND_GREEN: "Công nghiệp xanh, Năng lượng sạch & ESG",
  IND_LOG: "Logistics công nghiệp, Kho vận & Chuỗi cung ứng",
};

export const MASTER_SECTORS_MAP: Record<string, string> = {
  CN01: "Công nghệ thông tin và truyền thông",
  CN02: "Năng lượng và tự động hóa",
  CN03: "Vật liệu mới và công nghệ nano",
  CN04: "Công nghệ sinh học trong y dược",
  CN05: "Cơ khí chính xác và chế tạo máy",
  CN06: "Công nghệ sinh học trong nông nghiệp",
  CN07: "Công nghệ môi trường và xử lý chất thải",
  CN08: "Công nghệ vi điện tử và bán dẫn",
  CN09: "Công nghệ đo lường và tiêu chuẩn chất lượng",
  CN10: "Hóa dược và mỹ phẩm sinh học",
  CN11: "Công nghệ thực phẩm và đồ uống",
  CN12: "Công nghệ logistics và chuỗi cung ứng thông minh",
  CN13: "Công nghệ xây dựng và công trình ngầm",
  CN14: "Công nghệ hàng hải và kinh tế biển",
  CN15: "Công nghệ vũ trụ và viễn thám",
  CN16: "An toàn thông tin và bảo mật dữ liệu",
  CN17: "Kinh tế tuần hoàn và năng lượng tái tạo",
  CN18: "Công nghệ số hóa di sản và văn hóa",
};

export const VSIC_MANUFACTURING_MAP: Record<string, string> = {
  "C.10": "Chế biến thực phẩm",
  "C.11": "Sản xuất đồ uống",
  "C.12": "Sản xuất sản phẩm thuốc lá",
  "C.13": "Dệt may công nghiệp",
  "C.14": "Sản xuất trang phục cao cấp",
  "C.15": "Sản xuất da và sản phẩm liên quan",
  "C.16": "Chế biến gỗ và lâm sản",
  "C.17": "Sản xuất giấy và bao bì",
  "C.18": "In ấn và sao chép bản ghi",
  "C.19": "Sản xuất than cốc, dầu mỏ tinh chế",
  "C.20": "Sản xuất hoá chất công nghiệp",
  "C.21": "Sản xuất thuốc, hoá dược và dược liệu",
  "C.22": "Sản xuất sản phẩm cao su và plastic kỹ thuật",
  "C.23": "Sản xuất khoáng phi kim loại & vật liệu xây dựng",
  "C.24": "Sản xuất kim loại và luyện kim màu",
  "C.25": "Sản xuất cơ khí kim loại đúc sẵn",
  "C.26": "Sản xuất điện tử, máy tính và quang học",
  "C.27": "Sản xuất thiết bị điện & năng lượng",
  "C.28": "Chế tạo máy móc, thiết bị tự động",
  "C.29": "Sản xuất ô tô, xe cơ giới và phụ tùng",
  "C.30": "Sản xuất phương tiện vận tải chuyên dùng",
  "C.31": "Sản xuất nội thất công nghiệp",
  "C.32": "Công nghiệp chế biến, chế tạo khác",
};

export function resolveProvinceName(code?: string | null): string {
  if (!code) return "Địa bàn";
  const clean = code.trim().toUpperCase();
  if (!clean) return "Địa bàn";
  if (clean === "ALL") return "Tất cả Địa bàn & KCN Bắc Ninh";

  const found = BAC_NINH_LOCATIONS.find((l) => l.code.toUpperCase() === clean);
  if (found) return found.name;

  const legacyMap: Record<string, string> = {
    BN: "Bắc Ninh",
    HN: "Hà Nội",
    HCM: "TP. Hồ Chí Minh",
    SG: "TP. Hồ Chí Minh",
    HP: "Hải Phòng",
    DN: "Đà Nẵng",
    CT: "Cần Thơ",
  };
  return legacyMap[clean] || clean;
}

export function resolveSectorName(
  code?: string | null,
  customDict?: Record<string, string>
): string {
  if (!code) return "Chưa phân loại ngành";
  const clean = code.trim();
  if (!clean) return "Chưa phân loại ngành";
  const upper = clean.toUpperCase();

  if (customDict) {
    if (customDict[clean]) return customDict[clean];
    if (customDict[upper]) return customDict[upper];
  }
  if (BACLINK_SECTORS_MAP[upper]) return BACLINK_SECTORS_MAP[upper];
  if (MASTER_SECTORS_MAP[upper]) return MASTER_SECTORS_MAP[upper];
  if (VSIC_MANUFACTURING_MAP[upper]) return VSIC_MANUFACTURING_MAP[upper];

  const dotNormalized = upper.replace(/^C(\d{2})$/, "C.$1");
  if (VSIC_MANUFACTURING_MAP[dotNormalized]) return VSIC_MANUFACTURING_MAP[dotNormalized];

  const cnNormalized = upper.replace(/^CN(\d)$/, "CN0$1");
  if (MASTER_SECTORS_MAP[cnNormalized]) return MASTER_SECTORS_MAP[cnNormalized];

  return clean;
}

export function resolveTrlInfo(level?: number | string | null): {
  label: string;
  desc: string;
  colorClass: string;
} {
  const l = Number(level) || 0;
  switch (l) {
    case 1:
      return {
        label: "TRL 1/9",
        desc: "Nguyên lý cơ bản được nghiên cứu",
        colorClass: "bg-slate-100 text-slate-800 border-slate-300",
      };
    case 2:
      return {
        label: "TRL 2/9",
        desc: "Hình thành khái niệm công nghệ",
        colorClass: "bg-blue-50 text-blue-800 border-blue-200",
      };
    case 3:
      return {
        label: "TRL 3/9",
        desc: "Chứng minh khái niệm thực nghiệm",
        colorClass: "bg-blue-100 text-blue-900 border-blue-300",
      };
    case 4:
      return {
        label: "TRL 4/9",
        desc: "Xác thực trong phòng thí nghiệm",
        colorClass: "bg-cyan-50 text-cyan-800 border-cyan-200",
      };
    case 5:
      return {
        label: "TRL 5/9",
        desc: "Xác thực trong môi trường mô phỏng",
        colorClass: "bg-cyan-100 text-cyan-900 border-cyan-300",
      };
    case 6:
      return {
        label: "TRL 6/9",
        desc: "Thử nghiệm mẫu hoạt động",
        colorClass: "bg-amber-50 text-amber-800 border-amber-300",
      };
    case 7:
      return {
        label: "TRL 7/9",
        desc: "Thử nghiệm trong môi trường thực tế",
        colorClass: "bg-amber-100 text-amber-900 border-amber-400",
      };
    case 8:
      return {
        label: "TRL 8/9",
        desc: "Hệ thống hoàn thiện và đạt chuẩn",
        colorClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
      };
    case 9:
      return {
        label: "TRL 9/9",
        desc: "Thương mại hóa hoàn toàn",
        colorClass: "bg-emerald-100 text-emerald-900 border-emerald-400 font-bold",
      };
    default:
      return {
        label: `TRL ${l}/9`,
        desc: "Đang cập nhật mức độ hoàn thiện",
        colorClass: "bg-slate-100 text-slate-700 border-slate-300",
      };
  }
}

export function resolveIpStatusInfo(status?: string | null): {
  label: string;
  colorClass: string;
} {
  const clean = (status || "").trim().toUpperCase();
  switch (clean) {
    case "PATENT_GRANTED":
      return {
        label: "Đã cấp Bằng độc quyền sáng chế",
        colorClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
      };
    case "UTILITY_MODEL":
      return {
        label: "Giải pháp hữu ích",
        colorClass: "bg-teal-50 text-teal-800 border-teal-300",
      };
    case "TRADE_SECRET":
      return {
        label: "Bí mật kinh doanh",
        colorClass: "bg-indigo-50 text-indigo-800 border-indigo-300",
      };
    case "PATENT_PENDING":
    case "PATENT_APPLICATION":
      return {
        label: "Đang thẩm định đơn SHTT",
        colorClass: "bg-cyan-50 text-cyan-800 border-cyan-300",
      };
    case "SOFTWARE_COPYRIGHT":
    case "COPYRIGHT_REGISTERED":
      return {
        label: "Bản quyền phần mềm / Tác giả",
        colorClass: "bg-blue-50 text-blue-800 border-blue-300",
      };
    case "NONE":
    default:
      return {
        label: "Chưa bảo hộ SHTT",
        colorClass: "bg-slate-100 text-slate-700 border-slate-300",
      };
  }
}

export function resolveTt17Classification(classification?: string | null): {
  label: string;
  badgeClass: string;
} {
  const clean = (classification || "").trim().toUpperCase();
  switch (clean) {
    case "TIEN_TIEN":
      return {
        label: "Trình độ Tiên tiến (≥ 75đ & T_ĐB ≥ 0.75)",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
      };
    case "TRUNG_BINH_TIEN_TIEN":
      return {
        label: "Trung bình Tiên tiến (60–74đ & T_ĐB ≥ 0.60)",
        badgeClass: "bg-teal-100 text-teal-800 border-teal-300",
      };
    case "TRUNG_BINH":
      return {
        label: "Trình độ Trung bình (50–59đ & T_ĐB ≥ 0.50)",
        badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
      };
    case "LAC_HAU":
      return {
        label: "Trình độ Lạc hậu (< 50đ)",
        badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
      };
    case "CAN_THAM_DINH":
      return {
        label: "Cần thẩm định (Lệch đồng bộ)",
        badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
      };
    default:
      return {
        label: classification || "Chưa xếp loại",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
      };
  }
}

export function resolveTniUrgency(urgency?: string | number | null): {
  label: string;
  badgeClass: string;
} {
  if (typeof urgency === "number") {
    if (urgency >= 80) urgency = "URGENT";
    else if (urgency >= 60) urgency = "STRATEGIC";
    else urgency = "POTENTIAL";
  }
  const clean = String(urgency || "").trim().toUpperCase();
  switch (clean) {
    case "URGENT":
      return {
        label: "Cấp bách (Giải quyết trong quý)",
        badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
      };
    case "STRATEGIC":
      return {
        label: "Chiến lược dài hạn",
        badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
      };
    case "POTENTIAL":
    default:
      return {
        label: "Tiềm năng mở rộng",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
      };
  }
}

export function resolveGovRequestType(type?: string | null): {
  label: string;
  badgeClass: string;
} {
  const clean = (type || "").trim().toUpperCase();
  switch (clean) {
    case "EXPERT":
      return {
        label: "Chuyên gia KH&CN",
        badgeClass: "bg-purple-100 text-purple-800 border-purple-300",
      };
    case "SHOP":
    case "TECHNOLOGY_OFFER":
      return {
        label: "Sản phẩm / Sáng chế TRL",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
      };
    case "DEMAND":
      return {
        label: "Nhu cầu Công nghệ",
        badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
      };
    case "ACCOUNT":
      return {
        label: "Tài khoản Pháp nhân",
        badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
      };
    case "INSTITUTION":
    case "ENTERPRISE":
      return {
        label: "Doanh nghiệp ĐMST",
        badgeClass: "bg-cyan-100 text-cyan-800 border-cyan-300",
      };
    default:
      return {
        label: type || "Hồ sơ công vụ",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
      };
  }
}

export function resolveRoleDisplayName(role?: string | null): string {
  if (!role) return "Cán bộ công vụ";
  const clean = role.trim().toUpperCase();
  const map: Record<string, string> = {
    PROVINCIAL_ADMIN: "Lãnh đạo Sở (Admin)",
    PROVINCE_LEADER: "Lãnh đạo Sở (Checker)",
    PROVINCE_OFFICER: "Chuyên viên Thẩm tra (Maker)",
    SECTOR_ADMIN: "Quản trị Phân ngành",
    CLUSTER_ADMIN: "Quản trị Vùng / Cụm",
    SUPER_ADMIN: "Quản trị Tối cao Tầng 0",
    ADMIN: "Quản trị Hệ thống",
  };
  return map[clean] || role || "Cán bộ công vụ";
}

/**
 * Chuẩn hóa mã hồ sơ công vụ có ý nghĩa định danh nghiệp vụ
 * Thay thế chuỗi UUID cắt ngắn c25347fc... vô nghĩa
 * Định dạng: [Tiền Tố]-[Mã Tỉnh]-[6 Ký Tự Hash] (Ví dụ: CB-HN-C25347, CG-HN-A109F2, NC-HP-88E29E)
 */
export function formatGovRecordCode(
  id?: string | null,
  type?: string | null,
  scopeCode?: string | null
): {
  code: string;
  prefix: string;
  scope: string;
  hash: string;
  displayCode: string;
} {
  if (!id) {
    return {
      code: "HS-CHUA-CAP-MA",
      prefix: "HS",
      scope: (scopeCode || "TW").trim().toUpperCase(),
      hash: "000000",
      displayCode: "HS-CHUA-CAP-MA",
    };
  }

  const cleanId = id.replace(/-/g, "").toUpperCase();
  const hash = cleanId.slice(0, 6) || "000000";
  let scope = (scopeCode || "HN").trim().toUpperCase();
  // Chuẩn hóa loại bỏ tiền tố quốc gia thừa như VN-HN, VN_SG -> HN, SG
  if (scope.startsWith("VN-") || scope.startsWith("VN_")) {
    scope = scope.replace(/^VN[-_]/, "");
  }
  const cleanType = (type || "").trim().toUpperCase();

  let prefix = "HS";
  if (cleanType === "SHOP" || cleanType === "TECHNOLOGY_OFFER") {
    prefix = "CB"; // Chào bán công nghệ
  } else if (cleanType === "EXPERT") {
    prefix = "CG"; // Chuyên gia KH&CN
  } else if (cleanType === "DEMAND") {
    prefix = "NC"; // Nhu cầu công nghệ
  } else if (cleanType === "ACCOUNT" || cleanType === "ENTERPRISE" || cleanType === "INSTITUTION") {
    prefix = "DN"; // Doanh nghiệp ĐMST
  }

  const code = `${prefix}-${scope}-${hash}`;
  return {
    code,
    prefix,
    scope,
    hash,
    displayCode: code,
  };
}

/**
 * Chuẩn hóa học vị / học hàm chuyên gia KH&CN cho cán bộ công vụ
 * Hỗ trợ các mã chuẩn hóa: DOCTOR, MASTER, ENGINEER_BACHELOR, ASSOCIATE_PROFESSOR, PROFESSOR...
 */
export function formatDegree(degree?: string | null, rank?: string | null): string {
  let rankLabel = "";
  if (rank) {
    const r = rank.trim().toUpperCase();
    if (r === "GS" || r === "PROFESSOR") rankLabel = "GS.";
    else if (r === "PGS" || r === "ASSOCIATE_PROFESSOR") rankLabel = "PGS.";
    else rankLabel = rank;
  }

  let degLabel = "";
  if (degree) {
    const d = degree.trim().toUpperCase();
    switch (d) {
      case "ENGINEER_BACHELOR":
      case "BACHELOR":
      case "ENGINEER":
      case "CU_NHAN":
      case "KY_SU":
        degLabel = "Kỹ sư / Cử nhân";
        break;
      case "MASTER":
      case "THAC_SI":
        degLabel = "ThS.";
        break;
      case "DOCTOR":
      case "PHD":
      case "TIEN_SI":
        degLabel = "TS.";
        break;
      case "POSTDOC":
        degLabel = "Sau Tiến sĩ (Postdoc)";
        break;
      default:
        degLabel = degree;
        break;
    }
  }

  if (rankLabel && degLabel) {
    if (degLabel.startsWith("TS") || degLabel.startsWith("ThS")) {
      return `${rankLabel} ${degLabel}`.trim();
    }
    return `${rankLabel} - ${degLabel}`.trim();
  }
  return rankLabel || degLabel || "Chuyên gia KH&CN";
}
