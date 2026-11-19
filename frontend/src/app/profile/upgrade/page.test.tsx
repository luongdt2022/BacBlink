import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProfileUpgradeHubPage from "./page";
import { authClient } from "@/lib/auth-client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe("ProfileUpgradeHubPage (BACLINK Single-Flow Membership Registration)", () => {
  beforeEach(() => {
    localStorage.clear();
    authClient.setSession("test-token", {
      id: "user-1",
      email: "user@baclink.vn",
      fullName: "Thành viên BACLINK",
      role: "PUBLIC_USER",
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders unified BACLINK Enterprise Membership registration flow without 34 Sở KH&CN or 4-role split", () => {
    render(<ProfileUpgradeHubPage />);

    expect(screen.getByRole("heading", { level: 1, name: /Đăng Ký Doanh Nghiệp Hội Viên BACLINK/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Địa Bàn Hoạt Động \(Bắc Ninh\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Khu Công Nghiệp \/ Cụm CN/i)).toBeInTheDocument();
    expect(screen.queryByText(/Sở KH&CN Tiếp Nhận Thẩm Định/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Bảng So Sánh Quyền Hạn & Điều Kiện 4 Lộ Trình/i)).not.toBeInTheDocument();
  });

  it("looks up tax code, validates PDF, and submits 1-tier GLOBAL approval to ADMIN", async () => {
    const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
      if (url.includes("/api/v1/enterprises/lookup-tax/")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              found: true,
              name: "Công ty TNHH Linh kiện Điện tử Yên Phong",
              province: "Bắc Ninh",
              address: "KCN Yên Phong I, Yên Phong, Bắc Ninh",
              source: "INTERNAL",
            },
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { id: "BL-2026-001" } }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ProfileUpgradeHubPage />);

    fireEvent.change(screen.getByLabelText(/Mã Số Thuế \(MST\)/i), { target: { value: "2300123456" } });
    fireEvent.click(screen.getByRole("button", { name: /Tra Cứu MST/i }));

    await waitFor(() => {
      expect(screen.getByText(/Đã tìm thấy dữ liệu: Công ty TNHH Linh kiện Điện tử Yên Phong/i)).toBeInTheDocument();
    });

    const fileInput = screen.getByTestId("enterprise-file-input");
    const pdfFile = new File(["pdf-bytes"], "dkkd_bacninh.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [pdfFile] } });

    fireEvent.click(screen.getByLabelText(/Doanh nghiệp cam kết chịu trách nhiệm/i));
    fireEvent.click(screen.getByRole("button", { name: /Gửi Hồ Sơ Đăng Ký Hội Viên/i }));

    await waitFor(() => {
      expect(screen.getByText(/Đăng Ký Doanh Nghiệp Hội Viên BACLINK Thành Công/i)).toBeInTheDocument();
    });

    const postCall = fetchMock.mock.calls.find(([url]) => String(url).includes("/api/v1/governance/approvals"));
    expect(postCall).toBeDefined();
    const requestInit = postCall![1] as RequestInit;
    const body = JSON.parse(String(requestInit.body));
    expect(body).toMatchObject({
      requestType: "ENTERPRISE",
      scopeType: "GLOBAL",
      scopeId: null,
    });
  });

  it("blocks non-PDF files and surfaces real API errors without faking success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "Hồ sơ MST đã tồn tại trong hàng đợi duyệt." }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<ProfileUpgradeHubPage />);

    const fileInput = screen.getByTestId("enterprise-file-input");
    fireEvent.change(fileInput, {
      target: { files: [new File(["bad"], "doc.exe", { type: "application/x-msdownload" })] },
    });
    expect(screen.getByText(/Tệp Giấy chứng nhận ĐKKD bắt buộc phải là định dạng PDF/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Mã Số Thuế \(MST\)/i), { target: { value: "2300123456" } });
    fireEvent.change(screen.getByLabelText(/Tên Doanh Nghiệp \/ Tổ Chức/i), {
      target: { value: "Công ty TNHH Công nghiệp Bắc Ninh" },
    });
    fireEvent.change(fileInput, {
      target: { files: [new File(["pdf"], "dkkd.pdf", { type: "application/pdf" })] },
    });
    fireEvent.click(screen.getByLabelText(/Doanh nghiệp cam kết chịu trách nhiệm/i));
    fireEvent.click(screen.getByRole("button", { name: /Gửi Hồ Sơ Đăng Ký Hội Viên/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/Hồ sơ MST đã tồn tại/i);
    });
    expect(screen.queryByText(/Thành Công/i)).not.toBeInTheDocument();
  });
});
