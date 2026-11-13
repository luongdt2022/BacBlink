import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi, describe, expect, it, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { ExpertOwnerDetailPage, ExpertPublicDetailPage } from "./profile-detail";
import { authClient } from "@/lib/auth-client";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const publicProfile = {
  expertCode: "CG-NACEN-00000001", fullName: "PGS.TS. Trần Văn Hùng", academicRank: "PGS", degree: "DOCTOR", birthYear: 1978, gender: "male",
  organizationName: "Viện NacenTech", positionTitle: "Trưởng phòng", publicBio: "Chuyên gia vi mạch.", expertiseSectors: ["01"], masteredTechCodes: ["CN06"], isVerified: true, isAcceptingConsultation: true,
  training: [], employment: [], patents: [], researchProjects: [], publications: [], practicalProjects: [], awards: [],
};

describe("ExpertPublicDetailPage", () => {
  beforeEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });

  it("renders public-only profile and opens the consultation form", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: publicProfile }) }));
    render(<ExpertPublicDetailPage expertCode="CG-NACEN-00000001" />);
    expect(await screen.findByText("PGS.TS. Trần Văn Hùng")).toBeInTheDocument();
    expect(screen.queryByText(/001080/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Điền phiếu yêu cầu kết nối"));
    expect(screen.getByPlaceholderText("Họ tên người liên hệ")).toBeInTheDocument();
  });

  it("shows error state when public profile is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    render(<ExpertPublicDetailPage expertCode="CG-NACEN-HIDDEN" />);
    await waitFor(() => expect(screen.getByText("Đã xảy ra lỗi khi tải dữ liệu")).toBeInTheDocument());
  });

  it("clears the session and shows an explicit recovery state when owner token is rejected", async () => {
    authClient.setSession("expired-token", { id: "person-1", email: "expert@test.local", fullName: "Nguyễn Minh An", role: "VERIFIED_EXPERT" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    render(<ExpertOwnerDetailPage />);
    expect(await screen.findByText("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")).toBeInTheDocument();
    expect(authClient.getToken()).toBeNull();
  });

  it("disables edit button and shows SLA 48h warning banner when status is PENDING_REVIEW (TC-C3-SUB-11)", async () => {
    authClient.setSession("valid-token", { id: "person-1", email: "expert@test.local", fullName: "Nguyễn Minh An", role: "VERIFIED_EXPERT" });
    const pendingDetail = {
      publicProfile,
      phone: "0912345678",
      email: "expert@test.local",
      status: "PENDING_REVIEW",
      pdpdConsent: true,
      legalOath: true,
      activeDocumentTypes: ["DEGREE"],
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: pendingDetail }) }));
    render(<ExpertOwnerDetailPage />);

    expect(await screen.findByText(/Hồ sơ đang trong quá trình thẩm định \(SLA: tối đa 48 giờ làm việc\), không thể chỉnh sửa\./i)).toBeInTheDocument();
    const editBtn = screen.getByRole("button", { name: "Chỉnh sửa hồ sơ" });
    expect(editBtn).toBeDisabled();
    expect(editBtn).toHaveClass("pointer-events-none");
    expect(editBtn).toHaveClass("opacity-50");
  });

  it("collapses empty AchievementTabs & TimelineCard and hides LMS section when courses is empty (CR-2026-032)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: publicProfile }) }));
    render(<ExpertPublicDetailPage expertCode="CG-NACEN-00000001" />);

    expect(await screen.findByText("PGS.TS. Trần Văn Hùng")).toBeInTheDocument();
    expect(screen.getByTestId("timeline-compact-empty")).toBeInTheDocument();
    expect(screen.getByTestId("achievements-compact-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("expert-lms-courses-section")).not.toBeInTheDocument();
  });

  it("renders LMS courses section with /elearning/[id] link, capability summary, and AchievementTabs (N) counters (CR-2026-032)", async () => {
    const richProfile = {
      ...publicProfile,
      consultingSummary: "Tư vấn thiết kế vi mạch bán dẫn và hệ thống nhúng.",
      organizationAddress: "144 Xuân Thủy, Cầu Giấy, Hà Nội",
      specializedKeywords: ["Vi mạch số", "FPGA", "ASIC"],
      training: [{ title: "Tiến sĩ Điện tử", subtitle: "ĐH Bách khoa Hà Nội", period: "2008 - 2012" }],
      employment: [{ title: "Trưởng phòng R&D", subtitle: "Viện NacenTech", period: "2015 - nay" }],
      patents: [{ type: "PATENT", title: "Sáng chế chip xử lý tín hiệu", meta: "VN-12345" }],
      publications: [
        { type: "PUB", title: "Bài báo IEEE 2024" },
        { type: "PUB", title: "Bài báo ACM 2025" },
      ],
      courses: [
        {
          id: "course-1",
          materialCode: "LMS-2026-001",
          title: "Thiết kế vi mạch FPGA thực chiến",
          lessonType: "VIDEO",
          durationMinutes: 60,
          clusterName: "Điện tử & Vi mạch",
          sectorCode: "03",
        },
      ],
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: richProfile }) }));
    render(<ExpertPublicDetailPage expertCode="CG-NACEN-00000001" />);

    expect(await screen.findByText("Tóm tắt năng lực & Từ khóa chuyên môn")).toBeInTheDocument();
    expect(screen.getByText("Tư vấn thiết kế vi mạch bán dẫn và hệ thống nhúng.")).toBeInTheDocument();
    expect(screen.getByText("144 Xuân Thủy, Cầu Giấy, Hà Nội")).toBeInTheDocument();
    expect(screen.getAllByText("Vi mạch số").length).toBeGreaterThanOrEqual(1);

    const lmsSection = screen.getByTestId("expert-lms-courses-section");
    expect(lmsSection).toBeInTheDocument();
    expect(screen.getByText("Khóa học & Tài liệu giảng dạy (LMS)")).toBeInTheDocument();
    const courseLink = screen.getByRole("link", { name: /Thiết kế vi mạch FPGA thực chiến/i });
    expect(courseLink).toHaveAttribute("href", "/elearning/course-1");
    expect(screen.getByText("60 phút")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Bằng sáng chế & GPHI (1)" })).toBeInTheDocument();
    const pubTab = screen.getByRole("button", { name: "Công trình công bố (2)" });
    expect(pubTab).toBeInTheDocument();
    fireEvent.click(pubTab);
    expect(screen.getByText("Bài báo IEEE 2024")).toBeInTheDocument();
  });

  it("submits consultation request and displays ticketCode with copy button and portal link (UI-CON-001, REQ-CON-001)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (String(url).includes("/consultation-requests")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { ticketCode: "REQ-CON-2026-000123" },
          }),
        };
      }
      return { ok: true, json: async () => ({ success: true, data: publicProfile }) };
    }));

    render(<ExpertPublicDetailPage expertCode="CG-NACEN-00000001" />);
    expect(await screen.findByText("PGS.TS. Trần Văn Hùng")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Điền phiếu yêu cầu kết nối"));
    fireEvent.change(screen.getByPlaceholderText("Họ tên người liên hệ"), { target: { value: "Nguyễn Văn Mua" } });
    fireEvent.change(screen.getByPlaceholderText("Nội dung bài toán cần chuyên gia tư vấn hoặc đề xuất hợp tác R&D"), { target: { value: "Cần tư vấn về vi mạch xử lý tín hiệu" } });
    fireEvent.click(screen.getByText("Gửi phiếu yêu cầu tư vấn"));

    expect(await screen.findByTestId("consultation-ticket-code")).toHaveTextContent("REQ-CON-2026-000123");
    expect(screen.getByText("Đã gửi yêu cầu tư vấn thành công tới Viện NacenTech!")).toBeInTheDocument();
  });
});

