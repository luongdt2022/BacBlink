import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getActiveSectors, getPublicExpertFilterOptions, invalidateSectorsCache } from "./master-data-client";

beforeEach(() => {
  invalidateSectorsCache();
});

afterEach(() => {
  invalidateSectorsCache();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

// Mocked SDK contract checks; never counted as DB / real-service black-box evidence.
describe("Runtime master-data SDK", () => {
 it("returns non-baseline current sector codes and names without seed supplementation", async () => { const rows = [{ code: "LV91", name: "Tên đổi mới" }]; const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: rows }) }); vi.stubGlobal("fetch", fetch); expect(await getActiveSectors()).toEqual(rows); expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/v1/sectors"), { cache: "no-store" }); });
 it("preserves legitimate empty taxonomy", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: [] }) })); expect(await getActiveSectors()).toEqual([]); });
 it.each([{ success: false, data: [] }, { success: true, data: null }])("rejects invalid envelope %j", async data => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => data })); await expect(getActiveSectors()).rejects.toThrow(); });
 it("rejects network/HTTP failure without fallback", async () => { vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false })); await expect(getActiveSectors()).rejects.toThrow(); });
 it("reads public province projection separately from sectors", async () => { const fetch = vi.fn(async (url: string) => ({ ok: true, json: async () => ({ success: true, data: url.endsWith("sectors") ? [{ code: "LV91", name: "Ngành" }] : [{ code: "P91", name: "Tỉnh" }] }) })); vi.stubGlobal("fetch", fetch); expect(await getPublicExpertFilterOptions()).toEqual({ sectors: [{ code: "LV91", name: "Ngành" }], provinces: [{ code: "P91", name: "Tỉnh" }] }); expect(fetch.mock.calls.some(([url]) => url.includes("public-provinces"))).toBe(true); });
});

describe("getActiveSectors TTL cache & deduplication (BR-UI-030)", () => {
  it("returns cached data within 60s TTL with only 1 HTTP fetch", async () => {
    vi.useFakeTimers();
    const rows = [{ code: "LV01", name: "Cơ khí" }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: rows }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const first = await getActiveSectors();
    vi.advanceTimersByTime(30_000);
    const second = await getActiveSectors();

    expect(first).toEqual(rows);
    expect(second).toEqual(rows);
    expect(second).not.toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refetches after 60s TTL expires", async () => {
    vi.useFakeTimers();
    const rows1 = [{ code: "LV01", name: "Cơ khí" }];
    const rows2 = [{ code: "LV02", name: "Điện tử" }];
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: rows1 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: rows2 }) });
    vi.stubGlobal("fetch", fetchMock);

    expect(await getActiveSectors()).toEqual(rows1);
    vi.advanceTimersByTime(60_001);
    expect(await getActiveSectors()).toEqual(rows2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("deduplicates concurrent in-flight getActiveSectors() calls into 1 fetch", async () => {
    const rows = [{ code: "LV03", name: "Năng lượng" }];
    let resolveFetch!: (value: unknown) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );
    vi.stubGlobal("fetch", fetchMock);

    const pending = Promise.all([getActiveSectors(), getActiveSectors()]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch({ ok: true, json: async () => ({ success: true, data: rows }) });
    const [first, second] = await pending;

    expect(first).toEqual(rows);
    expect(second).toEqual(rows);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("bypasses existing cache when forceRefresh is true", async () => {
    const rows1 = [{ code: "LV01", name: "Cũ" }];
    const rows2 = [{ code: "LV01", name: "Mới" }];
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: rows1 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: rows2 }) });
    vi.stubGlobal("fetch", fetchMock);

    expect(await getActiveSectors()).toEqual(rows1);
    expect(await getActiveSectors({ forceRefresh: true })).toEqual(rows2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("clears cache when invalidateSectorsCache() is called", async () => {
    const rows1 = [{ code: "LV01", name: "Trước CRUD" }];
    const rows2 = [{ code: "LV01", name: "Sau CRUD" }];
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: rows1 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: rows2 }) });
    vi.stubGlobal("fetch", fetchMock);

    expect(await getActiveSectors()).toEqual(rows1);
    invalidateSectorsCache();
    expect(await getActiveSectors()).toEqual(rows2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not cache HTTP or invalid ApiEnvelope errors and recovers on next call", async () => {
    const rows = [{ code: "LV05", name: "Phục hồi" }];
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: false, data: null }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: rows }) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getActiveSectors()).rejects.toThrow();
    await expect(getActiveSectors()).rejects.toThrow();
    expect(await getActiveSectors()).toEqual(rows);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
