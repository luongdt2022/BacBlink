import { afterEach, describe, expect, it, vi } from "vitest";
import { getActiveSectors, getPublicExpertFilterOptions } from "./master-data-client";
afterEach(() => vi.unstubAllGlobals());
// Mocked SDK contract checks; never counted as DB / real-service black-box evidence.
describe("Runtime master-data SDK", () => {
 it("returns non-baseline current sector codes and names without seed supplementation", async () => { const rows = [{ code: "LV91", name: "Tên đổi mới" }]; const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: rows }) }); vi.stubGlobal("fetch", fetch); expect(await getActiveSectors()).toEqual(rows); expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/v1/sectors"), { cache: "no-store" }); });
 it("preserves legitimate empty taxonomy", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: [] }) })); expect(await getActiveSectors()).toEqual([]); });
 it.each([{ success: false, data: [] }, { success: true, data: null }])("rejects invalid envelope %j", async data => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => data })); await expect(getActiveSectors()).rejects.toThrow(); });
 it("rejects network/HTTP failure without fallback", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false })); await expect(getActiveSectors()).rejects.toThrow(); });
 it("reads public province projection separately from sectors", async () => { const fetch = vi.fn(async (url: string) => ({ ok: true, json: async () => ({ success: true, data: url.endsWith("sectors") ? [{ code: "LV91", name: "Ngành" }] : [{ code: "P91", name: "Tỉnh" }] }) })); vi.stubGlobal("fetch", fetch); expect(await getPublicExpertFilterOptions()).toEqual({ sectors: [{ code: "LV91", name: "Ngành" }], provinces: [{ code: "P91", name: "Tỉnh" }] }); expect(fetch.mock.calls.some(([url]) => url.includes("public-provinces"))).toBe(true); });
});
