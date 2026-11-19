import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import React, { useState } from "react";
import { Async, AsyncState } from "@/components/ui/async";

afterEach(cleanup);

describe("QC Test Suite: Async Component 5 UX States (T-00.101)", () => {
  // -------------------------------------------------------------
  // 1. LOADING STATE
  // -------------------------------------------------------------
  describe("1. Loading State (Shimmer Skeleton & Accessibility)", () => {
    it("renders default shimmer skeleton container with aria-busy and aria-live", () => {
      render(
        <Async state="loading">
          <div data-testid="child-content">Active Content</div>
        </Async>
      );

      const busyContainer = screen.getByRole("generic", { busy: true });
      expect(busyContainer).toBeInTheDocument();
      expect(busyContainer).toHaveAttribute("aria-live", "polite");
      expect(screen.getByText("Đang tải dữ liệu...")).toBeInTheDocument();
      expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
    });

    it("renders custom loadingText message", () => {
      render(
        <Async state="loading" loadingText="Đang đồng bộ hóa dữ liệu công nghệ...">
          <div>Content</div>
        </Async>
      );

      expect(screen.getByText("Đang đồng bộ hóa dữ liệu công nghệ...")).toBeInTheDocument();
      expect(screen.queryByText("Đang tải dữ liệu...")).not.toBeInTheDocument();
    });

    it("renders custom loadingSkeleton prop when provided, bypassing default skeleton", () => {
      render(
        <Async
          state="loading"
          loadingSkeleton={<div data-testid="custom-skeleton">Custom Loading Pulse</div>}
        >
          <div>Content</div>
        </Async>
      );

      expect(screen.getByTestId("custom-skeleton")).toBeInTheDocument();
      expect(screen.queryByText("Đang tải dữ liệu...")).not.toBeInTheDocument();
      expect(screen.queryByRole("generic", { busy: true })).not.toBeInTheDocument();
    });

    it("applies custom className to loading container", () => {
      render(
        <Async state="loading" className="custom-loading-class">
          <div>Content</div>
        </Async>
      );

      const busyContainer = screen.getByRole("generic", { busy: true });
      expect(busyContainer).toHaveClass("custom-loading-class");
    });
  });

  // -------------------------------------------------------------
  // 2. EMPTY STATE
  // -------------------------------------------------------------
  describe("2. Empty State (Illustrations, Messages & CTA)", () => {
    it("renders default empty title and message when none provided", () => {
      render(
        <Async state="empty">
          <div data-testid="child-content">Hidden Content</div>
        </Async>
      );

      expect(screen.getByText("Không có dữ liệu")).toBeInTheDocument();
      expect(
        screen.getByText("Hiện tại chưa có bản ghi nào để hiển thị.")
      ).toBeInTheDocument();
      expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders custom emptyTitle, emptyMessage, and default inbox icon", () => {
      render(
        <Async
          state="empty"
          emptyTitle="Chưa có hồ sơ chuyên gia"
          emptyMessage="Vui lòng tạo mới hồ sơ để kết nối mạng lưới"
          emptyIcon="inbox"
        >
          <div>Content</div>
        </Async>
      );

      expect(screen.getByText("Chưa có hồ sơ chuyên gia")).toBeInTheDocument();
      expect(
        screen.getByText("Vui lòng tạo mới hồ sơ để kết nối mạng lưới")
      ).toBeInTheDocument();
    });

    it("renders search emptyIcon correctly", () => {
      const { container } = render(
        <Async
          state="empty"
          emptyTitle="Không tìm thấy kết quả"
          emptyIcon="search"
        >
          <div>Content</div>
        </Async>
      );

      expect(screen.getByText("Không tìm thấy kết quả")).toBeInTheDocument();
      // Verifies SVG icon inside container
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("triggers emptyAction callback when CTA button is clicked", () => {
      const handleAction = vi.fn();
      render(
        <Async
          state="empty"
          emptyTitle="Chưa có nhu cầu công nghệ"
          emptyAction={{
            label: "Đăng ký nhu cầu mới",
            onClick: handleAction,
          }}
        >
          <div>Content</div>
        </Async>
      );

      const ctaButton = screen.getByRole("button", { name: "Đăng ký nhu cầu mới" });
      expect(ctaButton).toBeInTheDocument();
      fireEvent.click(ctaButton);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it("does not render CTA button when emptyAction is not provided", () => {
      render(
        <Async state="empty" emptyTitle="Danh sách trống">
          <div>Content</div>
        </Async>
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders custom emptyContent prop when provided", () => {
      render(
        <Async
          state="empty"
          emptyContent={<div data-testid="custom-empty-ui">Giao diện rỗng tùy biến</div>}
        >
          <div>Content</div>
        </Async>
      );

      expect(screen.getByTestId("custom-empty-ui")).toBeInTheDocument();
      expect(screen.queryByText("Không có dữ liệu")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------
  // 3. ERROR STATE
  // -------------------------------------------------------------
  describe("3. Error State (Alert Role, Messages & Retry)", () => {
    it("renders default error container with alert role and safe message", () => {
      render(
        <Async state="error">
          <div data-testid="child-content">Hidden Content</div>
        </Async>
      );

      const alertContainer = screen.getByRole("alert");
      expect(alertContainer).toBeInTheDocument();
      expect(screen.getByText("Đã xảy ra lỗi khi tải dữ liệu")).toBeInTheDocument();
      expect(
        screen.getByText("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.")
      ).toBeInTheDocument();
      expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Thử lại" })).not.toBeInTheDocument();
    });

    it("renders custom errorMessage and triggers onRetry callback when clicked", () => {
      const handleRetry = vi.fn();
      render(
        <Async
          state="error"
          errorMessage="Mạng gián đoạn: Mã lỗi ERR_CONN_TIMEOUT"
          onRetry={handleRetry}
        >
          <div>Content</div>
        </Async>
      );

      expect(
        screen.getByText("Mạng gián đoạn: Mã lỗi ERR_CONN_TIMEOUT")
      ).toBeInTheDocument();
      const retryBtn = screen.getByRole("button", { name: /Thử lại/i });
      expect(retryBtn).toBeInTheDocument();

      fireEvent.click(retryBtn);
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(2);
    });

    it("does not render retry button if onRetry is undefined", () => {
      render(
        <Async state="error" errorMessage="Lỗi không thể phục hồi">
          <div>Content</div>
        </Async>
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders custom errorContent when provided", () => {
      render(
        <Async
          state="error"
          errorContent={<div data-testid="custom-error-banner">Lỗi máy chủ 500</div>}
        >
          <div>Content</div>
        </Async>
      );

      expect(screen.getByTestId("custom-error-banner")).toBeInTheDocument();
      expect(screen.queryByText("Đã xảy ra lỗi khi tải dữ liệu")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------
  // 4. SUCCESS STATE
  // -------------------------------------------------------------
  describe("4. Success State (Fade-in & Children Presentation)", () => {
    it("renders children wrapped with animate-fade-in class", () => {
      render(
        <Async state="success">
          <div data-testid="live-data">Bảng danh sách công nghệ 10 bản ghi</div>
        </Async>
      );

      const content = screen.getByTestId("live-data");
      expect(content).toBeInTheDocument();
      expect(content.parentElement).toHaveClass("animate-fade-in", "w-full");
    });

    it("renders successContent if explicitly specified, replacing children", () => {
      render(
        <Async
          state="success"
          successContent={<div data-testid="custom-success">Dữ liệu nạp từ cache</div>}
        >
          <div data-testid="raw-children">Bị bỏ qua</div>
        </Async>
      );

      expect(screen.getByTestId("custom-success")).toBeInTheDocument();
      expect(screen.queryByTestId("raw-children")).not.toBeInTheDocument();
    });

    it("merges custom className onto success container", () => {
      render(
        <Async state="success" className="grid grid-cols-2">
          <div data-testid="grid-item">Item</div>
        </Async>
      );

      expect(screen.getByTestId("grid-item").parentElement).toHaveClass("grid", "grid-cols-2");
    });
  });

  // -------------------------------------------------------------
  // 5. PARTIAL STATE
  // -------------------------------------------------------------
  describe("5. Partial State (Background Sync Banner & Muted Content)", () => {
    it("renders warning banner with role status and default warning text", () => {
      render(
        <Async state="partial">
          <div data-testid="stale-data">Dữ liệu phiên trước</div>
        </Async>
      );

      const statusBanner = screen.getByRole("status");
      expect(statusBanner).toBeInTheDocument();
      expect(
        screen.getByText(
          "Dữ liệu đang được đồng bộ ở chế độ nền. Một số thông tin chi tiết có thể đang được cập nhật."
        )
      ).toBeInTheDocument();

      const staleData = screen.getByTestId("stale-data");
      expect(staleData).toBeInTheDocument();
      expect(staleData.parentElement).toHaveClass("opacity-70", "pointer-events-none");
    });

    it("renders custom partialWarning message", () => {
      render(
        <Async state="partial" partialWarning="Đang lấy dữ liệu từ nút Blockchain thứ cấp...">
          <div>Dữ liệu</div>
        </Async>
      );

      expect(
        screen.getByText("Đang lấy dữ liệu từ nút Blockchain thứ cấp...")
      ).toBeInTheDocument();
    });

    it("renders custom partialContent banner when provided", () => {
      render(
        <Async
          state="partial"
          partialContent={<div data-testid="custom-partial">Đang đồng bộ offline...</div>}
        >
          <div data-testid="offline-data">Dữ liệu offline</div>
        </Async>
      );

      expect(screen.getByTestId("custom-partial")).toBeInTheDocument();
      expect(screen.getByTestId("offline-data")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------
  // 6. EDGE CASES & STATE TRANSITIONS
  // -------------------------------------------------------------
  describe("6. Edge Cases & Fast State Transitions", () => {
    it("handles idle state by directly returning children without wrappers", () => {
      render(
        <Async state="idle">
          <div data-testid="idle-content">Trạng thái khởi tạo</div>
        </Async>
      );

      expect(screen.getByTestId("idle-content")).toBeInTheDocument();
      expect(screen.queryByRole("generic", { busy: true })).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("smoothly transitions through full lifecycle without throwing errors", () => {
      function TestHost() {
        const [state, setState] = useState<AsyncState>("loading");

        return (
          <div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setState("loading")}>To Loading</button>
              <button onClick={() => setState("error")}>To Error</button>
              <button onClick={() => setState("empty")}>To Empty</button>
              <button onClick={() => setState("partial")}>To Partial</button>
              <button onClick={() => setState("success")}>To Success</button>
            </div>
            <Async
              state={state}
              errorMessage="Lỗi mạng"
              emptyTitle="Không có dữ liệu"
              partialWarning="Cập nhật ngầm"
            >
              <div data-testid="dynamic-content">Dữ liệu sẵn sàng</div>
            </Async>
          </div>
        );
      }

      render(<TestHost />);

      // 1. Loading
      expect(screen.getByRole("generic", { busy: true })).toBeInTheDocument();

      // 2. Transition -> Error
      fireEvent.click(screen.getByText("To Error"));
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Lỗi mạng")).toBeInTheDocument();

      // 3. Transition -> Empty
      fireEvent.click(screen.getByText("To Empty"));
      expect(screen.getByText("Không có dữ liệu")).toBeInTheDocument();

      // 4. Transition -> Partial
      fireEvent.click(screen.getByText("To Partial"));
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByTestId("dynamic-content")).toBeInTheDocument();

      // 5. Transition -> Success
      fireEvent.click(screen.getByText("To Success"));
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByTestId("dynamic-content")).toBeInTheDocument();
    });

    it("preserves children input state when switching from partial back to success", () => {
      function InteractiveHost() {
        const [state, setState] = useState<AsyncState>("partial");
        const [text, setText] = useState("Giá trị ban đầu");

        return (
          <div>
            <button onClick={() => setState("success")}>Sync Done</button>
            <Async state={state}>
              <input
                data-testid="stateful-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </Async>
          </div>
        );
      }

      render(<InteractiveHost />);
      const input = screen.getByTestId("stateful-input") as HTMLInputElement;
      expect(input.value).toBe("Giá trị ban đầu");

      // While partial, parent is pointer-events-none
      expect(input.parentElement).toHaveClass("opacity-70", "pointer-events-none");

      // Switch to success
      fireEvent.click(screen.getByText("Sync Done"));
      const refreshedInput = screen.getByTestId("stateful-input") as HTMLInputElement;
      expect(refreshedInput).toBeInTheDocument();
      expect(refreshedInput.value).toBe("Giá trị ban đầu");
      expect(refreshedInput.parentElement).toHaveClass("animate-fade-in");
    });
  });
});
