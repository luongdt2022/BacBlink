"use client";

import React from "react";

export interface SectorBannerBackgroundProps {
  sectorCode?: string | null;
  sectorName?: string | null;
  opacity?: number;
  className?: string;
}

/**
 * Component hiển thị họa tiết chìm (Watermark Vector Art) chuyên biệt theo 10 Nhóm ngành chuẩn NacenTech.
 * Nền xanh Navy gradient giữ nguyên, chỉ thay đổi logo chìm vector sắc nét tương ứng.
 */
export function SectorBannerBackground({
  sectorCode,
  sectorName,
  opacity = 0.45,
  className = "",
}: SectorBannerBackgroundProps) {
  // Chuẩn hóa mã ngành
  const code = (sectorCode || "").toUpperCase().trim();
  const name = (sectorName || "").toLowerCase();

  // Xác định mã ngành nếu chỉ có tên
  let resolvedCode = code;
  if (!resolvedCode) {
    if (name.includes("nông") || name.includes("lâm") || name.includes("thủy sản") || name.includes("trồng")) {
      resolvedCode = "LV01";
    } else if (name.includes("thực phẩm") || name.includes("đồ uống") || name.includes("chế biến")) {
      resolvedCode = "LV05";
    } else if (name.includes("cơ khí") || name.includes("chế tạo") || name.includes("kim loại")) {
      resolvedCode = "LV07";
    } else if (name.includes("điện") || name.includes("bán dẫn") || name.includes("tự động")) {
      resolvedCode = "LV08";
    } else if (name.includes("môi trường") || name.includes("nước") || name.includes("tái chế") || name.includes("rác")) {
      resolvedCode = "LV11";
    } else if (name.includes("xây dựng") || name.includes("hạ tầng") || name.includes("vật liệu")) {
      resolvedCode = "LV12";
    } else if (name.includes("logistics") || name.includes("vận tải") || name.includes("kho bãi")) {
      resolvedCode = "LV14";
    } else if (name.includes("du lịch") || name.includes("khách sạn") || name.includes("thương mại")) {
      resolvedCode = "LV15";
    } else if (name.includes("thông tin") || name.includes("phần mềm") || name.includes("viễn thông") || name.includes("cntt") || name.includes("số hóa")) {
      resolvedCode = "LV16";
    } else {
      resolvedCode = "LV17"; // Mặc định: Khoa học công nghệ & Đổi mới sáng tạo
    }
  }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 select-none overflow-hidden transition-opacity duration-300 ${className}`}
      style={{ opacity }}
    >
      <svg
        className="w-full h-full block"
        viewBox="0 0 1200 240"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ========================================================================= */}
        {/* LV01: NÔNG NGHIỆP CÔNG NGHỆ CAO */}
        {/* ========================================================================= */}
        {resolvedCode === "LV01" && (
          <g stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Cánh trái: Mầm lúa & Cảm biến đất */}
            <circle cx="100" cy="100" r="50" stroke="#38bdf8" strokeDasharray="4 4" opacity="0.4" />
            <circle cx="100" cy="100" r="40" opacity="0.6" />
            <path d="M100 135 V75" strokeWidth="2.5" opacity="0.9" />
            <path d="M100 100 C75 100 65 75 80 65 C95 55 100 85 100 100 Z" opacity="0.8" fill="rgba(56, 189, 248, 0.08)" />
            <path d="M100 85 C125 85 135 60 120 50 C105 40 100 70 100 85 Z" opacity="0.8" fill="rgba(56, 189, 248, 0.08)" />
            <path d="M100 65 C92 50 100 35 100 35 C100 35 108 50 100 65 Z" opacity="0.9" fill="rgba(56, 189, 248, 0.15)" />
            <path d="M100 135 L80 155 H30 M100 135 L120 155 H180" opacity="0.7" />
            <path d="M50 100 H15 M15 100 V60 H5" opacity="0.6" />
            <path d="M150 100 H195 L215 80 H250" opacity="0.6" />
            <circle cx="30" cy="155" r="3" fill="#38bdf8" />
            <circle cx="180" cy="155" r="3" fill="#38bdf8" />
            <circle cx="250" cy="80" r="3.5" fill="#38bdf8" />
            <circle cx="5" cy="60" r="3" fill="#38bdf8" />

            {/* Cánh phải: Drone UAV & Nhà màng */}
            <g transform="translate(1020, 45)">
              <rect x="-18" y="-12" width="36" height="24" rx="6" strokeWidth="2" opacity="0.9" fill="rgba(56, 189, 248, 0.15)" />
              <circle cx="0" cy="0" r="4" fill="#38bdf8" />
              <line x1="-15" y1="-10" x2="-35" y2="-25" strokeWidth="2" opacity="0.8" />
              <line x1="15" y1="-10" x2="35" y2="-25" strokeWidth="2" opacity="0.8" />
              <line x1="-15" y1="10" x2="-35" y2="25" strokeWidth="2" opacity="0.8" />
              <line x1="15" y1="10" x2="35" y2="25" strokeWidth="2" opacity="0.8" />
              <ellipse cx="-35" cy="-25" rx="14" ry="4" opacity="0.7" />
              <ellipse cx="35" cy="-25" rx="14" ry="4" opacity="0.7" />
              <ellipse cx="-35" cy="25" rx="14" ry="4" opacity="0.7" />
              <ellipse cx="35" cy="25" rx="14" ry="4" opacity="0.7" />
              <path d="M-10 15 L-50 110 M10 15 L50 110" strokeDasharray="3 3" opacity="0.5" />
              <path d="M-35 80 Q0 90 35 80" strokeDasharray="2 2" opacity="0.4" />
              <path d="M-50 110 Q0 125 50 110" strokeDasharray="3 3" opacity="0.6" />
            </g>
            <path d="M960 190 L1020 145 L1080 190 H960 Z" opacity="0.7" strokeWidth="1.8" />
            <path d="M1020 145 V190 M990 168 V190 M1050 168 V190" opacity="0.5" />
            <path d="M960 190 H900 L870 170 H820" opacity="0.5" />
            <circle cx="820" cy="170" r="3" fill="#38bdf8" />
            <circle cx="1160" cy="190" r="3" fill="#38bdf8" />
          </g>
        )}

        {/* ========================================================================= */}
        {/* LV05: CHẾ BIẾN THỰC PHẨM - ĐỒ UỐNG */}
        {/* ========================================================================= */}
        {resolvedCode === "LV05" && (
          <g stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Cánh trái: Băng chuyền & Chai lọ sạch */}
            <path d="M20 140 H220" strokeWidth="2" opacity="0.8" />
            <line x1="40" y1="140" x2="40" y2="155" opacity="0.6" />
            <line x1="80" y1="140" x2="80" y2="155" opacity="0.6" />
            <line x1="120" y1="140" x2="120" y2="155" opacity="0.6" />
            <line x1="160" y1="140" x2="160" y2="155" opacity="0.6" />
            <line x1="200" y1="140" x2="200" y2="155" opacity="0.6" />
            <g transform="translate(65, 80)">
              <path d="M10 0 H20 V12 L26 20 V55 H4 V20 L10 12 Z" opacity="0.8" fill="rgba(56, 189, 248, 0.1)" />
            </g>
            <g transform="translate(115, 70)">
              <rect x="0" y="0" width="30" height="65" rx="5" opacity="0.9" fill="rgba(56, 189, 248, 0.12)" />
              <line x1="5" y1="20" x2="25" y2="20" opacity="0.5" />
            </g>
            <g transform="translate(175, 45)">
              <path d="M20 0 L40 8 V25 C40 38 20 48 20 48 C20 48 0 38 0 25 V8 Z" opacity="0.8" fill="rgba(56, 189, 248, 0.08)" />
              <polyline points="12 24 18 30 28 18" strokeWidth="2" opacity="0.9" />
            </g>

            {/* Cánh phải: Phân tử enzym & Sấy lạnh CAS */}
            <g transform="translate(1000, 60)">
              <circle cx="0" cy="0" r="8" fill="rgba(56, 189, 248, 0.2)" strokeWidth="2" />
              <line x1="8" y1="0" x2="35" y2="-15" strokeWidth="2" />
              <circle cx="35" cy="-15" r="6" fill="#38bdf8" opacity="0.8" />
              <line x1="35" y1="-15" x2="65" y2="0" strokeWidth="1.5" />
              <circle cx="65" cy="0" r="7" fill="rgba(56, 189, 248, 0.2)" strokeWidth="2" />
              <line x1="65" y1="0" x2="65" y2="35" strokeWidth="2" />
              <circle cx="65" cy="35" r="5" fill="#38bdf8" opacity="0.8" />
              <line x1="65" y1="35" x2="35" y2="50" strokeWidth="1.5" />
              <circle cx="35" cy="50" r="7" fill="rgba(56, 189, 248, 0.2)" strokeWidth="2" />
              <line x1="35" y1="50" x2="0" y2="35" strokeWidth="2" />
              <circle cx="0" cy="35" r="5" fill="#38bdf8" opacity="0.8" />
              <line x1="0" y1="35" x2="0" y2="0" strokeWidth="1.5" />
            </g>
            <g transform="translate(1120, 150)">
              <line x1="-30" y1="0" x2="30" y2="0" strokeWidth="2" opacity="0.8" />
              <line x1="0" y1="-30" x2="0" y2="30" strokeWidth="2" opacity="0.8" />
              <line x1="-20" y1="-20" x2="20" y2="20" strokeWidth="1.5" opacity="0.7" />
              <line x1="-20" y1="20" x2="20" y2="-20" strokeWidth="1.5" opacity="0.7" />
              <circle cx="0" cy="0" r="4" fill="#38bdf8" />
            </g>
          </g>
        )}

        {/* ========================================================================= */}
        {/* LV07: CƠ KHÍ - CHẾ TẠO - CÔNG NGHIỆP HỖ TRỢ */}
        {/* ========================================================================= */}
        {resolvedCode === "LV07" && (
          <g stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Cánh trái: Bánh răng cơ khí & Tọa độ CAD */}
            <g transform="translate(100, 95)">
              <circle cx="0" cy="0" r="45" opacity="0.4" strokeDasharray="3 3" />
              <circle cx="0" cy="0" r="32" strokeWidth="2" opacity="0.8" />
              <circle cx="0" cy="0" r="14" strokeWidth="1.5" opacity="0.6" />
              <path d="M-8 -46 H8 L6 -34 H-6 Z" fill="rgba(56, 189, 248, 0.2)" opacity="0.9" />
              <path d="M-8 46 H8 L6 34 H-6 Z" fill="rgba(56, 189, 248, 0.2)" opacity="0.9" />
              <path d="M-46 -8 V8 L-34 6 V-6 Z" fill="rgba(56, 189, 248, 0.2)" opacity="0.9" />
              <path d="M46 -8 V8 L34 6 V-6 Z" fill="rgba(56, 189, 248, 0.2)" opacity="0.9" />
            </g>
            <g transform="translate(165, 145)">
              <circle cx="0" cy="0" r="22" strokeWidth="1.8" opacity="0.7" />
              <circle cx="0" cy="0" r="9" opacity="0.5" />
            </g>
            <path d="M150 95 H240 L260 75 H290" opacity="0.6" />
            <circle cx="290" cy="75" r="3" fill="#38bdf8" />

            {/* Cánh phải: Robot hàn Laser 6 trục */}
            <rect x="1080" y="180" width="60" height="20" rx="4" opacity="0.8" fill="rgba(56, 189, 248, 0.15)" />
            <circle cx="1110" cy="180" r="14" strokeWidth="2" opacity="0.9" />
            <line x1="1110" y1="180" x2="1060" y2="105" strokeWidth="3" opacity="0.85" />
            <circle cx="1060" cy="105" r="10" strokeWidth="2" fill="rgba(56, 189, 248, 0.2)" />
            <line x1="1060" y1="105" x2="980" y2="85" strokeWidth="2.5" opacity="0.85" />
            <circle cx="980" cy="85" r="8" strokeWidth="2" fill="rgba(56, 189, 248, 0.2)" />
            <line x1="980" y1="85" x2="945" y2="115" strokeWidth="2" opacity="0.9" />
            <polygon points="945,115 935,122 938,130 948,125" fill="#38bdf8" opacity="0.9" />
            <line x1="935" y1="125" x2="910" y2="155" strokeWidth="2" stroke="#38bdf8" strokeDasharray="2 2" />
            <circle cx="910" cy="155" r="4" fill="#38bdf8" />
          </g>
        )}

        {/* ========================================================================= */}
        {/* LV08: ĐIỆN - ĐIỆN TỬ - TỰ ĐỘNG HÓA */}
        {/* ========================================================================= */}
        {resolvedCode === "LV08" && (
          <g stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Cánh trái: Bo mạch IC SMD */}
            <rect x="75" y="70" width="50" height="50" rx="4" strokeWidth="2" opacity="0.9" fill="rgba(56, 189, 248, 0.15)" />
            <circle cx="85" cy="80" r="3" fill="#38bdf8" />
            <path d="M100 64 V35 L120 15 H180" opacity="0.7" />
            <path d="M115 64 V45 L135 25 H210" opacity="0.7" />
            <path d="M125 95 H170 L190 75 H240" opacity="0.7" />
            <circle cx="180" cy="15" r="3" fill="#38bdf8" />
            <circle cx="240" cy="75" r="3" fill="#38bdf8" />

            {/* Cánh phải: Xung PWM & Màn hình hiển thị */}
            <path d="M850 160 H880 V120 H910 V160 H940 V120 H970 V160 H1000 V120 H1030 V160 H1060" opacity="0.7" strokeWidth="2" />
            <g transform="translate(1110, 85)">
              <circle cx="0" cy="0" r="45" opacity="0.4" strokeDasharray="4 4" />
              <circle cx="0" cy="0" r="35" opacity="0.7" strokeWidth="1.8" />
              <path d="M-30 0 Q-15 -25 0 0 T30 0" strokeWidth="2" opacity="0.9" />
            </g>
          </g>
        )}

        {/* ========================================================================= */}
        {/* LV11: NƯỚC - MÔI TRƯỜNG - XỬ LÝ CHẤT THẢI */}
        {/* ========================================================================= */}
        {resolvedCode === "LV11" && (
          <g stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Cánh trái: Vòng tuần hoàn giọt nước */}
            <g transform="translate(100, 95)">
              <path d="M-30 -20 A38 38 0 0 1 30 -20" strokeWidth="2" opacity="0.8" />
              <polyline points="22 -28 30 -20 22 -12" strokeWidth="2" fill="none" />
              <path d="M35 -5 A38 38 0 0 1 0 38" strokeWidth="2" opacity="0.8" />
              <polyline points="8 33 0 38 0 30" strokeWidth="2" fill="none" />
              <path d="M-15 35 A38 38 0 0 1 -35 -5" strokeWidth="2" opacity="0.8" />
              <polyline points="-30 -12 -35 -5 -42 -10" strokeWidth="2" fill="none" />
              <path d="M0 -15 C-12 5 -15 15 -15 22 C-15 31 -7 38 0 38 C7 38 15 31 15 22 C15 15 12 5 0 -15 Z" fill="rgba(56, 189, 248, 0.15)" strokeWidth="1.8" opacity="0.9" />
            </g>

            {/* Cánh phải: Tuabin gió & Net Zero */}
            <g transform="translate(1080, 110)">
              <line x1="0" y1="0" x2="-8" y2="90" strokeWidth="2.5" opacity="0.8" />
              <line x1="0" y1="0" x2="8" y2="90" strokeWidth="2.5" opacity="0.8" />
              <circle cx="0" cy="0" r="6" fill="#38bdf8" opacity="0.9" />
              <path d="M0 -6 C-3 -30 -1 -55 0 -65 C1 -55 3 -30 0 -6 Z" fill="rgba(56, 189, 248, 0.2)" strokeWidth="1.8" />
              <path d="M5 3 C25 18 45 35 55 42 C45 42 25 30 5 3 Z" fill="rgba(56, 189, 248, 0.2)" strokeWidth="1.8" />
              <path d="M-5 3 C-25 18 -45 35 -55 42 C-45 42 -25 30 -5 3 Z" fill="rgba(56, 189, 248, 0.2)" strokeWidth="1.8" />
            </g>
          </g>
        )}

        {/* ========================================================================= */}
        {/* LV12: XÂY DỰNG - HẠ TẦNG - ĐÔ THỊ THÔNG MINH */}
        {/* ========================================================================= */}
        {resolvedCode === "LV12" && (
          <g stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Cánh trái: Cần trục tháp & Giàn thép */}
            <g transform="translate(110, 40)">
              <line x1="-8" y1="20" x2="-8" y2="160" strokeWidth="2" opacity="0.8" />
              <line x1="8" y1="20" x2="8" y2="160" strokeWidth="2" opacity="0.8" />
              <path d="M-8 40 L8 60 M-8 60 L8 80 M-8 80 L8 100 M-8 100 L8 120 M-8 120 L8 140 M-8 140 L8 160" opacity="0.5" />
              <line x1="-60" y1="20" x2="110" y2="20" strokeWidth="2.5" opacity="0.9" />
              <line x1="0" y1="-15" x2="-60" y2="20" opacity="0.7" />
              <line x1="0" y1="-15" x2="85" y2="20" opacity="0.7" />
            </g>

            {/* Cánh phải: Skyline tòa nhà & Cầu dây văng */}
            <rect x="940" y="90" width="35" height="110" opacity="0.7" fill="rgba(56, 189, 248, 0.08)" />
            <path d="M985 200 V70 L1015 50 V200 Z" opacity="0.8" fill="rgba(56, 189, 248, 0.12)" />
            <line x1="1110" y1="70" x2="1110" y2="200" strokeWidth="3" opacity="0.9" />
            <line x1="1110" y1="90" x2="1070" y2="190" opacity="0.7" />
            <line x1="1110" y1="90" x2="1150" y2="190" opacity="0.7" />
            <line x1="1060" y1="190" x2="1170" y2="190" strokeWidth="3" opacity="0.9" />
          </g>
        )}

        {/* ========================================================================= */}
        {/* LV14: LOGISTICS - VẬN TẢI - KHO BÃI */}
        {/* ========================================================================= */}
        {resolvedCode === "LV14" && (
          <g stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Cánh trái: Quả địa cầu tuyến hải trình */}
            <g transform="translate(110, 95)">
              <circle cx="0" cy="0" r="48" strokeWidth="2" opacity="0.7" />
              <ellipse cx="0" cy="0" rx="48" ry="18" opacity="0.4" />
              <ellipse cx="0" cy="0" rx="22" ry="48" opacity="0.4" />
              <path d="M-30 15 Q0 -45 35 -10" strokeWidth="2" strokeDasharray="3 3" opacity="0.9" />
              <polygon points="35,-10 32,-18 42,-12 37,-7" fill="#38bdf8" />
            </g>

            {/* Cánh phải: Tàu container hàng hải */}
            <g transform="translate(1000, 110)">
              <path d="M-80 35 L-70 55 H80 L110 35 Z" strokeWidth="2" opacity="0.9" fill="rgba(56, 189, 248, 0.15)" />
              <rect x="-55" y="15" width="22" height="16" opacity="0.7" fill="rgba(56, 189, 248, 0.1)" />
              <rect x="-30" y="15" width="22" height="16" opacity="0.7" fill="rgba(56, 189, 248, 0.1)" />
              <rect x="-30" y="-3" width="22" height="16" opacity="0.8" fill="rgba(56, 189, 248, 0.15)" />
              <rect x="55" y="-8" width="22" height="40" opacity="0.9" fill="rgba(56, 189, 248, 0.2)" />
            </g>
          </g>
        )}

        {/* ========================================================================= */}
        {/* LV15: DU LỊCH - KHÁCH SẠN - THƯƠNG MẠI */}
        {/* ========================================================================= */}
        {resolvedCode === "LV15" && (
          <g stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Cánh trái: Hoa la bàn 8 hướng */}
            <g transform="translate(100, 95)">
              <circle cx="0" cy="0" r="48" opacity="0.4" strokeDasharray="3 3" />
              <circle cx="0" cy="0" r="38" opacity="0.7" strokeWidth="1.8" />
              <polygon points="0,-48 6,-12 0,0 -6,-12" fill="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" />
              <polygon points="0,48 6,12 0,0 -6,12" fill="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" />
              <polygon points="-48,0 -12,-6 0,0 -12,6" fill="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" />
              <polygon points="48,0 12,-6 0,0 12,6" fill="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" />
            </g>

            {/* Cánh phải: Cánh buồm vươn khơi */}
            <g transform="translate(1040, 110)">
              <path d="M-15 40 C-10 -10 15 -45 35 -55 C25 -10 20 20 -15 40 Z" opacity="0.85" fill="rgba(56, 189, 248, 0.15)" strokeWidth="2" />
              <path d="M-45 42 L-35 55 H45 L58 42 Z" opacity="0.9" fill="rgba(56, 189, 248, 0.2)" strokeWidth="2" />
            </g>
          </g>
        )}

        {/* ========================================================================= */}
        {/* LV16: CNTT - VIỄN THÔNG - AI */}
        {/* ========================================================================= */}
        {resolvedCode === "LV16" && (
          <g stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Cánh trái: Đám mây Cloud & Khiên bảo mật */}
            <g transform="translate(110, 80)">
              <path d="M-35 15 C-42 15 -48 9 -48 2 C-48 -5 -43 -11 -37 -12 C-38 -15 -38 -18 -38 -20 C-38 -32 -28 -42 -15 -42 C-7 -42 0 -38 4 -32 C8 -38 15 -42 24 -42 C36 -42 46 -32 46 -20 C46 -18 45 -16 45 -14 C50 -12 55 -6 55 1 C55 9 48 15 40 15 Z" opacity="0.8" fill="rgba(56, 189, 248, 0.12)" strokeWidth="2" />
            </g>
            <g transform="translate(185, 120)">
              <path d="M0 -25 L22 -16 V3 C22 17 0 28 0 28 C0 28 -22 17 -22 3 V-16 Z" opacity="0.9" fill="rgba(56, 189, 248, 0.2)" strokeWidth="2" />
            </g>

            {/* Cánh phải: Mạng nơ-ron học sâu AI */}
            <g transform="translate(1040, 100)">
              <circle cx="-60" cy="-40" r="5" fill="#38bdf8" opacity="0.8" />
              <circle cx="-60" cy="0" r="5" fill="#38bdf8" opacity="0.8" />
              <circle cx="-60" cy="40" r="5" fill="#38bdf8" opacity="0.8" />
              <circle cx="0" cy="-55" r="6" fill="rgba(56, 189, 248, 0.3)" strokeWidth="2" />
              <circle cx="0" cy="-20" r="6" fill="rgba(56, 189, 248, 0.3)" strokeWidth="2" />
              <circle cx="0" cy="20" r="6" fill="rgba(56, 189, 248, 0.3)" strokeWidth="2" />
              <circle cx="0" cy="55" r="6" fill="rgba(56, 189, 248, 0.3)" strokeWidth="2" />
              <circle cx="60" cy="-25" r="7" fill="#38bdf8" opacity="0.9" />
              <circle cx="60" cy="25" r="7" fill="#38bdf8" opacity="0.9" />
              <line x1="-60" y1="-40" x2="0" y2="-55" opacity="0.4" />
              <line x1="-60" y1="-40" x2="0" y2="-20" opacity="0.4" />
              <line x1="-60" y1="0" x2="0" y2="-20" opacity="0.5" />
              <line x1="-60" y1="0" x2="0" y2="20" opacity="0.5" />
              <line x1="-60" y1="40" x2="0" y2="20" opacity="0.4" />
              <line x1="-60" y1="40" x2="0" y2="55" opacity="0.4" />
              <line x1="0" y1="-55" x2="60" y2="-25" opacity="0.6" />
              <line x1="0" y1="-20" x2="60" y2="-25" opacity="0.6" />
              <line x1="0" y1="20" x2="60" y2="25" opacity="0.6" />
              <line x1="0" y1="55" x2="60" y2="25" opacity="0.6" />
            </g>
          </g>
        )}

        {/* ========================================================================= */}
        {/* LV17: KHOA HỌC - CÔNG NGHỆ - ĐMST (MẪU GỐC) */}
        {/* ========================================================================= */}
        {resolvedCode === "LV17" && (
          <g stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Cánh trái: Chip vi mạch CPU & Tổ ong */}
            <polygon points="120,40 145,55 145,85 120,100 95,85 95,55" fill="none" opacity="0.4" />
            <polygon points="175,70 200,85 200,115 175,130 150,115 150,85" fill="none" opacity="0.3" />
            <rect x="70" y="60" width="60" height="60" rx="8" stroke="#38bdf8" strokeWidth="2" fill="none" opacity="0.8" />
            <rect x="80" y="70" width="40" height="40" rx="4" stroke="#7dd3fc" strokeWidth="1.5" fill="none" opacity="0.6" />
            <circle cx="100" cy="90" r="6" fill="#38bdf8" opacity="0.6" />
            <path d="M70 75 H35 M70 90 H20 M70 105 H30 M20 90 V140 H10" opacity="0.7" />
            <path d="M130 75 H165 L180 60 H220" opacity="0.7" />
            <circle cx="220" cy="60" r="3" fill="#38bdf8" />
            <circle cx="10" cy="140" r="3" fill="#38bdf8" />

            {/* Cánh phải: Chuỗi xoắn kép ADN */}
            <path d="M1080 20 Q1120 70 1080 120 T1080 220" fill="none" opacity="0.8" strokeWidth="2" />
            <path d="M1120 20 Q1080 70 1120 120 T1120 220" fill="none" opacity="0.8" strokeWidth="2" />
            <line x1="1083" y1="35" x2="1117" y2="35" opacity="0.7" />
            <line x1="1090" y1="50" x2="1110" y2="50" opacity="0.7" />
            <line x1="1083" y1="105" x2="1117" y2="105" opacity="0.7" />
            <line x1="1080" y1="120" x2="1120" y2="120" opacity="0.8" />
            <line x1="1090" y1="190" x2="1110" y2="190" opacity="0.7" />
            <path d="M1080 70 H1020 L1000 90 H940" opacity="0.6" />
            <circle cx="940" cy="90" r="4" fill="#38bdf8" />
          </g>
        )}
      </svg>
    </div>
  );
}
