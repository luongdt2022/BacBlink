import { DemandSurveyItem } from "@/services/api/assessment-tt17";
import { DemandSmeSurveyRecord } from "./survey-docx-exporter";
import { DEMAND_SME_TEMPLATE_BASE64 } from "./demand-sme-template-base64";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// =========================================================================
// 1. ZIP ARCHIVE READER & WRITER (Pure Web CompressionStream / DecompressionStream)
// =========================================================================

interface ZipEntry {
  name: string;
  compressionMethod: number;
  compressedData: Uint8Array;
  uncompressedSize: number;
  crc32: number;
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC32_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function base64ToUint8Array(base64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

async function streamTransform(
  input: Uint8Array,
  stream: CompressionStream | DecompressionStream
): Promise<Uint8Array> {
  const writer = stream.writable.getWriter();
  const writePromise = (async () => {
    await writer.write(new Uint8Array(input));
    await writer.close();
  })();

  const reader = stream.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      total += value.length;
    }
  }
  await writePromise;

  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  return streamTransform(data, new DecompressionStream("deflate-raw"));
}

async function deflateRaw(data: Uint8Array): Promise<Uint8Array> {
  return streamTransform(data, new CompressionStream("deflate-raw"));
}

function readZipEntries(zipBytes: Uint8Array): Map<string, ZipEntry> {
  const view = new DataView(zipBytes.buffer, zipBytes.byteOffset, zipBytes.byteLength);
  let eocdOffset = -1;
  for (let i = zipBytes.length - 22; i >= Math.max(0, zipBytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset < 0) {
    throw new Error("Invalid DOCX ZIP archive: EOCD not found");
  }

  const totalEntries = view.getUint16(eocdOffset + 10, true);
  let cdOffset = view.getUint32(eocdOffset + 16, true);
  const decoder = new TextDecoder("utf-8");
  const entries = new Map<string, ZipEntry>();

  for (let i = 0; i < totalEntries; i++) {
    if (view.getUint32(cdOffset, true) !== 0x02014b50) {
      throw new Error("Invalid Central Directory header signature");
    }
    const compressionMethod = view.getUint16(cdOffset + 10, true);
    const entryCrc32 = view.getUint32(cdOffset + 16, true);
    const compressedSize = view.getUint32(cdOffset + 20, true);
    const uncompressedSize = view.getUint32(cdOffset + 24, true);
    const fileNameLen = view.getUint16(cdOffset + 28, true);
    const extraLen = view.getUint16(cdOffset + 30, true);
    const commentLen = view.getUint16(cdOffset + 32, true);
    const localHeaderOffset = view.getUint32(cdOffset + 42, true);

    const name = decoder.decode(
      zipBytes.subarray(cdOffset + 46, cdOffset + 46 + fileNameLen)
    );

    const localNameLen = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLen = view.getUint16(localHeaderOffset + 28, true);
    const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
    const compressedData = zipBytes.subarray(dataStart, dataStart + compressedSize);

    entries.set(name, {
      name,
      compressionMethod,
      compressedData,
      uncompressedSize,
      crc32: entryCrc32,
    });

    cdOffset += 46 + fileNameLen + extraLen + commentLen;
  }

  return entries;
}

function buildZipArchive(entries: Map<string, ZipEntry>): Uint8Array {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const cdParts: Uint8Array[] = [];
  let localOffset = 0;

  for (const entry of entries.values()) {
    const nameBytes = encoder.encode(entry.name);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lView = new DataView(localHeader.buffer);
    lView.setUint32(0, 0x04034b50, true);
    lView.setUint16(4, 20, true);
    lView.setUint16(6, 0, true);
    lView.setUint16(8, entry.compressionMethod, true);
    lView.setUint16(10, 0, true);
    lView.setUint16(12, 0x21, true);
    lView.setUint32(14, entry.crc32, true);
    lView.setUint32(18, entry.compressedData.length, true);
    lView.setUint32(22, entry.uncompressedSize, true);
    lView.setUint16(26, nameBytes.length, true);
    lView.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, entry.compressedData);

    const cdHeader = new Uint8Array(46 + nameBytes.length);
    const cView = new DataView(cdHeader.buffer);
    cView.setUint32(0, 0x02014b50, true);
    cView.setUint16(4, 20, true);
    cView.setUint16(6, 20, true);
    cView.setUint16(8, 0, true);
    cView.setUint16(10, entry.compressionMethod, true);
    cView.setUint16(12, 0, true);
    cView.setUint16(14, 0x21, true);
    cView.setUint32(16, entry.crc32, true);
    cView.setUint32(20, entry.compressedData.length, true);
    cView.setUint32(24, entry.uncompressedSize, true);
    cView.setUint16(28, nameBytes.length, true);
    cView.setUint16(30, 0, true);
    cView.setUint16(32, 0, true);
    cView.setUint16(34, 0, true);
    cView.setUint16(36, 0, true);
    cView.setUint32(38, 0, true);
    cView.setUint32(42, localOffset, true);
    cdHeader.set(nameBytes, 46);

    cdParts.push(cdHeader);
    localOffset += localHeader.length + entry.compressedData.length;
  }

  let cdSize = 0;
  for (const part of cdParts) cdSize += part.length;

  const eocd = new Uint8Array(22);
  const eView = new DataView(eocd.buffer);
  eView.setUint32(0, 0x06054b50, true);
  eView.setUint16(4, 0, true);
  eView.setUint16(6, 0, true);
  eView.setUint16(8, entries.size, true);
  eView.setUint16(10, entries.size, true);
  eView.setUint32(12, cdSize, true);
  eView.setUint32(16, localOffset, true);
  eView.setUint16(20, 0, true);

  const totalSize = localOffset + cdSize + eocd.length;
  const out = new Uint8Array(totalSize);
  let pos = 0;
  for (const part of localParts) {
    out.set(part, pos);
    pos += part.length;
  }
  for (const part of cdParts) {
    out.set(part, pos);
    pos += part.length;
  }
  out.set(eocd, pos);
  return out;
}

async function getEntryText(entry: ZipEntry): Promise<string> {
  const bytes =
    entry.compressionMethod === 0
      ? entry.compressedData
      : await inflateRaw(entry.compressedData);
  return new TextDecoder("utf-8").decode(bytes);
}

async function setEntryText(
  entries: Map<string, ZipEntry>,
  name: string,
  text: string
): Promise<void> {
  const rawBytes = new TextEncoder().encode(text);
  const compressed = await deflateRaw(rawBytes);
  entries.set(name, {
    name,
    compressionMethod: 8,
    compressedData: compressed,
    uncompressedSize: rawBytes.length,
    crc32: crc32(rawBytes),
  });
}

function serializeXmlWithDecl(doc: Document): string {
  const serialized = new XMLSerializer().serializeToString(doc);
  if (serialized.startsWith("<?xml")) {
    return serialized;
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n${serialized}`;
}

// =========================================================================
// 2. DOM XML HELPERS
// =========================================================================

function safeText(str?: string | null, fallback = "---"): string {
  if (!str || str.trim() === "") return fallback;
  return str.trim();
}

function getDirectChildren(parent: Element, localName: string): Element[] {
  const out: Element[] = [];
  for (let i = 0; i < parent.childNodes.length; i++) {
    const node = parent.childNodes[i];
    if (node.nodeType === 1 && (node as Element).localName === localName) {
      out.push(node as Element);
    }
  }
  return out;
}

function setParagraphRuns(
  doc: Document,
  p: Element | undefined,
  runs: Array<{
    text: string;
    bold?: boolean;
    italic?: boolean;
    size?: number;
    color?: string;
  }>
): void {
  if (!p || p.localName !== "p") return;
  const toRemove: ChildNode[] = [];
  for (let i = 0; i < p.childNodes.length; i++) {
    const child = p.childNodes[i];
    if (child.nodeType !== 1 || (child as Element).localName !== "pPr") {
      toRemove.push(child);
    }
  }
  for (const node of toRemove) {
    p.removeChild(node);
  }

  for (const rSpec of runs) {
    const r = doc.createElementNS(W_NS, "w:r");
    const rPr = doc.createElementNS(W_NS, "w:rPr");
    const rFonts = doc.createElementNS(W_NS, "w:rFonts");
    rFonts.setAttributeNS(W_NS, "w:ascii", "Times New Roman");
    rFonts.setAttributeNS(W_NS, "w:hAnsi", "Times New Roman");
    rFonts.setAttributeNS(W_NS, "w:cs", "Times New Roman");
    rPr.appendChild(rFonts);

    if (rSpec.bold) {
      rPr.appendChild(doc.createElementNS(W_NS, "w:b"));
    }
    if (rSpec.italic) {
      rPr.appendChild(doc.createElementNS(W_NS, "w:i"));
    }
    if (rSpec.color) {
      const c = doc.createElementNS(W_NS, "w:color");
      c.setAttributeNS(W_NS, "w:val", rSpec.color);
      rPr.appendChild(c);
    }
    if (rSpec.size) {
      const sz = doc.createElementNS(W_NS, "w:sz");
      sz.setAttributeNS(W_NS, "w:val", String(rSpec.size));
      rPr.appendChild(sz);
      const szCs = doc.createElementNS(W_NS, "w:szCs");
      szCs.setAttributeNS(W_NS, "w:val", String(rSpec.size));
      rPr.appendChild(szCs);
    }
    r.appendChild(rPr);

    const t = doc.createElementNS(W_NS, "w:t");
    t.setAttribute("xml:space", "preserve");
    t.textContent = rSpec.text;
    r.appendChild(t);
    p.appendChild(r);
  }
}

function setCellText(
  doc: Document,
  tc: Element | undefined,
  text: string,
  options?: {
    bold?: boolean;
    italic?: boolean;
    align?: "left" | "center" | "right";
    color?: string;
    size?: number;
    bgColor?: string;
  }
): void {
  if (!tc) return;
  const ps = getDirectChildren(tc, "p");
  let p = ps[0];
  if (!p) {
    p = doc.createElementNS(W_NS, "w:p");
    tc.appendChild(p);
  }
  for (let i = 1; i < ps.length; i++) {
    tc.removeChild(ps[i]);
  }

  setParagraphRuns(doc, p, [
    {
      text,
      bold: options?.bold,
      italic: options?.italic,
      color: options?.color,
      size: options?.size,
    },
  ]);
}

function appendParagraphToCell(
  doc: Document,
  tc: Element | undefined,
  runs: Array<{
    text: string;
    bold?: boolean;
    italic?: boolean;
    size?: number;
    color?: string;
  }>
): void {
  if (!tc) return;
  const p = doc.createElementNS(W_NS, "w:p");
  tc.appendChild(p);
  setParagraphRuns(doc, p, runs);
}

// =========================================================================
// 3. MAIN TEMPLATE FILLER SERVICE
// =========================================================================

export async function generateDemandSmeDocxFromTemplate(
  input: DemandSurveyItem | DemandSmeSurveyRecord
): Promise<Blob> {
  const rec = input as any;

  // 1. Phân giải các trường cốt lõi
  const companyName = rec.companyName || rec.enterpriseName || "Doanh nghiệp";
  const taxCode = rec.taxCode || "";
  const surveyCode = rec.surveyCode || rec.id || "SUR-DEMAND";
  const province = rec.province || rec.provinceName || "Hà Nội";
  const address = rec.headquartersAddress || rec.address || "";
  const facility = rec.surveyedFacility || address || "";
  const contactName = rec.contactName || rec.contactPerson || "Đại diện Doanh nghiệp";
  const contactTitle = rec.contactTitle || "Phó Giám đốc Kỹ thuật";
  const contactPhone = rec.contactPhone || "";
  const contactEmail = rec.contactEmail || "";
  const businessType = rec.businessType || rec.ownershipType || "Công ty Cổ phần";
  const employeeScale = rec.employeeScale || rec.workforceScale || "50-199";
  const revenueScale = rec.revenueRange3y || rec.revenueScale || "10-50 tỷ VNĐ";

  // Parse ngày tháng nộp
  const subDate = rec.submittedAt ? new Date(rec.submittedAt) : new Date();
  const dayStr = String(subDate.getDate()).padStart(2, "0");
  const monthStr = String(subDate.getMonth() + 1).padStart(2, "0");
  const yearStr = String(subDate.getFullYear());

  // 2. Phân giải Bài toán công nghệ (First item or main demand)
  const firstItem = rec.items?.[0] || rec.demands?.[0] || {};
  const techName =
    firstItem.solutionName ||
    firstItem.title ||
    firstItem.problemDescription ||
    "Tự động hóa phát hiện khuyết tật bề mặt mối hàn bằng AI Vision";
  const techDesc =
    firstItem.solutionDescription ||
    firstItem.description ||
    "Tích hợp cánh tay robot gắn camera 3D và phần mềm AI nhận diện khuyết tật trên dây chuyền sản xuất";
  const budgetRange = firstItem.budgetRange || firstItem.budget || "1–5 tỷ đồng";
  const techGroup = firstItem.techGroupCode || firstItem.techGroup || "Cơ khí – chế tạo – công nghiệp hỗ trợ";
  const problemProcess = firstItem.processName || "Kiểm tra chất lượng ngoại quan và đóng gói";
  const problemDesc =
    firstItem.problemDescription ||
    firstItem.description ||
    "Tỷ lệ sản phẩm lỗi / phế phẩm còn cao, quy trình kiểm tra phụ thuộc nhân công thủ công";
  const expectedTarget =
    firstItem.expectedResults ||
    "Giảm tỷ lệ lỗi phế phẩm từ 4.5% xuống dưới 0.3%, tự động hóa 100% công đoạn kiểm tra, tiết kiệm 3 nhân công";

  // TNI Scores
  const kScore = Number(firstItem.urgencyScore ?? 4);
  const lScore = Number(firstItem.impactScore ?? 5);
  const nScore = Number(firstItem.investmentCapacity ?? 4);
  const oScore = Number(firstItem.adoptionReadiness ?? 4);
  const tniScore = Number(rec.tniScore ?? firstItem.tniScore ?? 86);

  // 3. Phân giải surveyDetails chuyên sâu
  const details = rec.surveyDetails || {};
  const machineryList = Array.isArray(details.machinery) ? details.machinery : [];
  const techRatings = details.techStatusRatings || {};
  const bottlenecks = details.bottlenecks || {};
  const workforce = details.workforce || {};
  const absorption = details.absorptionRatings || {};
  const directions = details.futureDirections || [];
  const partners = details.cooperationNeeds || [];

  // Nạp ZIP từ Template Base64
  const zipBytes = base64ToUint8Array(DEMAND_SME_TEMPLATE_BASE64);
  const entries = readZipEntries(zipBytes);
  const docXmlEntry = entries.get("word/document.xml");
  if (!docXmlEntry) {
    throw new Error("Tệp mẫu DOCX thiếu word/document.xml");
  }

  const xmlText = await getEntryText(docXmlEntry);
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");
  const body = doc.getElementsByTagNameNS(W_NS, "body")[0];
  if (!body) {
    throw new Error("Tệp DOCX thiếu w:body");
  }

  const tables = getDirectChildren(body, "tbl");
  if (tables.length < 20) {
    console.warn(`Template có ${tables.length} bảng, ít hơn 20 bảng tiêu chuẩn.`);
  }

  // =========================================================================
  // BẢNG 1: MÃ PHIẾU KHẢO SÁT & NGÀY LẬP
  // =========================================================================
  if (tables[1]) {
    const r0 = getDirectChildren(tables[1], "tr")[0];
    if (r0) {
      const c = getDirectChildren(r0, "tc");
      setCellText(doc, c[0], `Mã phiếu khảo sát: ${surveyCode}`, { bold: true });
      setCellText(doc, c[1], `Ngày lập phiếu: ${dayStr} / ${monthStr} / ${yearStr}`, {
        italic: true,
        align: "right",
      });
    }
  }

  // =========================================================================
  // BẢNG 3: CHI TIẾT BÀI TOÁN KỸ THUẬT (10 TIÊU CHÍ)
  // =========================================================================
  if (tables[3]) {
    const trs = getDirectChildren(tables[3], "tr");
    // Row 1: Tên công nghệ / thiết bị
    if (trs[1]) {
      const tc = getDirectChildren(trs[1], "tc")[0];
      setCellText(doc, tc, `1. Tên công nghệ / thiết bị: ${techName}`, { bold: true });
    }
    // Row 2: Mô tả chi tiết thêm về nhu cầu
    if (trs[2]) {
      const tc = getDirectChildren(trs[2], "tc")[0];
      setCellText(doc, tc, `2. Mô tả chi tiết thêm về nhu cầu: ${techDesc}`);
    }
    // Row 3: Ngân sách & Lĩnh vực
    if (trs[3]) {
      const tcs = getDirectChildren(trs[3], "tc");
      setCellText(
        doc,
        tcs[0],
        `3. Ngân sách dự kiến: ☑ ${budgetRange} (Đã phê duyệt nguồn vốn)`
      );
      setCellText(
        doc,
        tcs[1],
        `4. Lĩnh vực sản xuất: ☑ Cơ khí – chế tạo – công nghiệp hỗ trợ`
      );
    }
    // Row 4: Nhóm công nghệ
    if (trs[4]) {
      const tc = getDirectChildren(trs[4], "tc")[0];
      setCellText(
        doc,
        tc,
        `5. Nhóm công nghệ: ☑ Tự động hóa sản xuất & Trí tuệ nhân tạo (AI Vision) — ${techGroup}`
      );
    }
    // Row 5: Công đoạn có sự cố
    if (trs[5]) {
      const tc = getDirectChildren(trs[5], "tc")[0];
      setCellText(doc, tc, `6. Công đoạn sản xuất có sự cố / ách tắc: ${problemProcess}`);
    }
    // Row 6: Mô tả cụ thể vấn đề kỹ thuật / điểm nghẽn
    if (trs[6]) {
      const tc = getDirectChildren(trs[6], "tc")[0];
      setCellText(
        doc,
        tc,
        `7. Mô tả cụ thể vấn đề kỹ thuật / điểm nghẽn: ${problemDesc}`
      );
    }
    // Row 7: Mục tiêu kỹ thuật và kinh tế kỳ vọng
    if (trs[7]) {
      const tc = getDirectChildren(trs[7], "tc")[0];
      setCellText(
        doc,
        tc,
        `8. Mục tiêu kỹ thuật và kinh tế kỳ vọng: ${expectedTarget}`,
        { bold: true }
      );
    }
    // Row 8: Cần chuyên gia tư vấn & Loại hình tiếp nhận
    if (trs[8]) {
      const tcs = getDirectChildren(trs[8], "tc");
      setCellText(
        doc,
        tcs[0],
        `9. Cần chuyên gia tư vấn: ☑ Có nhu cầu tư vấn 1-1 từ chuyên gia Viện/Trường`
      );
      setCellText(
        doc,
        tcs[1],
        `10. Loại hình tiếp nhận: ☑ Đổi mới, cải tiến, nâng cấp dây chuyền hiện có kèm đào tạo chuyển giao`
      );
    }
  }

  // =========================================================================
  // BẢNG 4: CHỈ SỐ NHU CẦU ĐỔI MỚI (TNI)
  // =========================================================================
  if (tables[4]) {
    const trs = getDirectChildren(tables[4], "tr");
    const markLevel = (val: number) => {
      return [1, 2, 3, 4, 5]
        .map((lvl) => (lvl === val ? `【 ${lvl} 】` : `[ ${lvl} ]`))
        .join("  ");
    };

    if (trs[2]) {
      const tcs = getDirectChildren(trs[2], "tc");
      if (tcs[2]) setCellText(doc, tcs[2], markLevel(kScore), { bold: true });
    }
    if (trs[3]) {
      const tcs = getDirectChildren(trs[3], "tc");
      if (tcs[2]) setCellText(doc, tcs[2], markLevel(lScore), { bold: true });
    }
    if (trs[4]) {
      const tcs = getDirectChildren(trs[4], "tc");
      if (tcs[2]) setCellText(doc, tcs[2], markLevel(nScore), { bold: true });
    }
    if (trs[5]) {
      const tcs = getDirectChildren(trs[5], "tc");
      if (tcs[2]) setCellText(doc, tcs[2], markLevel(oScore), { bold: true });
    }
    // Row 6: TỔNG ĐIỂM TNI
    if (trs[6]) {
      const tcs = getDirectChildren(trs[6], "tc");
      if (tcs[0]) {
        setCellText(
          doc,
          tcs[0],
          `TỔNG ĐIỂM TNI: ${tniScore} / 100 điểm\n(K=${kScore}, L=${lScore}, N=${nScore}, O=${oScore})`,
          { bold: true, size: 22 }
        );
      }
      if (tcs[1]) {
        const clsLabel =
          tniScore >= 80
            ? "☑ Nhu cầu rất cao (80 – 100 điểm): Ưu tiên P0 Matching 24h"
            : tniScore >= 65
            ? "☑ Nhu cầu cao (65 – 79 điểm): Ưu tiên P1 Kết nối tự động"
            : "☑ Nhu cầu trung bình (50 – 64 điểm)";
        setCellText(doc, tcs[1], `Phân hạng Chỉ số đổi mới (TNI):\n${clsLabel}`, {
          bold: true,
        });
      }
    }
  }

  // =========================================================================
  // BẢNG 5: PHƯƠNG THỨC TIẾP NHẬN & CƠ CẤU VỐN
  // =========================================================================
  if (tables[5]) {
    const trs = getDirectChildren(tables[5], "tr");
    if (trs[1]) {
      const tcs = getDirectChildren(trs[1], "tc");
      setCellText(
        doc,
        tcs[0],
        `Nguồn vốn dự kiến đầu tư:\n☑ Vốn tự có của doanh nghiệp (70%)\n☑ Vay vốn ưu đãi / Quỹ Đổi mới công nghệ (30%)`
      );
      setCellText(
        doc,
        tcs[1],
        `Hình thức tiếp nhận công nghệ mong muốn:\n☑ Mua sắm máy móc thiết bị mới\n☑ Tiếp nhận chuyển giao bí quyết công nghệ & phần mềm`
      );
    }
  }

  // =========================================================================
  // BẢNG 6: THÔNG TIN DOANH NGHIỆP & QUY MÔ SẢN XUẤT
  // =========================================================================
  if (tables[6]) {
    const trs = getDirectChildren(tables[6], "tr");
    if (trs[1]) {
      const tcs = getDirectChildren(trs[1], "tc");
      setCellText(doc, tcs[0], `1. Tên Doanh nghiệp: ${companyName}`, { bold: true });
      setCellText(doc, tcs[1], `2. Mã số thuế (MST): ${taxCode}`, { bold: true });
    }
    if (trs[2]) {
      const tcs = getDirectChildren(trs[2], "tc");
      setCellText(doc, tcs[0], `3. Tỉnh / Thành phố: ${province}`);
      setCellText(doc, tcs[1], `4. Trụ sở chính: ${address}`);
    }
    if (trs[3]) {
      const tcs = getDirectChildren(trs[3], "tc");
      setCellText(doc, tcs[0], `5. Cơ sở khảo sát: ${facility}`);
      setCellText(doc, tcs[1], `6. Người cung cấp thông tin: ${contactName}`);
    }
    if (trs[4]) {
      const tcs = getDirectChildren(trs[4], "tc");
      setCellText(doc, tcs[0], `7. Chức vụ đại diện: ${contactTitle}`);
    }
    if (trs[5]) {
      const tcs = getDirectChildren(trs[5], "tc");
      setCellText(doc, tcs[0], `8. Điện thoại liên hệ: ${contactPhone}`);
      setCellText(doc, tcs[1], `9. Email: ${contactEmail}`);
    }
    if (trs[6]) {
      const tcs = getDirectChildren(trs[6], "tc");
      setCellText(
        doc,
        tcs[0],
        `10. Loại hình doanh nghiệp: ☑ ${businessType}    ☐ Doanh nghiệp tư nhân    ☐ Khác`
      );
    }
    if (trs[7]) {
      const tcs = getDirectChildren(trs[7], "tc");
      setCellText(
        doc,
        tcs[0],
        `11. Lĩnh vực sản xuất chính: Cơ khí chính xác, chế tạo khuôn mẫu & đúc áp lực chi tiết phụ tùng`
      );
    }
    if (trs[8]) {
      const tcs = getDirectChildren(trs[8], "tc");
      setCellText(
        doc,
        tcs[0],
        `12. Sản phẩm chủ lực hiện nay: Chi tiết đúc hợp kim nhôm, phôi cơ khí chính xác, khung kết cấu hàn công nghiệp`
      );
    }
    if (trs[9]) {
      const tcs = getDirectChildren(trs[9], "tc");
      setCellText(doc, tcs[0], `13. Quy mô lao động: ☑ ${employeeScale} lao động`);
      setCellText(doc, tcs[1], `14. Doanh thu bình quân 3 năm: ☑ ${revenueScale}`);
    }
  }

  // =========================================================================
  // BẢNG 8: DANH MỤC THIẾT BỊ & DÂY CHUYỀN SẢN XUẤT CHỦ LỰC
  // =========================================================================
  if (tables[8]) {
    const trs = getDirectChildren(tables[8], "tr");
    // Row 2: TT 01
    const m0 = machineryList[0] || {
      name: "Máy đúc áp lực buồng lạnh 650 tấn (Toyo)",
      year: "2021",
      origin: "Nhật Bản / G7",
      process: "Đúc phôi & gia công tinh",
      status: "Đang hoạt động tốt (50–80%)",
      output: "Phôi đúc nhôm chính xác",
    };
    if (trs[2]) {
      const tcs = getDirectChildren(trs[2], "tc");
      setCellText(doc, tcs[0], "01", { align: "center", bold: true });
      setCellText(doc, tcs[1], `Công đoạn: ${m0.process || "Đúc & Lắp ráp"}`);
      setCellText(doc, tcs[2], `Tên thiết bị: ${m0.name || m0.equipmentName}`, {
        bold: true,
      });
      setCellText(doc, tcs[3], `Sản phẩm đầu ra: ${m0.output || "Phôi đúc chi tiết"}`);
    }
    if (trs[3]) {
      const tcs = getDirectChildren(trs[3], "tc");
      setCellText(doc, tcs[1], `Năm đầu tư vận hành: ${m0.year || "2021"}`);
      setCellText(doc, tcs[2], `Xuất xứ: ${m0.origin || "Nhật Bản / G7"}`);
      setCellText(doc, tcs[3], `Tình trạng: ☑ ${m0.status || "Hoạt động tốt 50-80%"}`);
    }

    // Row 4 & 5: TT 02 (nếu có)
    const m1 = machineryList[1] || {
      name: "Trung tâm gia công phay CNC 5 trục DMG MORI",
      year: "2022",
      origin: "Đức / G7",
      process: "Gia công tinh bề mặt",
      status: "Mới >80%",
      output: "Chi tiết máy dung sai ±0.005mm",
    };
    if (trs[4]) {
      const tcs = getDirectChildren(trs[4], "tc");
      setCellText(doc, tcs[0], "02", { align: "center", bold: true });
      setCellText(doc, tcs[1], `Công đoạn: ${m1.process}`);
      setCellText(doc, tcs[2], `Tên thiết bị: ${m1.name}`, { bold: true });
      setCellText(doc, tcs[3], `Sản phẩm đầu ra: ${m1.output}`);
    }
    if (trs[5]) {
      const tcs = getDirectChildren(trs[5], "tc");
      setCellText(doc, tcs[1], `Năm đầu tư vận hành: ${m1.year}`);
      setCellText(doc, tcs[2], `Xuất xứ: ${m1.origin}`);
      setCellText(doc, tcs[3], `Tình trạng: ☑ ${m1.status}`);
    }
  }

  // =========================================================================
  // BẢNG 9: ĐÁNH GIÁ HIỆN TRẠNG TRÌNH ĐỘ CÔNG NGHỆ (8 TIÊU CHÍ)
  // =========================================================================
  if (tables[9]) {
    const trs = getDirectChildren(tables[9], "tr");
    const criteriaList = [
      { key: "productivity", default: 3 },
      { key: "quality", default: 4 },
      { key: "efficiency", default: 3 },
      { key: "automation", default: 3 },
      { key: "digitalization", default: 3 },
      { key: "safety", default: 4 },
      { key: "environment", default: 4 },
      { key: "compliance", default: 4 },
    ];
    criteriaList.forEach((crit, idx) => {
      const rIdx = idx + 2;
      if (trs[rIdx]) {
        const tcs = getDirectChildren(trs[rIdx], "tc");
        if (tcs[2]) {
          const val = Number(techRatings[crit.key] ?? crit.default);
          const dots = [1, 2, 3, 4, 5]
            .map((v) => (v === val ? `【 ${v} 】` : `[ ${v} ]`))
            .join("  ");
          setCellText(doc, tcs[2], dots, { bold: true });
        }
      }
    });
  }

  // =========================================================================
  // BẢNG 11: ĐIỂM NGHẼN CÔNG NGHỆ & KHÂU KHÓ KHĂN NHẤT
  // =========================================================================
  if (tables[11]) {
    const trs = getDirectChildren(tables[11], "tr");

    // 17 điểm nghẽn từ row 2 đến row 18:
    // Cột 0 (tcs[0]) là ô checkbox rất hẹp (w=0.8cm): Chỉ điền ký tự ☑ hoặc ☐
    // Cột 1 (tcs[1]) là tên điểm nghẽn: Giữ nguyên
    // Cột 2 (tcs[2]) là mức điểm: Khoanh tròn mức điểm nếu điểm nghẽn được nhận diện
    for (let r = 2; r <= 18; r++) {
      if (trs[r]) {
        const tcs = getDirectChildren(trs[r], "tc");
        if (tcs[0]) {
          let isChecked = false;
          let severity = 0;

          // Điểm 6: Tỷ lệ sản phẩm lỗi / phế phẩm còn cao (Mức 4/5) -> Row 7
          if (r === 7) {
            isChecked = true;
            severity = 4;
          }
          // Điểm 8: Thiếu tự động hóa, còn phụ thuộc nhân công thủ công (Mức 5/5) -> Row 9
          else if (r === 9) {
            isChecked = true;
            severity = 5;
          }
          // Điểm 12: Khó tiếp cận công nghệ mới, thiết bị tiên tiến (Mức 4/5) -> Row 13
          else if (r === 13) {
            isChecked = true;
            severity = 4;
          }

          if (isChecked) {
            setCellText(doc, tcs[0], "☑", { bold: true, align: "center", size: 22 });
            if (tcs[2]) {
              const dots = [1, 2, 3, 4, 5]
                .map((v) => (v === severity ? `【 ${v} 】` : `[ ${v} ]`))
                .join("  ");
              setCellText(doc, tcs[2], dots, { bold: true, align: "center" });
            }
          } else {
            setCellText(doc, tcs[0], "☐", { align: "center", size: 20 });
          }
        }
      }
    }

    // Row 19: Ô gộp toàn bộ chiều ngang ở cuối bảng dành cho Khâu khó khăn nhất & Nguyên nhân
    if (trs[19]) {
      const tcs = getDirectChildren(trs[19], "tc");
      const hardStep = bottlenecks.hardestStep || "Kiểm tra chất lượng ngoại quan và đóng gói";
      const cause =
        bottlenecks.cause ||
        "Thiếu hệ thống cảm biến quang học kiểm tra tự động và nhân lực lập trình AI";
      setCellText(
        doc,
        tcs[0],
        `Công đoạn sản xuất gây khó khăn lớn nhất: ${hardStep}\nNguyên nhân chủ yếu được xác định: ${cause}`,
        { bold: true }
      );
    }
  }

  // =========================================================================
  // BẢNG 13: THỐNG KÊ ĐỘI NGŨ NHÂN LỰC KỸ THUẬT
  // =========================================================================
  if (tables[13]) {
    const trs = getDirectChildren(tables[13], "tr");
    if (trs[2]) {
      const tcs = getDirectChildren(trs[2], "tc");
      setCellText(doc, tcs[0], `${workforce.technicians ?? 12} người`, {
        bold: true,
        align: "center",
      });
      setCellText(doc, tcs[1], `${workforce.engineers ?? 6} người`, {
        bold: true,
        align: "center",
      });
      setCellText(doc, tcs[2], `${workforce.it ?? 2} người`, {
        bold: true,
        align: "center",
      });
      setCellText(doc, tcs[3], `${workforce.automation ?? 3} người`, {
        bold: true,
        align: "center",
      });
      setCellText(doc, tcs[4], `${workforce.rd ?? 2} người`, {
        bold: true,
        align: "center",
      });
      setCellText(doc, tcs[5], `${workforce.qc ?? 4} người`, {
        bold: true,
        align: "center",
      });
    }
  }

  // =========================================================================
  // BẢNG 14: CƠ CHẾ QUẢN LÝ & ĐỔI MỚI CÔNG NGHỆ HIỆN CÓ
  // =========================================================================
  if (tables[14]) {
    const trs = getDirectChildren(tables[14], "tr");
    const flags = [
      rec.hasRdUnit ?? true,
      rec.hasTechTraining ?? true,
      rec.hasRdBudget ?? false,
      rec.hasMachineryUpgrade ?? true,
      rec.hasRdUnit ?? true,
      rec.inValueChain ?? true,
      rec.isExporting ?? true,
    ];
    flags.forEach((flag, idx) => {
      const rIdx = idx + 2;
      if (trs[rIdx]) {
        const tcs = getDirectChildren(trs[rIdx], "tc");
        if (tcs[2]) {
          setCellText(
            doc,
            tcs[2],
            flag ? "☑ Có    ☐ Không" : "☐ Có    ☑ Không",
            { bold: true }
          );
        }
      }
    });
  }

  // =========================================================================
  // BẢNG 15: ĐÁNH GIÁ NĂNG LỰC HẤP THỤ CÔNG NGHỆ (9 TIÊU CHÍ)
  // =========================================================================
  if (tables[15]) {
    const trs = getDirectChildren(tables[15], "tr");
    const absKeys = [
      "trendAwareness",
      "machineOperation",
      "maintenance",
      "improvement",
      "transferReadiness",
      "rdCapacity",
      "digitalAdoption",
      "dataManagement",
      "investmentWillingness",
    ];
    absKeys.forEach((key, idx) => {
      const rIdx = idx + 2;
      if (trs[rIdx]) {
        const tcs = getDirectChildren(trs[rIdx], "tc");
        if (tcs[2]) {
          const val = Number(absorption[key] ?? (idx % 2 === 0 ? 4 : 3));
          const dots = [1, 2, 3, 4, 5]
            .map((v) => (v === val ? `【 ${v} 】` : `[ ${v} ]`))
            .join("  ");
          setCellText(doc, tcs[2], dots, { bold: true });
        }
      }
    });
  }

  // =========================================================================
  // BẢNG 17: ĐỊNH HƯỚNG CÔNG NGHỆ GIAI ĐOẠN 2026–2028
  // =========================================================================
  if (tables[17]) {
    const trs = getDirectChildren(tables[17], "tr");
    if (trs[2]) {
      const tcs = getDirectChildren(trs[2], "tc");
      setCellText(
        doc,
        tcs[0],
        `☑ Tự động hóa dây chuyền sản xuất\n☑ Robot công nghiệp (AGV, Robot hàn)\n☑ Cảm biến thông minh & Chuẩn kết nối IoT\n☑ Hệ thống điều khiển tự động (PLC, SCADA)`
      );
      setCellText(
        doc,
        tcs[1],
        `☑ Phần mềm điều hành sản xuất tại xưởng (MES)\n☑ Hệ thống quản lý kho & chuỗi cung ứng (WMS)\n☑ Trí tuệ nhân tạo (AI Vision & Dự báo lỗi)`
      );
      setCellText(
        doc,
        tcs[2],
        `☑ Giải pháp tiết kiệm & sử dụng hiệu quả năng lượng\n☑ Hệ thống xử lý nước thải & tái sử dụng nước\n☑ Quy trình sản xuất sạch hơn (Cleaner Production)`
      );
    }
  }

  // =========================================================================
  // BẢNG 18: XÁC NHẬN THÔNG TIN & CAM KẾT BẢO MẬT (PDPD)
  // =========================================================================
  if (tables[18]) {
    const trs = getDirectChildren(tables[18], "tr");
    if (trs[1]) {
      const tcs = getDirectChildren(trs[1], "tc");
      setCellText(doc, tcs[0], `Họ và tên người đại diện: ${contactName}`, {
        bold: true,
      });
      setCellText(doc, tcs[1], `Chức vụ đại diện: ${contactTitle}`, { bold: true });
      setCellText(
        doc,
        tcs[2],
        `Ngày xác nhận: ${dayStr} / ${monthStr} / ${yearStr}`,
        { italic: true }
      );
    }
    if (trs[2]) {
      const tcs = getDirectChildren(trs[2], "tc");
      setCellText(
        doc,
        tcs[0],
        `☑ ĐÃ XÁC NHẬN CAM KẾT BẢO VỆ DỮ LIỆU CÁ NHÂN (PDPD - Nghị định 13/2023/NĐ-CP): Doanh nghiệp cam kết toàn bộ thông tin kê khai trên là hoàn toàn chính xác và ủy quyền cho Sở KH&CN / NacenTwin kết nối với các đối tác công nghệ.`
      );
    }
  }

  // =========================================================================
  // BẢNG 19: CHỮ KÝ ĐẠI DIỆN DOANH NGHIỆP
  // =========================================================================
  if (tables[19]) {
    const trs = getDirectChildren(tables[19], "tr");
    if (trs[0]) {
      const tcs = getDirectChildren(trs[0], "tc");
      setCellText(
        doc,
        tcs[0],
        `CÁN BỘ KHẢO SÁT / TƯ VẤN VIÊN\n(Ký và ghi rõ họ tên)\n\n\n\nNguyễn Văn Hoàng\n(Tư vấn viên ĐMST Cấp cao)`
      );
      setCellText(
        doc,
        tcs[1],
        `Hà Nội, ngày ${dayStr} tháng ${monthStr} năm ${yearStr}\nNGƯỜI ĐẠI DIỆN DOANH NGHIỆP XÁC NHẬN\n(Chữ ký điện tử / Ký tên, đóng dấu)\n\n\n\n${contactName}\n${contactTitle}`,
        { bold: true, align: "center" }
      );
    }
  }

  // Serialize lại XML và lưu vào zip
  const updatedDocXml = serializeXmlWithDecl(doc);
  await setEntryText(entries, "word/document.xml", updatedDocXml);

  const outZipBytes = buildZipArchive(entries);
  return new Blob([new Uint8Array(outZipBytes)], { type: DOCX_MIME_TYPE });
}
