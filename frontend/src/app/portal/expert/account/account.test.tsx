import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ORG } from "@/lib/constants/organization";
import { vi, describe, expect, it, beforeEach } from "vitest";
import type { ReactNode } from "react";
import ExpertAccountPage from "./page";
import { authClient } from "@/lib/auth-client";
import * as expertApi from "@/lib/expert-detail";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const mockPublicProfile: expertApi.ExpertPublicDetail = {
  expertCode: "EXP-2026-0889",
  fullName: "Nguyễn Văn An",
  academicRank: "PROFESSOR",
  degree: "DOCTOR",
  birthYear: 1968,
  gender: "male",
  organizationName: "Đại học Bách Khoa Hà Nội",
  positionTitle: "Chuyên gia Cao cấp",
  publicBio: "Chuyên gia đầu ngành về Điện tử bán dẫn & Tự động hóa công nghiệp.",
  expertiseSectors: [
    "Điện tử, Bán dẫn & Thiết bị điện",
    "Cơ khí chính xác & Khuôn mẫu",
    "Tự động hóa & Smart Factory",
  ],
  specializedKeywords: ["Bán dẫn", "Tự động hóa dây chuyền"],
  masteredTechCodes: ["IND-01", "AUTO-02"],
  isVerified: true,
  isAcceptingConsultation: true,
  training: [],
  employment: [],
  patents: [],
  researchProjects: [],
  publications: [],
  practicalProjects: [],
  awards: [],
};

const mockPrivateDetail: expertApi.ExpertPrivateDetail = {
  publicProfile: mockPublicProfile,
  phone: "0912345689",
  email: "covan.an@baclink.org.vn",
  organizationAddress: "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
  pdpdConsent: true,
  legalOath: true,
  status: "APPROVED",
  activeDocumentTypes: ["DEGREE", "DECISION"],
};

const mockCompleteness: expertApi.ExpertCompleteness = {
  score: 85,
  grade: "EXCELLENT",
  completedCriteria: [
    "Định danh khoa học & Quyết định công nhận",
    "Văn bằng & Học hàm",
    "SHTT & Sáng chế",
    "Đề tài chủ trì cấp Nhà nước",
    "Kinh nghiệm tư vấn doanh nghiệp",
  ],
  missingCriteria: [],
  suggestions: ["Bổ sung thêm hình ảnh phòng thí nghiệm"],
};

describe("ExpertAccountPage - Workspace Tài Khoản Chuyên Gia (Phase 20 Delta v16)", () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("chặn truy cập nếu người dùng không mang vai trò VERIFIED_EXPERT / EXPERT (RoleGuard)", async () => {
    vi.spyOn(authClient, "getUser").mockReturnValue({
      id: "u-buyer",
      email: "buyer@example.com",
      fullName: "Doanh Nghiệp Mua",
      role: "BUYER",
    });

    render(<ExpertAccountPage />);

    expect(await screen.findByText(/Truy cập bị từ chối/i)).toBeInTheDocument();
    expect(screen.queryByText(/1. Định Danh Khoa Học & Phê Duyệt Hội Viên Cố Vấn/i)).not.toBeInTheDocument();
  });

  it("render thành công 5 khối chức năng cho tài khoản VERIFIED_EXPERT", async () => {
    vi.spyOn(authClient, "getUser").mockReturnValue({
      id: "u-expert",
      email: "covan.an@baclink.org.vn",
      fullName: "GS. TSKH. Nguyễn Văn An",
      role: "VERIFIED_EXPERT",
    });
    vi.spyOn(expertApi, "getMyExpertDetail").mockResolvedValue(mockPrivateDetail);
    vi.spyOn(expertApi, "getMyExpertCompleteness").mockResolvedValue(mockCompleteness);

    render(<ExpertAccountPage />);

    // Header & Hero banner
    expect(await screen.findByText("Tài Khoản Chuyên Gia KH&CN")).toBeInTheDocument();
    expect(screen.getByText("EXP-2026-0889")).toBeInTheDocument();
    expect(screen.getByText("ĐÃ XÁC THỰC BỞI BACLINK")).toBeInTheDocument();

    // Khối 1: Định danh khoa học & Quyết định công nhận BACLINK
    expect(screen.getByText(/1. Định Danh Khoa Học & Phê Duyệt Hội Viên Cố Vấn/i)).toBeInTheDocument();
    expect(screen.getByText(/GS. TS. Nguyễn Văn An/i)).toBeInTheDocument();
    expect(screen.getByText(/Đại học Bách Khoa Hà Nội/i)).toBeInTheDocument();
    expect(screen.getByText(/Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh \(BACLINK\)/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Số QĐ: ${ORG.decision.number}`))).toBeInTheDocument();
    expect(screen.getByText(/Nghị định 13\/2023\/NĐ-CP \(PDPD\)/i)).toBeInTheDocument();

    // Khối 2: Cài đặt tiếp nhận tư vấn Doanh nghiệp
    expect(screen.getByText(/2. Thiết Lập Sẵn Sàng Tiếp Nhận Tư Vấn Doanh Nghiệp/i)).toBeInTheDocument();
    expect(screen.getByText(/Đang Bật Tiếp Nhận/i)).toBeInTheDocument();
    expect(screen.getByText("Ngành công nghiệp chuyên môn (BACLINK)")).toBeInTheDocument();
    expect(screen.getByText("Điện tử, Bán dẫn & Thiết bị điện")).toBeInTheDocument();
    expect(screen.getByText("Cơ khí chính xác & Khuôn mẫu")).toBeInTheDocument();
    expect(screen.getByText(/Cố vấn R&D và chuyển giao công nghệ dài hạn/i)).toBeInTheDocument();
    expect(screen.getByText(/Thẩm định kỹ thuật bài toán Doanh nghiệp Hội viên \(Deal Room 1-1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Hội đồng thẩm định kỹ thuật & dây chuyền nhà máy BACLINK/i)).toBeInTheDocument();

    // Khối 3: Thước đo hoàn thiện hồ sơ Completeness Engine
    expect(screen.getByText(/3. Điểm Số Hoàn Thiện Hồ Sơ \(Completeness Engine 5 Trụ Cột\)/i)).toBeInTheDocument();
    expect(screen.getByText(/85 \/ 100 điểm/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Định danh/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Văn bằng/i)).toBeInTheDocument();
    expect(screen.getByText(/SHTT & Sáng chế/i)).toBeInTheDocument();
    expect(screen.getByText(/Đề tài chủ trì/i)).toBeInTheDocument();
    expect(screen.getByText(/Kinh nghiệm TV/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Chỉnh sửa chi tiết LLKH/i })).toHaveAttribute(
      "href",
      "/portal/expert/profile/edit"
    );

    // Khối 4: Bảo mật, Active Sessions & Zalo Mini App
    expect(screen.getByText(/4. Bảo Mật, Phiên Đăng Nhập & Liên Kết Zalo Mini App/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("covan.an@baclink.org.vn")).toBeInTheDocument();
    expect(screen.getByDisplayValue(/0912\*\*\*\*89 \(Đã bảo vệ PDPD\)/i)).toBeInTheDocument();
    expect(screen.getByText(/🔑 Đổi Mật Khẩu Tài Khoản/i)).toBeInTheDocument();
    expect(screen.getByText(/Định Danh Zalo Mini App/i)).toBeInTheDocument();
    expect(screen.getByText(/Đã liên kết Zalo cá nhân/i)).toBeInTheDocument();
    expect(screen.getByText(/Phiên Đăng Nhập Hiện Hoạt \(Active Sessions\)/i)).toBeInTheDocument();
    expect(screen.getByText(/MacBook Pro • Chrome 129/i)).toBeInTheDocument();
    expect(screen.getByText(/iPhone 15 Pro • Zalo Mini App BACLINK/i)).toBeInTheDocument();
    expect(screen.getByText(/Đăng xuất tất cả thiết bị khác/i)).toBeInTheDocument();

    // Khối 5: Tùy chọn trải nghiệm & Cấu hình thông báo
    expect(screen.getByText(/5. Tùy Chọn Trải Nghiệm & Cấu Hình Thông Báo/i)).toBeInTheDocument();
    expect(screen.getByText("Sáng")).toBeInTheDocument();
    expect(screen.getByText("Tối")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText(/Lời mời tư vấn mới/i)).toBeInTheDocument();
    expect(screen.getByText(/Tin nhắn mới trong Deal Room/i)).toBeInTheDocument();
    expect(screen.getByText(/Cảnh báo trước 12h hết hạn/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Lưu Thay Đổi Cài Đặt/i })).toBeInTheDocument();
  });

  it("xử lý tương tác gạt toggle Sẵn sàng nhận tư vấn và gọi API updateMyExpertProfile", async () => {
    vi.spyOn(authClient, "getUser").mockReturnValue({
      id: "u-expert",
      email: "covan.an@baclink.org.vn",
      fullName: "GS. TSKH. Nguyễn Văn An",
      role: "VERIFIED_EXPERT",
    });
    vi.spyOn(expertApi, "getMyExpertDetail").mockResolvedValue(mockPrivateDetail);
    vi.spyOn(expertApi, "getMyExpertCompleteness").mockResolvedValue(mockCompleteness);
    const updateSpy = vi.spyOn(expertApi, "updateMyExpertProfile").mockResolvedValue({} as any);

    render(<ExpertAccountPage />);

    expect(await screen.findByText(/Đang Bật Tiếp Nhận/i)).toBeInTheDocument();
    const toggle = screen.getByLabelText("Cho phép Doanh nghiệp gửi yêu cầu tư vấn");
    expect(toggle).toBeChecked();

    // Gạt tắt tiếp nhận tư vấn
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          isAcceptingConsultation: false,
        })
      );
    });

    expect(await screen.findByText(/Đã tạm dừng tiếp nhận yêu cầu tư vấn mới/i)).toBeInTheDocument();
    expect(screen.getByText(/Đang Tắt Tiếp Nhận/i)).toBeInTheDocument();
  });

  it("xử lý tương tác hủy phiên đăng nhập thiết bị và đăng xuất tất cả thiết bị khác", async () => {
    vi.spyOn(authClient, "getUser").mockReturnValue({
      id: "u-expert",
      email: "covan.an@baclink.org.vn",
      fullName: "GS. TSKH. Nguyễn Văn An",
      role: "VERIFIED_EXPERT",
    });
    vi.spyOn(expertApi, "getMyExpertDetail").mockResolvedValue(mockPrivateDetail);
    vi.spyOn(expertApi, "getMyExpertCompleteness").mockResolvedValue(mockCompleteness);

    render(<ExpertAccountPage />);

    expect(await screen.findByText(/iPhone 15 Pro • Zalo Mini App BACLINK/i)).toBeInTheDocument();

    // Bấm nút Hủy phiên thiết bị iPhone
    const terminateBtn = screen.getByText("Hủy phiên");
    fireEvent.click(terminateBtn);

    expect(screen.queryByText(/iPhone 15 Pro • Zalo Mini App BACLINK/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Đã đăng xuất phiên thiết bị thành công/i)).toBeInTheDocument();

    // Bấm nút Đăng xuất tất cả thiết bị khác
    const terminateOtherBtn = screen.getByText("Đăng xuất tất cả thiết bị khác");
    fireEvent.click(terminateOtherBtn);

    expect(screen.getByText(/Đã đăng xuất tất cả các thiết bị khác ngoài phiên hiện tại/i)).toBeInTheDocument();
  });

  it("xử lý lưu cài đặt trải nghiệm và hiển thị phản hồi người dùng", async () => {
    vi.spyOn(authClient, "getUser").mockReturnValue({
      id: "u-expert",
      email: "covan.an@baclink.org.vn",
      fullName: "GS. TSKH. Nguyễn Văn An",
      role: "VERIFIED_EXPERT",
    });
    vi.spyOn(expertApi, "getMyExpertDetail").mockResolvedValue(mockPrivateDetail);
    vi.spyOn(expertApi, "getMyExpertCompleteness").mockResolvedValue(mockCompleteness);

    render(<ExpertAccountPage />);

    expect(await screen.findByText(/Lưu Thay Đổi Cài Đặt/i)).toBeInTheDocument();

    // Chọn theme Tối và cỡ chữ 110%
    fireEvent.click(screen.getByText("Tối"));
    fireEvent.click(screen.getByText("110%"));

    const saveBtn = screen.getByRole("button", { name: /Lưu Thay Đổi Cài Đặt/i });
    fireEvent.click(saveBtn);

    expect(await screen.findByText(/Đã lưu cài đặt trải nghiệm và cấu hình thông báo thành công/i)).toBeInTheDocument();
  });

  it("hiển thị 'Chưa cập nhật' khi số điện thoại rỗng (PDPD không bịa số 0912****89)", async () => {
    vi.spyOn(authClient, "getUser").mockReturnValue({
      id: "u-expert",
      email: "covan.an@baclink.org.vn",
      fullName: "GS. TSKH. Nguyễn Văn An",
      role: "VERIFIED_EXPERT",
    });
    vi.spyOn(expertApi, "getMyExpertDetail").mockResolvedValue({
      ...mockPrivateDetail,
      phone: null,
    });
    vi.spyOn(expertApi, "getMyExpertCompleteness").mockResolvedValue(mockCompleteness);

    render(<ExpertAccountPage />);

    expect(await screen.findByDisplayValue("Chưa cập nhật")).toBeInTheDocument();
    expect(screen.queryByDisplayValue(/0912\*\*\*\*89/)).not.toBeInTheDocument();
  });

  it("hiển thị nhãn phụ (Mô phỏng phiên thiết bị) tại khối Active Sessions", async () => {
    vi.spyOn(authClient, "getUser").mockReturnValue({
      id: "u-expert",
      email: "covan.an@baclink.org.vn",
      fullName: "GS. TSKH. Nguyễn Văn An",
      role: "VERIFIED_EXPERT",
    });
    vi.spyOn(expertApi, "getMyExpertDetail").mockResolvedValue(mockPrivateDetail);
    vi.spyOn(expertApi, "getMyExpertCompleteness").mockResolvedValue(mockCompleteness);

    render(<ExpertAccountPage />);

    expect(await screen.findByText(/Mô phỏng phiên thiết bị/i)).toBeInTheDocument();
  });

  it("khôi phục theme và cỡ chữ từ localStorage khi mount và lưu vào localStorage khi chọn", async () => {
    localStorage.setItem("expert_theme_pref", "dark");
    localStorage.setItem("expert_fontsize_pref", "125%");

    vi.spyOn(authClient, "getUser").mockReturnValue({
      id: "u-expert",
      email: "covan.an@baclink.org.vn",
      fullName: "GS. TSKH. Nguyễn Văn An",
      role: "VERIFIED_EXPERT",
    });
    vi.spyOn(expertApi, "getMyExpertDetail").mockResolvedValue(mockPrivateDetail);
    vi.spyOn(expertApi, "getMyExpertCompleteness").mockResolvedValue(mockCompleteness);

    render(<ExpertAccountPage />);

    expect(await screen.findByText("Tài Khoản Chuyên Gia KH&CN")).toBeInTheDocument();

    // Chọn theme Sáng -> lưu ngay vào localStorage
    fireEvent.click(screen.getByText("Sáng"));
    expect(localStorage.getItem("expert_theme_pref")).toBe("light");

    // Chọn cỡ chữ 110% -> lưu ngay vào localStorage
    fireEvent.click(screen.getByText("110%"));
    expect(localStorage.getItem("expert_fontsize_pref")).toBe("110%");
  });

  it("hiển thị UX State Error khi API thất bại và hỗ trợ nút Thử lại (Retry)", async () => {
    vi.spyOn(authClient, "getUser").mockReturnValue({
      id: "u-expert",
      email: "covan.an@baclink.org.vn",
      fullName: "GS. TSKH. Nguyễn Văn An",
      role: "VERIFIED_EXPERT",
    });
    vi.spyOn(expertApi, "getMyExpertDetail").mockRejectedValue(new Error("Mất kết nối máy chủ dữ liệu"));

    render(<ExpertAccountPage />);

    expect(await screen.findByText(/Đã xảy ra lỗi khi tải dữ liệu/i)).toBeInTheDocument();
    expect(screen.getByText(/Mất kết nối máy chủ dữ liệu/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Thử lại/i })).toBeInTheDocument();
  });
});
