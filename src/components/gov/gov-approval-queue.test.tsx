import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GovApprovalQueue from "./gov-approval-queue";
import { authClient } from "@/lib/auth-client";

vi.mock("@/lib/master-data-client", () => ({
  getActiveSectors: vi.fn().mockResolvedValue([
    { code: "AGRI_TECH", name: "Nông nghiệp công nghệ cao" },
    { code: "CN01", name: "Công nghệ thông tin" },
  ]),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/gov/approvals",
  useSearchParams: () => new URLSearchParams(),
}));

describe("T082 [FE-GovApprovalQueue] GovApprovalQueue 5-Tab Workspace Verification", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    authClient.setSession("test-token", {
      id: "gov-user-1",
      email: "lanhdao@hanoi.gov.vn",
      fullName: "Trần Văn Lãnh Đạo",
      role: "PROVINCIAL_ADMIN",
      scopeId: "HN",
      organizationName: "Sở KH&CN Hà Nội",
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/approvals")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: "appr-exp-001",
                  user: { fullName: "TS. Nguyễn Minh Triết", email: "triet.nm@vnu.edu.vn" },
                  requestType: "EXPERT",
                  scopeType: "PROVINCE",
                  scopeId: "HN",
                  createdAt: "2026-10-20T08:00:00Z",
                  status: "PENDING_APPROVAL",
                  version: 1,
                  payloadJson: JSON.stringify({
                    organizationName: "Đại học Quốc gia Hà Nội",
                    degree: "Tiến sĩ KH&CN",
                    expertiseSectors: ["CN01"],
                    consultingSummary: "Chuyên gia AI và xử lý ngôn ngữ tự nhiên.",
                  }),
                },
              ],
            }),
        });
      }

      if (url.includes("/api/v1/portal/seller/technologies")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: "c25347fc-tech-offer-001",
                  title: "Hệ thống AI IoT Giám sát Chất lượng Nước nuôi Tôm",
                  techType: "SOLUTION",
                  sectorCode: "AGRI_TECH",
                  trlLevel: 7,
                  ipStatus: "PATENTED",
                  status: "PENDING",
                  createdAt: "2026-10-21T09:30:00Z",
                  organizationName: "Viện Nghiên cứu Nuôi trồng Thủy sản",
                  authorityName: "Sở Khoa học và Công nghệ TP. Hà Nội",
                },
              ],
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [] }),
      });
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders 5 approval tabs with count badges", async () => {
    render(<GovApprovalQueue />);

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /Tất Cả/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Chuyên Gia/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Shop Chào Bán/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Nhu Cầu/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Pháp Nhân/i })).toBeInTheDocument();
    });
  });

  it("resolves and displays standardized record codes instead of UUID strings", async () => {
    render(<GovApprovalQueue />);

    await waitFor(() => {
      // Technology offer formatted code: CB-HN-C25347
      expect(screen.getByText("CB-HN-C25347")).toBeInTheDocument();
      // Expert formatted code: CG-HN-APPREX
      expect(screen.getByText("CG-HN-APPREX")).toBeInTheDocument();
    });
  });

  it("provides preview action with clear preview watermark modal", async () => {
    render(<GovApprovalQueue />);

    await waitFor(() => {
      expect(screen.getByText("Hệ thống AI IoT Giám sát Chất lượng Nước nuôi Tôm")).toBeInTheDocument();
    });

    const offerItem = screen.getByText("Hệ thống AI IoT Giám sát Chất lượng Nước nuôi Tôm");
    fireEvent.click(offerItem);

    await waitFor(() => {
      expect(screen.getByText(/Thẩm Định Sản Phẩm Chào Bán/i)).toBeInTheDocument();
      expect(screen.getByText(/CHƯA ĐƯỢC CÔNG KHAI/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Xem Trước Niêm Yết/i })).toBeInTheDocument();
    });
  });

  it("supports sort and popover filters in the table header", async () => {
    render(<GovApprovalQueue />);

    await waitFor(() => {
      expect(screen.getByText("Mã Hồ Sơ")).toBeInTheDocument();
      expect(screen.getByText("Chủ Thể / Người Nộp")).toBeInTheDocument();
      expect(screen.getByText("Lĩnh Vực Công Nghệ")).toBeInTheDocument();
      expect(screen.getByText("Ngày Nộp")).toBeInTheDocument();
    });

    // Sort by submitter
    const submitterHeader = screen.getByText("Chủ Thể / Người Nộp");
    fireEvent.click(submitterHeader);

    // Popover filter button for sectors
    const sectorFilterBtn = screen.getByTestId("filter-popover-sector");
    expect(sectorFilterBtn).toBeInTheDocument();
    fireEvent.click(sectorFilterBtn);

    // Popover opens
    await waitFor(() => {
      expect(screen.getByText("Lọc theo ngành TT17")).toBeInTheDocument();
    });
  });
});
