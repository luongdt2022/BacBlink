import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import DieuLePage from "./page";
import { cmsClient, type CmsDocument } from "@/lib/cms-client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/gioi-thieu/dieu-le",
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
}));

vi.mock("@/lib/cms-client", async (orig) => ({
  ...(await orig<typeof import("@/lib/cms-client")>()),
  cmsClient: { documents: vi.fn() },
}));

const docs: CmsDocument[] = [
  { id: "dl1", docType: "DIEU_LE", title: "Điều lệ mẫu", fileUrl: "https://files.example.test/dieu-le.pdf", isPublic: true, sortOrder: 1 },
];

describe("Điều lệ & quy chế (/gioi-thieu/dieu-le)", () => {
  beforeEach(() => {
    vi.mocked(cmsClient.documents).mockResolvedValue(docs);
  });
  afterEach(cleanup);

  it("tải đúng loại DIEU_LE và liệt kê tệp tải về", async () => {
    render(<DieuLePage />);
    expect(await screen.findByRole("heading", { level: 3, name: "Điều lệ mẫu" })).toBeInTheDocument();
    expect(cmsClient.documents).toHaveBeenCalledWith({ type: "DIEU_LE" });
    const link = screen.getByRole("link", { name: /Tải về/ });
    expect(link).toHaveAttribute("href", "https://files.example.test/dieu-le.pdf");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("trạng thái trống hiển thị thông báo đang cập nhật và nút liên hệ", async () => {
    vi.mocked(cmsClient.documents).mockResolvedValue([]);
    render(<DieuLePage />);
    expect(await screen.findByText("Điều lệ Hiệp hội đang được cập nhật")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Liên hệ Văn phòng" })).toBeInTheDocument();
  });

  it("có breadcrumb Trang chủ / Về BACLINK / Điều lệ & quy chế", async () => {
    render(<DieuLePage />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toHaveTextContent("Trang chủ / Về BACLINK / Điều lệ & quy chế");
  });
});
