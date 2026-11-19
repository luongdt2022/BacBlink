import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ThuVienPage from "./page";
import { cmsClient, type CmsMedia } from "@/lib/cms-client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/thu-vien",
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
}));

vi.mock("@/lib/cms-client", async (orig) => ({
  ...(await orig<typeof import("@/lib/cms-client")>()),
  cmsClient: { media: vi.fn() },
}));

const media: CmsMedia[] = [
  { id: "m1", kind: "IMAGE", album: "Album mẫu A", title: "Ảnh mẫu 1", url: "https://img.example.test/1.jpg", isPublic: true, sortOrder: 1 },
  { id: "m2", kind: "VIDEO", album: "Album mẫu A", title: "Video mẫu 1", url: "https://video.example.test/v1", isPublic: true, sortOrder: 2 },
];

describe("Thư viện ảnh & video (/thu-vien)", () => {
  beforeEach(() => {
    vi.mocked(cmsClient.media).mockResolvedValue(media);
  });
  afterEach(cleanup);

  it("gom theo album, ảnh lazy-load có alt, video chỉ là liên kết mở tab mới", async () => {
    const { container } = render(<ThuVienPage />);
    expect(await screen.findByRole("heading", { level: 2, name: "Album mẫu A" })).toBeInTheDocument();
    const img = screen.getByAltText("Ảnh mẫu 1");
    expect(img).toHaveAttribute("loading", "lazy");
    const videoLink = screen.getByRole("link", { name: "Mở video: Video mẫu 1" });
    expect(videoLink).toHaveAttribute("href", "https://video.example.test/v1");
    expect(videoLink).toHaveAttribute("target", "_blank");
    expect(videoLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("trạng thái trống hiển thị 'Chưa có ảnh/video' kèm liên kết tin tức", async () => {
    vi.mocked(cmsClient.media).mockResolvedValue([]);
    render(<ThuVienPage />);
    expect(await screen.findByText("Chưa có ảnh/video")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Xem tin tức/ })).toHaveAttribute("href", "/tin-tuc");
  });

  it("bấm ảnh mở lightbox và phím Esc đóng lại", async () => {
    render(<ThuVienPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Phóng to ảnh: Ảnh mẫu 1" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
