import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import ElearningDetailPage from "@/app/elearning/[id]/page";
import * as lmsApi from "@/lib/api/lms";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "mat-test-123" }),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/elearning/mat-test-123",
}));

// Mock authClient
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    getUser: () => ({ id: "user-1", email: "test@nacentech.vn", role: "USER" }),
    isAuthenticated: () => true,
  },
  ROLES: {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    VERIFIED_EXPERT: "VERIFIED_EXPERT",
    USER: "USER",
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const mockBaseMaterial: lmsApi.LmsMaterialDetailDto = {
  id: "mat-test-123",
  materialCode: "MAT-202611-0001",
  title: "Khóa Học Quản Trị Sở Hữu Trí Tuệ",
  lessonType: "TYPE_A",
  sectorCode: "LV01",
  durationMinutes: 45,
  descriptionHtml: "<p>Nội dung chi tiết khóa học</p>",
  videoStorageKey: "lms/videos/quan-tri-shtt.mp4",
  videoFileName: "quan-tri-shtt.mp4",
  videoFileSize: 12288,
  videoDownloadUrl: "http://localhost:5000/files/lms/videos/quan-tri-shtt.mp4",
  thumbnailUrl: "https://cdn.nacentech.vn/thumbs/shtt.jpg",
  status: "PUBLISHED",
  createdBy: "expert-1",
  createdByName: "TS. Nguyễn Văn A",
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z",
  version: 1,
  instructors: [
    {
      id: "inst-1",
      expertProfileId: "exp-1",
      fullName: "TS. Nguyễn Văn A",
      degree: "Tiến sĩ SHTT",
      organization: "Viện SHTT",
      avatarUrl: null,
      sortOrder: 1,
      isLead: true,
    },
  ],
  quizQuestions: [
    {
      id: "q-1",
      sortOrder: 1,
      question: "SHTT bao gồm các quyền nào?",
      optionA: "Quyền tác giả và quyền sở hữu công nghiệp",
      optionB: "Chỉ có quyền tác giả",
      optionC: "Chỉ có quyền sở hữu công nghiệp",
      optionD: "Không có quyền nào",
      correctOption: " ",
      explanation: "",
    },
  ],
  attachments: [
    {
      id: "att-1",
      category: "PRACTICE_TOOL",
      fileName: "tai-lieu-huong-dan.pdf",
      storageKey: "lms/docs/tai-lieu-huong-dan.pdf",
      contentType: "application/pdf",
      fileSize: 2048576,
      sortOrder: 1,
      downloadUrl: "http://localhost:5000/files/lms/docs/tai-lieu-huong-dan.pdf",
    },
  ],
  dbLinks: [],
};

describe("TASK-10: ElearningDetailPage Video Streaming Verification (QC Black-box)", () => {
  it("renders <video> tag with valid videoDownloadUrl and does NOT render fallback text", async () => {
    vi.spyOn(lmsApi, "fetchLmsCatalogDetail").mockResolvedValue(mockBaseMaterial);
    vi.spyOn(lmsApi, "getLearnerProgress").mockResolvedValue({
      learningMaterialId: "mat-test-123",
      watchedSeconds: 120,
      progressPercent: 4,
      isCompleted: false,
      lastAccessedAt: new Date().toISOString(),
    });

    render(<ElearningDetailPage />);

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText("Khóa Học Quản Trị Sở Hữu Trí Tuệ")).toBeInTheDocument();
    });

    // Verify <video> tag exists with correct src
    const videoElement = document.querySelector("video");
    expect(videoElement).not.toBeNull();
    expect(videoElement).toHaveAttribute("src", "http://localhost:5000/files/lms/videos/quan-tri-shtt.mp4");

    // Verify fallback placeholder text is NOT shown
    expect(
      screen.queryByText("Video bài giảng đang được đồng bộ và xử lý lưu trữ.")
    ).toBeNull();
  });

  it("renders <video> tag fallback URL when videoDownloadUrl is missing but videoStorageKey exists", async () => {
    const materialWithoutDirectUrl: lmsApi.LmsMaterialDetailDto = {
      ...mockBaseMaterial,
      videoDownloadUrl: null,
      videoStorageKey: "lms/videos/quan-tri-shtt.mp4",
    };

    vi.spyOn(lmsApi, "fetchLmsCatalogDetail").mockResolvedValue(materialWithoutDirectUrl);
    vi.spyOn(lmsApi, "getLearnerProgress").mockResolvedValue(null);

    render(<ElearningDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Khóa Học Quản Trị Sở Hữu Trí Tuệ")).toBeInTheDocument();
    });

    const videoElement = document.querySelector("video");
    expect(videoElement).not.toBeNull();
    expect(videoElement?.getAttribute("src")).toContain("/files/lms/videos/quan-tri-shtt.mp4");

    expect(
      screen.queryByText("Video bài giảng đang được đồng bộ và xử lý lưu trữ.")
    ).toBeNull();
  });

  it("renders fallback placeholder message when neither videoDownloadUrl nor videoStorageKey exists", async () => {
    const materialWithoutVideo: lmsApi.LmsMaterialDetailDto = {
      ...mockBaseMaterial,
      videoDownloadUrl: null,
      videoStorageKey: null,
    };

    vi.spyOn(lmsApi, "fetchLmsCatalogDetail").mockResolvedValue(materialWithoutVideo);
    vi.spyOn(lmsApi, "getLearnerProgress").mockResolvedValue(null);

    render(<ElearningDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Khóa Học Quản Trị Sở Hữu Trí Tuệ")).toBeInTheDocument();
    });

    // <video> tag must NOT exist
    const videoElement = document.querySelector("video");
    expect(videoElement).toBeNull();

    // Fallback message MUST be displayed
    expect(
      screen.getByText("Video bài giảng đang được đồng bộ và xử lý lưu trữ.")
    ).toBeInTheDocument();
  });
});
