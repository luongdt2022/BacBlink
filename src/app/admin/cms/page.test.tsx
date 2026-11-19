import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const list = vi.fn();
const save = vi.fn();
const remove = vi.fn();
const article = vi.fn();
vi.mock("@/lib/cms-client", async (orig) => {
  const real = await orig<typeof import("@/lib/cms-client")>();
  return { ...real, cmsClient: { ...real.cmsClient, admin: { list: (k: string) => list(k), save: (...a: unknown[]) => save(...a), remove: (...a: unknown[]) => remove(...a), article: (...a: unknown[]) => article(...a) } } };
});
vi.mock("@/lib/membership-client", () => ({ uploadLegalDoc: vi.fn(async () => "/files/x.pdf") }));
const success = vi.fn();
const error = vi.fn();
vi.mock("@/components/common/toast", () => ({ useToast: () => ({ success, error, info: vi.fn() }) }));

import AdminCmsPage from "./page";

describe("/admin/cms (T-01.BL09.11)", () => {
  beforeEach(() => {
    list.mockReset().mockResolvedValue([{ id: "a1", title: "Bài đã có", status: "PUBLISHED", categorySlug: "hoat-dong" }]);
    save.mockReset().mockResolvedValue({});
    remove.mockReset().mockResolvedValue({});
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); success.mockReset(); error.mockReset(); });

  it("liệt kê bài viết; thêm mới → xuất bản gửi đúng payload", async () => {
    render(<AdminCmsPage />);
    expect(await screen.findByText("Bài đã có")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Thêm mới/ }));
    fireEvent.change(screen.getByLabelText(/Tiêu đề/), { target: { value: "Chính sách ưu đãi 2027" } });
    fireEvent.change(screen.getByLabelText("Danh mục"), { target: { value: "chinh-sach-moi" } });
    fireEvent.change(screen.getByLabelText(/Thẻ/), { target: { value: "ưu đãi, thuế" } });
    fireEvent.click(screen.getByRole("button", { name: "Xuất bản" }));
    await waitFor(() => expect(save).toHaveBeenCalled());
    const [kind, id, body] = save.mock.calls[0];
    expect(kind).toBe("articles");
    expect(id).toBeNull();
    expect(body).toMatchObject({ title: "Chính sách ưu đãi 2027", categorySlug: "chinh-sach-moi", tags: ["ưu đãi", "thuế"], publish: true, committeeCode: null });
    expect(success).toHaveBeenCalledWith("Đã xuất bản bài viết");
  });

  it("không cho lưu bài thiếu tiêu đề", async () => {
    render(<AdminCmsPage />);
    await screen.findByText("Bài đã có");
    fireEvent.click(screen.getByRole("button", { name: /Thêm mới/ }));
    fireEvent.click(screen.getByRole("button", { name: "Lưu nháp" }));
    expect(error).toHaveBeenCalledWith("Vui lòng nhập tiêu đề");
    expect(save).not.toHaveBeenCalled();
  });

  it("tab Tài liệu: ngày/ban để trống được gửi là null; xóa cần xác nhận", async () => {
    list.mockResolvedValue([{ id: "d1", title: "Điều lệ", docType: "DIEU_LE", isPublic: true }]);
    render(<AdminCmsPage />);
    fireEvent.click(await screen.findByRole("tab", { name: "Tài liệu" }));
    expect(await screen.findByText("Điều lệ")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Thêm mới/ }));
    fireEvent.change(screen.getByLabelText(/Tiêu đề/), { target: { value: "Báo cáo ngành cơ khí" } });
    fireEvent.change(screen.getByLabelText("Tệp tài liệu"), { target: { value: "https://x.vn/a.pdf" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    await waitFor(() => expect(save).toHaveBeenCalled());
    const body = save.mock.calls[0][2] as Record<string, unknown>;
    expect(body).toMatchObject({ docType: "BAO_CAO_NGANH", fileUrl: "https://x.vn/a.pdf" });
    expect(body.committeeCode ?? null).toBeNull(); // để trống → không gửi / gửi null
    expect(body.issuedOn ?? null).toBeNull();

    vi.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Xóa Điều lệ" }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith("documents", "d1"));
  });
});
