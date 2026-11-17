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
  payloadJson: JSON.stringify({
    fullName: name,
    expertiseSectors: ["LV91"],
    tax_code: i === 1 ? "0108992134" : undefined,
    charter_capital: i === 1 ? "50 Tỷ VNĐ" : undefined,
  }),
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
    expect(screen.getByText(/Trung Tâm Phê Duyệt Hồ Sơ BACLINK \(1 Cấp\)/i)).toBeInTheDocument();
    expect(screen.getByText("Đặng Tiến Lượng")).toBeInTheDocument();
    expect(screen.getByText("Công ty Cổ phần Công nghệ Sinh học Vinabiom")).toBeInTheDocument();
    expect(screen.getByText(/Chờ thẩm định trong trang:/)).toBeInTheDocument();
    expect(screen.queryByText(/Cảnh báo SLA/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Duyệt can thiệp/i)).not.toBeInTheDocument();
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
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm nhanh theo Tên doanh nghiệp/i);

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

  it("filters items by Bac Ninh district dropdown without 34 provinces or override tabs", async () => {
    render(<AdminApprovalsPage />);
    await screen.findByText("Đặng Tiến Lượng");

    expect(screen.queryByText(/Cảnh báo SLA/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Duyệt can thiệp/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Duyệt Thay \/ Can Thiệp/i })).not.toBeInTheDocument();

    const districtSelect = screen.getByDisplayValue(/Tất cả địa bàn Bắc Ninh/i) as HTMLSelectElement;
    expect(districtSelect).toBeInTheDocument();
    fireEvent.change(districtSelect, { target: { value: "YEN_PHONG" } });

    expect(replaceMock).toHaveBeenCalledWith(
      expect.stringContaining("provinceCode=YEN_PHONG"),
      expect.objectContaining({ scroll: false })
    );
  });

  it("renders empty state and allows resetting filters (T052)", async () => {
    render(<AdminApprovalsPage />);
    await screen.findByText("Đặng Tiến Lượng");

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm nhanh theo Tên doanh nghiệp/i);
    fireEvent.change(searchInput, { target: { value: "KHONG_TON_TAI_9999" } });

    expect(screen.getByText("Không tìm thấy hồ sơ nào phù hợp bộ lọc")).toBeInTheDocument();
    const resetBtn = screen.getByRole("button", { name: /Đặt lại bộ lọc/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(await screen.findByText("Đặng Tiến Lượng")).toBeInTheDocument();
  });

  describe("T061 [QC-Routing] Reactive URL State & Filter Verification", () => {
    it("Scenario 4: Bac Ninh district dropdown filter and 'Xóa tất cả bộ lọc' clears URL params", async () => {
      currentSearchParams = new URLSearchParams();
      render(<AdminApprovalsPage />);

      await screen.findByText("Đặng Tiến Lượng");

      const districtSelect = screen.getByDisplayValue(/Tất cả địa bàn Bắc Ninh/i) as HTMLSelectElement;
      fireEvent.change(districtSelect, { target: { value: "TP_BN" } });

      expect(replaceMock).toHaveBeenCalledWith(
        expect.stringContaining("provinceCode=TP_BN"),
        expect.objectContaining({ scroll: false })
      );

      const clearBtn = screen.getByRole("button", { name: /Xóa tất cả bộ lọc/i });
      expect(clearBtn).toBeInTheDocument();

      fireEvent.click(clearBtn);

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

      // Verify human-readable request type labels in table badges (V7 administrative labels)
      expect(screen.getAllByText("Chuyên Gia KH&CN").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Chào Bán Công Nghệ")).toBeInTheDocument();
      expect(screen.getByText("Nhu Cầu Công Nghệ")).toBeInTheDocument();

      // Verify human-readable province names
      expect(screen.getAllByText("Sở KH&CN TP. Hà Nội").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Sở KH&CN TP. Hải Phòng").length).toBeGreaterThanOrEqual(1);

      // Select row to inspect detail drawer
      fireEvent.click(screen.getByText("Đặng Tiến Lượng"));

      // Verify detail drawer header uses resolved type name
      expect(screen.getByText(/Thẩm định Chuyên Gia KH&CN/i)).toBeInTheDocument();
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

  describe("T098 [QC-Verification-V7] Master Grid, Slide-over Drawer & Segmented Filter", () => {
    it("renders friendly #HS-XXXXXX record codes and Thẩm Định action buttons in Master Grid", async () => {
      render(<AdminApprovalsPage />);
      await screen.findByText("Đặng Tiến Lượng");

      // Verify friendly record code exists (#HS-1 for id="1")
      expect(screen.getByText("#HS-1")).toBeInTheDocument();
      expect(screen.getAllByText(/#HS-/).length).toBeGreaterThanOrEqual(1);

      // Verify Thẩm Định action buttons are rendered
      const thamDinhBtns = screen.getAllByRole("button", { name: /Thẩm Định/i });
      expect(thamDinhBtns.length).toBeGreaterThanOrEqual(1);
    });

    it("renders enterprise review block with tax code and legal representative for enterprise records", async () => {
      render(<AdminApprovalsPage />);
      await screen.findByText("Công ty Cổ phần Công nghệ Sinh học Vinabiom");

      // Click on enterprise record to inspect drawer
      fireEvent.click(screen.getByText("Công ty Cổ phần Công nghệ Sinh học Vinabiom"));

      // Verify enterprise review block
      expect(screen.getByText(/Hồ Sơ Doanh Nghiệp ĐMST & Tính Pháp Lý/i)).toBeInTheDocument();
      expect(screen.getByText("0108992134")).toBeInTheDocument();
      expect(screen.getByText("Vốn điều lệ:")).toBeInTheDocument();
      expect(screen.getByText("Hồ sơ Hội viên BACLINK:")).toBeInTheDocument();
    });
  });
});
