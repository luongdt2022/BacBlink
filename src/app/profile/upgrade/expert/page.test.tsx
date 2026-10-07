import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ExpertUpgradePage from "./page";

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
    expect(await screen.findByText(/Bước 2: Năng lực Chuyên môn & AI CV Parser/i)).toBeInTheDocument();
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

    expect(await screen.findByText(/Bước 3: Hồ Sơ Khoa Học & Cam Kết Pháp Lý/i)).toBeInTheDocument();

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

    // Click "Thêm"
    const addPubBtn = screen.getByRole("button", { name: /Thêm/i });
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
    vi.stubGlobal("fetch", vi.fn(async (url: string) => url.includes("/draft?") ? { ok: true, json: async () => ({ success: true, data: { fullName: "TS. Vũ Văn Liệu", phone: "0912345678", email: "lieu.vv@nacentech.vn", organization: "Viện Ứng Dụng Công Nghệ (NacenTech)", sectorCode: "LV91" } }) } : { ok: false, status: 404, json: async () => ({ message: "Not found" }) }));
    render(<ExpertUpgradePage />);

    // Verify Zalo handoff banner is displayed
    expect(await screen.findByTestId("zalo-draft-banner")).toBeInTheDocument();

    // Verify Step 1 fields are prefilled
    const fullNameInput = screen.getByPlaceholderText("TS. Nguyễn Văn An") as HTMLInputElement;
    expect(fullNameInput.value).toBe("TS. Vũ Văn Liệu");

    const phoneInput = screen.getByPlaceholderText("0912345678") as HTMLInputElement;
    expect(phoneInput.value).toBe("0912345678");

    const emailInput = screen.getByPlaceholderText("chuyengia@nacentech.vn") as HTMLInputElement;
    expect(emailInput.value).toBe("lieu.vv@nacentech.vn");

    const orgInput = screen.getByPlaceholderText("Viện Đổi Mới Sáng Tạo Quốc Gia (NacenTech)") as HTMLInputElement;
    expect(orgInput.value).toBe("Viện Ứng Dụng Công Nghệ (NacenTech)");

    // Can proceed directly to Step 2 because prefilled name is valid
    const continueBtn = screen.getByRole("button", { name: /Tiếp tục: Năng lực Chuyên môn/i });
    fireEvent.click(continueBtn);

    expect(await screen.findByText(/Bước 2: Năng lực Chuyên môn & AI CV Parser/i)).toBeInTheDocument();
  });
});
