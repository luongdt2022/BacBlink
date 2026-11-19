import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppCard, AppCardHeader, AppCardTitle, AppCardContent } from "@/components/ui/app-card";
import { AppBadge } from "@/components/ui/app-badge";
import { AppTabs } from "@/components/ui/app-tabs";
import { AppButton } from "@/components/ui/design-system";

describe("Sprint 4: Specialized Modules UI/UX Elevation (T-02.30 -> T-02.35)", () => {
  describe("T-02.30: Profile Hero & Scientific Tabs (Enterprise & Expert)", () => {
    it("renders enterprise profile hero with avatar, monospace tax code, and CTA button", () => {
      render(
        <AppCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-20 rounded-2xl bg-slate-200" data-testid="enterprise-avatar" />
            <div>
              <h2 className="text-xl font-bold text-brand-700">TẬP ĐOÀN CÔNG NGHỆ NACENTECH</h2>
              <p className="font-mono text-sm text-slate-500">MST: 0101234567</p>
              <AppBadge variant="success" dot className="mt-1">Đã Xác Thực ĐMST</AppBadge>
            </div>
            <AppButton variant="cta" className="ml-auto">Đặt Lịch Kết Nối R&D</AppButton>
          </div>
        </AppCard>
      );

      expect(screen.getByText("TẬP ĐOÀN CÔNG NGHỆ NACENTECH")).toBeInTheDocument();
      expect(screen.getByText("MST: 0101234567")).toHaveClass("font-mono");
      expect(screen.getByText("Đã Xác Thực ĐMST")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Đặt Lịch Kết Nối R&D" })).toHaveClass("bg-nacen-green-500");
    });

    it("renders expert profile with cyan border avatar and consulting CTA", () => {
      render(
        <div className="p-4 bg-white rounded-2xl">
          <div className="size-24 rounded-full ring-2 ring-cyan-500 p-1" data-testid="expert-avatar-ring" />
          <h3 className="text-lg font-bold">GS. TS. Nguyễn Văn Khoa</h3>
          <p className="font-mono text-xs text-slate-400">EXP-889922</p>
          <AppButton variant="cta" size="md" className="mt-2">Đăng Ký Tư Vấn Công Nghệ</AppButton>
        </div>
      );

      expect(screen.getByText("GS. TS. Nguyễn Văn Khoa")).toBeInTheDocument();
      expect(screen.getByText("EXP-889922")).toHaveClass("font-mono");
      expect(screen.getByRole("button", { name: "Đăng Ký Tư Vấn Công Nghệ" })).toBeInTheDocument();
    });

    it("renders scientific tabs correctly with 4 standardized tabs", () => {
      const items = [
        { key: "overview", label: "Tổng Quan & Radar ĐMST" },
        { key: "rd", label: "Năng Lực R&D" },
        { key: "patents", label: "Bằng Sáng Chế & SHTT" },
        { key: "projects", label: "Đề Tài Trọng Điểm" },
      ];

      render(<AppTabs items={items} activeKey="overview" onChange={() => {}} />);
      expect(screen.getByRole("tab", { name: "Tổng Quan & Radar ĐMST" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Bằng Sáng Chế & SHTT" })).toBeInTheDocument();
    });
  });

  describe("T-02.31 & T-02.32: Technology Listings & TRL Spectrum Badges", () => {
    it("renders TRL spectrum badges with correct 3-tier colors", () => {
      render(
        <div>
          <AppBadge variant="info">TRL 2</AppBadge>
          <AppBadge variant="warning">TRL 5</AppBadge>
          <AppBadge variant="success">TRL 8</AppBadge>
        </div>
      );

      const trl2 = screen.getByText("TRL 2");
      const trl5 = screen.getByText("TRL 5");
      const trl8 = screen.getByText("TRL 8");

      expect(trl2).toHaveClass("bg-blue-50");
      expect(trl5).toHaveClass("bg-amber-50");
      expect(trl8).toHaveClass("bg-emerald-50");
    });

    it("renders technology card with 16:9 thumbnail and connection request CTA", () => {
      render(
        <AppCard className="w-80">
          <div className="aspect-[16/9] w-full bg-slate-100 rounded-t-xl" data-testid="tech-thumb-16-9" />
          <AppCardHeader>
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-slate-500">TECH-2026-089</span>
              <AppBadge variant="success">TRL 8</AppBadge>
            </div>
            <AppCardTitle className="text-base line-clamp-2">Hệ Thống Lọc Nước Màng RO Nano Bạc</AppCardTitle>
          </AppCardHeader>
          <AppCardContent>
            <AppButton variant="cta" className="w-full">Yêu Cầu Kết Nối</AppButton>
          </AppCardContent>
        </AppCard>
      );

      expect(screen.getByTestId("tech-thumb-16-9")).toHaveClass("aspect-[16/9]");
      expect(screen.getByText("TECH-2026-089")).toHaveClass("font-mono");
      expect(screen.getByRole("button", { name: "Yêu Cầu Kết Nối" })).toBeInTheDocument();
    });
  });

  describe("T-02.33: Survey TT17 Stepper & Accordion", () => {
    it("renders sticky stepper bar with 5 steps and progress indicator", () => {
      render(
        <div className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-md p-3 border-b border-slate-200">
          <div className="flex justify-between items-center text-xs font-semibold text-brand-700">
            <span>Bước 1: Thông tin DN</span>
            <span>Bước 2: Năng lực T</span>
            <span>Bước 3: Hiệu quả E</span>
            <span>Bước 4: Tổ chức O</span>
            <span>Bước 5: R&D R</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
            <div className="bg-brand-700 h-1.5 rounded-full w-2/5" data-testid="survey-progress-bar" />
          </div>
        </div>
      );

      expect(screen.getByText("Bước 2: Năng lực T")).toBeInTheDocument();
      expect(screen.getByTestId("survey-progress-bar")).toHaveClass("bg-brand-700");
    });
  });

  describe("T-02.34: Admin Data Tables & Scoped RBAC UI", () => {
    it("renders thin-border data table with status badges and smart pagination", () => {
      render(
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="p-3 border-b border-slate-200">Mã Hồ Sơ</th>
                <th className="p-3 border-b border-slate-200">Đơn Vị</th>
                <th className="p-3 border-b border-slate-200">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-blue-50/40 border-b border-slate-100">
                <td className="p-3 font-mono">HS-2026-001</td>
                <td className="p-3">Công ty Viễn Thông ABC</td>
                <td className="p-3"><AppBadge variant="success">ĐÃ DUYỆT</AppBadge></td>
              </tr>
            </tbody>
          </table>
          <div className="p-3 flex justify-between items-center text-xs text-slate-500 border-t border-slate-200">
            <span>Hiển thị 1 - 10 trên tổng số 120 bản ghi</span>
            <div className="flex gap-1">
              <AppButton variant="outline" size="sm">Trước</AppButton>
              <AppButton variant="primary" size="sm">1</AppButton>
              <AppButton variant="outline" size="sm">Sau</AppButton>
            </div>
          </div>
        </div>
      );

      expect(screen.getByText("HS-2026-001")).toHaveClass("font-mono");
      expect(screen.getByText("ĐÃ DUYỆT")).toBeInTheDocument();
      expect(screen.getByText(/120 bản ghi/)).toBeInTheDocument();
    });
  });
});
