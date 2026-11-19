import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const mine = vi.fn();
const requestRenewal = vi.fn();
vi.mock("@/lib/membership-client", async (orig) => {
  const real = await orig<typeof import("@/lib/membership-client")>();
  return { ...real, membershipClient: { mine: () => mine(), requestRenewal: () => requestRenewal() } };
});
const success = vi.fn();
vi.mock("@/components/common/toast", () => ({ useToast: () => ({ success, error: vi.fn() }) }));

import PortalMembershipPage from "./page";

const base = {
  id: "m1", enterpriseId: "e1", enterpriseName: "Công ty A", taxCode: "2300900001", sectorName: "Cơ khí", provinceCity: "Bắc Ninh",
  tierCode: "OFFICIAL_M", tierName: "Chính thức – DN vừa", certificateNo: "BL-2026-0001", validFrom: "2026-01-01", validTo: "2026-12-31",
  feeAmount: 6000000, feePaidAt: null, isFeatured: false, renewalRequestedAt: null, statusNote: null, feePaid: false,
};

describe("Portal · Tư cách hội viên (REQ-BL08-MEMBER-PORTAL-007)", () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it("chưa là hội viên → hiện lối đăng ký", async () => {
    mine.mockResolvedValue(null);
    render(<PortalMembershipPage />);
    expect(await screen.findByText(/chưa có tư cách hội viên/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Đăng ký hội viên" })).toHaveAttribute("href", "/hoi-vien/gia-nhap");
  });

  it("đang hiệu lực, còn xa hạn → không hiện banner gia hạn, có link chứng nhận", async () => {
    mine.mockResolvedValue({ ...base, status: "ACTIVE", daysLeft: 200, expiringSoon: false });
    render(<PortalMembershipPage />);
    expect(await screen.findByText("BL-2026-0001")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Gửi yêu cầu gia hạn/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Xem \/ in chứng nhận/ })).toHaveAttribute("href", "/portal/membership/chung-nhan");
    expect(screen.getByText("Chưa ghi nhận đóng phí")).toBeInTheDocument();
  });

  it("sắp hết hạn → gửi yêu cầu gia hạn", async () => {
    mine.mockResolvedValueOnce({ ...base, status: "ACTIVE", daysLeft: 12, expiringSoon: true }).mockResolvedValue({ ...base, status: "ACTIVE", daysLeft: 12, expiringSoon: true, renewalRequestedAt: "2026-11-19T00:00:00Z" });
    requestRenewal.mockResolvedValue({ requested: true });
    render(<PortalMembershipPage />);
    expect(await screen.findByText(/sẽ hết hạn sau 12 ngày/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Gửi yêu cầu gia hạn/ }));
    await waitFor(() => expect(requestRenewal).toHaveBeenCalled());
    expect(await screen.findByText(/Đã gửi yêu cầu gia hạn/)).toBeInTheDocument();
  });

  it("tạm ngưng → banner đỏ nêu lý do", async () => {
    mine.mockResolvedValue({ ...base, status: "SUSPENDED", statusNote: "Quá hạn 90 ngày", daysLeft: -120, expiringSoon: false });
    render(<PortalMembershipPage />);
    expect(await screen.findByText(/tạm ngưng: Quá hạn 90 ngày/)).toBeInTheDocument();
  });
});
