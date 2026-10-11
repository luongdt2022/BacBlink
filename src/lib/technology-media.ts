/**
 * Helper cung cap hinh anh dai dien va bo suu tap anh cho Cong nghe / Chao ban
 * theo linh vuc (sectorCode) va tu khoa, tuan thu Wireframe Basic Design.
 */

export interface TechnologyMedia {
  mainImage: string;
  gallery: string[];
  altText: string;
}

const SECTOR_IMAGE_MAP: Record<string, { main: string; gallery: string[] }> = {
  // Nong nghiep, Thuc pham, Che bien (LV01, LV02...)
  LV01: {
    main: "/tech-agri.png",
    gallery: ["/tech-agri.png", "/tech-solar.png", "/tech-biotech.png", "/tech-ai-vision.png"],
  },
  LV02: {
    main: "/tech-agri.png",
    gallery: ["/tech-agri.png", "/tech-biotech.png", "/tech-solar.png", "/tech-ai-vision.png"],
  },
  // Y te, Duoc pham, Cong nghe sinh hoc (LV05, LV14...)
  LV05: {
    main: "/tech-biotech.png",
    gallery: ["/tech-biotech.png", "/tech-ai-vision.png", "/tech-solar.png", "/tech-agri.png"],
  },
  LV14: {
    main: "/tech-biotech.png",
    gallery: ["/tech-biotech.png", "/tech-solar.png", "/tech-ai-vision.png", "/tech-agri.png"],
  },
  // Nang luong, Moi truong, Xu ly chat thai (LV11, LV15...)
  LV11: {
    main: "/tech-solar.png",
    gallery: ["/tech-solar.png", "/tech-ai-vision.png", "/tech-biotech.png", "/tech-agri.png"],
  },
  LV15: {
    main: "/tech-solar.png",
    gallery: ["/tech-solar.png", "/tech-agri.png", "/tech-biotech.png", "/tech-ai-vision.png"],
  },
  // Cong nghe so, AI, Dien tu, Tu dong hoa, Robot (LV07, LV08, LV16...)
  LV07: {
    main: "/tech-ai-vision.png",
    gallery: ["/tech-ai-vision.png", "/tech-solar.png", "/tech-biotech.png", "/tech-agri.png"],
  },
  LV08: {
    main: "/tech-ai-vision.png",
    gallery: ["/tech-ai-vision.png", "/tech-biotech.png", "/tech-solar.png", "/tech-agri.png"],
  },
  LV16: {
    main: "/tech-ai-vision.png",
    gallery: ["/tech-ai-vision.png", "/tech-solar.png", "/tech-biotech.png", "/tech-agri.png"],
  },
};

/**
 * Tra ve duong dan anh dai dien dua tren ma linh vuc (sectorCode) hoac tieu de
 */
export function getTechnologyImage(sectorCode?: string | null, title?: string | null): string {
  if (sectorCode && SECTOR_IMAGE_MAP[sectorCode.toUpperCase()]) {
    return SECTOR_IMAGE_MAP[sectorCode.toUpperCase()].main;
  }

  // Fallback dua vao tu khoa trong tieu de neu co
  const normalizedTitle = (title || "").toLowerCase();
  if (
    normalizedTitle.includes("nông") ||
    normalizedTitle.includes("thực phẩm") ||
    normalizedTitle.includes("lúa") ||
    normalizedTitle.includes("trồng")
  ) {
    return "/tech-agri.png";
  }

  if (
    normalizedTitle.includes("sinh học") ||
    normalizedTitle.includes("dược") ||
    normalizedTitle.includes("y tế") ||
    normalizedTitle.includes("vắc xin") ||
    normalizedTitle.includes("gen")
  ) {
    return "/tech-biotech.png";
  }

  if (
    normalizedTitle.includes("năng lượng") ||
    normalizedTitle.includes("môi trường") ||
    normalizedTitle.includes("pin") ||
    normalizedTitle.includes("mặt trời") ||
    normalizedTitle.includes("tái tạo") ||
    normalizedTitle.includes("rác")
  ) {
    return "/tech-solar.png";
  }

  return "/tech-ai-vision.png";
}

/**
 * Tra ve danh sach 4 hinh anh gallery phuc vu Showcase tren trang Chi tiet ho so chao ban
 */
export function getTechnologyGallery(sectorCode?: string | null, title?: string | null): string[] {
  if (sectorCode && SECTOR_IMAGE_MAP[sectorCode.toUpperCase()]) {
    return SECTOR_IMAGE_MAP[sectorCode.toUpperCase()].gallery;
  }

  const main = getTechnologyImage(sectorCode, title);
  const pool = ["/tech-ai-vision.png", "/tech-solar.png", "/tech-biotech.png", "/tech-agri.png"];
  return [main, ...pool.filter((img) => img !== main)];
}
