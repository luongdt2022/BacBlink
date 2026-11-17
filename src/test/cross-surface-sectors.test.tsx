import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";
import { BACLINK_SECTORS_MAP } from "@/lib/gov-label-resolver";
import { readdirSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }));
vi.mock("@/lib/auth-client", () => ({ authClient: { getUser: () => null, onSessionChange: vi.fn(), getAuthHeaders: () => ({}) } }));
vi.mock("@/components/common/toast", () => ({ useToast: () => ({ info: vi.fn(), success: vi.fn(), error: vi.fn() }) }));

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("CR-2026-005 dynamic cross-surface sectors", () => {
  it("BACLINK 8 core industry sectors follow IND_* standard", () => {
    const sectorCodes = Object.keys(BACLINK_SECTORS_MAP);
    expect(sectorCodes).toHaveLength(8);
    expect(sectorCodes).toEqual([
      "IND_ELEC",
      "IND_MECH",
      "IND_AUTO",
      "IND_PLAS",
      "IND_MAT",
      "IND_IT",
      "IND_GREEN",
      "IND_LOG",
    ]);
    for (const [code, name] of Object.entries(BACLINK_SECTORS_MAP)) {
      expect(code).toMatch(/^IND_[A-Z]+$/);
      expect(name).toBeTruthy();
      expect(name.length).toBeGreaterThan(5);
    }
  });

  it("Home workflow displays 8-industry AI Radar and supply chain connect", () => {
    render(<HomePage />);
    expect(screen.getByText(/Thuật toán Radar AI Matching phân tích ma trận 8 ngành IND_\*/i)).toBeInTheDocument();
    expect(screen.getByText(/Gợi ý thông minh theo 8 ngành công nghiệp & KCN/i)).toBeInTheDocument();
  });

  it("Home search categories include technology, demands, and BACLINK entities", () => {
    render(<HomePage />);
    expect(screen.getByRole("combobox", { name: /Chọn danh mục tìm kiếm/i })).toBeInTheDocument();
    expect(screen.getByText("Công nghệ chào bán")).toBeInTheDocument();
    expect(screen.getByText("Nhu cầu công nghệ & ĐMST")).toBeInTheDocument();
    expect(screen.getByText("Doanh nghiệp ĐMST")).toBeInTheDocument();
  });

  it("global UI sweep contains no obsolete SEC taxonomy codes", () => {
    const files = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory()
          ? files(join(dir, entry.name))
          : entry.name.endsWith(".tsx") && !entry.name.endsWith(".test.tsx")
          ? [join(dir, entry.name)]
          : []
      );
    expect(
      files(resolve("src")).filter((file) =>
        /\bSEC-(?:[0-9]{2}|FOOD|MECH|AGRI|TEXTILE|CHEM|BIO|MED)\b/.test(readFileSync(file, "utf8"))
      )
    ).toEqual([]);
  });
});
