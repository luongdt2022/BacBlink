import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getActiveSectors,
  getBacNinhLocations,
  getPublicExpertFilterOptions,
  invalidateLocationsCache,
  invalidateSectorsCache,
} from "./master-data-client";

beforeEach(() => {
  invalidateSectorsCache();
  invalidateLocationsCache();
});

afterEach(() => {
  invalidateSectorsCache();
  invalidateLocationsCache();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

// Mocked SDK contract checks; never counted as DB / real-service black-box evidence.
describe("Runtime master-data SDK", () => {
  it("returns non-baseline current sector codes and names without seed supplementation", async () => {
    const rows = [{ code: "IND_ELEC", name: "Điện tử, Bán dẫn & Thiết bị điện" }];
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: rows }) });
    vi.stubGlobal("fetch", fetch);
    expect(await getActiveSectors()).toEqual(rows);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/v1/sectors"), { cache: "no-store" });
  });

  it("preserves legitimate empty taxonomy", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: [] }) }));
    expect(await getActiveSectors()).toEqual([]);
  });

  it.each([
    { success: false, data: [] },
    { success: true, data: null },
  ])("rejects invalid envelope %j", async (data) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => data }));
    await expect(getActiveSectors()).rejects.toThrow();
  });

  it("rejects network/HTTP failure without fallback", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(getActiveSectors()).rejects.toThrow();
  });

  it("reads Bac Ninh locations from /api/v1/master-data/locations instead of governance public-provinces", async () => {
    const fetch = vi.fn(async (url: string) => ({
      ok: true,
      json: async () => ({
        success: true,
        data: url.endsWith("/api/v1/sectors")
          ? [{ code: "IND_ELEC", name: "Điện tử, Bán dẫn" }]
          : [{ code: "TP_BN", name: "TP. Bắc Ninh", locationType: "AREA" }],
      }),
    }));
    vi.stubGlobal("fetch", fetch);

    expect(await getPublicExpertFilterOptions()).toEqual({
      sectors: [{ code: "IND_ELEC", name: "Điện tử, Bán dẫn" }],
      provinces: [{ code: "TP_BN", name: "TP. Bắc Ninh", locationType: "AREA" }],
    });
    expect(fetch.mock.calls.some(([url]) => String(url).includes("/api/v1/master-data/locations"))).toBe(true);
    expect(fetch.mock.calls.some(([url]) => String(url).includes("public-provinces"))).toBe(false);
  });
});

describe("getActiveSectors TTL cache & deduplication (BR-UI-030)", () => {
  it("returns cached data within 60s TTL with only 1 HTTP fetch", async () => {
    vi.useFakeTimers();
    const rows = [{ code: "IND_MECH", name: "Cơ khí chính xác" }];
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
    const rows1 = [{ code: "IND_MECH", name: "Cơ khí chính xác" }];
    const rows2 = [{ code: "IND_ELEC", name: "Điện tử & Bán dẫn" }];
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
    const rows = [{ code: "IND_GREEN", name: "Công nghiệp xanh" }];
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
    const rows1 = [{ code: "IND_ELEC", name: "Cũ" }];
    const rows2 = [{ code: "IND_ELEC", name: "Mới" }];
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
    const rows1 = [{ code: "IND_ELEC", name: "Trước CRUD" }];
    const rows2 = [{ code: "IND_ELEC", name: "Sau CRUD" }];
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
    const rows = [{ code: "IND_LOG", name: "Phục hồi" }];
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

describe("getBacNinhLocations TTL cache, deduplication & Zero-Static-Fallback (BR-BACLINK-TAX-002)", () => {
  it("supports optional type=AREA|KCN query filter and preserves empty array", async () => {
    const kcnRows = [{ code: "KCN_VSIP_BN", name: "KCN VSIP Bắc Ninh", locationType: "KCN" }];
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: kcnRows }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: [] }) });
    vi.stubGlobal("fetch", fetchMock);

    expect(await getBacNinhLocations({ type: "KCN" })).toEqual(kcnRows);
    expect(fetchMock).toHaveBeenNthCalledWith(1, expect.stringContaining("/api/v1/master-data/locations?type=KCN"), {
      cache: "no-store",
    });

    expect(await getBacNinhLocations({ type: "AREA" })).toEqual([]);
    expect(fetchMock).toHaveBeenNthCalledWith(2, expect.stringContaining("/api/v1/master-data/locations?type=AREA"), {
      cache: "no-store",
    });
  });

  it("caches locations within 60s TTL and deduplicates concurrent in-flight requests", async () => {
    vi.useFakeTimers();
    const rows = [
      { code: "TP_BN", name: "TP. Bắc Ninh", locationType: "AREA" },
      { code: "KCN_YEN_PHONG_1", name: "KCN Yên Phong I", locationType: "KCN" },
    ];
    let resolveFetch!: (value: unknown) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );
    vi.stubGlobal("fetch", fetchMock);

    const pending = Promise.all([getBacNinhLocations(), getBacNinhLocations()]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch({ ok: true, json: async () => ({ success: true, data: rows }) });
    const [first, second] = await pending;
    expect(first).toEqual(rows);
    expect(second).toEqual(rows);

    vi.advanceTimersByTime(30_000);
    const cached = await getBacNinhLocations();
    expect(cached).toEqual(rows);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects HTTP/network errors without static fallback and recovers on next call", async () => {
    const rows = [{ code: "YEN_PHONG", name: "H. Yên Phong", locationType: "AREA" }];
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: rows }) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getBacNinhLocations()).rejects.toThrow();
    await expect(getBacNinhLocations()).rejects.toThrow("network down");
    expect(await getBacNinhLocations()).toEqual(rows);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("bypasses cache when forceRefresh is true", async () => {
    const rows1 = [{ code: "TP_BN", name: "TP. Bắc Ninh" }];
    const rows2 = [{ code: "TU_SON", name: "TP. Từ Sơn" }];
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: rows1 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: rows2 }) });
    vi.stubGlobal("fetch", fetchMock);

    expect(await getBacNinhLocations()).toEqual(rows1);
    expect(await getBacNinhLocations({ forceRefresh: true })).toEqual(rows2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
