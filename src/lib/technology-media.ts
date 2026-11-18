/**
 * Helper cung cấp hình ảnh đại diện và bộ sưu tập ảnh cho Công nghệ / Chào bán & Nhu cầu
 * theo 17 lĩnh vực chuẩn KH&CN (LV01 - LV17) và từ khóa tiếng Việt.
 * Tuân thủ TASK-01 Delta v2 (REQ-01-DELTA-03).
 */

export interface TechnologyMedia {
  mainImage: string;
  gallery: string[];
  altText: string;
}

export const SECTOR_IMAGE_MAP: Record<string, { main: string; gallery: string[] }> = {
  // LV01: Trồng trọt & Bảo vệ thực vật
  LV01: {
    main: "/tech-agri.png",
    gallery: ["/tech-agri.png", "/tech-biotech.png", "/tech-solar.png", "/tech-ai-vision.png"],
  },
  // LV02: Chăn nuôi & Thú y
  LV02: {
    main: "/tech-agri.png",
    gallery: ["/tech-agri.png", "/tech-biotech.png", "/tech-solar.png", "/tech-ai-vision.png"],
  },
  // LV03: Thủy sản & Nuôi trồng hải sản
  LV03: {
    main: "/tech-agri.png",
    gallery: ["/tech-agri.png", "/tech-biotech.png", "/tech-solar.png", "/tech-ai-vision.png"],
  },
  // LV04: Lâm nghiệp & Phát triển rừng
  LV04: {
    main: "/tech-agri.png",
    gallery: ["/tech-agri.png", "/tech-biotech.png", "/tech-solar.png", "/tech-ai-vision.png"],
  },
  // LV05: Chế biến nông sản & Thực phẩm - Đồ uống
  LV05: {
    main: "/tech-agri.png",
    gallery: ["/tech-agri.png", "/tech-biotech.png", "/tech-solar.png", "/tech-ai-vision.png"],
  },
  // LV06: Dệt may & Da giày công nghiệp
  LV06: {
    main: "/tech-ai-vision.png",
    gallery: ["/tech-ai-vision.png", "/tech-solar.png", "/tech-biotech.png", "/tech-agri.png"],
  },
  // LV07: Cơ khí chế tạo & Công nghiệp hỗ trợ
  LV07: {
    main: "/tech-solar.png",
    gallery: ["/tech-solar.png", "/tech-ai-vision.png", "/tech-biotech.png", "/tech-agri.png"],
  },
  // LV08: Điện, Điện tử, Tự động hóa & Robot
  LV08: {
    main: "/tech-ai-vision.png",
    gallery: ["/tech-ai-vision.png", "/tech-solar.png", "/tech-biotech.png", "/tech-agri.png"],
  },
  // LV09: Hóa chất, Vật liệu mới & Công nghệ Nano
  LV09: {
    main: "/tech-biotech.png",
    gallery: ["/tech-biotech.png", "/tech-solar.png", "/tech-ai-vision.png", "/tech-agri.png"],
  },
  // LV10: Xây dựng, Giao thông & Hạ tầng kỹ thuật
  LV10: {
    main: "/tech-solar.png",
    gallery: ["/tech-solar.png", "/tech-ai-vision.png", "/tech-biotech.png", "/tech-agri.png"],
  },
  // LV11: Nước, Môi trường & Xử lý chất thải
  LV11: {
    main: "/tech-solar.png",
    gallery: ["/tech-solar.png", "/tech-ai-vision.png", "/tech-biotech.png", "/tech-agri.png"],
  },
  // LV12: Y tế & Trang thiết bị y tế chuyên dụng
  LV12: {
    main: "/tech-biotech.png",
    gallery: ["/tech-biotech.png", "/tech-ai-vision.png", "/tech-solar.png", "/tech-agri.png"],
  },
  // LV13: Dược liệu & Y dược học cổ truyền
  LV13: {
    main: "/tech-biotech.png",
    gallery: ["/tech-biotech.png", "/tech-agri.png", "/tech-solar.png", "/tech-ai-vision.png"],
  },
  // LV14: Công nghệ sinh học & Vi sinh ứng dụng
  LV14: {
    main: "/tech-biotech.png",
    gallery: ["/tech-biotech.png", "/tech-agri.png", "/tech-solar.png", "/tech-ai-vision.png"],
  },
  // LV15: Năng lượng mới & Năng lượng tái tạo
  LV15: {
    main: "/tech-solar.png",
    gallery: ["/tech-solar.png", "/tech-ai-vision.png", "/tech-biotech.png", "/tech-agri.png"],
  },
  // LV16: CNTT, Viễn thông & Chuyển đổi số
  LV16: {
    main: "/tech-ai-vision.png",
    gallery: ["/tech-ai-vision.png", "/tech-solar.png", "/tech-biotech.png", "/tech-agri.png"],
  },
  // LV17: Công nghệ tổng hợp & Chuyển giao kỹ thuật
  LV17: {
    main: "/innovation-hero-background.png",
    gallery: ["/innovation-hero-background.png", "/tech-ai-vision.png", "/tech-solar.png", "/tech-biotech.png"],
  },

  // 8 ngành công nghiệp BACLINK Bắc Ninh
  IND_ELEC: { main: "/tech-ai-vision.png", gallery: ["/tech-ai-vision.png", "/tech-solar.png", "/tech-biotech.png", "/tech-agri.png"] },
  IND_MECH: { main: "/tech-solar.png", gallery: ["/tech-solar.png", "/tech-ai-vision.png", "/tech-biotech.png", "/tech-agri.png"] },
  IND_AUTO: { main: "/tech-ai-vision.png", gallery: ["/tech-ai-vision.png", "/tech-solar.png", "/tech-biotech.png", "/tech-agri.png"] },
  IND_PLAS: { main: "/tech-biotech.png", gallery: ["/tech-biotech.png", "/tech-solar.png", "/tech-ai-vision.png", "/tech-agri.png"] },
  IND_MAT: { main: "/tech-biotech.png", gallery: ["/tech-biotech.png", "/tech-solar.png", "/tech-ai-vision.png", "/tech-agri.png"] },
  IND_IT: { main: "/tech-ai-vision.png", gallery: ["/tech-ai-vision.png", "/tech-solar.png", "/tech-biotech.png", "/tech-agri.png"] },
  IND_GREEN: { main: "/tech-solar.png", gallery: ["/tech-solar.png", "/tech-ai-vision.png", "/tech-biotech.png", "/tech-agri.png"] },
  IND_LOG: { main: "/tech-solar.png", gallery: ["/tech-solar.png", "/tech-ai-vision.png", "/tech-biotech.png", "/tech-agri.png"] },

  // Fallback aliases cho các mã ngành text tiếng Anh
  AGRI: { main: "/tech-agri.png", gallery: ["/tech-agri.png", "/tech-biotech.png", "/tech-solar.png", "/tech-ai-vision.png"] },
  FOOD: { main: "/tech-agri.png", gallery: ["/tech-agri.png", "/tech-biotech.png", "/tech-solar.png", "/tech-ai-vision.png"] },
  MECH: { main: "/tech-solar.png", gallery: ["/tech-solar.png", "/tech-ai-vision.png", "/tech-biotech.png", "/tech-agri.png"] },
  IT: { main: "/tech-ai-vision.png", gallery: ["/tech-ai-vision.png", "/tech-solar.png", "/tech-biotech.png", "/tech-agri.png"] },
  ENV: { main: "/tech-solar.png", gallery: ["/tech-solar.png", "/tech-ai-vision.png", "/tech-biotech.png", "/tech-agri.png"] },
  MED: { main: "/tech-biotech.png", gallery: ["/tech-biotech.png", "/tech-ai-vision.png", "/tech-solar.png", "/tech-agri.png"] },
  BIO: { main: "/tech-biotech.png", gallery: ["/tech-biotech.png", "/tech-agri.png", "/tech-solar.png", "/tech-ai-vision.png"] },
  ENERGY: { main: "/tech-solar.png", gallery: ["/tech-solar.png", "/tech-ai-vision.png", "/tech-biotech.png", "/tech-agri.png"] },
};

/**
 * Trả về đường dẫn ảnh đại diện dựa trên thứ tự ưu tiên 4 bậc:
 * 1. customImageUrl do người dùng tải lên
 * 2. Mã ngành chuẩn hóa (SECTOR_IMAGE_MAP)
 * 3. Phân tích từ khóa tiếng Việt trong tiêu đề
 * 4. Mặc định toàn hệ thống (/tech-ai-vision.png)
 */
export function getTechnologyImage(
  sectorCode?: string | null,
  title?: string | null,
  customImageUrl?: string | null
): string {
  // Bậc 1: Ảnh thực tế do người dùng tải lên (URL hoặc Base64 Data URI)
  if (customImageUrl && customImageUrl.trim()) {
    return customImageUrl.trim();
  }

  // Bậc 2: Tra cứu theo mã ngành chuẩn hóa
  const normalizedSector = (sectorCode || "").trim().toUpperCase();
  if (normalizedSector && SECTOR_IMAGE_MAP[normalizedSector]) {
    return SECTOR_IMAGE_MAP[normalizedSector].main;
  }

  // Bậc 3: Phân tích từ khóa ngữ nghĩa tiếng Việt đa dạng
  const normalizedTitle = (title || "").toLowerCase();

  // Nhóm Nông - Lâm - Thủy sản - Chế biến thực phẩm
  if (
    normalizedTitle.includes("nông") ||
    normalizedTitle.includes("thực phẩm") ||
    normalizedTitle.includes("lúa") ||
    normalizedTitle.includes("trồng") ||
    normalizedTitle.includes("chăn nuôi") ||
    normalizedTitle.includes("thủy sản") ||
    normalizedTitle.includes("tôm") ||
    normalizedTitle.includes("cá") ||
    normalizedTitle.includes("bảo quản") ||
    normalizedTitle.includes("trái cây") ||
    normalizedTitle.includes("xoài") ||
    normalizedTitle.includes("bưởi") ||
    normalizedTitle.includes("rừng")
  ) {
    return "/tech-agri.png";
  }

  // Nhóm Y tế - Sinh học - Dược - Vật liệu Nano
  if (
    normalizedTitle.includes("sinh học") ||
    normalizedTitle.includes("dược") ||
    normalizedTitle.includes("y tế") ||
    normalizedTitle.includes("vắc xin") ||
    normalizedTitle.includes("gen") ||
    normalizedTitle.includes("nano") ||
    normalizedTitle.includes("vật liệu") ||
    normalizedTitle.includes("hóa chất") ||
    normalizedTitle.includes("chitosan") ||
    normalizedTitle.includes("vi sinh")
  ) {
    return "/tech-biotech.png";
  }

  // Nhóm Năng lượng - Môi trường - Nước - Cơ khí hạ tầng
  if (
    normalizedTitle.includes("năng lượng") ||
    normalizedTitle.includes("môi trường") ||
    normalizedTitle.includes("pin") ||
    normalizedTitle.includes("mặt trời") ||
    normalizedTitle.includes("tái tạo") ||
    normalizedTitle.includes("rác") ||
    normalizedTitle.includes("nước thải") ||
    normalizedTitle.includes("bùn") ||
    normalizedTitle.includes("sấy") ||
    normalizedTitle.includes("bê tông") ||
    normalizedTitle.includes("xây dựng")
  ) {
    return "/tech-solar.png";
  }

  // Nhóm Công nghệ tổng hợp & Triển lãm công nghiệp
  if (
    normalizedTitle.includes("sáng tạo") ||
    normalizedTitle.includes("techmart") ||
    normalizedTitle.includes("triển lãm") ||
    normalizedTitle.includes("chuyển giao")
  ) {
    return "/innovation-hero-background.png";
  }

  // Bậc 4: Mặc định toàn hệ thống (AI & Công nghệ số)
  return "/tech-ai-vision.png";
}

/**
 * Trả về danh sách 4 hình ảnh gallery phục vụ Showcase trên thẻ hoặc trang chi tiết hồ sơ
 */
export function getTechnologyGallery(sectorCode?: string | null, title?: string | null): string[] {
  const normalizedSector = (sectorCode || "").trim().toUpperCase();
  if (normalizedSector && SECTOR_IMAGE_MAP[normalizedSector]) {
    return SECTOR_IMAGE_MAP[normalizedSector].gallery;
  }

  const main = getTechnologyImage(sectorCode, title);
  const pool = ["/tech-ai-vision.png", "/tech-solar.png", "/tech-biotech.png", "/tech-agri.png"];
  return [main, ...pool.filter((img) => img !== main)];
}
