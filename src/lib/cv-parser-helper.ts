export interface SuggestedReceivingUnit {
  code: string;                  // 'GLOBAL' | 'BN' ...
  type: "GLOBAL" | "PROVINCE";
  name: string;                  // Tên hiển thị đơn vị tiếp nhận thẩm định BACLINK
  reason: string;                // Căn cứ suy luận
}

export interface ParsedCvResult {
  fullName?: string;
  email?: string;
  phone?: string;
  birthYear?: number;
  gender?: "Nam" | "Nữ" | "Khác";
  academicDegree?: string;
  degreeYear?: number;
  primaryInstitution?: string;
  workAddress?: string;
  professionalTitle?: string;
  yearsOfExperience?: number;
  bioSummary?: string;
  primaryDomain?: string;
  matchedSectorCodes?: string[];
  rawSectorKeywords?: string[];
  suggestedReceivingUnit?: SuggestedReceivingUnit;
  specializedKeywords?: string[];
  googleScholarUrl?: string;
  orcidId?: string;
  scopusAuthorId?: string;
  publications?: Array<{
    title: string;
    year: number;
    journalOrConference: string;
    doiOrUrl?: string;
  }>;
  patents?: Array<{
    title: string;
    patentNumber?: string;
    year: number;
    status: string;
  }>;
}

// Bảng từ điển chuyên ngành công nghiệp -> 8 ngành chuẩn BACLINK (IND_*) & mã lịch sử
export const SECTOR_ALIAS_DICTIONARY: Record<string, string[]> = {
  IND_ELEC: [
    "điện tử", "bán dẫn", "semiconductor", "vi điện tử", "microelectronics", "chip",
    "quang điện tử", "laser", "optoelectronics", "bo mạch", "pcb", "smt", "esd", "rf", "thiết bị điện"
  ],
  IND_MECH: [
    "cơ khí chính xác", "khuôn mẫu", "chế tạo máy", "cnc", "gia công kim loại", "đúc kim loại",
    "gá đặt", "jig", "nhiệt luyện", "hàn công nghiệp", "cơ khí"
  ],
  IND_AUTO: [
    "tự động hóa", "robot", "robotic", "cơ điện tử", "mechatronics", "điều khiển tự động",
    "plc", "scada", "smart factory", "nhà máy thông minh", "đo lường điều khiển", "thị giác máy"
  ],
  IND_PLAS: [
    "nhựa kỹ thuật", "ép phun", "bao bì công nghiệp", "hóa chất công nghiệp", "polymer",
    "cao su kỹ thuật", "xi mạ", "sơn phủ bề mặt"
  ],
  IND_MAT: [
    "vật liệu mới", "vật liệu tiên tiến", "vật liệu bán dẫn", "nano", "vật liệu nano",
    "composite", "hợp kim", "công nghiệp hỗ trợ", "linh kiện phụ trợ"
  ],
  IND_IT: [
    "công nghệ thông tin", "cntt", "it", "phần mềm", "trí tuệ nhân tạo", "ai",
    "machine learning", "học máy", "khoa học dữ liệu", "data science", "iot",
    "internet vạn vật", "an toàn thông tin", "an ninh mạng", "erp", "mes", "cloud"
  ],
  IND_GREEN: [
    "công nghiệp xanh", "năng lượng sạch", "năng lượng tái tạo", "điện mặt trời", "esg",
    "kiểm kê khí nhà kính", "môi trường", "xử lý nước thải", "xử lý khí thải", "kinh tế tuần hoàn", "tiết kiệm năng lượng"
  ],
  IND_LOG: [
    "logistics", "kho vận", "chuỗi cung ứng", "supply chain", "wms", "kho thông minh",
    "vận tải công nghiệp", "agv"
  ],
  LV01: ["công nghệ thông tin", "cntt", "it", "phần mềm", "trí tuệ nhân tạo", "ai", "machine learning", "học máy", "iot"],
  LV07: ["tự động hóa", "robot", "cơ điện tử", "chế tạo máy", "cơ khí chính xác", "đo lường điều khiển"],
  LV08: ["vật liệu mới", "bán dẫn", "semiconductor", "nano", "quang điện tử", "laser", "vi điện tử", "chip"],
};

export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .trim();
}

export function calculateTokenSimilarity(s1: string, s2: string): number {
  const t1 = new Set(normalizeString(s1).split(/\s+/).filter(Boolean));
  const t2 = new Set(normalizeString(s2).split(/\s+/).filter(Boolean));
  if (t1.size === 0 || t2.size === 0) return 0;
  let intersect = 0;
  for (const token of t1) {
    if (t2.has(token)) intersect++;
  }
  return (2 * intersect) / (t1.size + t2.size);
}

export function matchSectors(
  aiDomain: string | undefined,
  rawKeywords: string[],
  activeSectors: Array<{ code: string; name: string }>
): { primaryDomain?: string; matchedSectorCodes: string[]; rawSectorKeywords: string[] } {
  const matchedCodes = new Set<string>();
  const activeCodes = new Set(activeSectors.map((s) => s.code));

  // Tầng 1: Exact Match với Active Sector Code
  if (aiDomain && activeCodes.has(aiDomain.toUpperCase())) {
    matchedCodes.add(aiDomain.toUpperCase());
  }

  // Tầng 2: Tra cứu Keyword / Alias Dictionary từ rawKeywords & aiDomain
  const allInputs = [aiDomain || "", ...rawKeywords].filter(Boolean);
  for (const input of allInputs) {
    const normInput = normalizeString(input);
    for (const [code, aliases] of Object.entries(SECTOR_ALIAS_DICTIONARY)) {
      if (!activeCodes.has(code)) continue;
      for (const alias of aliases) {
        if (normInput.includes(normalizeString(alias)) || normalizeString(alias).includes(normInput)) {
          matchedCodes.add(code);
          break;
        }
      }
    }
  }

  // Tầng 3: Token Similarity >= 0.60 với tên các lĩnh vực trong Active Sectors
  for (const input of allInputs) {
    for (const sector of activeSectors) {
      const sim = calculateTokenSimilarity(input, sector.name);
      if (sim >= 0.60) {
        matchedCodes.add(sector.code);
      }
    }
  }

  const matchedList = Array.from(matchedCodes);
  const resolvedPrimary = matchedList[0];

  return {
    primaryDomain: resolvedPrimary || (aiDomain && activeCodes.has(aiDomain) ? aiDomain : undefined),
    matchedSectorCodes: matchedList,
    rawSectorKeywords: rawKeywords.length > 0 ? rawKeywords : (allInputs.length > 0 ? allInputs : []),
  };
}

/**
 * Suy luận đơn vị tiếp nhận thẩm định theo kiến trúc 3 cấp 1-bước của Hiệp hội BACLINK (GLOBAL)
 */
export function inferReceivingUnit(
  primaryInstitution?: string,
  workAddress?: string
): SuggestedReceivingUnit {
  const text = normalizeString(`${primaryInstitution || ""} ${workAddress || ""}`);

  if (
    text.includes("bac ninh") ||
    text.includes("tu son") ||
    text.includes("yen phong") ||
    text.includes("que vo") ||
    text.includes("vsip") ||
    text.includes("tien son") ||
    text.includes("thuan thanh") ||
    text.includes("gia binh") ||
    text.includes("luong tai")
  ) {
    return {
      code: "GLOBAL",
      type: "GLOBAL",
      name: "Ban Quản trị & Ban Cố vấn Kỹ thuật BACLINK (Bắc Ninh)",
      reason: "Đơn vị hoạt động tại địa bàn công nghiệp tỉnh Bắc Ninh — Phê duyệt tập trung 1 cấp",
    };
  }

  return {
    code: "GLOBAL",
    type: "GLOBAL",
    name: "Ban Quản trị & Ban Cố vấn Kỹ thuật BACLINK",
    reason: "Phê duyệt tập trung 1 cấp tại Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh",
  };
}

export const DEMO_PLACEHOLDER_NAMES = [
  "Dang Lanm",
  "Người dùng",
  "Chuyên gia",
  "Chuyên gia mẫu",
  "User",
  "Expert Demo",
  "Demo",
];

export const shouldOverrideFullName = (currentVal: string): boolean => {
  const trimmed = currentVal.trim();
  return !trimmed || DEMO_PLACEHOLDER_NAMES.some((demo) => demo.toLowerCase() === trimmed.toLowerCase());
};
