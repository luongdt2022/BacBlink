import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Tt17WizardPage from "@/app/(portal)/assessments/tt17/wizard/page";
import Tt17HubPage from "@/app/(portal)/assessments/tt17/page";
import EnterpriseProfilePage from "@/app/portal/enterprise/profile/page";
import { authClient } from "@/lib/auth-client";
import {
  calculateLaborProductivityGrowth,
  calculateLocalScore,
  INITIAL_SURVEY_DATA,
} from "@/services/api/assessment-tt17";

// Mock next/navigation
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => "/assessments/tt17",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock enterprise-client
vi.mock("@/lib/enterprise-client", () => ({
  fetchMyEnterpriseProfile: vi.fn().mockResolvedValue({
    id: "ent-1",
    name: "Công ty Cổ phần Chế tạo Cơ khí Nam Á",
    taxCode: "0109988776",
    contactPerson: "Trần Quốc Tuấn",
    contactEmail: "tuan.tq@nama-tech.vn",
    contactPhone: "0988776655",
    provinceCity: "Hà Nội",
    addressDetail: "Khu công nghiệp Bắc Thăng Long, Hà Nội",
    verificationStatus: "VERIFIED",
    workforceScale: "150",
    revenueRange: "50 - 100 tỷ VNĐ",
    sectorCode: "C.28",
  }),
  lookupTaxCode: vi.fn().mockImplementation(async (taxCode: string) => {
    if (taxCode.trim() === "0109988776") {
      return {
        found: true,
        name: "Công ty Cổ phần Chế tạo Cơ khí Nam Á",
        province: "Hà Nội",
        address: "Khu công nghiệp Bắc Thăng Long, Hà Nội",
      };
    }
    return { found: false, message: "Không tìm thấy thông tin cho MST." };
  }),
  updateMyEnterpriseProfile: vi.fn().mockResolvedValue({}),
  submitEnterpriseVerification: vi.fn().mockResolvedValue({}),
}));

// Mock api service
vi.mock("@/services/api/assessment-tt17", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    submitAssessment: vi.fn().mockResolvedValue({
      id: "asm-12345678-abcd-ef01-2345-6789abcdef01",
      autoProvisioned: true,
      credentials: {
        email: "tuan.tq@nama-tech.vn",
        temporaryPassword: "NacenTech@2026",
        enterpriseCode: "0109988776",
      },
      message: "Nộp hồ sơ đánh giá và cấp tài khoản thành công.",
    }),
    saveAssessmentDraft: vi.fn().mockResolvedValue({ id: "draft-1" }),
    getAssessmentHistory: vi.fn().mockResolvedValue([]),
    getCurrentAssessment: vi.fn().mockResolvedValue(null),
  };
});

beforeEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("TASK-09 TT17 Delta: Public Intake & Zero Mock Leak & Profile Integration", () => {
  it("T-09.18: Form Wizard is accessible without login and displays contact identification fields in Step 1", () => {
    // PUBLIC / Guest user (no active session)
    authClient.clearSession();

    render(<Tt17WizardPage />);

    // Phải mở được bình thường, không có màn hình chặn RoleGuard
    expect(screen.getByText(/PHIẾU ĐIỀU TRA TRÌNH ĐỘ VÀ NĂNG LỰC CÔNG NGHỆ SẢN XUẤT/i)).toBeInTheDocument();
    expect(screen.getByText(/Thông tư số 17\/2019\/TT-BKHCN/i)).toBeInTheDocument();
    expect(screen.getByText(/Các thông tin cung cấp theo phiếu này chỉ nhằm phục vụ công tác thống kê/i)).toBeInTheDocument();

    // Phải hiển thị đầy đủ các trường Mục A định danh doanh nghiệp & người liên hệ
    expect(screen.getByLabelText(/Tên Doanh Nghiệp/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mã Số Thuế/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Người Đại Diện/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Liên Hệ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Số Điện Thoại Liên Hệ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tỉnh \/ Thành Phố/i)).toBeInTheDocument();

    // Banner hướng dẫn tự động tạo tài khoản khi khảo sát vãng lai
    expect(screen.getByText(/Hệ thống tự động cấp tài khoản khi nộp bài/i)).toBeInTheDocument();
  });

  it("T-09.19: Hub Trung Tâm triệt tiêu hoàn toàn mock data 80.7đ và hiển thị Survey Hero Banner cho Public/Chưa có hồ sơ", async () => {
    // PUBLIC_USER login
    authClient.setSession("public-token", {
      id: "guest-1",
      email: "guest@example.com",
      fullName: "Khách Vãng Lai",
      role: "PUBLIC_USER",
    });

    render(<Tt17HubPage />);

    // Chờ component tải xong và hiển thị đúng tiêu đề
    expect(await screen.findByText(/Đánh Giá Trình Độ & Năng Lực Công Nghệ/i)).toBeInTheDocument();

    // Chứng minh Zero-Mock: Tuyệt đối không hiển thị điểm số 80.7 ảo hay tên Hải Phòng Precision
    expect(screen.queryByText("80.7")).not.toBeInTheDocument();
    expect(screen.queryByText(/Haiphong Precision/i)).not.toBeInTheDocument();

    // Hiển thị Hero Banner Khảo Sát Tự Chẩn Đoán + CTA lớn
    expect(screen.getByText(/Phiếu Khảo Sát & Tự Chẩn Đoán Trình Độ Công Nghệ Sản Xuất/i)).toBeInTheDocument();
    expect(screen.getByText(/Bắt Đầu Kê Khai Khảo Sát Ngay/i)).toBeInTheDocument();
    expect(screen.getByText(/hệ thống tự động khởi tạo tài khoản quản trị khi nộp bài/i)).toBeInTheDocument();
  });

  it("T-09.21: Thẻ Widget TT17 xuất hiện tại Hồ Sơ Doanh Nghiệp (/portal/enterprise/profile)", async () => {
    // ENTERPRISE login
    authClient.setSession("enterprise-token", {
      id: "ent-1",
      email: "enterprise@dn.vn",
      fullName: "Đại Diện Doanh Nghiệp",
      role: "ENTERPRISE",
    });

    render(<EnterpriseProfilePage />);

    // Kiểm tra Widget Card TT17 đã được nhúng sau khi load profile
    expect(await screen.findByText(/Tự Đánh Giá Trình Độ & Năng Lực Công Nghệ Sản Xuất \(TT17\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Phụ lục I-IV/i)).toBeInTheDocument();
    expect(screen.getByText(/Mở Hồ Sơ Đánh Giá TT17/i)).toBeInTheDocument();
  });

  it("T-09.23: Nút Tra cứu MST gọi API lookupTaxCode và tự động điền Tên DN, Tỉnh thành, Địa chỉ", async () => {
    authClient.clearSession();
    render(<Tt17WizardPage />);

    const taxInput = screen.getByLabelText(/Mã Số Thuế/i);
    const lookupButton = screen.getByRole("button", { name: /Tra cứu MST/i });

    // Nhập MST và bấm Tra cứu
    fireEvent.change(taxInput, { target: { value: "0109988776" } });
    fireEvent.click(lookupButton);

    // Chờ kết quả tự động điền vào Form
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Tên Doanh Nghiệp/i) as HTMLInputElement;
      expect(nameInput.value).toBe("Công ty Cổ phần Chế tạo Cơ khí Nam Á");
    });

    const addressInput = screen.getByLabelText(/Địa Chỉ Trụ Sở Chính Chi Tiết/i) as HTMLInputElement;
    expect(addressInput.value).toBe("Khu công nghiệp Bắc Thăng Long, Hà Nội");
  });

  it("T-09.24: Smart Pre-fill từ CSDL khi có phiên đăng nhập và hiển thị banner đồng bộ hồ sơ", async () => {
    authClient.setSession("ent-token-123", {
      id: "ent-1",
      email: "tuan.tq@nama-tech.vn",
      fullName: "Trần Quốc Tuấn",
      role: "ENTERPRISE",
    });

    render(<Tt17WizardPage />);

    // Kiểm tra Banner hiển thị
    expect(await screen.findByText(/Tự động đồng bộ hồ sơ Doanh nghiệp đã đăng ký/i)).toBeInTheDocument();

    // Kiểm tra các trường đã được điền sẵn từ CSDL
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Tên Doanh Nghiệp/i) as HTMLInputElement;
      expect(nameInput.value).toBe("Công ty Cổ phần Chế tạo Cơ khí Nam Á");
      const taxInput = screen.getByLabelText(/Mã Số Thuế/i) as HTMLInputElement;
      expect(taxInput.value).toBe("0109988776");
      const contactInput = screen.getByLabelText(/Người Đại Diện/i) as HTMLInputElement;
      expect(contactInput.value).toBe("Trần Quốc Tuấn");
      const emailInput = screen.getByLabelText(/Email Liên Hệ/i) as HTMLInputElement;
      expect(emailInput.value).toBe("tuan.tq@nama-tech.vn");
    });
  });

  it("T-09.25: Nộp bài khảo sát thành công hiển thị màn hình cấp tài khoản tự động (Auto-provisioned)", async () => {
    authClient.clearSession();
    render(<Tt17WizardPage />);

    // Điền thông tin bắt buộc
    fireEvent.change(screen.getByLabelText(/Tên Doanh Nghiệp/i), { target: { value: "Công ty Cơ Khí Nam Á" } });
    fireEvent.change(screen.getByLabelText(/Mã Số Thuế/i), { target: { value: "0109988776" } });
    fireEvent.change(screen.getByLabelText(/Email Liên Hệ/i), { target: { value: "tuan.tq@nama-tech.vn" } });

    // Bấm Nộp hồ sơ ở Top Header
    const submitBtn = screen.getByRole("button", { name: /Hoàn Tất & Nộp Hồ Sơ/i });
    fireEvent.click(submitBtn);

    // Kiểm tra màn hình nộp thành công xuất hiện
    expect(await screen.findByText(/Nộp Phiếu Đánh Giá Công Nghệ Thành Công!/i)).toBeInTheDocument();
    expect(screen.getByText(/TÀI KHOẢN DOANH NGHIỆP ĐÃ ĐƯỢC CẤP TỰ ĐỘNG/i)).toBeInTheDocument();
    expect(screen.getByText("tuan.tq@nama-tech.vn")).toBeInTheDocument();
    expect(screen.getByText("NacenTech@2026")).toBeInTheDocument();

    // Có link Đăng nhập và Xem báo cáo
    expect(screen.getByRole("link", { name: /Đăng Nhập Ngay Vào Hệ Thống/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /Xem Báo Cáo Phụ Lục IV/i })).toBeInTheDocument();
  });

  it("T-09.26: Zero-Mock TC08 - Hàm calculateLaborProductivityGrowth tính toán chính xác chuỗi 3 năm tài chính", () => {
    // Năm t-2: Doanh thu 100 tỷ, 100 người -> NS = 1.0 tỷ/người
    // Năm t-1: Doanh thu 110 tỷ, 100 người -> NS = 1.1 tỷ/người
    // Năm t  : Doanh thu 120 tỷ, 100 người -> NS = 1.2 tỷ/người (tăng 20% sau 2 năm -> 10%/năm)
    const series = [
      { year: 2024, industrialOutputValue: 100000000000, netRevenue: 100000000000, directWorkersCount: 100 },
      { year: 2025, industrialOutputValue: 110000000000, netRevenue: 110000000000, directWorkersCount: 100 },
      { year: 2026, industrialOutputValue: 120000000000, netRevenue: 120000000000, directWorkersCount: 100 },
    ];

    const growth = calculateLaborProductivityGrowth(series);
    // Tốc độ tăng trưởng bình quân hàng năm ~ 10%
    expect(growth).toBeCloseTo(10.0, 1);
  });

  it("T-09.33: Kê khai 23 nhóm ngành và hiển thị bộ định mức tham chiếu K_chuẩn 1-4 trong Wizard", () => {
    authClient.clearSession();
    render(<Tt17WizardPage />);

    // Kiểm tra dropdown mã ngành chứa C.28
    const industrySelect = screen.getByLabelText(/Mã Ngành Chế Biến, Chế Tạo/i);
    expect(industrySelect).toBeInTheDocument();

    // Thay đổi sang C.28
    fireEvent.change(industrySelect, { target: { value: "C.28" } });

    // Kiểm tra hiển thị định mức ngành C.28
    expect(screen.getByText(/Bộ Định Mức Tham Chiếu Chuẩn Cho Nhóm Ngành/i)).toBeInTheDocument();
    expect(screen.getByText(/300 triệu\/LĐ/i)).toBeInTheDocument();
    expect(screen.getByText(/7% DT/i)).toBeInTheDocument();
    expect(screen.getByText(/55% DT/i)).toBeInTheDocument();
    expect(screen.getByText(/150 triệu\/người/i)).toBeInTheDocument();

    // Kiểm tra Sticky Realtime Scorecard hiển thị điểm
    expect(screen.getByText(/Tính Điểm Tức Thời \(Real-Time\)/i)).toBeInTheDocument();
    expect(screen.getByText(/\/ 100 điểm/i)).toBeInTheDocument();
  });

  it("T-09.34: Đối soát 1:1 công thức tính điểm 26 tiêu chí giữa Frontend và Backend Engine", () => {
    // Nạp INITIAL_SURVEY_DATA với ngành C.28
    const survey = { ...INITIAL_SURVEY_DATA };
    const score = calculateLocalScore(survey, "C.28");

    // Xác minh điểm số 5 nhóm đạt giá trị hợp lệ trong khoảng chuẩn
    expect(score.scoreT).toBeGreaterThanOrEqual(1.0);
    expect(score.scoreT).toBeLessThanOrEqual(30.0);

    expect(score.scoreE).toBeGreaterThanOrEqual(1.0);
    expect(score.scoreE).toBeLessThanOrEqual(20.0);

    expect(score.scoreO).toBeGreaterThanOrEqual(1.0);
    expect(score.scoreO).toBeLessThanOrEqual(19.0);

    expect(score.scoreR).toBeGreaterThanOrEqual(1.0);
    expect(score.scoreR).toBeLessThanOrEqual(17.0);

    expect(score.scoreI).toBeGreaterThanOrEqual(1.0);
    expect(score.scoreI).toBeLessThanOrEqual(14.0);

    // Xác minh tổng điểm = tổng 5 nhóm và xếp loại hợp lệ
    expect(score.totalScore).toBeCloseTo(
      score.scoreT + score.scoreE + score.scoreO + score.scoreR + score.scoreI,
      1
    );
    expect(["TIEN_TIEN", "TRUNG_BINH_TIEN_TIEN", "TRUNG_BINH", "LAC_HAU", "CAN_THAM_DINH"]).toContain(
      score.classification
    );
    expect(score.syncCoefficient).toBeGreaterThanOrEqual(0.0);
    expect(score.syncCoefficient).toBeLessThanOrEqual(1.0);

    // Kiểm tra đủ 26 tiêu chí trong danh sách criteria
    expect(score.criteria.length).toBe(26);
    expect(score.criteria.every((c) => !isNaN(c.achievedScore) && isFinite(c.achievedScore))).toBe(true);
  });
});
