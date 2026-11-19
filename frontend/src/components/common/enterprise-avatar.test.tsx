import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { EnterpriseAvatar, extractDomain, getEnterpriseInitial } from "./enterprise-avatar";

afterEach(() => {
  cleanup();
});

describe("EnterpriseAvatar & Utilities", () => {
  describe("extractDomain", () => {
    it("correctly normalizes domains from various URL formats", () => {
      expect(extractDomain("https://freyssinet.com.vn")).toBe("freyssinet.com.vn");
      expect(extractDomain("http://www.tantienautomation.com/about")).toBe("tantienautomation.com");
      expect(extractDomain("truonghoan.com.vn/products?id=123")).toBe("truonghoan.com.vn");
      expect(extractDomain("https://WWW.RANGDONG.COM.VN/")).toBe("rangdong.com.vn");
      expect(extractDomain("")).toBe("");
      expect(extractDomain(undefined)).toBe("");
    });
  });

  describe("getEnterpriseInitial", () => {
    it("extracts clean monogram initials", () => {
      expect(getEnterpriseInitial("CÔNG TY TNHH TRƯỜNG HOAN")).toBe("TH");
      expect(getEnterpriseInitial("CÔNG TY CP TÂN TIẾN")).toBe("TT");
      expect(getEnterpriseInitial("FREYSSINET VIETNAM")).toBe("FV");
    });
  });

  describe("EnterpriseAvatar Component", () => {
    it("renders Google Favicon when website is provided", () => {
      render(
        <EnterpriseAvatar
          name="CÔNG TY CP CƠ ĐIỆN & TỰ ĐỘNG HÓA TÂN TIẾN"
          website="https://tantienautomation.com"
          sectorCode="LV01"
        />
      );

      const img = screen.getByRole("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute(
        "src",
        "https://www.google.com/s2/favicons?domain=tantienautomation.com&sz=128"
      );
    });

    it("falls back to Monogram avatar when website is absent", () => {
      render(
        <EnterpriseAvatar
          name="CÔNG TY TNHH TRƯỜNG HOAN"
          sectorCode="LV01"
        />
      );

      expect(screen.queryByRole("img")).toBeNull();
      expect(screen.getByText("TH")).toBeInTheDocument();
    });

    it("falls back to Monogram avatar when image load fails (onError)", () => {
      render(
        <EnterpriseAvatar
          name="CÔNG TY TNHH TRƯỜNG HOAN"
          website="https://broken-domain-that-fails.vn"
          sectorCode="LV01"
        />
      );

      const img = screen.getByRole("img");
      expect(img).toBeInTheDocument();

      // Trigger error
      fireEvent.error(img);

      // Now img should be replaced by monogram
      expect(screen.queryByRole("img")).toBeNull();
      expect(screen.getByText("TH")).toBeInTheDocument();
    });
  });
});
