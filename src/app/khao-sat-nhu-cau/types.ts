/**
 * Danh mục dữ liệu chuẩn Basic Design và Type Definitions cho Form Khảo sát Nhu cầu DNNVV
 * SSOT từ wireframe: Specification/02_BASIC_DESIGN/TASK-03_HO_SO_TIM_MUA_BUYER/wireframe_phieu_khao_sat_dnnvv.html
 */

export const PROVINCES_63 = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Hải Phòng', 'Đà Nẵng', 'Cần Thơ',
  'Bắc Ninh', 'Bắc Giang', 'Vĩnh Phúc', 'Quảng Ninh', 'Hải Dương',
  'Hưng Yên', 'Thái Nguyên', 'Phú Thọ', 'Nam Định', 'Ninh Bình',
  'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị',
  'Thừa Thiên Huế', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định', 'Phú Yên',
  'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận', 'Đắk Lắk', 'Đắk Nông',
  'Gia Lai', 'Kon Tum', 'Lâm Đồng', 'Bình Phước', 'Tây Ninh',
  'Bình Dương', 'Đồng Nai', 'Bà Rịa - Vũng Tàu', 'Long An', 'Tiền Giang',
  'Bến Tre', 'Trà Vinh', 'Vĩnh Long', 'Đồng Tháp', 'An Giang',
  'Kiên Giang', 'Hậu Giang', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau',
  'Hà Giang', 'Cao Bằng', 'Bắc Kạn', 'Tuyên Quang', 'Lào Cai',
  'Yên Bái', 'Điện Biên', 'Lai Châu', 'Sơn La', 'Hòa Bình',
  'Lạng Sơn', 'Hà Nam', 'Thái Bình'
];

export const TECH_GROUP_OPTIONS = [
  { code: 'CN01', name: 'Tự động hóa dây chuyền & Cánh tay Robot' },
  { code: 'CN02', name: 'AI, Thị giác máy tính (Machine Vision) & OCR' },
  { code: 'CN03', name: 'Cảm biến thông minh & Internet vạn vật (IoT)' },
  { code: 'CN04', name: 'Công nghệ sinh học, vi sinh & lên men' },
  { code: 'CN05', name: 'Công nghệ chiết xuất, tinh chế & hóa dược' },
  { code: 'CN06', name: 'Công nghệ bảo quản sau thu hoạch & sấy lạnh' },
  { code: 'CN07', name: 'Vật liệu mới, vật liệu Nano & Polymer composite' },
  { code: 'CN08', name: 'Gia công CNC chính xác & Khuôn mẫu' },
  { code: 'CN09', name: 'Hệ thống năng lượng mặt trời, ESS & Tiết kiệm điện' },
  { code: 'CN10', name: 'Xử lý nước thải công nghiệp & Tái tuần hoàn nước' },
  { code: 'CN11', name: 'Xử lý khí thải, bụi & Giảm phát thải CO2' },
  { code: 'CN12', name: 'Phần mềm ERP/MES điều hành sản xuất thông minh' }
];

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
  { id: 'matching', label: 'Kết nối trực tiếp Chuyên gia / Viện nghiên cứu phù hợp' },
  { id: 'finance', label: 'Hỗ trợ tiếp cận nguồn vốn ưu đãi / Quỹ ĐMST (NATIF)' },
  { id: 'training', label: 'Đào tạo nâng cao tay nghề & chuyển giao công nghệ' },
  { id: 'assessment', label: 'Đánh giá, thẩm định trình độ công nghệ theo TT17' }
];

// =========================================================================
// THUẬT TOÁN TNI CHUẨN PO-DEC-20261008-01 (4 CHIỀU K, L, N, O)
// =========================================================================
export function calculateTniScore(k: number, l: number, n: number, o: number): number {
  const raw = (k * 35 + l * 30 + n * 20 + o * 15) / 5;
  return Math.round(raw);
}

export function getTniBadge(score: number) {
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
  needConsulting: boolean;
  expectedGoal: string;
  budgetRange: string;
  urgency: number;     // K (35%)
  impact: number;      // L (30%)
  investment: number;  // N (20%)
  readiness: number;   // O (15%)
}
