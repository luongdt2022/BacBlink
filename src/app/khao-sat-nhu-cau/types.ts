/**
 * Danh mục dữ liệu chuẩn và Type Definitions cho Nhu cầu Mua & Đặt hàng công nghiệp BACLINK
 */

// Danh mục Địa bàn trọng điểm phục vụ tương thích ngược
export const PROVINCES_34 = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Hải Phòng', 'Đà Nẵng', 'Cần Thơ',
  'Bắc Ninh', 'Quảng Ninh', 'Hưng Yên', 'Thái Nguyên', 'Phú Thọ',
  'Ninh Bình', 'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Trị',
  'Thừa Thiên Huế', 'Quảng Ngãi', 'Khánh Hòa', 'Đắk Lắk', 'Gia Lai',
  'Lâm Đồng', 'Tây Ninh', 'Đồng Nai', 'Vĩnh Long', 'Đồng Tháp',
  'An Giang', 'Cà Mau', 'Cao Bằng', 'Tuyên Quang', 'Lào Cai',
  'Điện Biên', 'Lai Châu', 'Sơn La', 'Lạng Sơn'
];

export const PROVINCES_63 = PROVINCES_34;

export interface TechGroupOption {
  code: string;
  name: string;
  relatedSectors: string[];
}

/**
 * Danh mục Nhóm Công Nghệ chuẩn và Ma trận tương thích Ngành công nghiệp (IND_*) <-> Nhóm Công Nghệ
 */
export const TECH_GROUP_OPTIONS: TechGroupOption[] = [
  { code: 'CN01', name: 'Tự động hóa dây chuyền & Cánh tay Robot', relatedSectors: ['IND_AUTO', 'IND_MECH', 'IND_ELEC', 'LV07', 'LV08', 'LV03', 'LV04', 'LV13', 'LV18'] },
  { code: 'CN02', name: 'AI, Thị giác máy tính (Machine Vision) & OCR', relatedSectors: ['IND_IT', 'IND_AUTO', 'IND_ELEC', 'LV01', 'LV05', 'LV07', 'LV08', 'LV14', 'LV15', 'LV16', 'LV17', 'LV10'] },
  { code: 'CN03', name: 'Cảm biến thông minh & Internet vạn vật (IoT)', relatedSectors: ['IND_ELEC', 'IND_AUTO', 'IND_IT', 'LV01', 'LV05', 'LV08', 'LV11', 'LV12', 'LV13', 'LV14', 'LV16'] },
  { code: 'CN04', name: 'Công nghệ sinh học, vi sinh & lên men', relatedSectors: ['IND_PLAS', 'IND_GREEN', 'LV01', 'LV02', 'LV05', 'LV09', 'LV11', 'LV15', 'LV17'] },
  { code: 'CN05', name: 'Công nghệ chiết xuất, tinh chế & hóa chất kỹ thuật', relatedSectors: ['IND_PLAS', 'IND_MAT', 'LV01', 'LV02', 'LV05', 'LV06', 'LV09', 'LV15'] },
  { code: 'CN06', name: 'Công nghệ bảo quản công nghiệp & sấy lạnh', relatedSectors: ['IND_LOG', 'IND_GREEN', 'LV01', 'LV02', 'LV04', 'LV05'] },
  { code: 'CN07', name: 'Vật liệu mới, vật liệu Nano & Polymer composite', relatedSectors: ['IND_MAT', 'IND_PLAS', 'IND_ELEC', 'LV03', 'LV06', 'LV07', 'LV12', 'LV13', 'LV17'] },
  { code: 'CN08', name: 'Gia công CNC chính xác, In 3D & Khuôn mẫu', relatedSectors: ['IND_MECH', 'IND_MAT', 'IND_AUTO', 'LV04', 'LV07', 'LV08', 'LV10', 'LV12', 'LV13', 'LV17'] },
  { code: 'CN09', name: 'Hệ thống năng lượng mặt trời, ESS & Tiết kiệm điện', relatedSectors: ['IND_GREEN', 'IND_ELEC', 'LV01', 'LV05', 'LV07', 'LV11', 'LV12', 'LV18'] },
  { code: 'CN10', name: 'Xử lý nước thải công nghiệp & Tái tuần hoàn nước', relatedSectors: ['IND_GREEN', 'IND_PLAS', 'LV01', 'LV02', 'LV03', 'LV05', 'LV06', 'LV11'] },
  { code: 'CN11', name: 'Xử lý khí thải, bụi & Giảm phát thải CO2 (Sản xuất xanh)', relatedSectors: ['IND_GREEN', 'IND_MAT', 'LV01', 'LV05', 'LV06', 'LV07', 'LV11', 'LV12', 'LV17'] },
  { code: 'CN12', name: 'Phần mềm ERP/MES, Big Data, Cloud & Truy xuất nguồn gốc', relatedSectors: ['IND_IT', 'IND_LOG', 'IND_AUTO', 'LV01', 'LV02', 'LV05', 'LV08', 'LV14', 'LV15', 'LV16', 'LV18'] },
  { code: 'CN13', name: 'Kho vận tự động AGV, Logistics số & Truy vết chuỗi cung ứng', relatedSectors: ['IND_LOG', 'IND_IT', 'IND_AUTO', 'LV01', 'LV11', 'LV12', 'LV14', 'LV15', 'LV16'] },
  { code: 'CN14', name: 'Đo lường, Kiểm định chính xác & Thiết bị quang học', relatedSectors: ['IND_ELEC', 'IND_MECH', 'IND_AUTO', 'LV07', 'LV08', 'LV09', 'LV10', 'LV15', 'LV17'] },
  { code: 'CN15', name: 'An toàn thông tin & Bảo mật mạng công nghiệp (Cybersecurity)', relatedSectors: ['IND_IT', 'IND_ELEC', 'LV08', 'LV14', 'LV15', 'LV16'] }
];

/**
 * Trả về danh sách Nhóm công nghệ đã được phân nhóm theo Lĩnh vực đang chọn:
 * - Nhóm 1: Các nhóm công nghệ phù hợp trực tiếp với Lĩnh vực (5★ theo Ma trận Lĩnh vực - Công nghệ)
 * - Nhóm 2: Các nhóm công nghệ liên ngành khác (để người dùng vẫn có thể chọn nếu bài toán giao thoa)
 */
export function getTechGroupsBySector(sectorCode?: string) {
  if (!sectorCode || sectorCode === 'ALL') {
    return {
      recommended: TECH_GROUP_OPTIONS,
      others: [] as TechGroupOption[],
      allSorted: TECH_GROUP_OPTIONS.map((tg) => ({
        ...tg,
        isRecommended: true,
        groupLabel: 'Tất cả nhóm công nghệ'
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
        groupLabel: 'Nhóm công nghệ phù hợp với lĩnh vực đã chọn (Gợi ý 5★)'
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
  { code: 'NC01', name: 'Mua sắm dây chuyền / máy móc thiết bị mới hoàn toàn' },
  { code: 'NC02', name: 'Đổi mới, cải tiến, nâng cấp dây chuyền hiện có' },
  { code: 'NC03', name: 'Mua bản quyền, tiếp nhận chuyển giao quy trình công nghệ' },
  { code: 'NC04', name: 'Hợp tác nghiên cứu, đồng phát triển (R&D) với Viện/Trường' },
  { code: 'NC05', name: 'Thuê thiết bị, giải pháp hoặc dịch vụ công nghệ' },
  { code: 'NC06', name: 'Cần tư vấn xác định giải pháp kỹ thuật tối ưu' }
];

export const BUDGET_RANGES_7 = [
  'Chưa xác định / Cần báo giá từ chuyên gia',
  'Dưới 100 triệu đồng',
  '100–500 triệu đồng',
  '500 triệu–1 tỷ đồng',
  '1–5 tỷ đồng',
  '5–10 tỷ đồng',
  'Trên 10 tỷ đồng'
];

export const CRITERIA_8_LIST = [
  'Mức độ hiện đại của dây chuyền & thiết bị',
  'Năng suất sản xuất so với trung bình ngành',
  'Chất lượng và độ đồng đều của sản phẩm',
  'Mức độ tiết kiệm năng lượng & nguyên vật liệu',
  'Mức độ tự động hóa trong các công đoạn',
  'Mức độ số hóa dữ liệu quản lý vận hành',
  'Tiêu chuẩn an toàn lao động & vận hành máy móc',
  'Mức độ tuân thủ & bảo vệ môi trường sản xuất'
];

export const BOTTLENECK_17_LIST = [
  'Thiết bị cũ, lạc hậu, hay hỏng hóc',
  'Năng suất thấp, chưa đáp ứng đơn hàng lớn',
  'Tiêu hao nhiều nguyên vật liệu trong chế tạo',
  'Tiêu hao nhiều năng lượng (điện, dầu, than)',
  'Chất lượng sản phẩm chưa ổn định đồng đều',
  'Tỷ lệ sản phẩm lỗi / phế phẩm còn cao',
  'Chi phí sản xuất và giá thành đơn vị còn cao',
  'Thiếu tự động hóa, còn phụ thuộc nhân công thủ công',
  'Thiếu nhân lực kỹ thuật lành nghề & kỹ sư giỏi',
  'Thiếu dữ liệu theo dõi sản xuất thời gian thực',
  'Công nghệ giữa các công đoạn chưa đồng bộ',
  'Khó tiếp cận công nghệ mới, thiết bị tiên tiến',
  'Khó tiếp cận nguồn vốn ưu đãi đổi mới công nghệ',
  'Phát sinh nhiều chất thải, nước thải sản xuất',
  'Khó đáp ứng tiêu chuẩn kiểm định xuất khẩu',
  'Khó truy xuất nguồn gốc sản phẩm theo chuỗi',
  'Khó mở rộng quy mô và công suất nhà máy'
];

export const TAR_READINESS_9_LIST = [
  'Nhận biết và cập nhật xu hướng công nghệ mới',
  'Năng lực vận hành máy móc thiết bị hiện đại',
  'Năng lực bảo trì, sửa chữa, bảo dưỡng thiết bị',
  'Khả năng cải tiến, tối ưu hóa công nghệ tại xưởng',
  'Khả năng làm chủ và chuyển giao công nghệ mới',
  'Năng lực nghiên cứu và phát triển sản phẩm (R&D)',
  'Khả năng ứng dụng phần mềm chuyển đổi số quy trình',
  'Năng lực quản trị và khai thác dữ liệu sản xuất',
  'Sự sẵn sàng đầu tư tài chính cho đổi mới công nghệ'
];

export const MANAGEMENT_7_LIST = [
  'Có bộ phận hoặc nhân sự chuyên trách về kỹ thuật / công nghệ',
  'Có kế hoạch / lộ trình đổi mới công nghệ rõ ràng trong 1–3 năm',
  'Có ngân sách dự phòng riêng cho hoạt động KH&CN / công nghệ',
  'Có quy trình đánh giá, nghiệm thu hiệu quả công nghệ định kỳ',
  'Có hoạt động nghiên cứu & phát triển (R&D) nội bộ',
  'Có hợp tác thường xuyên với Viện nghiên cứu, Trường đại học',
  'Có liên kết, hợp tác với các doanh nghiệp công nghệ / nhà cung cấp'
];

export const FUNDING_SOURCES = [
  'Vốn tự có của doanh nghiệp',
  'Vay vốn ngân hàng thương mại',
  'Quỹ Phát triển KH&CN của doanh nghiệp',
  'Quỹ Đổi mới công nghệ Quốc gia (NATIF)',
  'Chương trình hỗ trợ từ ngân sách Nhà nước',
  'Đối tác đầu tư / Quỹ tài trợ quốc tế',
  'Nguồn huy động khác'
];

export const RECEIPT_FORMATS = [
  'Mua sắm thiết bị / máy móc mới trọn gói',
  'Nâng cấp, cải tạo thiết bị hiện có',
  'Thay thế từng phần dây chuyền sản xuất',
  'Chuyển giao quyền sở hữu công nghệ',
  'Thuê công nghệ / Bản quyền phần mềm',
  'Thuê chuyên gia tư vấn kỹ thuật trực tiếp',
  'Mua bản quyền sáng chế / Giải pháp hữu ích',
  'Hợp tác nghiên cứu phát triển chung',
  'Liên doanh, liên kết sản xuất',
  'Đồng phát triển công nghệ (Co-development)',
  'Đào tạo chuyển giao kỹ thuật chuyên sâu',
  'Cần tư vấn xác định giải pháp phù hợp'
];

export const AUTOMATION_TECH = [
  'Tự động hóa dây chuyền sản xuất',
  'Robot công nghiệp (AGV, Robot hàn, xếp hàng)',
  'Hệ thống điều khiển tự động (PLC, SCADA)',
  'Cảm biến thông minh & Chuẩn kết nối IoT',
  'Hệ thống giám sát vận hành thời gian thực',
  'Hệ thống kho thông minh (Smart Warehouse)',
  'Hệ thống tối ưu hóa và quản lý năng lượng'
];

export const DIGITAL_TECH = [
  'Phần mềm quản trị tổng thể doanh nghiệp (ERP)',
  'Hệ thống quản lý khách hàng & bán hàng (CRM)',
  'Hệ thống điều hành sản xuất tại xưởng (MES)',
  'Hệ thống quản lý kho & chuỗi cung ứng (WMS)',
  'Nền tảng thương mại điện tử B2B/B2C',
  'Điện toán đám mây & Dữ liệu tập trung',
  'Phân tích dữ liệu lớn (Big Data)',
  'Trí tuệ nhân tạo (AI Vision, Dự báo)',
  'An toàn thông tin & Bảo mật mạng công nghiệp',
  'Hệ thống số hóa hồ sơ & văn phòng không giấy'
];

export const GREEN_TECH = [
  'Giải pháp tiết kiệm & sử dụng hiệu quả năng lượng',
  'Năng lượng tái tạo (Điện mặt trời mái nhà, Sinh khối)',
  'Công nghệ giảm phát thải khí nhà kính (CO2)',
  'Hệ thống xử lý nước thải & tái sử dụng nước',
  'Tái chế và tận thu phụ phẩm công nghiệp',
  'Quy trình sản xuất sạch hơn (Cleaner Production)',
  'Mô hình kinh tế tuần hoàn trong sản xuất'
];

export const DESIRED_PARTNERS = [
  'Nhà cung cấp giải pháp / thiết bị công nghệ trong nước',
  'Nhà cung cấp công nghệ / chuyển giao từ nước ngoài',
  'Viện nghiên cứu, Trường đại học chuyên ngành',
  'Chuyên gia tư vấn kỹ thuật độc lập',
  'Doanh nghiệp FDI cùng chuỗi cung ứng'
];

export const SUPPORT_NEEDS_LIST = [
  { id: 'consulting', label: 'Tư vấn đánh giá hiện trạng & xây dựng bài toán kỹ thuật' },
  { id: 'matching', label: 'Kết nối trực tiếp Ban Cố vấn Kỹ thuật & Nhà cung ứng phù hợp' },
  { id: 'finance', label: 'Hỗ trợ tiếp cận nguồn vốn tài chính xanh & nâng cấp thiết bị' },
  { id: 'training', label: 'Đào tạo nâng cao tay nghề, Lean/5S & chuyển giao công nghệ' },
  { id: 'assessment', label: 'Tư vấn chuẩn hóa chứng chỉ ISO 9001 / IATF 16949 / ESG chuỗi cung ứng FDI' }
];

// =========================================================================
// THUẬT TOÁN TNI CHUẨN PO-DEC-20261008-01 (4 CHIỀU K, L, N, O)
// =========================================================================
export function calculateTniScore(k: number, l: number, n: number, o: number): number {
  if (k <= 0 || l <= 0 || n <= 0 || o <= 0) return 0;
  const raw = (k * 35 + l * 30 + n * 20 + o * 15) / 5;
  return Math.round(raw);
}

export function getTniBadge(score: number) {
  if (score <= 0) {
    return {
      label: 'Chưa đánh giá (Chọn 4 chỉ số K, L, N, O)',
      className: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
    };
  }
  if (score >= 80) {
    return {
      label: 'Cấp thiết rất cao (SLA 24h)',
      className: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30'
    };
  }
  if (score >= 65) {
    return {
      label: 'Nhu cầu cao (Ưu tiên kết nối)',
      className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
    };
  }
  if (score >= 50) {
    return {
      label: 'Nhu cầu trung bình',
      className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
    };
  }
  return {
    label: 'Nhu cầu thấp (Lưu trữ theo dõi)',
    className: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
  };
}

// =========================================================================
// TYPE DEFINITIONS FOR FULL 7-SECTION FORM
// =========================================================================

export interface EquipmentItem {
  id: string;
  stageName: string;
  machineName: string;
  productOutput: string;
  investmentYear: number;
  techOrigin: string;
  depreciationStatus: string;
}

export interface DemandItemForm {
  id: string;
  sectorCode: string;
  techGroupCode: string;
  demandTypeCode: string;
  stageName: string;
  technicalProblem: string;
  desiredSolution: string;
  solutionDetail?: string;
  needConsulting: boolean;
  expectedGoal: string;
  budgetRange: string;
  urgency: number;     // K (35%)
  impact: number;      // L (30%)
  investment: number;  // N (20%)
  readiness: number;   // O (15%)
}

