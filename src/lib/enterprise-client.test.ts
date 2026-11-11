import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  activateEnterpriseCapability,
  fetchMyEnterpriseProfile,
  invalidateMyEnterpriseProfileCache,
  switchEnterpriseActiveRole,
  updateMyEnterpriseProfile,
} from "./enterprise-client";
import { authClient } from "./auth-client";

describe("enterprise-client fetchMyEnterpriseProfile cache & deduplication (CR-2026-031)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    localStorage.clear();
    invalidateMyEnterpriseProfileCache();
    authClient.setSession("token-user-a", {
      id: "u1",
      email: "a@example.com",
      fullName: "Doanh Nghiệp A",
      role: "SELLER",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    invalidateMyEnterpriseProfileCache();
    localStorage.clear();
  });

  it("reuses cached profile within 30s TTL and refreshes after TTL expires", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-11T10:00:00.000Z"));

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: "ent-a", name: "DN A" } }),
    } as Response);

    const first = await fetchMyEnterpriseProfile();
    const second = await fetchMyEnterpriseProfile();

    expect(first).toEqual({ id: "ent-a", name: "DN A" });
    expect(second).toEqual({ id: "ent-a", name: "DN A" });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Advance past 30s TTL
    vi.advanceTimersByTime(30_001);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: "ent-a", name: "DN A Updated" } }),
    } as Response);

    const third = await fetchMyEnterpriseProfile();
    expect(third).toEqual({ id: "ent-a", name: "DN A Updated" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("deduplicates concurrent in-flight requests for the same token", async () => {
    let resolveFetch!: (value: Response) => void;
    const pendingPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });

    const fetchMock = vi.spyOn(globalThis, "fetch").mockReturnValue(pendingPromise);

    const p1 = fetchMyEnterpriseProfile();
    const p2 = fetchMyEnterpriseProfile();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch({
      ok: true,
      json: async () => ({ data: { id: "ent-shared", activeRole: "SELLER" } }),
    } as Response);

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toEqual({ id: "ent-shared", activeRole: "SELLER" });
    expect(r2).toEqual({ id: "ent-shared", activeRole: "SELLER" });
  });

  it("isolates cache per accessToken so switching user never serves stale profile", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: "ent-a", name: "DN A" } }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: "ent-b", name: "DN B" } }),
      } as Response);

    const resA = await fetchMyEnterpriseProfile();
    expect(resA.name).toBe("DN A");

    authClient.setSession("token-user-b", {
      id: "u2",
      email: "b@example.com",
      fullName: "Doanh Nghiệp B",
      role: "BUYER",
    });

    const resB = await fetchMyEnterpriseProfile();
    expect(resB.name).toBe("DN B");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("bypasses cache with forceRefresh and invalidates cache on profile/role mutations", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: "ent-1", name: "V1" } }),
      } as Response);

    await fetchMyEnterpriseProfile();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await fetchMyEnterpriseProfile({ forceRefresh: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await updateMyEnterpriseProfile({ name: "V2" });
    expect(fetchMock).toHaveBeenCalledTimes(3);

    await fetchMyEnterpriseProfile();
    expect(fetchMock).toHaveBeenCalledTimes(4);

    await switchEnterpriseActiveRole("BUYER");
    await fetchMyEnterpriseProfile();
    expect(fetchMock).toHaveBeenCalledTimes(6);

    await activateEnterpriseCapability("SELLER");
    await fetchMyEnterpriseProfile();
    expect(fetchMock).toHaveBeenCalledTimes(8);
  });

  it("does not cache API errors and allows subsequent retries", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ message: "Server error" }),
        json: async () => ({ message: "Server error" }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: "ent-ok", name: "Recovered" } }),
      } as Response);

    await expect(fetchMyEnterpriseProfile()).rejects.toThrow("Server error");

    const recovered = await fetchMyEnterpriseProfile();
    expect(recovered).toEqual({ id: "ent-ok", name: "Recovered" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
