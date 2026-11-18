import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ExpertUpgradePage from "./page";
import { authClient } from "@/lib/auth-client";

const push = vi.fn();
let mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => mockSearchParams,
}));
vi.mock("next/link", () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));

describe("ExpertUpgradePage Validation (TC-C1-EXP-01 & TC-C1-EXP-06 & TC-C3-SUB-13)", () => {
  beforeEach(() => {
    localStorage.clear();
    mockSearchParams = new URLSearchParams();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: "Not found" }),
    }));
  });

  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it("blocks step progression and displays Vietnamese error if full name is empty (TC-C1-EXP-01)", async () => {
    render(<ExpertUpgradePage />);

    // Step 1 is rendered
    expect(screen.getByText(/Bước 1: Thông tin Định danh & Học vị Khoa học/i)).toBeInTheDocument();

    // Clear full name
    const fullNameInput = screen.getByPlaceholderText("TS. Nguyễn Văn An");
    fireEvent.change(fullNameInput, { target: { value: "   " } });

    // Click continue
    const continueBtn = screen.getByRole("button", { name: /Tiếp tục: Năng lực Chuyên môn/i });
    fireEvent.click(continueBtn);

    // Verify step 2 is blocked and error message appears
    expect(screen.getByText("Vui lòng nhập họ và tên đầy đủ.")).toBeInTheDocument();
    expect(screen.queryByText(/Bước 2: Năng lực Chuyên môn/i)).not.toBeInTheDocument();

    // Now fill full name and click continue -> should proceed to step 2
    fireEvent.change(fullNameInput, { target: { value: "TS. Nguyễn Minh An" } });
    expect(screen.queryByText("Vui lòng nhập họ và tên đầy đủ.")).not.toBeInTheDocument();

    fireEvent.click(continueBtn);
    expect(await screen.findByText(/Bước 2: Năng lực Chuyên môn/i)).toBeInTheDocument();
  });

  it("restricts publication year to max 2026 and validates input (TC-C1-EXP-06)", async () => {
    render(<ExpertUpgradePage />);

    // Fill valid name and proceed to Step 2
    const fullNameInput = screen.getByPlaceholderText("TS. Nguyễn Văn An");
    fireEvent.change(fullNameInput, { target: { value: "TS. Trần Văn Bình" } });
    fireEvent.click(screen.getByRole("button", { name: /Tiếp tục: Năng lực Chuyên môn/i }));

    // Proceed to Step 3
    const step3Btn = await screen.findByRole("button", { name: /Tiếp tục: Công bố & Cam kết/i });
    fireEvent.click(step3Btn);

    expect(await screen.findByText(/Bước 3: Công bố & Cam kết/i)).toBeInTheDocument();

    // Find publication inputs
    const titleInput = screen.getByPlaceholderText("Tên bài báo khoa học");
    const journalInput = screen.getByPlaceholderText("Tạp chí / Kỷ yếu hội thảo");
    const yearInput = screen.getByDisplayValue("2025");

    // Verify input has max="2026"
    expect(yearInput).toHaveAttribute("max", "2026");

    // Try to enter future year 2028
    fireEvent.change(yearInput, { target: { value: "2028" } });
    expect(screen.getByText("Năm công bố không được lớn hơn năm 2026.")).toBeInTheDocument();

    fireEvent.change(titleInput, { target: { value: "Nghiên cứu công nghệ tương lai" } });
    fireEvent.change(journalInput, { target: { value: "Tạp chí KHCN" } });

    // Click "Thêm công bố"
    const addPubBtn = screen.getByRole("button", { name: /Thêm công bố/i });
    fireEvent.click(addPubBtn);

    // Publication with 2028 should NOT be added
    expect(screen.queryByText("Nghiên cứu công nghệ tương lai")).not.toBeInTheDocument();
    expect(screen.getByText("Năm công bố không được lớn hơn năm 2026.")).toBeInTheDocument();

    // Enter valid year 2024
    fireEvent.change(yearInput, { target: { value: "2024" } });
    expect(screen.queryByText("Năm công bố không được lớn hơn năm 2026.")).not.toBeInTheDocument();

    fireEvent.click(addPubBtn);

    // Publication with 2024 is added successfully
    expect(screen.getByText("Nghiên cứu công nghệ tương lai")).toBeInTheDocument();
  });

  it("prefills Zalo handoff draft data when draftToken URL parameter is present (TC-C3-SUB-13)", async () => {
    mockSearchParams = new URLSearchParams("draftToken=DRAFT_ZALO_DEMO_01");
    // Explicit mocked provider contract; no reliance on static fallback or black-box claim.
    vi.stubGlobal("fetch", vi.fn(async (url: string) => url.includes("/draft?") ? { ok: true, json: async () => ({ success: true, data: { fullName: "TS. Vũ Văn Liệu", phone: "0912345678", email: "lieu.vv@baclink.org.vn", organization: "Trung tâm R&D Công nghiệp Bắc Ninh", sectorCode: "IND_ELEC" } }) } : { ok: false, status: 404, json: async () => ({ message: "Not found" }) }));
    render(<ExpertUpgradePage />);

    // Verify Zalo handoff banner is displayed
    expect(await screen.findByTestId("zalo-draft-banner")).toBeInTheDocument();

    // Verify Step 1 fields are prefilled
    const fullNameInput = screen.getByPlaceholderText("TS. Nguyễn Văn An") as HTMLInputElement;
    expect(fullNameInput.value).toBe("TS. Vũ Văn Liệu");

    const phoneInput = screen.getByPlaceholderText("0912345678") as HTMLInputElement;
    expect(phoneInput.value).toBe("0912345678");

    const emailInput = screen.getByPlaceholderText("chuyengia@baclink.org.vn") as HTMLInputElement;
    expect(emailInput.value).toBe("lieu.vv@baclink.org.vn");

    const orgInput = screen.getByPlaceholderText("Đại học Bách Khoa Hà Nội / Trung tâm R&D Bắc Ninh") as HTMLInputElement;
    expect(orgInput.value).toBe("Trung tâm R&D Công nghiệp Bắc Ninh");

    // Can proceed directly to Step 2 because prefilled name is valid
    const continueBtn = screen.getByRole("button", { name: /Tiếp tục: Năng lực Chuyên môn/i });
    fireEvent.click(continueBtn);

    expect(await screen.findByText(/Bước 2: Năng lực Chuyên môn/i)).toBeInTheDocument();
  });

  it("renders 3 updated Stepper step labels and Hero Dropzone at the top of Step 1 (T-DELTA-03)", async () => {
    render(<ExpertUpgradePage />);

    // 1. Check Stepper labels
    expect(screen.getByText("Quét CV & Định danh")).toBeInTheDocument();
    expect(screen.getByText("Năng lực Chuyên môn")).toBeInTheDocument();
    expect(screen.getByText("Công bố & Cam kết")).toBeInTheDocument();

    // 2. Check AI CV Hero Dropzone is rendered on Step 1
    expect(screen.getByText(/AI Trích Xuất Dữ Liệu Hồ Sơ Tự Động \(AI CV Scan\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Kéo thả tệp CV \/ Lý lịch khoa học vào đây/i)).toBeInTheDocument();
    expect(screen.getByText(/Dùng tệp CV mẫu để thử nghiệm nhanh/i)).toBeInTheDocument();

    // 3. Check Divider
    expect(screen.getByText(/Hoặc nhập liệu thủ công từng bước bên dưới/i)).toBeInTheDocument();
  });

  it("performs Non-destructive Auto-fill across 3 steps and displays AI badges (T-DELTA-04 & T-DELTA-05)", async () => {
    const mockCvData = {
      fullName: "GS. TS. Lê Hoài Nam",
      birthYear: 1978,
      gender: "Nam",
      academicDegree: "GS",
      primaryInstitution: "Viện Hàn Lâm Khoa Học và Công Nghệ VN",
      workAddress: "18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội",
      professionalTitle: "Nghiên cứu viên cao cấp",
      primaryDomain: "LV91",
      specializedKeywords: ["Trí tuệ nhân tạo", "Thị giác máy tính"],
      yearsOfExperience: 18,
      bioSummary: "Chuyên gia đầu ngành về xử lý ảnh và thị giác máy tính.",
      googleScholarUrl: "https://scholar.google.com/citations?user=test1234",
      orcidId: "0000-0001-2345-6789",
      scopusAuthorId: "57211122233",
      publications: [
        {
          title: "Deep Learning for Satellite Imagery",
          year: 2024,
          journalOrConference: "IEEE Transactions on Geoscience",
          doiOrUrl: "10.1109/TGRS.2024.123456",
        },
      ],
      patents: [
        {
          title: "Hệ thống phân loại ảnh tự động",
          patentNumber: "VN-PAT-2023-9999",
          year: 2023,
          status: "GRANTED",
        },
      ],
    };

    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (typeof url === "string" && url.includes("/api/cv-parser")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            model: "Gemini 3.5 Flash",
            data: mockCvData,
          }),
        };
      }
      return { ok: false, status: 404, json: async () => ({ message: "Not found" }) };
    }));

    render(<ExpertUpgradePage />);

    // Fill sample CV
    const sampleCvBtn = screen.getByRole("button", { name: /Dùng tệp CV mẫu để thử nghiệm nhanh/i });
    fireEvent.click(sampleCvBtn);

    // Mock file input with a real file to trigger scan
    const file = new File(["dummy cv content"], "cv_sample.pdf", { type: "application/pdf" });
    const fileInput = document.querySelector("#cv-file-upload") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Trigger AI Scan
    const scanBtn = screen.getByRole("button", { name: /Bắt đầu Quét & Bóc Tách AI/i });
    fireEvent.click(scanBtn);

    // Wait for scan success message
    expect(await screen.findByText(/Trích xuất thành công/i)).toBeInTheDocument();

    // Verify Step 1 fields prefilled
    const fullNameInput = screen.getByPlaceholderText("TS. Nguyễn Văn An") as HTMLInputElement;
    expect(fullNameInput.value).toBe("GS. TS. Lê Hoài Nam");

    const instInput = screen.getByPlaceholderText("Đại học Bách Khoa Hà Nội / Trung tâm R&D Bắc Ninh") as HTMLInputElement;
    expect(instInput.value).toBe("Viện Hàn Lâm Khoa Học và Công Nghệ VN");

    // Verify AI badges are rendered
    const badges = screen.getAllByText("✨ AI Bóc tách");
    expect(badges.length).toBeGreaterThanOrEqual(3);

    // Proceed to Step 2
    fireEvent.click(screen.getByRole("button", { name: /Tiếp tục: Năng lực Chuyên môn/i }));
    expect(await screen.findByText(/Bước 2: Năng lực Chuyên môn/i)).toBeInTheDocument();

    // Verify Step 2 prefilled tags
    expect(screen.getByText("Trí tuệ nhân tạo")).toBeInTheDocument();
    expect(screen.getByText("Thị giác máy tính")).toBeInTheDocument();

    // Proceed to Step 3
    fireEvent.click(screen.getByRole("button", { name: /Tiếp tục: Công bố & Cam kết/i }));
    expect(await screen.findByText(/Bước 3: Công bố & Cam kết/i)).toBeInTheDocument();

    // Verify Step 3 prefilled publication and patent
    expect(screen.getByText("Deep Learning for Satellite Imagery")).toBeInTheDocument();
    expect(screen.getByText("Hệ thống phân loại ảnh tự động")).toBeInTheDocument();
  });

  it("handles AI scan error gracefully with Zero-Lock Fallback (T-DELTA-05)", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (typeof url === "string" && url.includes("/api/cv-parser")) {
        return {
          ok: false,
          status: 502,
          json: async () => ({
            success: false,
            error: "Quá tải model AI. Bạn có thể tiếp tục nhập liệu thủ công.",
            fallbackManual: true,
          }),
        };
      }
      return { ok: false, status: 404, json: async () => ({ message: "Not found" }) };
    }));

    render(<ExpertUpgradePage />);

    // Upload a file and scan
    const file = new File(["dummy content"], "cv.pdf", { type: "application/pdf" });
    const fileInput = document.querySelector("#cv-file-upload") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    const scanBtn = screen.getByRole("button", { name: /Bắt đầu Quét & Bóc Tách AI/i });
    fireEvent.click(scanBtn);

    // Verify error notification does not crash the form
    expect(await screen.findByText(/Quá tải model AI/i)).toBeInTheDocument();
    expect(screen.getByText(/Bạn có thể tiếp tục nhập liệu thủ công từng bước bên dưới mà không bị gián đoạn./i)).toBeInTheDocument();

    // Form remains completely usable for manual input
    const fullNameInput = screen.getByPlaceholderText("TS. Nguyễn Văn An");
    fireEvent.change(fullNameInput, { target: { value: "TS. Hoàng Minh Thủ Công" } });

    const continueBtn = screen.getByRole("button", { name: /Tiếp tục: Năng lực Chuyên môn/i });
    fireEvent.click(continueBtn);

    // Successfully transitioned to Step 2
    expect(await screen.findByText(/Bước 2: Năng lực Chuyên môn/i)).toBeInTheDocument();
  });

  it("prefills email and phone from user context on mount when available", async () => {
    authClient.setSession("test_token", {
      id: "u-123",
      fullName: "Dang Tien Luong",
      email: "luong.dt@baclink.org.vn",
      phone: "0987654321",
      role: "USER",
    });

    render(<ExpertUpgradePage />);

    const fullNameInput = (await screen.findByPlaceholderText("TS. Nguyễn Văn An")) as HTMLInputElement;
    expect(fullNameInput.value).toBe("Dang Tien Luong");

    const phoneInput = (await screen.findByPlaceholderText("0912345678")) as HTMLInputElement;
    expect(phoneInput.value).toBe("0987654321");

    const emailInput = (await screen.findByPlaceholderText("chuyengia@baclink.org.vn")) as HTMLInputElement;
    expect(emailInput.value).toBe("luong.dt@baclink.org.vn");
  });

  it("falls back to user context for email and phone when AI scan does not extract them", async () => {
    authClient.setSession("test_token", {
      id: "u-123",
      fullName: "Dang Tien Luong",
      email: "fallback.user@baclink.org.vn",
      phone: "0911223344",
      role: "USER",
    });

    const mockCvDataWithoutContact = {
      fullName: "Dang Tien Luong",
      birthYear: 1985,
      gender: "Nam",
      academicDegree: "TS",
      primaryInstitution: "HBLab",
    };

    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (typeof url === "string" && url.includes("/api/cv-parser")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            model: "gemini-3.5-flash-lite",
            data: mockCvDataWithoutContact,
          }),
        };
      }
      return { ok: false, status: 404, json: async () => ({ message: "Not found" }) };
    }));

    render(<ExpertUpgradePage />);

    // Wait for form to load
    await screen.findByPlaceholderText("TS. Nguyễn Văn An");

    // Upload and scan
    const file = new File(["dummy cv content"], "cv.pdf", { type: "application/pdf" });
    const fileInput = document.querySelector("#cv-file-upload") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    const scanBtn = screen.getByRole("button", { name: /Bắt đầu Quét & Bóc Tách AI/i });
    fireEvent.click(scanBtn);

    expect(await screen.findByText(/Trích xuất thành công/i)).toBeInTheDocument();

    const phoneInput = (await screen.findByPlaceholderText("0912345678")) as HTMLInputElement;
    expect(phoneInput.value).toBe("0911223344");

    const emailInput = (await screen.findByPlaceholderText("chuyengia@baclink.org.vn")) as HTMLInputElement;
    expect(emailInput.value).toBe("fallback.user@baclink.org.vn");
  });

  it("executes CR-2026-021 enhancements: overrides demo name, prefills degreeYear, selects suggested receiving unit, and renders click-to-add sector keyword pills", async () => {
    // 1. Initial user has demo placeholder name
    authClient.setSession("test_token", {
      id: "u-demo",
      fullName: "Dang Lanm",
      email: "demo@baclink.org.vn",
      phone: "0987654321",
      role: "USER",
    });

    const mockB14Data = {
      fullName: "Bành Quốc Tuấn",
      birthYear: 1980,
      gender: "Nam",
      academicDegree: "TS",
      degreeYear: 2011,
      primaryInstitution: "Viện Khoa Học Công Nghệ Vật Liệu Bán Dẫn",
      workAddress: "C6 Thanh Xuân Bắc, Thanh Xuân, Hà Nội",
      suggestedReceivingUnit: {
        code: "KCN_YENPHONG_BN",
        type: "PROVINCE",
        name: "Ban Hỗ trợ Kỹ thuật KCN Yên Phong",
        reason: "Chuyên sâu bán dẫn & quang điện tử KCN Yên Phong",
      },
      primaryDomain: "IND_ELEC",
      rawSectorKeywords: ["Quang điện tử", "Laser", "Vật liệu bán dẫn"],
      yearsOfExperience: 15,
      specializedKeywords: [],
    };

    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (typeof url === "string" && url.includes("/api/cv-parser")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            model: "gemini-3.8-flash",
            data: mockB14Data,
          }),
        };
      }
      return { ok: false, status: 404, json: async () => ({ message: "Not found" }) };
    }));

    render(<ExpertUpgradePage />);

    // Wait for form mount with initial demo name
    const fullNameInput = (await screen.findByPlaceholderText("TS. Nguyễn Văn An")) as HTMLInputElement;
    expect(fullNameInput.value).toBe("Dang Lanm");

    // Upload & Scan
    const file = new File(["cv B1-4 content"], "B1-4-BanhQuocTuan.doc", { type: "application/msword" });
    const fileInput = document.querySelector("#cv-file-upload") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    const scanBtn = screen.getByRole("button", { name: /Bắt đầu Quét & Bóc Tách AI/i });
    fireEvent.click(scanBtn);

    expect(await screen.findByText(/Trích xuất thành công/i)).toBeInTheDocument();

    // Verify overridden demo name to parsed real name
    expect(fullNameInput.value).toBe("Bành Quốc Tuấn");

    // Verify degreeYear prefilled to 2011
    const degreeYearInput = screen.getByDisplayValue("2011") as HTMLInputElement;
    expect(degreeYearInput).toBeInTheDocument();

    // Verify receivingUnit prefilled to KCN_YENPHONG_BN
    const receivingSelect = screen.getByDisplayValue("Ban Hỗ trợ Kỹ thuật KCN Yên Phong") as HTMLSelectElement;
    expect(receivingSelect.value).toBe("KCN_YENPHONG_BN");

    // Proceed to Step 2
    fireEvent.click(screen.getByRole("button", { name: /Tiếp tục: Năng lực Chuyên môn/i }));
    expect(await screen.findByText(/Bước 2: Năng lực Chuyên môn/i)).toBeInTheDocument();

    // Verify raw suggested sector keywords block appears with pill buttons
    expect(screen.getByText(/Từ khóa chuyên ngành AI phát hiện từ CV \(Nhấp để thêm nhanh\):/i)).toBeInTheDocument();
    const optoPill = screen.getByRole("button", { name: /\+ Quang điện tử/i });
    expect(optoPill).toBeInTheDocument();

    // Click pill to add to specializedKeywords
    fireEvent.click(optoPill);
    expect(screen.getByText("Quang điện tử")).toBeInTheDocument();
  });

  it("blocks step 1 progression when degreeYear is before or too close to birthYear (DEF-05-CR021-03)", async () => {
    render(<ExpertUpgradePage />);

    // Fill valid name
    const fullNameInput = screen.getByPlaceholderText("TS. Nguyễn Văn An");
    fireEvent.change(fullNameInput, { target: { value: "TS. Hoàng Quốc Bảo" } });

    // Set birthYear = 2000
    const birthYearInput = screen.getByDisplayValue("1985");
    fireEvent.change(birthYearInput, { target: { value: "2000" } });

    // Set degreeYear = 2010 (< birthYear + 20 = 2020)
    const degreeYearInputs = screen.getAllByRole("spinbutton");
    // Find degreeYear input
    const degreeYearInput = degreeYearInputs.find(
      (input) => (input as HTMLInputElement).min === "1950"
    ) as HTMLInputElement;
    expect(degreeYearInput).toBeInTheDocument();

    fireEvent.change(degreeYearInput, { target: { value: "2010" } });

    // Click continue
    const continueBtn = screen.getByRole("button", { name: /Tiếp tục: Năng lực Chuyên môn/i });
    fireEvent.click(continueBtn);

    // Verify step 2 is blocked and error message appears
    expect(
      screen.getByText("Năm đạt học vị không thể trước hoặc quá gần năm sinh (tối thiểu 20 năm).")
    ).toBeInTheDocument();
    expect(screen.queryByText(/Bước 2: Năng lực Chuyên môn/i)).not.toBeInTheDocument();

    // Now fix degreeYear to 2024 (>= 2000 + 20)
    fireEvent.change(degreeYearInput, { target: { value: "2024" } });
    expect(
      screen.queryByText("Năm đạt học vị không thể trước hoặc quá gần năm sinh (tối thiểu 20 năm).")
    ).not.toBeInTheDocument();

    // Click continue again -> successfully advances to Step 2
    fireEvent.click(continueBtn);
    expect(await screen.findByText(/Bước 2: Năng lực Chuyên môn/i)).toBeInTheDocument();
  });

  it("handles REJECTED status with backend DTO mapping and pre-fills form without data loss", async () => {
    authClient.setSession("test_token", {
      id: "p-001",
      fullName: "TS. Nguyễn Minh An",
      email: "minhan@baclink.org.vn",
      phone: "0912345678",
      role: "USER",
    });

    const mockRejectedBackendData = {
      id: "exp-rej-001",
      personId: "p-001",
      fullName: "TS. Nguyễn Minh An",
      birthYear: 1982,
      gender: "male",
      degree: "DOCTOR",
      degreeYear: 2012,
      organizationName: "Viện Hàn Lâm Khoa Học và Công Nghệ VN",
      organizationAddress: "18 Hoàng Quốc Việt, Cầu Giấy, Hà Nội",
      researchTitle: "Chuyên gia Trí tuệ Nhân tạo Cao cấp",
      expertiseSectors: ["LV05"],
      consultingSummary: "Tư vấn chuyển đổi số và kiến trúc AI cho các doanh nghiệp",
      reviewerNote: "Hồ sơ chưa có đủ bài báo Scopus Q1 theo tiêu chí nâng hạng.",
      status: "REJECTED",
    };

    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (typeof url === "string" && url.includes("/api/v1/experts/my-profile")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockRejectedBackendData }),
        };
      }
      return { ok: false, status: 404, json: async () => ({ message: "Not found" }) };
    }));

    render(<ExpertUpgradePage />);

    // 1. Phải hiển thị màn hình chi tiết thông báo hồ sơ bị từ chối
    expect(await screen.findByText(/Hồ Sơ Đã Bị Từ Chối Phê Duyệt/i)).toBeInTheDocument();
    // Phải hiển thị lý do từ chối
    expect(screen.getByText(/Hồ sơ chưa có đủ bài báo Scopus Q1 theo tiêu chí nâng hạng/i)).toBeInTheDocument();

    // 2. Click "Chỉnh sửa & Nộp lại hồ sơ"
    const editBtn = screen.getByRole("button", { name: /Chỉnh sửa & Nộp lại hồ sơ/i });
    fireEvent.click(editBtn);

    // Form Step 1 phải xuất hiện và giữ nguyên dữ liệu đã nộp (Zero Data Loss)
    expect(await screen.findByText(/Bước 1: Thông tin Định danh & Học vị Khoa học/i)).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText("TS. Nguyễn Văn An") as HTMLInputElement;
    expect(nameInput.value).toBe("TS. Nguyễn Minh An");

    const orgInput = screen.getByPlaceholderText("Đại học Bách Khoa Hà Nội / Trung tâm R&D Bắc Ninh") as HTMLInputElement;
    expect(orgInput.value).toBe("Viện Hàn Lâm Khoa Học và Công Nghệ VN");

    const titleInput = screen.getByPlaceholderText("Nghiên cứu viên chính / Trưởng nhóm Lab") as HTMLInputElement;
    expect(titleInput.value).toBe("Chuyên gia Trí tuệ Nhân tạo Cao cấp");

    // Học vị DOCTOR map thành TS
    const degreeSelect = screen.getByDisplayValue("Tiến sĩ (TS)") as HTMLSelectElement;
    expect(degreeSelect.value).toBe("TS");
  });
});
