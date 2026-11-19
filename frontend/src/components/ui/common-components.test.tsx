import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { AppButton } from "./design-system";
import { Async } from "./async";
import { AppInput } from "./app-input";
import { AppSelect } from "./app-select";
import { AppBadge } from "./app-badge";
import { AppCard, AppCardHeader, AppCardTitle, AppCardContent, AppCardFooter } from "./app-card";
import { AppAlert } from "./app-alert";
import { AppTabs } from "./app-tabs";
import { AppModal } from "./app-modal";

afterEach(cleanup);

describe("Common Core UI Components (T-00.96 -> T-00.100)", () => {
  describe("T-00.96: Async 5 UX States", () => {
    it("renders shimmer loading state with default loading text and skeleton", () => {
      render(
        <Async state="loading">
          <div>Content</div>
        </Async>
      );
      expect(screen.getByText("Đang tải dữ liệu...")).toBeInTheDocument();
      expect(screen.getByRole("generic", { busy: true })).toBeInTheDocument();
    });

    it("renders custom empty state with CTA action", () => {
      const handleAction = vi.fn();
      render(
        <Async
          state="empty"
          emptyTitle="Chưa có dữ liệu khảo sát"
          emptyMessage="Bấm nút bên dưới để tạo mới"
          emptyAction={{ label: "Tạo mới khảo sát", onClick: handleAction }}
        >
          <div>Content</div>
        </Async>
      );
      expect(screen.getByText("Chưa có dữ liệu khảo sát")).toBeInTheDocument();
      expect(screen.getByText("Bấm nút bên dưới để tạo mới")).toBeInTheDocument();
      const ctaBtn = screen.getByRole("button", { name: "Tạo mới khảo sát" });
      fireEvent.click(ctaBtn);
      expect(handleAction).toHaveBeenCalledOnce();
    });

    it("renders error state with retry callback", () => {
      const handleRetry = vi.fn();
      render(
        <Async state="error" errorMessage="Lỗi tải dữ liệu mạng" onRetry={handleRetry}>
          <div>Content</div>
        </Async>
      );
      expect(screen.getByText("Lỗi tải dữ liệu mạng")).toBeInTheDocument();
      const retryBtn = screen.getByRole("button", { name: "Thử lại" });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledOnce();
    });

    it("renders success state with fade-in transition wrapper", () => {
      render(
        <Async state="success">
          <div data-testid="success-data">Dữ liệu thành công</div>
        </Async>
      );
      const dataEl = screen.getByTestId("success-data");
      expect(dataEl).toBeInTheDocument();
      expect(dataEl.parentElement).toHaveClass("animate-fade-in");
    });

    it("renders partial state with amber warning banner while keeping data present", () => {
      render(
        <Async state="partial" partialWarning="Đang đồng bộ ngầm">
          <div data-testid="partial-data">Dữ liệu hiện hành</div>
        </Async>
      );
      expect(screen.getByText("Đang đồng bộ ngầm")).toBeInTheDocument();
      expect(screen.getByTestId("partial-data")).toBeInTheDocument();
    });
  });

  describe("T-00.97: AppButton variants, sizes and isLoading", () => {
    it("renders secondary variant correctly", () => {
      render(<AppButton variant="secondary">Nút phụ</AppButton>);
      const btn = screen.getByRole("button", { name: "Nút phụ" });
      expect(btn).toHaveClass("bg-slate-100", "text-slate-800");
    });

    it("renders sm and lg button sizes", () => {
      const { rerender } = render(<AppButton size="sm">Nhỏ</AppButton>);
      expect(screen.getByRole("button")).toHaveClass("min-h-9", "h-9");

      rerender(<AppButton size="lg">Lớn</AppButton>);
      expect(screen.getByRole("button")).toHaveClass("min-h-12");
    });

    it("disables button and displays inline spinner when isLoading is true", () => {
      render(<AppButton isLoading>Đang lưu...</AppButton>);
      const btn = screen.getByRole("button");
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute("aria-busy", "true");
      expect(screen.getByRole("status", { name: "Đang xử lý..." })).toBeInTheDocument();
    });
  });

  describe("T-00.98: AppInput and AppSelect form controls", () => {
    it("renders AppInput with label, helperText, and error message", () => {
      const { rerender } = render(
        <AppInput label="Họ và tên" helperText="Nhập đầy đủ tên" placeholder="Nguyễn Văn A" />
      );
      expect(screen.getByLabelText("Họ và tên")).toBeInTheDocument();
      expect(screen.getByText("Nhập đầy đủ tên")).toBeInTheDocument();

      rerender(
        <AppInput label="Họ và tên" error="Tên không được để trống" />
      );
      expect(screen.getByRole("alert")).toHaveTextContent("Tên không được để trống");
    });

    it("supports clearable action on AppInput", () => {
      const handleClear = vi.fn();
      render(
        <AppInput
          label="Từ khóa tìm kiếm"
          value="Công nghệ sinh học"
          clearable
          onClear={handleClear}
          onChange={() => {}}
        />
      );
      const clearBtn = screen.getByRole("button", { name: "Xóa nội dung" });
      fireEvent.click(clearBtn);
      expect(handleClear).toHaveBeenCalledOnce();
    });

    it("renders AppSelect with options and error state", () => {
      const options = [
        { value: "01", label: "Khoa học Tự nhiên" },
        { value: "02", label: "Khoa học Kỹ thuật và Công nghệ" },
      ];
      render(
        <AppSelect
          label="Lĩnh vực KH&CN"
          options={options}
          placeholder="-- Chọn lĩnh vực --"
          defaultValue="01"
        />
      );
      expect(screen.getByLabelText("Lĩnh vực KH&CN")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toHaveValue("01");
    });
  });

  describe("T-00.99: Supporting UI Components (Badge, Card, Alert, Tabs)", () => {
    it("renders AppBadge for semantic variants and automatic TRL levels", () => {
      const { rerender } = render(<AppBadge variant="success">Hoàn thành</AppBadge>);
      expect(screen.getByText("Hoàn thành")).toHaveClass("bg-emerald-50", "text-emerald-700");

      // TRL <= 3 is info (research)
      rerender(<AppBadge trl={2} />);
      expect(screen.getByText("TRL 2")).toHaveClass("bg-blue-50", "text-blue-700");

      // TRL 4-6 is warning
      rerender(<AppBadge trl={5} />);
      expect(screen.getByText("TRL 5")).toHaveClass("bg-amber-50", "text-amber-800");

      // TRL 7-9 is success
      rerender(<AppBadge trl={8} />);
      expect(screen.getByText("TRL 8")).toHaveClass("bg-emerald-50", "text-emerald-700");
    });

    it("renders AppCard with header, title, content, footer", () => {
      render(
        <AppCard interactive>
          <AppCardHeader>
            <AppCardTitle>Tiêu đề thẻ</AppCardTitle>
          </AppCardHeader>
          <AppCardContent>Nội dung thẻ</AppCardContent>
          <AppCardFooter>Chân thẻ</AppCardFooter>
        </AppCard>
      );
      expect(screen.getByText("Tiêu đề thẻ")).toBeInTheDocument();
      expect(screen.getByText("Nội dung thẻ")).toBeInTheDocument();
      expect(screen.getByText("Chân thẻ")).toBeInTheDocument();
    });

    it("renders AppAlert with 4 levels and close action", () => {
      const handleClose = vi.fn();
      render(
        <AppAlert variant="warning" title="Cảnh báo hạn ngạch" onClose={handleClose}>
          Đã dùng 90% hạn ngạch tháng.
        </AppAlert>
      );
      expect(screen.getByRole("alert")).toHaveClass("bg-amber-50");
      expect(screen.getByText("Cảnh báo hạn ngạch")).toBeInTheDocument();
      const closeBtn = screen.getByRole("button", { name: "Đóng thông báo" });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledOnce();
    });

    it("renders AppTabs and triggers onChange", () => {
      const handleChange = vi.fn();
      const tabs = [
        { key: "all", label: "Tất cả" },
        { key: "pending", label: "Chờ duyệt", count: 5 },
      ];
      render(<AppTabs items={tabs} activeKey="all" onChange={handleChange} variant="pill" />);
      expect(screen.getByRole("tab", { name: "Tất cả" })).toHaveAttribute("aria-selected", "true");
      const pendingTab = screen.getByRole("tab", { name: /Chờ duyệt/ });
      fireEvent.click(pendingTab);
      expect(handleChange).toHaveBeenCalledWith("pending");
    });
  });

  describe("T-00.100: AppModal Dialog", () => {
    it("renders modal when open and handles close triggers (button and ESC)", () => {
      const handleClose = vi.fn();
      const { rerender } = render(
        <AppModal
          isOpen={true}
          onClose={handleClose}
          title="Xác nhận phê duyệt"
          description="Hành động không thể hoàn tác"
          footer={<AppButton onClick={handleClose}>Đồng ý</AppButton>}
        >
          <p>Bạn có chắc chắn muốn phê duyệt hồ sơ này?</p>
        </AppModal>
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Xác nhận phê duyệt")).toBeInTheDocument();
      expect(screen.getByText("Bạn có chắc chắn muốn phê duyệt hồ sơ này?")).toBeInTheDocument();

      // Close button
      const closeBtn = screen.getByRole("button", { name: "Đóng cửa sổ" });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledOnce();

      // ESC key
      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(2);

      // Hidden when isOpen = false
      rerender(
        <AppModal isOpen={false} onClose={handleClose}>
          <p>Hidden</p>
        </AppModal>
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
