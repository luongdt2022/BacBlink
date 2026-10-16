import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("QC Gate 4 Typography Verification (Nunito Sans + Lora Standard DVCQG)", () => {
  const layoutContent = readFileSync(resolve("src/app/layout.tsx"), "utf8");
  const globalsContent = readFileSync(resolve("src/app/globals.css"), "utf8");
  const navbarContent = readFileSync(resolve("src/components/common/navbar.tsx"), "utf8");
  const dialogContent = readFileSync(resolve("src/components/common/dialog.tsx"), "utf8");
  const fontsizeContent = readFileSync(resolve("src/components/common/fontsize-control.tsx"), "utf8");

  describe("Item 1: Header & Navigation Breakpoints", () => {
    it("configures desktop navigation to flex at xl (1280px) and hide below xl to prevent mid-screen menu wrapping", () => {
      expect(navbarContent).toContain("hidden flex-1 items-center justify-center gap-0.5 2xl:gap-1 xl:flex");
      expect(navbarContent).toContain("xl:hidden");
    });

    it("uses whitespace-nowrap and compact spacing on desktop links to prevent line breaks", () => {
      expect(navbarContent).toContain("whitespace-nowrap");
      expect(navbarContent).toContain("px-2 py-1.5 2xl:px-2.5 2xl:py-2 text-xs 2xl:text-sm");
    });
  });

  describe("Item 2: Form Controls & Buttons Standards", () => {
    it("enforces minimum height >= 44px (2.75rem / min-h-11) and baseline vertical centering", () => {
      expect(globalsContent).toContain("height: 2.75rem;");
      expect(globalsContent).toContain("min-height: 2.75rem;");
      expect(globalsContent).toContain("align-items: center;");
    });

    it("provides touch targets >= 44px on interactive controls (A-, A, A+ buttons and triggers)", () => {
      expect(fontsizeContent).toContain("min-h-11 min-w-11");
      expect(navbarContent).toContain("min-h-11 min-w-11");
    });
  });

  describe("Item 3: Data Grid & Cards", () => {
    it("defines surface-card with standard border and radius tokens", () => {
      expect(globalsContent).toContain(".surface-card");
      expect(globalsContent).toContain("border-radius: var(--radius-surface);");
    });
  });

  describe("Item 4: Accessibility Text Scaling A- / A / A+", () => {
    it("implements scale steps: A- (92.5%), A (100%), A+ (110%)", () => {
      expect(globalsContent).toMatch(/html\[data-text-scale="sm"\]\s*\{\s*font-size:\s*92\.5%;\s*\}/);
      expect(globalsContent).toMatch(/html\[data-text-scale="base"\],\s*html\[data-text-scale="md"\]\s*\{\s*font-size:\s*100%;\s*\}/);
      expect(globalsContent).toMatch(/html\[data-text-scale="lg"\]\s*\{\s*font-size:\s*110%;\s*\}/);
    });

    it("prevents horizontal overflow at 110% A+ using overflow-x: clip on html and body", () => {
      expect(globalsContent).toMatch(/html\s*\{[^}]*overflow-x:\s*clip;/);
      expect(globalsContent).toMatch(/body\s*\{[^}]*overflow-x:\s*clip;/);
    });
  });

  describe("Item 5: UTF-8 Vietnamese Font Subsets & Typography Setup", () => {
    it("loads Nunito Sans and Lora from next/font/google with vietnamese subsets and swap display", () => {
      expect(layoutContent).toContain('import { Nunito_Sans, Lora } from "next/font/google";');
      expect(layoutContent).toContain('subsets: ["vietnamese", "latin"]');
      expect(layoutContent).toContain('display: "swap"');
      expect(layoutContent).toContain("--font-nunito-sans");
      expect(layoutContent).toContain("--font-lora");
    });

    it("maps --font-sans to Nunito Sans and --font-heading/--font-serif to Lora", () => {
      expect(globalsContent).toContain("--font-sans: var(--font-nunito-sans), ui-sans-serif, system-ui, sans-serif;");
      expect(globalsContent).toContain("--font-heading: var(--font-lora), ui-serif, Georgia, serif;");
      expect(globalsContent).toContain("--font-serif: var(--font-lora), ui-serif, Georgia, serif;");
    });
  });

  describe("Item 6: Modals & Dialogs", () => {
    it("locks body scroll on modal activation to prevent background scrolling", () => {
      expect(dialogContent).toContain('document.body.style.overflow = "hidden";');
      expect(dialogContent).toContain('document.body.style.overflow = "unset";');
    });

    it("handles keyboard Escape and backdrop dismiss safely", () => {
      expect(dialogContent).toContain('e.key === "Escape"');
      expect(dialogContent).toContain("aria-modal=\"true\"");
    });
  });

  describe("Item 7: Responsive Multi-device Support", () => {
    it("defines page-container responsive padding across mobile, tablet and desktop", () => {
      expect(globalsContent).toContain(".page-container");
      expect(globalsContent).toContain("padding-inline: 1rem;");
      expect(globalsContent).toContain("padding-inline: 1.5rem;");
      expect(globalsContent).toContain("padding-inline: 2rem;");
    });

    it("applies adaptive density for compact HD laptop viewports (1366x768 / 1280x800)", () => {
      expect(globalsContent).toContain("@media (min-width: 1024px) and (max-width: 1440px) and (max-height: 850px)");
      expect(globalsContent).toContain("font-size: 14.75px;");
    });
  });
});
