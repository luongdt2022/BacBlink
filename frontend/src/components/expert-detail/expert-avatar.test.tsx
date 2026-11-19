import React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ExpertAvatar, getExpertInitials, resolveExpertAvatarUrl } from "./expert-avatar";

describe("ExpertAvatar Component", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe("getExpertInitials", () => {
    it("extracts monogram correctly after removing academic prefixes", () => {
      expect(getExpertInitials("GS.TS. Trần Đình Thắng")).toBe("ĐT");
      expect(getExpertInitials("PGS.TS. Đỗ Thị Thu Hà")).toBe("TH");
      expect(getExpertInitials("PGS.TS. Lê Quốc Hùng")).toBe("QH");
      expect(getExpertInitials("PGS.TS. Nguyễn Minh An")).toBe("MA");
      expect(getExpertInitials("TS. Vũ Mạnh Cường")).toBe("MC");
      expect(getExpertInitials("TS. Hoàng Minh Trí")).toBe("MT");
    });

    it("handles single-word or short names gracefully", () => {
      expect(getExpertInitials("Thắng")).toBe("TH");
      expect(getExpertInitials("")).toBe("CG");
    });
  });

  describe("resolveExpertAvatarUrl", () => {
    it("returns explicit avatar URL if provided", () => {
      expect(resolveExpertAvatarUrl("GS.TS. Trần Đình Thắng", "CG-NACEN-DEMO001", "https://custom.com/pic.jpg")).toBe("https://custom.com/pic.jpg");
    });

    it("resolves built-in portrait paths for known seed experts", () => {
      expect(resolveExpertAvatarUrl("GS.TS. Trần Đình Thắng", "CG-NACEN-DEMO001")).toBe("/images/experts/tran-dinh-thang.jpg");
      expect(resolveExpertAvatarUrl("PGS.TS. Đỗ Thị Thu Hà", "CG-NACEN-0004")).toBe("/images/experts/do-thi-thu-ha.jpg");
      expect(resolveExpertAvatarUrl("PGS.TS. Lê Quốc Hùng", "CG-NACEN-0002")).toBe("/images/experts/le-quoc-hung.jpg");
      expect(resolveExpertAvatarUrl("PGS.TS. Nguyễn Minh An", "CG-NACEN-DEMOIT01")).toBe("/images/experts/nguyen-minh-an.jpg");
      expect(resolveExpertAvatarUrl("TS. Vũ Mạnh Cường", "CG-NACEN-0005")).toBe("/images/experts/vu-manh-cuong.jpg");
      expect(resolveExpertAvatarUrl("TS. Hoàng Minh Trí", "CG-NACEN-0003")).toBe("/images/experts/hoang-minh-tri.jpg");
    });

    it("returns null for unknown experts without explicit URL", () => {
      expect(resolveExpertAvatarUrl("Chuyên Gia Vô Danh", "CG-UNKNOWN")).toBeNull();
    });
  });

  describe("ExpertAvatar Rendering", () => {
    it("renders image when portrait is resolved", () => {
      render(
        <ExpertAvatar
          fullName="GS.TS. Trần Đình Thắng"
          expertCode="CG-NACEN-DEMO001"
          isVerified={true}
        />
      );

      const img = screen.getByTestId("expert-avatar-image") as HTMLImageElement;
      expect(img).toBeDefined();
      expect(img.src).toContain("/images/experts/tran-dinh-thang.jpg");
      expect(screen.getByTestId("expert-avatar-verified-badge")).toBeDefined();
    });

    it("gracefully falls back to monogram initials if image triggers onError", () => {
      render(
        <ExpertAvatar
          fullName="GS.TS. Trần Đình Thắng"
          expertCode="CG-NACEN-DEMO001"
        />
      );

      const img = screen.getByTestId("expert-avatar-image");
      fireEvent.error(img);

      expect(screen.queryByTestId("expert-avatar-image")).toBeNull();
      const initials = screen.getByTestId("expert-avatar-initials");
      expect(initials).toBeDefined();
      expect(initials.textContent).toBe("ĐT");
    });

    it("renders monogram directly when no portrait is available", () => {
      render(
        <ExpertAvatar
          fullName="Kỹ Sư Nguyễn Văn Bình"
          expertCode="CG-NEW-001"
          isVerified={false}
        />
      );

      expect(screen.queryByTestId("expert-avatar-image")).toBeNull();
      expect(screen.getByTestId("expert-avatar-initials").textContent).toBe("VB");
      expect(screen.queryByTestId("expert-avatar-verified-badge")).toBeNull();
    });
  });
});
