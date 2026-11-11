import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SuperAdminTt17DashboardPage from "./page";
import type { Tt17Assessment, Tt17DashboardData } from "@/services/api/assessment-tt17";

const { getTt17DashboardMock, getGovAssessmentQueueMock } = vi.hoisted(() => ({
  getTt17DashboardMock: vi.fn(),
  getGovAssessmentQueueMock: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/services/api/assessment-tt17", () => ({
  getTt17Dashboard: getTt17DashboardMock,
  getGovAssessmentQueue: getGovAssessmentQueueMock,
}));

vi.mock("@/components/assessments/tt17-survey-detail-view", () => ({
  Tt17SurveyDetailView: () => <div>Survey Detail Mock</div>,
  hasRawSurveyForm: () => false,
}));

const sampleDashboard: Tt17DashboardData = {
  totalAssessments: 186,
  approvedCount: 150,
  submittedCount: 36,
  draftCount: 0,
  changesRequestedCount: 0,
  avgTotalScore: 62.4,
  maxTotalScore: 89.5,
  minTotalScore: 28.0,
  avgSyncCoefficient: 0.78,
  avgGroupScores: {
    scoreT: 18.5,
    maxT: 30,
    scoreE: 13.2,
    maxE: 20,
    scoreO: 11.4,
    maxO: 19,
    scoreR: 10.1,
    maxR: 17,
    scoreI: 9.2,
    maxI: 14,
  },
  byProvince: [
    {
      scopeId: "TG",
      provinceName: "Tiền Giang",
      count: 166,
      approvedCount: 136,
      submittedCount: 30,
      avgTotalScore: 61.8,
      maxTotalScore: 89.5,
      minTotalScore: 28.0,
      avgScoreT: 18.2,
      avgScoreE: 13.0,
      avgScoreO: 11.2,
      avgScoreR: 10.2,
      avgScoreI: 9.2,
      avgSyncCoefficient: 0.77,
      tienTienCount: 22,
      trungBinhTienTienCount: 64,
      trungBinhCount: 65,
      lacHauCount: 15,
    },
  ],
  byClassification: [
    { classification: "TIEN_TIEN", label: "Trình độ Tiên tiến", count: 25, percentage: 13.4, avgScore: 80.1 },
    { classification: "LAC_HAU", label: "Trình độ Lạc hậu", count: 16, percentage: 8.6, avgScore: 30.2 },
  ],
  byIndustry: [
    {
      industryCode: "C.10",
      count: 90,
      percentage: 48.4,
      avgTotalScore: 63.1,
      avgScoreT: 18.5,
      avgScoreE: 13.4,
      avgScoreO: 11.6,
      avgScoreR: 10.3,
      avgScoreI: 9.3,
    },
  ],
  criteriaStats: [
    {
      code: "TC01",
      name: "Mức độ hiện đại thiết bị",
      group: "T",
      maxScore: 5,
      avgScore: 3.1,
      achievementRate: 62,
      bottleneckCount: 20,
      bottleneckRate: 10.8,
    },
  ],
  topEnterprises: [],
  bottomEnterprises: [],
};

const sampleQueue: Tt17Assessment[] = [
  {
    id: "tt17-1",
    enterpriseId: "ent-1",
    enterpriseName: "Công ty TNHH Đại Hưng",
    taxCode: "1200345678",
    assessmentYear: 2026,
    status: "APPROVED",
    scopeType: "PROVINCE",
    scopeId: "TG",
    industryCode: "C.10",
    surveyData: {} as Tt17Assessment["surveyData"],
    scoreResult: {
      scoreT: 20,
      scoreE: 14,
      scoreO: 12,
      scoreR: 10,
      scoreI: 8,
      totalScore: 64,
      syncCoefficient: 0.81,
      classification: "TRUNG_BINH_TIEN_TIEN",
      classificationLabel: "Trung bình Tiên tiến",
      criteria: [],
      bottlenecks: [],
    },
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-02T00:00:00Z",
  },
];

describe("SuperAdminTt17DashboardPage — CR-2026-029 KPI Skeleton & Zero Fake Zeroes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders shimmer skeletons with aria-busy and zero fake zeroes while loading, then renders real TT17 dashboard metrics", async () => {
    let resolveDashboard!: (data: Tt17DashboardData | null) => void;
    let resolveQueue!: (rows: Tt17Assessment[]) => void;

    getTt17DashboardMock.mockReturnValue(
      new Promise((resolve) => {
        resolveDashboard = resolve;
      })
    );
    getGovAssessmentQueueMock.mockReturnValue(
      new Promise((resolve) => {
        resolveQueue = resolve;
      })
    );

    render(<SuperAdminTt17DashboardPage />);

    const kpiSkeleton = screen.getByTestId("tt17-kpi-skeleton");
    expect(kpiSkeleton).toHaveAttribute("aria-busy", "true");
    expect(kpiSkeleton.querySelectorAll(".animate-shimmer").length).toBeGreaterThanOrEqual(8);
    expect(kpiSkeleton).not.toHaveTextContent("0.0%");
    expect(kpiSkeleton).not.toHaveTextContent("/ 100");
    expect(kpiSkeleton.textContent).not.toContain("0");

    expect(screen.getAllByTestId("tt17-table-skeleton-row")).toHaveLength(5);
    expect(screen.queryByText("Đang tải dữ liệu đánh giá doanh nghiệp...")).not.toBeInTheDocument();
    expect(screen.queryByText("(0 DN)")).not.toBeInTheDocument();
    expect(screen.queryByText(/186 DN/)).not.toBeInTheDocument();
    expect(screen.queryByText(/166 DN/)).not.toBeInTheDocument();
    expect(screen.queryByText(/8 DN/)).not.toBeInTheDocument();

    resolveDashboard(sampleDashboard);
    resolveQueue(sampleQueue);

    const kpiGrid = await screen.findByTestId("tt17-kpi-grid");
    expect(screen.queryByTestId("tt17-kpi-skeleton")).not.toBeInTheDocument();
    expect(kpiGrid).toHaveTextContent("186");
    expect(kpiGrid).toHaveTextContent("62.4");
    expect(kpiGrid).toHaveTextContent("0.78");
    expect(kpiGrid).toHaveTextContent("91.4%");
    expect(await screen.findByText("Công ty TNHH Đại Hưng")).toBeInTheDocument();
  });

  it("renders real zero values only after API settles with empty TT17 dataset", async () => {
    const emptyDashboard: Tt17DashboardData = {
      ...sampleDashboard,
      totalAssessments: 0,
      approvedCount: 0,
      submittedCount: 0,
      avgTotalScore: 0,
      maxTotalScore: 0,
      minTotalScore: 0,
      avgSyncCoefficient: 0,
      byProvince: [],
      byClassification: [],
      byIndustry: [],
      criteriaStats: [],
    };

    getTt17DashboardMock.mockResolvedValue(emptyDashboard);
    getGovAssessmentQueueMock.mockResolvedValue([]);

    render(<SuperAdminTt17DashboardPage />);

    const kpiGrid = await screen.findByTestId("tt17-kpi-grid");
    expect(kpiGrid).toHaveTextContent("0.0%");
    expect(kpiGrid).toHaveTextContent("0 / 0 DN đạt ≥ 35 điểm");
    expect(screen.getByText("(0 DN)")).toBeInTheDocument();
  });
});
