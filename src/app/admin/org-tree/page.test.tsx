import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OrgTreePage from "./page";

vi.mock("@/components/admin/admin-nav", () => ({
  AdminNav: () => <nav data-testid="admin-nav">AdminNav</nav>,
}));

describe("OrgTreePage (TASK-07 Administrative Org Tree & Scoped RBAC)", () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders 3-tier organizational hierarchy with root central node and 34 provinces focus", () => {
    render(<OrgTreePage />);

    expect(screen.getByText("Cây Thư Mục 34 Tỉnh Thành Trọng Điểm & Cơ Sở Liên Kết")).toBeInTheDocument();
    expect(screen.getByText("Cơ quan Đầu mối Trung ương NacenTech (Bộ KH&CN)")).toBeInTheDocument();
    expect(screen.getByText("Sở Khoa học và Công nghệ TP. Hà Nội")).toBeInTheDocument();
    expect(screen.getByText("Sở Khoa học và Công nghệ TP. Hồ Chí Minh")).toBeInTheDocument();
  });

  it("opens modal and provisions a provincial admin leader account", () => {
    render(<OrgTreePage />);

    // Bac Ninh province starts without assigned leader
    const provisionBtn = screen.getByRole("button", { name: /Cấp Tài Khoản Sở/i });
    expect(provisionBtn).toBeInTheDocument();
    fireEvent.click(provisionBtn);

    expect(screen.getByText("Khởi Tạo Tài Khoản Quản Trị Sở Tỉnh")).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /Xác Nhận Cấp Quyền/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Đã cấp thành công tài khoản quản trị Sở/i)).toBeInTheDocument();
  });

  it("opens modal and adds a new institutional branch unit", () => {
    render(<OrgTreePage />);

    const addUnitBtn = screen.getByRole("button", { name: /Thêm Cơ sở Liên kết/i });
    fireEvent.click(addUnitBtn);

    expect(screen.getByText("Thêm Cơ Sở Liên Kết (Viện/Trường)")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("VIEN-NCKH-01"), {
      target: { value: "VIEN-AI-VN" },
    });
    fireEvent.change(screen.getByPlaceholderText("Viện Công Nghệ Môi Trường và Năng Lượng Mới"), {
      target: { value: "Viện Trí Tuệ Nhân Tạo Quốc Gia" },
    });

    const submitBtn = screen.getByRole("button", { name: "Thêm Cơ Sở" });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Đã thêm thành công cơ sở liên kết: Viện Trí Tuệ Nhân Tạo Quốc Gia/i)).toBeInTheDocument();
  });
});
