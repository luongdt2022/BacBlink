import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi, describe, expect, it, beforeEach, afterEach } from "vitest";
import type { ReactNode } from "react";
import ExpertConsultationsPage from "./page";
import { authClient } from "@/lib/auth-client";
import {
  INITIAL_PENDING_CONSULTATIONS,
  INITIAL_SCHEDULED_CONSULTATIONS,
  INITIAL_COMPLETED_CONSULTATIONS,
} from "@/lib/consultations";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/auth/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockToastWarning = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
const mockToastInfo = vi.fn();
vi.mock("@/components/common/toast", () => ({
  useToast: () => ({
    warning: mockToastWarning,
    error: mockToastError,
    success: mockToastSuccess,
    info: mockToastInfo,
  }),
}));

const mockConsultationTickets = [
  ...INITIAL_PENDING_CONSULTATIONS,
  ...INITIAL_SCHEDULED_CONSULTATIONS,
  ...INITIAL_COMPLETED_CONSULTATIONS,
];

describe("ExpertConsultationsPage (T132 & T135 & T164)", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    localStorage.clear();

    vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method?.toUpperCase() || "GET";

      if (
        (url.includes("/api/v1/experts/me/consultations") || url.includes("/api/v1/portal/expert/consultations")) &&
        (method === "POST" || method === "PATCH")
      ) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { id: "REQ-CON-2026-081", status: "SCHEDULED", message: "OK" },
          }),
        } as Response;
      }

      if (url.includes("/api/v1/experts/me/consultations") || url.includes("/api/v1/portal/expert/consultations")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: mockConsultationTickets,
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

  it("renders 3 tabs and Tab 1 pending invitations with SLA countdown", async () => {
    authClient.setSession("token-verified", {
      id: "u-exp-1",
      email: "tuan.nv@baclink.org.vn",
      fullName: "GS.TS. Nguyễn Văn Tuấn",
      role: "VERIFIED_EXPERT",
    });

    render(<ExpertConsultationsPage />);

    expect(screen.getByText("HỘP THƯ TƯ VẤN & KẾT NỐI")).toBeInTheDocument();
    expect(screen.getByText("EXPERT INBOX")).toBeInTheDocument();

    // Verify 3 tabs
    expect(screen.getByTestId("tab-btn-pending")).toBeInTheDocument();
    expect(screen.getByTestId("tab-btn-scheduled")).toBeInTheDocument();
    expect(screen.getByTestId("tab-btn-completed")).toBeInTheDocument();

    // Tab 1 contains invitations loaded from API
    expect(
      await screen.findByText("Tư Vấn Thẩm Định Công Nghệ Nâng Cấp Dây Chuyền Chiết Rót Tự Động Hóa Chuẩn GMP")
    ).toBeInTheDocument();
    expect(screen.getByText("Mã Đơn: REQ-CON-2026-081")).toBeInTheDocument();

    // SLA <= 24h shows warning text
    expect(screen.getByText("Còn 18 giờ để phản hồi")).toBeInTheDocument();

    // Dept assigned badge
    expect(screen.getAllByText(/Ban Cố vấn Kỹ thuật BACLINK Chỉ Định Kết Nối 1-1/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Quỹ Phát triển Công nghiệp BACLINK chi trả/i).length).toBeGreaterThan(0);

    // TNI Score
    expect(screen.getByText("86.4 điểm")).toBeInTheDocument();
  });

  it("switches to Tab 2 (Lịch Hẹn Sắp Tới) and displays meeting info and join condition", async () => {
    authClient.setSession("token-verified", {
      id: "u-exp-1",
      email: "tuan.nv@baclink.org.vn",
      fullName: "GS.TS. Nguyễn Văn Tuấn",
      role: "VERIFIED_EXPERT",
    });

    render(<ExpertConsultationsPage />);

    await screen.findByText("Tư Vấn Thẩm Định Công Nghệ Nâng Cấp Dây Chuyền Chiết Rót Tự Động Hóa Chuẩn GMP");

    fireEvent.click(screen.getByTestId("tab-btn-scheduled"));

    expect(screen.getByText(/Phiên Tư Vấn Đã Chốt Lịch Trực Tuyến/i)).toBeInTheDocument();
    expect(
      screen.getByText("Họp Thẩm Định Sơ Bộ Với Công Ty CP Robot Rạng Đông")
    ).toBeInTheDocument();

    // Button disabled when > 15 minutes
    expect(screen.getByText("Sẽ mở trước giờ họp 15 phút")).toBeInTheDocument();

    // Pre-read materials
    expect(screen.getByText("Ban_ve_mat_bang_nha_xuong_kho_van.pdf")).toBeInTheDocument();
  });

  it("switches to Tab 3 (Đã Hoàn Thành) and displays MoA and disbursement status", async () => {
    authClient.setSession("token-verified", {
      id: "u-exp-1",
      email: "tuan.nv@baclink.org.vn",
      fullName: "GS.TS. Nguyễn Văn Tuấn",
      role: "VERIFIED_EXPERT",
    });

    render(<ExpertConsultationsPage />);

    await screen.findByText("Tư Vấn Thẩm Định Công Nghệ Nâng Cấp Dây Chuyền Chiết Rót Tự Động Hóa Chuẩn GMP");

    fireEvent.click(screen.getByTestId("tab-btn-completed"));

    expect(screen.getByText(/Lịch Sử Tư Vấn Đã Nghiệm Thu Biên Bản/i)).toBeInTheDocument();
    expect(screen.getByText(/ĐÃ QUYẾT TOÁN THÙ LAO/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Tải Biên Bản Tư Vấn \(MoA\)/i).length).toBeGreaterThan(0);
  });

  it("opens modal and accepts invitation, moving it to Tab 2", async () => {
    authClient.setSession("token-verified", {
      id: "u-exp-1",
      email: "tuan.nv@baclink.org.vn",
      fullName: "GS.TS. Nguyễn Văn Tuấn",
      role: "VERIFIED_EXPERT",
    });

    render(<ExpertConsultationsPage />);

    await screen.findByText("Tư Vấn Thẩm Định Công Nghệ Nâng Cấp Dây Chuyền Chiết Rót Tự Động Hóa Chuẩn GMP");

    const acceptButtons = screen.getAllByRole("button", { name: /Đồng Ý Tư Vấn & Chọn Lịch Hẹn/i });
    fireEvent.click(acceptButtons[0]);

    // Modal opens
    expect(screen.getByRole("heading", { name: "Đồng Ý Tư Vấn & Chọn Lịch Hẹn" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Ngày làm việc dự kiến \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Khung giờ họp \*/i)).toBeInTheDocument();

    // Confirm acceptance
    fireEvent.click(screen.getByRole("button", { name: /Xác Nhận & Mở Lịch Hẹn/i }));

    // Modal closes
    await waitFor(() => {
      expect(screen.queryByLabelText(/Ngày làm việc dự kiến \*/i)).not.toBeInTheDocument();
    });

    // Switched to Tab 2 verifies newly scheduled item exists
    fireEvent.click(screen.getByTestId("tab-btn-scheduled"));
    expect(
      screen.getByText("Tư Vấn Thẩm Định Công Nghệ Nâng Cấp Dây Chuyền Chiết Rót Tự Động Hóa Chuẩn GMP")
    ).toBeInTheDocument();
  });

  it("opens reject modal and validates minimum 10 characters requirement", async () => {
    authClient.setSession("token-verified", {
      id: "u-exp-1",
      email: "tuan.nv@baclink.org.vn",
      fullName: "GS.TS. Nguyễn Văn Tuấn",
      role: "VERIFIED_EXPERT",
    });

    render(<ExpertConsultationsPage />);

    await screen.findByText("Tư Vấn Thẩm Định Công Nghệ Nâng Cấp Dây Chuyền Chiết Rót Tự Động Hóa Chuẩn GMP");

    const rejectButtons = screen.getAllByRole("button", { name: /Từ Chối & Nêu Lý Do/i });
    fireEvent.click(rejectButtons[0]);

    // Modal opens
    expect(screen.getByText(/Từ Chối Lời Mời Tư Vấn & Nêu Lý Do/i)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Vui lòng nhập tối thiểu 10 ký tự/i);
    const submitBtn = screen.getByRole("button", { name: /Xác Nhận Từ Chối/i });

    // Submit with short reason (< 10 chars)
    fireEvent.change(textarea, { target: { value: "Bận quá" } });
    fireEvent.click(submitBtn);

    // Validation error appears
    expect(
      screen.getByText(/Vui lòng nhập lý do từ chối cụ thể tối thiểu 10 ký tự/i)
    ).toBeInTheDocument();

    // Enter valid reason >= 10 chars
    fireEvent.change(textarea, {
      target: { value: "Trùng lịch công tác tại Hội đồng Thẩm định Quốc gia" },
    });
    fireEvent.click(submitBtn);

    // Modal closes
    await waitFor(() => {
      expect(screen.queryByText(/Từ Chối Lời Mời Tư Vấn & Nêu Lý Do/i)).not.toBeInTheDocument();
    });
  });

  it("displays amber warning banner when role is EXPERT (pending review)", async () => {
    authClient.setSession("token-expert", {
      id: "u-exp-pending",
      email: "candidate@baclink.org.vn",
      fullName: "TS. Ứng Viên Chuyên Gia",
      role: "EXPERT",
    });

    render(<ExpertConsultationsPage />);

    expect(screen.getByText(/Hồ Sơ Đang Chờ Ban Quản Trị BACLINK Phê Duyệt/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Hồ sơ Cố vấn Kỹ thuật của bạn đang trong tiến trình thẩm định tại Hiệp hội BACLINK/i)
    ).toBeInTheDocument();
  });

  it("blocks accepting DEPT_ASSIGNED consultation when role is EXPERT using toast warning without alert()", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    authClient.setSession("token-expert", {
      id: "u-exp-pending",
      email: "candidate@baclink.org.vn",
      fullName: "TS. Ứng Viên Chuyên Gia",
      role: "EXPERT",
    });

    render(<ExpertConsultationsPage />);

    await screen.findByText("Tư Vấn Thẩm Định Công Nghệ Nâng Cấp Dây Chuyền Chiết Rót Tự Động Hóa Chuẩn GMP");

    // Click Đồng ý tư vấn on DEPT_ASSIGNED ticket
    const acceptButtons = screen.getAllByRole("button", { name: /Đồng Ý Tư Vấn & Chọn Lịch Hẹn/i });
    fireEvent.click(acceptButtons[0]);

    // Verify toast warning called instead of alert()
    expect(mockToastWarning).toHaveBeenCalledWith(
      "Hồ sơ Cố vấn Kỹ thuật đang chờ Hiệp hội BACLINK phê duyệt. Chưa thể tiếp nhận yêu cầu ủy thác kết nối.",
      "Chờ Duyệt Hồ Sơ"
    );
    expect(alertSpy).not.toHaveBeenCalled();

    // Verify modal was NOT opened
    expect(screen.queryByRole("heading", { name: "Đồng Ý Tư Vấn & Chọn Lịch Hẹn" })).not.toBeInTheDocument();
  });

  it("allows expert to complete consultation on scheduled tab", async () => {
    authClient.setSession("token-verified", {
      id: "u-exp-1",
      email: "tuan.nv@baclink.org.vn",
      fullName: "GS.TS. Nguyễn Văn Tuấn",
      role: "VERIFIED_EXPERT",
    });

    render(<ExpertConsultationsPage />);
    await screen.findByText("Tư Vấn Thẩm Định Công Nghệ Nâng Cấp Dây Chuyền Chiết Rót Tự Động Hóa Chuẩn GMP");

    const scheduledTab = screen.getByTestId("tab-btn-scheduled");
    fireEvent.click(scheduledTab);

    const completeBtn = await screen.findByTestId("btn-complete-consultation-REQ-CON-2026-068");
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Đã ghi nhận hoàn thành phiên tư vấn!",
        "Thành Công"
      );
    });
  });

  it("displays clean empty state with zero mock when API returns empty list (UI-CON-002)", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      return {
        ok: true,
        json: async () => ({ success: true, data: [] }),
      } as Response;
    });

    render(<ExpertConsultationsPage />);

    expect(await screen.findByText("Hộp thư chờ xử lý hiện đang trống")).toBeInTheDocument();

    // Check Tab 2 empty state
    fireEvent.click(screen.getByTestId("tab-btn-scheduled"));
    expect(screen.getByText("Chưa có lịch hẹn tư vấn nào sắp tới")).toBeInTheDocument();

    // Check Tab 3 empty state
    fireEvent.click(screen.getByTestId("tab-btn-completed"));
    expect(screen.getByText("Chưa có phiên tư vấn nào hoàn thành")).toBeInTheDocument();
  });
});
