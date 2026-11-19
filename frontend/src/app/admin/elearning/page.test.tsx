import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminElearningManagementPage from "./page";
import * as lmsApi from "@/lib/api/lms";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("AdminElearningManagementPage & LmsMaterialFormModal — CR-BACLINK-007", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(lmsApi, "fetchLmsMaterials").mockResolvedValue({
      items: [
        {
          id: "lms-bl-01",
          materialCode: "LMS-BL-001",
          title: "Tiêu chuẩn quản lý chất lượng IATF 16949 cho nhà cung ứng công nghiệp hỗ trợ",
          lessonType: "TYPE_B",
          sectorCode: "IND_AUTO",
          durationMinutes: 60,
          status: "PUBLISHED",
          leadInstructorName: "TS. Nguyễn Hữu Quang",
          hasAiKnowledge: true,
          version: 1,
          createdBy: "admin-baclink",
          updatedAt: "2026-11-15T08:00:00Z",
        },
      ],
      totalCount: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders BACLINK LMS Admin workspace and form modal with 8 IND_* sectors, Tab D BACLINK links, and zero TT17/NacenTech strings", async () => {
    const { container } = render(<AdminElearningManagementPage />);

    expect(
      await screen.findByText(
        "Tiêu chuẩn quản lý chất lượng IATF 16949 cho nhà cung ứng công nghiệp hỗ trợ"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Ngành công nghiệp")).toBeInTheDocument();

    // Open form modal
    fireEvent.click(screen.getByRole("button", { name: /Đăng bài học mới/i }));

    await waitFor(() => {
      expect(screen.getByText("Biên Soạn & Đăng Bài Học Mới")).toBeInTheDocument();
    });

    // Verify "Ngành công nghiệp BACLINK" & 8 IND_* options
    expect(screen.getByText("Ngành công nghiệp BACLINK")).toBeInTheDocument();
    for (const code of [
      "IND_ELEC",
      "IND_MECH",
      "IND_AUTO",
      "IND_PLAS",
      "IND_MAT",
      "IND_IT",
      "IND_GREEN",
      "IND_LOG",
    ]) {
      expect(screen.getByRole("option", { name: new RegExp(code) })).toBeInTheDocument();
    }

    // Verify Tab D BACLINK labels
    const tabDBtn = screen.getByRole("button", { name: /Tab D: Liên kết Tài liệu BACLINK/i });
    expect(tabDBtn).toBeInTheDocument();
    fireEvent.click(tabDBtn);

    expect(screen.getByText(/Liên kết dữ liệu BACLINK \(Tối đa 5 liên kết\)/i)).toBeInTheDocument();
    expect(screen.getByText("Chưa có liên kết dữ liệu BACLINK nào.")).toBeInTheDocument();

    const text = container.textContent || "";
    expect(text).not.toMatch(/TT17|NacenTech|NacenTwin|Sở KH&CN|34 tỉnh/i);
  });
});
