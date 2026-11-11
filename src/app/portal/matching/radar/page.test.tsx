import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import MatchingRadarPage from "./page";
import { brokerageApi } from "@/services/api/brokerage";
import { authClient } from "@/lib/auth-client";

const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();
vi.mock("@/components/common/toast", () => ({
  useToast: () => ({
    error: mockToastError,
    warning: vi.fn(),
    success: mockToastSuccess,
    info: vi.fn(),
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/enterprise/SectorBannerBackground", () => ({
  SectorBannerBackground: () => <div data-testid="sector-banner-bg" />,
}));

describe("MatchingRadarPage - AI Matching, Demands Guard & Toast Integration", () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();

    // Default fetch mock for buyer demands
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (typeof url === "string" && url.includes("/api/v1/buyer/demands")) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: "dem-1", title: "Nhu cầu kiểm thử" }],
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    }) as any;
  });

  it("handles request error using toast.error without invoking window.alert", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    vi.spyOn(brokerageApi, "getRadarCandidates").mockResolvedValue([]);
    vi.spyOn(brokerageApi, "getConnectionRequests").mockResolvedValue([
      {
        id: "req-101",
        requestCode: "CONN-REQ-101",
        senderUserId: "user-1",
        demandId: "dem-1",
        offerId: "off-1",
        senderOrgName: "Doanh Nghiệp A",
        senderRole: "BUYER",
        receiverUserId: "user-2",
        receiverOrgName: "Viện Hàn Lâm",
        proposedBudgetRange: "500M - 1B",
        status: "PENDING",
        responseNote: null,
        respondedAt: null,
        message: "Mong muốn thảo luận chuyển giao",
        createdAt: "2026-10-15T08:00:00Z",
      },
    ]);
    vi.spyOn(brokerageApi, "respondConnectionRequest").mockRejectedValue(
      new Error("Lỗi mạng máy chủ trung gian")
    );

    render(<MatchingRadarPage />);

    // Switch to requests tab
    const requestsTabBtn = screen.getByRole("button", { name: /Yêu Cầu Kết Nối/i });
    fireEvent.click(requestsTabBtn);

    // Wait for the request to show
    expect(await screen.findByText("CONN-REQ-101")).toBeInTheDocument();

    // Click Chấp nhận
    const acceptBtn = screen.getByRole("button", { name: /Chấp nhận/i });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Lỗi mạng máy chủ trung gian",
        "Thao Tác Thất Bại"
      );
    });

    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("renders demand selection and Explainable AI (XAI) breakdown correctly when user has >= 1 demand", async () => {
    vi.spyOn(brokerageApi, "getRadarCandidates").mockResolvedValue([
      {
        id: "cand-1",
        demandId: "dem-1",
        demandCode: "DMD-001",
        demandTitle: "Hệ thống sấy nông sản lạnh",
        buyerOrganizationId: "org-buyer",
        buyerOrganizationName: "Doanh Nghiệp Mua",
        offerId: "off-1",
        offerCode: "OFF-001",
        offerTitle: "Công nghệ sấy thăng hoa chân không",
        sellerOrganizationId: "org-seller",
        sellerOrganizationName: "Viện Cơ điện Nông nghiệp",
        sectorCode: "AGRI_TECH",
        matchScore: 92,
        tniScore: 85,
        trlLevel: 7,
        ipStatus: "Đã cấp bằng sáng chế",
        isActive: true,
        createdAt: "2026-10-20T00:00:00Z",
      },
    ]);

    render(<MatchingRadarPage />);

    // Check header and demand selector label
    expect(screen.getByText(/Radar Ghép Nối Cung–Cầu/i)).toBeInTheDocument();
    expect(await screen.findByText("Bài toán nguồn:")).toBeInTheDocument();

    // Check candidate card
    expect(await screen.findByText("Công nghệ sấy thăng hoa chân không")).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();

    // Check Explainable AI (XAI) section
    expect(screen.getByText(/Giải trình độ tương thích AI/i)).toBeInTheDocument();
    expect(screen.getByText("100% Khớp")).toBeInTheDocument();
    expect(screen.getAllByText("TRL 7").length).toBeGreaterThan(0);
    expect(screen.getByText("85/100")).toBeInTheDocument();
  });

  it("renders Empty State 'Radar Ghép Nối AI Chưa Kích Hoạt' and does NOT call getRadarCandidates when user has 0 demands (REQ-DEL-08-01, REQ-DEL-08-02, BR-DEL-08-01)", async () => {
    vi.spyOn(authClient, "getUser").mockReturnValue({
      id: "u-buyer-0",
      fullName: "Bên Mua Chưa Có Nhu Cầu",
      role: "BUYER",
      email: "buyer0@corp.vn",
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (typeof url === "string" && url.includes("/api/v1/buyer/demands")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }) as any;

    const getCandidatesSpy = vi.spyOn(brokerageApi, "getRadarCandidates");

    render(<MatchingRadarPage />);

    // Assert Interactive Guiding Empty State appears
    expect(await screen.findByText("Radar Ghép Nối AI Chưa Kích Hoạt")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Thuật toán Radar AI cần ít nhất 01 Nhu cầu công nghệ làm tâm đối sánh để phân tích điểm TRL, TNI và đề xuất các giải pháp công nghệ phù hợp nhất/i
      )
    ).toBeInTheDocument();

    // Primary Action CTA
    const primaryCta = screen.getByRole("link", { name: /\+ Gửi Nhu Cầu Công Nghệ Đầu Tiên/i });
    expect(primaryCta).toBeInTheDocument();
    expect(primaryCta).toHaveAttribute("href", "/khao-sat-nhu-cau");

    // Secondary Action CTA
    const secondaryCta = screen.getByRole("link", { name: /Khám phá Sàn Công nghệ/i });
    expect(secondaryCta).toBeInTheDocument();
    expect(secondaryCta).toHaveAttribute("href", "/chao-ban-cong-nghe");

    // Zero-Mock verification: Must NOT call getRadarCandidates()
    expect(getCandidatesSpy).not.toHaveBeenCalled();
  });

  it("renders radar candidates normally for Admin supervisory role even if demands count is 0", async () => {
    vi.spyOn(authClient, "getUser").mockReturnValue({
      id: "u-admin",
      fullName: "Quản Trị Viên Giám Sát",
      role: "ADMIN",
      email: "admin@gov.vn",
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (typeof url === "string" && url.includes("/api/v1/buyer/demands")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }) as any;

    const getCandidatesSpy = vi.spyOn(brokerageApi, "getRadarCandidates").mockResolvedValue([
      {
        id: "cand-admin-1",
        demandId: "dem-all-1",
        demandCode: "DMD-ALL-001",
        demandTitle: "Hệ thống giám sát vi khí hậu nông nghiệp",
        buyerOrganizationId: "org-buyer-admin",
        buyerOrganizationName: "DN Nông Nghiệp Xanh",
        offerId: "off-admin-1",
        offerCode: "OFF-002",
        offerTitle: "Cảm biến IoT LoRaWAN công nghiệp",
        sellerOrganizationId: "org-seller-admin",
        sellerOrganizationName: "Viện Điện Tử Tin Học",
        sectorCode: "LV01",
        matchScore: 88,
        tniScore: 82,
        trlLevel: 8,
        ipStatus: "PATENT_GRANTED",
        isActive: true,
        createdAt: "2026-10-25T00:00:00Z",
      },
    ]);

    render(<MatchingRadarPage />);

    expect(await screen.findByText("Bài toán nguồn:")).toBeInTheDocument();
    expect(await screen.findByText("Cảm biến IoT LoRaWAN công nghiệp")).toBeInTheDocument();
    expect(getCandidatesSpy).toHaveBeenCalled();
    expect(screen.queryByText("Radar Ghép Nối AI Chưa Kích Hoạt")).not.toBeInTheDocument();
  });

  it("renders zero-mock Explainable AI (XAI) 4-axis scores and FTS fallback degradation badge", async () => {
    vi.spyOn(brokerageApi, "getRadarCandidates").mockResolvedValue([
      {
        id: "cand-xai-1",
        demandId: "dem-xai-1",
        demandCode: "DMD-XAI-001",
        demandTitle: "Thu hồi nhiệt khí thải lò hơi công nghiệp",
        buyerOrganizationId: "org-buyer-xai",
        buyerOrganizationName: "Tập Đoàn Dệt May",
        offerId: "off-xai-1",
        offerCode: "OFF-XAI-001",
        offerTitle: "Hệ thống ống nhiệt trọng lực siêu dẫn trao đổi nhiệt",
        sellerOrganizationId: "org-seller-xai",
        sellerOrganizationName: "Viện Khoa Học Năng Lượng",
        sectorCode: "LV11",
        matchScore: 89,
        tniScore: 88,
        trlLevel: 6,
        ipStatus: "PATENT_GRANTED",
        isActive: true,
        createdAt: "2026-11-02T10:00:00Z",
        isDegraded: true,
        xaiBreakdown: {
          semanticScore: 84.5,
          semanticEngine: "POSTGRES_FTS_FALLBACK",
          trlScore: 85,
          trlLevel: 6,
          trlStage: "Thử nghiệm Pilot (TRL 4-6)",
          tniScore: 88,
          tniBand: "Cấp thiết rất cao (TNI >= 80)",
          ipScore: 100,
          ipStatus: "PATENT_GRANTED",
          ipDescription: "Đã được cấp bằng độc quyền sáng chế",
        },
      },
    ]);

    render(<MatchingRadarPage />);

    // Assert Candidate details
    expect(await screen.findByText("Hệ thống ống nhiệt trọng lực siêu dẫn trao đổi nhiệt")).toBeInTheDocument();
    expect(screen.getByText("89%")).toBeInTheDocument();

    // Assert FTS degradation badge
    expect(screen.getByTestId("fts-fallback-badge")).toBeInTheDocument();
    expect(screen.getByText("[Chế độ dự phòng FTS]")).toBeInTheDocument();

    // Assert 4-axis XAI real scores
    expect(screen.getByText("84.5%")).toBeInTheDocument();
    expect(screen.getByText("FTS Lexical")).toBeInTheDocument();
    expect(screen.getAllByText(/TRL 6/).length).toBeGreaterThan(0);
    expect(screen.getByText("88/100")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("Đã được cấp bằng độc quyền sáng chế")).toBeInTheDocument();
  });

  it("triggers recompute radar when clicking Recompute CTA button", async () => {
    vi.spyOn(brokerageApi, "getRadarCandidates").mockResolvedValue([]);
    const recomputeSpy = vi.spyOn(brokerageApi, "recomputeRadar").mockResolvedValue({
      computedMatchesCount: 8,
      tookMs: 145,
      isDegraded: false,
      engineVersion: "BGE-M3_HYBRID_4AXIS",
      timestamp: "2026-11-02T10:00:00Z",
    });

    render(<MatchingRadarPage />);

    const recomputeBtn = await screen.findByRole("button", { name: /Tính toán lại đối soát/i });
    expect(recomputeBtn).toBeInTheDocument();

    fireEvent.click(recomputeBtn);

    await waitFor(() => {
      expect(recomputeSpy).toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalledWith(
        expect.stringContaining("Đã hoàn tất tính toán đối soát AI (8 cặp khớp trong 145ms)!"),
        "Đối Soát Thành Công"
      );
    });
  });

  it("locks dropdown context strictly to Buyer Demands and filters out third-party candidates (T062)", async () => {
    vi.spyOn(authClient, "getUser").mockReturnValue({
      id: "u-buyer-t062",
      fullName: "Đại Diện Bên Mua A",
      role: "BUYER",
      email: "buyer_a@corp.vn",
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (typeof url === "string" && url.includes("/api/v1/buyer/demands")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: "dem-buyer-1", itemCode: "DMD-BUYER-01", title: "Máy thu hoạch thanh long tự động" },
            { id: "dem-buyer-2", itemCode: "DMD-BUYER-02", title: "Hệ thống tưới nhỏ giọt thông minh" },
          ],
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }) as any;

    vi.spyOn(brokerageApi, "getRadarCandidates").mockResolvedValue([
      {
        id: "cand-buyer-1",
        demandId: "dem-buyer-1",
        demandCode: "DMD-BUYER-01",
        demandTitle: "Máy thu hoạch thanh long tự động",
        buyerOrganizationId: "org-buyer-a",
        buyerOrganizationName: "Doanh Nghiệp A",
        offerId: "off-1",
        offerCode: "OFF-001",
        offerTitle: "Robot thu hái nông sản đa năng",
        sellerOrganizationId: "org-seller-1",
        sellerOrganizationName: "Viện Cơ Khí Nông Nghiệp",
        sectorCode: "LV01",
        matchScore: 94,
        tniScore: 88,
        trlLevel: 7,
        ipStatus: "PATENT_GRANTED",
        isActive: true,
        createdAt: "2026-11-02T10:00:00Z",
      },
      {
        id: "cand-other-99",
        demandId: "dem-other-99",
        demandCode: "DMD-OTHER-99",
        demandTitle: "Bài toán của Doanh nghiệp khác",
        buyerOrganizationId: "org-buyer-b",
        buyerOrganizationName: "Doanh Nghiệp B (Đối thủ)",
        offerId: "off-99",
        offerCode: "OFF-099",
        offerTitle: "Công nghệ đối thủ không được phép lộ",
        sellerOrganizationId: "org-seller-99",
        sellerOrganizationName: "Đối tác khác",
        sectorCode: "LV01",
        matchScore: 91,
        tniScore: 80,
        trlLevel: 6,
        ipStatus: "PATENT_GRANTED",
        isActive: true,
        createdAt: "2026-11-02T10:00:00Z",
      },
    ]);

    render(<MatchingRadarPage />);

    // 1. Candidate của chính Buyer phải xuất hiện
    expect(await screen.findByText("Robot thu hái nông sản đa năng")).toBeInTheDocument();

    // 2. Candidate của Bên thứ ba / Đối thủ TUYỆT ĐỐI KHÔNG xuất hiện (Zero IDOR)
    expect(screen.queryByText("Công nghệ đối thủ không được phép lộ")).not.toBeInTheDocument();
    expect(screen.queryByText("Bài toán của Doanh nghiệp khác")).not.toBeInTheDocument();

    // 3. Dropdown chỉ chứa bài toán của Buyer, không có bài toán của bên thứ ba
    const selector = screen.getByTitle("Chọn bài toán nguồn để lọc kết quả Radar") as HTMLSelectElement;
    expect(selector).toBeInTheDocument();

    // Dropdown tự động chọn bài toán đầu tiên của Buyer
    expect(selector.value).toBe("DMD-BUYER-01");

    // Danh sách options chỉ gồm bài toán của Buyer
    const options = Array.from(selector.options).map((o) => o.value);
    expect(options).toContain("DMD-BUYER-01");
    expect(options).toContain("DMD-BUYER-02");
    expect(options).not.toContain("DMD-OTHER-99");
    expect(options).not.toContain("ALL");
  });

  it("switches context and invokes recomputeRadar scoped to selected Buyer demand (T062)", async () => {
    vi.spyOn(authClient, "getUser").mockReturnValue({
      id: "u-buyer-t062-2",
      fullName: "Đại Diện Bên Mua B",
      role: "BUYER",
      email: "buyer_b@corp.vn",
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (typeof url === "string" && url.includes("/api/v1/buyer/demands")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: "dem-buyer-1", itemCode: "DMD-BUYER-01", title: "Máy sấy lạnh" },
            { id: "dem-buyer-2", itemCode: "DMD-BUYER-02", title: "Cảm biến vi khí hậu" },
          ],
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    }) as any;

    vi.spyOn(brokerageApi, "getRadarCandidates").mockResolvedValue([
      {
        id: "cand-1",
        demandId: "dem-buyer-1",
        demandCode: "DMD-BUYER-01",
        demandTitle: "Máy sấy lạnh",
        buyerOrganizationId: "org-buyer",
        buyerOrganizationName: "Doanh Nghiệp B",
        offerId: "off-1",
        offerCode: "OFF-001",
        offerTitle: "Máy sấy bơm nhiệt",
        sellerOrganizationId: "org-seller-1",
        sellerOrganizationName: "Viện Sấy",
        sectorCode: "LV01",
        matchScore: 90,
        tniScore: 85,
        trlLevel: 7,
        ipStatus: "PATENT_GRANTED",
        isActive: true,
        createdAt: "2026-11-02T10:00:00Z",
      },
      {
        id: "cand-2",
        demandId: "dem-buyer-2",
        demandCode: "DMD-BUYER-02",
        demandTitle: "Cảm biến vi khí hậu",
        buyerOrganizationId: "org-buyer",
        buyerOrganizationName: "Doanh Nghiệp B",
        offerId: "off-2",
        offerCode: "OFF-002",
        offerTitle: "Sensor IoT nông nghiệp LoRa",
        sellerOrganizationId: "org-seller-2",
        sellerOrganizationName: "Viện IoT",
        sectorCode: "LV01",
        matchScore: 88,
        tniScore: 82,
        trlLevel: 8,
        ipStatus: "PATENT_GRANTED",
        isActive: true,
        createdAt: "2026-11-02T10:00:00Z",
      },
    ]);

    const recomputeSpy = vi.spyOn(brokerageApi, "recomputeRadar").mockResolvedValue({
      computedMatchesCount: 3,
      tookMs: 95,
      isDegraded: false,
      engineVersion: "BGE-M3_HYBRID_4AXIS",
      timestamp: "2026-11-02T10:00:00Z",
    });

    render(<MatchingRadarPage />);

    // Ban đầu chọn DMD-BUYER-01
    expect(await screen.findByText("Máy sấy bơm nhiệt")).toBeInTheDocument();
    expect(screen.queryByText("Sensor IoT nông nghiệp LoRa")).not.toBeInTheDocument();

    // Chuyển dropdown sang DMD-BUYER-02
    const selector = screen.getByTitle("Chọn bài toán nguồn để lọc kết quả Radar") as HTMLSelectElement;
    fireEvent.change(selector, { target: { value: "DMD-BUYER-02" } });

    // Giao diện chuyển sang candidate của DMD-BUYER-02
    expect(await screen.findByText("Sensor IoT nông nghiệp LoRa")).toBeInTheDocument();
    expect(screen.queryByText("Máy sấy bơm nhiệt")).not.toBeInTheDocument();

    // Nhấn Recompute -> phải gọi recomputeRadar với đúng param 'DMD-BUYER-02'
    const recomputeBtn = screen.getByRole("button", { name: /Tính toán lại đối soát/i });
    fireEvent.click(recomputeBtn);

    await waitFor(() => {
      expect(recomputeSpy).toHaveBeenCalledWith("DMD-BUYER-02");
    });
  });

  it("renders 4 XAI progress bars, readiness badges and handles recomputing loading state (T066)", async () => {
    vi.spyOn(brokerageApi, "getRadarCandidates").mockResolvedValue([
      {
        id: "cand-e2e-1",
        demandId: "dem-1",
        demandCode: "DMD-E2E-001",
        demandTitle: "Chế tạo vật liệu nano composite y sinh",
        buyerOrganizationId: "org-buyer",
        buyerOrganizationName: "Viện Quân Y",
        offerId: "off-e2e-1",
        offerCode: "OFF-E2E-001",
        offerTitle: "Công nghệ sản xuất nano Hydroxyapatite tinh khiết cao",
        sellerOrganizationId: "org-seller",
        sellerOrganizationName: "Viện Hóa học",
        sectorCode: "LV14",
        matchScore: 95,
        tniScore: 90,
        trlLevel: 8,
        ipStatus: "PATENT_GRANTED",
        isActive: true,
        createdAt: "2026-11-02T10:00:00Z",
        isDegraded: false,
        xaiBreakdown: {
          semanticScore: 92.0,
          semanticEngine: "BGE-M3_RERANK",
          trlScore: 100,
          trlLevel: 8,
          trlStage: "Thương mại hóa (TRL 7-9)",
          tniScore: 90,
          tniBand: "Cấp thiết rất cao (TNI >= 80)",
          ipScore: 100,
          ipStatus: "PATENT_GRANTED",
          ipDescription: "Đã được cấp bằng độc quyền sáng chế / GPHI",
        },
      },
    ]);

    let resolveRecompute: (value: any) => void;
    const recomputePromise = new Promise((resolve) => {
      resolveRecompute = resolve;
    });

    vi.spyOn(brokerageApi, "recomputeRadar").mockImplementation(() => recomputePromise as any);

    render(<MatchingRadarPage />);

    // 1. Kiểm tra render thông tin ứng viên
    expect(await screen.findByText("Công nghệ sản xuất nano Hydroxyapatite tinh khiết cao")).toBeInTheDocument();
    expect(screen.getByText("95%")).toBeInTheDocument();

    // 2. Kiểm tra khối Explainable AI (XAI) và 4 trục điểm số
    expect(screen.getByText(/Giải trình độ tương thích AI/i)).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("AI BGE-M3")).toBeInTheDocument();
    expect(screen.getByText("Thương mại hóa (TRL 7-9)")).toBeInTheDocument();
    expect(screen.getByText("90/100")).toBeInTheDocument();
    expect(screen.getByText("Cấp thiết rất cao (TNI >= 80)")).toBeInTheDocument();
    expect(screen.getByText("Đã được cấp bằng độc quyền sáng chế / GPHI")).toBeInTheDocument();

    // 3. Kiểm tra tương tác Recompute & Loading state
    const recomputeBtn = screen.getByRole("button", { name: /Tính toán lại đối soát/i });
    fireEvent.click(recomputeBtn);

    // Khi đang recompute: xuất hiện text "Đang tính toán..."
    expect(await screen.findByText("Đang tính toán...")).toBeInTheDocument();

    // Kết thúc promise recompute
    resolveRecompute!({
      computedMatchesCount: 5,
      tookMs: 120,
      isDegraded: false,
      engineVersion: "BGE-M3_HYBRID_4AXIS",
      timestamp: "2026-11-02T10:00:00Z",
    });

    // Sau khi recompute thành công: toast thông báo xuất hiện
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        expect.stringContaining("Đã hoàn tất tính toán đối soát AI (5 cặp khớp trong 120ms)!"),
        "Đối Soát Thành Công"
      );
    });
  });

  it("displays only pending count in tab badge and sorts unapproved requests to the top", async () => {
    vi.spyOn(brokerageApi, "getRadarCandidates").mockResolvedValue([]);
    vi.spyOn(brokerageApi, "getConnectionRequests").mockResolvedValue([
      {
        id: "req-accepted",
        requestCode: "REQ-ACC-01",
        senderUserId: "u1",
        demandId: "d1",
        offerId: "o1",
        senderOrgName: "DN A",
        senderRole: "BUYER",
        receiverUserId: "u2",
        receiverOrgName: "Viện B",
        proposedBudgetRange: null,
        status: "ACCEPTED",
        responseNote: null,
        respondedAt: null,
        message: "Đã chấp thuận mới nhất",
        createdAt: "2026-11-10T10:00:00Z",
      },
      {
        id: "req-rejected",
        requestCode: "REQ-REJ-02",
        senderUserId: "u1",
        demandId: "d1",
        offerId: "o2",
        senderOrgName: "DN C",
        senderRole: "BUYER",
        receiverUserId: "u3",
        receiverOrgName: "Viện D",
        proposedBudgetRange: null,
        status: "REJECTED",
        responseNote: null,
        respondedAt: null,
        message: "Đã từ chối",
        createdAt: "2026-11-09T10:00:00Z",
      },
      {
        id: "req-pending",
        requestCode: "REQ-PEN-03",
        senderUserId: "u1",
        demandId: "d1",
        offerId: "o3",
        senderOrgName: "DN E",
        senderRole: "BUYER",
        receiverUserId: "u4",
        receiverOrgName: "Viện F",
        proposedBudgetRange: null,
        status: "PENDING",
        responseNote: null,
        respondedAt: null,
        message: "Chưa phê duyệt",
        createdAt: "2026-11-01T10:00:00Z",
      },
    ]);

    render(<MatchingRadarPage />);

    const requestsTabBtn = await screen.findByRole("button", { name: /Yêu Cầu Kết Nối Đã Gửi \/ Nhận/i });
    await waitFor(() => {
      expect(requestsTabBtn).toHaveTextContent("1");
      expect(requestsTabBtn).not.toHaveTextContent("3");
    });

    fireEvent.click(requestsTabBtn);

    const codeBadges = await screen.findAllByText(/^REQ-(ACC|REJ|PEN)-/);
    expect(codeBadges.map((el) => el.textContent)).toEqual([
      "REQ-PEN-03",
      "REQ-ACC-01",
      "REQ-REJ-02",
    ]);

    // Kiểm tra 3 thẻ tóm tắt trạng thái
    expect(screen.getByText(/Cần Xử Lý \(Chờ Phản Hồi\)/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Cần xử lý\s*1$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Đã chấp thuận\s*1$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Đã từ chối\s*1$/i })).toBeInTheDocument();

    // Lọc chỉ còn "Cần xử lý"
    fireEvent.click(screen.getByRole("button", { name: /^Cần xử lý\s*1$/i }));
    expect(screen.getByText("REQ-PEN-03")).toBeInTheDocument();
    expect(screen.queryByText("REQ-ACC-01")).not.toBeInTheDocument();
    expect(screen.queryByText("REQ-REJ-02")).not.toBeInTheDocument();

    // Lọc sang "Đã chấp thuận"
    fireEvent.click(screen.getByRole("button", { name: /^Đã chấp thuận\s*1$/i }));
    expect(screen.getByText("REQ-ACC-01")).toBeInTheDocument();
    expect(screen.queryByText("REQ-PEN-03")).not.toBeInTheDocument();

    // Lọc sang "Đã từ chối"
    fireEvent.click(screen.getByRole("button", { name: /^Đã từ chối\s*1$/i }));
    expect(screen.getByText("REQ-REJ-02")).toBeInTheDocument();
    expect(screen.queryByText("REQ-ACC-01")).not.toBeInTheDocument();

    // Quay lại "Tất cả"
    fireEvent.click(screen.getByRole("button", { name: /^Tất cả\s*3$/i }));
    expect(screen.getAllByText(/^REQ-(ACC|REJ|PEN)-/).length).toBe(3);
  });

  it("maps overallMatchScore and xaiBreakdown fields from backend DTO and uses clear tab wording", async () => {
    vi.spyOn(brokerageApi, "getConnectionRequests").mockResolvedValue([]);
    vi.spyOn(brokerageApi, "getRadarCandidates").mockResolvedValue([
      {
        id: "cand-backend-dto",
        demandId: "dem-1",
        demandCode: "DMD-DEMO-NC-02",
        demandTitle: "Sản xuất & Đúc phôi hợp kim",
        buyerOrganizationId: "org-b",
        buyerOrganizationName: "Doanh Nghiệp Tìm Kiếm Công Nghệ",
        offerId: "off-1",
        offerCode: "OFF-202610-LV05-06",
        offerTitle: "Dây chuyền chiết xuất hoạt chất sinh học CO2",
        sellerOrganizationId: "org-s",
        sellerOrganizationName: "Sở KH&CN Hà Nội",
        sectorCode: "LV05",
        overallMatchScore: 87,
        isActive: true,
        isDegraded: true,
        xaiBreakdown: {
          semanticScore: 79.4,
          semanticEngine: "POSTGRES_FTS_FALLBACK",
          trlScore: 100,
          trlLevel: 8,
          trlStage: "Thương mại hóa (TRL 7-9)",
          tniScore: 95,
          tniBand: "Cấp thiết rất cao",
          ipScore: 100,
          ipStatus: "PATENT_GRANTED",
          ipDescription: "Đã cấp bằng sáng chế",
        },
      } as any,
    ]);

    render(<MatchingRadarPage />);

    expect(screen.getByRole("button", { name: /Giải Pháp AI Gợi Ý/i })).toBeInTheDocument();
    expect(screen.queryByText(/Ứng Viên Ghép Đôi AI/i)).not.toBeInTheDocument();

    expect(await screen.findByText("87%")).toBeInTheDocument();
    expect(screen.getByText("87% Tổng Hợp")).toBeInTheDocument();
    expect(screen.getAllByText("TRL 8").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("TNI 95/100")).toBeInTheDocument();
    expect(screen.getByText("Có bằng SHTT")).toBeInTheDocument();
  });
});
