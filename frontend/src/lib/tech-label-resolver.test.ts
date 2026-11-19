import { describe, it, expect } from "vitest";
import { resolveTechLabel, TECH_LABEL_DICTIONARY } from "./tech-label-resolver";

describe("Technology Label Resolver Utility (tech-label-resolver.ts)", () => {
  it("resolves all 18 Master Data technology codes to friendly Vietnamese labels", () => {
    // 1. Kiểm tra đủ 18 mã Master Data theo Spec 17.6
    expect(Object.keys(TECH_LABEL_DICTIONARY).length).toBe(18);

    expect(resolveTechLabel("TECH-SUPERCRITICAL-CO2")).toBe("Chiết xuất CO2 siêu tới hạn");
    expect(resolveTechLabel("TECH-NANO-EXTRACTION")).toBe("Chiết xuất công nghệ Nano");
    expect(resolveTechLabel("TECH-BIOACTIVE-COMPOUNDS")).toBe("Phân lập hoạt chất sinh học");
    expect(resolveTechLabel("TECH-AI-VISION")).toBe("Thị giác máy tính AI");
    expect(resolveTechLabel("TECH-EDGE-COMPUTING")).toBe("Điện toán biên (Edge Computing)");
    expect(resolveTechLabel("TECH-SMART-FACTORY")).toBe("Nhà máy thông minh (Smart Factory)");
    expect(resolveTechLabel("TECH-CNC-5AXIS")).toBe("Gia công CNC 5 trục");
    expect(resolveTechLabel("TECH-INDUSTRIAL-ROBOT")).toBe("Robot công nghiệp");
    expect(resolveTechLabel("TECH-PRESSURE-DIE-CASTING")).toBe("Đúc áp lực cao");
    expect(resolveTechLabel("TECH-ASIC-DESIGN")).toBe("Thiết kế vi mạch ASIC");
    expect(resolveTechLabel("TECH-FPGA-ACCEL")).toBe("Tăng tốc phần cứng FPGA");
    expect(resolveTechLabel("TECH-IOT-GATEWAY")).toBe("Cổng kết nối IoT Gateway");
    expect(resolveTechLabel("TECH-POSTHARVEST-PRESERVATION")).toBe("Bảo quản sau thu hoạch");
    expect(resolveTechLabel("TECH-BIO-COATING")).toBe("Màng bao sinh học");
    expect(resolveTechLabel("TECH-COLD-PLASMA")).toBe("Công nghệ Plasma lạnh");
    expect(resolveTechLabel("TECH-GRAPHENE-NANO")).toBe("Vật liệu Nano Graphene");
    expect(resolveTechLabel("TECH-ANTI-CORROSION")).toBe("Sơn phủ chống ăn mòn");
    expect(resolveTechLabel("TECH-RECYCLED-COMPOSITE")).toBe("Vật liệu Composite tái chế");
  });

  it("handles whitespace padding gracefully when resolving known codes", () => {
    expect(resolveTechLabel("  TECH-AI-VISION  ")).toBe("Thị giác máy tính AI");
  });

  it("applies intelligent fallback for unknown tech codes (removes TECH prefix and formats as Title Case)", () => {
    expect(resolveTechLabel("TECH-QUANTUM-ENCRYPTION")).toBe("Quantum Encryption");
    expect(resolveTechLabel("TECH_BIOTECH_CRISPR")).toBe("Biotech Crispr");
    expect(resolveTechLabel("ADVANCED-BATTERY-STORAGE")).toBe("Advanced Battery Storage");
  });

  it("returns empty string when input is empty or nullish", () => {
    expect(resolveTechLabel("")).toBe("");
    expect(resolveTechLabel("   ")).toBe("");
  });
});
