import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi, describe, expect, it, beforeEach, afterEach } from "vitest";
import type { ReactNode } from "react";
import BuyerConsultationsPage from "./page";
import { authClient } from "@/lib/auth-client";
import { BuyerConsultationTicket } from "@/services/api/buyer-consultations";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/components/auth/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock("@/components/common/toast", () => ({
  useToast: () => ({
    success: mockToastSuccess,
    error: mockToastError,
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

const mockBuyerTickets: BuyerConsultationTicket[] = [
  {
    id: "con-1",
    ticketCode: "REQ-CON-2026-000001",
    expertCode: "CG-NACEN-00000001",
    expertName: "PGS.TS. Trần Văn Hùng",
    demandTitle: "Tư vấn thiết kế vi mạch bán dẫn",
    description: "Cần thẩm định bản vẽ layout vi mạch",
    status: "PENDING",
    requestedAt: "2026-11-10T08:00:00Z",
  },
  {
    id: "con-2",
    ticketCode: "REQ-CON-2026-000002",
    expertCode: "CG-NACEN-00000002",
    expertName: "GS.TS. Nguyễn Văn Tuấn",
    demandTitle: "Thẩm định dây chuyền chiết rót",
    status: "SCHEDULED",
    scheduledAt: "2026-11-15T14:00:00Z",
    meetingDate: "15/11/2026",
    meetingTime: "14:00 - 16:00",
    meetingType: "Trực tuyến qua Zoom",
    meetingLink: "https://zoom.us/j/123456789",
    meetingUrl: "https://zoom.us/j/123456789",
    expertNote: "Vui lòng chuẩn bị trước bản vẽ sơ đồ khối",
    requestedAt: "2026-11-09T08:00:00Z",
  },
  {
    id: "con-3",
    ticketCode: "REQ-CON-2026-000003",
    expertCode: "CG-NACEN-00000003",
    expertName: "TS. Lê Hoàng Mai",
    demandTitle: "Tư vấn chuyển đổi số nhà máy",
    status: "REJECTED",
    rejectionReason: "Lĩnh vực này không thuộc chuyên môn hẹp của tôi.",
    requestedAt: "2026-11-08T08:00:00Z",
  },
  {
    id: "con-4",
    ticketCode: "REQ-CON-2026-000004",
    expertCode: "CG-NACEN-00000001",
    expertName: "PGS.TS. Trần Văn Hùng",
    demandTitle: "Khảo sát thực địa phòng sạch",
    status: "COMPLETED",
    completedAt: "2026-11-12T10:00:00Z",
    scheduledAt: "2026-11-12T09:00:00Z",
    meetingDate: "12/11/2026",
    rating: null,
    reviewComment: null,
    requestedAt: "2026-11-05T08:00:00Z",
  },
];

describe("BuyerConsultationsPage (UI-CON-003, REQ-CON-003, TEST-CON-001)", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    localStorage.clear();
    authClient.setSession("buyer-token", {
      id: "u-buyer-1",
      email: "buyer@company.vn",
      fullName: "Đại diện Doanh nghiệp Mua",
      role: "BUYER",
    });

    vi.spyOn(global, "fetch").mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method?.toUpperCase() || "GET";

      if (url.includes("/review") && method === "POST") {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { id: "con-4", ticketCode: "REQ-CON-2026-000004", rating: 5, message: "OK" },
          }),
        } as Response;
      }

      if (url.includes("/api/v1/portal/buyer/consultations")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: mockBuyerTickets,
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

  it("renders page header and loads list of consultations with 5 UX states", async () => {
    render(<BuyerConsultationsPage />);

    expect(screen.getByText("Yêu Cầu Tư Vấn & Kết Nối Chuyên Gia")).toBeInTheDocument();
    expect(screen.getByText(/Theo dõi tiến trình phản hồi 2 chiều/i)).toBeInTheDocument();

    // Verify tickets rendered
    expect(await screen.findByText("REQ-CON-2026-000001")).toBeInTheDocument();
    expect(screen.getByText("Tư vấn thiết kế vi mạch bán dẫn")).toBeInTheDocument();
    expect(screen.getAllByText("PGS.TS. Trần Văn Hùng").length).toBeGreaterThanOrEqual(1);
  });

  it("displays meeting details and link for SCHEDULED consultation", async () => {
    render(<BuyerConsultationsPage />);

    expect(await screen.findByText("REQ-CON-2026-000002")).toBeInTheDocument();
    expect(screen.getByText("Thẩm định dây chuyền chiết rót")).toBeInTheDocument();
    expect(screen.getByText("Vào Phòng Họp").closest("a")).toHaveAttribute("href", "https://zoom.us/j/123456789");
    expect(screen.getByText(/Vui lòng chuẩn bị trước bản vẽ sơ đồ khối/)).toBeInTheDocument();
  });

  it("displays rejection reason for REJECTED consultation", async () => {
    render(<BuyerConsultationsPage />);

    expect(await screen.findByText("REQ-CON-2026-000003")).toBeInTheDocument();
    expect(screen.getByText(/Lĩnh vực này không thuộc chuyên môn hẹp của tôi/)).toBeInTheDocument();
  });

  it("opens review modal on COMPLETED consultation and submits 5-star rating", async () => {
    render(<BuyerConsultationsPage />);

    expect(await screen.findByText("REQ-CON-2026-000004")).toBeInTheDocument();

    const reviewBtn = screen.getByTestId("btn-review-REQ-CON-2026-000004");
    fireEvent.click(reviewBtn);

    // Modal opens
    expect(screen.getByText("Đánh Giá Buổi Tư Vấn")).toBeInTheDocument();

    // Enter review comment
    const commentInput = screen.getByPlaceholderText(/Chia sẻ cảm nhận về giải pháp kỹ thuật/i);
    fireEvent.change(commentInput, { target: { value: "Chuyên gia tư vấn rất nhiệt tình và chuyên sâu!" } });

    // Submit review
    const submitBtn = screen.getByTestId("btn-submit-review");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Cảm ơn bạn đã gửi đánh giá buổi tư vấn!",
        "Thành Công"
      );
    });
  });

  it("displays clean empty state when user has 0 consultations", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async () => {
      return {
        ok: true,
        json: async () => ({ success: true, data: [] }),
      } as Response;
    });

    render(<BuyerConsultationsPage />);

    expect(await screen.findByText("Bạn chưa gửi yêu cầu tư vấn nào")).toBeInTheDocument();
    expect(screen.getByText("Xem danh bạ chuyên gia").closest("a")).toHaveAttribute("href", "/experts");
  });
});
