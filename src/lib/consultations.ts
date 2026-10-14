/**
 * Expert Consultations Data Types & Mock Client Service
 * Chuẩn hóa theo SSOT: BASIC_DESIGN_DELTA_EXPERT_WORKSPACE.md (Mục 3 & 6)
 */

export interface PreReadMaterial {
  name: string;
  size: string;
  url: string;
}

export interface ConsultationTicket {
  id: string;
  source: "DEPT_ASSIGNED" | "DIRECT_B2B";
  assignedByDepartment?: string;
  enterpriseName: string;
  enterpriseContactName?: string;
  enterpriseContactPhoneMasked?: string;
  enterpriseTniScore: number;
  title: string;
  description: string;
  advisoryFeeVnd?: number;
  feePayer?: string;
  location: string;
  duration: string;
  createdAt: string;
  expiresAt: string;
  remainingHours: number;
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "REJECTED";
  // Tab 2 fields
  meetingDate?: string;
  meetingTime?: string;
  meetingType?: string;
  meetingUrl?: string;
  canJoinMeeting?: boolean;
  meetingCountdownText?: string;
  preReadMaterials?: PreReadMaterial[];
  // Tab 3 fields
  completedAt?: string;
  moaDocumentUrl?: string;
  moaDocumentName?: string;
  enterpriseRating?: number;
  enterpriseReview?: string;
  expertEvaluation?: string;
  disbursementStatus?: "DISBURSED" | "AUDITING" | "NONE";
  disbursementAmountVnd?: number;
}

export const INITIAL_PENDING_CONSULTATIONS: ConsultationTicket[] = [
  {
    id: "REQ-CON-2026-081",
    source: "DEPT_ASSIGNED",
    assignedByDepartment: "Sở KH&CN Hà Nội",
    enterpriseName: "Công ty CP Dược Phẩm Trung Ương MediTech",
    enterpriseContactName: "Trần Anh Tuấn (GĐ Kỹ thuật)",
    enterpriseContactPhoneMasked: "0912****89 (Đã bảo vệ PDPD)",
    enterpriseTniScore: 86.4,
    title: "Tư Vấn Thẩm Định Công Nghệ Nâng Cấp Dây Chuyền Chiết Rót Tự Động Hóa Chuẩn GMP",
    description:
      "Doanh nghiệp đang chuẩn bị đấu thầu gói mua sắm dây chuyền chiết rót 4.000 chai/h, cần chuyên gia tư vấn độc lập đánh giá thông số kỹ thuật của 03 nhà thầu, kiểm tra sự tương thích với hệ thống bồn chứa hiện hữu và lập báo cáo thẩm định kỹ thuật.",
    advisoryFeeVnd: 15000000,
    feePayer: "Quỹ ĐMST Hà Nội chi trả",
    location: "Khảo sát tại Nhà máy Hòa Lạc, Hà Nội",
    duration: "02 buổi làm việc",
    createdAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    remainingHours: 18,
    status: "PENDING",
  },
  {
    id: "REQ-CON-2026-079",
    source: "DIRECT_B2B",
    enterpriseName: "HTX Nông Nghiệp Công Nghệ Cao An Phú (Lâm Đồng)",
    enterpriseContactName: "Lê Văn Hùng (Chủ tịch HTX)",
    enterpriseContactPhoneMasked: "0983****12 (Đã bảo vệ PDPD)",
    enterpriseTniScore: 72.8,
    title: "Tư Vấn Thiết Kế Hệ Thống Cánh Tay Robot Phân Loại Nông Sản Cho HTX Nông Nghiệp",
    description:
      "HTX cần chuyên gia xem xét bản vẽ mặt bằng nhà xưởng sơ bộ và tư vấn có nên đầu tư robot Delta phân loại nấm hay dùng băng chuyền cơ học thông thường.",
    advisoryFeeVnd: 5000000,
    feePayer: "Doanh nghiệp tự chi trả",
    location: "Trực tuyến qua Zoom",
    duration: "01 buổi làm việc (2 giờ)",
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    remainingHours: 36,
    status: "PENDING",
  },
  {
    id: "REQ-CON-2026-075",
    source: "DEPT_ASSIGNED",
    assignedByDepartment: "Sở KH&CN TP. Hồ Chí Minh",
    enterpriseName: "Công ty TNHH Nhựa Sinh Học GreenPack",
    enterpriseContactName: "Nguyễn Thị Mai (TP R&D)",
    enterpriseContactPhoneMasked: "0903****65 (Đã bảo vệ PDPD)",
    enterpriseTniScore: 81.2,
    title: "Tư Vấn Kiểm Nghiệm Độ Phân Hủy Sinh Học Bao Bì Nông Nghiệp TRL 5",
    description:
      "Tư vấn giải pháp thử nghiệm gia tốc môi trường đất cho màng phủ sinh học sản xuất từ tinh bột sắn biến tính.",
    advisoryFeeVnd: 12000000,
    feePayer: "Quỹ ĐMST TP.HCM chi trả",
    location: "Trực tuyến & gửi mẫu kiểm nghiệm",
    duration: "02 buổi làm việc",
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
    remainingHours: 22,
    status: "PENDING",
  },
];

export const INITIAL_SCHEDULED_CONSULTATIONS: ConsultationTicket[] = [
  {
    id: "REQ-CON-2026-068",
    source: "DIRECT_B2B",
    enterpriseName: "Công ty CP Robot Rạng Đông",
    enterpriseContactName: "Vũ Minh Quân (CTO)",
    enterpriseContactPhoneMasked: "0977****34 (Đã bảo vệ PDPD)",
    enterpriseTniScore: 88.5,
    title: "Họp Thẩm Định Sơ Bộ Với Công Ty CP Robot Rạng Đông",
    description: "Thẩm định kiến trúc điều khiển thời gian thực cho robot tự hành AGV trong kho vận thông minh.",
    location: "Trực tuyến qua Zoom",
    duration: "01 buổi làm việc (2 giờ)",
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    remainingHours: 0,
    status: "SCHEDULED",
    meetingDate: "Chiều Mai (15/10/2026)",
    meetingTime: "14:00 - 16:00",
    meetingType: "Trực tuyến qua Zoom",
    meetingUrl: "https://zoom.us/j/982348271",
    canJoinMeeting: false,
    meetingCountdownText: "Sẽ mở trước giờ họp 15 phút",
    preReadMaterials: [
      { name: "Ban_ve_mat_bang_nha_xuong_kho_van.pdf", size: "3.2 MB", url: "#" },
      { name: "Phieu_khao_sat_nhu_cau_TNI_RangDong.pdf", size: "1.1 MB", url: "#" },
    ],
  },
  {
    id: "REQ-CON-2026-065",
    source: "DEPT_ASSIGNED",
    assignedByDepartment: "Sở KH&CN Đà Nẵng",
    enterpriseName: "Công ty Cơ Khí Chính Xác An Long",
    enterpriseContactName: "Đỗ Quốc Bảo (PGĐ)",
    enterpriseContactPhoneMasked: "0935****88 (Đã bảo vệ PDPD)",
    enterpriseTniScore: 79.0,
    title: "Tư Vấn Quy Trình Thử Nghiệm Tải Trọng Động Khung Robot Scara",
    description: "Thẩm định tiêu chuẩn thử nghiệm độ rung và mỏi kim loại trên kết cấu hàn cánh tay Scara.",
    advisoryFeeVnd: 10000000,
    feePayer: "Quỹ ĐMST Đà Nẵng chi trả",
    location: "Trực tuyến qua Microsoft Teams",
    duration: "01 buổi làm việc",
    createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    remainingHours: 0,
    status: "SCHEDULED",
    meetingDate: "Hôm nay (14/10/2026)",
    meetingTime: "15:30 - 17:00",
    meetingType: "Trực tuyến qua MS Teams",
    meetingUrl: "https://teams.microsoft.com/l/meetup-join/198273645",
    canJoinMeeting: true,
    meetingCountdownText: "Phòng họp đã sẵn sàng (Đang diễn ra / mở trước 15 phút)",
    preReadMaterials: [
      { name: "So_do_tai_trong_dong_Scara.pdf", size: "4.8 MB", url: "#" },
    ],
  },
];

export const INITIAL_COMPLETED_CONSULTATIONS: ConsultationTicket[] = [
  {
    id: "REQ-CON-2026-050",
    source: "DEPT_ASSIGNED",
    assignedByDepartment: "Sở KH&CN Hà Nội",
    enterpriseName: "Công ty Cổ Phần Cơ Điện Việt Đức",
    enterpriseContactName: "Hoàng Minh Trí (Tổng Giám Đốc)",
    enterpriseContactPhoneMasked: "0918****99 (Đã bảo vệ PDPD)",
    enterpriseTniScore: 84.0,
    title: "Tư Vấn Tối Ưu Hóa Thuật Toán Điều Khiển Động Cơ Không Chổi Than BLDC",
    description: "Khảo sát và tư vấn khắc phục hiện tượng rung lắc mômen ở dải vận tốc thấp.",
    advisoryFeeVnd: 15000000,
    feePayer: "Quỹ ĐMST Hà Nội chi trả",
    location: "Nhà máy Khu Công nghệ cao Hòa Lạc",
    duration: "02 buổi làm việc",
    createdAt: "2026-09-10T08:00:00Z",
    expiresAt: "2026-09-12T08:00:00Z",
    remainingHours: 0,
    status: "COMPLETED",
    completedAt: "25/09/2026",
    moaDocumentUrl: "#",
    moaDocumentName: "Bien_ban_MoA_VietDuc_Signed.pdf",
    enterpriseRating: 5,
    enterpriseReview: "Chuyên gia phân tích sâu sắc, đưa ra giải pháp xử lý triệt để hiện tượng quá nhiệt rotor.",
    expertEvaluation: "Doanh nghiệp có đội ngũ kỹ sư tiếp thu rất nhanh, trang thiết bị đo kiểm đạt chuẩn.",
    disbursementStatus: "DISBURSED",
    disbursementAmountVnd: 15000000,
  },
  {
    id: "REQ-CON-2026-042",
    source: "DIRECT_B2B",
    enterpriseName: "Công ty TNHH Giải Pháp Tự Động Hóa VinaTech",
    enterpriseContactName: "Nguyễn Hải Đăng (GĐ Dự Án)",
    enterpriseContactPhoneMasked: "0908****21 (Đã bảo vệ PDPD)",
    enterpriseTniScore: 78.5,
    title: "Tư Vấn Đánh Giá Cảm Biến Quang Học Phân Loại Màu Sắc Tốc Độ Cao",
    description: "Thẩm định sai số nhận dạng quang phổ trong điều kiện ánh sáng thay đổi.",
    advisoryFeeVnd: 8000000,
    feePayer: "Doanh nghiệp tự chi trả",
    location: "Trực tuyến qua Zoom",
    duration: "01 buổi làm việc",
    createdAt: "2026-08-20T10:00:00Z",
    expiresAt: "2026-08-22T10:00:00Z",
    remainingHours: 0,
    status: "COMPLETED",
    completedAt: "10/09/2026",
    moaDocumentUrl: "#",
    moaDocumentName: "Bien_ban_MoA_VinaTech_Signed.pdf",
    enterpriseRating: 5,
    enterpriseReview: "Tư vấn rất thực tế, giúp doanh nghiệp tiết kiệm hàng trăm triệu chi phí mua cảm biến ngoại.",
    expertEvaluation: "Hồ sơ bản vẽ đầy đủ, đề tài có tiềm năng đăng ký sáng chế.",
    disbursementStatus: "AUDITING",
    disbursementAmountVnd: 8000000,
  },
];
