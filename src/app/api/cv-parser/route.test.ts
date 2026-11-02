import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import {
  inferReceivingUnit,
  matchSectors,
  shouldOverrideFullName
} from "@/lib/cv-parser-helper";
import { NextRequest } from "next/server";

const sectors = [
  { code: "LV01", name: "Công nghệ thông tin và truyền thông" },
  { code: "LV08", name: "Vật liệu mới và công nghệ nano, bán dẫn" },
  { code: "LV91", name: "Ngành mới runtime" }
];

const req = (body: object) =>
  new NextRequest("http://localhost:3000/api/cv-parser", {
    method: "POST",
    body: JSON.stringify(body)
  });

const response = (data: unknown, ok = true) => ({
  ok,
  status: ok ? 200 : 503,
  json: async () => data,
  text: async () => JSON.stringify(data)
});

// Mocked route contract tests; separate from approved real-service QC blueprint.
describe("CV Parser dynamic taxonomy contract & CR-2026-021 enhancements", () => {
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

  it("prompts with runtime code/name and returns active sector code", async () => {
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
                      primaryDomain: "LV91"
                    })
                  }
                ]
              }
            }
          ]
        })
      );
    vi.stubGlobal("fetch", fetch);
    const result = await POST(req({ textContent: "CV thử nghiệm" }));
    expect(result.status).toBe(200);
    expect((await result.json()).data.primaryDomain).toBe("LV91");
    expect(fetch.mock.calls[1][1].body).toContain("LV91: Ngành mới runtime");
  });

  it.each([[], null])("fails closed on empty or malformed taxonomy %j", async (data) => {
    const fetch = vi.fn().mockResolvedValue(response({ success: true, data }));
    vi.stubGlobal("fetch", fetch);
    expect((await POST(req({ textContent: "CV" }))).status).toBe(503);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("taxonomy network outage reports service unavailable without AI call", async () => {
    const fetch = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetch);
    expect((await POST(req({ textContent: "CV" }))).status).toBe(503);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("handles AI domain outside active options gracefully without dropping draft (Zero-Lock)", async () => {
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
                      text: '{"fullName":"GS. Nguyễn Văn A","primaryDomain":"UNKNOWN"}'
                    }
                  ]
                }
              }
            ]
          })
        )
    );
    const res = await POST(req({ textContent: "CV" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.fullName).toBe("GS. Nguyễn Văn A");
    expect(body.data.primaryDomain).toBeUndefined();
  });

  it("extracts degreeYear, rawSectorKeywords and infers suggestedReceivingUnit in full route pipeline", async () => {
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
                        fullName: "Bành Quốc Tuấn",
                        academicDegree: "TS",
                        degreeYear: 2011,
                        primaryInstitution: "Viện Ứng dụng Công nghệ - Bộ Khoa học và Công nghệ",
                        workAddress: "C6 Thanh Xuân Bắc, Thanh Xuân, Hà Nội",
                        rawSectorKeywords: ["Quang điện tử", "Laser", "Vật liệu bán dẫn"],
                        yearsOfExperience: 15
                      })
                    }
                  ]
                }
              }
            ]
          })
        )
    );

    const res = await POST(req({ textContent: "Lý lịch khoa học B1-4 Bành Quốc Tuấn" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.degreeYear).toBe(2011);
    expect(body.data.suggestedReceivingUnit?.code).toBe("GLOBAL");
    expect(body.data.suggestedReceivingUnit?.type).toBe("GLOBAL");
    expect(body.data.primaryDomain).toBe("LV08");
    expect(body.data.rawSectorKeywords).toEqual(["Quang điện tử", "Laser", "Vật liệu bán dẫn"]);
  });
});

describe("Unit tests: inferReceivingUnit (BR-EXP-CV-013)", () => {
  it("infers GLOBAL for Central Institute / NacenTech / Ministry of Science and Technology", () => {
    const res = inferReceivingUnit(
      "Viện Ứng dụng Công nghệ, Bộ KH&CN",
      "C6 Thanh Xuân Bắc, Thanh Xuân, Hà Nội"
    );
    expect(res.code).toBe("GLOBAL");
    expect(res.type).toBe("GLOBAL");
    expect(res.name).toContain("NacenTech");
  });

  it("infers HN for Hanoi provincial entities", () => {
    const res = inferReceivingUnit(
      "Trường Đại học Bách Khoa Hà Nội",
      "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội"
    );
    expect(res.code).toBe("HN");
    expect(res.type).toBe("PROVINCE");
  });

  it("infers HP for Hai Phong entities", () => {
    const res = inferReceivingUnit(
      "Đại học Hàng hải Việt Nam",
      "484 Lạch Tray, Ngô Quyền, Hải Phòng"
    );
    expect(res.code).toBe("HP");
    expect(res.type).toBe("PROVINCE");
  });

  it("infers HCM for Ho Chi Minh City entities", () => {
    const res = inferReceivingUnit(
      "Trung tâm Nghiên cứu R&D",
      "Khu Công nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh"
    );
    expect(res.code).toBe("HCM");
    expect(res.type).toBe("PROVINCE");
  });

  it("infers Northern provinces (QN, BN, TN, HD, VP, ND, TB) correctly (DEF-05-CR021-01)", () => {
    // QN: Quảng Ninh, Hạ Long, Cẩm Phả
    expect(inferReceivingUnit("Sở Khoa học Công nghệ", "Thành phố Hạ Long, Quảng Ninh").code).toBe("QN");
    expect(inferReceivingUnit("Bệnh viện Đa khoa Cẩm Phả", "Quảng Ninh").code).toBe("QN");

    // BN: Bắc Ninh, Từ Sơn
    expect(inferReceivingUnit("Đại học Thể dục Thể thao Bắc Ninh", "Phường Trang Hạ, Thị xã Từ Sơn").code).toBe("BN");

    // TN: Thái Nguyên, Sông Công
    expect(inferReceivingUnit("Đại học Thái Nguyên", "Thành phố Thái Nguyên").code).toBe("TN");
    expect(inferReceivingUnit("Nhà máy Phụ tùng Sông Công", "Thái Nguyên").code).toBe("TN");

    // HD: Hải Dương, Chí Linh
    expect(inferReceivingUnit("Trường Đại học Sao Đỏ", "Chí Linh, Hải Dương").code).toBe("HD");

    // VP: Vĩnh Phúc, Vĩnh Yên
    expect(inferReceivingUnit("Trung tâm Khuyến nông Vĩnh Phúc", "Vĩnh Yên, Vĩnh Phúc").code).toBe("VP");

    // ND: Nam Định
    expect(inferReceivingUnit("Đại học Điều dưỡng Nam Định", "Thành phố Nam Định").code).toBe("ND");

    // TB: Thái Bình
    expect(inferReceivingUnit("Đại học Y Dược Thái Bình", "Thành phố Thái Bình").code).toBe("TB");
  });

  it("defaults to GLOBAL for unrecognized remote institutions without hardcoding HP", () => {
    const res = inferReceivingUnit(
      "Viện Nghiên cứu Nông nghiệp Quốc tế",
      "Khu R&D Nước Ngoài"
    );
    expect(res.code).toBe("GLOBAL");
    expect(res.type).toBe("GLOBAL");
  });
});

describe("Unit tests: matchSectors multi-tier matching (BR-EXP-CV-014)", () => {
  const activeSectors = [
    { code: "LV01", name: "Công nghệ thông tin và truyền thông" },
    { code: "LV08", name: "Vật liệu mới và bán dẫn" },
    { code: "LV05", name: "Y tế thông minh và dược phẩm" }
  ];

  it("matches exact sector code if valid", () => {
    const res = matchSectors("LV01", [], activeSectors);
    expect(res.primaryDomain).toBe("LV01");
    expect(res.matchedSectorCodes).toContain("LV01");
  });

  it("maps keywords via alias dictionary to LV08 (semiconductor / optoelectronics)", () => {
    const res = matchSectors(undefined, ["Quang điện tử", "laser", "bán dẫn"], activeSectors);
    expect(res.primaryDomain).toBe("LV08");
    expect(res.matchedSectorCodes).toContain("LV08");
    expect(res.rawSectorKeywords).toEqual(["Quang điện tử", "laser", "bán dẫn"]);
  });

  it("maps keywords via alias dictionary to LV01 (IT / AI / Machine Learning)", () => {
    const res = matchSectors(undefined, ["trí tuệ nhân tạo", "học máy"], activeSectors);
    expect(res.primaryDomain).toBe("LV01");
    expect(res.matchedSectorCodes).toContain("LV01");
  });

  it("preserves rawSectorKeywords when no domain can be resolved (zero data loss)", () => {
    const res = matchSectors(undefined, ["Hóa thạch cổ sinh vật"], activeSectors);
    expect(res.primaryDomain).toBeUndefined();
    expect(res.rawSectorKeywords).toEqual(["Hóa thạch cổ sinh vật"]);
  });
});

describe("Unit tests: shouldOverrideFullName (BR-EXP-CV-011)", () => {
  it("allows overriding when current name is empty or demo placeholder", () => {
    expect(shouldOverrideFullName("")).toBe(true);
    expect(shouldOverrideFullName("   ")).toBe(true);
    expect(shouldOverrideFullName("Dang Lanm")).toBe(true);
    expect(shouldOverrideFullName("Chuyên gia NacenTech")).toBe(true);
    expect(shouldOverrideFullName("User")).toBe(true);
    expect(shouldOverrideFullName("Demo")).toBe(true);
  });

  it("preserves real user-entered name against accidental override", () => {
    expect(shouldOverrideFullName("Bành Quốc Tuấn")).toBe(false);
    expect(shouldOverrideFullName("PGS.TS Nguyễn Văn A")).toBe(false);
  });
});
