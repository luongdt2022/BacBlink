import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/api-client";
import {
  matchSectors,
  inferReceivingUnit,
  type SuggestedReceivingUnit,
  type ParsedCvResult
} from "@/lib/cv-parser-helper";

export type { SuggestedReceivingUnit, ParsedCvResult };

const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest",
];

const SYSTEM_PROMPT = (sectorOptions: string) => `Bạn là Trợ lý AI Thẩm định và Bóc tách Hồ sơ Chuyên gia / Cố vấn Kỹ thuật của Hiệp hội Sản xuất Công nghiệp tỉnh Bắc Ninh (BACLINK).
Nhiệm vụ của bạn là đọc kỹ tệp đính kèm (hoặc văn bản CV được cung cấp) và bóc tách dữ liệu chính xác thành định dạng JSON chuẩn.

Yêu cầu xuất ra DUY NHẤT một chuỗi JSON hợp lệ không bọc trong thẻ markdown, với cấu trúc:
{
  "fullName": "Họ và tên chuyên gia (trích xuất chính xác tên đầy đủ, KHÔNG kèm học hàm học vị)",
  "email": "Địa chỉ email liên hệ hoặc công tác trong CV (nếu có)",
  "phone": "Số điện thoại liên hệ trong CV (chuẩn 10 số, nếu có)",
  "birthYear": 1982,
  "gender": "Nam hoặc Nữ hoặc Khác",
  "academicDegree": "GS hoặc PGS hoặc TS hoặc ThS hoặc KySu hoặc Cử nhân",
  "degreeYear": 2011,
  "primaryInstitution": "Tên Doanh nghiệp, Nhà máy, Trường đại học công tác chính (VD: Công ty Cổ phần Công nghệ Thế hệ mới Hanel PT)",
  "workAddress": "Địa chỉ cơ quan công tác (VD: KCN Tiên Sơn, Tỉnh Bắc Ninh)",
  "professionalTitle": "Chức danh kỹ thuật hoặc Chức vụ quản lý (VD: Giám đốc sản xuất, Trưởng phòng R&D, Cố vấn IATF 16949)",
  "yearsOfExperience": 10,
  "bioSummary": "Tóm tắt kinh nghiệm công nghiệp và năng lực thế mạnh (khoảng 2-3 câu)",
  "primaryDomain": "Chọn mã ngành công nghiệp phù hợp nhất trong danh mục hiện hành: ${sectorOptions}",
  "rawSectorKeywords": ["Bán dẫn", "Tự động hóa", "Cơ khí chính xác", "IATF 16949"],
  "specializedKeywords": ["Từ khóa chuyên sâu 1", "Từ khóa chuyên sâu 2"],
  "googleScholarUrl": "URL Google Scholar nếu có trong CV",
  "orcidId": "Mã ORCID (VD: 0000-0002-xxxx-xxxx) nếu có",
  "scopusAuthorId": "Mã Scopus Author ID (VD: 57201234567) nếu có",
  "publications": [
    {
      "title": "Tên bài báo hoặc công trình kỹ thuật",
      "year": 2023,
      "journalOrConference": "Tạp chí hoặc hội nghị chuyên ngành đã đăng",
      "doiOrUrl": "DOI hoặc link tra cứu nếu có"
    }
  ],
  "patents": [
    {
      "title": "Tên bằng độc quyền sáng chế hoặc giải pháp hữu ích",
      "patentNumber": "Số bằng (nếu có)",
      "year": 2022,
      "status": "GRANTED"
    }
  ]
}

Quy tắc bóc tách bắt buộc:
1. 'degreeYear': Tìm năm cấp bằng tốt nghiệp hoặc năm bảo vệ luận án thành công của học vị cao nhất trong phần Đào tạo/Học vị. Ví dụ: 'Tiến sĩ năm 2011' -> degreeYear = 2011. Tuyệt đối không để trống nếu CV có ghi rõ năm tốt nghiệp.
2. 'rawSectorKeywords': Trích xuất toàn bộ các cụm từ mô tả chuyên ngành công nghiệp, kỹ thuật sản xuất, công nghệ thế mạnh (ví dụ: 'cơ khí chính xác', 'bán dẫn', 'tự động hóa', 'trí tuệ nhân tạo'...).
3. 'primaryInstitution' & 'workAddress': Phải bóc tách đầy đủ cả tên đơn vị lẫn địa chỉ khu công nghiệp / tỉnh thành.
4. Nếu không tìm thấy thông tin nào đó trong văn bản, hãy để trống chuỗi rỗng "" hoặc mảng rỗng [], KHÔNG tự bịa đặt dữ liệu (Zero Hallucination).`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Chưa cấu hình GEMINI_API_KEY trên máy chủ. Bạn có thể tiếp tục nhập liệu thủ công.",
          fallbackManual: true,
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { fileBase64, mimeType, fileName, textContent } = body;

    if (!fileBase64 && !textContent) {
      return NextResponse.json(
        {
          success: false,
          error: "Vui lòng cung cấp fileBase64 hoặc textContent của CV.",
        },
        { status: 400 }
      );
    }

    let sectors: Array<{ code: string; name: string }>;
    try {
      const response = await fetch(`${API_BASE}/api/v1/sectors`, { cache: "no-store" });
      if (!response.ok) throw new Error("Taxonomy unavailable");
      const payload = await response.json();
      if (payload.success !== true || !Array.isArray(payload.data) || payload.data.length === 0 ||
          !payload.data.every((item: unknown) => item !== null && typeof item === "object" &&
            typeof (item as { code?: unknown }).code === "string" && (item as { code: string }).code.trim().length > 0 &&
            typeof (item as { name?: unknown }).name === "string")) {
        throw new Error("Invalid taxonomy");
      }
      sectors = payload.data;
    } catch {
      return NextResponse.json({ success: false, error: "Không tải được danh mục lĩnh vực hiện hành. Vui lòng thử lại." }, { status: 503 });
    }
    const sectorOptions = sectors.map((sector) => `${sector.code}: ${sector.name}`).join(" | ");

    // Build parts for Gemini API
    const parts: Array<Record<string, unknown>> = [
      { text: `${SYSTEM_PROMPT(sectorOptions)}\n\nTên tệp: ${fileName || "CV_Lý_lịch_khoa_học.pdf"}\n\nHãy phân tích và trả về JSON chuẩn:` },
    ];

    if (textContent) {
      parts.push({ text: `Nội dung văn bản CV:\n${textContent}` });
    }

    if (fileBase64) {
      const detectedMime = mimeType || "application/pdf";
      parts.push({
        inlineData: {
          mimeType: detectedMime,
          data: fileBase64,
        },
      });
    }

    let lastError = "";
    let extractedJsonText = "";
    let usedModel = "";

    // Loop through candidate models with fallback
    for (const model of CANDIDATE_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        });

        if (!res.ok) {
          const errBody = await res.text();
          lastError = `Model ${model} returned HTTP ${res.status}: ${errBody}`;
          continue;
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          extractedJsonText = text;
          usedModel = model;
          break;
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    if (!extractedJsonText) {
      return NextResponse.json(
        {
          success: false,
          error: `Không thể hoàn thành phân tích AI qua các model Gemini: ${lastError}. Bạn có thể tiếp tục nhập liệu thủ công.`,
          fallbackManual: true,
        },
        { status: 502 }
      );
    }

    // Clean JSON if needed
    let cleanJson = extractedJsonText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```\s*/, "").replace(/```$/, "").trim();
    }

    let parsed: ParsedCvResult;
    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Không thể phân tích cấu trúc dữ liệu JSON từ phản hồi AI. Vui lòng tiếp tục nhập liệu thủ công.",
          fallbackManual: true,
        },
        { status: 422 }
      );
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json(
        {
          success: false,
          error: "Dữ liệu AI trích xuất không hợp lệ. Vui lòng tiếp tục nhập liệu thủ công.",
          fallbackManual: true,
        },
        { status: 422 }
      );
    }

    // Đối soát Ngành công nghiệp BACLINK (IND_*) phân tầng (Multi-tier Anti-destructive Matching)
    const rawKeywords = Array.isArray(parsed.rawSectorKeywords) ? parsed.rawSectorKeywords : [];
    const matched = matchSectors(parsed.primaryDomain, rawKeywords, sectors);
    parsed.primaryDomain = matched.primaryDomain;
    parsed.matchedSectorCodes = matched.matchedSectorCodes;
    parsed.rawSectorKeywords = matched.rawSectorKeywords;

    // Suy luận đơn vị tiếp nhận thẩm định tập trung 1 cấp BACLINK (GLOBAL)
    parsed.suggestedReceivingUnit = inferReceivingUnit(parsed.primaryInstitution, parsed.workAddress);

    return NextResponse.json({
      success: true,
      model: usedModel,
      data: parsed,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi xử lý API CV Parser";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
