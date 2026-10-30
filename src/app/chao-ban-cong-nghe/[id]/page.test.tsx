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
  enterpriseTaxCode: "0109887766",
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
  documents: [
    {
      id: "doc-01",
      documentType: "CATALOGUE",
      fileName: "OFF-202610-LV16-08_Teaser_Tom_Tat_Giai_Phap.pdf",
      fileUrl: "https://storage.nacentwin.vn/docs/teaser.pdf",
      fileSizeBytes: 2516582,
      accessScope: "PUBLIC",
    },
  ],
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
      name: /Đăng ký nhận chuyển giao công nghệ/i,
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
      expect(mockSubmitQuickDemand).toHaveBeenCalledWith(
        expect.objectContaining({
          offerId: "01928002-0000-7000-8000-000000000008",
          offerCode: "OFF-202610-LV16-08",
        })
      );
    });

    // Kiểm tra phản hồi mã phiếu nhu cầu thật và nút CTA dẫn tới Workspace
    await waitFor(() => {
      expect(screen.getByText(/DMD-20261012-341205/i)).toBeInTheDocument();
      const ctaLink = screen.getByRole("link", { name: /Theo dõi đơn hàng trong Workspace/i });
      expect(ctaLink).toBeInTheDocument();
      expect(ctaLink).toHaveAttribute("href", "/portal/buyer/demands?tab=commercial");
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
      name: /Đăng ký nhận chuyển giao công nghệ/i,
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

  it("T-04-CR96: Hiển thị liên kết mở hồ sơ doanh nghiệp từ sản phẩm chào bán", async () => {
    render(<ChiTietChaoBanPage />);
    await waitFor(() => {
      expect(screen.getByText(/Nền tảng Digital Twin mô phỏng/i)).toBeInTheDocument();
    });

    // 1. Kiểm tra link ở thông tin đơn vị chào bán
    const originLinks = screen.getAllByRole("link", { name: /Viện Năng Lượng - Bộ Công Thương/i });
    expect(originLinks.length).toBeGreaterThanOrEqual(1);
    expect(originLinks[0]).toHaveAttribute("href", "/enterprises/0109887766");

    // 2. Kiểm tra nút xem hồ sơ doanh nghiệp ở sidebar
    const profileBtn = screen.getByRole("link", { name: /Xem Hồ Sơ Doanh Nghiệp/i });
    expect(profileBtn).toBeInTheDocument();
    expect(profileBtn).toHaveAttribute("href", "/enterprises/0109887766");
  });

  it("T-04-CR96-fallback: Khi không có enterpriseTaxCode hiển thị 'Đang cập nhật MST' và không render Link tới 0108992134", async () => {
    const offerWithoutTaxCode: TechnologyOffer = {
      ...mockOffer,
      enterpriseTaxCode: undefined,
    };
    (fetchOfferById as any).mockResolvedValueOnce(offerWithoutTaxCode);

    render(<ChiTietChaoBanPage />);
    await waitFor(() => {
      expect(screen.getByText(/Nền tảng Digital Twin mô phỏng/i)).toBeInTheDocument();
    });

    // 1. Hiển thị 'Đang cập nhật MST'
    expect(screen.getByText("Đang cập nhật MST")).toBeInTheDocument();

    // 2. Không có bất kỳ link nào trỏ tới 0108992134
    expect(screen.queryByRole("link", { name: /Xem Hồ Sơ Doanh Nghiệp/i })).toBeNull();
    const links = screen.queryAllByRole("link");
    const brokenFallbackLinks = links.filter((l) => l.getAttribute("href")?.includes("0108992134"));
    expect(brokenFallbackLinks).toHaveLength(0);

    // 3. Nút xem hồ sơ ở sidebar là button disabled 'Chưa liên kết hồ sơ DN'
    expect(screen.getByRole("button", { name: /Chưa liên kết hồ sơ DN/i })).toBeDisabled();
  });

  it("T-04.101 [AC-04-038]: Empty State DataRoom khi hồ sơ không đính kèm tài liệu", async () => {
    const emptyDocsOffer: TechnologyOffer = {
      ...mockOffer,
      offerCode: "OFF-20261022-00025-365E",
      documents: [],
    };
    (fetchOfferById as any).mockResolvedValueOnce(emptyDocsOffer);

    render(<ChiTietChaoBanPage />);
    await waitFor(() => {
      expect(screen.getByText("OFF-20261022-00025-365E")).toBeInTheDocument();
    });

    // Chuyển sang tab DataRoom
    const dataRoomTab = screen.getByRole("button", {
      name: /Hồ Sơ DataRoom & Tài Liệu/i,
    });
    fireEvent.click(dataRoomTab);

    // Khẳng định thẩm định phủ định (Negative Assertion): 3 file PDF mock không tồn tại và trả về null
    expect(screen.queryByText("OFF-20261022-00025-365E_Teaser_Tom_Tat_Giai_Phap.pdf")).toBeNull();
    expect(screen.queryByText(/Teaser_Tom_Tat_Giai_Phap\.pdf/i)).toBeNull();
    expect(screen.queryByText(/Ho_So_SHTT_/i)).toBeNull();
    expect(screen.queryByText(/Ket_Qua_Kiem_Dinh_TRL/i)).toBeNull();

    // Khẳng định hiển thị Empty State chuẩn UX
    expect(screen.getByText("Chưa có tài liệu công khai trong DataRoom")).toBeInTheDocument();
    expect(screen.getByText(/Chủ sở hữu công nghệ chưa tải lên tài liệu minh chứng/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Yêu cầu tài liệu qua Kết nối chuyển giao/i })).toBeInTheDocument();
  });

  it("T-04.101 [AC-04-039]: Hiển thị TRL trung thực theo CSDL (không fallback TRL 7/8)", async () => {
    const agroOffer: TechnologyOffer = {
      ...mockOffer,
      hasTechTransfer: false,
      trlLevel: null,
    };
    (fetchOfferById as any).mockResolvedValueOnce(agroOffer);

    render(<ChiTietChaoBanPage />);
    await waitFor(() => {
      expect(screen.getByText("OFF-202610-LV16-08")).toBeInTheDocument();
    });

    // Khẳng định không có TRL badge hay TRL 7/9, TRL 8/9
    expect(screen.queryByText(/TRL 7/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/TRL 8/i)).not.toBeInTheDocument();

    // Chuyển sang tab Specs
    const specsTab = screen.getByRole("button", {
      name: /Thông Số Kỹ Thuật/i,
    });
    fireEvent.click(specsTab);

    // Khẳng định có text "Hàng hóa thương mại / Không áp dụng TRL"
    expect(screen.getByText("Hàng hóa thương mại / Không áp dụng TRL")).toBeInTheDocument();
  });

  it("T-04.101 [AC-04-040]: Hiển thị tình trạng SHTT trung thực (không tự xưng Đã thẩm định)", async () => {
    const noIpOffer: TechnologyOffer = {
      ...mockOffer,
      ipRegistrationNumber: null,
      ipStatus: "NONE",
    };
    (fetchOfferById as any).mockResolvedValueOnce(noIpOffer);

    render(<ChiTietChaoBanPage />);
    await waitFor(() => {
      expect(screen.getByText("OFF-202610-LV16-08")).toBeInTheDocument();
    });

    // Khẳng định không có chữ "Đã thẩm định"
    expect(screen.queryByText("Đã thẩm định")).not.toBeInTheDocument();
    expect(screen.queryByText("Đã thẩm định hồ sơ SHTT hợp pháp")).not.toBeInTheDocument();

    // Khẳng định Quick specs hiển thị "Chưa đăng ký"
    expect(screen.getByText("Chưa đăng ký")).toBeInTheDocument();

    // Chuyển sang tab Specs
    const specsTab = screen.getByRole("button", {
      name: /Thông Số Kỹ Thuật/i,
    });
    fireEvent.click(specsTab);

    // Khẳng định Tech specs table hiển thị đúng thông điệp
    expect(screen.getByText("Chưa đăng ký bảo hộ SHTT hoặc là bí quyết kinh doanh")).toBeInTheDocument();
  });

  it("T-04.101 [AC-04-041]: Hiển thị quy cách và đơn vị thực tế (không gán gói giải pháp)", async () => {
    const noUnitOffer: TechnologyOffer = {
      ...mockOffer,
      unit: null,
    };
    (fetchOfferById as any).mockResolvedValueOnce(noUnitOffer);

    render(<ChiTietChaoBanPage />);
    await waitFor(() => {
      expect(screen.getByText("OFF-202610-LV16-08")).toBeInTheDocument();
    });

    // Chuyển sang tab Specs
    const specsTab = screen.getByRole("button", {
      name: /Thông Số Kỹ Thuật/i,
    });
    fireEvent.click(specsTab);

    // Khẳng định không có chuỗi fallback gói giải pháp
    expect(screen.queryByText("Theo gói giải pháp chuyển giao và đào tạo tích hợp")).not.toBeInTheDocument();

    // Khẳng định hiển thị chuỗi trung tính chuẩn hóa
    expect(screen.getByText("Đang cập nhật quy cách")).toBeInTheDocument();
  });

  it("T-04.113 [AC-04-042]: Đối với sản phẩm thương mại, Hero CTA và Sidebar CTA phân nhánh chuẩn xác", async () => {
    const commercialOffer: TechnologyOffer = {
      ...mockOffer,
      offerCode: "OFF-20261022-00025-365E",
      offerType: "PRODUCT",
      hasTechTransfer: false,
      trlLevel: null,
      title: "Chè Thịnh AN",
      pricingType: "FIXED",
      priceAmount: 1500000,
      unit: "kg",
    };
    (fetchOfferById as any).mockResolvedValueOnce(commercialOffer);

    render(<ChiTietChaoBanPage />);
    await waitFor(() => {
      expect(screen.getByText("OFF-20261022-00025-365E")).toBeInTheDocument();
    });

    // 1. Badge loại hình: "Sản phẩm thương mại"
    expect(screen.getByText("Sản phẩm thương mại")).toBeInTheDocument();

    // 2. Hero CTA: "Đặt mua sản phẩm / Kết nối thương mại"
    const heroBtn = screen.getByRole("button", { name: /Đặt mua sản phẩm \/ Kết nối thương mại/i });
    expect(heroBtn).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Đăng ký nhận chuyển giao công nghệ/i })).toBeNull();

    // 3. Sidebar CTA: "Đặt Mua Hàng / Yêu Cầu Báo Giá Sỉ"
    const sidebarBtn = screen.getByRole("button", { name: /Đặt Mua Hàng \/ Yêu Cầu Báo Giá Sỉ/i });
    expect(sidebarBtn).toBeInTheDocument();

    // 4. Sidebar tiêu đề giá: "GIÁ BÁN NIÊM YẾT / THƯƠNG MẠI"
    expect(screen.getByText("GIÁ BÁN NIÊM YẾT / THƯƠNG MẠI")).toBeInTheDocument();
    expect(screen.getByText("Xem Hồ Sơ Chất Lượng & ATTP")).toBeInTheDocument();
  });

  it("T-04.113 [AC-04-043]: Kiểm tra Tabs: Tab 1 hiển thị công dụng, Tab 2 hiển thị sản phẩm thương phẩm thương mại", async () => {
    const commercialOffer: TechnologyOffer = {
      ...mockOffer,
      offerCode: "OFF-20261022-00025-365E",
      offerType: "PRODUCT",
      hasTechTransfer: false,
      trlLevel: null,
      title: "Chè Thịnh AN",
      developerOrigin: "Hợp tác xã Chè Thịnh An - Thái Nguyên",
    };
    (fetchOfferById as any).mockResolvedValueOnce(commercialOffer);

    render(<ChiTietChaoBanPage />);
    await waitFor(() => {
      expect(screen.getByText("OFF-20261022-00025-365E")).toBeInTheDocument();
    });

    // Tab 1 (Mặc định Overview):
    expect(screen.getByText("Công Dụng & Giá Trị Mang Lại Cho Khách Hàng")).toBeInTheDocument();

    // Chuyển sang Tab 2 (Specs):
    const specsTab = screen.getByRole("button", { name: /Thông Số Kỹ Thuật/i });
    fireEvent.click(specsTab);

    // Tab 2 hiển thị rõ ràng loại hình sản phẩm thương phẩm thương mại
    expect(
      screen.getByText(/Sản phẩm thương phẩm thương mại \(Không bao gồm chuyển giao công nghệ\/quy trình sản xuất\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Đơn vị sản xuất / Chế biến:")).toBeInTheDocument();
    expect(screen.getAllByText("Hợp tác xã Chè Thịnh An - Thái Nguyên").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Bán hàng thương phẩm / Hợp đồng cung ứng đại lý")).toBeInTheDocument();
  });

  it("T-04.113 [AC-04-044]: Modal kết nối hiển thị tiêu đề thương mại, dropdown 4 options B2B và ngân sách nhỏ", async () => {
    const commercialOffer: TechnologyOffer = {
      ...mockOffer,
      offerCode: "OFF-20261022-00025-365E",
      offerType: "PRODUCT",
      hasTechTransfer: false,
      trlLevel: null,
      title: "Chè Thịnh AN",
    };
    (fetchOfferById as any).mockResolvedValueOnce(commercialOffer);

    render(<ChiTietChaoBanPage />);
    await waitFor(() => {
      expect(screen.getByText("OFF-20261022-00025-365E")).toBeInTheDocument();
    });

    // Mở modal kết nối
    const openModalBtn = screen.getByRole("button", { name: /Đặt mua sản phẩm \/ Kết nối thương mại/i });
    fireEvent.click(openModalBtn);

    // Tiêu đề Modal là "Gửi Yêu Cầu Đặt Mua / Kết Nối Thương Mại"
    expect(screen.getByText("Gửi Yêu Cầu Đặt Mua / Kết Nối Thương Mại")).toBeInTheDocument();

    // Dropdown hình thức hợp tác gồm 4 options B2B thương phẩm
    expect(screen.getByText(/Đặt mua sản phẩm theo đơn hàng \(Mua buôn \/ Mua lẻ\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Ký hợp đồng cung ứng định kỳ theo tháng\/quý/i)).toBeInTheDocument();
    expect(screen.getByText(/Đăng ký làm đại lý phân phối \/ Đại diện bán hàng/i)).toBeInTheDocument();
    expect(screen.getByText(/Đặt mua mẫu kiểm tra chất lượng/i)).toBeInTheDocument();

    // Không có options mua đứt bản quyền công nghệ hay li-xăng trong modal này
    expect(screen.queryByText(/Chuyển giao trọn gói \(Mua đứt quyền sở hữu công nghệ\)/i)).toBeNull();
    expect(screen.queryByText(/Thuê \/ Mua bản quyền khai thác có thời hạn/i)).toBeNull();

    // Dải ngân sách có các mức nhỏ phù hợp bán lẻ/sỉ
    expect(screen.getByText("Dưới 20 triệu VNĐ")).toBeInTheDocument();
    expect(screen.getByText("20 triệu - 100 triệu VNĐ")).toBeInTheDocument();
  });

  it("T-04.113 [AC-04-045]: Negative Assertions: Không xuất hiện thuật ngữ chuyển giao công nghệ, TTO, li-xăng trên hồ sơ thương phẩm", async () => {
    const commercialOffer: TechnologyOffer = {
      ...mockOffer,
      offerCode: "OFF-20261022-00025-365E",
      offerType: "PRODUCT",
      hasTechTransfer: false,
      trlLevel: null,
      title: "Chè Thịnh AN",
      developerOrigin: "Hợp tác xã Chè Thịnh An",
      ipRegistrationNumber: null,
      ipStatus: "NONE",
      unit: "hộp 500g",
    };
    (fetchOfferById as any).mockResolvedValueOnce(commercialOffer);

    render(<ChiTietChaoBanPage />);
    await waitFor(() => {
      expect(screen.getByText("OFF-20261022-00025-365E")).toBeInTheDocument();
    });

    // Khẳng định phủ định nghiêm ngặt:
    // 1. Không có "Mức giá đề xuất chuyển giao"
    expect(screen.queryByText("MỨC GIÁ ĐỀ XUẤT CHUYỂN GIAO")).toBeNull();
    expect(screen.queryByText(/Đã bao gồm hướng dẫn chuyển giao kỹ thuật/i)).toBeNull();

    // 2. Không có "TTO chuyển giao"
    expect(screen.queryByText(/TTO chuyển giao/i)).toBeNull();
    expect(screen.queryByText(/Đầu Mối TTO Chuyển Giao/i)).toBeNull();
    expect(screen.queryByText(/Đại diện TTO:/i)).toBeNull();
    expect(screen.queryByText(/Hotline TTO:/i)).toBeNull();

    // 3. Không có nút hoặc tiêu đề chuyển giao công nghệ
    expect(screen.queryByRole("button", { name: /Đăng ký nhận chuyển giao công nghệ/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Gửi Yêu Cầu Chuyển Giao Công Nghệ/i })).toBeNull();

    // 4. Không có "li-xăng"
    expect(screen.queryByText(/li-xăng/i)).toBeNull();
  });

  it("T-04.113 [AC-04-046]: Zero Regression: Hồ sơ R&D giữ nguyên vẹn 100% ngữ cảnh chuyển giao tri thức", async () => {
    const techOffer: TechnologyOffer = {
      ...mockOffer,
      offerType: "SOLUTION",
      hasTechTransfer: true,
      trlLevel: 8,
      title: "Công nghệ sấy thăng hoa và tối ưu hóa nhiệt độ",
    };
    (fetchOfferById as any).mockResolvedValueOnce(techOffer);

    render(<ChiTietChaoBanPage />);
    await waitFor(() => {
      expect(screen.getByText("OFF-202610-LV16-08")).toBeInTheDocument();
    });

    // 1. Hero CTA vẫn là "Đăng ký nhận chuyển giao công nghệ"
    expect(screen.getByRole("button", { name: /Đăng ký nhận chuyển giao công nghệ/i })).toBeInTheDocument();

    // 2. Sidebar hiển thị Mức giá đề xuất chuyển giao & TTO
    expect(screen.getByText("MỨC GIÁ ĐỀ XUẤT CHUYỂN GIAO")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Gửi Yêu Cầu Chuyển Giao Công Nghệ/i })).toBeInTheDocument();
    expect(screen.getByText("Đầu Mối TTO Chuyển Giao")).toBeInTheDocument();
    expect(screen.getByText("Đại diện TTO:")).toBeInTheDocument();
    expect(screen.getByText("Hotline TTO:")).toBeInTheDocument();

    // 3. Khối IP Quad hiển thị khi có hasTechTransfer = true
    expect(screen.getByText(/Bộ Tứ Sở Hữu Trí Tuệ & Mức Độ Sẵn Sàng Công Nghệ \(IP Quad\)/i)).toBeInTheDocument();

    // 4. Mở modal kiểm tra các hình thức chuyển giao R&D
    const openBtn = screen.getByRole("button", { name: /Đăng ký nhận chuyển giao công nghệ/i });
    fireEvent.click(openBtn);

    expect(screen.getByText(/Tạo Nhanh Nhu Cầu & Kết Nối Chuyển Giao \(Quick Demand\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Chuyển giao trọn gói \(Mua đứt quyền sở hữu công nghệ\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Thuê \/ Mua bản quyền khai thác có thời hạn \(Licensing\)/i)).toBeInTheDocument();
  });
});
