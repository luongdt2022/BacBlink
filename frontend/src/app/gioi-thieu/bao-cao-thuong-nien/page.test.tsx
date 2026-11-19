import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import BaoCaoThuongNienPage from "./page";
import { cmsClient, type CmsDocument } from "@/lib/cms-client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/gioi-thieu/bao-cao-thuong-nien",
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
}));

vi.mock("@/lib/cms-client", async (orig) => ({
  ...(await orig<typeof import("@/lib/cms-client")>()),
  cmsClient: { documents: vi.fn() },
}));

const docs: CmsDocument[] = [
  { id: "r1", docType: "BAO_CAO_THUONG_NIEN", title: "Báo cáo năm cũ", fileUrl: "https://files.example.test/cu.pdf", isPublic: true, sortOrder: 1, issuedOn: "2023-01-10" },
  { id: "r2", docType: "BAO_CAO_THUONG_NIEN", title: "Báo cáo năm mới", fileUrl: "https://files.example.test/moi.pdf", isPublic: true, sortOrder: 2, issuedOn: "2025-02-01" },
];

describe("Thành tựu & báo cáo thường niên (/gioi-thieu/bao-cao-thuong-nien)", () => {
  beforeEach(() => {
    vi.mocked(cmsClient.documents).mockResolvedValue(docs);
  });
  afterEach(cleanup);

  it("tải đúng loại và sắp xếp theo ngày ban hành giảm dần", async () => {
    render(<BaoCaoThuongNienPage />);
    await screen.findByRole("heading", { level: 3, name: "Báo cáo năm mới" });
    expect(cmsClient.documents).toHaveBeenCalledWith({ type: "BAO_CAO_THUONG_NIEN" });
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["Báo cáo năm mới", "Báo cáo năm cũ"]);
  });

  it("nút tải về có href đúng và rel an toàn", async () => {
    render(<BaoCaoThuongNienPage />);
    const links = await screen.findAllByRole("link", { name: /Tải về/ });
    expect(links[0]).toHaveAttribute("href", "https://files.example.test/moi.pdf");
    expect(links[0]).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("trạng thái trống hiển thị thông báo đang cập nhật", async () => {
    vi.mocked(cmsClient.documents).mockResolvedValue([]);
    render(<BaoCaoThuongNienPage />);
    expect(await screen.findByText("Báo cáo thường niên đang được cập nhật")).toBeInTheDocument();
  });
});
