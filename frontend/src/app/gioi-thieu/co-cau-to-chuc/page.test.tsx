import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import CoCauToChucPage from "./page";
import { BACLINK_COMMITTEES, ORG } from "@/lib/constants/organization";

describe("Cơ cấu tổ chức (REQ-BL08-ABOUT-010)", () => {
  afterEach(cleanup);

  it("hiển thị đủ 9 ban, 4 khối và không bịa tên trưởng ban", () => {
    render(<CoCauToChucPage />);
    BACLINK_COMMITTEES.forEach((c) => expect(screen.getByRole("heading", { name: c.name })).toBeInTheDocument());
    expect(screen.getAllByRole("heading", { name: /^Khối / })).toHaveLength(4);
    expect(screen.getAllByText(/Trưởng ban: Đang cập nhật/)).toHaveLength(9);
    expect(screen.getByText(new RegExp(ORG.decision.number))).toBeInTheDocument();
  });

  it("có lối liên hệ đầu mối các ban", () => {
    render(<CoCauToChucPage />);
    expect(screen.getByRole("link", { name: /Liên hệ đầu mối các ban/ })).toHaveAttribute("href", "/lien-he#dau-moi-cac-ban");
  });
});
