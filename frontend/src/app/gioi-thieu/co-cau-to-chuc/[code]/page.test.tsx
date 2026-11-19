import React, { Suspense } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { notFound } from "next/navigation";
import CommitteeDetailPage from "./page";
import { cmsClient, type CmsArticlePage } from "@/lib/cms-client";
import { BACLINK_COMMITTEES } from "@/lib/constants/organization";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/gioi-thieu/co-cau-to-chuc",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/cms-client", async (orig) => ({
  ...(await orig<typeof import("@/lib/cms-client")>()),
  cmsClient: { articles: vi.fn(), documents: vi.fn() },
}));

const emptyPage: CmsArticlePage = { data: [], total: 0, page: 1, totalPages: 1, categories: [] };

// params là Promise (React 19 use()): phải render trong act async để Suspense được giải quyết.
const renderPage = async (code: string) => {
  await act(async () => {
    render(
      <Suspense fallback={null}>
        <CommitteeDetailPage params={Promise.resolve({ code })} />
      </Suspense>,
    );
  });
};

describe("Chi tiết một ban (/gioi-thieu/co-cau-to-chuc/[code])", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cmsClient.articles).mockResolvedValue(emptyPage);
    vi.mocked(cmsClient.documents).mockResolvedValue([]);
  });
  afterEach(cleanup);

  it("code không tồn tại thì gọi notFound", async () => {
    await renderPage("KHONG_TON_TAI");
    await waitFor(() => expect(notFound).toHaveBeenCalled());
  });

  it("code hợp lệ hiển thị tên ban, trưởng ban đang cập nhật và truy vấn đúng ban", async () => {
    const ban = BACLINK_COMMITTEES[0];
    await renderPage(ban.code);
    expect(await screen.findByRole("heading", { level: 1, name: ban.name })).toBeInTheDocument();
    expect(screen.getByText("Trưởng ban: Đang cập nhật")).toBeInTheDocument();
    expect(cmsClient.articles).toHaveBeenCalledWith({ committee: ban.code, limit: 6 });
    expect(cmsClient.documents).toHaveBeenCalledWith({ committee: ban.code });
    expect(notFound).not.toHaveBeenCalled();
  });

  it("so khớp code không phân biệt hoa thường", async () => {
    const ban = BACLINK_COMMITTEES[1];
    await renderPage(ban.code.toLowerCase());
    expect(await screen.findByRole("heading", { level: 1, name: ban.name })).toBeInTheDocument();
  });

  it("không có bài viết thì hiển thị 'Chưa có tin hoạt động'", async () => {
    await renderPage(BACLINK_COMMITTEES[0].code);
    expect(await screen.findByText("Chưa có tin hoạt động")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Liên hệ ban này" })).toBeInTheDocument();
  });
});
