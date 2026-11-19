import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React, { createRef } from "react";
import { AppButton, AppLink, SectionHeading } from "@/components/ui/design-system";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { AppBadge } from "@/components/ui/app-badge";
import {
  AppCard,
  AppCardHeader,
  AppCardTitle,
  AppCardDescription,
  AppCardContent,
  AppCardFooter,
} from "@/components/ui/app-card";
import { AppAlert } from "@/components/ui/app-alert";
import { AppTabs } from "@/components/ui/app-tabs";
import { AppTooltip } from "@/components/ui/app-tooltip";
import { AppModal } from "@/components/ui/app-modal";
import { Search, Mail, Sparkles } from "lucide-react";

afterEach(cleanup);

describe("QC Test Suite: Design System Core & Common Atoms (T-00.101)", () => {
  // =============================================================
  // 1. APP BUTTON & APP LINK
  // =============================================================
  describe("1. AppButton & AppLink", () => {
    it("renders all 6 button variants with respective theme classes", () => {
      const { rerender } = render(<AppButton variant="primary">Primary</AppButton>);
      expect(screen.getByRole("button")).toHaveClass("bg-brand-700", "text-white");

      rerender(<AppButton variant="cta">CTA Action</AppButton>);
      expect(screen.getByRole("button")).toHaveClass("bg-nacen-green-500", "text-white");

      rerender(<AppButton variant="outline">Outline</AppButton>);
      expect(screen.getByRole("button")).toHaveClass("border-slate-300", "bg-white");

      rerender(<AppButton variant="ghost">Ghost</AppButton>);
      expect(screen.getByRole("button")).toHaveClass("hover:bg-slate-100");

      rerender(<AppButton variant="danger">Danger</AppButton>);
      expect(screen.getByRole("button")).toHaveClass("bg-status-danger", "text-white");

      rerender(<AppButton variant="secondary">Secondary</AppButton>);
      expect(screen.getByRole("button")).toHaveClass("bg-slate-100", "text-slate-800");
    });

    it("renders all 3 button sizes including 44px touch target (md)", () => {
      const { rerender } = render(<AppButton size="sm">Small</AppButton>);
      expect(screen.getByRole("button")).toHaveClass("min-h-9", "min-w-9", "h-9");

      rerender(<AppButton size="md">Medium</AppButton>);
      expect(screen.getByRole("button")).toHaveClass("min-h-11", "min-w-11");

      rerender(<AppButton size="lg">Large</AppButton>);
      expect(screen.getByRole("button")).toHaveClass("min-h-12", "min-w-12");
    });

    it("handles isLoading with disabled state, aria-busy, and inline spinner", () => {
      const handleClick = vi.fn();
      render(
        <AppButton isLoading onClick={handleClick}>
          Lưu thay đổi
        </AppButton>
      );

      const btn = screen.getByRole("button");
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute("aria-busy", "true");

      const spinner = screen.getByRole("status", { name: "Đang xử lý..." });
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass("animate-spin");

      // Verify anti-spam click protection
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("prevents click execution when disabled is true", () => {
      const handleClick = vi.fn();
      render(
        <AppButton disabled onClick={handleClick}>
          Nút bị khóa
        </AppButton>
      );

      const btn = screen.getByRole("button");
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("renders AppLink as anchor with proper href, variant and size", () => {
      render(
        <AppLink href="/portal/seller" variant="cta" size="md">
          Chuyển đến Portal
        </AppLink>
      );

      const link = screen.getByRole("link", { name: "Chuyển đến Portal" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/portal/seller");
      expect(link).toHaveClass("bg-nacen-green-500", "min-h-11", "min-w-11");
    });

    it("renders SectionHeading with eyebrow, title, description, and alignment", () => {
      const { rerender } = render(
        <SectionHeading
          eyebrow="KHỞI NGHIỆP ĐMST"
          title="Thị trường Khoa học Công nghệ"
          description="Nền tảng giao dịch trực tuyến toàn diện"
          align="center"
          font="sans"
        />
      );

      expect(screen.getByText("KHỞI NGHIỆP ĐMST")).toBeInTheDocument();
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Thị trường Khoa học Công nghệ");
      expect(heading).toHaveClass("font-sans");
      expect(screen.getByText("Nền tảng giao dịch trực tuyến toàn diện")).toBeInTheDocument();

      rerender(
        <SectionHeading title="Tiêu đề Căn trái" align="left" font="heading" />
      );
      const headingLeft = screen.getByRole("heading", { level: 2 });
      expect(headingLeft).toHaveClass("font-heading");
    });
  });

  // =============================================================
  // 2. APP INPUT FORM CONTROL
  // =============================================================
  describe("2. AppInput Form Control", () => {
    it("associates label and input with generated id, showing required asterisk", () => {
      render(
        <AppInput label="Mã số thuế doanh nghiệp" required placeholder="0101234567" />
      );

      const input = screen.getByLabelText(/Mã số thuế doanh nghiệp/);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("required");
      expect(screen.getByText("*")).toHaveClass("text-rose-500");
    });

    it("renders helperText and binds via aria-describedby", () => {
      render(
        <AppInput
          label="Tên sáng chế"
          helperText="Tối thiểu 10 ký tự tiếng Việt có dấu"
          id="custom-patent-input"
        />
      );

      const input = screen.getByLabelText("Tên sáng chế");
      expect(input).toHaveAttribute("aria-describedby", "custom-patent-input-helper");
      expect(screen.getByText("Tối thiểu 10 ký tự tiếng Việt có dấu")).toBeInTheDocument();
    });

    it("renders error state with aria-invalid, alert role and replaces endIcon with alert icon", () => {
      render(
        <AppInput
          label="Email liên hệ"
          error="Định dạng email không hợp lệ"
          id="email-input"
          endIcon={<span data-testid="custom-end-icon">@</span>}
        />
      );

      const input = screen.getByLabelText("Email liên hệ");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("aria-describedby", "email-input-error");

      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Định dạng email không hợp lệ");

      // Custom endIcon should be replaced by error alert icon
      expect(screen.queryByTestId("custom-end-icon")).not.toBeInTheDocument();
    });

    it("renders clearable button when value is present and triggers onClear", () => {
      const handleClear = vi.fn();
      const { rerender } = render(
        <AppInput
          label="Tìm kiếm"
          value="Pin năng lượng mặt trời"
          clearable
          onClear={handleClear}
          onChange={() => {}}
        />
      );

      const clearBtn = screen.getByRole("button", { name: "Xóa nội dung" });
      expect(clearBtn).toBeInTheDocument();
      fireEvent.click(clearBtn);
      expect(handleClear).toHaveBeenCalledTimes(1);

      // When value is empty string, clear button is hidden
      rerender(
        <AppInput
          label="Tìm kiếm"
          value=""
          clearable
          onClear={handleClear}
          onChange={() => {}}
        />
      );
      expect(screen.queryByRole("button", { name: "Xóa nội dung" })).not.toBeInTheDocument();
    });

    it("renders startIcon and handles disabled state", () => {
      render(
        <AppInput
          label="Tra cứu"
          startIcon={<Search data-testid="search-icon" className="w-4 h-4" />}
          disabled
        />
      );

      expect(screen.getByTestId("search-icon")).toBeInTheDocument();
      const input = screen.getByLabelText("Tra cứu");
      expect(input).toBeDisabled();
      expect(input.parentElement).toHaveClass("opacity-50", "cursor-not-allowed");
    });

    it("forwards ref to underlying HTMLInputElement", () => {
      const ref = createRef<HTMLInputElement>();
      render(<AppInput ref={ref} label="Họ tên" defaultValue="Nguyễn Văn A" />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.value).toBe("Nguyễn Văn A");
    });
  });

  // =============================================================
  // 3. APP SELECT FORM CONTROL
  // =============================================================
  describe("3. AppSelect Form Control", () => {
    const mockOptions = [
      { value: "01", label: "Khoa học Tự nhiên" },
      { value: "02", label: "Khoa học Kỹ thuật và Công nghệ" },
      { value: "03", label: "Khoa học Y Dược", disabled: true },
    ];

    it("renders options prop with placeholder as disabled hidden option", () => {
      render(
        <AppSelect
          label="Lĩnh vực công nghệ"
          placeholder="-- Chọn lĩnh vực --"
          options={mockOptions}
          defaultValue=""
        />
      );

      const select = screen.getByLabelText("Lĩnh vực công nghệ");
      expect(select).toBeInTheDocument();
      expect(screen.getByText("-- Chọn lĩnh vực --")).toBeInTheDocument();
      expect(screen.getByText("Khoa học Tự nhiên")).toBeInTheDocument();
      expect(screen.getByText("Khoa học Y Dược")).toHaveAttribute("disabled");
    });

    it("renders children options if options prop is not provided", () => {
      render(
        <AppSelect label="Tỉnh thành">
          <option value="HN">Hà Nội</option>
          <option value="HCM">Hồ Chí Minh</option>
        </AppSelect>
      );

      expect(screen.getByText("Hà Nội")).toBeInTheDocument();
      expect(screen.getByText("Hồ Chí Minh")).toBeInTheDocument();
    });

    it("displays error message, aria-invalid and error icon", () => {
      render(
        <AppSelect
          label="Lĩnh vực"
          options={mockOptions}
          error="Vui lòng chọn lĩnh vực KH&CN"
          id="sector-select"
        />
      );

      const select = screen.getByLabelText("Lĩnh vực");
      expect(select).toHaveAttribute("aria-invalid", "true");
      expect(select).toHaveAttribute("aria-describedby", "sector-select-error");
      expect(screen.getByRole("alert")).toHaveTextContent("Vui lòng chọn lĩnh vực KH&CN");
    });

    it("handles select change event and forwards ref", () => {
      const handleChange = vi.fn();
      const ref = createRef<HTMLSelectElement>();

      render(
        <AppSelect
          ref={ref}
          label="Lĩnh vực"
          options={mockOptions}
          onChange={handleChange}
        />
      );

      expect(ref.current).toBeInstanceOf(HTMLSelectElement);
      const select = screen.getByLabelText("Lĩnh vực");
      fireEvent.change(select, { target: { value: "02" } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });

  // =============================================================
  // 4. APP BADGE & TRL AUTOMATED MAPPING
  // =============================================================
  describe("4. AppBadge & TRL Mapping", () => {
    it("renders all 6 badge variants with semantic color schemes", () => {
      const { rerender } = render(<AppBadge variant="success">Hoàn thành</AppBadge>);
      expect(screen.getByText("Hoàn thành")).toHaveClass("bg-emerald-50", "text-emerald-700");

      rerender(<AppBadge variant="warning">Chờ xử lý</AppBadge>);
      expect(screen.getByText("Chờ xử lý")).toHaveClass("bg-amber-50", "text-amber-800");

      rerender(<AppBadge variant="danger">Bị từ chối</AppBadge>);
      expect(screen.getByText("Bị từ chối")).toHaveClass("bg-rose-50", "text-rose-700");

      rerender(<AppBadge variant="info">Thông tin</AppBadge>);
      expect(screen.getByText("Thông tin")).toHaveClass("bg-blue-50", "text-blue-700");

      rerender(<AppBadge variant="neutral">Bản nháp</AppBadge>);
      expect(screen.getByText("Bản nháp")).toHaveClass("bg-slate-100", "text-slate-700");

      rerender(<AppBadge variant="brand">NacenTech</AppBadge>);
      expect(screen.getByText("NacenTech")).toHaveClass("bg-brand-50", "text-brand-700");
    });

    it("maps TRL 1-3 to info, TRL 4-6 to warning, TRL 7-9 to success", () => {
      const { rerender } = render(<AppBadge trl={1} />);
      expect(screen.getByText("TRL 1")).toHaveClass("bg-blue-50", "text-blue-700");

      rerender(<AppBadge trl={3} />);
      expect(screen.getByText("TRL 3")).toHaveClass("bg-blue-50", "text-blue-700");

      rerender(<AppBadge trl={4} />);
      expect(screen.getByText("TRL 4")).toHaveClass("bg-amber-50", "text-amber-800");

      rerender(<AppBadge trl={6} />);
      expect(screen.getByText("TRL 6")).toHaveClass("bg-amber-50", "text-amber-800");

      rerender(<AppBadge trl={7} />);
      expect(screen.getByText("TRL 7")).toHaveClass("bg-emerald-50", "text-emerald-700");

      rerender(<AppBadge trl={9} />);
      expect(screen.getByText("TRL 9")).toHaveClass("bg-emerald-50", "text-emerald-700");
    });

    it("renders dot indicator and custom icon", () => {
      render(
        <AppBadge
          variant="brand"
          dot
          icon={<Sparkles data-testid="badge-icon" className="w-3 h-3" />}
        >
          Công nghệ mới
        </AppBadge>
      );

      expect(screen.getByTestId("badge-icon")).toBeInTheDocument();
      expect(screen.getByText("Công nghệ mới")).toBeInTheDocument();
    });
  });

  // =============================================================
  // 5. APP CARD & ELEVATIONS
  // =============================================================
  describe("5. AppCard & Compound Subcomponents", () => {
    it("renders all 5 elevation levels (0-4)", () => {
      const { rerender } = render(<AppCard elevation={0}>Elevation 0</AppCard>);
      expect(screen.getByText("Elevation 0")).toHaveClass("shadow-none");

      rerender(<AppCard elevation={1}>Elevation 1</AppCard>);
      expect(screen.getByText("Elevation 1")).toHaveClass("shadow-sm");

      rerender(<AppCard elevation={2}>Elevation 2</AppCard>);
      expect(screen.getByText("Elevation 2")).toHaveClass("shadow-md");

      rerender(<AppCard elevation={3}>Elevation 3</AppCard>);
      expect(screen.getByText("Elevation 3")).toHaveClass("shadow-lg");

      rerender(<AppCard elevation={4}>Elevation 4</AppCard>);
      expect(screen.getByText("Elevation 4")).toHaveClass("shadow-2xl");
    });

    it("applies interactive hover and scale styling when interactive is true", () => {
      render(<AppCard interactive>Interactive Card</AppCard>);
      const card = screen.getByText("Interactive Card");
      expect(card).toHaveClass("cursor-pointer", "hover:border-brand-500", "active:scale-[0.99]");
    });

    it("renders full compound layout with Header, Title, Description, Content, Footer", () => {
      render(
        <AppCard>
          <AppCardHeader>
            <AppCardTitle>Công nghệ Pin Quang điện</AppCardTitle>
            <AppCardDescription>Viện Khoa học Vật liệu</AppCardDescription>
          </AppCardHeader>
          <AppCardContent>Hiệu suất chuyển đổi đạt 24.5%</AppCardContent>
          <AppCardFooter>
            <AppButton size="sm">Xem chi tiết</AppButton>
          </AppCardFooter>
        </AppCard>
      );

      expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Công nghệ Pin Quang điện");
      expect(screen.getByText("Viện Khoa học Vật liệu")).toBeInTheDocument();
      expect(screen.getByText("Hiệu suất chuyển đổi đạt 24.5%")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Xem chi tiết" })).toBeInTheDocument();
    });
  });

  // =============================================================
  // 6. APP ALERT
  // =============================================================
  describe("6. AppAlert Component", () => {
    it("renders all 4 alert variants with alert role", () => {
      const { rerender } = render(<AppAlert variant="info" title="Lưu ý">Nội dung</AppAlert>);
      expect(screen.getByRole("alert")).toHaveClass("bg-blue-50");

      rerender(<AppAlert variant="success" title="Thành công">Nội dung</AppAlert>);
      expect(screen.getByRole("alert")).toHaveClass("bg-emerald-50");

      rerender(<AppAlert variant="warning" title="Cảnh báo">Nội dung</AppAlert>);
      expect(screen.getByRole("alert")).toHaveClass("bg-amber-50");

      rerender(<AppAlert variant="danger" title="Lỗi">Nội dung</AppAlert>);
      expect(screen.getByRole("alert")).toHaveClass("bg-rose-50");
    });

    it("triggers onClose callback when close button is clicked", () => {
      const handleClose = vi.fn();
      render(
        <AppAlert title="Thông báo hệ thống" onClose={handleClose}>
          Bảo trì máy chủ lúc 23:00
        </AppAlert>
      );

      const closeBtn = screen.getByRole("button", { name: "Đóng thông báo" });
      expect(closeBtn).toBeInTheDocument();
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("omits close button when onClose is not provided", () => {
      render(<AppAlert title="Cố định">Không thể đóng</AppAlert>);
      expect(screen.queryByRole("button", { name: "Đóng thông báo" })).not.toBeInTheDocument();
    });
  });

  // =============================================================
  // 7. APP TABS
  // =============================================================
  describe("7. AppTabs Component", () => {
    const tabItems = [
      { key: "all", label: "Tất cả", count: 42 },
      { key: "active", label: "Đang hoạt động", count: 30 },
      { key: "archived", label: "Lưu trữ", disabled: true },
    ];

    it("renders tabs in line variant with proper ARIA attributes", () => {
      const handleChange = vi.fn();
      render(
        <AppTabs
          items={tabItems}
          activeKey="all"
          onChange={handleChange}
          variant="line"
        />
      );

      expect(screen.getByRole("tablist")).toBeInTheDocument();
      const allTab = screen.getByRole("tab", { name: /Tất cả/ });
      expect(allTab).toHaveAttribute("aria-selected", "true");
      expect(allTab).toHaveAttribute("aria-controls", "panel-all");

      const activeTab = screen.getByRole("tab", { name: /Đang hoạt động/ });
      expect(activeTab).toHaveAttribute("aria-selected", "false");

      fireEvent.click(activeTab);
      expect(handleChange).toHaveBeenCalledWith("active");
    });

    it("renders pill variant and disables interaction on disabled tabs", () => {
      const handleChange = vi.fn();
      render(
        <AppTabs
          items={tabItems}
          activeKey="all"
          onChange={handleChange}
          variant="pill"
        />
      );

      const archivedTab = screen.getByRole("tab", { name: /Lưu trữ/ });
      expect(archivedTab).toBeDisabled();
      expect(archivedTab).toHaveClass("pointer-events-none");

      fireEvent.click(archivedTab);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // =============================================================
  // 8. APP TOOLTIP
  // =============================================================
  describe("8. AppTooltip Component", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("shows tooltip after delay on mouseEnter and hides on mouseLeave", () => {
      render(
        <AppTooltip content="Hồ sơ được thẩm định bởi Hội đồng KH&CN" delayMs={100}>
          <button>Hover me</button>
        </AppTooltip>
      );

      const trigger = screen.getByRole("button", { name: "Hover me" });
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

      // Trigger hover
      fireEvent.mouseEnter(trigger.parentElement!);
      act(() => {
        vi.advanceTimersByTime(50);
      });
      // Not yet visible before delay
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(60);
      });
      // Now visible
      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent("Hồ sơ được thẩm định bởi Hội đồng KH&CN");

      // Trigger mouse leave
      fireEvent.mouseLeave(trigger.parentElement!);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("shows on focus and hides on blur with proper aria-describedby binding", () => {
      render(
        <AppTooltip content="Trợ giúp tiêu điểm" delayMs={0}>
          <button>Focusable button</button>
        </AppTooltip>
      );

      const trigger = screen.getByRole("button", { name: "Focusable button" });

      // Trigger focus
      fireEvent.focus(trigger.parentElement!);
      act(() => {
        vi.advanceTimersByTime(1);
      });

      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toBeInTheDocument();
      expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);

      // Trigger blur
      fireEvent.blur(trigger.parentElement!);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      expect(trigger).not.toHaveAttribute("aria-describedby");
    });
  });

  // =============================================================
  // 9. APP MODAL
  // =============================================================
  describe("9. AppModal Dialog & Keyboard Accessibility", () => {
    it("returns null when isOpen is false", () => {
      render(
        <AppModal isOpen={false} onClose={() => {}}>
          <div>Ẩn hoàn toàn</div>
        </AppModal>
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByText("Ẩn hoàn toàn")).not.toBeInTheDocument();
    });

    it("locks body scroll when open and restores previous overflow on close", () => {
      const originalOverflow = document.body.style.overflow;
      const { rerender } = render(
        <AppModal isOpen={true} onClose={() => {}} title="Modal Scroll Lock">
          <div>Nội dung modal</div>
        </AppModal>
      );

      expect(document.body.style.overflow).toBe("hidden");

      rerender(
        <AppModal isOpen={false} onClose={() => {}} title="Modal Scroll Lock">
          <div>Nội dung modal</div>
        </AppModal>
      );
      expect(document.body.style.overflow).toBe(originalOverflow);
    });

    it("closes on ESC key press when closeOnEsc is true", () => {
      const handleClose = vi.fn();
      const { rerender } = render(
        <AppModal isOpen={true} onClose={handleClose} closeOnEsc={true}>
          <div>Nội dung</div>
        </AppModal>
      );

      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(1);

      // When closeOnEsc is false, Escape does nothing
      rerender(
        <AppModal isOpen={true} onClose={handleClose} closeOnEsc={false}>
          <div>Nội dung</div>
        </AppModal>
      );
      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("closes on overlay backdrop click but not when clicking inside dialog body", () => {
      const handleClose = vi.fn();
      render(
        <AppModal isOpen={true} onClose={handleClose} closeOnOverlayClick={true}>
          <div data-testid="modal-inner">Nội dung bên trong</div>
        </AppModal>
      );

      // Click inside modal body
      const inner = screen.getByTestId("modal-inner");
      fireEvent.click(inner);
      expect(handleClose).not.toHaveBeenCalled();

      // Click outer overlay presentation backdrop
      const overlay = screen.getByRole("presentation");
      fireEvent.click(overlay);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("traps focus inside the modal with Tab navigation", () => {
      render(
        <AppModal
          isOpen={true}
          onClose={() => {}}
          title="Focus Trap Modal"
          showCloseButton={false}
        >
          <input data-testid="input-first" placeholder="Input đầu" />
          <input data-testid="input-second" placeholder="Input giữa" />
          <button data-testid="btn-last">Nút cuối</button>
        </AppModal>
      );

      const firstInput = screen.getByTestId("input-first");
      const lastBtn = screen.getByTestId("btn-last");
      const dialog = screen.getByRole("dialog");

      // Verify first element is focused automatically on open
      expect(document.activeElement).toBe(firstInput);

      // Shift+Tab on first element moves focus to last element
      fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(lastBtn);

      // Tab on last element moves focus back to first element
      fireEvent.keyDown(dialog, { key: "Tab", shiftKey: false });
      expect(document.activeElement).toBe(firstInput);
    });

    it("supports all 4 modal sizes (sm, md, lg, fullWidth)", () => {
      const { rerender } = render(
        <AppModal isOpen={true} onClose={() => {}} size="sm">
          <div>Small</div>
        </AppModal>
      );
      expect(screen.getByRole("dialog")).toHaveClass("max-w-md");

      rerender(
        <AppModal isOpen={true} onClose={() => {}} size="md">
          <div>Medium</div>
        </AppModal>
      );
      expect(screen.getByRole("dialog")).toHaveClass("max-w-xl");

      rerender(
        <AppModal isOpen={true} onClose={() => {}} size="lg">
          <div>Large</div>
        </AppModal>
      );
      expect(screen.getByRole("dialog")).toHaveClass("max-w-3xl");

      rerender(
        <AppModal isOpen={true} onClose={() => {}} size="fullWidth">
          <div>Full Width</div>
        </AppModal>
      );
      expect(screen.getByRole("dialog")).toHaveClass("max-w-5xl");
    });
  });
});
