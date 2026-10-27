import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminApprovalsPage from "./page";

const pushMock = vi.fn();
const replaceMock = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  usePathname: () => "/admin/approvals",
  useSearchParams: () => currentSearchParams,
}));

vi.mock("@/components/admin/admin-breadcrumbs", () => ({
  AdminBreadcrumbs: () => <nav data-testid="admin-breadcrumbs">AdminBreadcrumbs</nav>,
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    getAuthHeaders: () => ({ "Content-Type": "application/json" }),
    hasRole: () => true,
  },
}));

const queue = [
  ["EXPERT", "Đặng Tiến Lượng"],
  ["SHOP", "Công ty Cổ phần Công nghệ Sinh học Vinabiom"],
  ["DEMAND", "Tập đoàn Công nghệ Cơ điện Thái Bình Dương"],
  ["ACCOUNT", "Công ty Cổ phần Công nghệ Mới Greentech"],
  ["INSTITUTION", "Trung tâm Đổi mới Sáng tạo Quốc gia - Hòa Lạc"],
].map(([requestType, name], i) => ({
  id: String(i + 1),
  requestType,
  scopeType: i === 0 ? "PROVINCE" : "SECTOR",
  scopeId: i === 0 ? "HN" : "LV91",
  provinceName: i === 0 ? "Sở KH&CN TP. Hà Nội" : "Sở KH&CN TP. Hải Phòng",
  payloadJson: JSON.stringify({ fullName: name, expertiseSectors: ["LV91"] }),
  status: "PENDING_APPROVAL",
  version: 1,
  createdAt: "2026-10-07T08:00:00Z",
  isSlaBreached: i === 0,
  slaOverdueHours: i === 0 ? 76 : 0,
  isOverride: false,
}));

let fetchMock: ReturnType<typeof vi.fn>;

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AdminApprovalsPage (TASK-07)", () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
    fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url.endsWith("/sectors")) {
        return {
          ok: true,
          json: async () => ({ success: true, data: [{ code: "LV91", name: "Ngành runtime đổi tên" }] }),
        };
      }
      if (options?.method === "PUT") {
        const action = JSON.parse(options.body as string).action;
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              ...queue[0],
              status: action === "APPROVE" ? "APPROVED" : action === "REJECT" ? "REJECTED" : "CHANGES_REQUESTED",
              version: 2,
            },
          }),
        };
      }
      if (options?.method === "POST" && url.includes("/override")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: { ...queue[0], status: "APPROVED", isOverride: true, version: 2 },
          }),
        };
      }
      return { ok: true, json: async () => ({ success: true, data: queue, totalPages: 1 }) };
    });
    vi.stubGlobal("fetch", fetchMock);
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

  // --- DELTA V4 TESTS (CR-2026-020: T049 - T052) ---

  it("renders 3 high-level navigation tabs and filters SLA breached items (T050)", async () => {
    render(<AdminApprovalsPage />);
    await screen.findByText("Đặng Tiến Lượng");

    // Check presence of 3 high-level tabs
    expect(screen.getByText(/Tất cả hàng đợi/i)).toBeInTheDocument();
    const slaTab = screen.getByText(/Cảnh báo SLA/i);
    expect(slaTab).toBeInTheDocument();
    expect(screen.getByText(/Duyệt can thiệp/i)).toBeInTheDocument();

    // SLA breached badge should be displayed
    expect(screen.getByText(/SLA_BREACHED/i)).toBeInTheDocument();

    // Switch to SLA tab
    fireEvent.click(slaTab);

    // Only item 1 (isSlaBreached = true) is shown
    expect(screen.getByText("Đặng Tiến Lượng")).toBeInTheDocument();
    expect(screen.queryByText("Công ty Cổ phần Công nghệ Sinh học Vinabiom")).not.toBeInTheDocument();
  });

  it("filters items by 34 provinces dropdown (T050)", async () => {
    render(<AdminApprovalsPage />);
    await screen.findByText("Đặng Tiến Lượng");

    const provinceSelect = screen.getByDisplayValue(/Toàn quốc/i);
    fireEvent.change(provinceSelect, { target: { value: "HN" } });

    expect(screen.getByText("Đặng Tiến Lượng")).toBeInTheDocument();
  });

  it("validates Admin Override modal inputs: >= 20 chars & commitment checkbox (T051)", async () => {
    render(<AdminApprovalsPage />);
    await screen.findByText("Đặng Tiến Lượng");

    // Click "Duyệt Thay / Can Thiệp" on first row
    const overrideButtons = screen.getAllByRole("button", { name: /Duyệt Thay \/ Can Thiệp/i });
    fireEvent.click(overrideButtons[0]);

    // Modal opens
    expect(screen.getByText(/Duyệt Can Thiệp \/ Vượt Cấp \(Admin Override\)/i)).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 20 ký tự/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /Xác Nhận Duyệt Can Thiệp/i });
    expect(submitBtn).toBeDisabled();

    // 19 chars: still disabled
    const textarea = screen.getByPlaceholderText(/Nhập lý do cụ thể/i);
    fireEvent.change(textarea, { target: { value: "1234567890123456789" } });
    expect(screen.getByText(/19 \/ 20 ký tự/i)).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();

    // >= 20 chars but no checkbox: still disabled
    fireEvent.change(textarea, {
      target: { value: "Hồ sơ đã quá hạn 76h tại Sở KH&CN Hà Nội, Super Admin can thiệp duyệt." },
    });
    expect(submitBtn).toBeDisabled();

    // Check commitment checkbox
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    // Now button should be enabled!
    expect(submitBtn).not.toBeDisabled();

    // Submit
    fireEvent.click(submitBtn);

    // Success toast appears
    expect(await screen.findByText(/Đã thực thi Duyệt Can Thiệp Vượt Cấp thành công/i)).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([url, opts]) => url.includes("/override") && (opts as RequestInit)?.method === "POST")).toBe(true);
  });

  it("handles 409 Conflict gracefully in Admin Override modal (T051)", async () => {
    fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (options?.method === "POST" && url.includes("/override")) {
        return {
          ok: false,
          status: 409,
          json: async () => ({
            success: false,
            error: { code: "ERR_RECORD_ALREADY_MODIFIED", message: "Hồ sơ này vừa được Cán bộ Sở/Admin khác xử lý." },
          }),
        };
      }
      return { ok: true, json: async () => ({ success: true, data: queue, totalPages: 1 }) };
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminApprovalsPage />);
    await screen.findByText("Đặng Tiến Lượng");

    const overrideButtons = screen.getAllByRole("button", { name: /Duyệt Thay \/ Can Thiệp/i });
    fireEvent.click(overrideButtons[0]);

    const textarea = screen.getByPlaceholderText(/Nhập lý do cụ thể/i);
    fireEvent.change(textarea, {
      target: { value: "Hồ sơ đã quá hạn 76h tại Sở KH&CN Hà Nội, Super Admin can thiệp duyệt." },
    });
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole("button", { name: /Xác Nhận Duyệt Can Thiệp/i });
    fireEvent.click(submitBtn);

    // Toast 409 appears
    expect(await screen.findByText("Hồ sơ đã được xử lý bởi phiên làm việc khác.")).toBeInTheDocument();
  });

  it("renders empty state and allows resetting filters (T052)", async () => {
    render(<AdminApprovalsPage />);
    await screen.findByText("Đặng Tiến Lượng");

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm nhanh theo Tên chuyên gia/i);
    fireEvent.change(searchInput, { target: { value: "KHONG_TON_TAI_9999" } });

    expect(screen.getByText("Không tìm thấy hồ sơ nào phù hợp bộ lọc")).toBeInTheDocument();
    const resetBtn = screen.getByRole("button", { name: /Đặt lại bộ lọc/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(await screen.findByText("Đặng Tiến Lượng")).toBeInTheDocument();
  });

  // --- CR-2026-021 DELTA V5: T061 ROUTING & REACTIVE URL TESTS ---

  describe("T061 [QC-Routing] Reactive URL State & Filter Verification", () => {
    it("Scenario 1: Deep linking from URL with ?tab=sla initializes SLA tab", async () => {
      currentSearchParams = new URLSearchParams("tab=sla");
      render(<AdminApprovalsPage />);

      await screen.findByText("Đặng Tiến Lượng");

      // Verify that tab "Cảnh báo SLA" has active styling
      const slaTab = screen.getByRole("button", { name: /Cảnh báo SLA/i });
      expect(slaTab.className).toContain("text-rose-600");

      // SLA filter applied: only SLA breached items are rendered
      expect(screen.getByText("Đặng Tiến Lượng")).toBeInTheDocument();
      expect(screen.queryByText("Công ty Cổ phần Công nghệ Sinh học Vinabiom")).not.toBeInTheDocument();
    });

    it("Scenario 2: Deep linking from URL with ?tab=override initializes Override tab", async () => {
      currentSearchParams = new URLSearchParams("tab=override");
      render(<AdminApprovalsPage />);

      await screen.findByText("Đặng Tiến Lượng");

      // Verify tab "Duyệt can thiệp" has active styling
      const overrideTab = screen.getByRole("button", { name: /Duyệt can thiệp/i });
      expect(overrideTab.className).toContain("text-rose-600");
    });

    it("Scenario 3: Switching tab from UI updates URL via router.replace without page reload", async () => {
      currentSearchParams = new URLSearchParams();
      render(<AdminApprovalsPage />);

      await screen.findByText("Đặng Tiến Lượng");

      // Click "Cảnh báo SLA" tab
      const slaTab = screen.getByRole("button", { name: /Cảnh báo SLA/i });
      fireEvent.click(slaTab);

      expect(replaceMock).toHaveBeenCalledWith(
        expect.stringContaining("tab=sla"),
        expect.objectContaining({ scroll: false })
      );

      // Click "Duyệt can thiệp" tab
      const overrideTab = screen.getByRole("button", { name: /Duyệt can thiệp/i });
      fireEvent.click(overrideTab);

      expect(replaceMock).toHaveBeenCalledWith(
        expect.stringContaining("tab=override"),
        expect.objectContaining({ scroll: false })
      );

      // Click "Tất cả hàng đợi" tab -> tab param should be cleared
      const allTab = screen.getByRole("button", { name: /Tất cả hàng đợi/i });
      fireEvent.click(allTab);

      expect(replaceMock).toHaveBeenCalledWith(
        expect.not.stringContaining("tab="),
        expect.objectContaining({ scroll: false })
      );
    });

    it("Scenario 4: 34 provinces dropdown, filter by province, and 'Xóa tất cả bộ lọc' clears URL params", async () => {
      currentSearchParams = new URLSearchParams();
      render(<AdminApprovalsPage />);

      await screen.findByText("Đặng Tiến Lượng");

      // Verify dropdown contains 34 provinces + 1 "Toàn quốc" option = 35 options
      const provinceSelect = screen.getByDisplayValue(/Toàn quốc/i) as HTMLSelectElement;
      expect(provinceSelect.options.length).toBe(35);

      // Select "Hà Nội" (code: "HN")
      fireEvent.change(provinceSelect, { target: { value: "HN" } });

      // Verify router.replace was called with provinceCode=HN
      expect(replaceMock).toHaveBeenCalledWith(
        expect.stringContaining("provinceCode=HN"),
        expect.objectContaining({ scroll: false })
      );

      // Verify active filter bar shows "Xóa tất cả bộ lọc" button
      const clearBtn = screen.getByRole("button", { name: /Xóa tất cả bộ lọc/i });
      expect(clearBtn).toBeInTheDocument();

      // Click "Xóa tất cả bộ lọc"
      fireEvent.click(clearBtn);

      // Verify router.replace was called to clear all params back to /admin/approvals
      expect(replaceMock).toHaveBeenCalledWith(
        "/admin/approvals",
        expect.objectContaining({ scroll: false })
      );
    });

    it("Scenario 5: Renders AdminBreadcrumbs with WAI-ARIA and no AdminNav", async () => {
      render(<AdminApprovalsPage />);
      await screen.findByText("Đặng Tiến Lượng");

      expect(screen.getByTestId("admin-breadcrumbs")).toBeInTheDocument();
      expect(screen.queryByTestId("admin-nav")).not.toBeInTheDocument();
    });
  });

  describe("T076 [Wave 2 Delta v6] Human-readable labels, independent scrolling, and whitespace validation", () => {
    it("renders human-readable labels for request types and provinces in table and detail drawer (T073)", async () => {
      render(<AdminApprovalsPage />);
      await screen.findByText("Đặng Tiến Lượng");

      // Verify human-readable request type labels in table badges (also present in dropdown option)
      expect(screen.getAllByText("Hồ sơ Chuyên gia KH&CN").length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText("Gian hàng Công nghệ (Shop)")).toBeInTheDocument();
      expect(screen.getByText("Bài toán Nhu cầu Công nghệ")).toBeInTheDocument();

      // Verify human-readable province names
      expect(screen.getAllByText("Sở KH&CN TP. Hà Nội").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Sở KH&CN TP. Hải Phòng").length).toBeGreaterThanOrEqual(1);

      // Select row to inspect detail drawer
      fireEvent.click(screen.getByText("Đặng Tiến Lượng"));

      // Verify detail drawer header uses resolved type name
      expect(screen.getByText(/Thẩm định Hồ sơ Chuyên gia KH&CN/i)).toBeInTheDocument();
      // Verify detail drawer displays human-readable province
      expect(screen.getAllByText("Sở KH&CN TP. Hà Nội").length).toBeGreaterThanOrEqual(1);
    });

    it("blocks whitespace-only rejection reason and displays valid trimmed counter (T075 & BR-ADM-VAL-WHITESPACE)", async () => {
      render(<AdminApprovalsPage />);
      await screen.findByText("Đặng Tiến Lượng");

      // Select first row
      fireEvent.click(screen.getByText("Đặng Tiến Lượng"));

      // Open reject modal
      const rejectBtn = screen.getByRole("button", { name: /Từ chối Hồ sơ/i });
      fireEvent.click(rejectBtn);

      const textarea = screen.getByPlaceholderText(/Nhập lý do không đạt tiêu chí/i);
      const confirmBtn = screen.getByRole("button", { name: /Xác nhận Từ chối/i });

      // Initially disabled
      expect(confirmBtn).toBeDisabled();
      expect(screen.getByText("0/500 ký tự hợp lệ")).toBeInTheDocument();

      // Input 15 spaces (whitespace only)
      fireEvent.change(textarea, { target: { value: "               " } });

      // Must remain disabled and counter shows 0 valid chars
      expect(confirmBtn).toBeDisabled();
      expect(screen.getByText("0/500 ký tự hợp lệ")).toBeInTheDocument();

      // Input valid characters >= 10 chars
      const validReason = "Hồ sơ không hợp lệ do thiếu quyết định bổ nhiệm";
      fireEvent.change(textarea, { target: { value: validReason } });

      // Now enabled and counter matches valid trimmed length
      expect(confirmBtn).not.toBeDisabled();
      expect(screen.getByText(`${validReason.trim().length}/500 ký tự hợp lệ`)).toBeInTheDocument();
    });

    it("applies independent scroll classes to 2-column layout (T074)", async () => {
      const { container } = render(<AdminApprovalsPage />);
      await screen.findByText("Đặng Tiến Lượng");

      // Check for split grid container with height constraints
      const grid = container.querySelector(".lg\\:h-\\[calc\\(100vh-14rem\\)\\]");
      expect(grid).toBeInTheDocument();

      // Check for scrollbar-thin on table wrapper and drawer
      const scrollables = container.querySelectorAll(".scrollbar-thin");
      expect(scrollables.length).toBeGreaterThanOrEqual(2);
    });
  });
});
