import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";
const sectors = [{ code: "LV91", name: "Ngành mới runtime" }];
const req = (body: object) => new NextRequest("http://localhost:3000/api/cv-parser", { method: "POST", body: JSON.stringify(body) });
const response = (data: unknown, ok = true) => ({ ok, status: ok ? 200 : 503, json: async () => data, text: async () => JSON.stringify(data) });
// Mocked route contract tests; separate from approved real-service QC blueprint.
describe("CV Parser dynamic taxonomy contract", () => {
 beforeEach(() => { vi.stubEnv("GEMINI_API_KEY", "dummy-test-token"); });
 afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
 it("rejects absent CV input before external calls", async () => { const fetch = vi.fn(); vi.stubGlobal("fetch", fetch); expect((await POST(req({}))).status).toBe(400); expect(fetch).not.toHaveBeenCalled(); });
 it("prompts with runtime code/name and returns active sector code", async () => {
   const fetch = vi.fn().mockResolvedValueOnce(response({ success: true, data: sectors })).mockResolvedValueOnce(response({ candidates: [{ content: { parts: [{ text: JSON.stringify({ fullName: "Chuyên gia thử nghiệm", primaryDomain: "LV91" }) }] } }] }));
   vi.stubGlobal("fetch", fetch);
   const result = await POST(req({ textContent: "CV thử nghiệm" }));
   expect(result.status).toBe(200); expect((await result.json()).data.primaryDomain).toBe("LV91");
   expect(fetch.mock.calls[1][1].body).toContain("LV91: Ngành mới runtime");
 });
 it.each([[], null])("fails closed on empty or malformed taxonomy %j", async data => { const fetch = vi.fn().mockResolvedValue(response({ success: true, data })); vi.stubGlobal("fetch", fetch); expect((await POST(req({ textContent: "CV" }))).status).toBe(503); expect(fetch).toHaveBeenCalledTimes(1); });
 it("taxonomy network outage reports service unavailable without AI call", async () => { const fetch = vi.fn().mockRejectedValue(new Error("offline")); vi.stubGlobal("fetch", fetch); expect((await POST(req({ textContent: "CV" }))).status).toBe(503); expect(fetch).toHaveBeenCalledTimes(1); });
 it("handles AI domain outside active options gracefully without dropping draft (Zero-Lock)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response({ success: true, data: sectors })).mockResolvedValueOnce(response({ candidates: [{ content: { parts: [{ text: '{"fullName":"GS. Nguyễn Văn A","primaryDomain":"UNKNOWN"}' }] } }] })));
    const res = await POST(req({ textContent: "CV" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.fullName).toBe("GS. Nguyễn Văn A");
    expect(body.data.primaryDomain).toBeUndefined();
  });
});
