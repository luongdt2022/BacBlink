/**
 * Technology Label Resolver Utility
 * Ánh xạ 18 mã Master Data công nghệ sang tiếng Việt thân thiện theo Spec Delta v17 (Mục 17.6)
 * và cung cấp cơ chế Fallback Title Case sạch đẹp cho mã phát sinh ngoài từ điển.
 */

export const TECH_LABEL_DICTIONARY: Record<string, string> = {
  "TECH-SUPERCRITICAL-CO2": "Chiết xuất CO2 siêu tới hạn",
  "TECH-NANO-EXTRACTION": "Chiết xuất công nghệ Nano",
  "TECH-BIOACTIVE-COMPOUNDS": "Phân lập hoạt chất sinh học",
  "TECH-AI-VISION": "Thị giác máy tính AI",
  "TECH-EDGE-COMPUTING": "Điện toán biên (Edge Computing)",
  "TECH-SMART-FACTORY": "Nhà máy thông minh (Smart Factory)",
  "TECH-CNC-5AXIS": "Gia công CNC 5 trục",
  "TECH-INDUSTRIAL-ROBOT": "Robot công nghiệp",
  "TECH-PRESSURE-DIE-CASTING": "Đúc áp lực cao",
  "TECH-ASIC-DESIGN": "Thiết kế vi mạch ASIC",
  "TECH-FPGA-ACCEL": "Tăng tốc phần cứng FPGA",
  "TECH-IOT-GATEWAY": "Cổng kết nối IoT Gateway",
  "TECH-POSTHARVEST-PRESERVATION": "Bảo quản sau thu hoạch",
  "TECH-BIO-COATING": "Màng bao sinh học",
  "TECH-COLD-PLASMA": "Công nghệ Plasma lạnh",
  "TECH-GRAPHENE-NANO": "Vật liệu Nano Graphene",
  "TECH-ANTI-CORROSION": "Sơn phủ chống ăn mòn",
  "TECH-RECYCLED-COMPOSITE": "Vật liệu Composite tái chế",
};

/**
 * Phân giải mã định danh công nghệ sang nhãn tiếng Việt rõ nghĩa.
 * Trường hợp mã chưa có trong từ điển, tự động loại bỏ tiền tố TECH- và chuyển sang Title Case.
 */
export function resolveTechLabel(techCode: string): string {
  if (!techCode) return "";
  const cleanCode = techCode.trim();
  if (TECH_LABEL_DICTIONARY[cleanCode]) {
    return TECH_LABEL_DICTIONARY[cleanCode];
  }

  // Fallback: Loại bỏ tiền tố TECH-, chuyển - hoặc _ thành khoảng trắng và định dạng Title Case
  return cleanCode
    .replace(/^TECH[-_]/i, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
