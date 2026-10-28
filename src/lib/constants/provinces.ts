/**
 * Danh mục Chuẩn 34 Tỉnh/Thành phố Trọng Điểm Đổi Mới Sáng Tạo (ĐMST)
 * Căn cứ: BR-ADMIN-34PROV & Master Excel SSOT
 */

export interface ProvinceItem {
  code: string;
  name: string;
  fullName: string;
  region: "BAC" | "TRUNG_TAY_NGUYEN" | "NAM" | "ALL";
}

export const PROVINCES_34: ProvinceItem[] = [
  {
    code: "ALL",
    name: "Toàn quốc (34 Tỉnh / Thành phố trọng điểm ĐMST)",
    fullName: "Toàn quốc (34 Tỉnh / Thành phố trọng điểm ĐMST)",
    region: "ALL",
  },
  // Miền Bắc (12 Tỉnh/Thành)
  { code: "HN", name: "Hà Nội", fullName: "Sở KH&CN TP. Hà Nội", region: "BAC" },
  { code: "HP", name: "Hải Phòng", fullName: "Sở KH&CN TP. Hải Phòng", region: "BAC" },
  { code: "BN", name: "Bắc Ninh", fullName: "Sở KH&CN Tỉnh Bắc Ninh", region: "BAC" },
  { code: "QN", name: "Quảng Ninh", fullName: "Sở KH&CN Tỉnh Quảng Ninh", region: "BAC" },
  { code: "HY", name: "Hưng Yên", fullName: "Sở KH&CN Tỉnh Hưng Yên", region: "BAC" },
  { code: "TNG", name: "Thái Nguyên", fullName: "Sở KH&CN Tỉnh Thái Nguyên", region: "BAC" },
  { code: "PT", name: "Phú Thọ", fullName: "Sở KH&CN Tỉnh Phú Thọ", region: "BAC" },
  { code: "NB", name: "Ninh Bình", fullName: "Sở KH&CN Tỉnh Ninh Bình", region: "BAC" },
  { code: "CB", name: "Cao Bằng", fullName: "Sở KH&CN Tỉnh Cao Bằng", region: "BAC" },
  { code: "TQ", name: "Tuyên Quang", fullName: "Sở KH&CN Tỉnh Tuyên Quang", region: "BAC" },
  { code: "LCA", name: "Lào Cai", fullName: "Sở KH&CN Tỉnh Lào Cai", region: "BAC" },
  { code: "LS", name: "Lạng Sơn", fullName: "Sở KH&CN Tỉnh Lạng Sơn", region: "BAC" },

  // Miền Trung & Tây Nguyên (11 Tỉnh/Thành)
  { code: "DN", name: "Đà Nẵng", fullName: "Sở KH&CN TP. Đà Nẵng", region: "TRUNG_TAY_NGUYEN" },
  { code: "TH", name: "Thanh Hóa", fullName: "Sở KH&CN Tỉnh Thanh Hóa", region: "TRUNG_TAY_NGUYEN" },
  { code: "NA", name: "Nghệ An", fullName: "Sở KH&CN Tỉnh Nghệ An", region: "TRUNG_TAY_NGUYEN" },
  { code: "HT", name: "Hà Tĩnh", fullName: "Sở KH&CN Tỉnh Hà Tĩnh", region: "TRUNG_TAY_NGUYEN" },
  { code: "QT", name: "Quảng Trị", fullName: "Sở KH&CN Tỉnh Quảng Trị", region: "TRUNG_TAY_NGUYEN" },
  { code: "TTH", name: "Thừa Thiên Huế", fullName: "Sở KH&CN Tỉnh Thừa Thiên Huế", region: "TRUNG_TAY_NGUYEN" },
  { code: "QNI", name: "Quảng Ngãi", fullName: "Sở KH&CN Tỉnh Quảng Ngãi", region: "TRUNG_TAY_NGUYEN" },
  { code: "KH", name: "Khánh Hòa", fullName: "Sở KH&CN Tỉnh Khánh Hòa", region: "TRUNG_TAY_NGUYEN" },
  { code: "NT", name: "Ninh Thuận", fullName: "Sở KH&CN Tỉnh Ninh Thuận", region: "TRUNG_TAY_NGUYEN" },
  { code: "DL", name: "Đắk Lắk", fullName: "Sở KH&CN Tỉnh Đắk Lắk", region: "TRUNG_TAY_NGUYEN" },
  { code: "GL", name: "Gia Lai", fullName: "Sở KH&CN Tỉnh Gia Lai", region: "TRUNG_TAY_NGUYEN" },
  { code: "LD", name: "Lâm Đồng", fullName: "Sở KH&CN Tỉnh Lâm Đồng", region: "TRUNG_TAY_NGUYEN" },

  // Miền Nam (11 Tỉnh/Thành - bao gồm cụm liên kết Tây Bắc & Tây Nam Bộ theo Đề tài)
  { code: "SG", name: "TP. Hồ Chí Minh", fullName: "Sở KH&CN TP. Hồ Chí Minh", region: "NAM" },
  { code: "TG", name: "Tiền Giang", fullName: "Sở KH&CN Tỉnh Tiền Giang", region: "NAM" },
  { code: "CT", name: "Cần Thơ", fullName: "Sở KH&CN TP. Cần Thơ", region: "NAM" },
  { code: "DNA", name: "Đồng Nai", fullName: "Sở KH&CN Tỉnh Đồng Nai", region: "NAM" },
  { code: "TN", name: "Tây Ninh", fullName: "Sở KH&CN Tỉnh Tây Ninh", region: "NAM" },
  { code: "VL", name: "Vĩnh Long", fullName: "Sở KH&CN Tỉnh Vĩnh Long", region: "NAM" },
  { code: "DT", name: "Đồng Tháp", fullName: "Sở KH&CN Tỉnh Đồng Tháp", region: "NAM" },
  { code: "AG", name: "An Giang", fullName: "Sở KH&CN Tỉnh An Giang", region: "NAM" },
  { code: "CM", name: "Cà Mau", fullName: "Sở KH&CN Tỉnh Cà Mau", region: "NAM" },
  { code: "DB", name: "Điện Biên", fullName: "Sở KH&CN Tỉnh Điện Biên", region: "NAM" },
  { code: "LC", name: "Lai Châu", fullName: "Sở KH&CN Tỉnh Lai Châu", region: "NAM" },
  { code: "SL", name: "Sơn La", fullName: "Sở KH&CN Tỉnh Sơn La", region: "NAM" },
];

export const PROVINCE_CODES_34 = PROVINCES_34.filter((p) => p.code !== "ALL").map((p) => p.code);

export function getProvinceByCode(code?: string): ProvinceItem | undefined {
  if (!code) return undefined;
  return PROVINCES_34.find((p) => p.code.toUpperCase() === code.toUpperCase());
}
