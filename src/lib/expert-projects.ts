/**
 * Expert Projects & TRL Kanban Data Types & Initial Data
 * Chuẩn hóa theo SSOT: BASIC_DESIGN_DELTA_EXPERT_WORKSPACE.md (Mục 4)
 */

export type KanbanStageKey =
  | "INTAKE_NDA"
  | "DEAL_ROOM"
  | "TRL_ASSESSMENT"
  | "MOU_SIGNED"
  | "TRANSFER_COMPLETED";

export interface KanbanStageConfig {
  key: KanbanStageKey;
  label: string;
  badgeColor: string;
  description: string;
}

export const KANBAN_TRL_STAGES: KanbanStageConfig[] = [
  {
    key: "INTAKE_NDA",
    label: "Tiếp Nhận & Ký NDA",
    badgeColor: "bg-brand-50 text-brand-800 border-brand-200 dark:bg-brand-950/60 dark:text-brand-300",
    description: "Tiếp nhận đề xuất hợp tác từ Radar AI hoặc phiên tư vấn, ký kết thỏa thuận bảo mật NDA.",
  },
  {
    key: "DEAL_ROOM",
    label: "Đàm Phán Deal Room 1-1",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300",
    description: "Không gian bảo mật trao đổi tài liệu độc quyền, bản thiết kế chi tiết và mã nguồn.",
  },
  {
    key: "TRL_ASSESSMENT",
    label: "Thẩm Định & Thử Nghiệm TRL",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
    description: "Đánh giá mức độ sẵn sàng công nghệ hiện tại và thử nghiệm mẫu thử tại phòng Lab / xưởng.",
  },
  {
    key: "MOU_SIGNED",
    label: "Dự Thảo & Ký Kết MOU",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300",
    description: "Thống nhất điều khoản chuyển giao công nghệ, bản quyền tác giả và ký kết MOU điện tử.",
  },
  {
    key: "TRANSFER_COMPLETED",
    label: "Đồng Hành Chuyển Giao & Nghiệm Thu",
    badgeColor: "bg-brand-100 text-brand-800 border-brand-200 dark:bg-brand-950/60 dark:text-brand-300",
    description: "Đào tạo vận hành, theo dõi chuyển giao kỹ thuật và nghiệm thu đạt mốc TRL mục tiêu.",
  },
];

export interface ExpertProject {
  id: string;
  projectCode: string; // PRJ-EXP-YYYY-XXXX
  title: string;
  stage: KanbanStageKey;
  securityStatus: "CHỜ KÝ NDA" | "NDA ĐÃ KÝ" | "DỰ THẢO MOU" | "ĐANG NGHIỆM THU";
  partnerOrgName: string;
  sectorCode: string;
  sectorName: string;
  currentTrl: number;
  currentTrlLabel: string;
  targetTrl: number;
  targetTrlLabel: string;
  estimatedValueVnd: number;
  deadlineSlaText: string;
  dealRoomUrl: string;
}

export const INITIAL_EXPERT_PROJECTS: ExpertProject[] = [
  {
    id: "proj-001",
    projectCode: "PRJ-EXP-2026-042",
    title: "Chuyển Giao Thuật Toán AI Giám Sát Mòn Dao Phay CNC Thời Gian Thực",
    stage: "DEAL_ROOM",
    securityStatus: "NDA ĐÃ KÝ",
    partnerOrgName: "Công ty TNHH Cơ Khí Chính Xác Hà Nội Precision",
    sectorCode: "03",
    sectorName: "Cơ khí - Tự động hóa",
    currentTrl: 4,
    currentTrlLabel: "Lab Prototype",
    targetTrl: 6,
    targetTrlLabel: "Thử Nghiệm Xưởng",
    estimatedValueVnd: 450000000,
    deadlineSlaText: "Còn 03 ngày (17/10/2026)",
    dealRoomUrl: "/portal/opportunities/proj-001/deal-room",
  },
  {
    id: "proj-002",
    projectCode: "PRJ-EXP-2026-049",
    title: "Nâng Cấp Hệ Thống Robot Delta Phân Loại Nông Sản Tốc Độ Cao",
    stage: "INTAKE_NDA",
    securityStatus: "CHỜ KÝ NDA",
    partnerOrgName: "HTX Nông Nghiệp Công Nghệ Cao An Phú",
    sectorCode: "01",
    sectorName: "Nông nghiệp công nghệ cao",
    currentTrl: 3,
    currentTrlLabel: "Proof-of-Concept",
    targetTrl: 5,
    targetTrlLabel: "Mô Phỏng Tích Hợp",
    estimatedValueVnd: 320000000,
    deadlineSlaText: "Còn 05 ngày (19/10/2026)",
    dealRoomUrl: "/portal/opportunities/proj-002/deal-room",
  },
  {
    id: "proj-003",
    projectCode: "PRJ-EXP-2026-031",
    title: "Thẩm Định & Tối Ưu Hóa Khung Robot Scara Tải Trọng 20kg",
    stage: "TRL_ASSESSMENT",
    securityStatus: "NDA ĐÃ KÝ",
    partnerOrgName: "Công ty Cơ Khí An Long",
    sectorCode: "03",
    sectorName: "Cơ khí - Tự động hóa",
    currentTrl: 5,
    currentTrlLabel: "Mô Phỏng Tích Hợp",
    targetTrl: 7,
    targetTrlLabel: "Pilot Thực Địa",
    estimatedValueVnd: 680000000,
    deadlineSlaText: "Còn 08 ngày (22/10/2026)",
    dealRoomUrl: "/portal/opportunities/proj-003/deal-room",
  },
  {
    id: "proj-004",
    projectCode: "PRJ-EXP-2026-020",
    title: "Thỏa Thuận MOU Chuyển Giao Dây Chuyền Chiết Rót Tự Động Hóa Chuẩn GMP",
    stage: "MOU_SIGNED",
    securityStatus: "DỰ THẢO MOU",
    partnerOrgName: "Công ty CP Dược Phẩm Trung Ương MediTech",
    sectorCode: "05",
    sectorName: "Y - Dược & Thiết bị y tế",
    currentTrl: 6,
    currentTrlLabel: "Thử Nghiệm Xưởng",
    targetTrl: 8,
    targetTrlLabel: "Thương Mại Hóa",
    estimatedValueVnd: 1200000000,
    deadlineSlaText: "Đã hoàn tất ký số",
    dealRoomUrl: "/portal/opportunities/proj-004/deal-room",
  },
  {
    id: "proj-005",
    projectCode: "PRJ-EXP-2026-008",
    title: "Chuyển Giao Động Cơ Không Chổi Than BLDC Cho Xe Tự Hành AGV",
    stage: "TRANSFER_COMPLETED",
    securityStatus: "ĐANG NGHIỆM THU",
    partnerOrgName: "Công ty Cổ Phần Cơ Điện Việt Đức",
    sectorCode: "03",
    sectorName: "Cơ khí - Tự động hóa",
    currentTrl: 7,
    currentTrlLabel: "Pilot Thực Địa",
    targetTrl: 9,
    targetTrlLabel: "Vận Hành Hoàn Hảo",
    estimatedValueVnd: 950000000,
    deadlineSlaText: "Đã nghiệm thu biên bản",
    dealRoomUrl: "/portal/opportunities/proj-005/deal-room",
  },
];
