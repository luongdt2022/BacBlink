import { describe, expect, it } from "vitest";
import {
  SECTOR_IMAGE_MAP,
  getTechnologyGallery,
  getTechnologyImage,
} from "./technology-media";

describe("technology-media (TASK-01 Delta v2 - 17 mã ngành chuẩn KH&CN)", () => {
  it("SECTOR_IMAGE_MAP covers all 17 official sectors from LV01 to LV17", () => {
    for (let i = 1; i <= 17; i++) {
      const code = `LV${i.toString().padStart(2, "0")}`;
      expect(SECTOR_IMAGE_MAP).toHaveProperty(code);
      expect(SECTOR_IMAGE_MAP[code].main).toBeTruthy();
      expect(Array.isArray(SECTOR_IMAGE_MAP[code].gallery)).toBe(true);
      expect(SECTOR_IMAGE_MAP[code].gallery.length).toBe(4);
    }
  });

  it("prioritizes Tier 1 (customImageUrl) above all others", () => {
    const custom = "https://example.com/my-photo.jpg";
    const result = getTechnologyImage("LV01", "Nông nghiệp lúa gạo", custom);
    expect(result).toBe(custom);
  });

  it("uses Tier 2 (sector code) when customImageUrl is absent", () => {
    expect(getTechnologyImage("LV01")).toBe("/tech-agri.png");
    expect(getTechnologyImage("lv01")).toBe("/tech-agri.png"); // case-insensitive
    expect(getTechnologyImage("LV07")).toBe("/tech-solar.png");
    expect(getTechnologyImage("LV08")).toBe("/tech-ai-vision.png");
    expect(getTechnologyImage("LV12")).toBe("/tech-biotech.png");
    expect(getTechnologyImage("LV17")).toBe("/innovation-hero-background.png");
  });

  it("falls back to Tier 3 (keyword semantic matching) when sectorCode is unknown or null", () => {
    expect(getTechnologyImage(null, "Bảo quản quả bưởi da xanh bằng màng bao")).toBe("/tech-agri.png");
    expect(getTechnologyImage("", "Nghiên cứu vắc xin vi sinh nano")).toBe("/tech-biotech.png");
    expect(getTechnologyImage(undefined, "Hệ thống pin năng lượng mặt trời áp mái")).toBe("/tech-solar.png");
    expect(getTechnologyImage(null, "Không gian chuyển giao sáng tạo techmart")).toBe("/innovation-hero-background.png");
  });

  it("falls back to Tier 4 default (/tech-ai-vision.png) when no sector or keywords match", () => {
    expect(getTechnologyImage(null, "Hệ thống chung")).toBe("/tech-ai-vision.png");
    expect(getTechnologyImage("UNKNOWN_SECTOR", "")).toBe("/tech-ai-vision.png");
    expect(getTechnologyImage(null, null)).toBe("/tech-ai-vision.png");
  });

  it("getTechnologyGallery returns 4 distinct images and handles null/empty gracefully", () => {
    const galleryLV01 = getTechnologyGallery("LV01");
    expect(galleryLV01.length).toBe(4);
    expect(galleryLV01[0]).toBe("/tech-agri.png");

    const fallbackGallery = getTechnologyGallery(null, "Hệ thống AI");
    expect(fallbackGallery.length).toBe(4);
    expect(fallbackGallery[0]).toBe("/tech-ai-vision.png");
  });
});
