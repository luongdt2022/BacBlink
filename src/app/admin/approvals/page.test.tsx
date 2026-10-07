import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminApprovalsPage from "./page";

vi.mock("@/components/admin/admin-nav", () => ({
  AdminNav: () => <nav data-testid="admin-nav">AdminNav</nav>,
}));

vi.mock("@/lib/auth-client", () => ({ authClient: { getAuthHeaders: () => ({ "Content-Type": "application/json" }), hasRole: () => true } }));
const queue = [["EXPERT", "Đặng Tiến Lượng"], ["SHOP", "Công ty Cổ phần Công nghệ Sinh học Vinabiom"], ["DEMAND", "Tập đoàn Công nghệ Cơ điện Thái Bình Dương"], ["ACCOUNT", "Công ty Cổ phần Công nghệ Mới Greentech"], ["INSTITUTION", "Trung tâm Đổi mới Sáng tạo Quốc gia - Hòa Lạc"]].map(([requestType,name],i) => ({ id: String(i+1), requestType, scopeType: "SECTOR", scopeId: "LV91", payloadJson: JSON.stringify({ fullName: name, expertiseSectors: ["LV91"] }), status: "PENDING_APPROVAL", version: 1, createdAt: "2026-10-07T08:00:00Z" }));
let fetchMock: ReturnType<typeof vi.fn>;
// Mocked component/provider contract; not real-service QC evidence.
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe("AdminApprovalsPage (TASK-07)", async () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
    fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url.endsWith("/sectors")) return { ok: true, json: async () => ({ success: true, data: [{ code: "LV91", name: "Ngành runtime đổi tên" }] }) };
      if (options?.method === "PUT") { const action = JSON.parse(options.body as string).action; return { ok: true, json: async () => ({ success: true, data: { ...queue[0], status: action === "APPROVE" ? "APPROVED" : action === "REJECT" ? "REJECTED" : "CHANGES_REQUESTED", version: 2 } }) }; }
      return { ok: true, json: async () => ({ success: true, data: queue, totalPages: 1 }) };
    }); vi.stubGlobal("fetch", fetchMock);
  });

  it("renders approvals queue with initial items and counters", async () => {
    render(<AdminApprovalsPage />);
    await screen.findByText("Đặng Tiến Lượng");
    expect(screen.getByText("Hàng Đợi Phê Duyệt & Thẩm Định Hồ Sơ Phân Cấp")).toBeInTheDocument();
    expect(screen.getByText("Đặng Tiến Lượng")).toBeInTheDocument();
    expect(screen.getByText("Công ty Cổ phần Công nghệ Sinh học Vinabiom")).toBeInTheDocument();
    expect(screen.getByText(/Chờ thẩm định trong trang:/)).toBeInTheDocument();
  });

  it("filters items by tab (EXPERT, SHOP, DEMAND)", async () => {
    render(<AdminApprovalsPage />);
    await screen.findByText("Đặng Tiến Lượng");
    
    // Tab "Chuyên gia KH&CN"
    const expertTab = screen.getByText("Chuyên gia KH&CN");
    fireEvent.click(expertTab);

    expect(screen.getByText("Đặng Tiến Lượng")).toBeInTheDocument();
    expect(screen.queryByText("Công ty Cổ phần Công nghệ Sinh học Vinabiom")).not.toBeInTheDocument();
  });

  it("filters items by search query", async () => {
    render(<AdminApprovalsPage />);
    await screen.findByText("Đặng Tiến Lượng");
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm nhanh theo Tên chuyên gia/i);
    
    fireEvent.change(searchInput, { target: { value: "Vinabiom" } });
    expect(screen.getByText("Công ty Cổ phần Công nghệ Sinh học Vinabiom")).toBeInTheDocument();
    expect(screen.queryByText("Đặng Tiến Lượng")).not.toBeInTheDocument();
  });

  it("selects an item and approves it (Happy Path)", async () => {
    render(<AdminApprovalsPage />);
    await screen.findByText("Đặng Tiến Lượng");
    
    // Select first row "Đặng Tiến Lượng"
    fireEvent.click(screen.getByText("Đặng Tiến Lượng"));

    // Action button appears in detail drawer
    const approveBtn = await screen.findByRole("button", { name: /Phê duyệt hồ sơ/i });
    expect(approveBtn).toBeInTheDocument();

    fireEvent.click(approveBtn);

    // Toast appears
    expect(await screen.findByText("Đã lưu quyết định thẩm định.")).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([, opts]) => (opts as RequestInit)?.method === "PUT")).toBe(true);
  });

  it("requires rejection note >= 10 chars (BR-ADM-004 Validation & Negative Test)", async () => {
    const alertMock = vi.fn();
    vi.stubGlobal("alert", alertMock);

    render(<AdminApprovalsPage />);
    await screen.findByText("Đặng Tiến Lượng");
    
    // Select first row "Đặng Tiến Lượng"
    fireEvent.click(screen.getByText("Đặng Tiến Lượng"));

    // Click "Từ chối Hồ sơ"
    const rejectBtn = screen.getByRole("button", { name: /Từ chối Hồ sơ/i });
    fireEvent.click(rejectBtn);

    // Rejection modal opens
    expect(screen.getByText("Từ Chối Hồ Sơ")).toBeInTheDocument();
    
    // Verify confirm button is disabled when < 10 chars
    const confirmBtn = screen.getByRole("button", { name: /Xác nhận Từ chối/i });
    expect(confirmBtn).toBeDisabled();

    // Valid reason >= 10 chars
    const textarea = screen.getByPlaceholderText(/Nhập lý do không đạt tiêu chí/i);
    fireEvent.change(textarea, { target: { value: "Hồ sơ chưa đạt yêu cầu do thiếu minh chứng văn bằng hợp lệ." } });
    
    expect(confirmBtn).not.toBeDisabled();
    fireEvent.click(confirmBtn);

    expect(await screen.findByText("Đã lưu quyết định thẩm định.")).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([, opts]) => (opts as RequestInit)?.method === "PUT")).toBe(true);
  });

  it("supports requesting changes with note >= 10 chars (Maker-Checker Flow)", async () => {
    render(<AdminApprovalsPage />);
    await screen.findByText("Đặng Tiến Lượng");
    
    // Select first row "Đặng Tiến Lượng"
    fireEvent.click(screen.getByText("Đặng Tiến Lượng"));

    // Click "Yêu cầu Bổ sung"
    const changeReqBtn = screen.getByRole("button", { name: /Yêu cầu Bổ sung/i });
    fireEvent.click(changeReqBtn);

    expect(screen.getByText("Yêu Cầu Bổ Sung Hồ Sơ")).toBeInTheDocument();
    
    const confirmBtn = screen.getByRole("button", { name: /Xác nhận Yêu cầu/i });
    expect(confirmBtn).toBeDisabled();

    const textarea = screen.getByPlaceholderText(/Nhập các thông tin \/ văn bằng/i);
    fireEvent.change(textarea, { target: { value: "Vui lòng scan lại bằng Tiến sĩ bản rõ nét công chứng." } });

    expect(confirmBtn).not.toBeDisabled();
    fireEvent.click(confirmBtn);

    expect(await screen.findByText("Đã lưu quyết định thẩm định.")).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([, opts]) => (opts as RequestInit)?.method === "PUT")).toBe(true);
  });

  it("renders 5 independent navigation tabs with pending badges and filtering (TC-C2-APP-01)", async () => {
    render(<AdminApprovalsPage />);
    await screen.findByText("Đặng Tiến Lượng");

    // Verify all 5 independent tabs exist
    const shopTab = screen.getByTestId("tab-shop");
    const demandTab = screen.getByTestId("tab-demand");
    const expertTab = screen.getByTestId("tab-expert");
    const accountTab = screen.getByTestId("tab-account");
    const facilityTab = screen.getByTestId("tab-facility");

    expect(shopTab).toBeInTheDocument();
    expect(demandTab).toBeInTheDocument();
    expect(expertTab).toBeInTheDocument();
    expect(accountTab).toBeInTheDocument();
    expect(facilityTab).toBeInTheDocument();

    // Verify badges contain pending counts > 0
    expect(screen.getByTestId("badge-shop").textContent).toBe("1");
    expect(screen.getByTestId("badge-demand").textContent).toBe("1");
    expect(screen.getByTestId("badge-expert").textContent).toBe("1");
    expect(screen.getByTestId("badge-account").textContent).toBe("1");
    expect(screen.getByTestId("badge-facility").textContent).toBe("1");

    // Click "Cơ sở" tab and verify filtering
    fireEvent.click(facilityTab);
    expect(screen.getByText("Trung tâm Đổi mới Sáng tạo Quốc gia - Hòa Lạc")).toBeInTheDocument();
    expect(screen.queryByText("Đặng Tiến Lượng")).not.toBeInTheDocument();

    // Click "Tài khoản" tab and verify filtering
    fireEvent.click(accountTab);
    expect(screen.getByText("Công ty Cổ phần Công nghệ Mới Greentech")).toBeInTheDocument();
    expect(screen.queryByText("Trung tâm Đổi mới Sáng tạo Quốc gia - Hòa Lạc")).not.toBeInTheDocument();

    // Click "Shop" tab and verify filtering
    fireEvent.click(shopTab);
    expect(screen.getByText("Công ty Cổ phần Công nghệ Sinh học Vinabiom")).toBeInTheDocument();

    // Click "Nhu cầu" tab and verify filtering
    fireEvent.click(demandTab);
    expect(screen.getByText("Tập đoàn Công nghệ Cơ điện Thái Bình Dương")).toBeInTheDocument();
  });
});

