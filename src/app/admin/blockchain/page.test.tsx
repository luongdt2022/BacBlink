import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import AdminBlockchainPage from "./page";
import * as blockchainApi from "@/lib/api/blockchain";

let currentTab = "policies";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "tab" ? currentTab : null),
  }),
  usePathname: () => "/admin/blockchain",
}));

vi.mock("@/components/auth/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("AdminBlockchainPage Component — CR-BACLINK-007", () => {
  beforeEach(() => {
    currentTab = "policies";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders policies tab with loaded anchor policies and filters out any legacy TT17_ASSESSMENT policy", async () => {
    vi.spyOn(blockchainApi, "fetchAnchorPolicies").mockResolvedValue([
      {
        id: "pol-1",
        entityType: "SELLER_OFFER",
        displayName: "Hồ Sơ Chào Bán Công Nghệ",
        isEnabled: true,
        triggerStatus: "APPROVED",
        jsonFieldsExpression: "$",
        batchSizeThreshold: 10,
        batchTimeoutMinutes: 5,
        anchoredRecordsCount: 25,
        version: 1,
      },
      {
        id: "pol-2",
        entityType: "DEAL_ROOM_MOU",
        displayName: "Biên Bản Thỏa Thuận Deal Room",
        isEnabled: false,
        triggerStatus: "SIGNED",
        jsonFieldsExpression: "$",
        batchSizeThreshold: 5,
        batchTimeoutMinutes: 10,
        anchoredRecordsCount: 8,
        version: 1,
      },
      {
        id: "pol-legacy",
        entityType: "TT17_ASSESSMENT",
        displayName: "Báo Cáo TT17 Cũ",
        isEnabled: false,
        triggerStatus: "APPROVED",
        jsonFieldsExpression: "$",
        batchSizeThreshold: 5,
        batchTimeoutMinutes: 10,
        anchoredRecordsCount: 0,
        version: 1,
      },
    ]);

    const { container } = render(<AdminBlockchainPage />);

    expect(screen.getByText(/Trung Tâm Quản Trị Chuỗi Khối & Mật Mã Học/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Hệ thống Sổ cái Chứng thực Hồ sơ Năng lực & MOU Deal Room bất biến/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Hồ Sơ Chào Bán Công Nghệ")).toBeInTheDocument();
      expect(screen.getByText("Biên Bản Thỏa Thuận Deal Room")).toBeInTheDocument();
      expect(screen.getByText("25 bản ghi")).toBeInTheDocument();
    });

    expect(screen.queryByText("Báo Cáo TT17 Cũ")).not.toBeInTheDocument();
    expect(container.textContent || "").not.toMatch(/TT17/i);
  });

  it("excludes TT17_ASSESSMENT from Live Verifier entity options on ledger tab", async () => {
    currentTab = "ledger";
    vi.spyOn(blockchainApi, "fetchLedgerBlocks").mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });

    const { container } = render(<AdminBlockchainPage />);

    await waitFor(() => {
      expect(screen.getByText("Công Cụ Kiểm Chứng Mật Mã Độc Lập")).toBeInTheDocument();
    });

    expect(screen.getByRole("option", { name: /SELLER_OFFER/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /DEAL_ROOM_MOU/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /TT17/i })).not.toBeInTheDocument();
    expect(container.textContent || "").not.toMatch(/TT17/i);
  });

  it("renders empty state when there are no policies", async () => {
    vi.spyOn(blockchainApi, "fetchAnchorPolicies").mockResolvedValue([]);

    render(<AdminBlockchainPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Chưa có chính sách neo dữ liệu nào được khởi tạo trong hệ thống.")
      ).toBeInTheDocument();
    });
  });
});
