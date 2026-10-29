"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Save,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Star,
  Layers,
  Cpu,
  TrendingUp,
  Award,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  FileCheck2,
  HelpCircle,
  Briefcase,
  Users,
  Compass,
  FileText,
  Search,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/common/toast";
import { authClient, getStoredSession } from "@/lib/auth-client";
import { lookupTaxCode, fetchMyEnterpriseProfile } from "@/lib/enterprise-client";
import { PROVINCES_34 } from "@/app/khao-sat-nhu-cau/types";

// =========================================================================
// DATA CATALOGS & CONSTANTS
// =========================================================================

const SECTOR_OPTIONS = [
  "Cơ khí, Chế tạo máy & Tự động hóa",
  "Nông nghiệp công nghệ cao, nông nghiệp số",
  "Y - Dược, Sinh học & Thiết bị y tế",
  "Công nghệ thông tin, chuyển đổi số & AI",
  "Vật liệu mới, nano & hóa chất tiên tiến",
  "Năng lượng tái tạo & Công nghệ môi trường",
  "Điện - Điện tử & Viễn thông",
  "Chế biến thực phẩm & Đồ uống công nghệ cao",
  "Dệt may, da giày & thời trang kỹ thuật",
  "Logistics, Chuỗi cung ứng & Đô thị thông minh",
  "Khoa học sự sống & Công nghệ sinh thái khác",
];

const OWNERSHIP_OPTIONS = [
  "Doanh nghiệp tư nhân",
  "Công ty Cổ phần",
  "Doanh nghiệp Nhà nước",
  "Doanh nghiệp FDI",
  "Hợp tác xã",
];

const WORKFORCE_OPTIONS = [
  "Dưới 10 người",
  "10 - 49 người",
  "50 - dưới 100 người",
  "Từ 100 người trở lên",
];

const REVENUE_OPTIONS = [
  "Dưới 3 tỷ VNĐ",
  "Từ 3 đến dưới 10 tỷ VNĐ",
  "Từ 10 đến dưới 50 tỷ VNĐ",
  "Từ 50 tỷ VNĐ trở lên",
];

const OPERATING_ZONES = [
  "Trong Khu công nghiệp",
  "Khu công nghệ cao",
  "Cụm công nghiệp",
  "Ngoài khu/cụm công nghiệp",
];

const HIGH_QUAL_OPTIONS = [
  "Dưới 10%",
  "10 - dưới 30%",
  "30 - 50%",
  "Trên 50%",
];

const GOVERNANCE_PLATFORMS = [
  "ERP (Hệ thống hoạch định nguồn lực)",
  "CRM (Quản lý khách hàng)",
  "Phần mềm Kế toán số",
  "HRM (Quản lý nhân sự số)",
  "SCM (Quản lý chuỗi cung ứng)",
  "Quản trị công việc/dự án số (Jira, Trello, Base...)",
  "Chưa áp dụng nền tảng số nào",
];

const TECH_ACQUISITION_OPTIONS = [
  "Tự nghiên cứu R&D nội bộ",
  "Mua thiết bị, dây chuyền kèm công nghệ",
  "Mua bản quyền sáng chế / Li-xăng công nghệ",
  "Tiếp nhận chuyển giao từ Viện nghiên cứu, Trường ĐH",
  "Hợp tác nghiên cứu phát triển với đối tác",
  "Chưa có hoạt động mua/nhận chuyển giao",
];

const IMPACT_OUTCOMES_OPTIONS = [
  "Tăng doanh thu / lợi nhuận",
  "Giảm chi phí sản xuất, vận hành",
  "Nâng cao năng suất lao động",
  "Mở rộng thị phần, thâm nhập thị trường mới",
  "Nâng cao chất lượng sản phẩm, dịch vụ",
  "Giảm thiểu tác động môi trường, tiết kiệm năng lượng",
  "Chưa nhận thấy hiệu quả rõ rệt",
];

const DIGITAL_STRATEGY_OPTIONS = [
  "Đã có chiến lược/kế hoạch bằng văn bản",
  "Đang trong quá trình xây dựng",
  "Chưa có văn bản nhưng đã có định hướng",
  "Chưa có kế hoạch chuyển đổi số",
];

const DIGITAL_MATURITY_OPTIONS = [
  "Khởi đầu (Số hóa tài liệu rời rạc, nhận thức sơ bộ)",
  "Nâng cao (Đang chuyển đổi từng khâu, kết nối dữ liệu)",
  "Toàn diện (Tích hợp sâu, tự động hóa, điều hành theo thời gian thực)",
];

const DIGITIZED_ACTIVITIES_OPTIONS = [
  "Kế toán, tài chính",
  "Bán hàng, tiếp thị & chăm sóc khách hàng",
  "Quản lý nhân sự & hành chính số",
  "Quản lý sản xuất, vận hành, kho bãi",
  "Quản lý chuỗi cung ứng & logistics",
  "Nghiên cứu & Thiết kế sản phẩm (R&D/CAD/CAM)",
];

const ADVANCED_TECH_OPTIONS = [
  "Điện toán đám mây (Cloud Computing)",
  "Trí tuệ nhân tạo (AI) / Máy học (Machine Learning)",
  "Dữ liệu lớn (Big Data & Data Analytics)",
  "Internet vạn vật (IoT) / Cảm biến công nghiệp",
  "Tự động hóa bằng Robot / RPA",
  "Công nghệ Chuỗi khối (Blockchain)",
  "Chưa ứng dụng công nghệ số nào nêu trên",
];

const COLLAB_PARTNERS = [
  { key: "universities", label: "1. Viện nghiên cứu, Trường Đại học" },
  { key: "same_industry", label: "2. Doanh nghiệp khác trong cùng ngành" },
  { key: "supply_chain", label: "3. Khách hàng / Nhà cung cấp" },
  { key: "incubators", label: "4. Tổ chức tư vấn, Vườn ươm ĐMST" },
  { key: "funds", label: "5. Quỹ đầu tư, Tổ chức tài chính ĐMST" },
  { key: "gov_agencies", label: "6. Cơ quan quản lý Nhà nước về KH&CN" },
  { key: "international", label: "7. Đối tác / Chuyên gia quốc tế" },
];

const PUBLIC_SUPPORT_OPTIONS = [
  "Hỗ trợ tài chính, vốn mồi, quỹ phát triển KH&CN",
  "Hỗ trợ tư vấn chuyên gia, đào tạo nhân lực",
  "Hỗ trợ mặt bằng, cơ sở ươm tạo, phòng lab thí nghiệm",
  "Chưa nhận được hỗ trợ",
  "Chưa tiếp cận được kênh thông tin hỗ trợ",
];

const FUNDING_ACCESS_OPTIONS = [
  "Đã gọi vốn / nhận đầu tư thành công",
  "Đang trong quá trình tiếp cận, đàm phán",
  "Có dự kiến tìm kiếm nguồn vốn đầu tư ĐMST",
  "Chưa từng tiếp cận các quỹ đầu tư",
];

const IP_ASSET_OPTIONS = [
  "Bằng độc quyền Sáng chế",
  "Bằng độc quyền Giải pháp hữu ích (GPHI)",
  "Bằng độc quyền Kiểu dáng công nghiệp",
  "Nhãn hiệu / Thương hiệu đã được cấp văn bằng bảo hộ",
  "Bản quyền phần mềm / Tác quyền tác phẩm số",
  "Bí quyết kỹ thuật / Trade Secrets được bảo mật",
  "Chưa đăng ký tài sản trí tuệ nào",
];

const INNOVATION_RESULTS_OPTIONS = [
  "Được cấp văn bằng bảo hộ SHTT mới",
  "Thương mại hóa thành công sản phẩm mới ra thị trường",
  "Đạt giải thưởng uy tín về KH&CN / ĐMST",
  "Được công nhận là Doanh nghiệp KH&CN / DN ĐMST",
  "Tăng trưởng doanh thu đột phá nhờ ĐMST",
  "Chưa có kết quả nổi bật",
];

const NEW_PRODUCT_REVENUE_OPTIONS = [
  "Dưới 10% tổng doanh thu",
  "Từ 10% đến dưới 30%",
  "Từ 30% đến dưới 50%",
  "Từ 50% tổng doanh thu trở lên",
];

const RECORDED_IMPACTS_OPTIONS = [
  "Tạo thêm việc làm mới cho địa phương",
  "Thúc đẩy liên kết chuỗi giá trị và nhà cung ứng trong nước",
  "Gia tăng uy tín thương hiệu và vị thế cạnh tranh quốc tế",
  "Đóng góp vào ngân sách và phát triển kinh tế bền vững",
];

const BOTTLENECKS_OPTIONS = [
  "1. Thiếu nguồn vốn và rủi ro tài chính cao",
  "2. Thiếu nhân lực kỹ thuật & quản trị ĐMST trình độ cao",
  "3. Khó khăn trong việc tìm kiếm công nghệ, thiết bị phù hợp",
  "4. Thiếu thông tin về thị trường, đối tác và nhà cung cấp",
  "5. Nhu cầu thị trường chưa rõ ràng / rủi ro thương mại hóa lớn",
  "6. Cơ chế, chính sách hỗ trợ và thủ tục hành chính còn phức tạp",
  "7. Cơ sở vật chất, phòng thử nghiệm, kiểm định còn thiếu thốn",
];

const SUPPORT_NEEDS_OPTIONS = [
  "1. Hỗ trợ tài chính, vốn vay ưu đãi, kết nối quỹ đầu tư",
  "2. Đào tạo, bồi dưỡng nhân lực công nghệ & kỹ năng ĐMST",
  "3. Tư vấn tìm kiếm giải pháp công nghệ, chuyên gia kỹ thuật",
  "4. Kết nối cung - cầu công nghệ và chuyển giao bản quyền",
  "5. Hỗ trợ đăng ký bảo hộ và định giá tài sản trí tuệ (SHTT)",
  "6. Hỗ trợ xúc tiến thương mại, tìm kiếm đầu ra thị trường",
];

const INFO_NEEDS_ITEMS = [
  { key: "expert_db", label: "1. CSDL Chuyên gia KH&CN & Tư vấn công nghệ" },
  { key: "transferable_tech", label: "2. Danh bạ công nghệ, thiết bị sẵn sàng chuyển giao" },
  { key: "state_policies", label: "3. Chính sách hỗ trợ, gói tài trợ KH&CN của Nhà nước" },
  { key: "industry_demand", label: "4. Nhu cầu công nghệ của các DN khác trong hệ sinh thái" },
  { key: "emerging_trends", label: "5. Xu hướng công nghệ mới nổi (AI, Xanh, Tự động hóa...)" },
  { key: "tech_assessment_reports", label: "6. Báo cáo đánh giá trình độ & năng lực công nghệ ngành" },
  { key: "patents_ip", label: "7. Thông tin sáng chế, GPHI có khả năng thương mại hóa" },
  { key: "techmart_events", label: "8. Diễn đàn, sự kiện Techmart, hội chợ kết nối cung - cầu" },
];

const WILLING_INTERVIEW_OPTIONS = [
  "Sẵn sàng tham gia phỏng vấn chuyên sâu",
  "Sẽ cân nhắc tùy thuộc vào thời gian cụ thể",
  "Hiện tại chưa thể tham gia",
];

const WILLING_UPDATE_OPTIONS = [
  "Sẵn sàng tham gia và cập nhật định kỳ thường xuyên",
  "Cần nền tảng hỗ trợ hướng dẫn ban đầu",
  "Cần xem xét thêm trước khi quyết định",
];

const REQUESTED_FEATURES_OPTIONS = [
  "1. Tra cứu danh bạ doanh nghiệp & chuyên gia công nghệ xác thực",
  "2. Chấm điểm & Xem biểu đồ Radar Chart năng lực ĐMST tự động",
  "3. Đăng ký kết nối 1-1 bảo mật với nhà cung cấp công nghệ",
  "4. Cảnh báo tự động cơ hội tài trợ, dự án KH&CN mới",
  "5. Đăng bài tìm mua công nghệ được bảo vệ danh tính pháp nhân",
];

const STORAGE_DRAFT_KEY = "nacentech_survey_43q_draft";

// =========================================================================
// RADAR CHART COMPONENT (SVG 8 AXES)
// =========================================================================

interface RadarChartProps {
  radarData: { axis: string; score: number; maxScore: number; percentage: number }[];
}

function RadarChartSVG({ radarData }: RadarChartProps) {
  const size = 360;
  const center = size / 2;
  const radius = 130;
  const count = 8;

  // Cố định 8 trục chuẩn nếu dữ liệu backend thiếu hoặc đổi tên
  const standardAxes = [
    { label: "Quản trị", max: 12 },
    { label: "R&D & CN", max: 18 },
    { label: "Sản phẩm", max: 20 },
    { label: "SHTT", max: 10 },
    { label: "CĐS", max: 10 },
    { label: "Thị trường", max: 15 },
    { label: "Nhân lực", max: 7 },
    { label: "Liên kết", max: 8 },
  ];

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    const r = Math.max(0, Math.min(1, valueRatio)) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Tính tọa độ các điểm trên polygon giá trị thực
  const points = standardAxes.map((axis, i) => {
    const item = radarData.find((d) => d.axis.toLowerCase().includes(axis.label.toLowerCase())) || radarData[i];
    const score = item ? item.score : 0;
    const max = item ? item.maxScore : axis.max;
    const ratio = max > 0 ? score / max : 0;
    return getCoordinates(i, ratio);
  });

  const polygonPoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Grid webs (4 vòng tròn đồng tâm 25%, 50%, 75%, 100%)
  const gridRings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[340px] h-auto overflow-visible">
        {/* Background webs */}
        {gridRings.map((ring, ringIdx) => {
          const ringPoints = Array.from({ length: count })
            .map((_, i) => {
              const pt = getCoordinates(i, ring);
              return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
            })
            .join(" ");
          return (
            <polygon
              key={ringIdx}
              points={ringPoints}
              fill="none"
              stroke="currentColor"
              strokeWidth={ringIdx === 3 ? "1.5" : "1"}
              className={ringIdx === 3 ? "text-slate-300 dark:text-slate-700" : "text-slate-200 dark:text-slate-800"}
              strokeDasharray={ringIdx < 3 ? "3 3" : undefined}
            />
          );
        })}

        {/* 8 Trục từ tâm */}
        {standardAxes.map((_, i) => {
          const outer = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-slate-300 dark:text-slate-700"
            />
          );
        })}

        {/* Shaded Value Polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(37, 99, 235, 0.25)"
          stroke="#2563eb"
          strokeWidth="2.5"
          className="transition-all duration-700 ease-out"
        />

        {/* Point markers */}
        {points.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r="4.5"
            fill="#2563eb"
            stroke="#ffffff"
            strokeWidth="1.5"
            className="shadow-sm transition-all duration-500"
          />
        ))}

        {/* Labels */}
        {standardAxes.map((axis, i) => {
          const outer = getCoordinates(i, 1.2);
          const item = radarData.find((d) => d.axis.toLowerCase().includes(axis.label.toLowerCase())) || radarData[i];
          const pct = item ? Math.round(item.percentage) : 0;
          return (
            <text
              key={i}
              x={outer.x}
              y={outer.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-bold fill-slate-700 dark:fill-slate-300 select-none"
            >
              {axis.label} ({pct}%)
            </text>
          );
        })}
      </svg>
      <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-blue-600 inline-block" />
          Hồ sơ doanh nghiệp thực tế
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border border-slate-400 border-dashed inline-block" />
          Khung năng lực tối đa 100%
        </span>
      </div>
    </div>
  );
}

// =========================================================================
// MAIN PAGE COMPONENT
// =========================================================================

export default function KhaoSatDmstPage() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  // Wizard Step (1 - 5)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Authentication & Prefill state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isTaxCodeLocked, setIsTaxCodeLocked] = useState<boolean>(false);
  const [isLookingUpTax, setIsLookingUpTax] = useState<boolean>(false);
  const [isPrefilledFromSession, setIsPrefilledFromSession] = useState<boolean>(false);
  const [detectedProfile, setDetectedProfile] = useState<any | null>(null);
  const [enterpriseId, setEnterpriseId] = useState<string | null>(null);
  const [isVerifiedProfile, setIsVerifiedProfile] = useState<boolean>(false);
  const [prefillLoading, setPrefillLoading] = useState<boolean>(true);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [draftPromptVisible, setDraftPromptVisible] = useState<boolean>(false);

  // Form Submission & Result state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [evalResult, setEvalResult] = useState<any | null>(null);

  // -------------------------------------------------------------------------
  // FORM FIELDS (43 Questions)
  // -------------------------------------------------------------------------

  // Bước 1: C01 - C11
  const [c01LegalName, setC01LegalName] = useState("");
  const [c02TaxCode, setC02TaxCode] = useState("");
  const [c03Address, setC03Address] = useState("");
  const [c04Email, setC04Email] = useState("");
  const [c04Phone, setC04Phone] = useState("");
  const [c04Website, setC04Website] = useState("");
  const [c05Province, setC05Province] = useState("");
  const [c06MainSector, setC06MainSector] = useState("");
  const [c07Ownership, setC07Ownership] = useState("");
  const [c08Workforce, setC08Workforce] = useState("");
  const [c09Revenue, setC09Revenue] = useState("");
  const [c10OperatingZone, setC10OperatingZone] = useState("");
  const [c11HighQualRatio, setC11HighQualRatio] = useState("");

  // Bước 2: C12 - C16
  const [c12HasRdUnit, setC12HasRdUnit] = useState<boolean | null>(null);
  const [c13HasTraining, setC13HasTraining] = useState<boolean | null>(null);
  const [c14HasMachinery, setC14HasMachinery] = useState<boolean | null>(null);
  const [c15HasRdBudget, setC15HasRdBudget] = useState<boolean | null>(null);
  const [c16Platforms, setC16Platforms] = useState<string[]>([]);

  // Bước 3: C17 - C27
  const [c17NewProducts, setC17NewProducts] = useState<boolean | null>(null);
  const [c18ImprovedProducts, setC18ImprovedProducts] = useState<boolean | null>(null);
  const [c19ProcessInnovation, setC19ProcessInnovation] = useState<boolean | null>(null);
  const [c20OrgInnovation, setC20OrgInnovation] = useState<boolean | null>(null);
  const [c21MarketingInnovation, setC21MarketingInnovation] = useState<boolean | null>(null);
  const [c22TechAcquisition, setC22TechAcquisition] = useState<string[]>([]);
  const [c23ImpactOutcomes, setC23ImpactOutcomes] = useState<string[]>([]);
  const [c24DigitalStrategy, setC24DigitalStrategy] = useState("");
  const [c25DigitalMaturity, setC25DigitalMaturity] = useState("");
  const [c26DigitizedActivities, setC26DigitizedActivities] = useState<string[]>([]);
  const [c27AdvancedTech, setC27AdvancedTech] = useState<string[]>([]);

  // Bước 4: C28 - C36
  const [c28Collaborations, setC28Collaborations] = useState<Record<string, string>>({});
  const [c29PublicSupport, setC29PublicSupport] = useState<string[]>([]);
  const [c30FundingAccess, setC30FundingAccess] = useState("");
  const [c31IpAssets, setC31IpAssets] = useState<string[]>([]);
  const [c32InnovationResults, setC32InnovationResults] = useState<string[]>([]);
  const [c33NewProductRevenue, setC33NewProductRevenue] = useState("");
  const [c34RecordedImpacts, setC34RecordedImpacts] = useState<string[]>([]);
  const [c35IsExporting, setC35IsExporting] = useState<boolean | null>(null);
  const [c36InValueChain, setC36InValueChain] = useState<boolean | null>(null);

  // Bước 5: C37 - C43
  const [c37Bottlenecks, setC37Bottlenecks] = useState<string[]>([]);
  const [c38SupportNeeds, setC38SupportNeeds] = useState<string[]>([]);
  const [c39InfoNeeds, setC39InfoNeeds] = useState<Record<string, number>>({});
  const [c40WillingInterview, setC40WillingInterview] = useState("");
  const [c41WillingUpdate, setC41WillingUpdate] = useState("");
  const [c42RequestedFeatures, setC42RequestedFeatures] = useState<string[]>([]);
  const [c43Recommendations, setC43Recommendations] = useState("");

  // -------------------------------------------------------------------------
  // SMART PROFILE PREFILL & TAX LOOKUP
  // -------------------------------------------------------------------------

  const applyEnterpriseProfile = (af: any, notify: boolean = false) => {
    if (!af) return;
    setIsTaxCodeLocked(Boolean(af.isTaxCodeLocked ?? true));
    setIsPrefilledFromSession(true);
    if (af.legalName || af.name) setC01LegalName(af.legalName || af.name);
    if (af.taxCode) setC02TaxCode(af.taxCode);
    if (af.addressDetail || af.address) setC03Address(af.addressDetail || af.address);
    if (af.contactEmail) setC04Email(af.contactEmail);
    if (af.contactPhone) setC04Phone(af.contactPhone);
    if (af.website) setC04Website(af.website);
    const prov = af.provinceCity || af.province;
    if (prov) {
      const matched = PROVINCES_34.find(
        (p) => p.toLowerCase().includes(prov.toLowerCase()) || prov.toLowerCase().includes(p.toLowerCase())
      );
      if (matched) setC05Province(matched);
      else if (PROVINCES_34.includes(prov)) setC05Province(prov);
    }
    if (af.mainSectorName || af.sectorName) {
      const sector = af.mainSectorName || af.sectorName;
      const matchedSector = SECTOR_OPTIONS.find(
        (s) => s.toLowerCase().includes(sector.toLowerCase()) || sector.toLowerCase().includes(s.toLowerCase())
      );
      if (matchedSector) setC06MainSector(matchedSector);
    }
    if (af.ownershipType) setC07Ownership(af.ownershipType);
    if (af.workforceScale) setC08Workforce(af.workforceScale);
    if (af.revenueRange && af.revenueRange !== "[BẢO MẬT]") setC09Revenue(af.revenueRange);
    if (af.operatingZone) setC10OperatingZone(af.operatingZone);
    if (af.highQualificationRatio) setC11HighQualRatio(af.highQualificationRatio);
    if (af.hasRdUnit !== undefined) setC12HasRdUnit(Boolean(af.hasRdUnit));
    if (af.hasTechTraining !== undefined) setC13HasTraining(Boolean(af.hasTechTraining));
    if (af.hasMachineryUpgrade !== undefined) setC14HasMachinery(Boolean(af.hasMachineryUpgrade));
    if (af.hasRdBudget !== undefined) setC15HasRdBudget(Boolean(af.hasRdBudget));
    if (af.isExporting !== undefined) setC35IsExporting(Boolean(af.isExporting));
    if (af.inValueChain !== undefined) setC36InValueChain(Boolean(af.inValueChain));
    if (notify) {
      toast.success(
        `Đã tự động điền thông tin Doanh nghiệp "${af.legalName || af.name || af.taxCode}" vào phiếu khảo sát.`
      );
    }
  };

  // Tra cứu mã số thuế tự động (Hybrid Lookup: CSDL Quốc Gia / VietQR / NacenTwin)
  const handleLookupTaxCode = async () => {
    const rawTax = c02TaxCode.trim();
    if (!rawTax) {
      toast.warning("Vui lòng nhập Mã số thuế trước khi tra cứu.");
      return;
    }

    setIsLookingUpTax(true);
    try {
      const res = await lookupTaxCode(rawTax);
      if (res && res.found && res.name) {
        setC01LegalName(res.name);
        if (res.address) setC03Address(res.address);
        if (res.province) {
          const matchedProv = PROVINCES_34.find(
            (p) =>
              res.province?.toLowerCase().includes(p.toLowerCase()) ||
              p.toLowerCase().includes(res.province?.toLowerCase() || "")
          );
          if (matchedProv) setC05Province(matchedProv);
          else if (PROVINCES_34.includes(res.province)) setC05Province(res.province);
        }
        if (res.sectorName) {
          const matchedSector = SECTOR_OPTIONS.find(
            (s) =>
              res.sectorName?.toLowerCase().includes(s.toLowerCase()) ||
              s.toLowerCase().includes(res.sectorName?.toLowerCase() || "")
          );
          if (matchedSector) setC06MainSector(matchedSector);
        }
        const sourceName = res.source === "INTERNAL" ? "CSDL Doanh nghiệp NacenTwin" : "Cổng Thông tin VietQR";
        toast.success(
          `Đã tìm thấy thông tin: ${res.name} (Nguồn: ${sourceName}). Đã tự động điền vào phiếu.`
        );
      } else {
        toast.warning(
          res?.message || `Không tìm thấy thông tin cho MST ${rawTax}. Quý Doanh nghiệp vui lòng điền thủ công.`
        );
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi tra cứu mã số thuế từ máy chủ.");
    } finally {
      setIsLookingUpTax(false);
    }
  };

  // -------------------------------------------------------------------------
  // INITIAL DATA FETCH & PREFILL
  // -------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadPrefillData() {
      setPrefillLoading(true);
      try {
        const headers = authClient.getAuthHeaders();
        const res = await fetch("/api/v1/surveys/innovation-demand/prefill", {
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          if (cancelled) return;

          setIsAuthenticated(Boolean(data.isAuthenticated));
          setEnterpriseId(data.enterpriseId || null);
          setIsVerifiedProfile(Boolean(data.isVerifiedProfile));

          if (data.autofill) {
            const af = data.autofill;
            setDetectedProfile(af);
            // Form mở ra để trắng sạch, giữ gợi ý với nút bấm để người dùng chủ động điền
            return;
          }
        }

        // Kiểm tra xem session có hồ sơ Doanh nghiệp không (fallback sang portal enterprise profile)
        const session = getStoredSession();
        const isDemoAccount = session?.user?.email?.includes("demo.nacentech.vn");
        if (session?.accessToken && !isDemoAccount) {
          try {
            const profile = await fetchMyEnterpriseProfile();
            if (!cancelled && profile && (profile.name || profile.taxCode || profile.legalName)) {
              setIsAuthenticated(true);
              setDetectedProfile(profile);
              // Form mở ra để trắng sạch, giữ gợi ý với nút bấm để người dùng chủ động điền
              return;
            }
          } catch {
            // Bỏ qua nếu chưa tạo hồ sơ
          }
        }

        // Khách vãng lai: Kiểm tra xem có bản nháp LocalStorage không
        checkDraftInStorage();
      } catch (err) {
        console.warn("Prefill fallback:", err);
        const session = getStoredSession();
        const isDemoAccount = session?.user?.email?.includes("demo.nacentech.vn");
        if (session?.accessToken && !isDemoAccount) {
          try {
            const profile = await fetchMyEnterpriseProfile();
            if (!cancelled && profile && (profile.name || profile.taxCode || profile.legalName)) {
              setIsAuthenticated(true);
              setDetectedProfile(profile);
              return;
            }
          } catch {
            // Bỏ qua
          }
        }
        checkDraftInStorage();
      } finally {
        if (!cancelled) setPrefillLoading(false);
      }
    }

    loadPrefillData();
    return () => {
      cancelled = true;
    };
  }, []);

  // -------------------------------------------------------------------------
  // LOCALSTORAGE AUTO-SAVE (DEBOUNCED)
  // -------------------------------------------------------------------------

  const checkDraftInStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (raw) {
        setDraftPromptVisible(true);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.c01LegalName) setC01LegalName(d.c01LegalName);
      if (d.c02TaxCode && !isTaxCodeLocked) setC02TaxCode(d.c02TaxCode);
      if (d.c03Address) setC03Address(d.c03Address);
      if (d.c04Email) setC04Email(d.c04Email);
      if (d.c04Phone) setC04Phone(d.c04Phone);
      if (d.c04Website) setC04Website(d.c04Website);
      if (d.c05Province) setC05Province(d.c05Province);
      if (d.c06MainSector) setC06MainSector(d.c06MainSector);
      if (d.c07Ownership) setC07Ownership(d.c07Ownership);
      if (d.c08Workforce) setC08Workforce(d.c08Workforce);
      if (d.c09Revenue) setC09Revenue(d.c09Revenue);
      if (d.c10OperatingZone) setC10OperatingZone(d.c10OperatingZone);
      if (d.c11HighQualRatio) setC11HighQualRatio(d.c11HighQualRatio);
      if (d.c12HasRdUnit !== undefined) setC12HasRdUnit(d.c12HasRdUnit);
      if (d.c13HasTraining !== undefined) setC13HasTraining(d.c13HasTraining);
      if (d.c14HasMachinery !== undefined) setC14HasMachinery(d.c14HasMachinery);
      if (d.c15HasRdBudget !== undefined) setC15HasRdBudget(d.c15HasRdBudget);
      if (d.c16Platforms) setC16Platforms(d.c16Platforms);
      if (d.c17NewProducts !== undefined) setC17NewProducts(d.c17NewProducts);
      if (d.c18ImprovedProducts !== undefined) setC18ImprovedProducts(d.c18ImprovedProducts);
      if (d.c19ProcessInnovation !== undefined) setC19ProcessInnovation(d.c19ProcessInnovation);
      if (d.c20OrgInnovation !== undefined) setC20OrgInnovation(d.c20OrgInnovation);
      if (d.c21MarketingInnovation !== undefined) setC21MarketingInnovation(d.c21MarketingInnovation);
      if (d.c22TechAcquisition) setC22TechAcquisition(d.c22TechAcquisition);
      if (d.c23ImpactOutcomes) setC23ImpactOutcomes(d.c23ImpactOutcomes);
      if (d.c24DigitalStrategy) setC24DigitalStrategy(d.c24DigitalStrategy);
      if (d.c25DigitalMaturity) setC25DigitalMaturity(d.c25DigitalMaturity);
      if (d.c26DigitizedActivities) setC26DigitizedActivities(d.c26DigitizedActivities);
      if (d.c27AdvancedTech) setC27AdvancedTech(d.c27AdvancedTech);
      if (d.c28Collaborations) setC28Collaborations(d.c28Collaborations);
      if (d.c29PublicSupport) setC29PublicSupport(d.c29PublicSupport);
      if (d.c30FundingAccess) setC30FundingAccess(d.c30FundingAccess);
      if (d.c31IpAssets) setC31IpAssets(d.c31IpAssets);
      if (d.c32InnovationResults) setC32InnovationResults(d.c32InnovationResults);
      if (d.c33NewProductRevenue) setC33NewProductRevenue(d.c33NewProductRevenue);
      if (d.c34RecordedImpacts) setC34RecordedImpacts(d.c34RecordedImpacts);
      if (d.c35IsExporting !== undefined) setC35IsExporting(d.c35IsExporting);
      if (d.c36InValueChain !== undefined) setC36InValueChain(d.c36InValueChain);
      if (d.c37Bottlenecks) setC37Bottlenecks(d.c37Bottlenecks);
      if (d.c38SupportNeeds) setC38SupportNeeds(d.c38SupportNeeds);
      if (d.c39InfoNeeds) setC39InfoNeeds(d.c39InfoNeeds);
      if (d.c40WillingInterview) setC40WillingInterview(d.c40WillingInterview);
      if (d.c41WillingUpdate) setC41WillingUpdate(d.c41WillingUpdate);
      if (d.c42RequestedFeatures) setC42RequestedFeatures(d.c42RequestedFeatures);
      if (d.c43Recommendations) setC43Recommendations(d.c43Recommendations);
      setDraftPromptVisible(false);
      toast.success("Đã khôi phục thành công bản nháp đã lưu trước đó.");
    } catch {
      toast.error("Không thể đọc bản nháp.");
    }
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_DRAFT_KEY);
      setDraftPromptVisible(false);
      toast.info("Đã xóa bản nháp.");
    } catch {
      // Ignore
    }
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (prefillLoading || evalResult) return;

    // Không tự động lưu nháp nếu toàn bộ form đang trống
    const hasAnyInput = Boolean(
      c01LegalName.trim() || c02TaxCode.trim() || c03Address.trim() || c04Email.trim() || c04Phone.trim()
    );
    if (!hasAnyInput) return;

    const timer = setTimeout(() => {
      const draftData = {
        c01LegalName,
        c02TaxCode,
        c03Address,
        c04Email,
        c04Phone,
        c04Website,
        c05Province,
        c06MainSector,
        c07Ownership,
        c08Workforce,
        c09Revenue,
        c10OperatingZone,
        c11HighQualRatio,
        c12HasRdUnit,
        c13HasTraining,
        c14HasMachinery,
        c15HasRdBudget,
        c16Platforms,
        c17NewProducts,
        c18ImprovedProducts,
        c19ProcessInnovation,
        c20OrgInnovation,
        c21MarketingInnovation,
        c22TechAcquisition,
        c23ImpactOutcomes,
        c24DigitalStrategy,
        c25DigitalMaturity,
        c26DigitizedActivities,
        c27AdvancedTech,
        c28Collaborations,
        c29PublicSupport,
        c30FundingAccess,
        c31IpAssets,
        c32InnovationResults,
        c33NewProductRevenue,
        c34RecordedImpacts,
        c35IsExporting,
        c36InValueChain,
        c37Bottlenecks,
        c38SupportNeeds,
        c39InfoNeeds,
        c40WillingInterview,
        c41WillingUpdate,
        c42RequestedFeatures,
        c43Recommendations,
        timestamp: new Date().toISOString(),
      };

      try {
        localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(draftData));
        const now = new Date();
        setLastSavedTime(
          `${now.getHours().toString().padStart(2, "0")}:${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
        );
      } catch {
        // Ignore quota
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [
    prefillLoading,
    evalResult,
    c01LegalName,
    c02TaxCode,
    c03Address,
    c04Email,
    c04Phone,
    c04Website,
    c05Province,
    c06MainSector,
    c07Ownership,
    c08Workforce,
    c09Revenue,
    c10OperatingZone,
    c11HighQualRatio,
    c12HasRdUnit,
    c13HasTraining,
    c14HasMachinery,
    c15HasRdBudget,
    c16Platforms,
    c17NewProducts,
    c18ImprovedProducts,
    c19ProcessInnovation,
    c20OrgInnovation,
    c21MarketingInnovation,
    c22TechAcquisition,
    c23ImpactOutcomes,
    c24DigitalStrategy,
    c25DigitalMaturity,
    c26DigitizedActivities,
    c27AdvancedTech,
    c28Collaborations,
    c29PublicSupport,
    c30FundingAccess,
    c31IpAssets,
    c32InnovationResults,
    c33NewProductRevenue,
    c34RecordedImpacts,
    c35IsExporting,
    c36InValueChain,
    c37Bottlenecks,
    c38SupportNeeds,
    c39InfoNeeds,
    c40WillingInterview,
    c41WillingUpdate,
    c42RequestedFeatures,
    c43Recommendations,
  ]);

  // -------------------------------------------------------------------------
  // VALIDATION & NAVIGATION
  // -------------------------------------------------------------------------

  const handleNextStep = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Validate Step 1
    if (currentStep === 1) {
      if (!c01LegalName.trim()) {
        toast.error("Vui lòng nhập Tên doanh nghiệp đầy đủ.");
        return;
      }
      if (!c02TaxCode.trim()) {
        toast.error("Vui lòng nhập Mã số thuế.");
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // -------------------------------------------------------------------------
  // SUBMISSION LOGIC
  // -------------------------------------------------------------------------

  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!c01LegalName.trim()) {
      toast.error("Tên doanh nghiệp không được để trống.");
      setCurrentStep(1);
      return;
    }

    if (c37Bottlenecks.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 rào cản tại Câu 37.");
      setCurrentStep(5);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      enterpriseId: enterpriseId || undefined,
      taxCode: c02TaxCode.trim(),
      companyName: c01LegalName.trim(),
      answers: {
        c01_legal_name: c01LegalName.trim(),
        c02_tax_code: c02TaxCode.trim(),
        c03_address: c03Address.trim(),
        c04_contact_email: c04Email.trim(),
        c04_contact_phone: c04Phone.trim(),
        c04_website: c04Website.trim(),
        c05_province: c05Province,
        c06_main_sector: c06MainSector,
        c07_ownership: c07Ownership,
        c08_workforce: c08Workforce,
        c09_revenue: c09Revenue,
        c10_operating_zone: c10OperatingZone,
        c11_high_qual_ratio: c11HighQualRatio,
        c12_has_rd_unit: c12HasRdUnit ?? false,
        c13_has_training: c13HasTraining ?? false,
        c14_has_machinery_upgrade: c14HasMachinery ?? false,
        c15_has_rd_budget: c15HasRdBudget ?? false,
        c16_governance_platforms: c16Platforms,
        c17_new_products: c17NewProducts ?? false,
        c18_improved_products: c18ImprovedProducts ?? false,
        c19_process_innovation: c19ProcessInnovation ?? false,
        c20_org_innovation: c20OrgInnovation ?? false,
        c21_marketing_innovation: c21MarketingInnovation ?? false,
        c22_tech_acquisition: c22TechAcquisition,
        c23_impact_outcomes: c23ImpactOutcomes,
        c24_digital_strategy: c24DigitalStrategy,
        c25_digital_maturity: c25DigitalMaturity,
        c26_digitized_activities: c26DigitizedActivities,
        c27_digital_technologies: c27AdvancedTech,
        c28_collaborations: c28Collaborations,
        c29_public_support: c29PublicSupport,
        c30_funding_access: c30FundingAccess,
        c31_ip_assets: c31IpAssets,
        c32_innovation_results: c32InnovationResults,
        c33_new_product_revenue_ratio: c33NewProductRevenue,
        c34_recorded_impacts: c34RecordedImpacts,
        c35_is_exporting: c35IsExporting ?? false,
        c36_in_value_chain: c36InValueChain ?? false,
        c37_top_bottlenecks: c37Bottlenecks,
        c38_support_needs: c38SupportNeeds,
        c39_info_needs: c39InfoNeeds,
        c40_willing_interview: c40WillingInterview,
        c41_willing_update_db: c41WillingUpdate,
        c42_requested_features: c42RequestedFeatures,
        c43_recommendations: c43Recommendations.trim(),
      },
    };

    try {
      const headers = authClient.getAuthHeaders();
      const res = await fetch("/api/v1/surveys/innovation-demand/submit", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            errorData?.title ||
            "Không thể hoàn tất nộp phiếu khảo sát. Vui lòng kiểm tra lại kết nối mạng."
        );
      }

      const responseData = await res.json();
      setEvalResult(responseData);
      // Xóa bản nháp sau khi nộp thành công
      try {
        localStorage.removeItem(STORAGE_DRAFT_KEY);
      } catch {
        // Ignore
      }
      toast.success("Nộp phiếu khảo sát thành công! Hệ thống đã tính toán điểm số tức thời.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setSubmitError(err.message || "Đã xảy ra lỗi khi gửi phiếu khảo sát.");
      toast.error(err.message || "Lỗi khi nộp phiếu khảo sát.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper toggle array checkbox
  const toggleCheckbox = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
    maxAllowed?: number
  ) => {
    if (list.includes(value)) {
      setList(list.filter((x) => x !== value));
    } else {
      if (maxAllowed && list.length >= maxAllowed) {
        toast.warning(`Chỉ được chọn tối đa ${maxAllowed} mục phù hợp nhất.`);
        return;
      }
      setList([...list, value]);
    }
  };

  // -------------------------------------------------------------------------
  // RENDER: LOADING STATE
  // -------------------------------------------------------------------------

  if (prefillLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="size-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Đang nạp hồ sơ pháp nhân và thiết lập bảng khảo sát 43 tiêu chí...
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER: EVALUATION RESULT VIEW (SCREEN 4)
  // -------------------------------------------------------------------------

  if (evalResult) {
    const results = evalResult.results || {};
    const tni = results.tni || {};
    const groupScores = results.groupScores || [];
    const radarChartData = results.radarChartData || evalResult.radarChart || [];

    const badgeColor =
      evalResult.innovationTier === "LEADING"
        ? "bg-amber-500 text-white"
        : evalResult.innovationTier === "DEVELOPING"
        ? "bg-blue-600 text-white"
        : "bg-teal-600 text-white";

    const tniColor =
      tni.classification === "VERY_HIGH" || tni.classification === "HIGH"
        ? "bg-emerald-600 text-white"
        : "bg-amber-500 text-white";

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
        {/* Top Success Banner */}
        <div className="surface-card p-6 sm:p-8 bg-gradient-to-r from-emerald-900/90 via-slate-900 to-blue-950 text-white rounded-3xl border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="size-4 text-emerald-400" />
                ĐÃ HOÀN THÀNH &amp; CHẤM ĐIỂM TỨC THỜI THEO CHUẨN BỘ KH&amp;CN
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Kết Quả Đánh Giá Năng Lực Đổi Mới Sáng Tạo &amp; Chỉ Số TNI
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl">
                Doanh nghiệp: <strong className="text-white">{c01LegalName}</strong> • MST:{" "}
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-emerald-300 font-bold">
                  {c02TaxCode}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEvalResult(null);
                  setCurrentStep(1);
                }}
                className="px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-bold transition flex items-center gap-2"
              >
                <RotateCcw className="size-3.5" /> Làm lại khảo sát
              </button>
              <Link
                href={`/enterprises/${c02TaxCode}?tab=innovation`}
                className="px-5 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-black transition shadow-lg flex items-center gap-2"
              >
                <span>Xem Hồ Sơ Doanh Nghiệp</span>
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Điểm ĐMST */}
          <div className="surface-card p-6 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-gradient-to-b from-blue-50/70 to-white dark:from-slate-900 dark:to-slate-900 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                Điểm ĐMST Tổng Hợp
              </span>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-5xl font-black text-blue-950 dark:text-blue-100">
                  {evalResult.innovationScore ?? results.totalScore ?? 0}
                </span>
                <span className="text-slate-500 font-bold text-sm">/ 100 điểm</span>
              </div>
              <div className="mt-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${badgeColor} shadow-xs`}>
                  {results.classificationLabel || evalResult.innovationTier}
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
              Xác định dựa trên 37 tiêu chuẩn định lượng thuộc 8 nhóm năng lực: Quản trị, R&amp;D, Sản phẩm, SHTT, CĐS, Thị trường, Nhân lực và Liên kết.
            </p>
          </div>

          {/* Card 2: Chỉ số TNI */}
          <div className="surface-card p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/70 to-white dark:from-slate-900 dark:to-slate-900 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="size-3.5" />
                Chỉ Số Nhu Cầu Công Nghệ (TNI)
              </span>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-5xl font-black text-emerald-950 dark:text-emerald-100">
                  {evalResult.tniScore ?? tni.score ?? 0}
                </span>
                <span className="text-slate-500 font-bold text-sm">/ 100</span>
              </div>
              <div className="mt-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${tniColor} shadow-xs`}>
                  {tni.classificationName || evalResult.tniClassification}
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div>Cấp thiết (K - 35%): <strong className="text-slate-900 dark:text-white font-bold">{tni.urgencyK ?? 4}/5</strong></div>
              <div>Tác động (L - 30%): <strong className="text-slate-900 dark:text-white font-bold">{tni.impactL ?? 4}/5</strong></div>
              <div>Đầu tư (N - 20%): <strong className="text-slate-900 dark:text-white font-bold">{tni.capacityN ?? 3}/5</strong></div>
              <div>Sẵn sàng (O - 15%): <strong className="text-slate-900 dark:text-white font-bold">{tni.readinessO ?? 4}/5</strong></div>
            </div>
          </div>

          {/* Card 3: Huy hiệu & CSDL Quốc Gia */}
          <div className="surface-card p-6 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/70 to-white dark:from-slate-900 dark:to-slate-900 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="size-3.5" />
                Huy Hiệu Xác Thực CSDL
              </span>
              <div className="flex items-center gap-3.5 mt-4">
                <div className="size-14 rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center text-3xl shadow-xs">
                  🏆
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-base">
                    {results.badgeName || "Huy Hiệu ĐMST Xác Thực"}
                  </div>
                  <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="size-3" /> Đã lưu vào CSDL Quốc Gia
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/chao-ban-cong-nghe"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Khám Phá Công Nghệ Ghép Nối Phù Hợp</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Radar Chart & Breakdown Table */}
        <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="size-5 text-blue-600" />
              Phân Tích 8 Nhóm Trụ Cột Năng Lực ĐMST (Radar Chart)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Biểu đồ trực quan hóa năng lực toàn diện của doanh nghiệp, làm căn cứ định vị trong ngành và phân bổ nguồn lực hỗ trợ.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Radar Chart SVG */}
            <div className="flex justify-center">
              <RadarChartSVG radarData={radarChartData} />
            </div>

            {/* Bảng điểm chi tiết 8 nhóm */}
            <div className="space-y-2.5">
              {groupScores.map((g: any, idx: number) => {
                const pct = Math.round(g.percentage || (g.score / g.maxScore) * 100);
                return (
                  <div
                    key={g.groupCode || idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {idx + 1}. {g.groupName} ({g.groupCode} - {g.maxScore}đ)
                      </div>
                      <div className="w-48 sm:w-60 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-blue-700 dark:text-blue-400">
                        {g.score} / {g.maxScore}đ
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold">{pct}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <Link
            href="/enterprises"
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" /> Quay lại Danh bạ Doanh nghiệp
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={`/enterprises/${c02TaxCode}`}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-2"
            >
              <span>Xem Hồ Sơ Pháp Nhân &amp; ĐMST</span>
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER: WIZARD 5 STEPS FORM
  // -------------------------------------------------------------------------

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Title Section */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <ClipboardCheck className="size-4 text-blue-600" />
            BỘ 43 TIÊU CHUẨN ĐỔI MỚI SÁNG TẠO &amp; NHU CẦU CÔNG NGHỆ (TNI)
          </div>
          {lastSavedTime && (
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60">
              <CheckCircle2 className="size-3" /> Đã tự động lưu nháp lúc {lastSavedTime}
            </div>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Phiếu Khảo Sát Năng Lực Đổi Mới Sáng Tạo Doanh Nghiệp
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          Công cụ chuẩn hóa quốc gia giúp đo lường trình độ ĐMST (37 tiêu chí, 8 nhóm năng lực), tính toán chỉ số nhu cầu công nghệ (TNI) và cấp chứng nhận định vị trên CSDL Quốc Gia NacenTwin.
        </p>
      </div>

      {/* Draft Recovery Alert (If found in LocalStorage) */}
      {draftPromptVisible && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-4 text-amber-600 shrink-0" />
            <span>
              Hệ thống phát hiện bản khảo sát đang làm dở trên trình duyệt của bạn. Bạn có muốn tiếp tục không?
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={restoreDraft}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition"
            >
              Khôi phục dữ liệu
            </button>
            <button
              type="button"
              onClick={clearDraft}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 transition font-medium"
            >
              Xóa làm mới
            </button>
          </div>
        </div>
      )}

      {/* Progress Wizard Stepper */}
      <div className="surface-card p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
          <span>Tiến trình hoàn thành: Bước {currentStep} / 5</span>
          <span className="text-blue-600 dark:text-blue-400 font-extrabold">{currentStep * 20}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-5">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${currentStep * 20}%` }}
          />
        </div>

        <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs">
          {[
            { step: 1, label: "Định danh Pháp nhân", range: "C01 - C11" },
            { step: 2, label: "Quản trị & Nguồn lực", range: "C12 - C16" },
            { step: 3, label: "Đổi mới SP & CĐS", range: "C17 - C27" },
            { step: 4, label: "Hợp tác & SHTT", range: "C28 - C36" },
            { step: 5, label: "Nhu cầu & TNI", range: "C37 - C43" },
          ].map((item) => {
            const isActive = item.step === currentStep;
            const isCompleted = item.step < currentStep;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setCurrentStep(item.step)}
                className={`p-2 rounded-xl transition flex flex-col items-center justify-center gap-0.5 ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/70 border border-blue-400 text-blue-700 dark:text-blue-300 font-bold"
                    : isCompleted
                    ? "text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900"
                    : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                }`}
              >
                <div
                  className={`size-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {isCompleted ? "✓" : item.step}
                </div>
                <span className="hidden sm:inline font-semibold leading-tight line-clamp-1">{item.label}</span>
                <span className="text-[9px] text-slate-400">{item.range}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <form onSubmit={handleSubmitSurvey} className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
        {/* ========================================================================= */}
        {/* BƯỚC 1: ĐỊNH DANH PHÁP NHÂN & QUY MÔ NỀN TẢNG (C01 - C11) */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="size-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-black">
                  1
                </span>
                Khối I: Định Danh Pháp Nhân &amp; Quy Mô Nền Tảng (Câu 1 – 11)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Xác thực danh tính pháp lý trong CSDL Quốc Gia. Nếu đã đăng nhập, các trường này được khóa và tự động kế thừa từ Hồ sơ Pháp nhân SSOT.
              </p>
            </div>

            {/* Banner gợi ý hoặc đã đồng bộ hồ sơ Doanh nghiệp đã đăng nhập */}
            {detectedProfile && (
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm ${
                  isPrefilledFromSession
                    ? "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200"
                    : "bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800 text-brand-900 dark:text-cyan-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Building2
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      isPrefilledFromSession
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-brand-600 dark:text-cyan-400"
                    }`}
                  />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                      {isPrefilledFromSession
                        ? "Tự động đồng bộ hồ sơ Doanh nghiệp đã đăng ký"
                        : "Gợi ý: Phát hiện tài khoản Doanh nghiệp đã đăng nhập"}
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                        {isPrefilledFromSession ? "✓ Đã đồng bộ" : "Đã đăng nhập"}
                      </span>
                    </h4>
                    <p
                      className={`text-xs mt-0.5 ${
                        isPrefilledFromSession
                          ? "text-teal-700 dark:text-teal-300"
                          : "text-brand-700 dark:text-slate-300"
                      }`}
                    >
                      {isPrefilledFromSession ? (
                        <>
                          Hệ thống đã nhận diện pháp nhân{" "}
                          <strong>{detectedProfile.legalName || detectedProfile.name}</strong> (MST:{" "}
                          <span className="font-mono font-bold">{detectedProfile.taxCode}</span>) và nạp sẵn thông tin vào phiếu khảo sát.
                        </>
                      ) : (
                        <>
                          Bạn đang đăng nhập với tư cách:{" "}
                          <strong>{detectedProfile.legalName || detectedProfile.name}</strong> (MST:{" "}
                          <span className="font-mono font-bold">{detectedProfile.taxCode}</span>). Bạn có muốn tự động điền thông tin doanh nghiệp vào phiếu khảo sát?
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => applyEnterpriseProfile(detectedProfile, true)}
                  className={`shrink-0 px-3.5 py-2 text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 ${
                    isPrefilledFromSession
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : "bg-brand-600 hover:bg-brand-700 text-white"
                  }`}
                >
                  {isPrefilledFromSession ? (
                    <>
                      <RefreshCw className="size-3.5" />
                      Điền lại từ hồ sơ DN
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5" />
                      Điền thông tin DN vào form
                    </>
                  )}
                </button>
              </div>
            )}

            {/* C01: Tên doanh nghiệp */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                01. Tên doanh nghiệp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={c01LegalName}
                onChange={(e) => setC01LegalName(e.target.value)}
                placeholder="Ví dụ: CÔNG TY CỔ PHẦN CÔNG NGHỆ NACENTECH"
                className="form-control w-full text-xs font-medium uppercase"
                required
              />
            </div>

            {/* C02: Mã số thuế với BR-02-015 SSOT Lock & Tra cứu MST */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  02. Mã số thuế (MST) <span className="text-rose-500">*</span>
                </label>
                {isTaxCodeLocked && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300 dark:border-emerald-700">
                    <ShieldCheck className="size-3.5 text-emerald-600" />
                    ✓ Đã xác thực từ Hồ sơ Pháp nhân SSOT
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={c02TaxCode}
                  onChange={(e) => setC02TaxCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isTaxCodeLocked) {
                      e.preventDefault();
                      handleLookupTaxCode();
                    }
                  }}
                  disabled={isTaxCodeLocked}
                  placeholder="10 hoặc 13 chữ số MST (Ví dụ: 0108992134)"
                  className={`form-control flex-1 text-xs font-mono ${
                    isTaxCodeLocked
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed font-bold"
                      : ""
                  }`}
                  required
                />
                {!isTaxCodeLocked && (
                  <button
                    type="button"
                    onClick={handleLookupTaxCode}
                    disabled={isLookingUpTax || !c02TaxCode.trim()}
                    className="px-3.5 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-cyan-300 dark:hover:bg-brand-900 border border-brand-200 dark:border-brand-800 rounded-xl transition shadow-sm disabled:opacity-50"
                    title="Tự động tra cứu Tên DN, Tỉnh thành và Địa chỉ theo MST"
                  >
                    {isLookingUpTax ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Search className="size-3.5" />
                    )}
                    Tra cứu MST
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isTaxCodeLocked
                  ? "Trường MST được khóa bảo vệ toàn vẹn dữ liệu do tài khoản đã xác thực quyền sở hữu pháp nhân."
                  : "Nhập MST và bấm Tra cứu để tự động nạp Tên DN, Tỉnh thành và Địa chỉ."}
              </p>
            </div>

            {/* C03: Địa chỉ trụ sở chính */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                03. Địa chỉ trụ sở chính <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={c03Address}
                onChange={(e) => setC03Address(e.target.value)}
                placeholder="Số nhà, đường phố, phường/xã, quận/huyện..."
                className="form-control w-full text-xs"
                required
              />
            </div>

            {/* C04: Thông tin liên hệ (Email, SĐT, Website) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  04a. Email liên hệ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={c04Email}
                  onChange={(e) => setC04Email(e.target.value)}
                  placeholder="contact@enterprise.vn"
                  className="form-control w-full text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  04b. Số điện thoại liên hệ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={c04Phone}
                  onChange={(e) => setC04Phone(e.target.value)}
                  placeholder="0912 345 678"
                  className="form-control w-full text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  04c. Website công ty
                </label>
                <input
                  type="url"
                  value={c04Website}
                  onChange={(e) => setC04Website(e.target.value)}
                  placeholder="https://enterprise.vn"
                  className="form-control w-full text-xs"
                />
              </div>
            </div>

            {/* C05 & C06: Tỉnh thành & Ngành nghề */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  05. Tỉnh / Thành phố trực thuộc <span className="text-rose-500">*</span>
                </label>
                <select
                  value={c05Province}
                  onChange={(e) => setC05Province(e.target.value)}
                  className="form-control w-full text-xs"
                >
                  <option value="">-- Chọn Tỉnh / Thành phố --</option>
                  {PROVINCES_34.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  06. Ngành hoạt động chính <span className="text-rose-500">*</span>
                </label>
                <select
                  value={c06MainSector}
                  onChange={(e) => setC06MainSector(e.target.value)}
                  className="form-control w-full text-xs"
                >
                  <option value="">-- Chọn Ngành hoạt động chính --</option>
                  {SECTOR_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* C07: Hình thức sở hữu */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                07. Hình thức sở hữu doanh nghiệp:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {OWNERSHIP_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      c07Ownership === opt
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 font-bold"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="radio"
                      name="c07_ownership"
                      checked={c07Ownership === opt}
                      onChange={() => setC07Ownership(opt)}
                      className="text-blue-600"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* C08 & C09: Quy mô lao động & Doanh thu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  08. Quy mô lao động:
                </label>
                <div className="space-y-1.5 text-xs">
                  {WORKFORCE_OPTIONS.map((w) => (
                    <label
                      key={w}
                      className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
                        c08Workforce === w
                          ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      <input
                        type="radio"
                        name="c08_workforce"
                        checked={c08Workforce === w}
                        onChange={() => setC08Workforce(w)}
                        className="text-blue-600"
                      />
                      <span>{w}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  09. Doanh thu năm gần nhất (Tác động TNI - N):
                </label>
                <div className="space-y-1.5 text-xs">
                  {REVENUE_OPTIONS.map((r) => (
                    <label
                      key={r}
                      className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
                        c09Revenue === r
                          ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      <input
                        type="radio"
                        name="c09_revenue"
                        checked={c09Revenue === r}
                        onChange={() => setC09Revenue(r)}
                        className="text-blue-600"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* C10 & C11: Địa bàn hoạt động & Tỷ lệ lao động tốt nghiệp ĐH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  10. Địa bàn hoạt động của doanh nghiệp:
                </label>
                <div className="space-y-1.5 text-xs">
                  {OPERATING_ZONES.map((z) => (
                    <label
                      key={z}
                      className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
                        c10OperatingZone === z
                          ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      <input
                        type="radio"
                        name="c10_zone"
                        checked={c10OperatingZone === z}
                        onChange={() => setC10OperatingZone(z)}
                        className="text-blue-600"
                      />
                      <span>{z}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  11. Tỷ lệ lao động tốt nghiệp CĐ, ĐH trở lên (Điểm NL1 - 2đ):
                </label>
                <div className="space-y-1.5 text-xs">
                  {HIGH_QUAL_OPTIONS.map((hq) => (
                    <label
                      key={hq}
                      className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
                        c11HighQualRatio === hq
                          ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      <input
                        type="radio"
                        name="c11_high_qual"
                        checked={c11HighQualRatio === hq}
                        onChange={() => setC11HighQualRatio(hq)}
                        className="text-blue-600"
                      />
                      <span>{hq}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BƯỚC 2: QUẢN TRỊ & NGUỒN LỰC ĐỔI MỚI SÁNG TẠO (C12 - C16) */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="size-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-black">
                  2
                </span>
                Khối II: Quản Trị &amp; Nguồn Lực Đổi Mới Sáng Tạo (Câu 12 – 16)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Đánh giá nhóm Quản trị ĐMST (12đ), Nguồn lực nhân sự R&amp;D (7đ) và Ngân sách công nghệ.
              </p>
            </div>

            {/* C12 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                12. Doanh nghiệp có bộ phận hoặc nhân sự chuyên trách về công nghệ, ĐMST, chuyển đổi số không? (Tác động QT2 3đ &amp; NL2 3đ)
              </label>
              <div className="flex gap-6 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    name="c12_rd_unit"
                    checked={c12HasRdUnit === true}
                    onChange={() => setC12HasRdUnit(true)}
                    className="text-blue-600"
                  />
                  <span>Có</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    name="c12_rd_unit"
                    checked={c12HasRdUnit === false}
                    onChange={() => setC12HasRdUnit(false)}
                    className="text-blue-600"
                  />
                  <span>Không</span>
                </label>
              </div>
            </div>

            {/* C13 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                13. Doanh nghiệp có tổ chức đào tạo chuyên môn, kỹ thuật, công nghệ cho người lao động trong 12 tháng qua không? (Điểm NL3 2đ &amp; TNI O)
              </label>
              <div className="flex gap-6 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    name="c13_training"
                    checked={c13HasTraining === true}
                    onChange={() => setC13HasTraining(true)}
                    className="text-blue-600"
                  />
                  <span>Có</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    name="c13_training"
                    checked={c13HasTraining === false}
                    onChange={() => setC13HasTraining(false)}
                    className="text-blue-600"
                  />
                  <span>Không</span>
                </label>
              </div>
            </div>

            {/* C14 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                14. Doanh nghiệp có đầu tư mua sắm, nâng cấp thiết bị, máy móc trong 3 năm qua? (Điểm CN2 4đ)
              </label>
              <div className="flex gap-6 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    name="c14_machinery"
                    checked={c14HasMachinery === true}
                    onChange={() => setC14HasMachinery(true)}
                    className="text-blue-600"
                  />
                  <span>Có</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    name="c14_machinery"
                    checked={c14HasMachinery === false}
                    onChange={() => setC14HasMachinery(false)}
                    className="text-blue-600"
                  />
                  <span>Không</span>
                </label>
              </div>
            </div>

            {/* C15 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                15. Doanh nghiệp có kế hoạch hoặc ngân sách riêng cho hoạt động ĐMST / R&amp;D? (Điểm QT1 4đ &amp; TNI N)
              </label>
              <div className="flex gap-6 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    name="c15_budget"
                    checked={c15HasRdBudget === true}
                    onChange={() => setC15HasRdBudget(true)}
                    className="text-blue-600"
                  />
                  <span>Có</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="radio"
                    name="c15_budget"
                    checked={c15HasRdBudget === false}
                    onChange={() => setC15HasRdBudget(false)}
                    className="text-blue-600"
                  />
                  <span>Không</span>
                </label>
              </div>
            </div>

            {/* C16 */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                16. Các nền tảng số, phần mềm quản trị doanh nghiệp đang sử dụng (Chọn các mục phù hợp):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {GOVERNANCE_PLATFORMS.map((plat) => (
                  <label
                    key={plat}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      c16Platforms.includes(plat)
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={c16Platforms.includes(plat)}
                      onChange={() => toggleCheckbox(c16Platforms, setC16Platforms, plat)}
                      className="rounded text-blue-600"
                    />
                    <span>{plat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BƯỚC 3: ĐỔI MỚI SẢN PHẨM, QUY TRÌNH & CHUYỂN ĐỔI SỐ (C17 - C27) */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="size-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-black">
                  3
                </span>
                Khối III: Đổi Mới Sản Phẩm, Quy Trình &amp; Chuyển Đổi Số (Câu 17 – 27)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Đánh giá nhóm Sản phẩm/Quy trình (20đ) và Chuyển đổi số (10đ).
              </p>
            </div>

            {/* C17 - C21: Radio Yes/No cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200 pr-2">
                  17. Phát triển sản phẩm/dịch vụ mới trong 3 năm qua? (SP1 - 5đ)
                </span>
                <div className="flex gap-3 shrink-0">
                  <label className="flex items-center gap-1 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="c17"
                      checked={c17NewProducts === true}
                      onChange={() => setC17NewProducts(true)}
                    /> Có
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="c17"
                      checked={c17NewProducts === false}
                      onChange={() => setC17NewProducts(false)}
                    /> Không
                  </label>
                </div>
              </div>

              <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200 pr-2">
                  18. Cải tiến đáng kể sản phẩm/dịch vụ hiện có? (SP2 - 4đ)
                </span>
                <div className="flex gap-3 shrink-0">
                  <label className="flex items-center gap-1 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="c18"
                      checked={c18ImprovedProducts === true}
                      onChange={() => setC18ImprovedProducts(true)}
                    /> Có
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="c18"
                      checked={c18ImprovedProducts === false}
                      onChange={() => setC18ImprovedProducts(false)}
                    /> Không
                  </label>
                </div>
              </div>

              <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200 pr-2">
                  19. Đổi mới quy trình sản xuất hoặc cung ứng dịch vụ? (SP3 - 5đ)
                </span>
                <div className="flex gap-3 shrink-0">
                  <label className="flex items-center gap-1 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="c19"
                      checked={c19ProcessInnovation === true}
                      onChange={() => setC19ProcessInnovation(true)}
                    /> Có
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="c19"
                      checked={c19ProcessInnovation === false}
                      onChange={() => setC19ProcessInnovation(false)}
                    /> Không
                  </label>
                </div>
              </div>

              <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200 pr-2">
                  20. Đổi mới phương thức quản trị, cơ cấu tổ chức? (QT4 - 3đ)
                </span>
                <div className="flex gap-3 shrink-0">
                  <label className="flex items-center gap-1 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="c20"
                      checked={c20OrgInnovation === true}
                      onChange={() => setC20OrgInnovation(true)}
                    /> Có
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="c20"
                      checked={c20OrgInnovation === false}
                      onChange={() => setC20OrgInnovation(false)}
                    /> Không
                  </label>
                </div>
              </div>

              <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between sm:col-span-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 pr-2">
                  21. Đổi mới phương thức tiếp thị (marketing) hoặc phát triển thị trường mới? (TT2 - 2đ)
                </span>
                <div className="flex gap-3 shrink-0">
                  <label className="flex items-center gap-1 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="c21"
                      checked={c21MarketingInnovation === true}
                      onChange={() => setC21MarketingInnovation(true)}
                    /> Có
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="c21"
                      checked={c21MarketingInnovation === false}
                      onChange={() => setC21MarketingInnovation(false)}
                    /> Không
                  </label>
                </div>
              </div>
            </div>

            {/* C22: Hoạt động chuyển giao công nghệ */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                22. Hoạt động nhận chuyển giao hoặc mua sắm công nghệ từ bên ngoài trong 3 năm qua (Tác động CN1 5đ, CN3 3đ, CN4 4đ):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {TECH_ACQUISITION_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      c22TechAcquisition.includes(item)
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={c22TechAcquisition.includes(item)}
                      onChange={() => toggleCheckbox(c22TechAcquisition, setC22TechAcquisition, item)}
                      className="rounded text-blue-600"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* C23: Hiệu quả ĐMST */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                23. Hiệu quả ĐMST mang lại rõ rệt nhất cho doanh nghiệp là gì? (Tác động SP5 3đ &amp; TNI L):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {IMPACT_OUTCOMES_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      c23ImpactOutcomes.includes(item)
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={c23ImpactOutcomes.includes(item)}
                      onChange={() => toggleCheckbox(c23ImpactOutcomes, setC23ImpactOutcomes, item)}
                      className="rounded text-blue-600"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* C24 & C25: Chuyển đổi số */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  24. Chiến lược chuyển đổi số của doanh nghiệp (S1 - 2đ):
                </label>
                <select
                  value={c24DigitalStrategy}
                  onChange={(e) => setC24DigitalStrategy(e.target.value)}
                  className="form-control w-full text-xs"
                >
                  <option value="">-- Chọn chiến lược chuyển đổi số --</option>
                  {DIGITAL_STRATEGY_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  25. Tự đánh giá mức độ chuyển đổi số (S2 - 2đ):
                </label>
                <select
                  value={c25DigitalMaturity}
                  onChange={(e) => setC25DigitalMaturity(e.target.value)}
                  className="form-control w-full text-xs"
                >
                  <option value="">-- Chọn mức độ chuyển đổi số --</option>
                  {DIGITAL_MATURITY_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* C26: Các khâu số hóa */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                26. Các hoạt động / khâu nào trong doanh nghiệp đang được số hóa? (S3 - 2đ):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {DIGITIZED_ACTIVITIES_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      c26DigitizedActivities.includes(item)
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={c26DigitizedActivities.includes(item)}
                      onChange={() => toggleCheckbox(c26DigitizedActivities, setC26DigitizedActivities, item)}
                      className="rounded text-blue-600"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* C27: 6 Công nghệ số tiên tiến */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                27. Doanh nghiệp đang ứng dụng các công nghệ số tiên tiến nào? (Tác động S4 - 3đ):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {ADVANCED_TECH_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      c27AdvancedTech.includes(item)
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={c27AdvancedTech.includes(item)}
                      onChange={() => toggleCheckbox(c27AdvancedTech, setC27AdvancedTech, item)}
                      className="rounded text-blue-600"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BƯỚC 4: HỢP TÁC HỆ SINH THÁI, TÀI SẢN SHTT & THỊ TRƯỜNG (C28 - C36) */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="size-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-black">
                  4
                </span>
                Khối IV: Hợp Tác Hệ Sinh Thái, Sở Hữu Trí Tuệ &amp; Thị Trường (Câu 28 – 36)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Đánh giá nhóm Liên kết hệ sinh thái (8đ), Tài sản SHTT (10đ) và Năng lực thị trường (15đ).
              </p>
            </div>

            {/* C28: Ma trận hợp tác 7 đối tượng */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                28. Mức độ hợp tác trong 3 năm qua với 7 đối tượng trong hệ sinh thái ĐMST (Tác động LK1 - LK6, Tổng 8đ):
              </label>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Đối tượng trong hệ sinh thái</th>
                      <th className="p-3 text-center">Thường xuyên</th>
                      <th className="p-3 text-center">Thỉnh thoảng</th>
                      <th className="p-3 text-center">Không có</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {COLLAB_PARTNERS.map((partner) => {
                      const currentVal = c28Collaborations[partner.key];
                      return (
                        <tr key={partner.key} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{partner.label}</td>
                          <td className="p-3 text-center">
                            <input
                              type="radio"
                              name={`collab_${partner.key}`}
                              checked={currentVal === "Thường xuyên"}
                              onChange={() =>
                                setC28Collaborations((prev) => ({ ...prev, [partner.key]: "Thường xuyên" }))
                              }
                              className="text-blue-600"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="radio"
                              name={`collab_${partner.key}`}
                              checked={currentVal === "Thỉnh thoảng"}
                              onChange={() =>
                                setC28Collaborations((prev) => ({ ...prev, [partner.key]: "Thỉnh thoảng" }))
                              }
                              className="text-blue-600"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <input
                              type="radio"
                              name={`collab_${partner.key}`}
                              checked={currentVal === "Không có"}
                              onChange={() =>
                                setC28Collaborations((prev) => ({ ...prev, [partner.key]: "Không có" }))
                              }
                              className="text-blue-600"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* C29: Hỗ trợ nhà nước */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                29. Doanh nghiệp đã từng nhận được sự hỗ trợ nào từ phía Nhà nước về KH&amp;CN, ĐMST? (LK5 - 1đ):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {PUBLIC_SUPPORT_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      c29PublicSupport.includes(item)
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={c29PublicSupport.includes(item)}
                      onChange={() => toggleCheckbox(c29PublicSupport, setC29PublicSupport, item)}
                      className="rounded text-blue-600"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* C30: Tiếp cận vốn */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                30. Doanh nghiệp đã tiếp cận hoặc gọi vốn từ quỹ đầu tư, tổ chức tài chính ĐMST chưa? (LK4 - 1đ):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {FUNDING_ACCESS_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      c30FundingAccess === item
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="radio"
                      name="c30_funding"
                      checked={c30FundingAccess === item}
                      onChange={() => setC30FundingAccess(item)}
                      className="text-blue-600"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* C31: Tài sản SHTT (IP1 5đ, IP2 3đ) */}
            <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/30 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-blue-950 dark:text-blue-200">
                  31. Các loại tài sản trí tuệ (SHTT) doanh nghiệp hiện đang nắm giữ (Tác động IP1 5đ &amp; IP2 3đ):
                </label>
                <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                  Tiêu chí điểm cao
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {IP_ASSET_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      c31IpAssets.includes(item)
                        ? "bg-white dark:bg-slate-900 border-blue-500 font-bold text-blue-900 dark:text-blue-200 shadow-xs"
                        : "bg-white/60 dark:bg-slate-900/40 border-blue-200/60 dark:border-blue-900/40 hover:bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={c31IpAssets.includes(item)}
                      onChange={() => toggleCheckbox(c31IpAssets, setC31IpAssets, item)}
                      className="rounded text-blue-600"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* C32: Kết quả hoạt động ĐMST */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                32. Kết quả hoạt động ĐMST đạt được trong 3 năm qua (SP4 - 3đ &amp; TT6 - 1đ):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {INNOVATION_RESULTS_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      c32InnovationResults.includes(item)
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={c32InnovationResults.includes(item)}
                      onChange={() => toggleCheckbox(c32InnovationResults, setC32InnovationResults, item)}
                      className="rounded text-blue-600"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* C33, C35, C36: Thị trường */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  33. Tỷ lệ DT từ SP mới (TT1 - 5đ):
                </label>
                <select
                  value={c33NewProductRevenue}
                  onChange={(e) => setC33NewProductRevenue(e.target.value)}
                  className="form-control w-full text-xs"
                >
                  <option value="">-- Chọn tỷ lệ DT --</option>
                  {NEW_PRODUCT_REVENUE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  35. Có hoạt động xuất khẩu? (TT4 - 2đ)
                </span>
                <div className="flex gap-4 text-xs mt-2">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="c35"
                      checked={c35IsExporting === true}
                      onChange={() => setC35IsExporting(true)}
                    /> Có
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="c35"
                      checked={c35IsExporting === false}
                      onChange={() => setC35IsExporting(false)}
                    /> Không
                  </label>
                </div>
              </div>

              <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  36. Tham gia chuỗi giá trị? (TT5 - 2đ)
                </span>
                <div className="flex gap-4 text-xs mt-2">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="c36"
                      checked={c36InValueChain === true}
                      onChange={() => setC36InValueChain(true)}
                    /> Có
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="c36"
                      checked={c36InValueChain === false}
                      onChange={() => setC36InValueChain(false)}
                    /> Không
                  </label>
                </div>
              </div>
            </div>

            {/* C34: Tác động khác */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                34. Các tác động tích cực khác từ ĐMST được ghi nhận (Bổ trợ TT3 3đ):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {RECORDED_IMPACTS_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      c34RecordedImpacts.includes(item)
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={c34RecordedImpacts.includes(item)}
                      onChange={() => toggleCheckbox(c34RecordedImpacts, setC34RecordedImpacts, item)}
                      className="rounded text-blue-600"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BƯỚC 5: NHU CẦU CÔNG NGHỆ, CHỈ SỐ TNI & ĐỀ XUẤT KIẾN NGHỊ (C37 - C43) */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="size-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-black">
                  5
                </span>
                Khối V: Nhu Cầu Công Nghệ, Chỉ Số TNI &amp; Kiến Nghị (Câu 37 – 43)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Thu thập nỗi đau công nghệ (Bottlenecks) để tự động tính toán chỉ số TNI (100đ) và ghép nối nguồn cung.
              </p>
            </div>

            {/* C37: Top rào cản (Max 3) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  37. Khó khăn, rào cản lớn nhất của doanh nghiệp trong hoạt động ĐMST (Chọn tối đa 3):
                </label>
                <span className="text-[11px] font-bold text-blue-600">
                  Đã chọn {c37Bottlenecks.length} / 3 mục
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {BOTTLENECKS_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      c37Bottlenecks.includes(item)
                        ? "bg-amber-50 dark:bg-amber-950/60 border-amber-500 font-bold text-amber-950 dark:text-amber-200"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={c37Bottlenecks.includes(item)}
                      onChange={() => toggleCheckbox(c37Bottlenecks, setC37Bottlenecks, item, 3)}
                      className="rounded text-amber-600"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* C38: Nhu cầu hỗ trợ */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                38. Doanh nghiệp có nhu cầu được hỗ trợ những nội dung nào? (Tác động TNI - L):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {SUPPORT_NEEDS_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      c38SupportNeeds.includes(item)
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={c38SupportNeeds.includes(item)}
                      onChange={() => toggleCheckbox(c38SupportNeeds, setC38SupportNeeds, item)}
                      className="rounded text-blue-600"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* C39: Đánh giá 8 loại thông tin (1-5 Sao) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  39. Đánh giá mức độ cần thiết của 8 loại thông tin công nghệ đối với doanh nghiệp (Thang 1 - 5 sao):
                </label>
                <span className="text-[11px] text-slate-500">1 sao: Rất ít cần • 5 sao: Rất cấp thiết</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {INFO_NEEDS_ITEMS.map((item) => {
                  const rating = c39InfoNeeds[item.key] || 0;
                  return (
                    <div
                      key={item.key}
                      className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-2"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{item.label}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setC39InfoNeeds((prev) => ({ ...prev, [item.key]: star }))
                            }
                            className="p-1 hover:scale-110 transition cursor-pointer"
                          >
                            <Star
                              className={`size-4 ${
                                star <= rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-300 dark:text-slate-700"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* C40 & C41: Sẵn sàng hợp tác & Cập nhật CSDL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  40. Sẵn sàng tham gia phỏng vấn sâu với chuyên gia?
                </label>
                <div className="space-y-1.5 text-xs">
                  {WILLING_INTERVIEW_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
                        c40WillingInterview === opt
                          ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      <input
                        type="radio"
                        name="c40_interview"
                        checked={c40WillingInterview === opt}
                        onChange={() => setC40WillingInterview(opt)}
                        className="text-blue-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  41. Sẵn sàng cập nhật định kỳ hồ sơ trên sàn NacenTwin?
                </label>
                <div className="space-y-1.5 text-xs">
                  {WILLING_UPDATE_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition ${
                        c41WillingUpdate === opt
                          ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      <input
                        type="radio"
                        name="c41_update"
                        checked={c41WillingUpdate === opt}
                        onChange={() => setC41WillingUpdate(opt)}
                        className="text-blue-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* C42: Tính năng mong muốn trên Nền tảng */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                42. Những tính năng, tiện ích doanh nghiệp mong muốn nhất trên Nền tảng NacenTwin:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {REQUESTED_FEATURES_OPTIONS.map((item) => (
                  <label
                    key={item}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      c42RequestedFeatures.includes(item)
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 font-bold text-blue-900 dark:text-blue-200"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={c42RequestedFeatures.includes(item)}
                      onChange={() => toggleCheckbox(c42RequestedFeatures, setC42RequestedFeatures, item)}
                      className="rounded text-blue-600"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* C43: Ý kiến đề xuất, kiến nghị */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                43. Ý kiến đề xuất, kiến nghị khác của doanh nghiệp (Tối đa 1000 ký tự):
              </label>
              <textarea
                rows={4}
                maxLength={1000}
                value={c43Recommendations}
                onChange={(e) => setC43Recommendations(e.target.value)}
                placeholder="Nhập kiến nghị cụ thể về chính sách hỗ trợ tài chính, thủ tục thử nghiệm công nghệ sandbox, kết nối cung cầu..."
                className="form-control w-full text-xs p-3"
              />
              <div className="text-right text-[11px] text-slate-400 mt-1">
                {c43Recommendations.length} / 1000 ký tự
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-rose-600" />
                <span>{submitError}</span>
              </div>
            )}
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2"
            >
              <ArrowLeft className="size-3.5" /> Quay lại
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {currentStep < 5 ? (
              <button
                key="btn-next-step"
                type="button"
                onClick={(e) => handleNextStep(e)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
              >
                <span>Tiếp tục Bước {currentStep + 1}</span>
                <ArrowRight className="size-3.5" />
              </button>
            ) : (
              <button
                key="btn-submit-survey"
                type="submit"
                disabled={submitting}
                className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white text-xs font-black transition shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Đang tính toán điểm số...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Hoàn Thành &amp; Nộp Phiếu Khảo Sát</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
