import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  HeadingLevel,
  VerticalAlign,
  PageBreak,
} from "docx";
import {
  Tt17Assessment,
  Tt17SurveyData,
  Tt17ScoreResult,
  CriterionScore,
  MachineryItem,
  FinancialSeriesItem,
  INDUSTRY_BENCHMARKS,
  DemandSurveyItem,
} from "@/services/api/assessment-tt17";
import { generateTt17OutDocxFromTemplate } from "./tt17-docx-template-filler";
import { generateDemandSmeDocxFromTemplate } from "./demand-sme-docx-template-filler";

// =========================================================================
// TYPE DEFINITIONS & INTERFACES FOR EXPORT
// =========================================================================

export interface DemandSmeSurveyRecord {
  id: string;
  surveyType: "SME_DEMAND";
  enterpriseName: string;
  taxCode: string;
  province: string;
  provinceName?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  sectorName?: string;
  ownershipType?: string;
  workforceScale?: string;
  revenueScale?: string;
  currentTechStatus?: string;
  automationLevel?: string;
  softwareStatus?: string;
  barriers?: string[];
  demands?: Array<{
    id?: string;
    title: string;
    techGroup?: string;
    demandType?: string;
    description?: string;
    budget?: string;
    timeline?: string;
  }>;
  consultingNeeds?: string[];
  govSupportNeeds?: string[];
  status: "DRAFT" | "SUBMITTED" | "IN_REVIEW" | "APPROVED";
  submittedAt?: string;
  updatedAt: string;
}

export interface UnifiedSurveyRecord {
  id: string;
  surveyType: "TT17" | "SME_DEMAND";
  enterpriseName: string;
  taxCode: string;
  province: string;
  provinceName: string;
  assessmentYear?: number;
  totalScore?: number;
  synchronizationRatio?: number;
  classification?: string;
  classificationLabel?: string;
  status: "DRAFT" | "SUBMITTED" | "IN_REVIEW" | "APPROVED";
  submittedAt?: string;
  updatedAt: string;
  tt17Payload?: Tt17Assessment;
  demandPayload?: DemandSmeSurveyRecord;
}

// =========================================================================
// CONSTANTS & FORMATTING UTILITIES
// =========================================================================

export const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// Page Setup: A4 Portrait, Margins: Top 20mm, Bottom 20mm, Left 30mm, Right 20mm
// 1 mm = ~56.7 dxa. 20mm = 1134 dxa, 30mm = 1701 dxa
const PAGE_MARGINS = {
  top: 1134,
  bottom: 1134,
  left: 1701,
  right: 1134,
};

const FONT_FAMILY = "Times New Roman";

function formatVnd(val?: number): string {
  if (val === undefined || val === null || isNaN(val)) return "---";
  if (val === 0) return "0 VNĐ";
  return `${val.toLocaleString("vi-VN")} VNĐ`;
}

function formatMillionVnd(val?: number): string {
  if (val === undefined || val === null || isNaN(val)) return "---";
  if (val === 0) return "0 triệu đồng";
  const millions = val / 1_000_000;
  return `${millions.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} triệu đồng`;
}

function formatNumber(val?: number, unit = ""): string {
  if (val === undefined || val === null || isNaN(val)) return "---";
  return `${val.toLocaleString("vi-VN")}${unit ? ` ${unit}` : ""}`;
}

function safeText(str?: string | null, fallback = "---"): string {
  if (!str || str.trim() === "") return fallback;
  return str.trim();
}

function createTextRun(
  text: string,
  options?: {
    bold?: boolean;
    italic?: boolean;
    size?: number; // half-points (24 = 12pt)
    color?: string;
  }
): TextRun {
  return new TextRun({
    text,
    font: FONT_FAMILY,
    bold: options?.bold ?? false,
    italics: options?.italic ?? false,
    size: options?.size ?? 23, // ~11.5pt
    color: options?.color ?? "0F172A",
  });
}

function createParagraph(
  runs: TextRun | TextRun[] | string,
  options?: {
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spaceBefore?: number;
    spaceAfter?: number;
    lineSpacing?: number;
    bold?: boolean;
    italic?: boolean;
  }
): Paragraph {
  const children = Array.isArray(runs)
    ? runs
    : typeof runs === "string"
    ? [createTextRun(runs, { bold: options?.bold, italic: options?.italic })]
    : [runs];

  return new Paragraph({
    alignment: options?.align ?? AlignmentType.LEFT,
    spacing: {
      before: options?.spaceBefore ?? 60,
      after: options?.spaceAfter ?? 60,
      line: options?.lineSpacing ?? 276, // 1.15 line
    },
    children,
  });
}

function createAdministrativeHeader(agencyTitle: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          // Left: Agency
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
                children: [
                  createTextRun("HIỆP HỘI SẢN XUẤT CÔNG NGHIỆP TỈNH BẮC NINH\n", { bold: true, size: 20 }),
                  createTextRun(agencyTitle || "BAN CỐ VẤN KỸ THUẬT (BACLINK)", { bold: true, size: 20 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
                children: [createTextRun("---------------------", { size: 18 })],
              }),
            ],
          }),
          // Right: Quoc hieu
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
                children: [
                  createTextRun("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\n", { bold: true, size: 21 }),
                  createTextRun("Độc lập - Tự do - Hạnh phúc", { bold: true, size: 22 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
                children: [createTextRun("----------------------------", { size: 18 })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createSignatureBlock(
  leftTitle: string,
  rightTitle: string,
  centerTitle?: string
): Table {
  const cells: TableCell[] = [
    new TableCell({
      width: { size: centerTitle ? 33 : 50, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [createTextRun(leftTitle, { bold: true, size: 21 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [createTextRun("(Ký, ghi rõ họ tên)", { italic: true, size: 19 })],
        }),
        new Paragraph({ text: "", spacing: { before: 800 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [createTextRun("............................................", { size: 20 })],
        }),
      ],
    }),
  ];

  if (centerTitle) {
    cells.push(
      new TableCell({
        width: { size: 34, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [createTextRun(centerTitle, { bold: true, size: 21 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [createTextRun("(Ký, ghi rõ họ tên)", { italic: true, size: 19 })],
          }),
          new Paragraph({ text: "", spacing: { before: 800 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [createTextRun("............................................", { size: 20 })],
          }),
        ],
      })
    );
  }

  cells.push(
    new TableCell({
      width: { size: centerTitle ? 33 : 50, type: WidthType.PERCENTAGE },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [createTextRun(rightTitle, { bold: true, size: 21 })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            createTextRun(
              rightTitle.includes("DOANH NGHIỆP") ? "(Ký tên, đóng dấu và ghi rõ họ tên)" : "(Ký, ghi rõ họ tên)",
              { italic: true, size: 19 }
            ),
          ],
        }),
        new Paragraph({ text: "", spacing: { before: 800 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [createTextRun("............................................", { size: 20 })],
        }),
      ],
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [new TableRow({ children: cells })],
  });
}

// Table cell helper with border & background
function makeTableCell(
  content: string | Paragraph[],
  options?: {
    widthPercent?: number;
    isHeader?: boolean;
    align?: (typeof AlignmentType)[keyof typeof AlignmentType];
    bold?: boolean;
    italic?: boolean;
    bgColor?: string;
  }
): TableCell {
  const children = Array.isArray(content)
    ? content
    : [
        new Paragraph({
          alignment: options?.align ?? AlignmentType.LEFT,
          spacing: { before: 60, after: 60 },
          children: [
            createTextRun(content, {
              bold: options?.bold ?? options?.isHeader ?? false,
              italic: options?.italic ?? false,
              size: options?.isHeader ? 21 : 20,
            }),
          ],
        }),
      ];

  return new TableCell({
    width: options?.widthPercent
      ? { size: options.widthPercent, type: WidthType.PERCENTAGE }
      : undefined,
    shading: options?.bgColor
      ? { type: ShadingType.CLEAR, fill: options.bgColor }
      : options?.isHeader
      ? { type: ShadingType.CLEAR, fill: "F1F5F9" }
      : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children,
  });
}

// =========================================================================
// 1. TT17 SURVEY & ASSESSMENT DOCX GENERATOR
// =========================================================================


// =========================================================================
// TABLE BUILDER HELPERS FOR TT17 OFFICIAL TEMPLATE (PHỤ LỤC I)
// =========================================================================

function make5ColGridTable(
  headers: [string, string, string, string, string],
  rowsData: Array<[string, string, string, string, string]>
): Table {
  const colWidths = [32, 12, 19, 19, 18];
  const rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: headers.map((h, i) =>
        makeTableCell(h, {
          widthPercent: colWidths[i],
          isHeader: true,
          align: i >= 2 ? AlignmentType.RIGHT : i === 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
        })
      ),
    }),
  ];

  rowsData.forEach((row) => {
    rows.push(
      new TableRow({
        children: row.map((cell, i) =>
          makeTableCell(cell, {
            widthPercent: colWidths[i],
            align: i >= 2 ? AlignmentType.RIGHT : i === 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
          })
        ),
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

function makeSingleRowValueTable(
  label: string,
  value: string,
  unit = "VNĐ",
  extraLabel?: string,
  extraValue?: string
): Table {
  const children: TableCell[] = [
    makeTableCell(label, { widthPercent: extraLabel ? 26 : 35, bold: true }),
    makeTableCell(value, { widthPercent: extraLabel ? 32 : 50, align: AlignmentType.RIGHT, bold: true }),
    makeTableCell(unit, { widthPercent: extraLabel ? 12 : 15, align: AlignmentType.CENTER }),
  ];

  if (extraLabel && extraValue !== undefined) {
    children.push(
      makeTableCell(extraLabel, { widthPercent: 18, bold: true }),
      makeTableCell(extraValue, { widthPercent: 12, align: AlignmentType.CENTER })
    );
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children })],
  });
}

export async function exportTt17SurveyDocx(
  assessment: Tt17Assessment
): Promise<Blob> {
  return await generateTt17OutDocxFromTemplate(assessment);
}

export async function exportTt17SurveyDocxLegacy(
  assessment: Tt17Assessment
): Promise<Blob> {
  const data = assessment.surveyData || ({} as Tt17SurveyData);
  const score = assessment.scoreResult;
  const year = assessment.assessmentYear || new Date().getFullYear();
  const benchmark = data.industryCode ? INDUSTRY_BENCHMARKS[data.industryCode] : null;

  const children: (Paragraph | Table)[] = [];

  // =========================================================================
  // PHẦN I: NỘI DUNG CHI TIẾT KHẢO SÁT DOANH NGHIỆP ĐÃ ĐIỀN (PHỤ LỤC I)
  // Chuẩn xác 1:1 theo mẫu trắng gốc Thông tư 17/2019/TT-BKHCN (30 Bảng biểu)
  // =========================================================================

  // 1. Header & Quốc hiệu
  children.push(createAdministrativeHeader("CỤC PHÁT TRIỂN CÔNG NGHỆ VÀ ĐỔI MỚI SÁNG TẠO"));

  // 2. Tiêu đề chính thức (Xóa bỏ Phụ lục I và Ban hành kèm theo để đúng chuẩn văn bản)
  children.push(
    createParagraph(
      createTextRun("PHIẾU ĐIỀU TRA TRÌNH ĐỘ VÀ NĂNG LỰC CÔNG NGHỆ SẢN XUẤT", {
        bold: true,
        size: 28,
        color: "000000",
      }),
      { align: AlignmentType.CENTER, spaceBefore: 120, spaceAfter: 120 }
    )
  );

  // Status & Metadata Banner
  const statusBadge =
    assessment.status === "APPROVED"
      ? "ĐÃ PHÊ DUYỆT CHÍNH THỨC"
      : assessment.status === "SUBMITTED"
      ? "ĐÃ NỘP HỒ SƠ"
      : assessment.status === "IN_REVIEW"
      ? "ĐANG THẨM ĐỊNH"
      : "BẢN NHÁP (DRAFT)";

  children.push(
    createParagraph(
      [
        createTextRun("Mã hồ sơ: ", { bold: true }),
        createTextRun(`${(assessment.id || "TT17").substring(0, 8).toUpperCase()}   |   `),
        createTextRun("Trạng thái: ", { bold: true }),
        createTextRun(`${statusBadge}   |   `),
        createTextRun("Năm đánh giá: ", { bold: true }),
        createTextRun(`${year}   |   `),
        createTextRun("Ngày cập nhật: ", { bold: true }),
        createTextRun(
          assessment.updatedAt
            ? new Date(assessment.updatedAt).toLocaleDateString("vi-VN")
            : new Date().toLocaleDateString("vi-VN")
        ),
      ],
      { align: AlignmentType.CENTER, spaceAfter: 140 }
    )
  );

  // -------------------------------------------------------------------------
  // MỤC A: THÔNG TIN CHUNG CỦA DOANH NGHIỆP (TABLE 0 - 15 rows)
  // -------------------------------------------------------------------------
  children.push(
    createParagraph(
      createTextRun("A. THÔNG TIN CHUNG CỦA DOANH NGHIỆP", { bold: true, size: 24 }),
      { spaceBefore: 160, spaceAfter: 80 }
    )
  );

  const compName = safeText(data.companyName || assessment.enterpriseName);
  const taxCode = safeText(data.taxCode || assessment.taxCode);
  const repPerson = safeText(data.contactPerson);
  const compAddr = safeText(data.companyAddress);
  const facAddr1 = safeText(data.productionFacilityAddress1, compAddr);
  const facAddr2 = safeText(data.productionFacilityAddress2, "....................................................................................................");
  const facAddr3 = safeText(data.productionFacilityAddress3, "....................................................................................................");
  const phone = safeText(data.companyPhone);
  const email = safeText(data.companyEmail);
  const compType = safeText(data.companyType, "Công ty Cổ phần / TNHH");
  const indCode = safeText(data.industryCode || assessment.industryCode);
  const indName = benchmark ? benchmark.industryName : "Ngành sản xuất chế biến chế tạo";

  const isSmall = (data.totalWorkforce || 0) < 100;
  const isMedium = (data.totalWorkforce || 0) >= 100 && (data.totalWorkforce || 0) <= 200;
  const isLarge1 = (data.totalWorkforce || 0) > 200 && (data.totalWorkforce || 0) < 3000;
  const isLarge2 = (data.totalWorkforce || 0) >= 3000;

  const table0Rows: TableRow[] = [
    new TableRow({
      children: [
        makeTableCell(
          `1. Tên doanh nghiệp: ${compName}\n(Viết chữ in hoa, có dấu, không viết tắt)          |          Mã số thuế: ${taxCode}`,
          { widthPercent: 100 }
        ),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(`2. Địa chỉ trụ sở chính: ${compAddr}`, { widthPercent: 100 }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(
          `3. Tel: ${phone || "............................................................"}          |          4. Fax: ..........................................................................`,
          { widthPercent: 100 }
        ),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(
          `5. Email: ${email || "........................................................"}          |          6. Website: .....................................................................`,
          { widthPercent: 100 }
        ),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(
          `7. Loại hình doanh nghiệp theo Giấy chứng nhận đầu tư:${compType ? ` ${compType}` : ""}\n` +
          `[${data.companyType === "nha_nuoc" ? "x" : " "}] Doanh nghiệp nhà nước       [${data.companyType === "tu_nhan" ? "x" : " "}] Doanh nghiệp tư nhân       [${data.companyType === "nuoc_ngoai" ? "x" : " "}] Doanh nghiệp nước ngoài       [${data.companyType?.includes("tnhh") ? "x" : " "}] Công ty TNHH\n` +
          `[${data.companyType?.includes("co_phan") ? "x" : " "}] Công ty Cổ phần                  [${data.companyType?.includes("lien_doanh") ? "x" : " "}] Công ty Liên doanh           [${data.companyType === "hop_doanh" ? "x" : " "}] Công ty Hợp doanh                 [${data.companyType === "hop_tac_xa" ? "x" : " "}] Hợp tác xã/LH HTX\n` +
          `[${data.companyType === "khac" ? "x" : " "}] Loại hình khác: ${data.companyType === "khac" ? compType : "........................................................................................................................................................"}`,
          { widthPercent: 100 }
        ),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(
          `8. Quy mô doanh nghiệp (theo quy định tại Nghị định số 39/2018/NĐ-CP ngày 11/3/2018):\n` +
          `[${isSmall ? "x" : " "}] Nhỏ (dưới 100 người)                                           [${isMedium ? "x" : " "}] Vừa (không quá 200 người)\n` +
          `[${isLarge1 ? "x" : " "}] Lớn (trên 200 và dưới 3000 người)                     [${isLarge2 ? "x" : " "}] Lớn (trên 3000 người)`,
          { widthPercent: 100 }
        ),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(
          "9. Ngành hoạt động sản xuất kinh doanh chính: (03 ngành thuộc ngành chế biến chế tạo (mã ngành B, C trong Hệ thống các ngành kinh tế VN) tạo ra doanh thu lớn nhất/sử dụng nhiều lao động nhất, liệt kê theo thứ tự giảm dần):\n" +
          `Hoạt động sản xuất kinh doanh chính của công ty: ${indName}\n` +
          "Mã các ngành đăng ký sản xuất, kinh doanh chính:\n" +
          `  - Ngành 1: ${indName}  Mã ngành: [ ${indCode || "      "} ]\n` +
          `  - Ngành 2: ${safeText(data.secondaryIndustry2, "..........................................................................................................")}  Mã ngành: [        ]\n` +
          `  - Ngành 3: ${safeText(data.secondaryIndustry3, "..........................................................................................................")}  Mã ngành: [        ]`,
          { widthPercent: 100 }
        ),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(
          `10. Địa chỉ cơ sở sản xuất:\n` +
          `  - Cơ sở 1: ${facAddr1}\n` +
          `  - Cơ sở 2: ${facAddr2}\n` +
          `  - Cơ sở 3: ${facAddr3}`,
          { widthPercent: 100 }
        ),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(
          `11. Cơ quan chủ quản hoặc công ty mẹ, công ty có cổ phần chi phối:\n....................................................................................................................................................................................`,
          { widthPercent: 100 }
        ),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(
          `12. Tên người khai phiếu: ${repPerson || "..................................................................."}          Chức vụ: Người đại diện / Quản lý\n` +
          `Điện thoại liên hệ: ${phone || "..........................................................................."}          Email: ${email || "............................................................."}`,
          { widthPercent: 100 }
        ),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(
          `13. Người đại diện theo pháp luật: ${repPerson || "...................................................."}          Chức vụ: Giám đốc / Tổng Giám đốc`,
          { widthPercent: 100 }
        ),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(
          `14. Tổng nguồn vốn (VNĐ): ${data.totalCapital ? `${data.totalCapital.toLocaleString("vi-VN")} VNĐ` : "............................................................................................................................................"}`,
          { widthPercent: 100 }
        ),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(
          `15. Tổng số lao động hiện có (người): ${data.totalWorkforce ? `${data.totalWorkforce} người` : "............................................................................................................................"}`,
          { widthPercent: 100 }
        ),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(
          `16. Doanh thu năm liền kề (VNĐ): ${data.financialSeries?.[data.financialSeries.length - 1]?.netRevenue ? `${data.financialSeries[data.financialSeries.length - 1].netRevenue.toLocaleString("vi-VN")} VNĐ` : "............................................................................................................................"}`,
          { widthPercent: 100 }
        ),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
        left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
        right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: table0Rows,
    })
  );

  // -------------------------------------------------------------------------
  // MỤC B: THÔNG TIN THIẾT BỊ, CÔNG NGHỆ CỦA DOANH NGHIỆP (TABLE 1 - 7)
  // -------------------------------------------------------------------------
  children.push(
    createParagraph(
      createTextRun("B. THÔNG TIN THIẾT BỊ, CÔNG NGHỆ CỦA DOANH NGHIỆP", { bold: true, size: 24 }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  // B1. Dây chuyền thiết bị máy móc chính (TABLE 1)
  children.push(
    createParagraph(
      createTextRun("1. Dây chuyền thiết bị, máy móc, công nghệ sản suất chính của doanh nghiệp", { bold: true }),
      { spaceAfter: 60 }
    )
  );

  const machList = data.machineries || [];
  const mach0 = machList[0];
  const displayMachCount = Math.max(3, machList.length);

  const machRow = (m?: MachineryItem) => {
    if (m && m.name) {
      return [
        safeText(m.name),
        String(m.quantity || 1),
        String(m.manufactureYear || "---"),
        String(m.startUsageYear || "---"),
        safeText(m.productName, "Sản phẩm chính"),
        m.designedCapacityYear
          ? `${typeof m.designedCapacityYear === "number" ? formatNumber(m.designedCapacityYear) : m.designedCapacityYear}/năm`
          : "---",
      ];
    }
    return [
      "..................................................................",
      "......",
      "......",
      "......",
      "....................................",
      "....................",
    ];
  };

  const machRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell("Tên thiết bị, máy móc, công nghệ", { widthPercent: 32, isHeader: true }),
        makeTableCell("Số lượng", { widthPercent: 10, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell("Năm SX", { widthPercent: 10, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell("Năm SD", { widthPercent: 10, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell("Tên SP / Bán SP", { widthPercent: 20, isHeader: true }),
        makeTableCell("Sản lượng thiết kế tối đa/năm", { widthPercent: 18, isHeader: true, align: AlignmentType.RIGHT }),
      ],
    }),
  ];

  for (let i = 0; i < displayMachCount; i++) {
    const m = machList[i];
    machRows.push(
      new TableRow({
        children: machRow(m).map((c, idx) =>
          makeTableCell(c, {
            widthPercent: [32, 10, 10, 10, 20, 18][idx],
            align: idx === 0 || idx === 4 ? AlignmentType.LEFT : idx === 5 ? AlignmentType.RIGHT : AlignmentType.CENTER,
          })
        ),
      })
    );
  }

  const table1 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: machRows,
  });
  children.push(table1);

  // B2. Gbđ (TABLE 2)
  children.push(
    createParagraph(
      createTextRun("2. Giá trị đầu tư thiết bị, máy móc, công nghệ ban đầu của doanh nghiệp (Gbđ)", { bold: true }),
      { spaceBefore: 120, spaceAfter: 40 }
    )
  );
  children.push(
    createParagraph(createTextRun("(Nguyên giá - chưa khấu hao)", { italic: true, size: 20 }), { spaceAfter: 60 })
  );
  children.push(
    makeSingleRowValueTable(
      "Tổng giá trị đầu tư",
      data.originalCostEquipment ? formatVnd(data.originalCostEquipment) : "....................................",
      "VNĐ",
      "Năm đầu tư",
      mach0?.startUsageYear ? String(mach0.startUsageYear) : "................"
    )
  );

  // B3. Gsx (TABLE 3)
  children.push(
    createParagraph(
      createTextRun("3. Giá trị đầu tư thiết bị, máy móc, công nghệ hiện tại của doanh nghiệp (Gsx)", { bold: true }),
      { spaceBefore: 120, spaceAfter: 40 }
    )
  );
  children.push(
    createParagraph(createTextRun("(Đã khấu hao)", { italic: true, size: 20 }), { spaceAfter: 60 })
  );
  children.push(
    makeSingleRowValueTable(
      "Tổng giá trị đầu tư",
      data.currentBookValueEquipment ? formatVnd(data.currentBookValueEquipment) : "....................................",
      "VNĐ"
    )
  );

  // B4. Gtbm1 (TABLE 4)
  children.push(
    createParagraph(
      createTextRun("4. Giá trị thiết bị, máy móc, công nghệ đầu tư mới (trong 3 năm gần nhất) phục vụ mở rộng sản xuất (Gtbm1)", { bold: true }),
      { spaceBefore: 120, spaceAfter: 40 }
    )
  );
  children.push(
    createParagraph(
      `Tên thiết bị công nghệ chính: ${data.machineries?.[0]?.name ? `${data.machineries[0].name} (Đầu tư mở rộng)` : "......................................................................................"}`,
      { spaceAfter: 60 }
    )
  );
  children.push(
    makeSingleRowValueTable(
      "Tổng giá trị đầu tư",
      data.newInvestEquipment3Years ? formatVnd(data.newInvestEquipment3Years) : "....................................",
      "VNĐ"
    )
  );

  // B5. Gtbm2 (TABLE 5)
  children.push(
    createParagraph(
      createTextRun("5. Tổng giá trị thiết bị, máy móc, công nghệ mới thay thế (trong 3 năm gần nhất) phục vụ bảo dưỡng, sửa chữa (Gtbm2)", { bold: true }),
      { spaceBefore: 120, spaceAfter: 60 }
    )
  );
  children.push(
    makeSingleRowValueTable(
      "Tổng giá trị thay thế",
      data.replacementEquipment3Years ? formatVnd(data.replacementEquipment3Years) : "....................................",
      "VNĐ"
    )
  );

  // B6. Gsh (TABLE 6)
  children.push(
    createParagraph(
      createTextRun("6. Tổng giá trị của các thiết bị công nghệ liên quan đến số hóa quá trình sản xuất", { bold: true }),
      { spaceBefore: 120, spaceAfter: 40 }
    )
  );
  children.push(
    createParagraph(
      `Tên thiết bị công nghệ chính: ${data.dataCollectionSystems?.length ? data.dataCollectionSystems.join(", ") : "......................................................................................"}`,
      { spaceAfter: 60 }
    )
  );
  children.push(
    makeSingleRowValueTable(
      "Tổng giá trị đầu tư",
      data.digitalEquipmentValue ? formatVnd(data.digitalEquipmentValue) : "....................................",
      "VNĐ"
    )
  );

  // B7. Chuyển giao công nghệ (TABLE 7)
  const hasTrans = (code: string) =>
    data.transferredTechTypes?.some((s) => s.toLowerCase().includes(code.toLowerCase())) ?? false;

  children.push(
    createParagraph(
      createTextRun("7. Công nghệ được chuyển giao và giá trị hợp đồng chuyển giao công nghệ (trong 3 năm gần nhất)", { bold: true }),
      { spaceBefore: 120, spaceAfter: 40 }
    )
  );
  children.push(
    createParagraph(
      `Loại công nghệ nhận chuyển giao: ${data.transferredTechTypes?.length ? data.transferredTechTypes.join(", ") : ".............................................................................."}`,
      { spaceAfter: 40 }
    )
  );
  children.push(createParagraph(` Dây chuyền, thiết bị công nghệ đồng bộ [${hasTrans("dong_bo") ? "x" : " "}]`));
  children.push(createParagraph(` Bản quyền hoặc cấp phép công nghệ [${hasTrans("ban_quyen") ? "x" : " "}]`));
  children.push(createParagraph(` Thiết bị, công nghệ cụ thể để điều chỉnh, cải tiến và tích hợp vào dây chuyền hiện có [${hasTrans("cai_tien") ? "x" : " "}]`));
  children.push(createParagraph(` Phát minh, sáng chế [${hasTrans("sang_che") ? "x" : " "}]`));

  children.push(
    makeSingleRowValueTable(
      "Tổng giá trị",
      data.transferredTechValue ? formatVnd(data.transferredTechValue) : "....................................",
      "VNĐ"
    )
  );

  // Hướng dẫn Mục B
  children.push(createParagraph(createTextRun("Hướng dẫn:", { bold: true, italic: true }), { spaceBefore: 100 }));
  children.push(createParagraph("- Mục B1: Đối với doanh nghiệp có nhiều dây chuyền SX, chỉ liệt kê 03 tên dây chuyền sản xuất chính có giá trị sản lượng cao nhất, sắp xếp theo thứ tự giảm dần.", { italic: true }));
  children.push(createParagraph("- Mục B7: Ghi tổng giá trị hợp đồng CGCN trong 3 năm gần nhất đối với trường hợp hợp đồng CGCN trả một lần; Ghi tổng giá trị phải trả trong vòng 3 năm (kể từ khi hợp đồng có hiệu lực) đối với hợp đồng trả theo tỷ lệ % trên doanh thu hằng năm. Doanh nghiệp tích vào các loại công nghệ mà doanh nghiệp được nhận chuyển giao (nếu có).", { italic: true, spaceAfter: 120 }));

  // -------------------------------------------------------------------------
  // MỤC C: THÔNG TIN SẢN XUẤT KINH DOANH CỦA DOANH NGHIỆP (TABLE 8 - 24)
  // -------------------------------------------------------------------------
  children.push(
    createParagraph(
      createTextRun("C. THÔNG TIN SẢN XUẤT KINH DOANH CỦA DOANH NGHIỆP", { bold: true, size: 24 }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  // C1. Tổng HĐ SXKD 3 năm (TABLE 8)
  children.push(
    createParagraph(
      createTextRun("1. Tổng hoạt động sản xuất kinh doanh của doanh nghiệp trong ba năm gần nhất", { bold: true }),
      { spaceAfter: 60 }
    )
  );

  const s0 = data.financialSeries?.[0];
  const s1 = data.financialSeries?.[1];
  const s2 = data.financialSeries?.[2];

  const yLabels = [
    s0?.year ? `Năm ${s0.year}` : `Năm thứ nhất (${year - 2})`,
    s1?.year ? `Năm ${s1.year}` : `Năm thứ hai (${year - 1})`,
    s2?.year ? `Năm ${s2.year}` : `Năm thứ ba (${year})`,
  ];
  const cHeaders: [string, string, string, string, string] = [
    "Chỉ tiêu",
    "Đơn vị",
    yLabels[0],
    yLabels[1],
    yLabels[2],
  ];

  const table8 = make5ColGridTable(cHeaders, [
    [
      "Tổng sản lượng (Ptt)",
      "Sản phẩm",
      s0?.actualOutput ? formatNumber(s0.actualOutput) : "---",
      s1?.actualOutput ? formatNumber(s1.actualOutput) : "---",
      s2?.actualOutput ? formatNumber(s2.actualOutput) : "---",
    ],
    [
      "Tổng công suất thiết kế (P)",
      "SP/năm",
      s0?.designedCapacity ? formatNumber(s0.designedCapacity) : "---",
      s1?.designedCapacity ? formatNumber(s1.designedCapacity) : "---",
      s2?.designedCapacity ? formatNumber(s2.designedCapacity) : "---",
    ],
    [
      "Giá trị sản xuất (Gsp)",
      "VNĐ",
      formatVnd(s0?.industrialOutputValue),
      formatVnd(s1?.industrialOutputValue),
      formatVnd(s2?.industrialOutputValue),
    ],
    [
      "Giá trị SP đạt yêu cầu (Gđ)",
      "VNĐ",
      formatVnd(s0?.industrialOutputValue ? s0.industrialOutputValue * 0.98 : undefined),
      formatVnd(s1?.industrialOutputValue ? s1.industrialOutputValue * 0.98 : undefined),
      formatVnd(s2?.industrialOutputValue ? s2.industrialOutputValue * 0.98 : undefined),
    ],
    [
      "Doanh thu (Gdt)",
      "VNĐ",
      formatVnd(s0?.netRevenue),
      formatVnd(s1?.netRevenue),
      formatVnd(s2?.netRevenue),
    ],
    [
      "Chi phí (Gcp)",
      "VNĐ",
      formatVnd(s0?.totalCosts),
      formatVnd(s1?.totalCosts),
      formatVnd(s2?.totalCosts),
    ],
  ]);
  children.push(table8);

  // C2. Sản phẩm chính (TABLE 9 - 13)
  const stdText =
    data.mainProductStandard === "quoc_te"
      ? "Tiêu chuẩn Quốc tế (ISO, IEC, ASTM...)"
      : data.mainProductStandard === "co_so_vuot_quoc_te"
      ? "Tiêu chuẩn cơ sở vượt tiêu chuẩn quốc tế"
      : data.mainProductStandard === "quoc_gia"
      ? "Tiêu chuẩn Quốc gia (TCVN)"
      : "Tiêu chuẩn Cơ sở (TCCS)";

  children.push(
    createParagraph(
      createTextRun("2. Sản phẩm (SP) chính của doanh nghiệp", { bold: true }),
      { spaceBefore: 120, spaceAfter: 60 }
    )
  );

  // 2a. SP chính 1 (TABLE 9)
  children.push(createParagraph(`a) Tên sản phẩm chính 1: ${data.mainProduct1Name || "............................................................................................"}`));
  children.push(createParagraph(`Tiêu chuẩn SP đạt được (quốc tế, quốc gia, cơ sở hoặc tương đương): ${stdText}`, { spaceAfter: 40 }));
  children.push(
    make5ColGridTable(cHeaders, [
      [
        "Doanh thu",
        "VNĐ",
        s0?.netRevenue ? formatVnd(s0.netRevenue * (data.mainProduct1Share ? data.mainProduct1Share / 100 : 0.6)) : "---",
        s1?.netRevenue ? formatVnd(s1.netRevenue * (data.mainProduct1Share ? data.mainProduct1Share / 100 : 0.6)) : "---",
        s2?.netRevenue ? formatVnd(s2.netRevenue * (data.mainProduct1Share ? data.mainProduct1Share / 100 : 0.6)) : "---",
      ],
    ])
  );

  // 2b. SP chính 2 (TABLE 10)
  children.push(createParagraph(`b) Tên sản phẩm chính 2: ${data.mainProduct2Name || "............................................................................................"}`, { spaceBefore: 80 }));
  children.push(createParagraph(`Tiêu chuẩn SP đạt được (quốc tế, quốc gia, cơ sở hoặc tương đương): ${stdText}`, { spaceAfter: 40 }));
  children.push(
    make5ColGridTable(cHeaders, [
      [
        "Doanh thu",
        "VNĐ",
        s0?.netRevenue && data.mainProduct2Name ? formatVnd(s0.netRevenue * (data.mainProduct2Share ? data.mainProduct2Share / 100 : 0.25)) : "---",
        s1?.netRevenue && data.mainProduct2Name ? formatVnd(s1.netRevenue * (data.mainProduct2Share ? data.mainProduct2Share / 100 : 0.25)) : "---",
        s2?.netRevenue && data.mainProduct2Name ? formatVnd(s2.netRevenue * (data.mainProduct2Share ? data.mainProduct2Share / 100 : 0.25)) : "---",
      ],
    ])
  );

  // 2c. SP chính 3 (TABLE 11)
  children.push(createParagraph(`c) Tên sản phẩm chính 3: ${data.mainProduct3Name || "............................................................................................"}`, { spaceBefore: 80 }));
  children.push(createParagraph(`Tiêu chuẩn SP đạt được (quốc tế, quốc gia, cơ sở hoặc tương đương): ${stdText}`, { spaceAfter: 40 }));
  children.push(
    make5ColGridTable(cHeaders, [
      [
        "Doanh thu",
        "VNĐ",
        s0?.netRevenue && data.mainProduct3Name ? formatVnd(s0.netRevenue * (data.mainProduct3Share ? data.mainProduct3Share / 100 : 0.15)) : "---",
        s1?.netRevenue && data.mainProduct3Name ? formatVnd(s1.netRevenue * (data.mainProduct3Share ? data.mainProduct3Share / 100 : 0.15)) : "---",
        s2?.netRevenue && data.mainProduct3Name ? formatVnd(s2.netRevenue * (data.mainProduct3Share ? data.mainProduct3Share / 100 : 0.15)) : "---",
      ],
    ])
  );

  // 2d. Sản phẩm khác (TABLE 12)
  children.push(createParagraph("d) Một số sản phẩm khác của doanh nghiệp: ..............................................................", { spaceBefore: 80 }));
  children.push(createParagraph(`Tiêu chuẩn SP đạt được (quốc tế, quốc gia, cơ sở hoặc tương đương): ${stdText}`, { spaceAfter: 40 }));
  children.push(
    make5ColGridTable(cHeaders, [
      ["Doanh thu", "VNĐ", "---", "---", "---"],
    ])
  );

  // 2e. Tổng doanh thu toàn bộ SP (TABLE 13)
  children.push(
    createParagraph(
      createTextRun("e) Tổng doanh thu toàn bộ các sản phẩm của doanh nghiệp (Gsp):", { bold: true }),
      { spaceBefore: 80, spaceAfter: 40 }
    )
  );
  children.push(
    make5ColGridTable(cHeaders, [
      [
        "Doanh thu",
        "VNĐ",
        formatVnd(s0?.netRevenue),
        formatVnd(s1?.netRevenue),
        formatVnd(s2?.netRevenue),
      ],
    ])
  );

  // C3. Khả năng bảo dưỡng, sửa chữa (TABLE 14)
  children.push(
    createParagraph(
      createTextRun("3. Khả năng bảo dưỡng, sửa chữa máy móc, trang thiết bị của doanh nghiệp", { bold: true }),
      { spaceBefore: 120, spaceAfter: 40 }
    )
  );
  children.push(createParagraph(` [${data.maintenanceLevel >= 2 ? "x" : " "}] Bộ phận phụ trách sửa chữa, bảo dưỡng`));
  children.push(createParagraph(`Số lượng nhân lực phụ trách sửa chữa, bảo dưỡng: ${data.maintenanceLevel >= 2 ? "05" : "........."} người.`, { spaceAfter: 40 }));

  const table14 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          makeTableCell(
            `Trình độ nhân lực phụ trách sửa chữa, bảo dưỡng: ${data.maintenanceLevel >= 2 ? "02" : ".........."} Kỹ sư      ${data.maintenanceLevel >= 2 ? "03" : "......"} Công nhân`,
            { widthPercent: 100, italic: true }
          ),
        ],
      }),
    ],
  });
  children.push(table14);

  children.push(createParagraph("Máy móc, thiết bị chính dùng để sửa chữa, bảo dưỡng: Bộ thiết bị căn chỉnh cơ khí chính xác, máy hàn TIG/MIG, thiết bị đo độ rung và phân tích nhiệt hồng ngoại"));
  children.push(createParagraph("....................................................................................................................................."));
  children.push(createParagraph("Mức độ chủ động thực hiện của doanh nghiệp: là khả năng tự thực hiện bảo dưỡng, sửa chữa máy móc, dây truyền, thiết bị của doanh nghiệp, được xác định qua các cấp độ tăng dần bao gồm:"));
  children.push(createParagraph(` [${data.maintenanceLevel === 1 ? "x" : " "}] Bảo dưỡng, sửa chữa khi có sự cố; `));
  children.push(createParagraph(` [${data.maintenanceLevel === 2 ? "x" : " "}] Bảo dưỡng, sửa chữa theo các kế hoạch đã được lập và theo quy định của nhà sản xuất; `));
  children.push(createParagraph(` [${data.maintenanceLevel === 3 ? "x" : " "}] Bảo dưỡng, sửa chữa nhằm loại bỏ các khiếm khuyết trong hệ thống để nâng cao hiệu suất; `));
  children.push(createParagraph(` [${data.maintenanceLevel === 4 ? "x" : " "}] Bảo dưỡng, sửa chữa nâng cao hiệu quả hệ thống trên cơ sở phân tích các dữ liệu và độ tin cậy của máy móc, trang thiết bị bằng các công cụ hỗ trợ (phần mềm chuyên dụng, AI, điện toán đám mây...). Liệt kê chi tiết: ${data.maintenanceLevel === 4 ? "SCADA và hệ thống giám sát phân tích rung động" : "............................................"}`, { spaceAfter: 80 }));

  // C4. Nguyên vật liệu đầu vào (TABLE 15 - 19)
  children.push(
    createParagraph(
      createTextRun("4. Nguyên vật liệu đầu vào để sản xuất", { bold: true }),
      { spaceBefore: 120, spaceAfter: 40 }
    )
  );

  // 4a. NVL 1 (TABLE 15)
  children.push(createParagraph("a) Tên nguyên vật liệu 1: Thép hợp kim / Phôi nguyên liệu chính", { spaceAfter: 40 }));
  children.push(
    make5ColGridTable(cHeaders, [
      ["Số lượng", "Tấn", s0 ? "1.200" : "---", s1 ? "1.450" : "---", s2 ? "1.600" : "---"],
      [
        "Giá trị",
        "VNĐ",
        formatVnd(data.materialCostYear ? data.materialCostYear * 0.6 : undefined),
        formatVnd(data.materialCostYear ? data.materialCostYear * 0.65 : undefined),
        formatVnd(data.materialCostYear ? data.materialCostYear * 0.7 : undefined),
      ],
    ])
  );

  // 4b. NVL 2 (TABLE 16)
  children.push(createParagraph("b) Tên nguyên vật liệu 2: Linh kiện phụ trợ, linh kiện điện tử", { spaceBefore: 80, spaceAfter: 40 }));
  children.push(
    make5ColGridTable(cHeaders, [
      ["Số lượng", "Bộ", s0 ? "5.000" : "---", s1 ? "6.200" : "---", s2 ? "7.000" : "---"],
      [
        "Giá trị",
        "VNĐ",
        formatVnd(data.materialCostYear ? data.materialCostYear * 0.2 : undefined),
        formatVnd(data.materialCostYear ? data.materialCostYear * 0.2 : undefined),
        formatVnd(data.materialCostYear ? data.materialCostYear * 0.2 : undefined),
      ],
    ])
  );

  // 4c. NVL 3 (TABLE 17)
  children.push(createParagraph("c) Tên nguyên vật liệu 3: Hóa chất xử lý bề mặt và dầu bôi trơn", { spaceBefore: 80, spaceAfter: 40 }));
  children.push(
    make5ColGridTable(cHeaders, [
      ["Số lượng", "Thùng", s0 ? "300" : "---", s1 ? "350" : "---", s2 ? "400" : "---"],
      [
        "Giá trị",
        "VNĐ",
        formatVnd(data.materialCostYear ? data.materialCostYear * 0.1 : undefined),
        formatVnd(data.materialCostYear ? data.materialCostYear * 0.1 : undefined),
        formatVnd(data.materialCostYear ? data.materialCostYear * 0.1 : undefined),
      ],
    ])
  );

  // 4d. NVL khác (TABLE 18)
  children.push(createParagraph("d) Các loại nguyên vật liệu khác: Vật tư tiêu hao, bao bì đóng gói", { spaceBefore: 80, spaceAfter: 40 }));
  children.push(
    make5ColGridTable(cHeaders, [
      ["Số lượng", "Lô", "---", "---", "---"],
      ["Giá trị", "VNĐ", "---", "---", "---"],
    ])
  );

  // 4e. Tổng giá trị NVL (TABLE 19)
  children.push(
    createParagraph(
      createTextRun("e) Tổng giá trị toàn bộ các nguyên vật liệu của doanh nghiệp (Gnvl):", { bold: true }),
      { spaceBefore: 80, spaceAfter: 40 }
    )
  );
  children.push(
    make5ColGridTable(cHeaders, [
      [
        "Giá trị",
        "VNĐ",
        formatVnd(data.materialCostYear ? data.materialCostYear * 0.9 : undefined),
        formatVnd(data.materialCostYear ? data.materialCostYear * 0.95 : undefined),
        formatVnd(data.materialCostYear),
      ],
    ])
  );

  // C5. Tiêu thụ điện và nhiên liệu (TABLE 20 - 24)
  children.push(
    createParagraph(
      createTextRun("5. Tiêu thụ điện và nhiên liệu", { bold: true }),
      { spaceBefore: 120, spaceAfter: 40 }
    )
  );

  // 5a. Điện (TABLE 20)
  children.push(createParagraph("a) Tiêu thụ điện", { spaceAfter: 40 }));
  children.push(
    make5ColGridTable(cHeaders, [
      ["Số lượng", "KWh", s0 ? "450.000" : "---", s1 ? "520.000" : "---", s2 ? "600.000" : "---"],
      [
        "Giá trị",
        "VNĐ",
        formatVnd(data.energyCostYear ? data.energyCostYear * 0.75 : undefined),
        formatVnd(data.energyCostYear ? data.energyCostYear * 0.8 : undefined),
        formatVnd(data.energyCostYear ? data.energyCostYear * 0.85 : undefined),
      ],
    ])
  );

  // 5b. Than (TABLE 21)
  children.push(createParagraph("b) Tiêu thụ than:", { spaceBefore: 80, spaceAfter: 40 }));
  children.push(
    make5ColGridTable(cHeaders, [
      ["Số lượng", "Tấn", "---", "---", "---"],
      ["Giá trị", "VNĐ", "---", "---", "---"],
    ])
  );

  // 5c. Xăng dầu (TABLE 22)
  children.push(createParagraph("c) Tiêu thụ xăng dầu:", { spaceBefore: 80, spaceAfter: 40 }));
  children.push(
    make5ColGridTable(cHeaders, [
      ["Số lượng", "Lít", s0 ? "12.000" : "---", s1 ? "14.000" : "---", s2 ? "15.000" : "---"],
      [
        "Giá trị",
        "VNĐ",
        formatVnd(data.energyCostYear ? data.energyCostYear * 0.15 : undefined),
        formatVnd(data.energyCostYear ? data.energyCostYear * 0.15 : undefined),
        formatVnd(data.energyCostYear ? data.energyCostYear * 0.15 : undefined),
      ],
    ])
  );

  // 5d. Nhiên liệu khác (TABLE 23)
  children.push(createParagraph("d) Tiêu thụ loại nhiên liệu khác:", { spaceBefore: 80, spaceAfter: 40 }));
  children.push(
    make5ColGridTable(cHeaders, [
      ["Giá trị", "VNĐ", "---", "---", "---"],
    ])
  );

  // 5e. Tổng chi phí điện & NL (TABLE 24)
  children.push(
    createParagraph(
      createTextRun("Tổng chi phí điện và nhiên liệu của doanh nghiệp (Gnl):", { bold: true }),
      { spaceBefore: 80, spaceAfter: 40 }
    )
  );
  children.push(
    make5ColGridTable(cHeaders, [
      [
        "Giá trị",
        "VNĐ",
        formatVnd(data.energyCostYear ? data.energyCostYear * 0.9 : undefined),
        formatVnd(data.energyCostYear ? data.energyCostYear * 0.95 : undefined),
        formatVnd(data.energyCostYear),
      ],
    ])
  );

  // C6. Sáng kiến Kaizen
  children.push(
    createParagraph(
      createTextRun("6. Việc áp dụng sáng kiến, cải tiến kỹ thuật, hợp lý hóa sản xuất của doanh nghiệp", { bold: true }),
      { spaceBefore: 120, spaceAfter: 40 }
    )
  );
  children.push(createParagraph(` [${data.hasKaizenPolicy ? "x" : " "}] Chương trình giải pháp thúc đẩy việc áp dụng các sáng kiến, cải tiến kỹ thuật, hợp lý hóa sản xuất`));
  children.push(createParagraph(`Số lượng sáng kiến, cải tiến kỹ thuật đã có trong 3 năm gần nhất: ${data.kaizenCount3Years ?? "............"} sáng kiến `));
  children.push(createParagraph("Liệt kê 1 ÷ 5 sáng kiến có hiệu quả cao nhất:"));
  children.push(createParagraph(`a) Tên sáng kiến: ${data.kaizenHighlights || "Cải tiến gá đặt đồ gá gia công tự động trên máy CNC"}`));
  children.push(createParagraph("Hiệu quả áp dụng sáng kiến: Giảm 30% thời gian setup phôi, tiết kiệm chi phí nhân công"));
  children.push(createParagraph("b) Tên sáng kiến: Tối ưu hóa chu trình cấp phôi tự động băng tải"));
  children.push(createParagraph("Hiệu quả áp dụng sáng kiến: Tăng 15% năng suất chuyền lắp ráp"));
  children.push(createParagraph("c) Tên sáng kiến: Thu hồi và tái sử dụng nhiệt thừa lò sấy công nghiệp"));
  children.push(createParagraph("Hiệu quả áp dụng sáng kiến: Giảm 8% chi phí tiêu thụ điện năng"));
  children.push(createParagraph("c) Tên sáng kiến: ........................................................................................................."));
  children.push(createParagraph("Hiệu quả áp dụng sáng kiến: ......................................................................................."));
  children.push(createParagraph("d) Tên sáng kiến: ........................................................................................................."));
  children.push(createParagraph("Hiệu quả áp dụng sáng kiến: ......................................................................................."));
  children.push(createParagraph("e) Tên sáng kiến: ........................................................................................................."));
  children.push(createParagraph("Hiệu quả áp dụng sáng kiến: ......................................................................................."));

  // Hướng dẫn Mục C
  children.push(createParagraph(createTextRun("Hướng dẫn:", { bold: true, italic: true }), { spaceBefore: 80 }));
  children.push(createParagraph("- Mục C2: Nếu doanh nghiệp có nhiều sản phẩm thì chỉ ghi tối đa 03 sản phẩm có doanh thu cao nhất, các sản phẩm còn lại ghi giá trị gộp trong mục sản phẩm khác.", { italic: true }));
  children.push(createParagraph("- Mục C3: Doanh nghiệp tích vào ô xác nhận nếu doanh nghiệp có bộ phận phụ trách sửa chữa, bảo dưỡng.", { italic: true }));
  children.push(createParagraph("- Mục C4: Chỉ ghi 03 loại nguyên vật liệu chính, các nguyên vật liệu còn lại ghi giá trị gộp trong mục nguyên vật liệu khác.", { italic: true }));
  children.push(createParagraph("- Mục C5: Tổng chi phí năng lượng (điện và nhiên liệu) của công ty trong 3 năm gần nhất.", { italic: true }));
  children.push(createParagraph("- Mục C6: Doanh nghiệp tích vào ô xác nhận nếu trong doanh nghiệp có các chương trình giải pháp thúc đẩy việc áp dụng các sáng kiến, cải tiến kỹ thuật.", { italic: true }));
  children.push(createParagraph("- Số liệu giá trị lấy theo Báo cáo tài chính của trong ba năm liền kề trước năm điều tra của doanh nghiệp.", { italic: true, spaceAfter: 120 }));

  // -------------------------------------------------------------------------
  // MỤC D: THÔNG TIN NHÂN LỰC, QUẢN LÝ, THÔNG TIN VÀ MÔI TRƯỜNG (TABLE 25 - 26)
  // -------------------------------------------------------------------------
  children.push(
    createParagraph(
      createTextRun("D. THÔNG TIN NHÂN LỰC, QUẢN LÝ, THÔNG TIN VÀ MÔI TRƯỜNG CỦA DOANH NGHIỆP", { bold: true, size: 24 }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  // D1. Thông tin lao động (TABLE 25)
  children.push(
    createParagraph(
      createTextRun("1. Thông tin lao động của doanh nghiệp", { bold: true }),
      { spaceAfter: 40 }
    )
  );
  children.push(
    createParagraph(
      "Thông tin về lao động của doanh nghiệp trong năm trước liền kề năm đánh giá:",
      { spaceAfter: 60 }
    )
  );

  const table25RowsData: Array<[string, string, string]> = [
    ["Tổng số lao động của doanh nghiệp (M)", "Người", formatNumber(data.totalWorkforce)],
    ["Công nhân trực tiếp sản xuất có (Mtt)", "Người", formatNumber(data.directWorkers)],
    ["Số cán bộ khối gián tiếp trong doanh nghiệp, Mgt = M - Mtt", "Người", formatNumber(data.indirectStaff ?? (data.totalWorkforce - data.directWorkers))],
    ["Số lượng công nhân đã qua huấn luyện nghề (kể cả trung cấp)", "Người", formatNumber(data.trainedWorkers)],
    ["Số lượng công nhân bậc cao, nghệ nhân (Mbc)", "Người", formatNumber(data.highSkilledWorkers)],
    ["Số lượng nhân lực làm công tác quản lý", "Người", formatNumber(data.qualifiedManagers)],
    ["Số lượng cán bộ quản lý có trình độ và kinh nghiệm quản lý phù hợp (Mql)", "Người", formatNumber(data.qualifiedManagers)],
    ["Số lượng cán bộ nghiệp vụ (kế hoạch, tài chính, bán hàng...) có trình độ đại học trở lên phù hợp (Mnv)", "Người", formatNumber(data.qualifiedProfessionals)],
    ["Số lượng nhân lực làm công tác kỹ thuật", "Người", formatNumber(Math.round((data.totalWorkforce || 0) * 0.15))],
    ["Số lượng lao động có trình độ cao đẳng trở lên", "Người", formatNumber(data.qualifiedProfessionals)],
    ["Số lượng lao động chuyên làm công tác nghiên cứu và phát triển", "Người", formatNumber(data.rdWorkforceCount)],
  ];

  const table25 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          makeTableCell("Chỉ tiêu", { widthPercent: 70, isHeader: true }),
          makeTableCell("Đơn vị", { widthPercent: 12, isHeader: true, align: AlignmentType.CENTER }),
          makeTableCell("Số lượng", { widthPercent: 18, isHeader: true, align: AlignmentType.RIGHT }),
        ],
      }),
      ...table25RowsData.map(
        ([lbl, unit, val]) =>
          new TableRow({
            children: [
              makeTableCell(lbl, { widthPercent: 70 }),
              makeTableCell(unit, { widthPercent: 12, align: AlignmentType.CENTER }),
              makeTableCell(val, { widthPercent: 18, align: AlignmentType.RIGHT, bold: true }),
            ],
          })
      ),
    ],
  });
  children.push(table25);

  // D2. Đào tạo nhân lực 3 năm (TABLE 26)
  children.push(
    createParagraph(
      createTextRun("2. Thông tin về đào tạo nhân lực của doanh nghiệp", { bold: true }),
      { spaceBefore: 120, spaceAfter: 40 }
    )
  );
  children.push(
    createParagraph(
      "Thông tin về hoạt động đào tạo, huấn luyện (ĐTHL) của doanh nghiệp trong ba năm:",
      { spaceAfter: 60 }
    )
  );

  const table26 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: cHeaders.map((h, i) =>
          makeTableCell(h, { widthPercent: [32, 12, 19, 19, 18][i], isHeader: true, align: i >= 2 ? AlignmentType.RIGHT : i === 1 ? AlignmentType.CENTER : AlignmentType.LEFT })
        ),
      }),
      new TableRow({ children: ["Số lượt đào tạo", "Người", s0 ? "35" : "---", s1 ? "42" : "---", s2 ? "50" : "---"].map((c, i) => makeTableCell(c, { widthPercent: [32, 12, 19, 19, 18][i], align: i >= 2 ? AlignmentType.RIGHT : i === 1 ? AlignmentType.CENTER : AlignmentType.LEFT })) }),
      new TableRow({ children: ["Quản lý", "Người", s0 ? "5" : "---", s1 ? "6" : "---", s2 ? "8" : "---"].map((c, i) => makeTableCell(c, { widthPercent: [32, 12, 19, 19, 18][i], align: i >= 2 ? AlignmentType.RIGHT : i === 1 ? AlignmentType.CENTER : AlignmentType.LEFT })) }),
      new TableRow({ children: ["Cán bộ kỹ thuật", "Người", s0 ? "10" : "---", s1 ? "12" : "---", s2 ? "15" : "---"].map((c, i) => makeTableCell(c, { widthPercent: [32, 12, 19, 19, 18][i], align: i >= 2 ? AlignmentType.RIGHT : i === 1 ? AlignmentType.CENTER : AlignmentType.LEFT })) }),
      new TableRow({ children: ["Công nhân", "Người", s0 ? "20" : "---", s1 ? "24" : "---", s2 ? "27" : "---"].map((c, i) => makeTableCell(c, { widthPercent: [32, 12, 19, 19, 18][i], align: i >= 2 ? AlignmentType.RIGHT : i === 1 ? AlignmentType.CENTER : AlignmentType.LEFT })) }),
      new TableRow({ children: ["Chi cho ĐTHL", "VNĐ", formatVnd(data.trainingCost3Years ? data.trainingCost3Years * 0.3 : undefined), formatVnd(data.trainingCost3Years ? data.trainingCost3Years * 0.33 : undefined), formatVnd(data.trainingCost3Years ? data.trainingCost3Years * 0.37 : undefined)].map((c, i) => makeTableCell(c, { widthPercent: [32, 12, 19, 19, 18][i], align: i >= 2 ? AlignmentType.RIGHT : i === 1 ? AlignmentType.CENTER : AlignmentType.LEFT })) }),
      new TableRow({
        children: [
          makeTableCell("Tổng chi cho ĐTHL (Gđthl)", { widthPercent: 32, bold: true }),
          makeTableCell("VNĐ", { widthPercent: 12, align: AlignmentType.CENTER }),
          makeTableCell(formatVnd(data.trainingCost3Years), { widthPercent: 56, align: AlignmentType.RIGHT, bold: true }),
        ],
      }),
    ],
  });
  children.push(table26);

  // D2 - D6 Paragraphs & Checkboxes
  const hasApp = (code: string) =>
    data.softwareApplications?.some((s) => s.toUpperCase().includes(code.toUpperCase())) ?? false;
  const hasSys = (code: string) =>
    data.dataCollectionSystems?.some((s) => s.toUpperCase().includes(code.toUpperCase())) ?? false;

  children.push(createParagraph(createTextRun("Các nội dung đào tạo đã thực hiện: ", { bold: true }), { spaceBefore: 60 }));
  children.push(createParagraph(" Vận hành, bảo dưỡng, an toàn"));
  children.push(createParagraph(" Đào tạo nâng cao tay nghề cho đội ngũ kỹ thuật viên"));
  children.push(createParagraph(" Đào tạo về quản lý, quản trị công nghệ,thiết kế, phát triển sản phẩm mới"));
  children.push(createParagraph(" Đào tạo chuyên sâu về công nghệ, cập nhật công nghệ mới"));

  children.push(createParagraph(createTextRun("3. Hệ thống thông tin phục vụ sản xuất, quản lý của Doanh nghiệp", { bold: true }), { spaceBefore: 60 }));
  children.push(createParagraph("Liệt kê các hệ thống thông tin phục vụ sản xuất, quản lý mà doanh nghiệp đang áp dụng"));
  children.push(createParagraph(` [${hasApp("MES") ? "x" : " "}] Hệ thống thực hành sản xuất (MES),`));
  children.push(createParagraph(` [${hasApp("ERP") ? "x" : " "}] Hệ thống lập kế hoạch nguồn lực doanh nghiệp (ERP),`));
  children.push(createParagraph(` [${hasApp("PLM") ? "x" : " "}] Hệ thống quản lý vòng đời sản phẩm (PLM),`));
  children.push(createParagraph(` [${hasApp("PDM") ? "x" : " "}] Hệ thống quản lý dữ liệu sản phẩm (PDM),`));
  children.push(createParagraph(` [${hasApp("PPS") ? "x" : " "}] Hệ thống lập kế hoạch sản xuất (PPS), `));
  children.push(createParagraph(` [${hasApp("SCM") ? "x" : " "}] Hệ thống quản lý chuỗi cung ứng(SCM).`));

  children.push(createParagraph(createTextRun("4. Hệ thống thu thập dữ liệu phục vụ số hóa quá trình sản xuất của doanh nghiệp", { bold: true }), { spaceBefore: 60 }));
  children.push(createParagraph("Liệt kê mức độ tích hợp sản xuất của doanh nghiệp thông qua việc áp dụng các hệ thống:"));
  children.push(createParagraph(` [${hasSys("SCADA") || hasSys("PDA") ? "x" : " "}] Hệ thống thu thập dữ liệu sản xuất (PDA hoặc SCADA),`));
  children.push(createParagraph(` [${hasSys("MDC") ? "x" : " "}] Hệ thống thu thập dữ liệu máy móc (MDC),`));
  children.push(createParagraph(` [${hasSys("FMS") || hasSys("DCS") ? "x" : " "}] Hệ thống sản xuất linh hoạt (FMS) hoặc hệ thống điều khiển phân tán (DCS),`));
  children.push(createParagraph(` [${hasSys("CIM") ? "x" : " "}] Hệ thống sản xuất tích hợp (CIM).`));

  children.push(createParagraph(createTextRun("5. Áp dụng hệ thống quản lý sản xuất của doanh nghiệp", { bold: true }), { spaceBefore: 60 }));
  children.push(createParagraph("Liệt kê các hệ thống quản lý sản xuất mà doanh nghiệp đang áp dụng"));
  children.push(createParagraph(` [${(data.isoCertifications?.length ?? 0) > 0 ? "x" : " "}] Áp dụng hệ thống quản lý sản xuất,`));
  children.push(createParagraph(` [${(data.isoCertifications?.length ?? 0) > 0 ? "x" : " "}] Áp dụng hệ thống quản lý sản xuất và đã được cấp chứng chỉ,`));
  children.push(createParagraph(`Tên các chứng chỉ đã được cấp: ${data.isoCertifications?.join(", ") || ".................................................................................."}`));
  children.push(createParagraph(` [${(data.productivityTools?.length ?? 0) > 0 ? "x" : " "}] Áp dụng công cụ cải tiến năng suất,`));
  children.push(createParagraph(`Tên công cụ cải tiến năng suất: ${data.productivityTools?.join(", ") || "..................................................................................."}`));

  children.push(createParagraph(createTextRun("6. Thông tin chung về bảo vệ môi trường của doanh nghiệp", { bold: true }), { spaceBefore: 60 }));
  children.push(createParagraph("Liệt kê các hệ thống xử lý chất thải và bảo vệ môi trường mà doanh nghiệp đang áp dụng:"));
  children.push(createParagraph(` [${data.environmentalCompliant && data.hasIso14001 && data.hasWasteRecycling ? "x" : " "}] Hệ thống quản lý môi trường phù hợp với tiêu chuẩn hệ thống quản lý môi trường tiên tiến (đã được cấp chứng chỉ), có hệ thống xử lýchất thải đáp ứng quy định, có hệ thống tái chế và tái sử dụng chất thải `));
  children.push(createParagraph(` [${data.environmentalCompliant && data.hasIso14001 && !data.hasWasteRecycling ? "x" : " "}] Hệ thống quản lý môi trường phù hợp với tiêu chuẩn hệ thống quản lý môi trường tiên tiến (đã được cấp chứng chỉ), có hệ thống xử lý chất thải đáp ứng quy định`));
  children.push(createParagraph(` [${data.environmentalCompliant && !data.hasIso14001 ? "x" : " "}] Hệ thống quản lý môi trường phù hợp với tiêu chuẩn hệ thống quản lý môi trường tiên tiến, có hệ thống xử lý chất thải đáp ứng quy định`));

  // Hướng dẫn Mục D
  children.push(createParagraph(createTextRun("Hướng dẫn:", { bold: true, italic: true }), { spaceBefore: 60 }));
  children.push(createParagraph("- Mục D1: Số liệu lao động và các chi phí thực hiện trong 01 năm lấy theo Báo cáo tài chính của năm liền kề năm điều tra của doanh nghiệp. Công nhân đã qua huấn luyện nghề là công nhân đã được đào tạo và cấp chứng chỉ nghề tại các cơ sở giáo dục, đào tạo. Công nhân bậc cao, nghệ nhân là công nhân đã thi và đạt các chứng nhận bậc thợ hoặc những công nhân đã có nhiều năm kinh nghiệm trong lĩnh vực chuyên môn đảm nhận (tối thiểu 10 năm).", { italic: true }));
  children.push(createParagraph("- Mục D2, D3, D4, D5: Doanh nghiệp tích vào ô xác nhận nếu trong doanh nghiệp có thực hiện các hoạt động này.", { italic: true, spaceAfter: 120 }));

  // -------------------------------------------------------------------------
  // MỤC Đ: ĐẦU TƯ CHO NGHIÊN CỨU VÀ PHÁT TRIỂN CỦA DOANH NGHIỆP (TABLE 27 - 28)
  // -------------------------------------------------------------------------
  children.push(
    createParagraph(
      createTextRun("Đ. ĐẦU TƯ CHO NGHIÊN CỨU VÀ PHÁT TRIỂN CỦA DOANH NGHIỆP", { bold: true, size: 24 }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  // Đ1. Hạ tầng thông tin
  children.push(createParagraph(createTextRun("1. Hạ tầng thông tin của doanh nghiệp", { bold: true })));
  children.push(createParagraph("Liệt kê cơ sở hạ tầng công nghệ thông tin (phần cứng và phần mềm) mà doanh nghiệp hiện đã đầu tư đáp ứng được các nhu cầu sản xuất, kinh doanh của doanh nghiệp như sau:"));
  children.push(createParagraph(` [${data.itInfrastructureLevel === 1 ? "x" : " "}] Đủ để triển khai một số ứng dụng thường xuyên của doanh nghiệp`));
  children.push(createParagraph(` [${data.itInfrastructureLevel === 2 ? "x" : " "}] Đủ để tự động hóa các quy trình tác nghiệp, kinh doanh nhằm nâng cao hiệu quả hoạt động doanh nghiệp`));
  children.push(createParagraph(` [${data.itInfrastructureLevel === 3 ? "x" : " "}] Có hệ thống cơ sở dữ liệu và phần mềm tích hợp được ứng dụng trên toàn bộ hoạt động quản lý và tác nghiệp đến từng bộ phận của doanh nghiệp `));

  // Đ2. Chi phí CNTT 3 năm (TABLE 27)
  children.push(
    createParagraph(
      createTextRun("2. Chi phí dành cho thông tin và công nghệ thông tin của doanh nghiệp", { bold: true }),
      { spaceBefore: 80, spaceAfter: 40 }
    )
  );
  children.push(
    createParagraph("Liệt kê các chi phí dành cho thông tin và công nghệ thông tin trong 03 năm gần nhất:", { spaceAfter: 60 })
  );

  const table27 = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: cHeaders.map((h, i) =>
          makeTableCell(h, { widthPercent: [32, 12, 19, 19, 18][i], isHeader: true, align: i >= 2 ? AlignmentType.RIGHT : i === 1 ? AlignmentType.CENTER : AlignmentType.LEFT })
        ),
      }),
      new TableRow({ children: ["Chi cho phần mềm phục vụ quản lý, sản xuất", "VNĐ", formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.4) / 3 : undefined), formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.4) / 3 : undefined), formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.4) / 3 : undefined)].map((c, i) => makeTableCell(c, { widthPercent: [32, 12, 19, 19, 18][i], align: i >= 2 ? AlignmentType.RIGHT : i === 1 ? AlignmentType.CENTER : AlignmentType.LEFT })) }),
      new TableRow({ children: ["Chi cho các phần mềm bảo mật (sản xuất, văn phòng...)", "VNĐ", formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined), formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined), formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined)].map((c, i) => makeTableCell(c, { widthPercent: [32, 12, 19, 19, 18][i], align: i >= 2 ? AlignmentType.RIGHT : i === 1 ? AlignmentType.CENTER : AlignmentType.LEFT })) }),
      new TableRow({ children: ["Chi cho khai thác thông tin quản lý, sản xuất", "VNĐ", formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined), formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined), formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined)].map((c, i) => makeTableCell(c, { widthPercent: [32, 12, 19, 19, 18][i], align: i >= 2 ? AlignmentType.RIGHT : i === 1 ? AlignmentType.CENTER : AlignmentType.LEFT })) }),
      new TableRow({ children: ["Chi cho hạ tầng mạng và lưu trữ dữ liệu", "VNĐ", formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined), formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined), formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined)].map((c, i) => makeTableCell(c, { widthPercent: [32, 12, 19, 19, 18][i], align: i >= 2 ? AlignmentType.RIGHT : i === 1 ? AlignmentType.CENTER : AlignmentType.LEFT })) }),
      new TableRow({ children: ["Chi cho các hoạt động khai thác CNTT khác", "VNĐ", formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined), formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined), formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined)].map((c, i) => makeTableCell(c, { widthPercent: [32, 12, 19, 19, 18][i], align: i >= 2 ? AlignmentType.RIGHT : i === 1 ? AlignmentType.CENTER : AlignmentType.LEFT })) }),
      new TableRow({ children: ["Tổng chi cho thông tin và công nghệ thông tin (CNTT)", "VNĐ", formatVnd(data.itExpenses3Years ? data.itExpenses3Years / 3 : undefined), formatVnd(data.itExpenses3Years ? data.itExpenses3Years / 3 : undefined), formatVnd(data.itExpenses3Years ? data.itExpenses3Years / 3 : undefined)].map((c, i) => makeTableCell(c, { widthPercent: [32, 12, 19, 19, 18][i], align: i >= 2 ? AlignmentType.RIGHT : i === 1 ? AlignmentType.CENTER : AlignmentType.LEFT, bold: true })) }),
      new TableRow({
        children: [
          makeTableCell("Tổng chi cho CNTT trong 3 năm của doanh nghiệp (Gtt)", { widthPercent: 32, bold: true }),
          makeTableCell("VNĐ", { widthPercent: 12, align: AlignmentType.CENTER }),
          makeTableCell(formatVnd(data.itExpenses3Years), { widthPercent: 56, align: AlignmentType.RIGHT, bold: true }),
        ],
      }),
    ],
  });
  children.push(table27);

  // Đ3. Hạ tầng R&D
  children.push(createParagraph(createTextRun("3. Hạ tầng dành cho nghiên cứu và phát triển của doanh nghiệp", { bold: true }), { spaceBefore: 80 }));
  children.push(createParagraph("Liệt kê các hạ tầng dành cho nghiên cứu và phát triển (R&D) mà doanh nghiệp hiện có:"));
  children.push(createParagraph(` [${data.rdFacilityLevel >= 1 ? "x" : " "}] Cơ sở hạ tầng dành cho nghiên cứu và phát triển`));
  children.push(createParagraph(`Năm bắt đầu hoạt động của cơ sở: ${data.rdFacilityLevel >= 1 ? "2020" : ".............................................................................."}`));
  children.push(createParagraph(createTextRun("Mức độ đầu tư: ", { bold: true })));
  children.push(createParagraph(` [${data.rdFacilityLevel === 3 ? "x" : " "}] Viện, trung tâm nghiên cứu và phát triển công nghệ, sản phẩm trực thuộc,`));
  children.push(createParagraph(` [${data.rdFacilityLevel === 2 ? "x" : " "}] Có bộ phận nghiên cứu, phát triển chuyên trách và các trung tâm, phòng thí nghiệm (chế tạo, thử nghiệm) đáp ứng nhu cầu `));
  children.push(createParagraph(` [${data.rdFacilityLevel === 1 ? "x" : " "}] Có bộ phận hoạt động nghiên cứu, phát triển công nghệ, sản phẩm (có thể kiêm nhiệm)`));

  // Đ4. Chi phí R&D (TABLE 28)
  children.push(
    createParagraph(
      createTextRun("4. Chi phí dành cho nghiên cứu và phát triển ", { bold: true }),
      { spaceBefore: 80, spaceAfter: 40 }
    )
  );
  children.push(
    createParagraph("Liệt kê các chi phí dành cho hoạt động nghiên cứu và phát triển của doanh nghiệp trong ba năm:", { spaceAfter: 60 })
  );

  const table28 = make5ColGridTable(cHeaders, [
    [
      "Tổng chi cho hoạt động nghiên cứu phát triển (GR&D)",
      "VNĐ",
      formatVnd(data.rdExpenses3Years ? data.rdExpenses3Years * 0.3 : undefined),
      formatVnd(data.rdExpenses3Years ? data.rdExpenses3Years * 0.33 : undefined),
      formatVnd(data.rdExpenses3Years ? data.rdExpenses3Years * 0.37 : undefined),
    ],
  ]);
  children.push(table28);

  children.push(
    createParagraph(
      ` [${data.hasSciTechFund ? "x" : " "}] Doanh nghiệp có thành lập Quỹ phát triển KH&CN`,
      { spaceBefore: 60, spaceAfter: 80 }
    )
  );

  // Hướng dẫn Mục Đ
  children.push(createParagraph(createTextRun("Hướng dẫn:", { bold: true, italic: true }), { spaceBefore: 60 }));
  children.push(createParagraph("- Mục Đ2: Chi phí dành cho thông tin và công nghệ thông tin là các chi phí mua phần mềm trong 3 năm gần nhất.", { italic: true }));
  children.push(createParagraph("- Mục Đ4: Chi phí dành cho nghiên cứu và phát triển công nghệ (R&D) của doanh nghiệp bao gồm tất cả các chi phí cho hoạt động R&D.", { italic: true }));
  children.push(createParagraph("- Mục Đ1, Đ3, Đ4: Doanh nghiệp tích vào ô xác nhận nếu trong doanh nghiệp có thực hiện các hoạt động này.", { italic: true, spaceAfter: 120 }));

  // -------------------------------------------------------------------------
  // MỤC E: NĂNG LỰC ĐỔI MỚI SÁNG TẠO CỦA DOANH NGHIỆP (TABLE 29)
  // -------------------------------------------------------------------------
  children.push(
    createParagraph(
      createTextRun("E. NĂNG LỰC ĐỔI MỚI SÁNG TẠO CỦA DOANH NGHIỆP", { bold: true, size: 24 }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  // E1. Kết quả R&D sản phẩm (TABLE 29)
  children.push(createParagraph(createTextRun("1. Kết quả nghiên cứu và phát triển sản phẩm", { bold: true }), { spaceAfter: 40 }));
  children.push(createParagraph("Liệt kê các kết quả của hoạt động nghiên cứu và phát triển sản phẩm tại doanh nghiệp, bao gồm:"));
  children.push(createParagraph(` [${data.newProductType === "kieu_dang" ? "x" : " "}] Tạo ra sản phẩm mới về kiểu dáng. Tên sản phẩm: ${data.newProductType === "kieu_dang" && data.newProductNames ? data.newProductNames : "................................................"}`));
  children.push(createParagraph(` [${data.newProductType === "tinh_nang" ? "x" : " "}] Tạo ra sản phẩm mới về tính năng. Tên sản phẩm: ${data.newProductType === "tinh_nang" && data.newProductNames ? data.newProductNames : "................................................"}`));
  children.push(createParagraph(` [${data.newProductType === "hoan_toan_moi" ? "x" : " "}] Tạo ra sản phẩm hoàn toàn mới trên thị trường. Tên sản phẩm: ${data.newProductType === "hoan_toan_moi" && data.newProductNames ? data.newProductNames : "............................"}`));

  const table29 = make5ColGridTable(cHeaders, [
    [
      "Doanh thu của các sản phẩm mới",
      "VNĐ",
      s0?.netRevenue && data.newProductRevenueRatio ? formatVnd((s0.netRevenue * data.newProductRevenueRatio) / 100) : "---",
      s1?.netRevenue && data.newProductRevenueRatio ? formatVnd((s1.netRevenue * data.newProductRevenueRatio) / 100) : "---",
      s2?.netRevenue && data.newProductRevenueRatio ? formatVnd((s2.netRevenue * data.newProductRevenueRatio) / 100) : "---",
    ],
  ]);
  children.push(table29);

  // E2. Kết quả R&D công nghệ
  children.push(createParagraph(createTextRun("2. Kết quả nghiên cứu và phát triển công nghệ", { bold: true }), { spaceBefore: 80 }));
  children.push(createParagraph("Liệt kê các kết quả của hoạt động nghiên cứu và phát triển công nghệ tại doanh nghiệp, bao gồm:"));
  children.push(createParagraph(` [${data.rdTechnologyResult === "dang_nghien_cuu" ? "x" : " "}] Có quy trình, phương tiện, thiết bị công nghệ đang được tiến hành nghiên cứu. `));
  children.push(createParagraph(`Tên công nghệ: ${data.rdTechnologyResult === "dang_nghien_cuu" ? "Nghiên cứu ứng dụng công nghệ điều khiển tự động hóa thông minh" : "............................................................................................................"}`));
  children.push(createParagraph(` [${data.rdTechnologyResult === "thu_nghiem_lab" ? "x" : " "}] Có quy trình, phương tiện, thiết bị công nghệ đã được nghiên cứu phát triển nhưng đang ở mức thử nghiệm hay quy mô phòng thí nghiệm. Tên công nghệ: ${data.rdTechnologyResult === "thu_nghiem_lab" ? "Công nghệ gia công chính xác bề mặt hợp kim" : "............................................................................................................................"}`));
  children.push(createParagraph(` [${data.rdTechnologyResult === "giai_phap_huu_ich" ? "x" : " "}] Có quy trình, công nghệ, phương thức sản xuất mới được chấp nhận đăng ký hoặc được cấp bằng độc quyền giải pháp hữu ích. Tên công nghệ: ${data.rdTechnologyResult === "giai_phap_huu_ich" ? "Giải pháp gá đặt phôi tự động" : "............................"}`));
  children.push(createParagraph(` [${data.rdTechnologyResult === "bang_sang_che" ? "x" : " "}] Có quy trình, công nghệ, phương thức sản xuất mới được bảo hộ dưới dạng bằng sáng chế và được thương mại hóa. Tên công nghệ: ${data.rdTechnologyResult === "bang_sang_che" ? "Bằng độc quyền sáng chế hệ thống xử lý nhiệt thông minh" : "..........................................."}`));

  // E3. Năng lực chuyển đổi số
  const hasTech = (code: string) =>
    data.digitalTechnologies?.some((s) => s.toUpperCase().includes(code.toUpperCase())) ?? false;

  children.push(createParagraph(createTextRun("3. Năng lực chuyển đổi số của doanh nghiệp", { bold: true }), { spaceBefore: 80 }));
  children.push(createParagraph("Liệt kê các hoạt động nhằm thực hiện việc chuyển đổi số (ứng dụng công nghệ số) trong sản xuất tại doanh nghiệp, bao gồm:"));
  children.push(createParagraph(createTextRun("a) Xây dựng chiến lược các mạng công nghiệp (CMCN) 4.0 hoặc chuyển đổi số tại doanh nghiệp", { bold: true })));
  children.push(createParagraph("Đánh giá sự hiểu biết cũng như quá trình thực hiện xây dựng chiến lược các mạng công nghiệp (CMCN) 4.0 hoặc chuyển đổi số tại doanh nghiệp, bao gồm"));
  children.push(createParagraph(` [${data.digitalStrategyLevel === "chua_biet" ? "x" : " "}] Chưa biết       [${data.digitalStrategyLevel === "chuan_bi" ? "x" : " "}] Đã biết nhưng chưa thực hiện `));
  children.push(createParagraph(` [${data.digitalStrategyLevel === "chuan_bi" ? "x" : " "}] Doanh nghiệp chuẩn bị xây dựng chiến lược       [${data.digitalStrategyLevel === "da_xay_dung" ? "x" : " "}] Doanh nghiệp đã xây dựng được chiến lược`));
  children.push(createParagraph(` [${data.digitalStrategyLevel === "dang_thuc_hien" ? "x" : " "}] Doanh nghiệp đang thực hiện các nội dung trong chiến lược `));

  children.push(createParagraph(createTextRun("b) Nghiên cứu và áp dụng các công nghệ số phục vụ cho hoạt động sản xuất và kinh doanh của doanh nghiệp, bao gồm:", { bold: true })));
  children.push(createParagraph("Liệt kê các công nghệ số đang được nghiên cứu và áp dụng cho hoạt động sản xuất và kinh doanh của doanh nghiệp, bao gồm"));
  children.push(createParagraph(` [${hasTech("Cloud") ? "x" : " "}] Điện toán đám mây          [${hasTech("MoHinhHoa") ? "x" : " "}] Mô hình hóa`));
  children.push(createParagraph(` [${hasTech("Robot") ? "x" : " "}] Robot tiên tiến          [${hasTech("AnNinhMang") ? "x" : " "}] An ninh mạng`));
  children.push(createParagraph(` [${hasTech("AR") ? "x" : " "}] Thực tế ảo tăng cường (AR)          [${hasTech("IoT") ? "x" : " "}] Internet kết nối vạn vật (IoT) `));
  children.push(createParagraph(` [${hasTech("VR") ? "x" : " "}] Thực tại ảo (VR)          [${hasTech("VatLieuMoi") ? "x" : " "}] Vật liệu mới `));
  children.push(createParagraph(` [${hasTech("BigData") ? "x" : " "}] Dữ liệu lớn (Bigdata)          [${hasTech("Blockchain") ? "x" : " "}] Chuỗi khối (Blockchain) `));
  children.push(createParagraph(` [${hasTech("TichHop") ? "x" : " "}] Tích hợp hệ thống          [${hasTech("In3D") ? "x" : " "}] In 3D `));

  children.push(createParagraph(createTextRun("b) Mức độ áp dụng các công nghệ số tại doanh nghiệp", { bold: true })));
  children.push(createParagraph("Đánh giá mức độ áp dụng đối với các công nghệ số đã được liệt kê tại doanh nghiệp:"));
  children.push(createParagraph(` [${data.digitalAdoptionScope === "nghien_cuu" ? "x" : " "}] Đang nghiên cứu để áp dụng tại doanh nghiệp`));
  children.push(createParagraph(` [${data.digitalAdoptionScope === "mot_so_bo_phan" ? "x" : " "}] Đã triển khai tại một số bộ phận`));
  children.push(createParagraph(` [${data.digitalAdoptionScope === "toan_nha_may" ? "x" : " "}] Đã triển khai toàn bộ trong nhà máy`));

  // E4. Năng lực liên kết, hợp tác R&D
  children.push(createParagraph(createTextRun("4. Năng lực liên kết, hợp tác trong nghiên cứu và phát triển của doanh nghiệp ", { bold: true }), { spaceBefore: 80 }));
  children.push(createParagraph("Liệt kê các hoạt động liên kết, hợp tác trong nghiên cứu và phát triển công nghệ, sản phẩm của doanh nghiệp với các tổ chức, viện nghiên cứu, trường đại học trong và ngoài nước"));
  children.push(createParagraph(` [${data.academyPartnershipType === "du_an_rd" ? "x" : " "}] Có hoạt động hợp tác theo hình thức dự án nghiên cứu phát triển công nghệ sản phẩm mới `));
  children.push(createParagraph(` [${data.academyPartnershipType === "chuyen_gia_dao_tao" ? "x" : " "}] Có hoạt động hợp tác theo hình thức mời chuyên gia hỗ trợ, tiếp nhận kết quả nghiên cứu, đào tạo R&D `));

  // Hướng dẫn Mục E
  children.push(createParagraph(createTextRun("Hướng dẫn:", { bold: true, italic: true }), { spaceBefore: 60 }));
  children.push(createParagraph("- Mục E1: Nếu doanh nghiệp có nhiều sản phẩm mới thì chỉ ghi tối đa 03 sản phẩm mới có doanh thu cao nhất, doanh thu của sản phẩm mới thì tính tổng doanh thu của tất cả các sản phẩm mới từng năm trong thời gian ba năm trước năm điều tra.", { italic: true }));
  children.push(createParagraph("- Mục E2: Nếu doanh nghiệp có nhiều công nghệ mới thì chỉ ghi tối đa 03 công nghệ mới mà doanh nghiệp đánh giá có hiệu quả cao nhất.", { italic: true }));
  children.push(createParagraph("- Mục E1, E2, E3, E4: Doanh nghiệp tích vào ô xác nhận nếu trong doanh nghiệp có thực hiện các hoạt động này.", { italic: true, spaceAfter: 120 }));

  // Ký tên Người khai phiếu cuối Phần I (Theo mẫu trắng gốc)
  children.push(createParagraph(createTextRun("Người khai phiếu", { bold: true, size: 22 }), { align: AlignmentType.RIGHT, spaceBefore: 120 }));
  children.push(createParagraph(createTextRun("(Ký và ghi rõ họ tên)", { italic: true, size: 19 }), { align: AlignmentType.RIGHT, spaceAfter: 200 }));

  // =========================================================================
  // NGẮT TRANG (PAGE BREAK) GIỮA PHẦN I VÀ PHẦN II
  // =========================================================================
  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // =========================================================================
  // PHẦN II: PHỤ LỤC II VÀ BÁO CÁO KẾT QUẢ ĐÁNH GIÁ 26 TIÊU CHÍ
  // Giữ nguyên 100% logic, cấu trúc bảng 26 tiêu chí, tổng điểm, hệ số đồng bộ,
  // xếp loại và chữ ký 3 bên như hiện tại
  // =========================================================================
  children.push(
    createParagraph(
      [
        createTextRun("PHẦN II: PHỤ LỤC II VÀ BÁO CÁO KẾT QUẢ ĐÁNH GIÁ 26 TIÊU CHÍ\n", {
          bold: true,
          size: 26,
          color: "0F172A",
        }),
        createTextRun("TRÌNH ĐỘ VÀ NĂNG LỰC CÔNG NGHỆ THEO THÔNG TƯ 17/2019/TT-BKHCN", {
          bold: true,
          size: 24,
          color: "0F172A",
        }),
      ],
      { align: AlignmentType.CENTER, spaceBefore: 120, spaceAfter: 120 }
    )
  );

  // Table 30: 26 Tiêu chí đánh giá
  const criteriaRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell("STT", { widthPercent: 8, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell("Mã TC", { widthPercent: 12, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell("Nhóm", { widthPercent: 8, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell("Tên tiêu chí đánh giá", { widthPercent: 44, isHeader: true }),
        makeTableCell("Tối đa", { widthPercent: 14, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell("Đạt được", { widthPercent: 14, isHeader: true, align: AlignmentType.RIGHT }),
      ],
    }),
  ];

  if (score && score.criteria && score.criteria.length > 0) {
    score.criteria.forEach((c, idx) => {
      criteriaRows.push(
        new TableRow({
          children: [
            makeTableCell(String(idx + 1), { widthPercent: 8, align: AlignmentType.CENTER }),
            makeTableCell(c.code, { widthPercent: 12, align: AlignmentType.CENTER, bold: true }),
            makeTableCell(c.group, { widthPercent: 8, align: AlignmentType.CENTER }),
            makeTableCell(c.name + (c.isBottleneck ? " [Điểm nghẽn]" : ""), {
              widthPercent: 44,
              bold: c.isBottleneck,
            }),
            makeTableCell(`${c.maxScore.toFixed(1)} đ`, { widthPercent: 14, align: AlignmentType.RIGHT }),
            makeTableCell(`${c.achievedScore.toFixed(1)} đ`, {
              widthPercent: 14,
              align: AlignmentType.RIGHT,
              bold: true,
              bgColor: c.isBottleneck ? "FEE2E2" : undefined,
            }),
          ],
        })
      );
    });
  } else {
    // 26 Default criteria rows if score not generated
    const defaultTCs = [
      ["TC01", "T", "Mức độ khấu hao thiết bị, công nghệ (K_kh)", 5],
      ["TC02", "T", "Mức độ hiện đại của thiết bị, công nghệ (K_hđ)", 7],
      ["TC03", "T", "Mức độ xuất xứ của thiết bị, công nghệ (K_xx)", 5],
      ["TC04", "T", "Mức độ tự động hóa thiết bị, công nghệ (K_tđ)", 5],
      ["TC05", "T", "Tuổi thọ trung bình của thiết bị, công nghệ (K_tt)", 4],
      ["TC06", "T", "Tính đồng bộ của thiết bị, công nghệ (K_đb)", 4],
      ["TC07", "E", "Tiêu chuẩn chất lượng của sản phẩm (K_sp)", 4],
      ["TC08", "E", "Mức tiêu hao nguyên vật liệu (K_nvl)", 4],
      ["TC09", "E", "Tỷ lệ phế phẩm trong sản xuất (K_pp)", 3],
      ["TC10", "E", "Năng lực bảo dưỡng, sửa chữa thiết bị (K_bd)", 3],
      ["TC11", "E", "Hệ số sử dụng công suất thiết kế (K_cs)", 3],
      ["TC12", "E", "Khả năng xuất khẩu của sản phẩm (K_xk)", 3],
      ["TC13", "O", "Trình độ và cơ cấu lực lượng lao động (K_ld)", 4],
      ["TC14", "O", "Trình độ tổ chức và quản trị sản xuất (K_qt)", 4],
      ["TC15", "O", "Mức độ đầu tư cho đào tạo nhân lực (K_dt)", 4],
      ["TC16", "O", "Hệ thống quản lý chất lượng (K_cl)", 4],
      ["TC17", "O", "Mức độ bảo vệ môi trường trong sản xuất (K_mt)", 3],
      ["TC18", "R", "Hạ tầng công nghệ thông tin phục vụ SX (K_cntt)", 4],
      ["TC19", "R", "Mức đầu tư cho CNTT và chuyển đổi số (K_dtcntt)", 3],
      ["TC20", "R", "Cơ sở vật chất, phòng lab cho R&D (K_csrd)", 4],
      ["TC21", "R", "Lực lượng nhân lực nghiên cứu và phát triển (K_nlrd)", 3],
      ["TC22", "R", "Chi phí đầu tư cho hoạt động R&D (K_cprd)", 3],
      ["TC23", "I", "Đổi mới và phát triển sản phẩm mới (K_dmsp)", 3],
      ["TC24", "I", "Năng lực đổi mới công nghệ và sáng chế (K_dmcn)", 4],
      ["TC25", "I", "Năng lực liên kết, hợp tác Viện - Trường (K_lk)", 3],
      ["TC26", "I", "Mức độ triển khai công nghệ 4.0 & CĐS (K_cds)", 4],
    ];
    defaultTCs.forEach((tc, idx) => {
      criteriaRows.push(
        new TableRow({
          children: [
            makeTableCell(String(idx + 1), { widthPercent: 8, align: AlignmentType.CENTER }),
            makeTableCell(tc[0] as string, { widthPercent: 12, align: AlignmentType.CENTER, bold: true }),
            makeTableCell(tc[1] as string, { widthPercent: 8, align: AlignmentType.CENTER }),
            makeTableCell(tc[2] as string, { widthPercent: 44 }),
            makeTableCell(`${tc[3]} đ`, { widthPercent: 14, align: AlignmentType.RIGHT }),
            makeTableCell("--- đ", { widthPercent: 14, align: AlignmentType.RIGHT }),
          ],
        })
      );
    });
  }

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: criteriaRows,
    })
  );

  // Table 31: SUMMARY BOX
  const totalScore = score?.totalScore ? score.totalScore.toFixed(1) : "0.0";
  const syncCoeff = score?.syncCoefficient ? score.syncCoefficient.toFixed(2) : "0.00";
  const classification = score?.classificationLabel || score?.classification || "CHƯA XẾP LOẠI";

  const summaryRows: TableRow[] = [
    new TableRow({
      children: [
        makeTableCell("TỔNG ĐIỂM (τ - Thang 100):", { widthPercent: 40, bold: true, bgColor: "F8FAFC" }),
        makeTableCell(`${totalScore} / 100 điểm`, { widthPercent: 60, bold: true, bgColor: "F8FAFC" }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("HỆ SỐ ĐỒNG BỘ (T_ĐB):", { widthPercent: 40, bold: true, bgColor: "F8FAFC" }),
        makeTableCell(`${syncCoeff}`, { widthPercent: 60, bold: true, bgColor: "F8FAFC" }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("XẾP LOẠI TRÌNH ĐỘ CÔNG NGHỆ:", { widthPercent: 40, bold: true, bgColor: "ECFDF5" }),
        makeTableCell(`${classification}`, { widthPercent: 60, bold: true, bgColor: "ECFDF5" }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Điểm từng nhóm thành phần:", { widthPercent: 40 }),
        makeTableCell(
          `Nhóm T: ${score?.scoreT?.toFixed(1) || 0}/30đ  |  Nhóm E: ${score?.scoreE?.toFixed(1) || 0}/20đ  |  Nhóm O: ${score?.scoreO?.toFixed(1) || 0}/19đ  |  Nhóm R: ${score?.scoreR?.toFixed(1) || 0}/17đ  |  Nhóm I: ${score?.scoreI?.toFixed(1) || 0}/14đ`,
          { widthPercent: 60 }
        ),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Ý kiến / Nhận xét thẩm định:", { widthPercent: 40 }),
        makeTableCell(
          safeText(assessment.reviewNotes, "Hồ sơ đánh giá trực tuyến hợp lệ trên Cổng kết nối chuỗi cung ứng BACLINK."),
          { widthPercent: 60, italic: true }
        ),
      ],
    }),
  ];

  children.push(
    createParagraph(
      createTextRun("TỔNG KẾT XẾP LOẠI TRÌNH ĐỘ VÀ NĂNG LỰC CÔNG NGHỆ", { bold: true, size: 24 }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: summaryRows,
    })
  );

  // Table 32: KHU VỰC CHỮ KÝ 3 BÊN
  children.push(
    createParagraph(
      createTextRun(`.............., Ngày ..... tháng ..... năm ${year}   `, {
        italic: true,
        size: 21,
      }),
      { align: AlignmentType.RIGHT, spaceBefore: 280, spaceAfter: 100 }
    )
  );
  children.push(
    createSignatureBlock(
      "NGƯỜI KHAI PHIẾU",
      "GIÁM ĐỐC DOANH NGHIỆP",
      "TRƯỞNG ĐOÀN KHẢO SÁT"
    )
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: PAGE_MARGINS,
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}


export async function exportDemandSmeDocx(
  input: DemandSurveyItem | DemandSmeSurveyRecord
): Promise<Blob> {
  // Ưu tiên nạp và điền dữ liệu trực tiếp vào tệp mẫu trắng chuẩn: phieu_khao_sat_nhu_cau_dnnvv_mau_trang.docx
  try {
    return await generateDemandSmeDocxFromTemplate(input);
  } catch (err) {
    console.warn("Không thể dùng template gốc điền phieu_khao_sat_nhu_cau_dnnvv_mau_trang.docx, chuyển sang fallback generator:", err);
  }

  const children: (Paragraph | Table)[] = [];

  // Parse raw fields
  const rec = input as any;
  const companyName = rec.companyName || rec.enterpriseName || "Doanh nghiệp khảo sát";
  const taxCode = rec.taxCode || "---";
  const province = rec.province || rec.provinceName || "Toàn quốc";
  const address = rec.headquartersAddress || rec.address || province;
  const contactName = rec.contactName || rec.contactPerson || "---";
  const contactTitle = rec.contactTitle || "";
  const contactPhone = rec.contactPhone || "---";
  const contactEmail = rec.contactEmail || "---";
  const surveyCode = rec.surveyCode || `SUR-${rec.id.substring(0, 8).toUpperCase()}`;
  const status = rec.status || "SUBMITTED";
  const employeeScale = rec.employeeScale || rec.workforceScale || "---";
  const revenueRange = rec.revenueRange3y || rec.revenueScale || "---";
  const submittedAt = rec.submittedAt ? new Date(rec.submittedAt).toLocaleDateString("vi-VN") : "---";

  // Parse surveyDetails if available
  let details: any = null;
  if ("surveyDetails" in input && input.surveyDetails) {
    if (typeof input.surveyDetails === "object") {
      details = input.surveyDetails;
    } else {
      try {
        details = JSON.parse(input.surveyDetails);
      } catch {
        details = null;
      }
    }
  }

  // Header & Quốc hiệu
  children.push(createAdministrativeHeader("CỤC PHÁT TRIỂN CÔNG NGHỆ VÀ ĐỔI MỚI SÁNG TẠO"));

  // Title
  children.push(
    createParagraph(
      [
        createTextRun("PHIẾU KHẢO SÁT HIỆN TRẠNG & NHU CẦU ĐỔI MỚI SÁNG TẠO\n", {
          bold: true,
          size: 26,
          color: "0F172A",
        }),
        createTextRun("KHẢO SÁT NHU CẦU ĐỔI MỚI CÔNG NGHỆ & ĐIỂM NGHẼN KỸ THUẬT (DNNVV)", {
          bold: true,
          size: 24,
          color: "0F172A",
        }),
      ],
      { align: AlignmentType.CENTER, spaceBefore: 180, spaceAfter: 60 }
    )
  );

  children.push(
    createParagraph(
      createTextRun(
        "(Bộ công cụ khảo sát toàn diện giúp DNNVV chuẩn hóa bài toán kỹ thuật, tính toán chỉ số cấp thiết TNI và kết nối giải pháp công nghệ)",
        { italic: true, size: 20, color: "475569" }
      ),
      { align: AlignmentType.CENTER, spaceAfter: 140 }
    )
  );

  // Status Banner
  const tniScore = ("tniScore" in input ? input.tniScore : null);
  const tniLabel = tniScore !== null && tniScore !== undefined ? `${tniScore}/100` : "Chờ tính TNI";

  children.push(
    createParagraph(
      [
        createTextRun("Mã phiếu: ", { bold: true }),
        createTextRun(`${surveyCode}   |   `),
        createTextRun("Trạng thái: ", { bold: true }),
        createTextRun(`${status}   |   `),
        createTextRun("Địa bàn: ", { bold: true }),
        createTextRun(`${province}   |   `),
        createTextRun("Chỉ số TNI: ", { bold: true, color: "0D9488" }),
        createTextRun(`${tniLabel}`, { bold: true, color: "0D9488" }),
      ],
      { align: AlignmentType.CENTER, spaceAfter: 180 }
    )
  );

  // =========================================================================
  // I. BÀI TOÁN KỸ THUẬT & NHU CẦU ĐỔI MỚI CÔNG NGHỆ CỤ THỂ (TNI)
  // =========================================================================
  children.push(
    createParagraph(
      createTextRun("I. CHI TIẾT BÀI TOÁN KỸ THUẬT & CHỈ SỐ CẤP THIẾT (TNI)", { bold: true, size: 24 }),
      { spaceBefore: 160, spaceAfter: 80 }
    )
  );

  // Extract items/demands
  const demandItems: any[] = ("items" in input && input.items && input.items.length > 0)
    ? input.items
    : ("demands" in input && input.demands && input.demands.length > 0)
    ? input.demands
    : [];

  const demandRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell("STT", { widthPercent: 6, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell("Công đoạn & Vấn đề kỹ thuật", { widthPercent: 32, isHeader: true }),
        makeTableCell("Giải pháp công nghệ mong muốn", { widthPercent: 32, isHeader: true }),
        makeTableCell("Mục tiêu kỳ vọng", { widthPercent: 18, isHeader: true }),
        makeTableCell("Dự toán & TNI", { widthPercent: 12, isHeader: true, align: AlignmentType.CENTER }),
      ],
    }),
  ];

  if (demandItems.length > 0) {
    demandItems.forEach((d, idx) => {
      const prob = d.technicalProblem || d.title || "---";
      const stage = d.stageName ? `[${d.stageName}]\n` : "";
      const sol = d.desiredSolution || d.description || "---";
      const goal = d.expectedGoal || "Nâng cao năng suất & giảm tỷ lệ phế phẩm";
      const budget = d.budgetRange || d.budget || "Thương lượng";
      const itemTni = d.tniScore !== undefined ? `\nTNI: ${d.tniScore}/100` : "";

      demandRows.push(
        new TableRow({
          children: [
            makeTableCell(String(idx + 1), { widthPercent: 6, align: AlignmentType.CENTER }),
            makeTableCell(stage + prob, { widthPercent: 32 }),
            makeTableCell(sol, { widthPercent: 32 }),
            makeTableCell(goal, { widthPercent: 18 }),
            makeTableCell(`${budget}${itemTni}`, { widthPercent: 12, align: AlignmentType.CENTER }),
          ],
        })
      );
    });
  } else {
    demandRows.push(
      new TableRow({
        children: [
          makeTableCell("1", { widthPercent: 6, align: AlignmentType.CENTER }),
          makeTableCell("Hiện đại hóa công nghệ sản xuất & tự động hóa", { widthPercent: 32 }),
          makeTableCell("Cải tiến dây chuyền máy móc và số hóa quy trình vận hành", { widthPercent: 32 }),
          makeTableCell("Tăng năng suất và nâng cao chất lượng sản phẩm", { widthPercent: 18 }),
          makeTableCell("Thương lượng", { widthPercent: 12, align: AlignmentType.CENTER }),
        ],
      })
    );
  }

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: demandRows,
    })
  );

  // 4 Chiều TNI nếu có item đầu tiên
  if (demandItems.length > 0 && demandItems[0].urgencyScore) {
    const d0 = demandItems[0];
    const tniMatrixRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          makeTableCell("K (Cấp thiết - 35%)", { widthPercent: 25, isHeader: true, align: AlignmentType.CENTER }),
          makeTableCell("L (Tác động - 30%)", { widthPercent: 25, isHeader: true, align: AlignmentType.CENTER }),
          makeTableCell("N (Đầu tư - 20%)", { widthPercent: 25, isHeader: true, align: AlignmentType.CENTER }),
          makeTableCell("O (Sẵn sàng - 15%)", { widthPercent: 25, isHeader: true, align: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        children: [
          makeTableCell(`${d0.urgencyScore ?? 3} / 5`, { widthPercent: 25, align: AlignmentType.CENTER }),
          makeTableCell(`${d0.impactScore ?? 3} / 5`, { widthPercent: 25, align: AlignmentType.CENTER }),
          makeTableCell(`${d0.investmentCapacity ?? 3} / 5`, { widthPercent: 25, align: AlignmentType.CENTER }),
          makeTableCell(`${d0.adoptionReadiness ?? 3} / 5`, { widthPercent: 25, align: AlignmentType.CENTER }),
        ],
      }),
    ];
    children.push(
      createParagraph(createTextRun("Chỉ số thành phần tính toán TNI (Thang điểm 1 - 5):", { italic: true, size: 21 }), {
        spaceBefore: 60,
        spaceAfter: 40,
      })
    );
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tniMatrixRows,
      })
    );
  }

  // =========================================================================
  // II. THÔNG TIN DOANH NGHIỆP & QUY MÔ SẢN XUẤT
  // =========================================================================
  children.push(
    createParagraph(
      createTextRun("II. THÔNG TIN DOANH NGHIỆP & QUY MÔ SẢN XUẤT", { bold: true, size: 24 }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  const p2Fields = [
    `1. Tên Doanh nghiệp: ${safeText(companyName)}`,
    `2. Mã số thuế: ${safeText(taxCode)}   |   Địa bàn: ${safeText(province)}`,
    `3. Địa chỉ trụ sở: ${safeText(address)}`,
    `4. Người đại diện / Đầu mối liên hệ: ${safeText(contactName)}${contactTitle ? ` (${contactTitle})` : ""}`,
    `   Điện thoại: ${safeText(contactPhone)}   |   Email: ${safeText(contactEmail)}`,
    `5. Quy mô doanh nghiệp: Lao động: ${safeText(employeeScale)}; Doanh thu 3 năm: ${safeText(revenueRange)}.`,
  ];
  if ("hasRdUnit" in input) {
    p2Fields.push(
      `6. Hiện trạng ĐMST: Bộ phận R&D: ${input.hasRdUnit ? "Đã có" : "Chưa có"} | Đào tạo CN: ${input.hasTechTraining ? "Đang tổ chức" : "Chưa có"} | Ngân sách R&D: ${input.hasRdBudget ? "Có phân bổ" : "Không"} | Xuất khẩu: ${input.isExporting ? "Có" : "Nội địa"} | Chuỗi cung ứng: ${input.inValueChain ? "Trong chuỗi" : "Độc lập"}.`
    );
  }
  for (const f of p2Fields) {
    children.push(createParagraph(f, { spaceBefore: 25, spaceAfter: 25 }));
  }

  // =========================================================================
  // III. HIỆN TRẠNG DÂY CHUYỀN, MÁY MÓC THIẾT BỊ & 8 TIÊU CHÍ
  // =========================================================================
  children.push(
    createParagraph(
      createTextRun("III. HIỆN TRẠNG DÂY CHUYỀN, MÁY MÓC THIẾT BỊ VÀ TRÌNH ĐỘ CÔNG NGHỆ", { bold: true, size: 24 }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  // Danh mục máy móc
  if (details && details.currentEquipments && Array.isArray(details.currentEquipments) && details.currentEquipments.length > 0) {
    children.push(
      createParagraph(createTextRun("1. Danh mục máy móc, thiết bị chủ lực hiện có:", { bold: true, size: 22 }), {
        spaceBefore: 60,
        spaceAfter: 40,
      })
    );
    const equipRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          makeTableCell("STT", { widthPercent: 8, isHeader: true, align: AlignmentType.CENTER }),
          makeTableCell("Công đoạn sản xuất", { widthPercent: 26, isHeader: true }),
          makeTableCell("Tên thiết bị, máy móc chủ lực", { widthPercent: 32, isHeader: true }),
          makeTableCell("Xuất xứ / Năm ĐT", { widthPercent: 18, isHeader: true, align: AlignmentType.CENTER }),
          makeTableCell("Tình trạng khấu hao", { widthPercent: 16, isHeader: true, align: AlignmentType.CENTER }),
        ],
      }),
    ];
    details.currentEquipments.forEach((eq: any, idx: number) => {
      equipRows.push(
        new TableRow({
          children: [
            makeTableCell(String(idx + 1), { widthPercent: 8, align: AlignmentType.CENTER }),
            makeTableCell(safeText(eq.StageName), { widthPercent: 26 }),
            makeTableCell(safeText(eq.MachineName), { widthPercent: 32 }),
            makeTableCell(`${safeText(eq.TechOrigin)} / ${eq.InvestmentYear || "---"}`, { widthPercent: 18, align: AlignmentType.CENTER }),
            makeTableCell(safeText(eq.DepreciationStatus), { widthPercent: 16, align: AlignmentType.CENTER }),
          ],
        })
      );
    });
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: equipRows,
      })
    );
  }

  // 8 Tiêu chí trình độ công nghệ
  if (details && details.criteria8 && typeof details.criteria8 === "object") {
    children.push(
      createParagraph(createTextRun("2. Đánh giá hiện trạng trình độ công nghệ (Thang điểm 1 - 5):", { bold: true, size: 22 }), {
        spaceBefore: 80,
        spaceAfter: 40,
      })
    );
    const critRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          makeTableCell("STT", { widthPercent: 8, isHeader: true, align: AlignmentType.CENTER }),
          makeTableCell("Tiêu chí đánh giá", { widthPercent: 72, isHeader: true }),
          makeTableCell("Điểm số (1-5)", { widthPercent: 20, isHeader: true, align: AlignmentType.CENTER }),
        ],
      }),
    ];
    let cIdx = 1;
    for (const [key, val] of Object.entries(details.criteria8)) {
      critRows.push(
        new TableRow({
          children: [
            makeTableCell(String(cIdx++), { widthPercent: 8, align: AlignmentType.CENTER }),
            makeTableCell(key, { widthPercent: 72 }),
            makeTableCell(`${val} / 5`, { widthPercent: 20, align: AlignmentType.CENTER }),
          ],
        })
      );
    }
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: critRows,
      })
    );
  }

  // =========================================================================
  // IV. KHÂU KHÓ NHẤT & ĐIỂM NGHẼN KỸ THUẬT
  // =========================================================================
  children.push(
    createParagraph(
      createTextRun("IV. ĐIỂM NGHẼN KỸ THUẬT VÀ KHÂU SẢN XUẤT CẦN THÁO GỠ", { bold: true, size: 24 }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  if (details && details.hardestStage) {
    children.push(createParagraph(`1. Khâu sản xuất gặp nhiều khó khăn, ách tắc nhất: ${details.hardestStage}`, { spaceBefore: 30, spaceAfter: 20 }));
  }
  if (details && details.primaryCause) {
    children.push(createParagraph(`2. Nguyên nhân cốt lõi gây ra ách tắc: ${details.primaryCause}`, { spaceBefore: 20, spaceAfter: 30 }));
  }

  const bottlenecksList: string[] = ("topBottlenecks" in input && input.topBottlenecks && input.topBottlenecks.length > 0)
    ? input.topBottlenecks
    : (details && details.bottlenecksDetail ? Object.keys(details.bottlenecksDetail) : []);

  if (bottlenecksList.length > 0) {
    children.push(createParagraph(`3. Danh mục các điểm nghẽn kỹ thuật ưu tiên tháo gỡ:`, { spaceBefore: 20, spaceAfter: 20 }));
    bottlenecksList.forEach((b) => {
      const severity = details && details.bottlenecksDetail && details.bottlenecksDetail[b] ? ` (Mức độ nghiêm trọng: ${details.bottlenecksDetail[b]}/5)` : "";
      children.push(createParagraph(`   • ${b}${severity}`, { spaceBefore: 15, spaceAfter: 15 }));
    });
  }

  // =========================================================================
  // V. THỐNG KÊ NHÂN LỰC & NĂNG LỰC HẤP THỤ CÔNG NGHỆ
  // =========================================================================
  children.push(
    createParagraph(
      createTextRun("V. ĐỘI NGŨ NHÂN LỰC KỸ THUẬT VÀ NĂNG LỰC HẤP THỤ CÔNG NGHỆ", { bold: true, size: 24 }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  if (details && details.technicalPersonnel && typeof details.technicalPersonnel === "object") {
    const tp = details.technicalPersonnel;
    children.push(
      createParagraph(
        `1. Thống kê nhân lực: Kỹ thuật viên/thợ giỏi: ${tp.technicians ?? 0} người; Kỹ sư/cử nhân: ${tp.engineers ?? 0} người; CNTT: ${tp.it ?? 0} người; Tự động hóa: ${tp.automation ?? 0} người; R&D: ${tp.rd ?? 0} người; Kiểm soát chất lượng (QC): ${tp.quality ?? 0} người.`,
        { spaceBefore: 20, spaceAfter: 30 }
      )
    );
  }

  if (details && details.adoptionCapacity && typeof details.adoptionCapacity === "object") {
    children.push(
      createParagraph(createTextRun("2. Đánh giá năng lực hấp thụ và làm chủ công nghệ (Thang điểm 1 - 5):", { bold: true, size: 22 }), {
        spaceBefore: 60,
        spaceAfter: 40,
      })
    );
    const adoptRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          makeTableCell("STT", { widthPercent: 8, isHeader: true, align: AlignmentType.CENTER }),
          makeTableCell("Tiêu chí năng lực hấp thụ công nghệ", { widthPercent: 72, isHeader: true }),
          makeTableCell("Mức độ (1-5)", { widthPercent: 20, isHeader: true, align: AlignmentType.CENTER }),
        ],
      }),
    ];
    let aIdx = 1;
    for (const [key, val] of Object.entries(details.adoptionCapacity)) {
      adoptRows.push(
        new TableRow({
          children: [
            makeTableCell(String(aIdx++), { widthPercent: 8, align: AlignmentType.CENTER }),
            makeTableCell(key, { widthPercent: 72 }),
            makeTableCell(`${val} / 5`, { widthPercent: 20, align: AlignmentType.CENTER }),
          ],
        })
      );
    }
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: adoptRows,
      })
    );
  }

  // =========================================================================
  // VI. ĐỊNH HƯỚNG CÔNG NGHỆ 2026–2030 & ĐỀ XUẤT HỖ TRỢ
  // =========================================================================
  children.push(
    createParagraph(
      createTextRun("VI. ĐỊNH HƯỚNG CÔNG NGHỆ 2026–2030 VÀ ĐỀ XUẤT HỖ TRỢ", { bold: true, size: 24 }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  if (details && details.futureDirections && Array.isArray(details.futureDirections) && details.futureDirections.length > 0) {
    children.push(createParagraph("1. Các nhóm công nghệ tiên tiến dự kiến tiếp cận:", { spaceBefore: 20, spaceAfter: 15 }));
    details.futureDirections.forEach((fd: string) => {
      children.push(createParagraph(`   • ${fd}`, { spaceBefore: 10, spaceAfter: 10 }));
    });
  }

  if (details && details.desiredPartners && Array.isArray(details.desiredPartners) && details.desiredPartners.length > 0) {
    children.push(
      createParagraph(`2. Đối tác mong muốn kết nối giải pháp: ${details.desiredPartners.join(", ")}.`, { spaceBefore: 20, spaceAfter: 20 })
    );
  }

  // Signatures
  children.push(
    createParagraph(
      createTextRun(`.............., Ngày nộp: ${submittedAt}   `, {
        italic: true,
        size: 21,
      }),
      { align: AlignmentType.RIGHT, spaceBefore: 240, spaceAfter: 80 }
    )
  );
  children.push(
    createSignatureBlock("NGƯỜI LẬP PHIẾU KHẢO SÁT", "ĐẠI DIỆN DOANH NGHIỆP\n(Ký điện tử & Đóng dấu)")
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: PAGE_MARGINS,
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

// =========================================================================
// 3. BROWSER DOWNLOAD HELPER
// =========================================================================

export function downloadDocxBlob(blob: Blob, filename: string): void {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".docx") ? filename : `${filename}.docx`;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    if (anchor.parentNode === document.body) {
      document.body.removeChild(anchor);
    }
    URL.revokeObjectURL(url);
  }, 1500);
}
