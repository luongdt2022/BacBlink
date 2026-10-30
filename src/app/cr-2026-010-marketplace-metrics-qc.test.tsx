import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import React from "react";
import HomePage from "./page";
import ChaoBanCongNghePage from "./chao-ban-cong-nghe/page";
import PublicDemandsPage from "./nhu-cau-cong-nghe/page";
import { portalClient } from "@/lib/portal-client";
import * as masterDataClient from "@/lib/master-data-client";
import * as techApi from "@/services/api/technology-offer";

// Mocks for Next.js navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, refresh: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/services/api/technology-offer", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/api/technology-offer")>();
  return {
    ...actual,
    fetchPublicOffers: vi.fn().mockResolvedValue({ total: 0, data: [] }),
  };
});

describe("CR-2026-010: QC Zero-Mock & Taxonomy SSOT Verification Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    vi.stubGlobal("fetch", vi.fn(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/v1/portal/stats")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              totalOffers: 14,
              totalDemands: 23,
              totalEnterprises: 484,
              totalExperts: 7,
              totalProvinces: 36,
              updatedAt: "2026-10-30T06:22:27Z",
              totalSuccessfulConnections: 5,
              totalEstimatedValueMillionVnd: 58400,
            },
          }),
        };
      }
      if (urlStr.includes("/api/v1/master-data/sectors")) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: [
              { id: "1", code: "LV01", name: "Nông nghiệp", tt17Code: "Liên ngành" },
              { id: "2", code: "LV05", name: "Chế biến thực phẩm – đồ uống", tt17Code: "C.10, C.11" },
              { id: "3", code: "LV07", name: "Cơ khí – chế tạo – công nghiệp hỗ trợ", tt17Code: "C.32" },
              { id: "4", code: "LV08", name: "Điện – điện tử – tự động hóa", tt17Code: "C.26, C.27" },
              { id: "5", code: "LV11", name: "Nước – môi trường – chất thải", tt17Code: "E.38" },
              { id: "6", code: "LV12", name: "Xây dựng – vật liệu – hạ tầng", tt17Code: "C.23" },
              { id: "7", code: "LV14", name: "Logistics – vận tải – kho bãi", tt17Code: "H.52" },
              { id: "8", code: "LV15", name: "Du lịch – khách sạn – nhà hàng", tt17Code: "Dịch vụ" },
              { id: "9", code: "LV16", name: "CNTT – viễn thông – chuyển đổi số", tt17Code: "Công nghệ số" },
              { id: "10", code: "LV17", name: "Khoa học – công nghệ – đổi mới sáng tạo", tt17Code: "M.72" },
            ],
            total: 10,
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({ data: [], total: 0 }),
      };
    }));
  });

  afterEach(() => {
    cleanup();
  });

  /* =========================================================================
   * 1. TRANG CHỦ (/)
   * ========================================================================= */
  describe("TC-QC-HOME: Trang Chủ (/) Marketplace Metrics & Zero-Mock Invariant", () => {
    it("renders 4 dynamic Marketplace Metrics matching Portal stats DTO without mock strings", async () => {
      vi.spyOn(portalClient, "getStats").mockImplementation(async () => ({
        totalOffers: 14,
        totalDemands: 23,
        totalEnterprises: 484,
        totalExperts: 7,
        totalProvinces: 36,
        updatedAt: "2026-10-30T06:22:27Z",
        totalSuccessfulConnections: 5,
        totalEstimatedValueMillionVnd: 58400,
      }));

      render(<HomePage />);

      // Wait for stats to load
      await waitFor(() => {
        expect(screen.getByText("14")).toBeInTheDocument();
        expect(screen.getByText("23")).toBeInTheDocument();
        expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("58,4 Tỷ VNĐ")).toBeInTheDocument();
      });

      // Strict Zero-Mock: Negative checks
      expect(screen.queryByText("1.200+")).toBeNull();
      expect(screen.queryByText("680+")).toBeNull();
      expect(screen.queryByText("142 bài toán")).toBeNull();
      expect(screen.queryByText("68.5 tỷ")).toBeNull();
    });

    it("handles Error state on Trang Chủ stats with [Tải lại số liệu] retry action", async () => {
      vi.spyOn(portalClient, "getStats").mockRejectedValue(new Error("Network Error"));

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText("Không thể tải số liệu thống kê thời gian thực.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Tải lại số liệu/i })).toBeInTheDocument();
      });
    });
  });

  /* =========================================================================
   * 2. SÀN NHU CẦU (/nhu-cau-cong-nghe)
   * ========================================================================= */
  describe("TC-QC-DEMAND: Sàn Nhu Cầu (/nhu-cau-cong-nghe) Zero-Mock & Taxonomy", () => {
    it("renders 3 Quick Metrics from dynamic API and strictly eliminates '142', '68.5 tỷ', '24 Giờ'", async () => {
      vi.spyOn(portalClient, "getStats").mockResolvedValue({
        totalOffers: 14,
        totalDemands: 23,
        totalEnterprises: 484,
        totalExperts: 7,
        totalProvinces: 36,
        updatedAt: "2026-10-30T06:22:27Z",
        totalSuccessfulConnections: 5,
        totalEstimatedValueMillionVnd: 58400,
      });

      vi.spyOn(masterDataClient, "getActiveSectors").mockResolvedValue([
        { id: "1", code: "LV01", name: "Nông nghiệp", tt17Code: "Liên ngành" },
        { id: "2", code: "LV05", name: "Chế biến thực phẩm – đồ uống", tt17Code: "C.10, C.11" },
        { id: "3", code: "LV07", name: "Cơ khí – chế tạo – công nghiệp hỗ trợ", tt17Code: "C.32" },
        { id: "4", code: "LV08", name: "Điện – điện tử – tự động hóa", tt17Code: "C.26, C.27" },
        { id: "5", code: "LV11", name: "Nước – môi trường – chất thải", tt17Code: "E.38" },
        { id: "6", code: "LV12", name: "Xây dựng – vật liệu – hạ tầng", tt17Code: "C.23" },
        { id: "7", code: "LV14", name: "Logistics – vận tải – kho bãi", tt17Code: "H.52" },
        { id: "8", code: "LV15", name: "Du lịch – khách sạn – nhà hàng", tt17Code: "Dịch vụ" },
        { id: "9", code: "LV16", name: "CNTT – viễn thông – chuyển đổi số", tt17Code: "Công nghệ số" },
        { id: "10", code: "LV17", name: "Khoa học – công nghệ – đổi mới sáng tạo", tt17Code: "M.72" },
      ]);

      render(<PublicDemandsPage />);

      await waitFor(() => {
        expect(screen.getByText("23")).toBeInTheDocument();
        expect(screen.getByText("58,4 Tỷ")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
      });

      // Strict Zero-Mock: Negative checks
      expect(screen.queryByText("142")).toBeNull();
      expect(screen.queryByText("142 bài toán")).toBeNull();
      expect(screen.queryByText("68.5 tỷ")).toBeNull();
      expect(screen.queryByText("24 Giờ")).toBeNull();
      expect(screen.queryByText("24 giờ hỗ trợ")).toBeNull();
    });

    it("verifies combobox contains exactly 10 TT17 sectors from Master Data API without custom sector codes", async () => {
      vi.spyOn(masterDataClient, "getActiveSectors").mockResolvedValue([
        { id: "1", code: "LV01", name: "Nông nghiệp", tt17Code: "Liên ngành" },
        { id: "2", code: "LV05", name: "Chế biến thực phẩm – đồ uống", tt17Code: "C.10, C.11" },
        { id: "3", code: "LV07", name: "Cơ khí – chế tạo – công nghiệp hỗ trợ", tt17Code: "C.32" },
        { id: "4", code: "LV08", name: "Điện – điện tử – tự động hóa", tt17Code: "C.26, C.27" },
        { id: "5", code: "LV11", name: "Nước – môi trường – chất thải", tt17Code: "E.38" },
        { id: "6", code: "LV12", name: "Xây dựng – vật liệu – hạ tầng", tt17Code: "C.23" },
        { id: "7", code: "LV14", name: "Logistics – vận tải – kho bãi", tt17Code: "H.52" },
        { id: "8", code: "LV15", name: "Du lịch – khách sạn – nhà hàng", tt17Code: "Dịch vụ" },
        { id: "9", code: "LV16", name: "CNTT – viễn thông – chuyển đổi số", tt17Code: "Công nghệ số" },
        { id: "10", code: "LV17", name: "Khoa học – công nghệ – đổi mới sáng tạo", tt17Code: "M.72" },
      ]);

      render(<PublicDemandsPage />);

      await waitFor(() => {
        expect(screen.getByText("Nông nghiệp")).toBeInTheDocument();
        expect(screen.getByText("Khoa học – công nghệ – đổi mới sáng tạo")).toBeInTheDocument();
      });

      // Strict negative checks: No invented/legacy sector codes
      expect(screen.queryByText("SEC-01")).toBeNull();
      expect(screen.queryByText("AG")).toBeNull();
      expect(screen.queryByText("FOOD")).toBeNull();
      expect(screen.queryByText("MECH")).toBeNull();
    });
  });

  /* =========================================================================
   * 3. SÀN CHÀO BÁN (/chao-ban-cong-nghe) - QC AUDIT DEFECT RESOLUTION (DEFECT-01)
   * ========================================================================= */
  describe("TC-QC-OFFER: Sàn Chào Bán (/chao-ban-cong-nghe) Zero-Mock & 5 UX States", () => {
    it("strictly eliminates fallback static strings '1.200+', '680+', '10 Ngành' (DEFECT-01 fixed)", async () => {
      render(<ChaoBanCongNghePage />);

      // On initial render or empty data, page must never render fallback static strings
      const textContent = document.body.textContent || "";
      const hasHardcodedOffer = textContent.includes("1.200+") || textContent.includes("680+") || textContent.includes("10 Ngành");
      expect(hasHardcodedOffer).toBe(false);
    });

    it("renders dynamic Hero Quick Metrics with portalStats and activeSectors via <Async>", async () => {
      vi.spyOn(portalClient, "getStats").mockResolvedValue({
        totalOffers: 14,
        totalDemands: 23,
        totalEnterprises: 484,
        totalExperts: 7,
        totalProvinces: 36,
        updatedAt: "2026-10-30T06:22:27Z",
        totalSuccessfulConnections: 5,
        totalEstimatedValueMillionVnd: 58400,
      });

      render(<ChaoBanCongNghePage />);

      await waitFor(() => {
        expect(screen.getByText("14")).toBeInTheDocument();
        expect(screen.getByText("Hồ Sơ Niêm Yết")).toBeInTheDocument();
        expect(screen.getByText("Phân Loại TT17")).toBeInTheDocument();
        expect(screen.getByText("Sáng Chế Độc Quyền")).toBeInTheDocument();
      });
    });

    it("handles Error state on Hero Quick Metrics with [Tải lại số liệu] retry action", async () => {
      vi.spyOn(portalClient, "getStats").mockRejectedValue(new Error("Network Error"));

      render(<ChaoBanCongNghePage />);

      await waitFor(() => {
        expect(screen.getByText("Không thể tải số liệu thống kê.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Tải lại số liệu/i })).toBeInTheDocument();
      });
    });
  });
});
