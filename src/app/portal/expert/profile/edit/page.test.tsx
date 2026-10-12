import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi, describe, expect, it, beforeEach } from "vitest";
import type { ReactNode } from "react";
import ExpertProfileEditPage from "./page";
import { authClient } from "@/lib/auth-client";
import * as expertApi from "@/lib/expert-detail";
import * as masterDataApi from "@/lib/master-data-client";

vi.mock("next/link", () => ({ default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const mockPublicProfile = {
  expertCode: "CG-NACEN-DEMO01",
  fullName: "GS.TS. Nguyễn Văn Tuấn",
  academicRank: "GS",
  degree: "DOCTOR",
  birthYear: 1975,
  gender: "male",
  organizationName: "Viện Cơ học & Tự động hóa",
  positionTitle: "Trưởng phòng Thí nghiệm",
  publicBio: "Chuyên gia về Robot công nghiệp.",
  expertiseSectors: ["LV01"],
  specializedKeywords: ["Robot Delta", "Xử lý ảnh công nghiệp"],
  masteredTechCodes: ["CN01"],
  isVerified: true,
  isAcceptingConsultation: true,
  training: [],
  employment: [],
  patents: [],
  researchProjects: [],
  publications: [
    { type: "PUBLICATION", title: "Real-time Vision-guided High-speed Delta Robot", meta: "IEEE 2024", description: "First Author" },
  ],
  practicalProjects: [],
  awards: [],
};

const mockPrivateDetail = {
  publicProfile: mockPublicProfile,
  phone: "0912345678",
  email: "tuan.nv@nacentech.vn",
  organizationAddress: "18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội",
  pdpdConsent: true,
  legalOath: true,
  status: "APPROVED",
  activeDocumentTypes: ["DEGREE", "ID_CARD"],
};

const mockCompleteness = {
  score: 80,
  grade: "GOOD",
  completedCriteria: ["Định danh & Cam kết pháp lý", "Học vị & Cơ quan", "Lĩnh vực TT17", "Thành tựu KH&CN"],
  missingCriteria: ["Chưa bật nhận lời mời tư vấn"],
  suggestions: ["Bổ sung tóm tắt tiểu sử và bật sẵn sàng nhận tư vấn"],
};

describe("ExpertProfileEditPage", () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();
    vi.spyOn(masterDataApi, "getActiveSectors").mockResolvedValue([
      { code: "LV01", name: "Cơ khí chế tạo & Tự động hóa" },
      { code: "LV07", name: "Công nghệ thông tin & Trí tuệ nhân tạo" },
    ]);
  });

  it("shows error state when user is not VERIFIED_EXPERT (RoleGuard check)", async () => {
    authClient.setSession("token-buyer", { id: "p1", email: "user@test.vn", fullName: "User Buyer", role: "BUYER" });
    render(<ExpertProfileEditPage />);

    expect(await screen.findByText(/Chỉ tài khoản Chuyên gia đã xác thực/i)).toBeInTheDocument();
  });

  it("renders edit form and completeness score when user is VERIFIED_EXPERT", async () => {
    authClient.setSession("token-expert", { id: "p1", email: "expert@test.vn", fullName: "GS.TS. Nguyễn Văn Tuấn", role: "VERIFIED_EXPERT" });
    vi.spyOn(expertApi, "getMyExpertDetail").mockResolvedValue(mockPrivateDetail);
    vi.spyOn(expertApi, "getMyExpertCompleteness").mockResolvedValue(mockCompleteness);

    render(<ExpertProfileEditPage />);

    expect(await screen.findByText("CHỈNH SỬA HỒ SƠ CHUYÊN GIA")).toBeInTheDocument();
    expect(screen.getByText("VERIFIED EXPERT")).toBeInTheDocument();
    expect(screen.getByText(/Điểm hoàn thiện:/i)).toBeInTheDocument();
    expect(screen.getByText("80/100")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Viện Cơ học & Tự động hóa")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Robot Delta, Xử lý ảnh công nghiệp")).toBeInTheDocument();
  });

  it("submits updated profile and shows success feedback", async () => {
    authClient.setSession("token-expert", { id: "p1", email: "expert@test.vn", fullName: "GS.TS. Nguyễn Văn Tuấn", role: "VERIFIED_EXPERT" });
    vi.spyOn(expertApi, "getMyExpertDetail").mockResolvedValue(mockPrivateDetail);
    vi.spyOn(expertApi, "getMyExpertCompleteness").mockResolvedValue(mockCompleteness);
    const updateSpy = vi.spyOn(expertApi, "updateMyExpertProfile").mockResolvedValue({} as any);

    render(<ExpertProfileEditPage />);

    expect(await screen.findByDisplayValue("Viện Cơ học & Tự động hóa")).toBeInTheDocument();

    const orgInput = screen.getByDisplayValue("Viện Cơ học & Tự động hóa");
    fireEvent.change(orgInput, { target: { value: "Viện Cơ học & Tự động hóa Mới" } });

    const saveButtons = screen.getAllByText("Lưu Thay Đổi Hồ Sơ");
    fireEvent.click(saveButtons[0]);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationName: "Viện Cơ học & Tự động hóa Mới",
        })
      );
    });

    expect(await screen.findByText(/Đã cập nhật thành công hồ sơ Chuyên gia/i)).toBeInTheDocument();
  });

  it("locks form and disables save button when status is PENDING_REVIEW", async () => {
    authClient.setSession("token-expert", { id: "p1", email: "expert@test.vn", fullName: "GS.TS. Nguyễn Văn Tuấn", role: "VERIFIED_EXPERT" });
    vi.spyOn(expertApi, "getMyExpertDetail").mockResolvedValue({
      ...mockPrivateDetail,
      status: "PENDING_REVIEW",
    });
    vi.spyOn(expertApi, "getMyExpertCompleteness").mockResolvedValue(mockCompleteness);

    render(<ExpertProfileEditPage />);

    expect(await screen.findByText(/Hồ sơ đang trong quá trình thẩm định \(SLA: tối đa 48 giờ làm việc\), không thể chỉnh sửa\./i)).toBeInTheDocument();
    const saveButtons = screen.getAllByRole("button", { name: /Lưu Thay Đổi Hồ Sơ|Lưu Toàn Bộ Hồ Sơ/i });
    saveButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
