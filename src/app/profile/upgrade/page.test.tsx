import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProfileUpgradeHubPage from "./page";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe("ProfileUpgradeHubPage (AC-DELTA-12..16)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders all 4 upgrade route cards and comparison matrix (AC-DELTA-12)", () => {
    render(<ProfileUpgradeHubPage />);

    expect(screen.getByText(/Lựa Chọn Lộ Trình Nâng Hạng Tài Khoản/i)).toBeInTheDocument();

    // 4 Cards presence
    expect(screen.getByRole("heading", { name: "Chuyên Gia KH&CN" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Doanh Nghiệp ĐMST" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bên Mua (Buyer)" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bên Bán (Seller)" })).toBeInTheDocument();

    // Matrix
    expect(screen.getByText(/Bảng So Sánh Quyền Hạn & Điều Kiện 4 Lộ Trình/i)).toBeInTheDocument();
  });

  it("routes Expert to /profile/upgrade/expert and Buyer to /khao-sat-nhu-cau (AC-DELTA-13)", () => {
    render(<ProfileUpgradeHubPage />);

    const expertLink = screen.getByRole("link", { name: /Nâng hạng Chuyên gia \(3 Bước\)/i });
    expect(expertLink).toHaveAttribute("href", "/profile/upgrade/expert");

    const buyerLink = screen.getByRole("link", { name: /Khảo Sát Nhu Cầu & Bài Toán \(7 Bước\)/i });
    expect(buyerLink).toHaveAttribute("href", "/khao-sat-nhu-cau");
  });

  it("opens Enterprise modal, looks up tax code and submits verification (AC-DELTA-14)", async () => {
    render(<ProfileUpgradeHubPage />);

    // Click open enterprise modal
    const openBtn = screen.getByRole("button", { name: /Xác thực MST Doanh Nghiệp/i });
    fireEvent.click(openBtn);

    expect(screen.getByText("Nâng Cấp Hồ Sơ — Doanh Nghiệp ĐMST")).toBeInTheDocument();

    // Fill MST
    const mstInput = screen.getByPlaceholderText("0101234567");
    fireEvent.change(mstInput, { target: { value: "0109998888" } });

    // Click Tra cuu MST
    const lookupBtn = screen.getByRole("button", { name: /Tra Cứu MST/i });
    fireEvent.click(lookupBtn);

    await waitFor(() => {
      expect(screen.getByText(/✓ Đã tìm thấy dữ liệu doanh nghiệp hợp lệ/i)).toBeInTheDocument();
    });

    // Check legal pledge and submit
    const pledgeCheckbox = screen.getByRole("checkbox");
    fireEvent.click(pledgeCheckbox);

    const submitBtn = screen.getByRole("button", { name: /Gửi Hồ Sơ Thẩm Định/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Nộp Hồ Sơ Doanh Nghiệp ĐMST Thành Công/i)).toBeInTheDocument();
    });
  });

  it("opens Seller modal and verifies 2 legal entity tabs (CR-2026-021)", () => {
    render(<ProfileUpgradeHubPage />);

    // Click open seller modal
    const openBtn = screen.getByRole("button", { name: /Đăng Ký Gian Hàng Seller/i });
    fireEvent.click(openBtn);

    expect(screen.getByText("Đăng Ký Mở Gian Hàng — Bên Bán (Seller)")).toBeInTheDocument();
    expect(screen.getByTestId("seller-tab-enterprise")).toBeInTheDocument();
    expect(screen.getByTestId("seller-tab-institution")).toBeInTheDocument();
  });

  it("submits shop registration as Enterprise with tax lookup and PDF file (AC-DELTA-15 / CR-2026-021)", async () => {
    render(<ProfileUpgradeHubPage />);

    const openBtn = screen.getByRole("button", { name: /Đăng Ký Gian Hàng Seller/i });
    fireEvent.click(openBtn);

    // Điền MST và tra cứu
    const mstInput = screen.getByPlaceholderText("0101234567");
    fireEvent.change(mstInput, { target: { value: "0101234567" } });

    const lookupBtn = screen.getByRole("button", { name: /Tra Cứu MST/i });
    fireEvent.click(lookupBtn);

    await waitFor(() => {
      expect(screen.getByText(/✓ Đã tìm thấy dữ liệu doanh nghiệp hợp lệ/i)).toBeInTheDocument();
    });

    // Upload tệp ĐKKD PDF
    const fileInput = screen.getByTestId("seller-file-input");
    const pdfFile = new File(["dummy pdf content"], "dkkd_seller.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [pdfFile] } });

    // Mô tả năng lực và cam kết
    const descInput = screen.getByPlaceholderText(/Tóm tắt các sáng chế/i);
    fireEvent.change(descInput, { target: { value: "Cung cấp nền tảng số và hệ sinh thái IoT công nghiệp đạt TRL 8." } });

    const pledgeCheckbox = screen.getByLabelText(/Đơn vị cam kết tuân thủ quy chế/i);
    fireEvent.click(pledgeCheckbox);

    const submitBtn = screen.getByRole("button", { name: /Nộp Đơn Đăng Ký/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Đăng Ký Mở Gian Hàng Seller Thành Công/i)).toBeInTheDocument();
    });
  });

  it("submits shop registration as Institution R&D with decision number and PDF file (CR-2026-021)", async () => {
    render(<ProfileUpgradeHubPage />);

    const openBtn = screen.getByRole("button", { name: /Đăng Ký Gian Hàng Seller/i });
    fireEvent.click(openBtn);

    // Chuyển sang Tab Viện / Trường / R&D
    const instTab = screen.getByTestId("seller-tab-institution");
    fireEvent.click(instTab);

    // Điền Số QĐ và Tên Viện
    const decisionInput = screen.getByPlaceholderText("Ví dụ: 128/QĐ-BKHCN");
    fireEvent.change(decisionInput, { target: { value: "128/QĐ-BKHCN" } });

    const orgInput = screen.getByPlaceholderText("Ví dụ: Viện Hàn Lâm Khoa Học & Công Nghệ Việt Nam");
    fireEvent.change(orgInput, { target: { value: "Viện Hàn Lâm Khoa Học & Công Nghệ Việt Nam" } });

    // Upload tệp Quyết định PDF
    const fileInput = screen.getByTestId("seller-file-input");
    const pdfFile = new File(["decision pdf content"], "quyet_dinh_128.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [pdfFile] } });

    // Mô tả năng lực và cam kết
    const descInput = screen.getByPlaceholderText(/Tóm tắt các sáng chế/i);
    fireEvent.change(descInput, { target: { value: "Sở hữu 05 Bằng độc quyền sáng chế về vật liệu Graphene TRL 6-7." } });

    const pledgeCheckbox = screen.getByLabelText(/Đơn vị cam kết tuân thủ quy chế/i);
    fireEvent.click(pledgeCheckbox);

    const submitBtn = screen.getByRole("button", { name: /Nộp Đơn Đăng Ký/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Đăng Ký Mở Gian Hàng Seller Thành Công/i)).toBeInTheDocument();
    });
  });

  it("validates file format and blocks non-pdf or oversized files in Seller modal (CR-2026-021)", async () => {
    render(<ProfileUpgradeHubPage />);

    const openBtn = screen.getByRole("button", { name: /Đăng Ký Gian Hàng Seller/i });
    fireEvent.click(openBtn);

    const fileInput = screen.getByTestId("seller-file-input");

    // Tệp không phải PDF (.exe)
    const invalidFile = new File(["evil code"], "malware.exe", { type: "application/x-msdownload" });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(screen.getByText(/Tệp văn bản pháp lý minh chứng bắt buộc phải là định dạng PDF/i)).toBeInTheDocument();

    // Tệp dung lượng > 10MB
    const largeFile = new File(["huge"], "big_document.pdf", { type: "application/pdf" });
    Object.defineProperty(largeFile, "size", { value: 12 * 1024 * 1024 });
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(screen.getByText(/Dung lượng tệp vượt quá giới hạn 10MB cho phép/i)).toBeInTheDocument();
  });

  it("displays existing submitted expert application banner and edit button when user has submitted", async () => {
    const mockExpertProfile = {
      id: "exp-001",
      expertCode: "EXP-2026-001",
      fullName: "TS. Nguyễn Minh Đức",
      academicDegree: "TS",
      primaryInstitution: "Viện Ứng Dụng Công Nghệ NacenTech",
      status: "PENDING_APPROVAL",
      scopeId: "HN",
    };

    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (typeof url === "string" && url.includes("/api/v1/experts/my-profile")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockExpertProfile }),
        };
      }
      return { ok: true, status: 200, json: async () => ({ success: true }) };
    }));

    render(<ProfileUpgradeHubPage />);

    // Verify submitted application banner appears
    await waitFor(() => {
      expect(screen.getByTestId("submitted-application-banner")).toBeInTheDocument();
      expect(screen.getByText("TS. Nguyễn Minh Đức")).toBeInTheDocument();
      expect(screen.getByText(/Đang Chờ Hội Đồng Thẩm Định/i)).toBeInTheDocument();
      expect(screen.getByText(/Viện Ứng Dụng Công Nghệ NacenTech/i)).toBeInTheDocument();
    });

    // Verify Action links
    const editBtn = screen.getByRole("link", { name: /Chỉnh sửa & Cập nhật đơn/i });
    expect(editBtn).toHaveAttribute("href", "/profile/upgrade/expert?edit=true");

    const detailBtn = screen.getByRole("link", { name: /Xem chi tiết hồ sơ/i });
    expect(detailBtn).toHaveAttribute("href", "/profile/upgrade/expert");

    // Card 1 button updated
    const cardEditLink = screen.getByRole("link", { name: /Xem & Chỉnh sửa đơn đã nộp/i });
    expect(cardEditLink).toHaveAttribute("href", "/profile/upgrade/expert?edit=true");
  });

  it("displays REJECTED status badge, reviewer note and re-apply links when expert application was rejected", async () => {
    const mockRejectedProfile = {
      id: "exp-999",
      expertCode: "EXP-REJECTED-001",
      fullName: "PGS.TS. Trần Đình Long",
      academicDegree: "PGS",
      primaryInstitution: "Viện Hàn Lâm KH&CN",
      status: "REJECTED",
      reviewerNote: "Hồ sơ thiếu minh chứng công bố khoa học trong 3 năm gần nhất theo Quyết định 15/QĐ-BKHCN.",
      scopeId: "GLOBAL",
    };

    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (typeof url === "string" && url.includes("/api/v1/experts/my-profile")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockRejectedProfile }),
        };
      }
      return { ok: true, status: 200, json: async () => ({ success: true }) };
    }));

    render(<ProfileUpgradeHubPage />);

    await waitFor(() => {
      expect(screen.getByTestId("submitted-application-banner")).toBeInTheDocument();
      expect(screen.getByText("PGS.TS. Trần Đình Long")).toBeInTheDocument();
      // Phải hiển thị badge REJECTED
      expect(screen.getByText(/Hồ Sơ Đã Bị Từ Chối \(REJECTED\)/i)).toBeInTheDocument();
      // Không được hiển thị "Đang chờ Hội đồng thẩm định"
      expect(screen.queryByText(/Đang Chờ Hội Đồng Thẩm Định/i)).not.toBeInTheDocument();
      // Phải hiển thị lý do từ chối từ reviewerNote
      expect(screen.getByText(/Hồ sơ thiếu minh chứng công bố khoa học/i)).toBeInTheDocument();
      // Nút chỉnh sửa chuyển thành "Chỉnh sửa & Nộp lại"
      expect(screen.getByRole("link", { name: /^Chỉnh sửa & Nộp lại$/i })).toHaveAttribute("href", "/profile/upgrade/expert?edit=true");
    });
  });
});
