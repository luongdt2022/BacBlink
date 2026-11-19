export interface TechGroupOption {
  code: string;
  name: string;
  relatedSectors: string[];
}

/**
 * Danh mục Nhóm Kỹ Thuật & Công Nghệ chuẩn phục vụ Đặt hàng & Kết nối chuỗi cung ứng BACLINK
 * Hỗ trợ đầy đủ 8 ngành công nghiệp mũi nhọn Bắc Ninh (IND_*)
 */
export const TECH_GROUP_OPTIONS: TechGroupOption[] = [
  { code: 'CN01', name: 'Tự động hóa dây chuyền & Cánh tay Robot', relatedSectors: ['IND_AUTO', 'IND_MECH', 'IND_ELEC', 'LV07', 'LV08', 'LV03', 'LV04', 'LV13', 'LV18'] },
  { code: 'CN02', name: 'AI, Thị giác máy tính (Machine Vision) & Kiểm tra AOI', relatedSectors: ['IND_IT', 'IND_AUTO', 'IND_ELEC', 'LV01', 'LV05', 'LV07', 'LV08', 'LV14', 'LV15', 'LV16', 'LV17', 'LV10'] },
  { code: 'CN03', name: 'Cảm biến công nghiệp, Mạch điện tử & IIoT', relatedSectors: ['IND_ELEC', 'IND_AUTO', 'IND_IT', 'LV01', 'LV05', 'LV08', 'LV11', 'LV12', 'LV13', 'LV14', 'LV16'] },
  { code: 'CN04', name: 'Kỹ thuật ép phun nhựa chính xác & Khuôn cao phân tử', relatedSectors: ['IND_PLAS', 'IND_MECH', 'IND_MAT', 'LV01', 'LV02', 'LV05', 'LV09', 'LV11', 'LV15', 'LV17'] },
  { code: 'CN05', name: 'Hóa chất công nghiệp, Sơn phủ bề mặt & Xi mạ', relatedSectors: ['IND_PLAS', 'IND_MAT', 'IND_MECH', 'LV01', 'LV02', 'LV05', 'LV06', 'LV09', 'LV15'] },
  { code: 'CN06', name: 'Kho lạnh công nghiệp, Kiểm soát nhiệt ẩm & Phòng sạch', relatedSectors: ['IND_LOG', 'IND_ELEC', 'IND_GREEN', 'LV01', 'LV02', 'LV04', 'LV05'] },
  { code: 'CN07', name: 'Vật liệu mới, Hợp kim đặc chủng & Polymer composite', relatedSectors: ['IND_MAT', 'IND_PLAS', 'IND_ELEC', 'LV03', 'LV06', 'LV07', 'LV12', 'LV13', 'LV17'] },
  { code: 'CN08', name: 'Gia công CNC chính xác, Jig gá & Khuôn mẫu dập/đúc', relatedSectors: ['IND_MECH', 'IND_MAT', 'IND_AUTO', 'LV04', 'LV07', 'LV08', 'LV10', 'LV12', 'LV13', 'LV17'] },
  { code: 'CN09', name: 'Điện mặt trời áp mái nhà xưởng, ESS & Tiết kiệm năng lượng', relatedSectors: ['IND_GREEN', 'IND_ELEC', 'LV01', 'LV05', 'LV07', 'LV11', 'LV12', 'LV18'] },
  { code: 'CN10', name: 'Xử lý nước thải KCN & Tuần hoàn nước sản xuất', relatedSectors: ['IND_GREEN', 'IND_PLAS', 'LV01', 'LV02', 'LV03', 'LV05', 'LV06', 'LV11'] },
  { code: 'CN11', name: 'Xử lý khí thải, Thu hồi bụi & Giảm phát thải ESG', relatedSectors: ['IND_GREEN', 'IND_MAT', 'LV01', 'LV05', 'LV06', 'LV07', 'LV11', 'LV12', 'LV17'] },
  { code: 'CN12', name: 'Phần mềm ERP/MES, WMS & Quản trị nhà máy số', relatedSectors: ['IND_IT', 'IND_LOG', 'IND_AUTO', 'LV01', 'LV02', 'LV05', 'LV08', 'LV14', 'LV15', 'LV16', 'LV18'] },
  { code: 'CN13', name: 'Kho vận tự động AGV/AMR, Bao bì & Logistics KCN', relatedSectors: ['IND_LOG', 'IND_PLAS', 'IND_AUTO', 'LV01', 'LV11', 'LV12', 'LV14', 'LV15', 'LV16'] },
  { code: 'CN14', name: 'Thiết bị đo lường CMM, Kiểm định chất lượng & Quang học', relatedSectors: ['IND_ELEC', 'IND_MECH', 'IND_AUTO', 'LV07', 'LV08', 'LV09', 'LV10', 'LV15', 'LV17'] },
  { code: 'CN15', name: 'An toàn thông tin mạng OT/IT nhà máy (Industrial Cybersecurity)', relatedSectors: ['IND_IT', 'IND_ELEC', 'LV08', 'LV14', 'LV15', 'LV16'] }
];

export function getTechGroupsBySector(sectorCode?: string) {
  if (!sectorCode || sectorCode === 'ALL') {
    return {
      recommended: TECH_GROUP_OPTIONS,
      others: [] as TechGroupOption[],
      allSorted: TECH_GROUP_OPTIONS.map((tg) => ({
        ...tg,
        isRecommended: true,
        groupLabel: 'Tất cả nhóm kỹ thuật'
      }))
    };
  }

  const normalizedSector = sectorCode.trim().toUpperCase();
  const recommended = TECH_GROUP_OPTIONS.filter((tg) =>
    tg.relatedSectors.includes(normalizedSector)
  );
  const others = TECH_GROUP_OPTIONS.filter(
    (tg) => !tg.relatedSectors.includes(normalizedSector)
  );

  return {
    recommended,
    others,
    allSorted: [
      ...recommended.map((tg) => ({
        ...tg,
        isRecommended: true,
        groupLabel: 'Nhóm công nghệ phù hợp với ngành đã chọn (Gợi ý 5★)'
      })),
      ...others.map((tg) => ({
        ...tg,
        isRecommended: false,
        groupLabel: 'Nhóm công nghệ liên ngành khác'
      }))
    ]
  };
}

export const DEMAND_TYPE_OPTIONS = [
  { code: 'NC01', name: 'Đặt hàng gia công linh kiện / Mua sắm máy móc thiết bị mới' },
  { code: 'NC02', name: 'Nâng cấp, cải tiến, tự động hóa dây chuyền hiện có' },
  { code: 'NC03', name: 'Mua bản quyền, tiếp nhận chuyển giao quy trình kỹ thuật' },
  { code: 'NC04', name: 'Hợp tác R&D, chế tạo mẫu thử nghiệm cùng đối tác' },
  { code: 'NC05', name: 'Thuê thiết bị, phần mềm MES/ERP hoặc dịch vụ công nghiệp' },
  { code: 'NC06', name: 'Cần Ban Cố vấn Kỹ thuật BACLINK tư vấn giải pháp tối ưu' }
];

export const BUDGET_RANGES_7 = [
  'Chưa xác định / Nhận báo giá từ nhà cung ứng',
  'Dưới 100 triệu đồng',
  '100–500 triệu đồng',
  '500 triệu–1 tỷ đồng',
  '1–5 tỷ đồng',
  '5–10 tỷ đồng',
  'Trên 10 tỷ đồng'
];
