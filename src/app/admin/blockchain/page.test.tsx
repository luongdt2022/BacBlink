import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AdminBlockchainPage from "./page";
import * as blockchainApi from "@/lib/api/blockchain";

// Mock router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "tab" ? "policies" : null),
  }),
  usePathname: () => "/admin/blockchain",
}));

// Mock role-guard: render children
vi.mock("@/components/auth/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("AdminBlockchainPage Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders policies tab with loaded anchor policies", async () => {
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
    ]);

    render(<AdminBlockchainPage />);

    expect(screen.getByText(/Trung Tâm Quản Trị Chuỗi Khối & Mật Mã Học/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Hồ Sơ Chào Bán Công Nghệ")).toBeInTheDocument();
      expect(screen.getByText("Biên Bản Thỏa Thuận Deal Room")).toBeInTheDocument();
      expect(screen.getByText("25 bản ghi")).toBeInTheDocument();
    });
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
