import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OrgTreePage from "./page";

vi.mock("@/components/admin/admin-nav", () => ({
  AdminNav: () => <nav data-testid="admin-nav">AdminNav</nav>,
}));

vi.mock("@/services/api/org-tree", () => ({
  orgTreeApi: {
    getTree: vi.fn().mockResolvedValue([
      {
        id: "unit-root",
        code: "NACENTECH-TW",
        name: "Cơ quan Đầu mối Trung ương NacenTech (Bộ KH&CN)",
        unitType: "NATIONAL",
        status: "ACTIVE",
        parentId: null,
      },
      {
        id: "unit-hn",
        code: "SO-KHCN-HN",
        name: "Sở Khoa học và Công nghệ TP. Hà Nội",
        unitType: "PROVINCIAL",
        status: "ACTIVE",
        parentId: "unit-root",
        provinceId: "HN",
      },
      {
        id: "unit-hcm",
        code: "SO-KHCN-HCM",
        name: "Sở Khoa học và Công nghệ TP. Hồ Chí Minh",
        unitType: "PROVINCIAL",
        status: "ACTIVE",
        parentId: "unit-root",
        provinceId: "HCM",
      },
    ]),
    createUnit: vi.fn().mockResolvedValue({
      id: "unit-new",
      code: "VIEN-AI-VN",
      name: "Viện Trí Tuệ Nhân Tạo Quốc Gia",
      unitType: "INSTITUTION",
      status: "ACTIVE",
      createdAtUtc: new Date().toISOString(),
    }),
    updateUnit: vi.fn().mockResolvedValue({}),
    deleteUnit: vi.fn().mockResolvedValue({}),
    provisionProvinceLeader: vi.fn().mockResolvedValue({}),
  },
}));

describe("OrgTreePage (TASK-07 Administrative Org Tree & Scoped RBAC)", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders 3-tier organizational hierarchy with root central node and provincial units", async () => {
    render(<OrgTreePage />);

    expect(await screen.findByText(/Cây Tổ Chức Mạng Lưới Đổi Mới Sáng Tạo/i)).toBeInTheDocument();
    expect(await screen.findByText(/Cơ quan Đầu mối Trung ương NacenTech/i)).toBeInTheDocument();
    expect(await screen.findByText(/Sở Khoa học và Công nghệ TP. Hà Nội/i)).toBeInTheDocument();
  });

  it("opens modal and adds a new organizational unit", async () => {
    render(<OrgTreePage />);

    const addUnitBtn = await screen.findByRole("button", { name: /Thêm Đơn Vị Mới/i });
    expect(addUnitBtn).toBeInTheDocument();
    fireEvent.click(addUnitBtn);

    expect(screen.getByText("Thêm Đơn Vị Hành Chính Mới")).toBeInTheDocument();

    const codeInput = screen.getByPlaceholderText("SO-KHCN-BN hoặc DH-BACHKHOA-HN");
    fireEvent.change(codeInput, { target: { value: "VIEN-AI-VN" } });

    const nameInput = screen.getByPlaceholderText("Sở Khoa học và Công nghệ Tỉnh... hoặc Viện Nghiên cứu...");
    fireEvent.change(nameInput, { target: { value: "Viện Trí Tuệ Nhân Tạo Quốc Gia" } });

    const submitBtn = screen.getByRole("button", { name: /Xác Nhận Thêm Đơn Vị/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Đã thêm thành công đơn vị/i)).toBeInTheDocument();
  });

  it("resolves province labels, filters via search input and toggles collapse (T078)", async () => {
    render(<OrgTreePage />);

    // Province label resolved via @/lib/label-resolver
    expect(await screen.findByText(/Địa bàn:.*Hà Nội \(HN\)/i)).toBeInTheDocument();

    // Search filter
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm Sở Tỉnh hoặc Viện\/Trường/i);
    fireEvent.change(searchInput, { target: { value: "Hà Nội" } });
    expect(screen.getByText(/Sở Khoa học và Công nghệ TP. Hà Nội/i)).toBeInTheDocument();
    expect(screen.queryByText(/Sở Khoa học và Công nghệ TP. Hồ Chí Minh/i)).not.toBeInTheDocument();

    // Clear search button
    const clearBtn = screen.getByRole("button", { name: /Xóa tìm kiếm/i });
    fireEvent.click(clearBtn);
    expect(screen.getByText(/Sở Khoa học và Công nghệ TP. Hồ Chí Minh/i)).toBeInTheDocument();

    // Collapse All & Expand All
    const collapseAllBtn = screen.getByRole("button", { name: /Thu Gọn Tất Cả/i });
    fireEvent.click(collapseAllBtn);
    expect(screen.queryByText(/Sở Khoa học và Công nghệ TP. Hà Nội/i)).not.toBeInTheDocument();

    const expandAllBtn = screen.getByRole("button", { name: /Mở Rộng Tất Cả/i });
    fireEvent.click(expandAllBtn);
    expect(screen.getByText(/Sở Khoa học và Công nghệ TP. Hà Nội/i)).toBeInTheDocument();
  });
});
