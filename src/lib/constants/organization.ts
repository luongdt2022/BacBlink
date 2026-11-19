/**
 * Nguồn dữ kiện duy nhất về pháp nhân & liên hệ của Hiệp hội BACLINK
 * (CR-BACLINK-008 · BR-BL08-SINGLE-SOURCE-001).
 *
 * Mọi màn hình hiển thị số quyết định, trụ sở, điện thoại, email, Zalo
 * hoặc cơ cấu các ban PHẢI import từ đây — không viết cứng ở component.
 *
 * Nguồn: baclink.truyenthongtht.com (đọc 2026-11-19), PO chốt dùng [CONFIRMED].
 * Liên hệ: chưa công bố số điện thoại/email — dùng biểu mẫu liên hệ.
 * Còn mở: quan hệ giữa QĐ 589 (THT) và QĐ 1652 (Basic Design cũ) — chờ BACLINK xác nhận.
 */

export const ORG = {
  shortName: "BACLINK",
  fullName: "Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh",
  fullNameUpper: "HIỆP HỘI SẢN XUẤT CÔNG NGHIỆP TỈNH BẮC NINH",
  fullNameEn: "Bac Ninh Association of Industrial Manufacturing",
  motto: "Kết nối sức mạnh – Nâng tầm tinh hoa Kinh Bắc",
  tagline: "Tinh hoa Kinh Bắc",
  legalForm: "Tổ chức xã hội – nghề nghiệp",
  decision: {
    number: "589/QĐ-UBND",
    date: "27/06/2025",
    issuer: "UBND tỉnh Bắc Ninh",
    numberEn: "589/QD-UBND",
  },
  address: "Lô 3 đường TS8, KCN Tiên Sơn, Tiên Du, Bắc Ninh",
  addressEn: "Lot 3, TS8 Street, Tien Son Industrial Park, Tien Du, Bac Ninh, Vietnam",
  // Thông tin liên hệ (điện thoại, email, Zalo) lấy từ web THT đã được gỡ theo yêu cầu (2026-11-19);
  // sẽ bổ sung khi BACLINK cung cấp kênh liên hệ chính thức. Hiện mọi liên hệ đi qua biểu mẫu "Gửi yêu cầu".
  facebookUrl: "https://www.facebook.com/HHBaclink",
  mapEmbedQuery: "KCN Tiên Sơn, Tiên Du, Bắc Ninh",
} as const;

/** "Quyết định số 589/QĐ-UBND ngày 27/06/2025 của UBND tỉnh Bắc Ninh" */
export const ORG_DECISION_TEXT = `Quyết định số ${ORG.decision.number} ngày ${ORG.decision.date} của ${ORG.decision.issuer}`;

export type CommitteeBlock =
  | "HO_TRO_DN"
  | "KET_NOI_GIAO_THUONG"
  | "CHINH_SACH_KY_THUAT"
  | "VAN_HOA_XA_HOI";

export const COMMITTEE_BLOCKS: Record<CommitteeBlock, string> = {
  HO_TRO_DN: "Hỗ trợ phát triển doanh nghiệp",
  KET_NOI_GIAO_THUONG: "Kết nối & Giao thương",
  CHINH_SACH_KY_THUAT: "Chính sách & Kỹ thuật",
  VAN_HOA_XA_HOI: "Văn hóa & Xã hội",
};

export type Committee = {
  code: string;
  block: CommitteeBlock;
  name: string;
  /** Chức năng demo [PROPOSAL] — chờ BACLINK cung cấp bản chính thức. */
  functions: string;
  /** Không bịa tên người: null → hiển thị "Đang cập nhật". */
  head: string | null;
};

/** 9 ban chuyên môn — tên ban [VERIFIED THT], chức năng [PROPOSAL – DEMO]. */
export const BACLINK_COMMITTEES: readonly Committee[] = [
  { code: "BAN_TC_HV", block: "HO_TRO_DN", name: "Ban Tài chính & Phát triển Hội viên", functions: "Quản lý hội phí, kết nạp và chăm sóc hội viên, kết nối vốn – tín dụng.", head: null },
  { code: "BAN_DT_NL", block: "HO_TRO_DN", name: "Ban Đào tạo & Phát triển nhân lực", functions: "Tổ chức khóa đào tạo, kết nối trường nghề, cấp chứng nhận đào tạo.", head: null },
  { code: "BAN_GT_XTTM", block: "KET_NOI_GIAO_THUONG", name: "Ban Giao thương & Xúc tiến thương mại", functions: "Hội chợ, phiên kết nối B2B, kết nối chuỗi cung ứng FDI – nội địa.", head: null },
  { code: "BAN_DN_HTQT", block: "KET_NOI_GIAO_THUONG", name: "Ban Đối ngoại & Hợp tác quốc tế", functions: "Đón đoàn, đưa đoàn, ký kết hợp tác quốc tế, kết nối đối tác nước ngoài.", head: null },
  { code: "BAN_CS_DTDT", block: "CHINH_SACH_KY_THUAT", name: "Ban Chính sách & Đối thoại đầu tư", functions: "Tổng hợp kiến nghị, đối thoại với chính quyền, phổ biến chính sách mới.", head: null },
  { code: "BAN_CGCN_KT", block: "CHINH_SACH_KY_THUAT", name: "Ban Hỗ trợ chuyển giao công nghệ & Kỹ thuật", functions: "Chuyển giao công nghệ, cố vấn kỹ thuật, nâng cao năng suất – chất lượng.", head: null },
  { code: "BAN_CNX_DMST", block: "CHINH_SACH_KY_THUAT", name: "Ban Công nghệ xanh & Đổi mới sáng tạo", functions: "Chuyển đổi xanh, ESG, tiết kiệm năng lượng, đổi mới sáng tạo.", head: null },
  { code: "BAN_VH_TT", block: "VAN_HOA_XA_HOI", name: "Ban Văn hóa – Thể thao Doanh nghiệp", functions: "Giải thể thao, giao lưu văn hóa, gắn kết cộng đồng hội viên.", head: null },
  { code: "BAN_CSR", block: "VAN_HOA_XA_HOI", name: "Ban CSR (Cộng đồng – Xã hội – An sinh)", functions: "Thiện nguyện, an sinh xã hội, trách nhiệm xã hội doanh nghiệp.", head: null },
];
