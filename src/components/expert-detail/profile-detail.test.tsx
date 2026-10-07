import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi, describe, expect, it, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { ExpertOwnerDetailPage, ExpertPublicDetailPage } from "./profile-detail";
import { authClient } from "@/lib/auth-client";

vi.mock("next/link", () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));

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
});

