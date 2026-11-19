import { describe, expect, it } from "vitest";

const BACKEND_BASE_URL = "http://localhost:5080";

describe("TẦNG 2: QC API CONTRACT TESTS (Client TS <-> Live .NET API Kestrel)", () => {
  // 1. GET Current Assessment
  it("TC-L2-01: GET /api/v1/assessments/tt17/current trả về JSON hợp lệ với đúng cấu trúc camelCase", async () => {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/assessments/tt17/current`);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();

    const data = json.data;
    expect(typeof data.id).toBe("string");
    expect(typeof data.enterpriseName).toBe("string");
    expect(typeof data.taxCode).toBe("string");
    expect(typeof data.assessmentYear).toBe("number");
    expect(typeof data.status).toBe("string");
    expect(typeof data.scopeId).toBe("string");
    expect(typeof data.industryCode).toBe("string");

    // SurveyData
    expect(data.surveyData).toBeDefined();
    expect(typeof data.surveyData.totalCapital).toBe("number");
    expect(typeof data.surveyData.totalWorkforce).toBe("number");

    // ScoreResult
    expect(data.scoreResult).toBeDefined();
    expect(typeof data.scoreResult.scoreT).toBe("number");
    expect(typeof data.scoreResult.scoreE).toBe("number");
    expect(typeof data.scoreResult.scoreO).toBe("number");
    expect(typeof data.scoreResult.scoreR).toBe("number");
    expect(typeof data.scoreResult.scoreI).toBe("number");
    expect(typeof data.scoreResult.totalScore).toBe("number");
    expect(typeof data.scoreResult.syncCoefficient).toBe("number");
    expect(typeof data.scoreResult.classification).toBe("string");
    expect(Array.isArray(data.scoreResult.criteria)).toBe(true);
    expect(Array.isArray(data.scoreResult.bottlenecks)).toBe(true);
  });

  // 2. POST Calculate Endpoint
  it("TC-L2-02: POST /api/v1/assessments/tt17/calculate tính điểm trực tiếp 26 tiêu chí từ surveyData", async () => {
    const payload = {
      industryCode: "C.10",
      totalCapital: 50000000000,
      totalWorkforce: 100,
      originalCostEquipment: 20000000000,
      currentBookValueEquipment: 10000000000,
      directWorkers: 70,
    };

    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/assessments/tt17/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.criteria.length).toBe(26);
    expect(json.data.totalScore).toBeGreaterThan(0);
  });

  // 3. POST Draft Endpoint
  it("TC-L2-03: POST /api/v1/assessments/tt17/draft lưu nháp hồ sơ thành công và trả về DTO", async () => {
    const taxCode = `010${Date.now().toString().slice(-7)}`;
    const payload = {
      assessmentYear: 2026,
      industryCode: "C.25",
      scopeId: "DN",
      taxCode,
      enterpriseName: "Doanh Nghiệp Kiểm Thử Hợp Đồng API",
      surveyData: {
        companyName: "Doanh Nghiệp Kiểm Thử Hợp Đồng API",
        taxCode,
        totalCapital: 15000000000,
        totalWorkforce: 60,
      },
    };

    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/assessments/tt17/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("DRAFT");
    expect(json.data.taxCode).toBe(taxCode);
    expect(json.data.industryCode).toBe("C.25");
  });

  // 4. POST Submit Assessment (Public Intake) & Auto-provisioning
  it("TC-L2-04: POST /api/v1/assessments/tt17/submit nộp hồ sơ công khai và tự động cấp tài khoản autoProvisioned", async () => {
    const taxCode = `010${(Date.now() + 1).toString().slice(-7)}`;
    const payload = {
      assessmentYear: 2026,
      industryCode: "C.28",
      scopeId: "HN",
      enterpriseName: "Công ty Cơ khí Tự Động Hóa Hợp Đồng",
      taxCode,
      contactPerson: "Lê Văn Hợp Đồng",
      contactEmail: "contract.le@automation-vn.com",
      contactPhone: "0909123456",
      surveyData: {
        companyName: "Công ty Cơ khí Tự Động Hóa Hợp Đồng",
        taxCode,
        contactPerson: "Lê Văn Hợp Đồng",
        totalCapital: 30000000000,
        totalWorkforce: 120,
        industryCode: "C.28",
      },
    };

    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/assessments/tt17/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("SUBMITTED");
    expect(json.autoProvisioned).toBe(true);
    expect(json.account).toBeDefined();
    expect(json.account.email).toBe("contract.le@automation-vn.com");
    expect(json.account.taxCode).toBe(taxCode);
    expect(json.account.role).toBe("ENTERPRISE");
  });

  // 5. GET Assessment by ID
  it("TC-L2-05: GET /api/v1/assessments/tt17/{id} truy vấn chi tiết hồ sơ thành công", async () => {
    // Lấy ID từ một hồ sơ hiện có
    const currentRes = await fetch(`${BACKEND_BASE_URL}/api/v1/assessments/tt17/current`);
    const currentJson = await currentRes.json();
    const id = currentJson.data.id;

    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/assessments/tt17/${id}`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBe(id);
  });
});
