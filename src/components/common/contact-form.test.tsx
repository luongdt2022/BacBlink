import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ContactForm } from "./contact-form";

vi.mock("next/navigation", () => ({ usePathname: () => "/lien-he" }));

const fill = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe("ContactForm (REQ-BL08-CONTACT-009)", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("chặn gửi khi thiếu tên, thiếu cả SĐT lẫn email, nội dung quá ngắn", async () => {
    render(<ContactForm />);
    fireEvent.click(screen.getByRole("button", { name: /Gửi yêu cầu/ }));
    expect(await screen.findByText("Vui lòng nhập họ và tên")).toBeInTheDocument();
    expect(screen.getByText(/Cần số điện thoại hoặc email/)).toBeInTheDocument();
    expect(screen.getByText(/Nội dung tối thiểu 10 ký tự/)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("gửi hợp lệ → gọi API công khai kèm sourcePath, hiển thị xác nhận", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ success: true, data: { id: "abc" } }), { status: 200 }));
    render(<ContactForm defaultTopic="MEMBERSHIP" />);
    fill(/Họ và tên/, "Nguyễn Văn A");
    fill(/Số điện thoại/, "0912345678");
    fill(/Nội dung/, "Tôi muốn tìm hiểu thủ tục gia nhập");
    fireEvent.click(screen.getByRole("button", { name: /Gửi yêu cầu/ }));
    expect(await screen.findByText("Đã gửi yêu cầu thành công")).toBeInTheDocument();
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain("/api/v1/public/contact-requests");
    const body = JSON.parse(String((init as RequestInit).body));
    expect(body).toMatchObject({ fullName: "Nguyễn Văn A", phone: "0912345678", topic: "MEMBERSHIP", sourcePath: "/lien-he", website: "" });
  });

  it("báo lỗi thân thiện khi bị giới hạn tần suất (429)", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("{}", { status: 429 }));
    render(<ContactForm />);
    fill(/Họ và tên/, "B");
    fill(/Email/, "b@congty.vn");
    fill(/Nội dung/, "Nội dung đủ dài để gửi");
    fireEvent.click(screen.getByRole("button", { name: /Gửi yêu cầu/ }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/quá nhiều yêu cầu/));
  });
});
