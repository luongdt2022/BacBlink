import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { vi, describe, expect, it, beforeEach, afterEach } from "vitest";
import type { ReactNode } from "react";
import ExpertProjectsPage from "./page";
import { authClient } from "@/lib/auth-client";
import { INITIAL_EXPERT_PROJECTS } from "@/lib/expert-projects";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/auth/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("ExpertProjectsPage (T133 & T135 & T164)", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    localStorage.clear();

    vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/v1/experts/me/projects")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: INITIAL_EXPERT_PROJECTS,
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ success: true, data: [] }),
      } as Response;
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders 5 TRL Kanban columns and project cards correctly", async () => {
    authClient.setSession("token-verified", {
      id: "u-exp-1",
      email: "tuan.nv@baclink.org.vn",
      fullName: "GS.TS. Nguyễn Văn Tuấn",
      role: "VERIFIED_EXPERT",
    });

    render(<ExpertProjectsPage />);

    expect(screen.getByText(/Dự Án Đồng Hành & Hợp Tác \(Thang Đo TRL 1-9\)/i)).toBeInTheDocument();

    // 5 TRL Columns loaded from API
    expect(await screen.findByText("Tiếp Nhận & Ký NDA")).toBeInTheDocument();
    expect(screen.getByText("Đàm Phán Deal Room 1-1")).toBeInTheDocument();
    expect(screen.getByText("Thẩm Định & Thử Nghiệm TRL")).toBeInTheDocument();
    expect(screen.getByText("Dự Thảo & Ký Kết MOU")).toBeInTheDocument();
    expect(screen.getByText("Đồng Hành Chuyển Giao & Nghiệm Thu")).toBeInTheDocument();

    // Project cards
    expect(screen.getByText("PRJ-EXP-2026-042")).toBeInTheDocument();
    expect(
      screen.getByText("Chuyển Giao Thuật Toán AI Giám Sát Mòn Dao Phay CNC Thời Gian Thực")
    ).toBeInTheDocument();

    // Dual TRL scale check
    expect(screen.getByText(/TRL 4: Lab Prototype/i)).toBeInTheDocument();
    expect(screen.getAllByText(/TRL 6: Thử Nghiệm Xưởng/i).length).toBeGreaterThan(0);

    // Security status badge
    expect(screen.getAllByText("NDA ĐÃ KÝ").length).toBeGreaterThan(0);

    // Expert toolset buttons
    expect(screen.getByText("Xuất Báo Cáo Tiến Độ Đồng Hành")).toBeInTheDocument();
    expect(screen.getByText("Khám Phá Radar AI")).toBeInTheDocument();
  });

  it("strictly DOES NOT contain external agency monitor button on expert workspace", async () => {
    authClient.setSession("token-verified", {
      id: "u-exp-1",
      email: "tuan.nv@baclink.org.vn",
      fullName: "GS.TS. Nguyễn Văn Tuấn",
      role: "VERIFIED_EXPERT",
    });

    render(<ExpertProjectsPage />);

    expect(screen.getByText(/Dự Án Đồng Hành & Hợp Tác/i)).toBeInTheDocument();

    // Strict Negative Assertion: External agency monitor button is forbidden on expert workspace
    expect(screen.queryByRole("button", { name: /Giám Sát/i })).not.toBeInTheDocument();
  });

  it("strictly DOES NOT contain rudimentary text 'Trống' on empty columns and renders graphical empty state with Radar CTA", async () => {
    authClient.setSession("token-verified", {
      id: "u-exp-1",
      email: "tuan.nv@baclink.org.vn",
      fullName: "GS.TS. Nguyễn Văn Tuấn",
      role: "VERIFIED_EXPERT",
    });

    render(<ExpertProjectsPage />);

    await screen.findByText("PRJ-EXP-2026-042");

    // Strict Negative Assertion: No crude 'Trống' text anywhere
    expect(screen.queryByText(/^Trống$/i)).not.toBeInTheDocument();

    // When all items in a column are filtered or moved, Empty State with CTA is rendered
    const sectorSelect = screen.getByLabelText(/Ngành công nghiệp chuyên môn \(BACLINK\):/i);
    // Filter to sector '07' which has 0 projects in INITIAL_EXPERT_PROJECTS
    fireEvent.change(sectorSelect, { target: { value: "07" } });

    expect(screen.getAllByText(/Không tìm thấy dự án nào phù hợp với bộ lọc hiện tại/i).length).toBe(5);
    expect(screen.getAllByRole("button", { name: /Đặt Lại Bộ Lọc/i }).length).toBeGreaterThan(0);
  });

  it("filters projects by search query and TRL range", async () => {
    authClient.setSession("token-verified", {
      id: "u-exp-1",
      email: "tuan.nv@baclink.org.vn",
      fullName: "GS.TS. Nguyễn Văn Tuấn",
      role: "VERIFIED_EXPERT",
    });

    render(<ExpertProjectsPage />);

    await screen.findByText("PRJ-EXP-2026-042");

    const searchInput = screen.getByPlaceholderText(/Tìm theo mã dự án PRJ-EXP-/i);
    fireEvent.change(searchInput, { target: { value: "PRJ-EXP-2026-042" } });

    expect(screen.getByText("PRJ-EXP-2026-042")).toBeInTheDocument();
    expect(screen.queryByText("PRJ-EXP-2026-049")).not.toBeInTheDocument();

    // Reset filters
    const resetBtn = screen.getByTestId("reset-filters-btn");
    fireEvent.click(resetBtn);

    expect(screen.getByText("PRJ-EXP-2026-049")).toBeInTheDocument();
  });

  it("displays amber warning banner when role is EXPERT (pending review)", () => {
    authClient.setSession("token-expert", {
      id: "u-exp-2",
      email: "pending@baclink.org.vn",
      fullName: "TS. Ứng Viên Chuyên Gia",
      role: "EXPERT",
    });

    render(<ExpertProjectsPage />);

    expect(screen.getByText(/Hồ Sơ Đang Chờ Ban Quản Trị BACLINK Phê Duyệt/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Bạn đang ở chế độ xem trước dự án/i)
    ).toBeInTheDocument();
  });
});
