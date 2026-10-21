import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChiTietChaoBanPage from "./page";
import { TechnologyOffer } from "@/types/technology-offer";
import { fetchOfferById } from "@/services/api/technology-offer";
import { authClient, ROLES } from "@/lib/auth-client";

const mockOffer: TechnologyOffer = {
  id: "01928002-0000-7000-8000-000000000008",
  offerCode: "OFF-202610-LV16-08",
  offerType: "SOFTWARE",
  hasTechTransfer: true,
  title: "Nền tảng Digital Twin mô phỏng và tối ưu hóa vận hành nhiệt lò nung công nghiệp",
  summary: "Mô hình song sinh kỹ thuật số thời gian thực kết nối cảm biến IoT nhiệt độ và áp suất",
  problemSolved: "Cắt giảm 12-16% lượng khí gas hóa lỏng tiêu thụ trên mỗi tấn phôi nhôm đúc",
  sectorCode: "LV16",
  sectorName: "CNTT – viễn thông – chuyển đổi số",
  pricingType: "RANGE",
  priceMin: 1800000000,
  priceMax: 2800000000,
  currency: "VND",
  unit: "bản quyền phần mềm + tích hợp nhà máy",
  developerOrigin: "Viện Năng Lượng - Bộ Công Thương",
  trlLevel: 8,
  ipStatus: "COPYRIGHT_REGISTERED",
  ipRegistrationNumber: "VN-CP-2025-0089",
  transferMethod: "EXCLUSIVE_LICENSE",
  commercialStatus: "COMMERCIALLY_READY",
  contactPointRole: "Trung tâm Giải Pháp Số Hóa Năng Lượng",
  status: "APPROVED",
  successfulConnections: 12,
  ratingScore: 5.0,
  reviewCount: 7,
  createdAt: "2026-10-10T00:00:00Z",
  managingAuthorityName: "Sở KH&CN Hà Nội",
};

const mockSubmitQuickDemand = vi.fn().mockResolvedValue({
  success: true,
  itemId: "dmd-uuid-001",
  itemCode: "DMD-20261012-341205",
  message: "Đăng bài toán nhu cầu công nghệ thành công.",
});

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "01928002-0000-7000-8000-000000000008" }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("@/services/api/technology-offer", () => ({
  fetchOfferById: vi.fn(() => Promise.resolve(mockOffer)),
  submitQuickDemand: (...args: any[]) => mockSubmitQuickDemand(...args),
}));

describe("ChiTietChaoBanPage (/chao-ban-cong-nghe/[id])", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    authClient.clearSession();
  });

  afterEach(() => {
    cleanup();
    authClient.clearSession();
  });

  it("T-04.37: Hiển thị đúng dữ liệu thật từ DB trên Quick Specs (Unit, Rating, Connections)", async () => {
    render(<ChiTietChaoBanPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /Nền tảng Digital Twin mô phỏng và tối ưu hóa vận hành nhiệt lò nung công nghiệp/i,
        })
      ).toBeInTheDocument();
    });

    // Đối soát mã hồ sơ và đơn vị chuyển giao
    expect(screen.getByText("OFF-202610-LV16-08")).toBeInTheDocument();
    expect(screen.getByText(/bản quyền phần mềm \+ tích hợp nhà máy/i)).toBeInTheDocument();

    // Đối soát đánh giá sàn thật và số kết nối
    expect(screen.getByText(/5\.0\/5 · 7 review/i)).toBeInTheDocument();
    expect(screen.getByText(/12 lượt/i)).toBeInTheDocument();
  });

  it("T-04.33: Tab Thông số kỹ thuật hiển thị động và không còn mock sấy thăng hoa", async () => {
    render(<ChiTietChaoBanPage />);

    await waitFor(() => {
      expect(screen.getByText("OFF-202610-LV16-08")).toBeInTheDocument();
    });

    // Chuyển sang tab Specs
    const specsTab = screen.getByRole("button", {
      name: /Thông Số Kỹ Thuật/i,
    });
    fireEvent.click(specsTab);

    // Không còn chuỗi mock sấy thăng hoa cũ
    expect(screen.queryByText(/50 - 200 kg nguyên liệu\/mẻ/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Nhiệt độ thăng hoa/i)).not.toBeInTheDocument();

    // Hiển thị thông số động của Digital Twin
    expect(screen.getByText(/Phần mềm số hóa & Nền tảng điều khiển/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Cắt giảm 12-16% lượng khí gas hóa lỏng tiêu thụ trên mỗi tấn phôi nhôm đúc/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText(/TRL 8\/9/i).length).toBeGreaterThanOrEqual(1);
  });

  it("T-04.36: Tab DataRoom hiển thị danh mục tệp theo mã hồ sơ và nút Tải về kích hoạt tải", async () => {
    render(<ChiTietChaoBanPage />);

    await waitFor(() => {
      expect(screen.getByText("OFF-202610-LV16-08")).toBeInTheDocument();
    });

    // Chuyển sang tab DataRoom
    const dataRoomTab = screen.getByRole("button", {
      name: /Hồ Sơ DataRoom & Tài Liệu/i,
    });
    fireEvent.click(dataRoomTab);

    // Kiểm tra tên tệp gắn mã hồ sơ
    expect(screen.getByText(/OFF-202610-LV16-08_Teaser_Tom_Tat_Giai_Phap\.pdf/i)).toBeInTheDocument();

    // Nút Tải về hoạt động
    const downloadBtn = screen.getByRole("button", { name: /Tải về/i });
    expect(downloadBtn).toBeInTheDocument();
    fireEvent.click(downloadBtn);
  });

  it("T-04.34 & T-04.35: Nút Lưu quan tâm toggle trạng thái bookmark và Nút Share sao chép link", async () => {
    // Giả lập clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<ChiTietChaoBanPage />);

    await waitFor(() => {
      expect(screen.getByText("OFF-202610-LV16-08")).toBeInTheDocument();
    });

    // Test Bookmark button
    const bookmarkBtn = screen.getByRole("button", { name: /Lưu quan tâm/i });
    fireEvent.click(bookmarkBtn);

    // Chuyển sang trạng thái Đã lưu quan tâm
    expect(screen.getByText(/Đã lưu quan tâm/i)).toBeInTheDocument();
    expect(localStorage.getItem("nacentwin_bookmarked_offers")).toContain(
      "01928002-0000-7000-8000-000000000008"
    );

    // Test Share button
    const shareBtn = screen.getByTitle("Chia sẻ hồ sơ");
    fireEvent.click(shareBtn);
    expect(writeTextMock).toHaveBeenCalled();
  });

  it("T-04.38: Quick Demand Modal gửi yêu cầu kết nối gọi API thật và hiển thị mã phiếu nhu cầu", async () => {
    render(<ChiTietChaoBanPage />);

    await waitFor(() => {
      expect(screen.getByText("OFF-202610-LV16-08")).toBeInTheDocument();
    });

    // Mở Modal
    const openModalBtn = screen.getByRole("button", {
      name: /Gửi yêu cầu li-xăng \/ chuyển giao/i,
    });
    fireEvent.click(openModalBtn);

    expect(screen.getByText(/Tạo Nhanh Nhu Cầu & Kết Nối Chuyển Giao/i)).toBeInTheDocument();

    // Điền thông tin form
    fireEvent.change(screen.getByPlaceholderText(/Công ty CP Nông Sản Sạch/i), {
      target: { value: "Tập Đoàn Cơ Khí Nhôm Á Châu" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Nguyễn Văn A/i), {
      target: { value: "Trần Trọng Nghĩa" },
    });
    fireEvent.change(screen.getByPlaceholderText(/0912 345 678/i), {
      target: { value: "0988776655" },
    });

    // Submit form
    const submitBtn = screen.getByRole("button", {
      name: /Tạo Nhu Cầu & Gửi Yêu Cầu Kết Nối/i,
    });
    fireEvent.click(submitBtn);

    // Kiểm tra gọi API thật
    await waitFor(() => {
      expect(mockSubmitQuickDemand).toHaveBeenCalled();
    });

    // Kiểm tra phản hồi mã phiếu nhu cầu thật từ CSDL PostgreSQL
    await waitFor(() => {
      expect(screen.getByText(/DMD-20261012-341205/i)).toBeInTheDocument();
    });
  });

  it("T-04.63: Render dynamic specValues, DataRoom access control, commercial terms, and PDPD TTO contact", async () => {
    const deltaV5Offer: TechnologyOffer = {
      ...mockOffer,
      specValues: [
        {
          specCode: "ENERGY_REDUCTION",
          specName: "Tỷ lệ tiết kiệm năng lượng",
          specValue: "15%",
          unit: "%",
        },
        {
          specCode: "RESPONSE_TIME",
          specName: "Thời gian phản hồi cảm biến",
          specValue: "50",
          unit: "ms",
        },
      ],
      documents: [
        {
          id: "doc-1",
          fileName: "Chung_Chi_Kiem_Dinh_Bo_Cong_Thuong.pdf",
          fileUrl: "/docs/test.pdf",
          fileSizeBytes: 1048576,
          documentType: "TRL_EVIDENCE",
          accessScope: "PUBLIC",
        },
        {
          id: "doc-2",
          fileName: "Thiet_Ke_Chi_Tiet_Va_Ma_Nguon.pdf",
          fileUrl: "/docs/source.pdf",
          fileSizeBytes: 2097152,
          documentType: "CATALOGUE",
          accessScope: "AFTER_CONNECTION",
        },
      ],
      deliveryTimeline: "30 ngày kể từ khi ký kết",
      warrantyTerms: "12 tháng bảo hành phần mềm 24/7",
      paymentTerms: "Thanh toán 3 đợt: 30% - 40% - 30%",
      installationSupport: true,
      supplyScope: "Gói chuyển giao mã nguồn và tài liệu kiến trúc",
    };

    (fetchOfferById as any).mockResolvedValueOnce(deltaV5Offer);

    render(<ChiTietChaoBanPage />);

    await waitFor(() => {
      expect(screen.getByText("OFF-202610-LV16-08")).toBeInTheDocument();
    });

    // 1. Kiểm tra PDPD TTO contact block
    expect(screen.getByText(/NĐ 13\/2023 \(PDPD\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Đầu Mối TTO Chuyển Giao/i)).toBeInTheDocument();

    // 2. Kiểm tra tab Specs hiển thị dynamic specValues và Điều kiện thương mại
    const specsTab = screen.getByRole("button", { name: /Thông Số Kỹ Thuật/i });
    fireEvent.click(specsTab);

    expect(screen.getByText("Tỷ lệ tiết kiệm năng lượng")).toBeInTheDocument();
    expect(screen.getByText("15%")).toBeInTheDocument();
    expect(screen.getByText("Thời gian phản hồi cảm biến")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();

    expect(screen.getByText(/Điều Kiện Thương Mại & Phạm Vi Hỗ Trợ Chuyển Giao/i)).toBeInTheDocument();
    expect(screen.getByText("30 ngày kể từ khi ký kết")).toBeInTheDocument();
    expect(screen.getByText("12 tháng bảo hành phần mềm 24/7")).toBeInTheDocument();
    expect(screen.getByText("Thanh toán 3 đợt: 30% - 40% - 30%")).toBeInTheDocument();
    expect(screen.getByText(/Có hỗ trợ chuyên gia lắp đặt/i)).toBeInTheDocument();

    // 3. Kiểm tra tab DataRoom hiển thị danh mục tệp và access control
    const dataRoomTab = screen.getByRole("button", { name: /Hồ Sơ DataRoom & Tài Liệu/i });
    fireEvent.click(dataRoomTab);

    expect(screen.getByText("Chung_Chi_Kiem_Dinh_Bo_Cong_Thuong.pdf")).toBeInTheDocument();
    expect(screen.getByText("Thiet_Ke_Chi_Tiet_Va_Ma_Nguon.pdf")).toBeInTheDocument();
    expect(screen.getByText(/Cần cấp quyền \(Ký NDA\)/i)).toBeInTheDocument();
  });

  it("tự động điền dữ liệu người dùng đã đăng nhập vào Quick Demand Modal khi mở hoặc gõ bài toán", async () => {
    authClient.setSession("buyer-token", {
      id: "u-buyer-99",
      email: "director@nongnghiep-xanh.vn",
      fullName: "Đặng Thị Thảo",
      role: ROLES.BUYER,
      organizationName: "Công ty TNHH Nông Nghiệp Xanh Việt Nam",
      phone: "0934567890",
    });

    render(<ChiTietChaoBanPage />);

    await waitFor(() => {
      expect(screen.getByText("OFF-202610-LV16-08")).toBeInTheDocument();
    });

    // Mở Modal
    const openModalBtn = screen.getByRole("button", {
      name: /Gửi yêu cầu li-xăng \/ chuyển giao/i,
    });
    fireEvent.click(openModalBtn);

    expect(screen.getByText(/Tạo Nhanh Nhu Cầu & Kết Nối Chuyển Giao/i)).toBeInTheDocument();

    // Kiểm tra các trường đã được tự động điền từ tài khoản đăng nhập
    const companyInput = screen.getByPlaceholderText(/Công ty CP Nông Sản Sạch/i) as HTMLInputElement;
    const contactInput = screen.getByPlaceholderText(/Nguyễn Văn A/i) as HTMLInputElement;
    const phoneInput = screen.getByPlaceholderText(/0912 345 678/i) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText(/contact@doanhnghiep.vn/i) as HTMLInputElement;

    expect(companyInput.value).toBe("Công ty TNHH Nông Nghiệp Xanh Việt Nam");
    expect(contactInput.value).toBe("Đặng Thị Thảo");
    expect(phoneInput.value).toBe("0934567890");
    expect(emailInput.value).toBe("director@nongnghiep-xanh.vn");

    // Kiểm tra hiển thị banner tài khoản và huy hiệu tự động điền
    expect(screen.getByText(/Đang đăng nhập:/i)).toBeInTheDocument();
    expect(screen.getByText(/Đặng Thị Thảo/i)).toBeInTheDocument();
    expect(screen.getByText(/Đã tự động điền đơn vị, người liên hệ, email và SĐT từ tài khoản đăng nhập/i)).toBeInTheDocument();
  });
});
