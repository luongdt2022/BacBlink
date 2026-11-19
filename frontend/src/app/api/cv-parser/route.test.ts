import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import {
  inferReceivingUnit,
  matchSectors,
  shouldOverrideFullName,
} from "@/lib/cv-parser-helper";
import { NextRequest } from "next/server";

const sectors = [
  { code: "IND_ELEC", name: "Điện tử, Bán dẫn & Thiết bị điện" },
  { code: "IND_MECH", name: "Cơ khí chính xác, Khuôn mẫu & Chế tạo máy" },
  { code: "IND_IT", name: "Công nghệ thông tin, Phần mềm công nghiệp & MES/ERP" },
];

const req = (body: object) =>
  new NextRequest("http://localhost:3000/api/cv-parser", {
    method: "POST",
    body: JSON.stringify(body),
  });

const response = (data: unknown, ok = true) => ({
  ok,
  status: ok ? 200 : 503,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

describe("CV Parser dynamic BACLINK IND_* taxonomy contract", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "dummy-test-token");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("rejects absent CV input before external calls", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect((await POST(req({}))).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("prompts with runtime IND_* code/name and returns active sector code", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response({ success: true, data: sectors }))
      .mockResolvedValueOnce(
        response({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      fullName: "Chuyên gia thử nghiệm",
                      primaryDomain: "IND_MECH",
                    }),
                  },
                ],
              },
            },
          ],
        })
      );
    vi.stubGlobal("fetch", fetch);
    const result = await POST(req({ textContent: "CV thử nghiệm" }));
    expect(result.status).toBe(200);
    expect((await result.json()).data.primaryDomain).toBe("IND_MECH");
    expect(fetch.mock.calls[1][1].body).toContain("IND_MECH: Cơ khí chính xác");
  });

  it.each([[], null])("fails closed on empty or malformed taxonomy %j", async (data) => {
    const fetch = vi.fn().mockResolvedValue(response({ success: true, data }));
    vi.stubGlobal("fetch", fetch);
    expect((await POST(req({ textContent: "CV" }))).status).toBe(503);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("handles AI domain outside active options gracefully without dropping draft", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(response({ success: true, data: sectors }))
        .mockResolvedValueOnce(
          response({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: '{"fullName":"TS. Nguyễn Minh Khôi","primaryDomain":"UNKNOWN"}',
                    },
                  ],
                },
              },
            ],
          })
        )
    );
    const res = await POST(req({ textContent: "CV" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.fullName).toBe("TS. Nguyễn Minh Khôi");
    expect(body.data.primaryDomain).toBeUndefined();
  });

  it("extracts degreeYear, rawSectorKeywords and infers GLOBAL BACLINK receiving unit", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(response({ success: true, data: sectors }))
        .mockResolvedValueOnce(
          response({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        fullName: "Nguyễn Minh Khôi",
                        academicDegree: "TS",
                        degreeYear: 2014,
                        primaryInstitution: "Công ty Cổ phần Công nghệ Thế hệ mới Hanel PT",
                        workAddress: "KCN Tiên Sơn, Tỉnh Bắc Ninh",
                        rawSectorKeywords: ["Bán dẫn", "PCB", "SMT"],
                        yearsOfExperience: 15,
                      }),
                    },
                  ],
                },
              },
            ],
          })
        )
    );

    const res = await POST(req({ textContent: "Hồ sơ cố vấn kỹ thuật BACLINK" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.degreeYear).toBe(2014);
    expect(body.data.suggestedReceivingUnit?.code).toBe("GLOBAL");
    expect(body.data.suggestedReceivingUnit?.type).toBe("GLOBAL");
    expect(body.data.suggestedReceivingUnit?.name).toContain("BACLINK");
    expect(body.data.primaryDomain).toBe("IND_ELEC");
  });
});

describe("Unit tests: inferReceivingUnit & matchSectors (BACLINK 3-Tier)", () => {
  it("always resolves to GLOBAL BACLINK approval unit without Sở KH&CN remnants", () => {
    const resBn = inferReceivingUnit("Nhà máy Cơ khí Kinh Bắc", "KCN Yên Phong, Bắc Ninh");
    expect(resBn.code).toBe("GLOBAL");
    expect(resBn.type).toBe("GLOBAL");
    expect(resBn.name).toContain("BACLINK");

    const resOther = inferReceivingUnit("Trường Đại học Bách Khoa Hà Nội", "Hà Nội");
    expect(resOther.code).toBe("GLOBAL");
    expect(resOther.type).toBe("GLOBAL");
    expect(resOther.name).toContain("BACLINK");
  });

  it("maps keywords via alias dictionary to IND_ELEC and IND_IT", () => {
    const resElec = matchSectors(undefined, ["bán dẫn", "laser"], sectors);
    expect(resElec.primaryDomain).toBe("IND_ELEC");

    const resIt = matchSectors(undefined, ["trí tuệ nhân tạo", "mes"], sectors);
    expect(resIt.primaryDomain).toBe("IND_IT");
  });

  it("allows overriding when current name is empty or demo placeholder", () => {
    expect(shouldOverrideFullName("")).toBe(true);
    expect(shouldOverrideFullName("Chuyên gia mẫu")).toBe(true);
    expect(shouldOverrideFullName("TS. Nguyễn Minh Khôi")).toBe(false);
  });
});
