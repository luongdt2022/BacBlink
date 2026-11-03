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
} from "docx";
import {
  Tt17Assessment,
  Tt17SurveyData,
  Tt17ScoreResult,
  CriterionScore,
  MachineryItem,
  FinancialSeriesItem,
  INDUSTRY_BENCHMARKS,
} from "@/services/api/assessment-tt17";

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
  }
): Paragraph {
  const children = Array.isArray(runs)
    ? runs
    : typeof runs === "string"
    ? [createTextRun(runs)]
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
                  createTextRun("BỘ KHOA HỌC VÀ CÔNG NGHỆ\n", { bold: true, size: 20 }),
                  createTextRun(agencyTitle, { bold: true, size: 20 }),
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

export async function exportTt17SurveyDocx(
  assessment: Tt17Assessment
): Promise<Blob> {
  const data = assessment.surveyData || ({} as Tt17SurveyData);
  const score = assessment.scoreResult;
  const year = assessment.assessmentYear || new Date().getFullYear();
  const benchmark = data.industryCode ? INDUSTRY_BENCHMARKS[data.industryCode] : null;

  const children: (Paragraph | Table)[] = [];

  // 1. Header & Quoc hieu
  children.push(createAdministrativeHeader("CỤC PHÁT TRIỂN CÔNG NGHỆ VÀ ĐỔI MỚI SÁNG TẠO"));

  // 2. Title Phụ lục I
  children.push(
    createParagraph(
      [
        createTextRun("PHIẾU ĐIỀU TRA TRÌNH ĐỘ VÀ NĂNG LỰC CÔNG NGHỆ SẢN XUẤT\n", {
          bold: true,
          size: 26,
          color: "0F172A",
        }),
        createTextRun(
          "(Ban hành kèm theo Thông tư số 17/2019/TT-BKHCN ngày 10 tháng 12 năm 2019\ncủa Bộ trưởng Bộ Khoa học và Công nghệ)",
          { italic: true, size: 21, color: "334155" }
        ),
      ],
      { align: AlignmentType.CENTER, spaceBefore: 160, spaceAfter: 120 }
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
  // MỤC A: THÔNG TIN CHUNG CỦA DOANH NGHIỆP (TABLE 0 - 13 rows)
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
  const phone = safeText(data.companyPhone);
  const email = safeText(data.companyEmail);
  const compType = safeText(data.companyType, "Công ty Cổ phần / TNHH");
  const indCode = safeText(data.industryCode || assessment.industryCode);
  const indName = benchmark ? benchmark.industryName : "Ngành sản xuất chế biến chế tạo";
  const capitalStr = data.totalCapital ? `${formatVnd(data.totalCapital)} (${formatMillionVnd(data.totalCapital)})` : "....................";
  const workforceStr = data.totalWorkforce ? `${data.totalWorkforce} người` : "....................";

  const isSmall = (data.totalWorkforce || 0) < 100;
  const isMedium = (data.totalWorkforce || 0) >= 100 && (data.totalWorkforce || 0) <= 200;
  const isLarge1 = (data.totalWorkforce || 0) > 200 && (data.totalWorkforce || 0) < 3000;
  const isLarge2 = (data.totalWorkforce || 0) >= 3000;

  const table0Rows: TableRow[] = [
    new TableRow({
      children: [
        makeTableCell(`1. Tên doanh nghiệp: ${compName}          |          Mã số thuế: ${taxCode}\n2. Địa chỉ: ${compAddr}`, { widthPercent: 100 }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(`3. Tel: ${phone}          |          4. Fax: ....................`, { widthPercent: 100 }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(`5. Email: ${email}          |          6. Website: ....................`, { widthPercent: 100 }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(`7. Loại hình doanh nghiệp theo Giấy chứng nhận đầu tư: ${compType}`, { widthPercent: 100 }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("8. Quy mô doanh nghiệp (theo quy định tại Nghị định số 39/2018/NĐ-CP ngày 11/3/2018):", {
          widthPercent: 100,
          bold: true,
          bgColor: "F8FAFC",
        }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(
          `[${isSmall ? "x" : " "}] Nhỏ (dưới 100 người)       [${isMedium ? "x" : " "}] Vừa (không quá 200 người)\n` +
          `[${isLarge1 ? "x" : " "}] Lớn (trên 200 và dưới 3000 người)       [${isLarge2 ? "x" : " "}] Lớn (trên 3000 người)`,
          { widthPercent: 100 }
        ),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(
          "9. Ngành hoạt động sản xuất kinh doanh chính: (03 ngành thuộc ngành chế biến chế tạo (mã ngành B, C trong Hệ thống các ngành kinh tế VN) tạo ra doanh thu lớn nhất/ sử dụng nhiều lao động nhất, liệt kê theo thứ tự giảm dần):\n" +
          `  - Ngành chính 1: ${indCode} - ${indName}\n` +
          `  - Ngành phụ 2: ${safeText(data.secondaryIndustry2, "....................................................................................")}\n` +
          `  - Ngành phụ 3: ${safeText(data.secondaryIndustry3, "....................................................................................")}`,
          { widthPercent: 100 }
        ),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("10. Địa chỉ cơ sở sản xuất:", { widthPercent: 100, bold: true, bgColor: "F8FAFC" }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(`Cơ sở 1: ${facAddr1}`, { widthPercent: 100 }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(`Cơ sở 2: ${facAddr2}`, { widthPercent: 100 }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("11. Cơ quan chủ quản hoặc công ty mẹ, công ty có cổ phần chi phối: ....................................................................................................", { widthPercent: 100 }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(`12. Tổng nguồn vốn (VNĐ): ${capitalStr}`, { widthPercent: 100 }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(`13. Người đại diện pháp luật: ${repPerson}          |          Người khai phiếu: ${repPerson}`, { widthPercent: 100 }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table0Rows,
    })
  );

  // -------------------------------------------------------------------------
  // MỤC B: THÔNG TIN THIẾT BỊ, CÔNG NGHỆ CỦA DOANH NGHIỆP
  // -------------------------------------------------------------------------
  children.push(
    createParagraph(
      createTextRun("B. THÔNG TIN THIẾT BỊ, CÔNG NGHỆ CỦA DOANH NGHIỆP", { bold: true, size: 24 }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  // 1. Dây chuyền thiết bị máy móc chính (TABLE 1)
  children.push(
    createParagraph(
      [
        createTextRun("1. Dây chuyền thiết bị, máy móc, công nghệ sản xuất chính của doanh nghiệp\n", { bold: true }),
        createTextRun(
          "Hướng dẫn: Đối với doanh nghiệp có nhiều dây chuyền SX, chỉ liệt kê 03 tên dây chuyền sản xuất chính có giá trị sản lượng cao nhất.",
          { italic: true, size: 20 }
        ),
      ],
      { spaceAfter: 60 }
    )
  );

  const table1Rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell("Tên thiết bị, máy móc, công nghệ", { widthPercent: 32, isHeader: true }),
        makeTableCell("Số lượng", { widthPercent: 8, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell("Năm SX", { widthPercent: 10, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell("Năm SD", { widthPercent: 10, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell("Tên sản phẩm / bán thành phẩm", { widthPercent: 20, isHeader: true }),
        makeTableCell("Giá trị đầu tư ban đầu (Gbđ - Triệu đ)", { widthPercent: 20, isHeader: true, align: AlignmentType.RIGHT }),
      ],
    }),
  ];

  if (data.machineries && data.machineries.length > 0) {
    data.machineries.forEach((m) => {
      const origMil = m.originalCost ? Math.round(m.originalCost / 1e6) : (data.originalCostEquipment ? Math.round(data.originalCostEquipment / 1e6) : "");
      table1Rows.push(
        new TableRow({
          children: [
            makeTableCell(safeText(m.name, "Máy móc thiết bị sản xuất")),
            makeTableCell(String(m.quantity || 1), { align: AlignmentType.CENTER }),
            makeTableCell(String(m.manufactureYear || "---"), { align: AlignmentType.CENTER }),
            makeTableCell(String(m.startUsageYear || "---"), { align: AlignmentType.CENTER }),
            makeTableCell(safeText(m.productName, safeText(data.mainProduct1Name, "Sản phẩm chính"))),
            makeTableCell(formatNumber(origMil as number), { align: AlignmentType.RIGHT }),
          ],
        })
      );
    });
  } else {
    table1Rows.push(
      new TableRow({
        children: [
          makeTableCell("Dây chuyền thiết bị sản xuất chính"),
          makeTableCell("1", { align: AlignmentType.CENTER }),
          makeTableCell("2021", { align: AlignmentType.CENTER }),
          makeTableCell("2022", { align: AlignmentType.CENTER }),
          makeTableCell(safeText(data.mainProduct1Name, "Sản phẩm chính")),
          makeTableCell(data.originalCostEquipment ? formatNumber(Math.round(data.originalCostEquipment / 1e6)) : "---", { align: AlignmentType.RIGHT }),
        ],
      })
    );
  }

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table1Rows,
    })
  );

  // 2. Tổng giá trị thiết bị đầu tư mới trong 3 năm (TABLE 2)
  children.push(
    createParagraph(
      createTextRun("2. Tổng giá trị thiết bị, máy móc, công nghệ đầu tư mới (trong 3 năm gần nhất):", {
        bold: true,
      }),
      { spaceBefore: 120, spaceAfter: 60 }
    )
  );

  const gtbm1Mil = data.newInvestEquipment3Years ? Math.round(data.newInvestEquipment3Years / 1e6) : 0;
  const gtbm2Mil = data.replacementEquipment3Years ? Math.round(data.replacementEquipment3Years / 1e6) : 0;

  const table2Rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell("Nội dung", { widthPercent: 40, isHeader: true }),
        makeTableCell("Tên thiết bị công nghệ chính", { widthPercent: 30, isHeader: true }),
        makeTableCell("Tổng giá trị", { widthPercent: 15, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell("Đơn vị tính", { widthPercent: 15, isHeader: true, align: AlignmentType.CENTER }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Phục vụ mở rộng sản xuất (Gtbm1)"),
        makeTableCell(gtbm1Mil > 0 ? "Máy móc, thiết bị đầu tư mở rộng" : "...................."),
        makeTableCell(gtbm1Mil > 0 ? formatNumber(gtbm1Mil) : "0", { align: AlignmentType.RIGHT }),
        makeTableCell("Triệu đồng", { align: AlignmentType.CENTER }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Phục vụ bảo dưỡng, sửa chữa (Gtbm2)"),
        makeTableCell(gtbm2Mil > 0 ? "Thiết bị, phụ tùng thay thế nâng cấp" : "...................."),
        makeTableCell(gtbm2Mil > 0 ? formatNumber(gtbm2Mil) : "0", { align: AlignmentType.RIGHT }),
        makeTableCell("Triệu đồng", { align: AlignmentType.CENTER }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table2Rows,
    })
  );

  // 3. Thiết bị công nghệ số hóa quá trình sản xuất
  const gshMil = data.digitalEquipmentValue ? Math.round(data.digitalEquipmentValue / 1e6) : 0;
  children.push(
    createParagraph(
      [
        createTextRun("3. Tổng giá trị của các thiết bị công nghệ liên quan đến số hóa quá trình sản xuất:\n", { bold: true }),
        createTextRun(`Tên thiết bị công nghệ chính: ${gshMil > 0 ? "Hệ thống điều khiển số, cảm biến & đo lường số hóa" : ".................................................."}          Tổng giá trị: ${gshMil > 0 ? formatNumber(gshMil) : "...................."} triệu đồng`),
      ],
      { spaceBefore: 120, spaceAfter: 60 }
    )
  );

  // 4. Chuyển giao công nghệ
  const techTypes = data.transferredTechTypes || [];
  const hasDongBo = techTypes.some((t) => t.includes("dong_bo") || t.includes("lieng_xang"));
  const hasBanQuyen = techTypes.some((t) => t.includes("ban_quyen"));
  const hasCaiTien = techTypes.some((t) => t.includes("cai_tien") || t.includes("tich_hop"));
  const hasSangChe = techTypes.some((t) => t.includes("sang_che"));
  const cgcnMil = data.transferredTechValue ? Math.round(data.transferredTechValue / 1e6) : 0;

  children.push(
    createParagraph(
      [
        createTextRun("4. Công nghệ được chuyển giao và giá trị hợp đồng chuyển giao công nghệ (trong 3 năm gần nhất):\n", { bold: true }),
        createTextRun(`Loại công nghệ nhận chuyển giao: ${techTypes.length > 0 ? techTypes.join(", ") : ".................................................."}          Tổng giá trị: ${cgcnMil > 0 ? formatNumber(cgcnMil) : "...................."} triệu đồng\n`),
        createTextRun(`[${hasDongBo ? "x" : " "}] Dây chuyền, thiết bị công nghệ đồng bộ                      [${hasBanQuyen ? "x" : " "}] Bản quyền hoặc cấp phép công nghệ\n`),
        createTextRun(`[${hasCaiTien ? "x" : " "}] Thiết bị, công nghệ điều chỉnh, cải tiến tích hợp             [${hasSangChe ? "x" : " "}] Phát minh, sáng chế\n`),
        createTextRun(
          "Hướng dẫn: Ghi tổng giá trị hợp đồng CGCN trong 3 năm gần nhất đối với trường hợp hợp đồng CGCN trả một lần; Ghi tổng giá trị phải trả trong vòng 3 năm đối với hợp đồng trả theo tỷ lệ % doanh thu hàng năm.",
          { italic: true, size: 20 }
        ),
      ],
      { spaceBefore: 100, spaceAfter: 100 }
    )
  );

  // -------------------------------------------------------------------------
  // MỤC C: THÔNG TIN SẢN XUẤT KINH DOANH CỦA DOANH NGHIỆP
  // -------------------------------------------------------------------------
  children.push(
    createParagraph(
      createTextRun("C. THÔNG TIN SẢN XUẤT KINH DOANH CỦA DOANH NGHIỆP", { bold: true, size: 24 }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  // 1. Tổng hoạt động SXKD trong 3 năm gần nhất (TABLE 3)
  children.push(
    createParagraph(
      createTextRun("1. Tổng hoạt động sản xuất kinh doanh của doanh nghiệp trong ba năm gần nhất:", { bold: true }),
      { spaceAfter: 60 }
    )
  );

  const series = data.financialSeries || [];
  const s0 = series[0] || ({} as Partial<FinancialSeriesItem>);
  const s1 = series[1] || ({} as Partial<FinancialSeriesItem>);
  const s2 = series[2] || ({} as Partial<FinancialSeriesItem>);

  const y0 = s0.year || year - 2;
  const y1 = s1.year || year - 1;
  const y2 = s2.year || year;

  const table3Rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell("Chỉ tiêu", { widthPercent: 40, isHeader: true }),
        makeTableCell("Đơn vị", { widthPercent: 15, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell(`Năm ${y0}`, { widthPercent: 15, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`Năm ${y1}`, { widthPercent: 15, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`Năm ${y2}`, { widthPercent: 15, isHeader: true, align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Tổng sản lượng thực tế (Ptt)"),
        makeTableCell("Nghìn SP", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(s0.actualOutput), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(s1.actualOutput), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(s2.actualOutput), { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Tổng công suất thiết kế (P)"),
        makeTableCell("Nghìn SP", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(s0.designedCapacity), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(s1.designedCapacity), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(s2.designedCapacity), { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Giá trị sản xuất sản phẩm (Gsp)"),
        makeTableCell("Triệu đồng", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(s0.industrialOutputValue ? Math.round(s0.industrialOutputValue / 1e6) : undefined), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(s1.industrialOutputValue ? Math.round(s1.industrialOutputValue / 1e6) : undefined), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(s2.industrialOutputValue ? Math.round(s2.industrialOutputValue / 1e6) : undefined), { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Giá trị sản phẩm đạt yêu cầu (Gđ)"),
        makeTableCell("Triệu đồng", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(s0.industrialOutputValue ? Math.round((s0.industrialOutputValue * (1 - (data.defectProductRatio || 1) / 100)) / 1e6) : undefined), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(s1.industrialOutputValue ? Math.round((s1.industrialOutputValue * (1 - (data.defectProductRatio || 1) / 100)) / 1e6) : undefined), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(s2.industrialOutputValue ? Math.round((s2.industrialOutputValue * (1 - (data.defectProductRatio || 1) / 100)) / 1e6) : undefined), { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Doanh thu (Gdt)"),
        makeTableCell("Triệu đồng", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(s0.netRevenue ? Math.round(s0.netRevenue / 1e6) : undefined), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(s1.netRevenue ? Math.round(s1.netRevenue / 1e6) : undefined), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(s2.netRevenue ? Math.round(s2.netRevenue / 1e6) : undefined), { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Chi phí (Gcp)"),
        makeTableCell("Triệu đồng", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(s0.totalCosts ? Math.round(s0.totalCosts / 1e6) : undefined), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(s1.totalCosts ? Math.round(s1.totalCosts / 1e6) : undefined), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(s2.totalCosts ? Math.round(s2.totalCosts / 1e6) : undefined), { align: AlignmentType.RIGHT }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table3Rows,
    })
  );

  // 2. Sản phẩm chính trong 3 năm (TABLE 4)
  children.push(
    createParagraph(
      [
        createTextRun(`2. Sản phẩm (SP) chính của doanh nghiệp trong 3 năm gần nhất (${y0}, ${y1}, ${y2}):\n`, { bold: true }),
        createTextRun("Đơn vị tính: Triệu đồng\n", { italic: true }),
        createTextRun(
          "Hướng dẫn: Nếu doanh nghiệp có nhiều sản phẩm thì chỉ ghi tối đa 03 sản phẩm có doanh thu cao nhất. Ghi rõ tiêu chuẩn sản phẩm đạt được.",
          { italic: true, size: 20 }
        ),
      ],
      { spaceBefore: 120, spaceAfter: 60 }
    )
  );

  const p1Name = safeText(data.mainProduct1Name, "Sản phẩm chính 1");
  const p2Name = safeText(data.mainProduct2Name, "Sản phẩm chính 2");
  const p3Name = safeText(data.mainProduct3Name, "Sản phẩm chính 3");
  const pStandard =
    data.mainProductStandard === "quoc_te"
      ? "Tiêu chuẩn Quốc tế (ISO/IEC/ASTM)"
      : data.mainProductStandard === "quoc_gia"
      ? "Tiêu chuẩn Quốc gia (TCVN)"
      : data.mainProductStandard === "co_so_vuot_quoc_te"
      ? "Tiêu chuẩn cơ sở vượt tiêu chuẩn quốc tế"
      : "Tiêu chuẩn cơ sở (TCCS)";

  const revTotal0 = s0.netRevenue ? Math.round(s0.netRevenue / 1e6) : 0;
  const revTotal1 = s1.netRevenue ? Math.round(s1.netRevenue / 1e6) : 0;
  const revTotal2 = s2.netRevenue ? Math.round(s2.netRevenue / 1e6) : 0;

  const sh1 = (data.mainProduct1Share || 60) / 100;
  const sh2 = (data.mainProduct2Share || 25) / 100;
  const sh3 = (data.mainProduct3Share || 15) / 100;

  const table4Rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell("Chỉ tiêu", { widthPercent: 18, isHeader: true }),
        makeTableCell("Tên sản phẩm", { widthPercent: 26, isHeader: true }),
        makeTableCell(`DT ${y0}`, { widthPercent: 12, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`DT ${y1}`, { widthPercent: 12, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`DT ${y2}`, { widthPercent: 12, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell("Tiêu chuẩn đạt được", { widthPercent: 20, isHeader: true }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Sản phẩm chính 1"),
        makeTableCell(p1Name),
        makeTableCell(formatNumber(Math.round(revTotal0 * sh1)), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(Math.round(revTotal1 * sh1)), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(Math.round(revTotal2 * sh1)), { align: AlignmentType.RIGHT }),
        makeTableCell(pStandard),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Sản phẩm chính 2"),
        makeTableCell(data.mainProduct2Name ? p2Name : "...................."),
        makeTableCell(data.mainProduct2Name ? formatNumber(Math.round(revTotal0 * sh2)) : "", { align: AlignmentType.RIGHT }),
        makeTableCell(data.mainProduct2Name ? formatNumber(Math.round(revTotal1 * sh2)) : "", { align: AlignmentType.RIGHT }),
        makeTableCell(data.mainProduct2Name ? formatNumber(Math.round(revTotal2 * sh2)) : "", { align: AlignmentType.RIGHT }),
        makeTableCell(data.mainProduct2Name ? pStandard : ""),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Sản phẩm chính 3"),
        makeTableCell(data.mainProduct3Name ? p3Name : "...................."),
        makeTableCell(data.mainProduct3Name ? formatNumber(Math.round(revTotal0 * sh3)) : "", { align: AlignmentType.RIGHT }),
        makeTableCell(data.mainProduct3Name ? formatNumber(Math.round(revTotal1 * sh3)) : "", { align: AlignmentType.RIGHT }),
        makeTableCell(data.mainProduct3Name ? formatNumber(Math.round(revTotal2 * sh3)) : "", { align: AlignmentType.RIGHT }),
        makeTableCell(data.mainProduct3Name ? pStandard : ""),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Tổng cộng (Gdt)", { bold: true, bgColor: "F8FAFC" }),
        makeTableCell("", { bgColor: "F8FAFC" }),
        makeTableCell(formatNumber(revTotal0), { align: AlignmentType.RIGHT, bold: true, bgColor: "F8FAFC" }),
        makeTableCell(formatNumber(revTotal1), { align: AlignmentType.RIGHT, bold: true, bgColor: "F8FAFC" }),
        makeTableCell(formatNumber(revTotal2), { align: AlignmentType.RIGHT, bold: true, bgColor: "F8FAFC" }),
        makeTableCell("", { bgColor: "F8FAFC" }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table4Rows,
    })
  );

  // 3. Khả năng bảo dưỡng, sửa chữa máy móc trang thiết bị
  const mLevel = data.maintenanceLevel || 2;
  children.push(
    createParagraph(
      [
        createTextRun("3. Khả năng bảo dưỡng, sửa chữa máy móc, trang thiết bị của doanh nghiệp:\n", { bold: true }),
        createTextRun(`Bộ phận phụ trách sửa chữa, bảo dưỡng: Có ${data.maintenanceLevel >= 3 ? "đội ngũ chuyên trách" : "nhân sự kỹ thuật kiêm nhiệm"}. Số lượng: ${data.directWorkers ? Math.max(2, Math.round(data.directWorkers * 0.05)) : 3} người. Trình độ: 1 kỹ sư; ${data.directWorkers ? Math.max(1, Math.round(data.directWorkers * 0.04)) : 2} công nhân kỹ thuật.\n`),
        createTextRun("Mức độ chủ động thực hiện bảo dưỡng, sửa chữa của doanh nghiệp:\n"),
        createTextRun(`[${mLevel === 1 ? "x" : " "}] Cấp 1: Bảo dưỡng, sửa chữa khi có sự cố\n`),
        createTextRun(`[${mLevel === 2 ? "x" : " "}] Cấp 2: Bảo dưỡng, sửa chữa theo kế hoạch định kỳ đã lập và theo quy định nhà SX\n`),
        createTextRun(`[${mLevel === 3 ? "x" : " "}] Cấp 3: Bảo dưỡng, sửa chữa nhằm loại bỏ khiếm khuyết trong hệ thống để nâng cao hiệu suất\n`),
        createTextRun(`[${mLevel === 4 ? "x" : " "}] Cấp 4: Bảo dưỡng, sửa chữa nâng cao hiệu quả hệ thống trên cơ sở phân tích dữ liệu và độ tin cậy bằng công cụ AI / Cloud / IoT`),
      ],
      { spaceBefore: 120, spaceAfter: 60 }
    )
  );

  // 4. Nguyên vật liệu đầu vào (TABLE 5)
  children.push(
    createParagraph(
      createTextRun("4. Nguyên vật liệu đầu vào để sản xuất (chỉ ghi 3 nguyên vật liệu chính):", { bold: true }),
      { spaceBefore: 120, spaceAfter: 60 }
    )
  );

  const matMil = data.materialCostYear ? Math.round(data.materialCostYear / 1e6) : 0;
  const table5Rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell("Chỉ tiêu", { widthPercent: 22, isHeader: true }),
        makeTableCell("Tên NVL", { widthPercent: 24, isHeader: true }),
        makeTableCell(`SL ${y0}`, { widthPercent: 9, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`SL ${y1}`, { widthPercent: 9, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`SL ${y2}`, { widthPercent: 9, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`Trị giá ${y0}`, { widthPercent: 9, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`Trị giá ${y1}`, { widthPercent: 9, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`Trị giá ${y2}`, { widthPercent: 9, isHeader: true, align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Nguyên vật liệu 1"),
        makeTableCell("NVL chính sản xuất"),
        makeTableCell("---", { align: AlignmentType.RIGHT }),
        makeTableCell("---", { align: AlignmentType.RIGHT }),
        makeTableCell("---", { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(Math.round(matMil * 0.7)), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(Math.round(matMil * 0.8)), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(matMil), { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Nguyên vật liệu 2"),
        makeTableCell("...................."),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Nguyên vật liệu 3"),
        makeTableCell("...................."),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Tổng cộng (Gnvl)", { bold: true, bgColor: "F8FAFC" }),
        makeTableCell("", { bgColor: "F8FAFC" }),
        makeTableCell("", { bgColor: "F8FAFC" }),
        makeTableCell("", { bgColor: "F8FAFC" }),
        makeTableCell("", { bgColor: "F8FAFC" }),
        makeTableCell(formatNumber(Math.round(matMil * 0.7)), { align: AlignmentType.RIGHT, bold: true, bgColor: "F8FAFC" }),
        makeTableCell(formatNumber(Math.round(matMil * 0.8)), { align: AlignmentType.RIGHT, bold: true, bgColor: "F8FAFC" }),
        makeTableCell(formatNumber(matMil), { align: AlignmentType.RIGHT, bold: true, bgColor: "F8FAFC" }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table5Rows,
    })
  );

  // 5. Tiêu thụ điện và nhiên liệu (TABLE 6)
  children.push(
    createParagraph(
      createTextRun("5. Tiêu thụ điện và nhiên liệu (trong 3 năm gần nhất):", { bold: true }),
      { spaceBefore: 120, spaceAfter: 60 }
    )
  );

  const energyMil = data.energyCostYear ? Math.round(data.energyCostYear / 1e6) : 0;
  const table6Rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell("Chỉ tiêu", { widthPercent: 22, isHeader: true }),
        makeTableCell("Đơn vị", { widthPercent: 12, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell(`SL ${y0}`, { widthPercent: 11, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`SL ${y1}`, { widthPercent: 11, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`SL ${y2}`, { widthPercent: 11, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`Trị giá ${y0}`, { widthPercent: 11, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`Trị giá ${y1}`, { widthPercent: 11, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`Trị giá ${y2}`, { widthPercent: 11, isHeader: true, align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Tiêu thụ điện"),
        makeTableCell("kWh", { align: AlignmentType.CENTER }),
        makeTableCell("---", { align: AlignmentType.RIGHT }),
        makeTableCell("---", { align: AlignmentType.RIGHT }),
        makeTableCell("---", { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(Math.round(energyMil * 0.8)), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(Math.round(energyMil * 0.9)), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(energyMil), { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Tiêu thụ than"),
        makeTableCell("Tấn", { align: AlignmentType.CENTER }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Tiêu thụ xăng dầu (DO/FO)"),
        makeTableCell("Lít", { align: AlignmentType.CENTER }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
        makeTableCell("", { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Tổng số (Gnl)", { bold: true, bgColor: "F8FAFC" }),
        makeTableCell("Triệu đ", { align: AlignmentType.CENTER, bgColor: "F8FAFC" }),
        makeTableCell("", { bgColor: "F8FAFC" }),
        makeTableCell("", { bgColor: "F8FAFC" }),
        makeTableCell("", { bgColor: "F8FAFC" }),
        makeTableCell(formatNumber(Math.round(energyMil * 0.8)), { align: AlignmentType.RIGHT, bold: true, bgColor: "F8FAFC" }),
        makeTableCell(formatNumber(Math.round(energyMil * 0.9)), { align: AlignmentType.RIGHT, bold: true, bgColor: "F8FAFC" }),
        makeTableCell(formatNumber(energyMil), { align: AlignmentType.RIGHT, bold: true, bgColor: "F8FAFC" }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table6Rows,
    })
  );

  // 6. Áp dụng sáng kiến Kaizen (TABLE 7)
  children.push(
    createParagraph(
      [
        createTextRun("6. Việc áp dụng sáng kiến, cải tiến kỹ thuật, hợp lý hóa sản xuất của doanh nghiệp:\n", { bold: true }),
        createTextRun(`Chương trình/giải pháp thúc đẩy áp dụng sáng kiến: [${data.hasKaizenPolicy ? "x" : " "}] Có áp dụng       [${!data.hasKaizenPolicy ? "x" : " "}] Chưa có\n`),
        createTextRun(`Số lượng sáng kiến, cải tiến kỹ thuật đã có trong 3 năm gần nhất: ${data.kaizenCount3Years || 0} sáng kiến.\n`),
        createTextRun("Liệt kê 1 ÷ 5 sáng kiến có hiệu quả cao nhất:", { italic: true }),
      ],
      { spaceBefore: 120, spaceAfter: 60 }
    )
  );

  const kaizenHighlights = safeText(data.kaizenHighlights, "Cải tiến quy trình công nghệ hợp lý hóa sản xuất");
  const table7Rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell("STT", { widthPercent: 10, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell("Tên sáng kiến", { widthPercent: 50, isHeader: true }),
        makeTableCell("Hiệu quả áp dụng sáng kiến", { widthPercent: 40, isHeader: true }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("1", { align: AlignmentType.CENTER }),
        makeTableCell(data.kaizenCount3Years && data.kaizenCount3Years > 0 ? kaizenHighlights : ".................................................."),
        makeTableCell(data.hasHighImpactKaizen ? "Tiết kiệm chi phí SX và nâng cao năng suất > 10%" : ".................................................."),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("2", { align: AlignmentType.CENTER }),
        makeTableCell(".................................................."),
        makeTableCell(".................................................."),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("3", { align: AlignmentType.CENTER }),
        makeTableCell(".................................................."),
        makeTableCell(".................................................."),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table7Rows,
    })
  );

  // -------------------------------------------------------------------------
  // MỤC D: THÔNG TIN NHÂN LỰC, QUẢN LÝ, THÔNG TIN VÀ MÔI TRƯỜNG
  // -------------------------------------------------------------------------
  children.push(
    createParagraph(
      createTextRun("D. THÔNG TIN NHÂN LỰC, QUẢN LÝ, THÔNG TIN VÀ MÔI TRƯỜNG CỦA DOANH NGHIỆP", { bold: true, size: 24 }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  // 1. Cơ cấu lao động (TABLE 8 - 11 rows)
  children.push(
    createParagraph(
      [
        createTextRun(`1. Thông tin lao động của doanh nghiệp trong năm ${year}:\n`, { bold: true }),
        createTextRun(
          "Hướng dẫn: Công nhân đã qua huấn luyện nghề là công nhân được cấp chứng chỉ nghề. Công nhân bậc cao/nghệ nhân có chứng nhận bậc thợ hoặc kinh nghiệm tối thiểu 10 năm.",
          { italic: true, size: 20 }
        ),
      ],
      { spaceAfter: 60 }
    )
  );

  const mTot = data.totalWorkforce || 0;
  const mDirect = data.directWorkers || 0;
  const mIndirect = data.indirectStaff || (mTot > mDirect ? mTot - mDirect : 0);
  const mTrained = data.trainedWorkers || 0;
  const mHighSkill = data.highSkilledWorkers || 0;
  const mMgr = data.qualifiedManagers || 0;
  const mProf = data.qualifiedProfessionals || 0;
  const mRd = data.rdWorkforceCount || 0;

  const table8Rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell("Chỉ tiêu", { widthPercent: 70, isHeader: true }),
        makeTableCell("Đơn vị", { widthPercent: 15, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell("Số lượng", { widthPercent: 15, isHeader: true, align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("1. Tổng số lao động của doanh nghiệp (M)"),
        makeTableCell("Người", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(mTot), { align: AlignmentType.RIGHT, bold: true }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("2. Công nhân trực tiếp sản xuất (Mtt)"),
        makeTableCell("Người", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(mDirect), { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("3. Số cán bộ khối gián tiếp trong doanh nghiệp (Mgt = M - Mtt)"),
        makeTableCell("Người", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(mIndirect), { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("4. Số lượng công nhân đã qua huấn luyện nghề (Mcn)"),
        makeTableCell("Người", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(mTrained), { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("5. Số lượng công nhân bậc cao, nghệ nhân (Mbc)"),
        makeTableCell("Người", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(mHighSkill), { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("6. Số lượng nhân lực làm công tác quản lý"),
        makeTableCell("Người", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(mMgr), { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("7. Số lượng cán bộ quản lý có trình độ và kinh nghiệm quản lý phù hợp (Mql)"),
        makeTableCell("Người", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(mMgr), { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("8. Số lượng cán bộ nghiệp vụ có trình độ đại học trở lên phù hợp (Mnv)"),
        makeTableCell("Người", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(mProf), { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("9. Số lượng lao động có trình độ cao đẳng trở lên"),
        makeTableCell("Người", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(mProf + mMgr), { align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("10. Số lượng lao động chuyên làm công tác nghiên cứu và phát triển (MR&D)"),
        makeTableCell("Người", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(mRd), { align: AlignmentType.RIGHT }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table8Rows,
    })
  );

  // 2. Đào tạo nhân lực 3 năm (TABLE 9)
  children.push(
    createParagraph(
      createTextRun("2. Thông tin về hoạt động đào tạo, huấn luyện (ĐTHL) của doanh nghiệp trong ba năm gần nhất:", { bold: true }),
      { spaceBefore: 120, spaceAfter: 60 }
    )
  );

  const trainMil = data.trainingCost3Years ? Math.round(data.trainingCost3Years / 1e6) : 0;
  const table9Rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell("Chỉ tiêu", { widthPercent: 40, isHeader: true }),
        makeTableCell("Đơn vị", { widthPercent: 15, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell(`Năm ${y0}`, { widthPercent: 15, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`Năm ${y1}`, { widthPercent: 15, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`Năm ${y2}`, { widthPercent: 15, isHeader: true, align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Tổng chi cho ĐTHL (Gđthl)"),
        makeTableCell("Triệu đồng", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(Math.round(trainMil * 0.3)), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(Math.round(trainMil * 0.35)), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(Math.round(trainMil * 0.35)), { align: AlignmentType.RIGHT }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table9Rows,
    })
  );

  // 3. Phần mềm quản lý sản xuất (TABLE 10)
  children.push(
    createParagraph(
      createTextRun("3. Hệ thống thông tin phục vụ sản xuất, quản lý mà doanh nghiệp đang áp dụng:", { bold: true }),
      { spaceBefore: 120, spaceAfter: 60 }
    )
  );

  const swApps = (data.softwareApplications || []).map((s) => s.toUpperCase());
  const hasMes = swApps.some((s) => s.includes("MES"));
  const hasErp = swApps.some((s) => s.includes("ERP") || s.includes("SAP"));
  const hasPlm = swApps.some((s) => s.includes("PLM"));
  const hasPdm = swApps.some((s) => s.includes("PDM"));
  const hasPps = swApps.some((s) => s.includes("PPS"));
  const hasScm = swApps.some((s) => s.includes("SCM"));

  const table10Rows: TableRow[] = [
    new TableRow({
      children: [
        makeTableCell(`[${hasMes ? "x" : " "}] Hệ thống thực hành sản xuất (MES)`, { widthPercent: 33 }),
        makeTableCell(`[${hasErp ? "x" : " "}] Hệ thống hoạch định nguồn lực (ERP)`, { widthPercent: 34 }),
        makeTableCell(`[${hasPlm ? "x" : " "}] Quản lý vòng đời sản phẩm (PLM)`, { widthPercent: 33 }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(`[${hasPdm ? "x" : " "}] Quản lý dữ liệu sản phẩm (PDM)`, { widthPercent: 33 }),
        makeTableCell(`[${hasPps ? "x" : " "}] Lập kế hoạch sản xuất (PPS)`, { widthPercent: 34 }),
        makeTableCell(`[${hasScm ? "x" : " "}] Quản lý chuỗi cung ứng (SCM)`, { widthPercent: 33 }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table10Rows,
    })
  );

  // 4. Hệ thống thu thập dữ liệu sản xuất (TABLE 11)
  children.push(
    createParagraph(
      createTextRun("4. Hệ thống thu thập dữ liệu phục vụ số hóa quá trình sản xuất của doanh nghiệp:", { bold: true }),
      { spaceBefore: 120, spaceAfter: 60 }
    )
  );

  const dataColl = (data.dataCollectionSystems || []).map((s) => s.toUpperCase());
  const hasScada = dataColl.some((s) => s.includes("SCADA") || s.includes("PDA"));
  const hasMdc = dataColl.some((s) => s.includes("MDC"));
  const hasFms = dataColl.some((s) => s.includes("FMS") || s.includes("DCS"));
  const hasCim = dataColl.some((s) => s.includes("CIM"));

  const table11Rows: TableRow[] = [
    new TableRow({
      children: [
        makeTableCell(`[${hasScada ? "x" : " "}] Hệ thống thu thập dữ liệu sản xuất (PDA / SCADA)`, { widthPercent: 50 }),
        makeTableCell(`[${hasMdc ? "x" : " "}] Hệ thống thu thập dữ liệu máy móc (MDC)`, { widthPercent: 50 }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(`[${hasFms ? "x" : " "}] Hệ thống SX linh hoạt (FMS) / Điều khiển phân tán (DCS)`, { widthPercent: 50 }),
        makeTableCell(`[${hasCim ? "x" : " "}] Hệ thống sản xuất tích hợp (CIM)`, { widthPercent: 50 }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table11Rows,
    })
  );

  // 5 & 6. Áp dụng hệ thống quản lý sản xuất & Bảo vệ môi trường
  const isos = data.isoCertifications || [];
  const prods = data.productivityTools || [];
  const hasIso9001 = isos.length > 0;
  const isEnvStandard = data.environmentalCompliant;
  const isIso14001 = data.hasIso14001;
  const isWasteRecycle = data.hasWasteRecycling;

  children.push(
    createParagraph(
      [
        createTextRun("5. Áp dụng hệ thống quản lý sản xuất của doanh nghiệp:\n", { bold: true }),
        createTextRun(`[${hasIso9001 ? "x" : " "}] Áp dụng hệ thống quản lý sản xuất và đã được cấp chứng chỉ.\n`),
        createTextRun(`    Tên chứng chỉ đã cấp: ${isos.length > 0 ? isos.join(", ") : "Chưa có"}\n`),
        createTextRun(`[${prods.length > 0 ? "x" : " "}] Áp dụng công cụ cải tiến năng suất.\n`),
        createTextRun(`    Tên công cụ: ${prods.length > 0 ? prods.join(", ") : "5S, Kaizen, Lean..."}\n`),
        createTextRun("6. Thông tin chung về bảo vệ môi trường của doanh nghiệp:\n", { bold: true }),
        createTextRun(`[${isIso14001 && isWasteRecycle ? "x" : " "}] Hệ thống QLMT tiên tiến (đã cấp chứng chỉ), có hệ thống xử lý chất thải đạt chuẩn, có tái chế tái sử dụng chất thải\n`),
        createTextRun(`[${isIso14001 && !isWasteRecycle ? "x" : " "}] Hệ thống QLMT tiên tiến (đã cấp chứng chỉ), có hệ thống xử lý chất thải đáp ứng quy định\n`),
        createTextRun(`[${!isIso14001 && isEnvStandard ? "x" : " "}] Hệ thống QLMT phù hợp tiêu chuẩn, có hệ thống xử lý chất thải đáp ứng quy định`),
      ],
      { spaceBefore: 120, spaceAfter: 100 }
    )
  );

  // -------------------------------------------------------------------------
  // MỤC Đ: ĐẦU TƯ CHO NGHIÊN CỨU VÀ PHÁT TRIỂN CỦA DOANH NGHIỆP
  // -------------------------------------------------------------------------
  children.push(
    createParagraph(
      createTextRun("Đ. ĐẦU TƯ CHO NGHIÊN CỨU VÀ PHÁT TRIỂN CỦA DOANH NGHIỆP", { bold: true, size: 24 }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  // 1. Nhân lực R&D
  children.push(
    createParagraph(
      [
        createTextRun("1. Nhân lực làm công tác nghiên cứu và phát triển của doanh nghiệp:\n", { bold: true }),
        createTextRun(`Số lượng nhân lực làm công tác nghiên cứu và phát triển: ${mRd} người.\n`),
        createTextRun("Trình độ nhân lực nghiên cứu và phát triển: Tiến sĩ: 0; Thạc sĩ: 0; Đại học: " + (mRd > 0 ? String(mRd) : "0") + " người."),
      ],
      { spaceAfter: 60 }
    )
  );

  // 2. Chi phí CNTT 3 năm (TABLE 12)
  children.push(
    createParagraph(
      createTextRun("2. Chi phí dành cho thông tin và công nghệ thông tin trong 03 năm gần nhất:", { bold: true }),
      { spaceBefore: 100, spaceAfter: 60 }
    )
  );

  const itMil = data.itExpenses3Years ? Math.round(data.itExpenses3Years / 1e6) : 0;
  const table12Rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell("Chỉ tiêu", { widthPercent: 40, isHeader: true }),
        makeTableCell("Đơn vị", { widthPercent: 15, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell(`Năm ${y0}`, { widthPercent: 15, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`Năm ${y1}`, { widthPercent: 15, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`Năm ${y2}`, { widthPercent: 15, isHeader: true, align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Tổng chi cho CNTT (Gtt)"),
        makeTableCell("Triệu đồng", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(Math.round(itMil * 0.3)), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(Math.round(itMil * 0.35)), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(Math.round(itMil * 0.35)), { align: AlignmentType.RIGHT }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table12Rows,
    })
  );

  // 3. Hạ tầng R&D & 4. Chi phí R&D (TABLE 13)
  const rdFac = data.rdFacilityLevel || 1;
  children.push(
    createParagraph(
      [
        createTextRun("3. Hạ tầng dành cho nghiên cứu và phát triển (R&D) mà doanh nghiệp hiện có:\n", { bold: true }),
        createTextRun(`[${rdFac === 3 ? "x" : " "}] Viện, trung tâm nghiên cứu và phát triển công nghệ, sản phẩm trực thuộc\n`),
        createTextRun(`[${rdFac === 2 ? "x" : " "}] Có bộ phận R&D chuyên trách và phòng thí nghiệm (chế tạo, thử nghiệm)\n`),
        createTextRun(`[${rdFac === 1 ? "x" : " "}] Có bộ phận hoạt động R&D công nghệ, sản phẩm (kiêm nhiệm)\n`),
        createTextRun("4. Chi phí dành cho hoạt động nghiên cứu và phát triển của doanh nghiệp trong 3 năm:\n", { bold: true }),
      ],
      { spaceBefore: 120, spaceAfter: 60 }
    )
  );

  const rdMil = data.rdExpenses3Years ? Math.round(data.rdExpenses3Years / 1e6) : 0;
  const table13Rows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell("Chỉ tiêu", { widthPercent: 40, isHeader: true }),
        makeTableCell("Đơn vị", { widthPercent: 15, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell(`Năm ${y0}`, { widthPercent: 15, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`Năm ${y1}`, { widthPercent: 15, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell(`Năm ${y2}`, { widthPercent: 15, isHeader: true, align: AlignmentType.RIGHT }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell("Tổng chi cho hoạt động R&D (GR&D)"),
        makeTableCell("Triệu đồng", { align: AlignmentType.CENTER }),
        makeTableCell(formatNumber(Math.round(rdMil * 0.3)), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(Math.round(rdMil * 0.35)), { align: AlignmentType.RIGHT }),
        makeTableCell(formatNumber(Math.round(rdMil * 0.35)), { align: AlignmentType.RIGHT }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table13Rows,
    })
  );

  children.push(
    createParagraph(
      createTextRun(`Doanh nghiệp có thành lập Quỹ phát triển KH&CN: [${data.hasSciTechFund ? "x" : " "}] Có       [${!data.hasSciTechFund ? "x" : " "}] Không`),
      { spaceBefore: 60, spaceAfter: 100 }
    )
  );

  // -------------------------------------------------------------------------
  // MỤC E: NĂNG LỰC ĐỔI MỚI SÁNG TẠO CỦA DOANH NGHIỆP
  // -------------------------------------------------------------------------
  children.push(
    createParagraph(
      createTextRun("E. NĂNG LỰC ĐỔI MỚI SÁNG TẠO CỦA DOANH NGHIỆP", { bold: true, size: 24 }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  // 1 & 2. Sản phẩm mới & R&D công nghệ
  const prodType = data.newProductType || "none";
  const newRevMil = data.newProductRevenueRatio ? Math.round((revTotal2 * data.newProductRevenueRatio) / 100) : 0;
  const techRes = data.rdTechnologyResult || "none";

  children.push(
    createParagraph(
      [
        createTextRun("1. Kết quả nghiên cứu và phát triển sản phẩm mới trong 3 năm qua:\n", { bold: true }),
        createTextRun(`[${prodType === "kieu_dang" ? "x" : " "}] Tạo ra sản phẩm mới về kiểu dáng. Tên: ${prodType === "kieu_dang" ? safeText(data.newProductNames) : "...................."}\n`),
        createTextRun(`[${prodType === "tinh_nang" ? "x" : " "}] Tạo ra sản phẩm mới về tính năng. Tên: ${prodType === "tinh_nang" ? safeText(data.newProductNames) : "...................."}\n`),
        createTextRun(`[${prodType === "hoan_toan_moi" ? "x" : " "}] Tạo ra sản phẩm hoàn toàn mới trên thị trường. Tên: ${prodType === "hoan_toan_moi" ? safeText(data.newProductNames) : "...................."}\n`),
        createTextRun(`Doanh thu sản phẩm mới trong năm ${y2}: ${newRevMil > 0 ? formatNumber(newRevMil) : "0"} triệu đồng (${data.newProductRevenueRatio || 0}% doanh thu).\n\n`),
        createTextRun("2. Kết quả nghiên cứu và phát triển công nghệ:\n", { bold: true }),
        createTextRun(`[${techRes === "dang_nghien_cuu" ? "x" : " "}] Quy trình, thiết bị công nghệ đang tiến hành nghiên cứu\n`),
        createTextRun(`[${techRes === "thu_nghiem_lab" ? "x" : " "}] Quy trình, thiết bị công nghệ đang ở mức thử nghiệm phòng lab\n`),
        createTextRun(`[${techRes === "giai_phap_huu_ich" ? "x" : " "}] Quy trình công nghệ mới được cấp Bằng giải pháp hữu ích\n`),
        createTextRun(`[${techRes === "bang_sang_che" ? "x" : " "}] Quy trình công nghệ mới được bảo hộ Bằng sáng chế và thương mại hóa`),
      ],
      { spaceAfter: 60 }
    )
  );

  // 3. Chuyển đổi số CMCN 4.0 (TABLE 14 & TABLE 15)
  children.push(
    createParagraph(
      [
        createTextRun("3. Năng lực chuyển đổi số của doanh nghiệp:\n", { bold: true }),
        createTextRun("a) Xây dựng chiến lược CMCN 4.0 hoặc chuyển đổi số tại doanh nghiệp:", { bold: true }),
      ],
      { spaceBefore: 100, spaceAfter: 60 }
    )
  );

  const strat = data.digitalStrategyLevel || "chua_biet";
  const table14Rows: TableRow[] = [
    new TableRow({
      children: [
        makeTableCell(`[${strat === "chua_biet" ? "x" : " "}] Chưa biết`, { widthPercent: 33 }),
        makeTableCell(`[${strat === "da_xay_dung" ? "x" : " "}] Doanh nghiệp đã xây dựng được chiến lược`, { widthPercent: 34 }),
        makeTableCell(`[ ] Đã biết nhưng chưa thực hiện`, { widthPercent: 33 }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(`[${strat === "chuan_bi" ? "x" : " "}] Doanh nghiệp chuẩn bị xây dựng chiến lược`, { widthPercent: 33 }),
        makeTableCell(`[${strat === "dang_thuc_hien" ? "x" : " "}] Doanh nghiệp đang thực hiện các nội dung chiến lược`, { widthPercent: 34 }),
        makeTableCell("", { widthPercent: 33 }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table14Rows,
    })
  );

  children.push(
    createParagraph(
      createTextRun("b) Nghiên cứu và áp dụng các công nghệ số 4.0 trong sản xuất kinh doanh:", { bold: true }),
      { spaceBefore: 100, spaceAfter: 60 }
    )
  );

  const dTechs = (data.digitalTechnologies || []).map((t) => t.toUpperCase());
  const hasCloud = dTechs.some((t) => t.includes("CLOUD") || t.includes("DAM_MAY"));
  const hasModel = dTechs.some((t) => t.includes("MO_HINH") || t.includes("SIMULATION"));
  const hasRobot = dTechs.some((t) => t.includes("ROBOT"));
  const hasSec = dTechs.some((t) => t.includes("AN_NINH") || t.includes("CYBER"));
  const hasAr = dTechs.some((t) => t.includes("AR") || t.includes("TANG_CUONG"));
  const hasIot = dTechs.some((t) => t.includes("IOT") || t.includes("VAN_VAT"));
  const hasVr = dTechs.some((t) => t.includes("VR") || t.includes("THUC_TAI_AO"));
  const hasMat = dTechs.some((t) => t.includes("VAT_LIEU"));
  const hasBc = dTechs.some((t) => t.includes("BLOCKCHAIN") || t.includes("CHUOI_KHOI"));
  const hasBd = dTechs.some((t) => t.includes("BIGDATA") || t.includes("DU_LIEU_LON") || t.includes("AI"));
  const hasInteg = dTechs.some((t) => t.includes("TICH_HOP"));
  const has3d = dTechs.some((t) => t.includes("IN_3D") || t.includes("3D"));

  const table15Rows: TableRow[] = [
    new TableRow({
      children: [
        makeTableCell(`[${hasCloud ? "x" : " "}] Điện toán đám mây`, { widthPercent: 20 }),
        makeTableCell(`[${hasModel ? "x" : " "}] Mô hình hóa`, { widthPercent: 20 }),
        makeTableCell(`[${hasRobot ? "x" : " "}] Robot tiên tiến`, { widthPercent: 20 }),
        makeTableCell(`[${hasSec ? "x" : " "}] An ninh mạng`, { widthPercent: 20 }),
        makeTableCell(`[${hasAr ? "x" : " "}] Thực tế tăng cường (AR)`, { widthPercent: 20 }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(`[${hasIot ? "x" : " "}] Internet kết nối vạn vật (IoT)`, { widthPercent: 20 }),
        makeTableCell(`[${hasVr ? "x" : " "}] Thực tại ảo (VR)`, { widthPercent: 20 }),
        makeTableCell(`[${hasMat ? "x" : " "}] Vật liệu mới`, { widthPercent: 20 }),
        makeTableCell(`[${hasBc ? "x" : " "}] Chuỗi khối (Blockchain)`, { widthPercent: 20 }),
        makeTableCell(`[${hasBd ? "x" : " "}] Dữ liệu lớn & AI (BigData)`, { widthPercent: 20 }),
      ],
    }),
    new TableRow({
      children: [
        makeTableCell(`[${hasInteg ? "x" : " "}] Tích hợp hệ thống`, { widthPercent: 20 }),
        makeTableCell(`[${has3d ? "x" : " "}] In 3D`, { widthPercent: 20 }),
        makeTableCell("", { widthPercent: 20 }),
        makeTableCell("", { widthPercent: 20 }),
        makeTableCell("", { widthPercent: 20 }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: table15Rows,
    })
  );

  const scopeAdop = data.digitalAdoptionScope || "nghien_cuu";
  children.push(
    createParagraph(
      [
        createTextRun("c) Mức độ áp dụng các công nghệ số tại doanh nghiệp:\n", { bold: true }),
        createTextRun(`[${scopeAdop === "nghien_cuu" ? "x" : " "}] Đang nghiên cứu để áp dụng       `),
        createTextRun(`[${scopeAdop === "mot_so_bo_phan" ? "x" : " "}] Đã triển khai tại một số bộ phận       `),
        createTextRun(`[${scopeAdop === "toan_nha_may" ? "x" : " "}] Đã triển khai toàn bộ trong nhà máy\n\n`),
        createTextRun("4. Năng lực liên kết, hợp tác trong R&D của doanh nghiệp:\n", { bold: true }),
        createTextRun(`[${data.academyPartnershipType === "du_an_rd" ? "x" : " "}] Hợp tác theo hình thức dự án nghiên cứu phát triển công nghệ sản phẩm mới\n`),
        createTextRun(`[${data.academyPartnershipType === "chuyen_gia_dao_tao" ? "x" : " "}] Hợp tác theo hình thức mời chuyên gia hỗ trợ, tiếp nhận kết quả nghiên cứu, đào tạo R&D`),
      ],
      { spaceBefore: 80, spaceAfter: 120 }
    )
  );

  // -------------------------------------------------------------------------
  // PHỤ LỤC II: KẾT QUẢ TÍNH TOÁN ĐIỂM 26 TIÊU CHÍ (TABLE 16)
  // -------------------------------------------------------------------------
  children.push(
    createParagraph(
      [
        createTextRun("PHỤ LỤC II: BÁO CÁO KẾT QUẢ ĐÁNH GIÁ 26 TIÊU CHÍ\n", { bold: true, size: 26, color: "0F172A" }),
        createTextRun("TRÌNH ĐỘ VÀ NĂNG LỰC CÔNG NGHỆ THEO THÔNG TƯ 17/2019/TT-BKHCN", { bold: true, size: 24, color: "0F172A" }),
      ],
      { align: AlignmentType.CENTER, spaceBefore: 280, spaceAfter: 120 }
    )
  );

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

  // SUMMARY BOX
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
          safeText(assessment.reviewNotes, "Hồ sơ đánh giá trực tuyến hợp lệ trên Hệ thống CSDL Quốc gia NacenTwin."),
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

  // -------------------------------------------------------------------------
  // KHU VỰC CHỮ KÝ 3 BÊN (TABLE 17 / TABLE 18)
  // -------------------------------------------------------------------------
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


// =========================================================================
// 2. SME DEMAND SURVEY DOCX GENERATOR
// =========================================================================

export async function exportDemandSmeDocx(
  record: DemandSmeSurveyRecord
): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];

  // Header & Quoc hieu
  children.push(createAdministrativeHeader("CỤC PHÁT TRIỂN CÔNG NGHỆ VÀ ĐỔI MỚI SÁNG TẠO"));

  // Title
  children.push(
    createParagraph(
      [
        createTextRun("PHIẾU KHẢO SÁT HIỆN TRẠNG VÀ NHU CẦU ĐỔI MỚI SÁNG TẠO,\n", {
          bold: true,
          size: 26,
          color: "0F172A",
        }),
        createTextRun("CHUYỂN ĐỔI SỐ CỦA DOANH NGHIỆP NHỎ VÀ VỪA", {
          bold: true,
          size: 26,
          color: "0F172A",
        }),
      ],
      { align: AlignmentType.CENTER, spaceBefore: 180, spaceAfter: 60 }
    )
  );

  children.push(
    createParagraph(
      createTextRun(
        "(Căn cứ Luật Hỗ trợ Doanh nghiệp nhỏ và vừa 2017 & Nghị định số 80/2021/NĐ-CP)",
        { italic: true, size: 21, color: "475569" }
      ),
      { align: AlignmentType.CENTER, spaceAfter: 180 }
    )
  );

  // Status Banner
  children.push(
    createParagraph(
      [
        createTextRun("Mã phiếu: ", { bold: true }),
        createTextRun(`${record.id.substring(0, 8).toUpperCase()}   |   `),
        createTextRun("Trạng thái: ", { bold: true }),
        createTextRun(`${record.status}   |   `),
        createTextRun("Tỉnh/Thành phố: ", { bold: true }),
        createTextRun(`${record.provinceName || record.province || "Toàn quốc"}`),
      ],
      { align: AlignmentType.CENTER, spaceAfter: 140 }
    )
  );

  // PHẦN I: THÔNG TIN DOANH NGHIỆP
  children.push(
    createParagraph(
      createTextRun("PHẦN I. THÔNG TIN CHUNG VỀ DOANH NGHIỆP", { bold: true, size: 24 }),
      { spaceBefore: 160, spaceAfter: 80 }
    )
  );

  const p1Fields = [
    `1. Tên doanh nghiệp: ${safeText(record.enterpriseName)}`,
    `2. Mã số thuế: ${safeText(record.taxCode)}`,
    `3. Địa chỉ trụ sở: ${safeText(record.address)} (Địa bàn: ${record.provinceName || record.province || "---"})`,
    `4. Người đại diện / Đầu mối liên hệ: ${safeText(record.contactPerson)}`,
    `   Điện thoại: ${safeText(record.contactPhone)}   |   Email: ${safeText(record.contactEmail)}`,
    `5. Lĩnh vực hoạt động chính: ${safeText(record.sectorName, "Cơ khí, Chế tạo & Tự động hóa")}`,
    `6. Loại hình sở hữu: ${safeText(record.ownershipType, "Doanh nghiệp tư nhân / Cổ phần")}`,
    `7. Quy mô doanh nghiệp: Lao động: ${safeText(record.workforceScale, "10 - 50 người")}; Doanh thu: ${safeText(record.revenueScale, "3 - 50 tỷ đồng")}.`,
  ];
  for (const f of p1Fields) {
    children.push(createParagraph(f, { spaceBefore: 30, spaceAfter: 30 }));
  }

  // PHẦN II: HIỆN TRẠNG CÔNG NGHỆ & MỨC ĐỘ SỐ HÓA
  children.push(
    createParagraph(
      createTextRun("PHẦN II. HIỆN TRẠNG ÁP DỤNG CÔNG NGHỆ VÀ MỨC ĐỘ SỐ HÓA", {
        bold: true,
        size: 24,
      }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  const p2Fields = [
    `1. Hiện trạng thiết bị máy móc: ${safeText(record.currentTechStatus, "Máy móc hoạt động ổn định, cần cải tiến nâng cao công suất")}.`,
    `2. Mức độ tự động hóa: ${safeText(record.automationLevel, "Bán tự động (30% - 70% quy trình)")}.`,
    `3. Ứng dụng phần mềm số hóa: ${safeText(record.softwareStatus, "Đã có phần mềm kế toán và bán hàng")}.`,
    `4. Rào cản, khó khăn kỹ thuật lớn nhất: ${record.barriers && record.barriers.length > 0 ? record.barriers.join("; ") : "Thiếu vốn đầu tư công nghệ mới và thiếu nhân lực vận hành"}.`,
  ];
  for (const f of p2Fields) {
    children.push(createParagraph(f, { spaceBefore: 30, spaceAfter: 30 }));
  }

  // PHẦN III: NHU CẦU CÔNG NGHỆ CHI TIẾT
  children.push(
    createParagraph(
      createTextRun("PHẦN III. NHU CẦU CÔNG NGHỆ VÀ ĐỔI MỚI SÁNG TẠO CỤ THỂ", {
        bold: true,
        size: 24,
      }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  const demandRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        makeTableCell("STT", { widthPercent: 8, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell("Nội dung nhu cầu công nghệ / giải pháp", { widthPercent: 44, isHeader: true }),
        makeTableCell("Hình thức", { widthPercent: 16, isHeader: true, align: AlignmentType.CENTER }),
        makeTableCell("Dự toán ngân sách", { widthPercent: 16, isHeader: true, align: AlignmentType.RIGHT }),
        makeTableCell("Thời gian", { widthPercent: 16, isHeader: true, align: AlignmentType.CENTER }),
      ],
    }),
  ];

  if (record.demands && record.demands.length > 0) {
    record.demands.forEach((d, idx) => {
      demandRows.push(
        new TableRow({
          children: [
            makeTableCell(String(idx + 1), { widthPercent: 8, align: AlignmentType.CENTER }),
            makeTableCell(safeText(d.title) + (d.description ? `\n(${d.description})` : ""), { widthPercent: 44 }),
            makeTableCell(safeText(d.demandType, "Mua mới"), { widthPercent: 16, align: AlignmentType.CENTER }),
            makeTableCell(safeText(d.budget, "Thương lượng"), { widthPercent: 16, align: AlignmentType.RIGHT }),
            makeTableCell(safeText(d.timeline, "Năm 2026"), { widthPercent: 16, align: AlignmentType.CENTER }),
          ],
        })
      );
    });
  } else {
    demandRows.push(
      new TableRow({
        children: [
          makeTableCell("1", { widthPercent: 8, align: AlignmentType.CENTER }),
          makeTableCell("Nhu cầu nâng cấp hệ thống điều khiển tự động hóa dây chuyền sản xuất", { widthPercent: 44 }),
          makeTableCell("Nâng cấp", { widthPercent: 16, align: AlignmentType.CENTER }),
          makeTableCell("500 tr - 1 tỷ", { widthPercent: 16, align: AlignmentType.RIGHT }),
          makeTableCell("Quý II/2026", { widthPercent: 16, align: AlignmentType.CENTER }),
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

  // PHẦN IV: NHU CẦU HỖ TRỢ TỪ CƠ QUAN NHÀ NƯỚC & CHUYÊN GIA
  children.push(
    createParagraph(
      createTextRun("PHẦN IV. ĐỀ XUẤT KẾT NỐI VÀ HỖ TRỢ TỪ CƠ QUAN NHÀ NƯỚC", {
        bold: true,
        size: 24,
      }),
      { spaceBefore: 200, spaceAfter: 80 }
    )
  );

  const p4Fields = [
    `1. Nhu cầu hỗ trợ tư vấn từ Chuyên gia: ${record.consultingNeeds && record.consultingNeeds.length > 0 ? record.consultingNeeds.join(", ") : "Tư vấn lựa chọn giải pháp kỹ thuật và thẩm định thiết bị"}.`,
    `2. Nhu cầu tiếp cận các chính sách hỗ trợ: ${record.govSupportNeeds && record.govSupportNeeds.length > 0 ? record.govSupportNeeds.join(", ") : "Hỗ trợ lãi suất vay vốn đổi mới công nghệ và kết nối Sàn NacenTwin"}.`,
  ];
  for (const f of p4Fields) {
    children.push(createParagraph(f, { spaceBefore: 30, spaceAfter: 30 }));
  }

  // Signatures
  children.push(
    createParagraph(
      createTextRun(".............., Ngày ..... tháng ..... năm 20....   ", {
        italic: true,
        size: 21,
      }),
      { align: AlignmentType.RIGHT, spaceBefore: 280, spaceAfter: 100 }
    )
  );
  children.push(
    createSignatureBlock("NGƯỜI LẬP PHIẾU KHẢO SÁT", "ĐẠI DIỆN DOANH NGHIỆP")
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
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".docx") ? filename : `${filename}.docx`;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }, 150);
}
