import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import TaiLieuPage from "./page";
import { cmsClient, type CmsDocument } from "@/lib/cms-client";

const nav = vi.hoisted(() => ({ search: "" }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(nav.search),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/tai-lieu",
  notFound: vi.fn(),
}));

vi.mock("@/lib/cms-client", async (orig) => ({
  ...(await orig<typeof import("@/lib/cms-client")>()),
  cmsClient: { documents: vi.fn() },
}));

const docs: CmsDocument[] = [
  {
    id: "d1",
    docType: "BIEU_MAU",
    title: "Biểu mẫu đăng ký mẫu",
    description: "Mẫu đăng ký dùng chung.",
    fileUrl: "https://files.example.test/bieu-mau.pdf",
    isPublic: true,
    sortOrder: 1,
    issuedOn: "2025-06-27",
  },
];

describe("Kho tài liệu (/tai-lieu)", () => {
  beforeEach(() => {
    nav.search = "";
    vi.mocked(cmsClient.documents).mockResolvedValue(docs);
  });
  afterEach(cleanup);

  it("hiển thị tài liệu, nhãn loại, ngày ban hành và nút tải về an toàn", async () => {
    render(<TaiLieuPage />);
    expect(await screen.findByRole("heading", { level: 3, name: "Biểu mẫu đăng ký mẫu" })).toBeInTheDocument();
    expect(screen.getByText("Ban hành: 27/06/2025")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Tải về/ });
    expect(link).toHaveAttribute("href", "https://files.example.test/bieu-mau.pdf");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("trạng thái trống hiển thị 'Chưa có tài liệu' và nút gửi yêu cầu", async () => {
    vi.mocked(cmsClient.documents).mockResolvedValue([]);
    render(<TaiLieuPage />);
    expect(await screen.findByText("Chưa có tài liệu")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gửi yêu cầu" })).toBeInTheDocument();
  });

  it("đọc ?loai= từ URL để lọc theo loại tài liệu", async () => {
    nav.search = "loai=BIEU_MAU";
    render(<TaiLieuPage />);
    await screen.findByText("Biểu mẫu đăng ký mẫu");
    expect(cmsClient.documents).toHaveBeenCalledWith({ type: "BIEU_MAU", q: undefined });
    expect(screen.getByRole("link", { name: "Biểu mẫu" })).toHaveAttribute("aria-current", "page");
  });
});
