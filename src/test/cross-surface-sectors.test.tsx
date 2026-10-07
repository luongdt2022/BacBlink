import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";
import { readdirSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }));
vi.mock("@/lib/auth-client", () => ({ authClient: { getUser: () => null, onSessionChange: vi.fn(), getAuthHeaders: () => ({}) } }));
vi.mock("@/components/common/toast", () => ({ useToast: () => ({ info: vi.fn(), success: vi.fn(), error: vi.fn() }) }));
const rows = [{ code: "LV91", name: "Ngành mới A" }, { code: "LV92", name: "Ngành đổi tên B" }];
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
// Mocked component regression evidence only; does not certify real DB / black-box QC.
describe("CR-2026-005 dynamic cross-surface sectors", () => {
  it("Home count, labels and directory links follow runtime data with a non-baseline size", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: rows }) }));
    render(<HomePage />);
    expect(await screen.findByText("2 Lĩnh Vực Trọng Điểm")).toBeInTheDocument();
    for (const row of rows) expect(screen.getByRole("link", { name: row.name })).toHaveAttribute("href", `/experts?sector=${row.code}`);
    expect(screen.queryByText(/10 Lĩnh Vực Trọng Điểm/)).not.toBeInTheDocument();
  });
  it("Home empty taxonomy never substitutes seed industries", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: [] }) }));
    render(<HomePage />);
    expect(await screen.findByText("Chưa có lĩnh vực đang hoạt động.")).toBeInTheDocument();
    expect(screen.getByText("0 Lĩnh Vực Trọng Điểm")).toBeInTheDocument();
  });
  it("Home reports taxonomy failure with recovery control and no fabricated count", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<HomePage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Không tải được danh mục lĩnh vực.");
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeInTheDocument();
    expect(screen.queryByText("0 Lĩnh Vực Trọng Điểm")).not.toBeInTheDocument();
  });
  it("global UI sweep contains no obsolete SEC taxonomy codes", () => {
    const files = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(dir, entry.name)) : entry.name.endsWith(".tsx") && !entry.name.endsWith(".test.tsx") ? [join(dir, entry.name)] : []);
    expect(files(resolve("src")).filter(file => /\bSEC-(?:[0-9]{2}|FOOD|MECH|AGRI|TEXTILE|CHEM|BIO|MED)\b/.test(readFileSync(file, "utf8")))).toEqual([]);
  });
});
