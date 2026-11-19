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

    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    authClient.setSession("test-token", {
      id: "gov-user-1",
      email: "lanhdao@hanoi.gov.vn",
      fullName: "Trần Văn Lãnh Đạo",
      role: "PROVINCIAL_ADMIN",
      scopeId: "HN",
      organizationName: "Sở KH&CN Hà Nội",
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/v1/approvals") || url.includes("/api/v1/governance/approvals")) {
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
      expect(screen.getByText("Lọc theo ngành công nghiệp")).toBeInTheDocument();
    });
  });

  it("displays both 'Xem Chi Tiết' and 'Thẩm Định' action buttons and opens full dossier modal", async () => {
    render(<GovApprovalQueue />);

    await waitFor(() => {
      expect(screen.getByText("TS. Nguyễn Minh Triết")).toBeInTheDocument();
    });

    // Check presence of both buttons
    const detailBtns = screen.getAllByRole("button", { name: /Xem Chi Tiết/i });
    expect(detailBtns.length).toBeGreaterThan(0);

    const reviewBtns = screen.getAllByRole("button", { name: /Thẩm Định/i });
    expect(reviewBtns.length).toBeGreaterThan(0);

    // Click 'Xem Chi Tiết' for the expert item
    const expertDetailBtn = screen.getByTestId("btn-detail-appr-exp-001");
    expect(expertDetailBtn).toBeInTheDocument();
    fireEvent.click(expertDetailBtn);

    // Verify Dossier Detail Modal opens
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Hồ Sơ Chuyên Gia Cố Vấn: TS. Nguyễn Minh Triết")).toBeInTheDocument();
      expect(screen.getAllByText("Đại học Quốc gia Hà Nội").length).toBeGreaterThan(0);
      expect(screen.getByText(/Chuyên gia AI và xử lý ngôn ngữ tự nhiên/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Tiến Hành Phê Duyệt Hồ Sơ/i })).toBeInTheDocument();
    });

    // Click forward to review
    const forwardBtn = screen.getByTestId("btn-forward-to-review");
    fireEvent.click(forwardBtn);

    // Verify Review Modal opens
    await waitFor(() => {
      expect(screen.getByText("Thẩm Định Hồ Sơ Chuyên Gia: TS. Nguyễn Minh Triết")).toBeInTheDocument();
      expect(screen.getByText(/Quyết Định Phê Duyệt Của Ban Thư Ký BACLINK/i)).toBeInTheDocument();
    });
  });

  it("reproduces bug: rejects or requests changes without >= 10 chars must show toast error, scroll/focus, and block submission", async () => {
    const fetchMock = global.fetch as any;
    render(<GovApprovalQueue />);

    await waitFor(() => {
      expect(screen.getByText("TS. Nguyễn Minh Triết")).toBeInTheDocument();
    });

    // Bấm nút thẩm định ngoài danh sách
    const reviewBtn = screen.getByTestId("btn-review-appr-exp-001");
    expect(reviewBtn).toHaveTextContent("Thẩm Định");
    fireEvent.click(reviewBtn);

    // Modal thẩm định mở ra
    await waitFor(() => {
      expect(screen.getByText("Thẩm Định Hồ Sơ Chuyên Gia: TS. Nguyễn Minh Triết")).toBeInTheDocument();
    });

    // Chọn "Từ Chối Hồ Sơ"
    const rejectBtn = screen.getByRole("button", { name: /Từ Chối Hồ Sơ/i });
    fireEvent.click(rejectBtn);

    // Kiểm tra ô textarea nhập lý do xuất hiện
    const textarea = screen.getByPlaceholderText(/Nhập lý do cụ thể/i) as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();

    // Reset fetchMock calls count để kiểm tra không bị gọi nhầm
    fetchMock.mockClear();

    // Bấm "Xác Nhận Quyết Định" khi chưa nhập lý do (< 10 ký tự)
    const submitBtn = screen.getByRole("button", { name: /Xác Nhận Quyết Định/i });
    fireEvent.click(submitBtn);

    // Phải hiển thị toast thông báo lỗi rõ ràng theo BR-ADM-004
    await waitFor(() => {
      expect(screen.getByText("Vui lòng nhập lý do quyết định có ít nhất 10 ký tự theo Quy tắc BR-ADM-004.")).toBeInTheDocument();
      expect(screen.getByText("Lý do xử lý bắt buộc phải có ít nhất 10 ký tự hợp lệ theo Quy tắc BR-ADM-004.")).toBeInTheDocument();
    });

    // Cuộn tới và focus vào ô textarea
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
    expect(document.activeElement).toBe(textarea);

    // fetch không được gửi đi khi validate thất bại
    expect(fetchMock).not.toHaveBeenCalled();

    // Nhập nội dung < 10 ký tự
    fireEvent.change(textarea, { target: { value: "Từ chối" } });
    fireEvent.click(submitBtn);

    // Vẫn bị chặn và báo toast
    await waitFor(() => {
      expect(screen.getByText("Vui lòng nhập lý do quyết định có ít nhất 10 ký tự theo Quy tắc BR-ADM-004.")).toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalled();

    // Nhập hợp lệ >= 10 ký tự
    fireEvent.change(textarea, { target: { value: "Hồ sơ không đáp ứng đủ điều kiện theo quy định của Sở." } });
    fireEvent.click(submitBtn);

    // Lần này fetch phải được gọi với action REJECT và lý do đầy đủ
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/governance/approvals/appr-exp-001/review"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({
            action: "REJECT",
            expectedVersion: 1,
            reviewNote: "Hồ sơ không đáp ứng đủ điều kiện theo quy định của Sở.",
          }),
        })
      );
    });
  });

  it("handles 'Yêu Cầu Bổ Sung' with validation and successful submission", async () => {
    const fetchMock = global.fetch as any;
    render(<GovApprovalQueue />);

    await waitFor(() => {
      expect(screen.getByText("TS. Nguyễn Minh Triết")).toBeInTheDocument();
    });

    const reviewBtn = screen.getByTestId("btn-review-appr-exp-001");
    fireEvent.click(reviewBtn);

    await waitFor(() => {
      expect(screen.getByText("Thẩm Định Hồ Sơ Chuyên Gia: TS. Nguyễn Minh Triết")).toBeInTheDocument();
    });

    // Chọn "Yêu Cầu Bổ Sung"
    const reqChangesBtn = screen.getByRole("button", { name: /Yêu Cầu Bổ Sung/i });
    fireEvent.click(reqChangesBtn);

    const textarea = screen.getByPlaceholderText(/Nhập lý do cụ thể/i);
    expect(textarea).toBeInTheDocument();

    fetchMock.mockClear();
    const submitBtn = screen.getByRole("button", { name: /Xác Nhận Quyết Định/i });
    fireEvent.click(submitBtn);

    // Bị chặn vì thiếu lý do
    await waitFor(() => {
      expect(screen.getByText("Vui lòng nhập lý do quyết định có ít nhất 10 ký tự theo Quy tắc BR-ADM-004.")).toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalled();

    // Nhập đủ >= 10 ký tự
    fireEvent.change(textarea, { target: { value: "Đề nghị bổ sung thêm bản sao bằng cấp tiến sĩ có công chứng." } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/governance/approvals/appr-exp-001/review"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({
            action: "REQUEST_CHANGES",
            expectedVersion: 1,
            reviewNote: "Đề nghị bổ sung thêm bản sao bằng cấp tiến sĩ có công chứng.",
          }),
        })
      );
    });
  });

  it("UI-GOV-EVIDENCE-INSPECTOR renders full documents list and allows opening TRL methodology modal", async () => {
    render(<GovApprovalQueue />);

    await waitFor(() => {
      expect(screen.getByText("Hệ thống AI IoT Giám sát Chất lượng Nước nuôi Tôm")).toBeInTheDocument();
    });

    // Mở modal thẩm định chào bán
    const offerItem = screen.getByText("Hệ thống AI IoT Giám sát Chất lượng Nước nuôi Tôm");
    fireEvent.click(offerItem);

    await waitFor(() => {
      expect(screen.getByText(/Thẩm Định Sản Phẩm Chào Bán/i)).toBeInTheDocument();
      expect(screen.getByText(/Hồ Sơ Minh Chứng Kỹ Thuật & Văn Bằng SHTT/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Đối chiếu Tiêu chuẩn Minh chứng TRL/i })).toBeInTheDocument();
    });

    // Bấm mở modal phương pháp luận TRL
    const openTrlModalBtn = screen.getByRole("button", { name: /Đối chiếu Tiêu chuẩn Minh chứng TRL/i });
    fireEvent.click(openTrlModalBtn);

    await waitFor(() => {
      expect(screen.getByText(/Phương Pháp Luận Cấp Độ Sẵn Sàng Công Nghệ/i)).toBeInTheDocument();
      expect(screen.getAllByText(/NASA TRL/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Khung Tiêu Chuẩn Kỹ Thuật Công Nghiệp Quốc Tế/i)).toBeInTheDocument();
    });
  });

  it("Decoupled Two-Tier review displays Block B when approving Offer and calls reviewOffer with verified authority & decisions", async () => {
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    render(<GovApprovalQueue />);

    await waitFor(() => {
      expect(screen.getByText("Hệ thống AI IoT Giám sát Chất lượng Nước nuôi Tôm")).toBeInTheDocument();
    });

    const offerItem = screen.getByText("Hệ thống AI IoT Giám sát Chất lượng Nước nuôi Tôm");
    fireEvent.click(offerItem);

    await waitFor(() => {
      expect(screen.getByText(/Quyết Định Niêm Yết Lên Sàn Giao Dịch/i)).toBeInTheDocument();
    });

    // Trước khi chọn APPROVE, Khối B chưa hiển thị
    expect(screen.queryByText(/Thẩm Định Chỉ Số Chuyên Môn TRL & SHTT/i)).not.toBeInTheDocument();

    // Chọn Khối A: Phê Duyệt Niêm Yết Sàn
    const approveBtn = screen.getByRole("button", { name: /Phê Duyệt Niêm Yết Sàn/i });
    fireEvent.click(approveBtn);

    // Khối B xuất hiện
    await waitFor(() => {
      expect(screen.getByText(/Thẩm Định Chỉ Số Chuyên Môn TRL & SHTT/i)).toBeInTheDocument();
      expect(screen.getByText(/Xác thực TRL Nhà nước/i)).toBeInTheDocument();
      expect(screen.getByText(/Xác thực SHTT Nhà nước/i)).toBeInTheDocument();
    });

    // Bấm Xác Nhận Quyết Định
    const confirmBtn = screen.getByRole("button", { name: /Xác Nhận Quyết Định/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/portal/seller/technologies/c25347fc-tech-offer-001/review"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: expect.stringContaining('"action":"APPROVE"'),
        })
      );
    });
  });
});
