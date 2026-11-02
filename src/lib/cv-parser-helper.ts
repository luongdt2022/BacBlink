export interface SuggestedReceivingUnit {
  code: string;                  // 'GLOBAL' | 'HN' | 'HP' | 'HCM' | 'DN' ...
  type: "GLOBAL" | "PROVINCE";   // Thẩm quyền Trung ương / Cấp Sở Tỉnh
  name: string;                  // Tên hiển thị đầy đủ của cơ quan thẩm định
  reason: string;                // Căn cứ suy luận (tên viện hoặc địa chỉ cơ quan)
}

export interface ParsedCvResult {
  fullName?: string;
  email?: string;
  phone?: string;
  birthYear?: number;
  gender?: "Nam" | "Nữ" | "Khác";
  academicDegree?: string;
  degreeYear?: number;           // [MỚI - BR-EXP-CV-012]: Năm đạt học vị cao nhất
  primaryInstitution?: string;
  workAddress?: string;
  professionalTitle?: string;
  yearsOfExperience?: number;
  bioSummary?: string;
  primaryDomain?: string;
  matchedSectorCodes?: string[]; // Danh sách mã lĩnh vực TT17 sau khi đối soát
  rawSectorKeywords?: string[];  // [MỚI - BR-EXP-CV-014]: Từ khóa/chuyên ngành thô bóc tách từ CV
  suggestedReceivingUnit?: SuggestedReceivingUnit; // [MỚI - BR-EXP-CV-013]: Gợi ý cơ quan tiếp nhận Cấp 2
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

// Bảng từ điển mở rộng chuyên ngành KH&CN -> Mã TT17 SSOT
export const SECTOR_ALIAS_DICTIONARY: Record<string, string[]> = {
  LV01: ["công nghệ thông tin", "cntt", "it", "phần mềm", "trí tuệ nhân tạo", "ai", "machine learning", "học máy", "khoa học dữ liệu", "data science", "iot", "internet vạn vật", "an toàn thông tin", "an ninh mạng", "blockchain", "chuỗi khối", "cloud", "điện toán đám mây"],
  LV02: ["năng lượng sinh học", "năng lượng tái tạo", "điện gió", "điện mặt trời", "pin", "năng lượng mới", "tiết kiệm năng lượng"],
  LV03: ["công nghệ sinh học", "biotech", "gen", "vi sinh", "công nghệ gen", "tế bào", "lên men", "chế phẩm sinh học"],
  LV04: ["nông nghiệp công nghệ cao", "nông nghiệp thông minh", "trồng trọt", "chăn nuôi", "thủy sản", "bảo vệ thực vật", "giống cây trồng"],
  LV05: ["y tế thông minh", "dược phẩm", "thiết bị y tế", "chẩn đoán hình ảnh", "vắc xin", "dược liệu", "cảm biến y sinh"],
  LV06: ["môi trường", "xử lý nước thải", "xử lý khí thải", "tái chế", "chất thải rắn", "biến đổi khí hậu", "kinh tế tuần hoàn"],
  LV07: ["tự động hóa", "robot", "robotic", "cơ điện tử", "mechatronics", "điều khiển tự động", "chế tạo máy", "cơ khí chính xác", "đo lường điều khiển"],
  LV08: ["vật liệu mới", "vật liệu tiên tiến", "vật liệu bán dẫn", "bán dẫn", "semiconductor", "nano", "vật liệu nano", "quang điện tử", "laser", "optoelectronics", "vi điện tử", "microelectronics", "chip"],
  LV09: ["hàng không", "vũ trụ", "đô thị thông minh", "giao thông thông minh", "gis", "viễn thám", "drone", "uav"],
  LV17: ["khoa học công nghệ", "đổi mới sáng tạo", "quản lý công nghệ", "chuyển giao công nghệ", "sở hữu trí tuệ", "chính sách khcn"]
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
  return (2 * intersect) / (t1.size + t2.size); // Dice coefficient
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

  // Tầng 4: Zero Data Loss Fallback - Không xóa trắng nếu không match code
  // Giữ nguyên rawSectorKeywords để UI hiển thị các tag gợi ý chuyên gia bấm chọn
  return {
    primaryDomain: resolvedPrimary || (aiDomain && activeCodes.has(aiDomain) ? aiDomain : undefined),
    matchedSectorCodes: matchedList,
    rawSectorKeywords: rawKeywords.length > 0 ? rawKeywords : (allInputs.length > 0 ? allInputs : [])
  };
}

export function inferReceivingUnit(
  primaryInstitution?: string,
  workAddress?: string
): SuggestedReceivingUnit {
  const text = normalizeString(`${primaryInstitution || ""} ${workAddress || ""}`);

  // 1. Kiểm tra Khối Trung ương / Bộ KH&CN -> 'GLOBAL'
  const globalKeywords = [
    "vien ung dung cong nghe",
    "nacentech",
    "bo khoa hoc va cong nghe",
    "bo kh&cn",
    "bo khcn",
    "vien han lam",
    "dai hoc quoc gia",
    "vien nang luong nguyen tu",
    "cuc so huu tri tue",
    "trung tam doi moi sang tao quoc gia",
    "nic"
  ];
  for (const kw of globalKeywords) {
    if (text.includes(kw)) {
      return {
        code: "GLOBAL",
        type: "GLOBAL",
        name: "Hội đồng KH&CN NacenTech / Trung ương",
        reason: "Thuộc Viện/Bộ/Cơ quan Nghiên cứu Trung ương"
      };
    }
  }

  // 2. Kiểm tra Địa bàn Tỉnh/Thành phố trực thuộc
  if (text.includes("ha noi") || text.includes("thanh xuan") || text.includes("cau giay") || text.includes("hoan kiem") || text.includes("hai ba trung") || text.includes("dong da") || text.includes("ba dinh")) {
    return {
      code: "HN",
      type: "PROVINCE",
      name: "Sở Khoa học và Công nghệ TP. Hà Nội",
      reason: "Địa chỉ cơ quan công tác tại TP. Hà Nội"
    };
  }
  if (text.includes("hai phong") || text.includes("hong bang") || text.includes("ngo quyen") || text.includes("le chan")) {
    return {
      code: "HP",
      type: "PROVINCE",
      name: "Sở Khoa học và Công nghệ TP. Hải Phòng",
      reason: "Địa chỉ cơ quan công tác tại TP. Hải Phòng"
    };
  }
  if (text.includes("quang ninh") || text.includes("ha long") || text.includes("cam pha")) {
    return {
      code: "QN",
      type: "PROVINCE",
      name: "Sở Khoa học và Công nghệ tỉnh Quảng Ninh",
      reason: "Địa chỉ cơ quan công tác tại tỉnh Quảng Ninh"
    };
  }
  if (text.includes("bac ninh") || text.includes("tu son")) {
    return {
      code: "BN",
      type: "PROVINCE",
      name: "Sở Khoa học và Công nghệ tỉnh Bắc Ninh",
      reason: "Địa chỉ cơ quan công tác tại tỉnh Bắc Ninh"
    };
  }
  if (text.includes("thai nguyen") || text.includes("song cong")) {
    return {
      code: "TN",
      type: "PROVINCE",
      name: "Sở Khoa học và Công nghệ tỉnh Thái Nguyên",
      reason: "Địa chỉ cơ quan công tác tại tỉnh Thái Nguyên"
    };
  }
  if (text.includes("hai duong") || text.includes("chi linh")) {
    return {
      code: "HD",
      type: "PROVINCE",
      name: "Sở Khoa học và Công nghệ tỉnh Hải Dương",
      reason: "Địa chỉ cơ quan công tác tại tỉnh Hải Dương"
    };
  }
  if (text.includes("vinh phuc") || text.includes("vinh yen")) {
    return {
      code: "VP",
      type: "PROVINCE",
      name: "Sở Khoa học và Công nghệ tỉnh Vĩnh Phúc",
      reason: "Địa chỉ cơ quan công tác tại tỉnh Vĩnh Phúc"
    };
  }
  if (text.includes("nam dinh")) {
    return {
      code: "ND",
      type: "PROVINCE",
      name: "Sở Khoa học và Công nghệ tỉnh Nam Định",
      reason: "Địa chỉ cơ quan công tác tại tỉnh Nam Định"
    };
  }
  if (text.includes("thai binh")) {
    return {
      code: "TB",
      type: "PROVINCE",
      name: "Sở Khoa học và Công nghệ tỉnh Thái Bình",
      reason: "Địa chỉ cơ quan công tác tại tỉnh Thái Bình"
    };
  }
  if (text.includes("ho chi minh") || text.includes("tp.hcm") || text.includes("tphcm") || text.includes("sai gon") || text.includes("thu duc") || text.includes("quan 1") || text.includes("quan 3")) {
    return {
      code: "HCM",
      type: "PROVINCE",
      name: "Sở Khoa học và Công nghệ TP. Hồ Chí Minh",
      reason: "Địa chỉ cơ quan công tác tại TP. Hồ Chí Minh"
    };
  }
  if (text.includes("da nang") || text.includes("hai chau") || text.includes("thanh khe") || text.includes("son tra")) {
    return {
      code: "DN",
      type: "PROVINCE",
      name: "Sở Khoa học và Công nghệ TP. Đà Nẵng",
      reason: "Địa chỉ cơ quan công tác tại TP. Đà Nẵng"
    };
  }

  // Mặc định fallback về GLOBAL nếu là cơ quan cấp cao, hoặc để trống lựa chọn, TUYỆT ĐỐI KHÔNG gán cứng 'HP'
  return {
    code: "GLOBAL",
    type: "GLOBAL",
    name: "Hội đồng KH&CN NacenTech / Trung ương",
    reason: "Đơn vị tiếp nhận thẩm định mặc định toàn quốc"
  };
}

export const DEMO_PLACEHOLDER_NAMES = [
  "Dang Lanm",
  "Người dùng",
  "Chuyên gia",
  "Chuyên gia NacenTech",
  "User",
  "Expert Demo",
  "Demo"
];

export const shouldOverrideFullName = (currentVal: string): boolean => {
  const trimmed = currentVal.trim();
  return !trimmed || DEMO_PLACEHOLDER_NAMES.some((demo) => demo.toLowerCase() === trimmed.toLowerCase());
};
