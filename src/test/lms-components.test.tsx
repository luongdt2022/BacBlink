import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { LmsMaterialFormModal } from "@/components/lms/LmsMaterialFormModal";
import { LmsUnpublishModal } from "@/components/lms/LmsUnpublishModal";
import { LmsDeleteModal } from "@/components/lms/LmsDeleteModal";
import * as lmsApi from "@/lib/api/lms";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/elearning",
}));

// Mock toast
vi.mock("@/components/common/toast", () => ({
  useToast: () => ({
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("T10-20: Frontend LMS Components Unit Tests (Vitest)", () => {
  describe("1. LmsUnpublishModal (REQ-EL-005: Moderation with Reason)", () => {
    it("renders unpublish modal with material title and character counter", () => {
      render(
        <LmsUnpublishModal
          materialId="mat-001"
          materialTitle="Bài Giảng Sở Hữu Trí Tuệ"
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      expect(screen.getByText("Gỡ bài học khỏi Cổng công khai")).toBeInTheDocument();
      expect(screen.getByText(/Bài Giảng Sở Hữu Trí Tuệ/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Nhập lý do gỡ bài/)).toBeInTheDocument();
      expect(screen.getByText("0 / 250 ký tự")).toBeInTheDocument();
    });

    it("disables submit button when reason is empty or whitespace", () => {
      render(
        <LmsUnpublishModal
          materialId="mat-001"
          materialTitle="Bài Giảng"
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      const submitBtn = screen.getByRole("button", { name: /Xác nhận gỡ bài/i });
      expect(submitBtn).toBeDisabled();

      const textarea = screen.getByPlaceholderText(/Nhập lý do gỡ bài/);
      fireEvent.change(textarea, { target: { value: "   " } });
      expect(submitBtn).toBeDisabled();
    });

    it("calls unpublishLmsMaterial API with trimmed reason when submitted", async () => {
      const mockUnpublish = vi.spyOn(lmsApi, "unpublishLmsMaterial").mockResolvedValue(undefined as any);
      const onClose = vi.fn();
      const onSuccess = vi.fn();

      render(
        <LmsUnpublishModal
          materialId="mat-001"
          materialTitle="Bài Giảng"
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      );

      const textarea = screen.getByPlaceholderText(/Nhập lý do gỡ bài/);
      fireEvent.change(textarea, { target: { value: "  Cần cập nhật giáo trình 2026  " } });

      const submitBtn = screen.getByRole("button", { name: /Xác nhận gỡ bài/i });
      expect(submitBtn).not.toBeDisabled();
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockUnpublish).toHaveBeenCalledWith("mat-001", "Cần cập nhật giáo trình 2026");
        expect(onSuccess).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe("2. LmsDeleteModal (REQ-EL-006: Soft Delete Confirmation)", () => {
    it("renders soft delete confirmation message and alert warning", () => {
      render(
        <LmsDeleteModal
          materialId="mat-002"
          materialTitle="Học Liệu Chuyển Giao Công Nghệ"
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      expect(screen.getByText("Xác nhận xóa mềm học liệu")).toBeInTheDocument();
      expect(screen.getByText(/Học Liệu Chuyển Giao Công Nghệ/)).toBeInTheDocument();
      expect(screen.getByText(/Học liệu sẽ bị đánh dấu xóa mềm/)).toBeInTheDocument();
    });

    it("invokes deleteLmsMaterial when user clicks confirm", async () => {
      const mockDelete = vi.spyOn(lmsApi, "deleteLmsMaterial").mockResolvedValue();
      const onClose = vi.fn();
      const onSuccess = vi.fn();

      render(
        <LmsDeleteModal
          materialId="mat-002"
          materialTitle="Học Liệu Chuyển Giao Công Nghệ"
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      );

      const deleteBtn = screen.getByRole("button", { name: /Xác nhận xóa/i });
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith("mat-002");
        expect(onSuccess).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe("3. LmsMaterialFormModal (REQ-EL-002 & BR-EL-01..05)", () => {
    it("renders 4 Tabs A-B-C-D with initial Tab A selected", () => {
      render(
        <LmsMaterialFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      expect(screen.getByText("Biên Soạn & Đăng Bài Học Mới")).toBeInTheDocument();
      expect(screen.getByText(/Tab A: Thông tin chung & Video/)).toBeInTheDocument();
      expect(screen.getByText(/Tab B: Câu hỏi kiểm tra/)).toBeInTheDocument();
      expect(screen.getByText(/Tab C: Học liệu bổ trợ/)).toBeInTheDocument();
      expect(screen.getByText(/Tab D: Liên kết CSDL/)).toBeInTheDocument();

      // Tab A fields
      expect(screen.getByPlaceholderText(/Ví dụ: Kỹ thuật xây dựng Prompt Engineering/)).toBeInTheDocument();
      expect(screen.getByText(/Cấp độ \/ Loại bài/)).toBeInTheDocument();
      expect(screen.getByText(/Thời lượng \(phút\)/)).toBeInTheDocument();
    });

    it("switches tabs when tab buttons are clicked", () => {
      render(
        <LmsMaterialFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      // Switch to Tab B
      const tabBBtn = screen.getByRole("button", { name: /Tab B: Câu hỏi kiểm tra/i });
      fireEvent.click(tabBBtn);
      expect(screen.getByText(/Bộ câu hỏi tự kiểm tra trắc nghiệm/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Thêm câu hỏi/i })).toBeInTheDocument();

      // Switch to Tab C
      const tabCBtn = screen.getByRole("button", { name: /Tab C: Học liệu bổ trợ/i });
      fireEvent.click(tabCBtn);
      expect(screen.getByText(/Học liệu & Tài liệu đính kèm/i)).toBeInTheDocument();
      expect(screen.getByText(/1\. Công cụ thực hành/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. Phiếu tóm tắt slide/i)).toBeInTheDocument();

      // Switch to Tab D
      const tabDBtn = screen.getByRole("button", { name: /Tab D: Liên kết CSDL/i });
      fireEvent.click(tabDBtn);
      expect(screen.getByText(/Liên kết Cơ sở dữ liệu NacenTech/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Thêm liên kết/i })).toBeInTheDocument();
    });

    it("detects BR-EL-04: option length disparity warning (>2x difference)", () => {
      render(
        <LmsMaterialFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      // Go to Tab B
      fireEvent.click(screen.getByText(/Tab B: Câu hỏi kiểm tra/));

      // Add a question
      fireEvent.click(screen.getByRole("button", { name: /Thêm câu hỏi/i }));

      // Fill options with extreme disparity: Option A = "ABC" (3 chars), Option B = long text
      const optAInput = screen.getByPlaceholderText("Phương án A...");
      const optBInput = screen.getByPlaceholderText("Phương án B...");

      fireEvent.change(optAInput, { target: { value: "ABC" } });
      fireEvent.change(optBInput, { target: { value: "Đây là một câu trả lời rất dài dòng và chi tiết vượt trội" } });

      // Check for BR-EL-04 warning badge
      expect(screen.getByText(/Cảnh báo \(BR-EL-04\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Độ dài giữa các phương án chênh lệch lớn hơn 2 lần/i)).toBeInTheDocument();
    });

    it("enforces BR-EL-05: maximum 10 questions limit", () => {
      render(
        <LmsMaterialFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      // Go to Tab B
      fireEvent.click(screen.getByRole("button", { name: /Tab B: Câu hỏi kiểm tra/i }));

      // Add 10 questions
      for (let i = 0; i < 10; i++) {
        const addBtn = screen.getByRole("button", { name: /Thêm câu hỏi/i });
        fireEvent.click(addBtn);
      }

      // 10 questions added, add button must be disabled
      const addBtnAfter10 = screen.getByRole("button", { name: /Thêm câu hỏi \(10\/10\)/i });
      expect(addBtnAfter10).toBeDisabled();
    });

    it("validates BR-EL-01: saving Draft only requires Title", async () => {
      const mockCreate = vi.spyOn(lmsApi, "createLmsMaterial").mockResolvedValue({
        id: "mat-draft-01",
        materialCode: "MAT-202611-9999",
        title: "Bản Nháp Thử Nghiệm",
        lessonType: "TYPE_A",
        status: "DRAFT",
        version: 1,
      } as any);

      const onSuccess = vi.fn();
      render(
        <LmsMaterialFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={onSuccess}
        />
      );

      // Enter only Title
      const titleInput = screen.getByPlaceholderText(/Ví dụ: Kỹ thuật xây dựng Prompt Engineering/);
      fireEvent.change(titleInput, { target: { value: "Bản Nháp Thử Nghiệm" } });

      // Click "Lưu bản nháp"
      const draftBtn = screen.getByRole("button", { name: /Lưu bản nháp/i });
      fireEvent.click(draftBtn);

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Bản Nháp Thử Nghiệm",
            status: "DRAFT",
          })
        );
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it("validates BR-EL-01: saving Published requires video and highlights Tab errors", async () => {
      render(
        <LmsMaterialFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      // Enter only title but click "Xuất bản bài học ngay"
      const titleInput = screen.getByPlaceholderText(/Ví dụ: Kỹ thuật xây dựng Prompt Engineering/);
      fireEvent.change(titleInput, { target: { value: "Bài Học Chưa Có Video" } });

      const publishBtn = screen.getByRole("button", { name: /Xuất bản bài học ngay/i });
      fireEvent.click(publishBtn);

      // Verify that error banner displays the missing video requirement
      expect(screen.getByText(/Bài học công khai bắt buộc phải có tệp Video/i)).toBeInTheDocument();
    });
  });
});
