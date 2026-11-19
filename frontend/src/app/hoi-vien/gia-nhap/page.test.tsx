import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const submitJoin = vi.fn();
const upload = vi.fn();
vi.mock("@/lib/membership-client", async (orig) => {
  const real = await orig<typeof import("@/lib/membership-client")>();
  return {
    ...real,
    membershipClient: {
      tiers: vi.fn(async () => [
        { code: "OFFICIAL_S", name: "Chính thức – DN nhỏ", memberType: "OFFICIAL", audience: "<100 LĐ", annualFee: 3000000, joiningFee: 1000000, sortOrder: 3, isActive: true },
        { code: "OFFICIAL_L", name: "Chính thức – DN lớn", memberType: "OFFICIAL", audience: ">300 LĐ", annualFee: 10000000, joiningFee: 1000000, sortOrder: 1, isActive: true },
      ]),
      mine: vi.fn(async () => null),
    },
    submitJoinApplication: (...a: unknown[]) => submitJoin(...a),
    uploadLegalDoc: (...a: unknown[]) => upload(...a),
  };
});
vi.mock("@/lib/master-data-client", () => ({
  getActiveSectors: vi.fn(async () => [{ code: "IND_MECH", name: "Cơ khí chính xác" }]),
  getBacNinhLocations: vi.fn(async (o?: { type?: string }) =>
    o?.type === "AREA" ? [{ code: "TIEN_DU", name: "H. Tiên Du" }] : [{ code: "KCN_TIEN_SON", name: "KCN Tiên Sơn", areaCode: "TIEN_DU" }, { code: "KCN_QV", name: "KCN Quế Võ I", areaCode: "QUE_VO" }]
  ),
}));
const getUser = vi.fn();
vi.mock("@/lib/auth-client", () => ({ authClient: { getUser: () => getUser(), getToken: () => "t", setSession: vi.fn() } }));

import JoinWizardPage from "./page";

const fill = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe("Wizard gia nhập (REQ-BL08-JOIN-005)", () => {
  beforeEach(() => {
    sessionStorage.clear();
    submitJoin.mockReset().mockResolvedValue({ id: "abcd1234-0000" });
    upload.mockReset().mockResolvedValue("/files/gpkd.pdf");
  });
  afterEach(cleanup);

  it("khách chưa đăng nhập bắt đầu từ bước Tạo tài khoản và bị chặn khi thiếu dữ liệu", async () => {
    getUser.mockReturnValue(null);
    render(<JoinWizardPage />);
    expect(await screen.findByRole("heading", { name: /Bước 1/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Tiếp tục/ }));
    expect(await screen.findByText("Email không hợp lệ")).toBeInTheDocument();
    expect(screen.getByText(/Cần đồng ý chính sách/)).toBeInTheDocument();
  });

  it("người đã đăng nhập vào thẳng bước 2; KCN lọc theo địa bàn; quy mô gợi ý hạng; gửi đủ payload", async () => {
    getUser.mockReturnValue({ id: "u1", email: "a@cty.vn", fullName: "Nguyễn A", role: "PUBLIC_USER" });
    render(<JoinWizardPage />);
    expect(await screen.findByRole("heading", { name: /Bước 2/ })).toBeInTheDocument();
    await screen.findByRole("option", { name: "H. Tiên Du" });

    fill(/Mã số thuế/, "2300900099");
    fill(/Tên doanh nghiệp/, "Công ty TNHH Thử Nghiệm");
    fireEvent.change(screen.getByLabelText(/Địa bàn/), { target: { value: "H. Tiên Du" } });
    const kcn = screen.getByLabelText(/Khu \/ cụm công nghiệp/) as HTMLSelectElement;
    expect(Array.from(kcn.options).map((o) => o.text)).toEqual(["— Ngoài KCN / chưa xác định —", "KCN Tiên Sơn"]);
    fireEvent.change(kcn, { target: { value: "KCN Tiên Sơn" } });
    fireEvent.change(screen.getByLabelText(/Nhóm ngành/), { target: { value: "IND_MECH" } });
    fireEvent.change(screen.getByLabelText(/Quy mô lao động/), { target: { value: "Trên 300 lao động" } });
    expect((screen.getByLabelText(/Loại hội viên đăng ký/) as HTMLSelectElement).value).toBe("OFFICIAL_L");
    fill(/Giới thiệu doanh nghiệp/, "Gia công cơ khí chính xác cho FDI tại Bắc Ninh");
    fill(/Chức danh/, "Giám đốc");
    fill(/^Số điện thoại \*/, "0912345678");
    fireEvent.change(screen.getByLabelText("Chọn tệp giấy phép"), { target: { files: [new File(["%PDF"], "gpkd.pdf", { type: "application/pdf" })] } });

    fireEvent.click(screen.getByRole("button", { name: /Tiếp tục/ }));
    expect(await screen.findByRole("heading", { name: /Bước 3/ })).toBeInTheDocument();
    expect(screen.getByText(/Công ty TNHH Thử Nghiệm \(MST 2300900099\)/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Gửi hồ sơ gia nhập/ }));
    expect(await screen.findByText(/Vui lòng xác nhận cả hai cam kết/)).toBeInTheDocument();
    screen.getAllByRole("checkbox").forEach((c) => fireEvent.click(c));
    fireEvent.click(screen.getByRole("button", { name: /Gửi hồ sơ gia nhập/ }));

    expect(await screen.findByRole("heading", { name: "Đã gửi hồ sơ gia nhập" })).toBeInTheDocument();
    expect(upload).toHaveBeenCalledTimes(1);
    const sent = submitJoin.mock.calls[0][0];
    expect(sent).toMatchObject({
      taxCode: "2300900099", district: "H. Tiên Du", industrialZone: "KCN Tiên Sơn", sectorCode: "IND_MECH",
      tierCode: "OFFICIAL_L", representativeName: "Nguyễn A", representativeEmail: "a@cty.vn", legalDocUrl: "/files/gpkd.pdf",
    });
    expect(sent.acceptedCharterAt).toBeTruthy();
  });

  it("chặn bước 2 khi thiếu giấy phép hoặc tệp không phải PDF", async () => {
    getUser.mockReturnValue({ id: "u1", email: "a@cty.vn", fullName: "A", role: "PUBLIC_USER" });
    render(<JoinWizardPage />);
    await screen.findByRole("heading", { name: /Bước 2/ });
    fireEvent.change(screen.getByLabelText("Chọn tệp giấy phép"), { target: { files: [new File(["x"], "anh.png", { type: "image/png" })] } });
    fireEvent.click(screen.getByRole("button", { name: /Tiếp tục/ }));
    await waitFor(() => expect(screen.getByText("Chỉ nhận tệp PDF")).toBeInTheDocument());
    expect(screen.getByText("Mã số thuế gồm 10 hoặc 13 chữ số")).toBeInTheDocument();
  });
});
