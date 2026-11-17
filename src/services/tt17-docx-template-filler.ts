import {
  Tt17Assessment,
  Tt17SurveyData,
  CriterionScore,
  MachineryItem,
  INDUSTRY_BENCHMARKS,
} from "@/services/api/assessment-tt17";
import { TT17_OUT_TEMPLATE_BASE64 } from "./tt17-out-template-base64";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
const CT_NS = "http://schemas.openxmlformats.org/package/2006/content-types";
const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// =========================================================================
// 1. ZIP ARCHIVE READER & WRITER (Web CompressionStream / DecompressionStream)
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

async function deflateZlib(data: Uint8Array): Promise<Uint8Array> {
  return streamTransform(data, new CompressionStream("deflate"));
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

async function setEntryDeflatedBytes(
  entries: Map<string, ZipEntry>,
  name: string,
  rawBytes: Uint8Array
): Promise<void> {
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
// 2. PURE-TS 5-AXIS RADAR CHART PNG GENERATOR (word/media/radar_chart.png)
// =========================================================================

const BITMAP_FONT_5X7: Record<string, number[]> = {
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  "0": [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  "1": [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  "2": [0x0e, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1f],
  "3": [0x1f, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0e],
  "4": [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  "5": [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  "6": [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  "7": [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  "8": [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  "9": [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  ".": [0x00, 0x00, 0x00, 0x00, 0x00, 0x0c, 0x0c],
  "/": [0x01, 0x02, 0x02, 0x04, 0x08, 0x08, 0x10],
  "(": [0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02],
  ")": [0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08],
  " ": [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
};

function pointInPolygon(x: number, y: number, pts: Array<{ x: number; y: number }>): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x, yi = pts[i].y;
    const xj = pts[j].x, yj = pts[j].y;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export async function generateRadarChartPng(scores: {
  scoreT: number;
  scoreE: number;
  scoreO: number;
  scoreR: number;
  scoreI: number;
}): Promise<Uint8Array> {
  const width = 520;
  const height = 400;
  const pixels = new Uint8Array(width * height * 4);
  pixels.fill(255);

  const blendPixel = (
    ix: number,
    iy: number,
    r: number,
    g: number,
    b: number,
    alpha: number
  ) => {
    if (ix < 0 || ix >= width || iy < 0 || iy >= height || alpha <= 0) return;
    const idx = (iy * width + ix) * 4;
    const a = Math.min(1, Math.max(0, alpha));
    pixels[idx] = Math.round(pixels[idx] * (1 - a) + r * a);
    pixels[idx + 1] = Math.round(pixels[idx + 1] * (1 - a) + g * a);
    pixels[idx + 2] = Math.round(pixels[idx + 2] * (1 - a) + b * a);
    pixels[idx + 3] = 255;
  };

  const drawSegment = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    r: number,
    g: number,
    b: number,
    thickness = 1.5,
    dashed = false
  ) => {
    const pad = Math.ceil(thickness + 2);
    const minX = Math.max(0, Math.floor(Math.min(x0, x1) - pad));
    const maxX = Math.min(width - 1, Math.ceil(Math.max(x0, x1) + pad));
    const minY = Math.max(0, Math.floor(Math.min(y0, y1) - pad));
    const maxY = Math.min(height - 1, Math.ceil(Math.max(y0, y1) + pad));
    const dx = x1 - x0;
    const dy = y1 - y0;
    const lenSq = dx * dx + dy * dy || 1;
    const len = Math.sqrt(lenSq);
    const half = thickness / 2;

    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const t = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / lenSq));
        if (dashed && Math.floor((t * len) / 4) % 2 === 1) continue;
        const projX = x0 + t * dx;
        const projY = y0 + t * dy;
        const dist = Math.hypot(px - projX, py - projY);
        if (dist <= half + 0.7) {
          const alpha = dist <= half - 0.3 ? 1 : Math.max(0, half + 0.7 - dist);
          blendPixel(px, py, r, g, b, alpha);
        }
      }
    }
  };

  const drawCircle = (
    cx: number,
    cy: number,
    radius: number,
    fillR: number,
    fillG: number,
    fillB: number,
    strokeR: number,
    strokeG: number,
    strokeB: number,
    strokeWidth = 2
  ) => {
    const maxR = Math.ceil(radius + strokeWidth + 1);
    const icx = Math.round(cx);
    const icy = Math.round(cy);
    for (let oy = -maxR; oy <= maxR; oy++) {
      for (let ox = -maxR; ox <= maxR; ox++) {
        const d = Math.hypot(ox, oy);
        if (d <= radius) {
          blendPixel(icx + ox, icy + oy, fillR, fillG, fillB, 1);
        } else if (d <= radius + strokeWidth) {
          const a = Math.min(1, radius + strokeWidth - d + 0.5);
          blendPixel(icx + ox, icy + oy, strokeR, strokeG, strokeB, a);
        }
      }
    }
  };

  const drawText = (
    text: string,
    cx: number,
    cy: number,
    scale: number,
    r: number,
    g: number,
    b: number
  ) => {
    const charW = 6 * scale;
    const charH = 7 * scale;
    const startX = Math.round(cx - (text.length * charW) / 2);
    const startY = Math.round(cy - charH / 2);
    for (let i = 0; i < text.length; i++) {
      const glyph = BITMAP_FONT_5X7[text[i]] || BITMAP_FONT_5X7[" "];
      const baseX = startX + i * charW;
      for (let row = 0; row < 7; row++) {
        const bits = glyph[row];
        for (let col = 0; col < 5; col++) {
          if ((bits >> (4 - col)) & 1) {
            for (let sy = 0; sy < scale; sy++) {
              for (let sx = 0; sx < scale; sx++) {
                blendPixel(baseX + col * scale + sx, startY + row * scale + sy, r, g, b, 1);
              }
            }
          }
        }
      }
    }
  };

  const centerX = 260;
  const centerY = 205;
  const maxRadius = 128;

  const fmtScore = (v: number) =>
    Number.isInteger(v) ? String(v) : v.toFixed(1).replace(/\.0$/, "");

  const dimensions = [
    { key: "T", val: scores.scoreT || 0, max: 30, angle: 0 },
    { key: "E", val: scores.scoreE || 0, max: 20, angle: 72 },
    { key: "O", val: scores.scoreO || 0, max: 19, angle: 144 },
    { key: "R", val: scores.scoreR || 0, max: 17, angle: 216 },
    { key: "I", val: scores.scoreI || 0, max: 14, angle: 288 },
  ];

  const getCoord = (angleDeg: number, radius: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY + radius * Math.sin(rad),
    };
  };

  const outerPts = dimensions.map((d) => getCoord(d.angle, maxRadius));
  const dataPts = dimensions.map((d) => {
    const ratio = Math.min(1, Math.max(0.04, d.val / d.max));
    return getCoord(d.angle, ratio * maxRadius);
  });

  for (let y = Math.floor(centerY - maxRadius); y <= Math.ceil(centerY + maxRadius); y++) {
    for (let x = Math.floor(centerX - maxRadius); x <= Math.ceil(centerX + maxRadius); x++) {
      if (pointInPolygon(x, y, outerPts)) {
        blendPixel(x, y, 248, 250, 252, 1);
        if (pointInPolygon(x, y, dataPts)) {
          blendPixel(x, y, 16, 185, 129, 0.25);
        }
      }
    }
  }

  for (const level of [0.2, 0.4, 0.6, 0.8, 1.0]) {
    const pts = dimensions.map((d) => getCoord(d.angle, level * maxRadius));
    const isOuter = level === 1.0;
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      drawSegment(p1.x, p1.y, p2.x, p2.y, 203, 213, 225, isOuter ? 1.8 : 1.0, !isOuter);
    }
  }

  for (const pt of outerPts) {
    drawSegment(centerX, centerY, pt.x, pt.y, 203, 213, 225, 1.1, false);
  }

  for (let i = 0; i < dataPts.length; i++) {
    const p1 = dataPts[i];
    const p2 = dataPts[(i + 1) % dataPts.length];
    drawSegment(p1.x, p1.y, p2.x, p2.y, 5, 150, 105, 2.6, false);
  }

  for (const pt of dataPts) {
    drawCircle(pt.x, pt.y, 4.5, 5, 150, 105, 255, 255, 255, 2);
  }

  const labelOffsets = [
    { dx: 0, dy: -24 },
    { dx: 58, dy: -4 },
    { dx: 42, dy: 24 },
    { dx: -42, dy: 24 },
    { dx: -58, dy: -4 },
  ];
  dimensions.forEach((d, idx) => {
    const vPt = outerPts[idx];
    const lbl = `${d.key} (${fmtScore(d.val)}/${d.max})`;
    drawText(
      lbl,
      vPt.x + labelOffsets[idx].dx,
      vPt.y + labelOffsets[idx].dy,
      2,
      51,
      65,
      85
    );
  });

  const rawScanlines = new Uint8Array(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    rawScanlines[rowStart] = 0;
    rawScanlines.set(pixels.subarray(y * width * 4, (y + 1) * width * 4), rowStart + 1);
  }
  const idatPayload = await deflateZlib(rawScanlines);

  const makePngChunk = (type: string, data: Uint8Array): Uint8Array => {
    const chunk = new Uint8Array(12 + data.length);
    const v = new DataView(chunk.buffer);
    v.setUint32(0, data.length, false);
    for (let i = 0; i < 4; i++) chunk[4 + i] = type.charCodeAt(i);
    chunk.set(data, 8);
    const crc = crc32(chunk.subarray(4, 8 + data.length));
    v.setUint32(8 + data.length, crc, false);
    return chunk;
  };

  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, width, false);
  ihdrView.setUint32(4, height, false);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makePngChunk("IHDR", ihdr);
  const idatChunk = makePngChunk("IDAT", idatPayload);
  const iendChunk = makePngChunk("IEND", new Uint8Array(0));

  const png = new Uint8Array(
    signature.length + ihdrChunk.length + idatChunk.length + iendChunk.length
  );
  let offset = 0;
  for (const part of [signature, ihdrChunk, idatChunk, iendChunk]) {
    png.set(part, offset);
    offset += part.length;
  }
  return png;
}

// =========================================================================
// 3. XML HELPERS FOR MANIPULATING word/document.xml
// =========================================================================

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatVnd(val?: number): string {
  if (val === undefined || val === null || isNaN(val)) return "---";
  if (val === 0) return "0 VNĐ";
  return `${val.toLocaleString("vi-VN")} VNĐ`;
}

function formatNumber(val?: number, unit = ""): string {
  if (val === undefined || val === null || isNaN(val)) return "---";
  return `${val.toLocaleString("vi-VN")}${unit ? ` ${unit}` : ""}`;
}

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

const PPR_ORDER = [
  "pStyle",
  "keepNext",
  "keepLines",
  "pageBreakBefore",
  "framePr",
  "widowControl",
  "numPr",
  "suppressLineNumbers",
  "pBdr",
  "shd",
  "tabs",
  "suppressAutoHyphens",
  "kinsoku",
  "wordWrap",
  "overflowPunct",
  "topLinePunct",
  "autoSpaceDE",
  "autoSpaceDN",
  "bidi",
  "adjustRightInd",
  "snapToGrid",
  "spacing",
  "ind",
  "contextualSpacing",
  "mirrorIndents",
  "suppressOverlap",
  "jc",
  "textDirection",
  "textAlignment",
  "textboxTightWrap",
  "outlineLvl",
  "divId",
  "cnfStyle",
  "rPr",
  "sectPr",
  "pPrChange",
];

const TCPR_ORDER = [
  "cnfStyle",
  "tcW",
  "gridSpan",
  "hMerge",
  "vMerge",
  "tcBorders",
  "shd",
  "noWrap",
  "tcMar",
  "textDirection",
  "tcFitText",
  "vAlign",
  "hideMark",
  "headers",
  "cellIns",
  "cellDel",
  "cellMerge",
  "tcPrChange",
];

function insertChildInSchemaOrder(parent: Element, newEl: Element, order: string[]): void {
  const newIdx = order.indexOf(newEl.localName);
  if (newIdx === -1) {
    parent.appendChild(newEl);
    return;
  }
  for (let i = 0; i < parent.childNodes.length; i++) {
    const child = parent.childNodes[i];
    if (child.nodeType === 1) {
      const childIdx = order.indexOf((child as Element).localName);
      if (childIdx !== -1 && childIdx > newIdx) {
        parent.insertBefore(newEl, child);
        return;
      }
    }
  }
  parent.appendChild(newEl);
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
  if (!p || p.localName !== "p") {
    return;
  }
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
  tc: Element,
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
  if (options?.bgColor) {
    let tcPr = getDirectChildren(tc, "tcPr")[0];
    if (!tcPr) {
      tcPr = doc.createElementNS(W_NS, "w:tcPr");
      tc.insertBefore(tcPr, tc.firstChild);
    }
    for (const oldShd of getDirectChildren(tcPr, "shd")) {
      tcPr.removeChild(oldShd);
    }
    const shd = doc.createElementNS(W_NS, "w:shd");
    shd.setAttributeNS(W_NS, "w:val", "clear");
    shd.setAttributeNS(W_NS, "w:color", "auto");
    shd.setAttributeNS(W_NS, "w:fill", options.bgColor);
    insertChildInSchemaOrder(tcPr, shd, TCPR_ORDER);
  }

  const ps = getDirectChildren(tc, "p");
  let p = ps[0];
  if (!p) {
    p = doc.createElementNS(W_NS, "w:p");
    tc.appendChild(p);
  }
  for (let i = 1; i < ps.length; i++) {
    tc.removeChild(ps[i]);
  }

  if (options?.align) {
    let pPr = getDirectChildren(p, "pPr")[0];
    if (!pPr) {
      pPr = doc.createElementNS(W_NS, "w:pPr");
      p.insertBefore(pPr, p.firstChild);
    }
    for (const oldJc of getDirectChildren(pPr, "jc")) {
      pPr.removeChild(oldJc);
    }
    const jc = doc.createElementNS(W_NS, "w:jc");
    jc.setAttributeNS(W_NS, "w:val", options.align);
    insertChildInSchemaOrder(pPr, jc, PPR_ORDER);
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

function setTableRowCells(
  doc: Document,
  tr: Element,
  values: string[],
  options?: {
    boldCols?: number[];
    aligns?: Array<"left" | "center" | "right">;
    bgColors?: Array<string | undefined>;
  }
): void {
  const tcs = getDirectChildren(tr, "tc");
  for (let i = 0; i < Math.min(tcs.length, values.length); i++) {
    setCellText(doc, tcs[i], values[i], {
      bold: options?.boldCols?.includes(i),
      align: options?.aligns?.[i],
      bgColor: options?.bgColors?.[i],
    });
  }
}

function setCheckboxesInElement(doc: Document, container: Element, checkedFlags: boolean[]): void {
  const checkBoxes = container.getElementsByTagNameNS(W_NS, "checkBox");
  for (let i = 0; i < Math.min(checkBoxes.length, checkedFlags.length); i++) {
    const cb = checkBoxes[i];
    const isChecked = checkedFlags[i];
    const defaults = cb.getElementsByTagNameNS(W_NS, "default");
    if (defaults.length > 0) {
      defaults[0].setAttributeNS(W_NS, "w:val", isChecked ? "1" : "0");
    } else {
      const defEl = doc.createElementNS(W_NS, "w:default");
      defEl.setAttributeNS(W_NS, "w:val", isChecked ? "1" : "0");
      cb.appendChild(defEl);
    }
    const existingChecked = cb.getElementsByTagNameNS(W_NS, "checked");
    while (existingChecked.length > 0) {
      existingChecked[0].parentNode?.removeChild(existingChecked[0]);
    }
    if (isChecked) {
      const chkEl = doc.createElementNS(W_NS, "w:checked");
      chkEl.setAttributeNS(W_NS, "w:val", "1");
      cb.appendChild(chkEl);
    }
  }
}

// =========================================================================
// 4. IMAGE 2 VISUAL SUMMARY BLOCKS (CLASSIFICATION + RADAR + BOTTLENECKS)
// =========================================================================

function getClassificationMeta(cls?: string, label?: string) {
  switch (cls) {
    case "TIEN_TIEN":
      return {
        badgeText: (label || "TIÊN TIẾN").toUpperCase(),
        bannerBg: "ECFDF5",
        bannerBorder: "6EE7B7",
        pillBg: "059669",
        pillText: "FFFFFF",
        scoreColor: "047857",
        desc: "Đạt trình độ công nghệ tiên tiến (Tổng điểm ≥ 75 & Hệ số đồng bộ ≥ 0.65). Doanh nghiệp sở hữu dây chuyền tự động hóa cao, làm chủ công nghệ và có năng lực R&D vượt trội.",
      };
    case "TRUNG_BINH_TIEN_TIEN":
      return {
        badgeText: (label || "TRUNG BÌNH TIÊN TIẾN").toUpperCase(),
        bannerBg: "F0FDFA",
        bannerBorder: "5EEAD4",
        pillBg: "0D9488",
        pillText: "FFFFFF",
        scoreColor: "0F766E",
        desc: "Đạt trình độ trung bình tiên tiến (Tổng điểm 60 - <75 & Hệ số đồng bộ ≥ 0.50). Thiết bị hiện đại và năng suất tốt nhưng cần thúc đẩy hơn ở mảng tài sản trí tuệ và sáng kiến.",
      };
    case "TRUNG_BINH":
      return {
        badgeText: (label || "TRUNG BÌNH").toUpperCase(),
        bannerBg: "FFFBEB",
        bannerBorder: "FCD34D",
        pillBg: "D97706",
        pillText: "FFFFFF",
        scoreColor: "B45309",
        desc: "Đạt trình độ trung bình (Tổng điểm 35 - <60 & Hệ số đồng bộ ≥ 0.30). Cần hiện đại hóa thiết bị công nghệ và đào tạo chuyên sâu nhân lực kỹ thuật.",
      };
    case "CAN_THAM_DINH":
      return {
        badgeText: (label || "CẦN THẨM ĐỊNH").toUpperCase(),
        bannerBg: "FFFBEB",
        bannerBorder: "FCD34D",
        pillBg: "D97706",
        pillText: "FFFFFF",
        scoreColor: "B45309",
        desc: "Lệch pha đồng bộ công nghệ (Điểm tổng cao nhưng Hệ số đồng bộ T_ĐB thấp). Cần Ban Cố vấn Kỹ thuật Hiệp hội BACLINK thẩm định trực tiếp dây chuyền thực tế.",
      };
    default:
      return {
        badgeText: (label || "LẠC HẬU").toUpperCase(),
        bannerBg: "FFF1F2",
        bannerBorder: "FDA4AF",
        pillBg: "E11D48",
        pillText: "FFFFFF",
        scoreColor: "BE123C",
        desc: "Trình độ công nghệ lạc hậu (Tổng điểm < 35 hoặc Hệ số đồng bộ < 0.30). Cần thay thế cấp bách dây chuyền lạc hậu để tránh rủi ro tiêu hao năng lượng và ô nhiễm.",
      };
  }
}

function buildVisualSummaryXmlFragments(
  assessment: Tt17Assessment,
  radarRelId: string
): string {
  const score = assessment.scoreResult;
  const clsMeta = getClassificationMeta(score?.classification, score?.classificationLabel);
  const fmtNum = (n?: number) => {
    if (n === undefined || n === null || isNaN(n)) return "0";
    return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");
  };
  const totalScoreStr = fmtNum(score?.totalScore ?? 0);
  const syncCoeffStr =
    score?.syncCoefficient !== undefined && score?.syncCoefficient !== null
      ? Number(score.syncCoefficient).toFixed(2)
      : "0.00";

  const compItems = [
    { label: "Nhóm T - Thiết bị", val: score?.scoreT ?? 0, max: 30 },
    { label: "Nhóm E - Hiệu quả", val: score?.scoreE ?? 0, max: 20 },
    { label: "Nhóm O - Tổ chức", val: score?.scoreO ?? 0, max: 19 },
    { label: "Nhóm R - Năng lực R&D", val: score?.scoreR ?? 0, max: 17 },
    { label: "Nhóm I - Đổi mới ST", val: score?.scoreI ?? 0, max: 14 },
  ];

  const componentCellsXml = compItems
    .map((item) => {
      const pct = Math.min(100, Math.max(4, Math.round((item.val / item.max) * 100)));
      const rem = Math.max(1, 100 - pct);
      const pctDxa = Math.round((pct / 100) * 1400);
      const remDxa = Math.max(20, 1400 - pctDxa);
      return `
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="1000" w:type="pct"/>
            <w:tcBorders>
              <w:top w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
              <w:left w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
              <w:bottom w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
              <w:right w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
            </w:tcBorders>
            <w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/>
            <w:tcMar>
              <w:top w:w="100" w:type="dxa"/>
              <w:left w:w="120" w:type="dxa"/>
              <w:bottom w:w="100" w:type="dxa"/>
              <w:right w:w="120" w:type="dxa"/>
            </w:tcMar>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:before="20" w:after="40"/></w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                <w:color w:val="475569"/>
                <w:sz w:val="18"/>
              </w:rPr>
              <w:t>${escapeXml(item.label)}</w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:pPr><w:spacing w:before="0" w:after="60"/></w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                <w:b/>
                <w:color w:val="0F172A"/>
                <w:sz w:val="24"/>
              </w:rPr>
              <w:t xml:space="preserve">${escapeXml(fmtNum(item.val))} </w:t>
            </w:r>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                <w:color w:val="64748B"/>
                <w:sz w:val="18"/>
              </w:rPr>
              <w:t>/${item.max}</w:t>
            </w:r>
          </w:p>
          <w:tbl>
            <w:tblPr>
              <w:tblW w:w="5000" w:type="pct"/>
              <w:tblBorders>
                <w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/>
                <w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>
                <w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/>
                <w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>
                <w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/>
                <w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>
              </w:tblBorders>
            </w:tblPr>
            <w:tblGrid>
              <w:gridCol w:w="${pctDxa}"/>
              <w:gridCol w:w="${remDxa}"/>
            </w:tblGrid>
            <w:tr>
              <w:trPr><w:trHeight w:val="70" w:hRule="exact"/></w:trPr>
              <w:tc>
                <w:tcPr>
                  <w:tcW w:w="${pct * 50}" w:type="pct"/>
                  <w:shd w:val="clear" w:color="auto" w:fill="059669"/>
                </w:tcPr>
                <w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="40" w:lineRule="exact"/></w:pPr></w:p>
              </w:tc>
              <w:tc>
                <w:tcPr>
                  <w:tcW w:w="${rem * 50}" w:type="pct"/>
                  <w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/>
                </w:tcPr>
                <w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="40" w:lineRule="exact"/></w:pPr></w:p>
              </w:tc>
            </w:tr>
          </w:tbl>
          <w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p>
        </w:tc>`;
    })
    .join("");

  const bottlenecks: CriterionScore[] = (score?.criteria || []).filter((c) => c.isBottleneck);
  const bottleneckBodyXml =
    bottlenecks.length === 0
      ? `
        <w:tbl>
          <w:tblPr>
            <w:tblW w:w="5000" w:type="pct"/>
            <w:tblBorders>
              <w:top w:val="single" w:sz="6" w:space="0" w:color="A7F3D0"/>
              <w:left w:val="single" w:sz="6" w:space="0" w:color="A7F3D0"/>
              <w:bottom w:val="single" w:sz="6" w:space="0" w:color="A7F3D0"/>
              <w:right w:val="single" w:sz="6" w:space="0" w:color="A7F3D0"/>
            </w:tblBorders>
            <w:shd w:val="clear" w:color="auto" w:fill="ECFDF5"/>
          </w:tblPr>
          <w:tblGrid>
            <w:gridCol w:w="4500"/>
          </w:tblGrid>
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:tcW w:w="5000" w:type="pct"/>
                <w:shd w:val="clear" w:color="auto" w:fill="ECFDF5"/>
                <w:tcMar>
                  <w:top w:w="360" w:type="dxa"/>
                  <w:left w:w="200" w:type="dxa"/>
                  <w:bottom w:w="360" w:type="dxa"/>
                  <w:right w:w="200" w:type="dxa"/>
                </w:tcMar>
              </w:tcPr>
              <w:p>
                <w:pPr><w:spacing w:before="40" w:after="60"/><w:jc w:val="center"/></w:pPr>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:color w:val="059669"/>
                    <w:sz w:val="32"/>
                  </w:rPr>
                  <w:t>✓</w:t>
                </w:r>
              </w:p>
              <w:p>
                <w:pPr><w:spacing w:before="20" w:after="60"/><w:jc w:val="center"/></w:pPr>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:color w:val="065F46"/>
                    <w:sz w:val="22"/>
                  </w:rPr>
                  <w:t>Không có điểm nghẽn nghiêm trọng</w:t>
                </w:r>
              </w:p>
              <w:p>
                <w:pPr><w:spacing w:before="0" w:after="40"/><w:jc w:val="center"/></w:pPr>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:color w:val="047857"/>
                    <w:sz w:val="19"/>
                  </w:rPr>
                  <w:t>Dây chuyền và các chỉ số vận hành của doanh nghiệp đều đạt từ mức 40% trở lên.</w:t>
                </w:r>
              </w:p>
            </w:tc>
          </w:tr>
        </w:tbl>`
      : bottlenecks
          .map((bn) => {
            const pct = Math.round((bn.achievedScore / (bn.maxScore || 1)) * 100);
            return `
              <w:p>
                <w:pPr><w:spacing w:before="60" w:after="30"/></w:pPr>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:color w:val="9F1239"/>
                    <w:sz w:val="19"/>
                    <w:shd w:val="clear" w:color="auto" w:fill="FECDD3"/>
                  </w:rPr>
                  <w:t xml:space="preserve"> ${escapeXml(bn.code)} </w:t>
                </w:r>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:color w:val="1E293B"/>
                    <w:sz w:val="19"/>
                  </w:rPr>
                  <w:t xml:space="preserve">  ${escapeXml(bn.name)} </w:t>
                </w:r>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:color w:val="BE123C"/>
                    <w:sz w:val="18"/>
                  </w:rPr>
                  <w:t>— Đạt: ${bn.achievedScore}/${bn.maxScore}đ (${pct}%)</w:t>
                </w:r>
              </w:p>
              <w:p>
                <w:pPr><w:spacing w:before="0" w:after="60"/></w:pPr>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:b/>
                    <w:color w:val="334155"/>
                    <w:sz w:val="18"/>
                  </w:rPr>
                  <w:t xml:space="preserve">Khuyến nghị: </w:t>
                </w:r>
                <w:r>
                  <w:rPr>
                    <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                    <w:color w:val="475569"/>
                    <w:sz w:val="18"/>
                  </w:rPr>
                  <w:t>${escapeXml(bn.recommendation || "Ưu tiên nâng cấp công nghệ và cải tiến thiết bị dây chuyền.")}</w:t>
                </w:r>
              </w:p>`;
          })
          .join("");

  return `
    <w:tbl xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
           xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
           xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
           xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
           xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="8" w:space="0" w:color="${clsMeta.bannerBorder}"/>
          <w:left w:val="single" w:sz="8" w:space="0" w:color="${clsMeta.bannerBorder}"/>
          <w:bottom w:val="single" w:sz="8" w:space="0" w:color="${clsMeta.bannerBorder}"/>
          <w:right w:val="single" w:sz="8" w:space="0" w:color="${clsMeta.bannerBorder}"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="${clsMeta.bannerBorder}"/>
          <w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>
        </w:tblBorders>
        <w:shd w:val="clear" w:color="auto" w:fill="${clsMeta.bannerBg}"/>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="6100"/>
        <w:gridCol w:w="3100"/>
      </w:tblGrid>
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="3300" w:type="pct"/>
            <w:shd w:val="clear" w:color="auto" w:fill="${clsMeta.bannerBg}"/>
            <w:tcMar>
              <w:top w:w="140" w:type="dxa"/>
              <w:left w:w="180" w:type="dxa"/>
              <w:bottom w:w="140" w:type="dxa"/>
              <w:right w:w="140" w:type="dxa"/>
            </w:tcMar>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:before="20" w:after="80"/></w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                <w:b/>
                <w:color w:val="64748B"/>
                <w:sz w:val="19"/>
              </w:rPr>
              <w:t xml:space="preserve">KẾT LUẬN XẾP LOẠI   </w:t>
            </w:r>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                <w:b/>
                <w:color w:val="${clsMeta.pillText}"/>
                <w:sz w:val="19"/>
                <w:shd w:val="clear" w:color="auto" w:fill="${clsMeta.pillBg}"/>
              </w:rPr>
              <w:t xml:space="preserve">  ${escapeXml(clsMeta.badgeText)}  </w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:pPr><w:spacing w:before="0" w:after="40"/></w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                <w:color w:val="334155"/>
                <w:sz w:val="20"/>
              </w:rPr>
              <w:t>${escapeXml(clsMeta.desc)}</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="1700" w:type="pct"/>
            <w:shd w:val="clear" w:color="auto" w:fill="${clsMeta.bannerBg}"/>
            <w:tcMar>
              <w:top w:w="140" w:type="dxa"/>
              <w:left w:w="100" w:type="dxa"/>
              <w:bottom w:w="140" w:type="dxa"/>
              <w:right w:w="180" w:type="dxa"/>
            </w:tcMar>
            <w:vAlign w:val="center"/>
          </w:tcPr>
          <w:tbl>
            <w:tblPr>
              <w:tblW w:w="5000" w:type="pct"/>
              <w:tblBorders>
                <w:top w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
                <w:left w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
                <w:bottom w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
                <w:right w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
                <w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/>
                <w:insideV w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
              </w:tblBorders>
              <w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/>
            </w:tblPr>
            <w:tblGrid>
              <w:gridCol w:w="1400"/>
              <w:gridCol w:w="1400"/>
            </w:tblGrid>
            <w:tr>
              <w:tc>
                <w:tcPr>
                  <w:tcW w:w="2500" w:type="pct"/>
                  <w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/>
                  <w:tcMar>
                    <w:top w:w="100" w:type="dxa"/>
                    <w:left w:w="100" w:type="dxa"/>
                    <w:bottom w:w="100" w:type="dxa"/>
                    <w:right w:w="100" w:type="dxa"/>
                  </w:tcMar>
                </w:tcPr>
                <w:p>
                  <w:pPr><w:spacing w:before="0" w:after="40"/><w:jc w:val="center"/></w:pPr>
                  <w:r>
                    <w:rPr>
                      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                      <w:b/>
                      <w:color w:val="64748B"/>
                      <w:sz w:val="17"/>
                    </w:rPr>
                    <w:t>ĐIỂM TỔNG (T)</w:t>
                  </w:r>
                </w:p>
                <w:p>
                  <w:pPr><w:spacing w:before="0" w:after="0"/><w:jc w:val="center"/></w:pPr>
                  <w:r>
                    <w:rPr>
                      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                      <w:b/>
                      <w:color w:val="${clsMeta.scoreColor}"/>
                      <w:sz w:val="32"/>
                    </w:rPr>
                    <w:t xml:space="preserve">${escapeXml(totalScoreStr)} </w:t>
                  </w:r>
                  <w:r>
                    <w:rPr>
                      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                      <w:color w:val="64748B"/>
                      <w:sz w:val="18"/>
                    </w:rPr>
                    <w:t>/ 100</w:t>
                  </w:r>
                </w:p>
              </w:tc>
              <w:tc>
                <w:tcPr>
                  <w:tcW w:w="2500" w:type="pct"/>
                  <w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/>
                  <w:tcMar>
                    <w:top w:w="100" w:type="dxa"/>
                    <w:left w:w="100" w:type="dxa"/>
                    <w:bottom w:w="100" w:type="dxa"/>
                    <w:right w:w="100" w:type="dxa"/>
                  </w:tcMar>
                </w:tcPr>
                <w:p>
                  <w:pPr><w:spacing w:before="0" w:after="40"/><w:jc w:val="center"/></w:pPr>
                  <w:r>
                    <w:rPr>
                      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                      <w:b/>
                      <w:color w:val="64748B"/>
                      <w:sz w:val="17"/>
                    </w:rPr>
                    <w:t>HỆ SỐ ĐỒNG BỘ (T_ĐB)</w:t>
                  </w:r>
                </w:p>
                <w:p>
                  <w:pPr><w:spacing w:before="0" w:after="0"/><w:jc w:val="center"/></w:pPr>
                  <w:r>
                    <w:rPr>
                      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                      <w:b/>
                      <w:color w:val="1E293B"/>
                      <w:sz w:val="32"/>
                    </w:rPr>
                    <w:t>${escapeXml(syncCoeffStr)}</w:t>
                  </w:r>
                </w:p>
              </w:tc>
            </w:tr>
          </w:tbl>
          <w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="5000" w:type="pct"/>
            <w:gridSpan w:val="2"/>
            <w:shd w:val="clear" w:color="auto" w:fill="${clsMeta.bannerBg}"/>
            <w:tcMar>
              <w:top w:w="120" w:type="dxa"/>
              <w:left w:w="160" w:type="dxa"/>
              <w:bottom w:w="140" w:type="dxa"/>
              <w:right w:w="160" w:type="dxa"/>
            </w:tcMar>
          </w:tcPr>
          <w:tbl>
            <w:tblPr>
              <w:tblW w:w="5000" w:type="pct"/>
              <w:tblCellSpacing w:w="40" w:type="dxa"/>
            </w:tblPr>
            <w:tblGrid>
              <w:gridCol w:w="1750"/>
              <w:gridCol w:w="1750"/>
              <w:gridCol w:w="1750"/>
              <w:gridCol w:w="1750"/>
              <w:gridCol w:w="1750"/>
            </w:tblGrid>
            <w:tr>${componentCellsXml}</w:tr>
          </w:tbl>
          <w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
    <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:pPr><w:spacing w:before="80" w:after="80"/></w:pPr>
    </w:p>
    <w:tbl xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
           xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
           xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
           xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
           xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/>
          <w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>
          <w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/>
          <w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>
          <w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/>
          <w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="4140"/>
        <w:gridCol w:w="180"/>
        <w:gridCol w:w="4880"/>
      </w:tblGrid>
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="2250" w:type="pct"/>
            <w:tcBorders>
              <w:top w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
              <w:left w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
              <w:bottom w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
              <w:right w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
            </w:tcBorders>
            <w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/>
            <w:tcMar>
              <w:top w:w="140" w:type="dxa"/>
              <w:left w:w="160" w:type="dxa"/>
              <w:bottom w:w="140" w:type="dxa"/>
              <w:right w:w="160" w:type="dxa"/>
            </w:tcMar>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:before="0" w:after="60"/></w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                <w:b/>
                <w:color w:val="1E293B"/>
                <w:sz w:val="21"/>
              </w:rPr>
              <w:t xml:space="preserve">Biểu Đồ Radar 5 Nhóm Thành Phần   </w:t>
            </w:r>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                <w:color w:val="64748B"/>
                <w:sz w:val="17"/>
              </w:rPr>
              <w:t>(Chuẩn hóa 5 trục)</w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:pPr><w:spacing w:before="40" w:after="40"/><w:jc w:val="center"/></w:pPr>
            <w:r>
              <w:drawing>
                <wp:inline distT="0" distB="0" distL="0" distR="0">
                  <wp:extent cx="2600000" cy="2000000"/>
                  <wp:effectExtent l="0" t="0" r="0" b="0"/>
                  <wp:docPr id="901" name="Radar Chart 5 Nhom"/>
                  <wp:cNvGraphicFramePr>
                    <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
                  </wp:cNvGraphicFramePr>
                  <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                    <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                      <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                        <pic:nvPicPr>
                          <pic:cNvPr id="901" name="radar_chart.png"/>
                          <pic:cNvPicPr/>
                        </pic:nvPicPr>
                        <pic:blipFill>
                          <a:blip r:embed="${radarRelId}"/>
                          <a:stretch><a:fillRect/></a:stretch>
                        </pic:blipFill>
                        <pic:spPr>
                          <a:xfrm>
                            <a:off x="0" y="0"/>
                            <a:ext cx="2600000" cy="2000000"/>
                          </a:xfrm>
                          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                        </pic:spPr>
                      </pic:pic>
                    </a:graphicData>
                  </a:graphic>
                </wp:inline>
              </w:drawing>
            </w:r>
          </w:p>
          <w:p>
            <w:pPr><w:spacing w:before="40" w:after="0"/><w:jc w:val="center"/></w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                <w:color w:val="64748B"/>
                <w:sz w:val="17"/>
              </w:rPr>
              <w:t>Màu xanh biểu thị vùng năng lực hiện tại của doanh nghiệp so với chuẩn 100%.</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="100" w:type="pct"/>
          </w:tcPr>
          <w:p/>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="2650" w:type="pct"/>
            <w:tcBorders>
              <w:top w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
              <w:left w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
              <w:bottom w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
              <w:right w:val="single" w:sz="6" w:space="0" w:color="E2E8F0"/>
            </w:tcBorders>
            <w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/>
            <w:tcMar>
              <w:top w:w="140" w:type="dxa"/>
              <w:left w:w="160" w:type="dxa"/>
              <w:bottom w:w="140" w:type="dxa"/>
              <w:right w:w="160" w:type="dxa"/>
            </w:tcMar>
          </w:tcPr>
          <w:p>
            <w:pPr><w:spacing w:before="0" w:after="40"/></w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                <w:b/>
                <w:color w:val="F43F5E"/>
                <w:sz w:val="20"/>
              </w:rPr>
              <w:t xml:space="preserve">● </w:t>
            </w:r>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                <w:b/>
                <w:color w:val="1E293B"/>
                <w:sz w:val="21"/>
              </w:rPr>
              <w:t xml:space="preserve">Chuẩn Đoán Điểm Nghẽn Công Nghệ &amp; Khuyến Nghị Nâng Cấp   </w:t>
            </w:r>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                <w:b/>
                <w:color w:val="9F1239"/>
                <w:sz w:val="17"/>
                <w:shd w:val="clear" w:color="auto" w:fill="FFE4E6"/>
              </w:rPr>
              <w:t xml:space="preserve"> ${bottlenecks.length} điểm nghẽn </w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:pPr>
              <w:pBdr>
                <w:bottom w:val="single" w:sz="4" w:space="6" w:color="E2E8F0"/>
              </w:pBdr>
              <w:spacing w:before="0" w:after="120"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
                <w:color w:val="64748B"/>
                <w:sz w:val="17"/>
              </w:rPr>
              <w:t>Các tiêu chí đạt dưới 40% điểm tối đa cần ưu tiên tìm kiếm giải pháp chuyển giao hoặc tư vấn</w:t>
            </w:r>
          </w:p>
          ${bottleneckBodyXml}
          <w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
    <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:pPr><w:spacing w:before="100" w:after="100"/></w:pPr>
    </w:p>
  `;
}

// =========================================================================
// 5. CACHED TEMPLATE LOADER & MAIN FILLER FOR phieu_thu_thap_tt17_out.docx
// =========================================================================

interface CachedTemplateBundle {
  baseEntries: Map<string, ZipEntry>;
  baseDoc: Document;
}

let cachedBundlePromise: Promise<CachedTemplateBundle> | null = null;

async function getCachedTemplateBundle(): Promise<CachedTemplateBundle> {
  if (!cachedBundlePromise) {
    cachedBundlePromise = (async () => {
      const zipBytes = base64ToUint8Array(TT17_OUT_TEMPLATE_BASE64);
      const baseEntries = readZipEntries(zipBytes);
      const parser = new DOMParser();

      // Pre-update [Content_Types].xml with png extension once
      const ctEntry = baseEntries.get("[Content_Types].xml");
      if (ctEntry) {
        const ctXml = await getEntryText(ctEntry);
        const ctDoc = parser.parseFromString(ctXml, "application/xml");
        const typesRoot = ctDoc.documentElement;
        const defaults = typesRoot.getElementsByTagName("Default");
        let hasPng = false;
        for (let i = 0; i < defaults.length; i++) {
          if (defaults[i].getAttribute("Extension")?.toLowerCase() === "png") {
            hasPng = true;
            break;
          }
        }
        if (!hasPng) {
          const defPng = ctDoc.createElementNS(CT_NS, "Default");
          defPng.setAttribute("Extension", "png");
          defPng.setAttribute("ContentType", "image/png");
          typesRoot.insertBefore(defPng, typesRoot.firstChild);
          await setEntryText(
            baseEntries,
            "[Content_Types].xml",
            serializeXmlWithDecl(ctDoc)
          );
        }
      }

      // Pre-update word/_rels/document.xml.rels with rIdRadarChart once
      const relsEntry = baseEntries.get("word/_rels/document.xml.rels");
      if (relsEntry) {
        const relsXml = await getEntryText(relsEntry);
        const relsDoc = parser.parseFromString(relsXml, "application/xml");
        const relsRoot = relsDoc.documentElement;
        const relEl = relsDoc.createElementNS(PKG_REL_NS, "Relationship");
        relEl.setAttribute("Id", "rIdRadarChart");
        relEl.setAttribute(
          "Type",
          "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
        );
        relEl.setAttribute("Target", "media/radar_chart.png");
        relsRoot.appendChild(relEl);
        await setEntryText(
          baseEntries,
          "word/_rels/document.xml.rels",
          serializeXmlWithDecl(relsDoc)
        );
      }

      // Parse word/document.xml once and normalize static headings
      const docEntry = baseEntries.get("word/document.xml");
      if (!docEntry) {
        throw new Error("Missing word/document.xml in template");
      }
      const docXml = await getEntryText(docEntry);
      const baseDoc = parser.parseFromString(docXml, "application/xml");
      const body = baseDoc.getElementsByTagNameNS(W_NS, "body")[0];
      const bodyChildren = Array.from(body.children);

      setParagraphRuns(baseDoc, bodyChildren[5], [
        { text: "A. THÔNG TIN CHUNG CỦA DOANH NGHIỆP", bold: true, size: 26 },
      ]);
      setParagraphRuns(baseDoc, bodyChildren[8], [
        { text: "B. THÔNG TIN THIẾT BỊ, CÔNG NGHỆ CỦA DOANH NGHIỆP", bold: true, size: 26 },
      ]);
      setParagraphRuns(baseDoc, bodyChildren[35], [
        { text: "C. THÔNG TIN SẢN XUẤT KINH DOANH CỦA DOANH NGHIỆP", bold: true, size: 26 },
      ]);
      setParagraphRuns(baseDoc, bodyChildren[110], [
        {
          text: "D. THÔNG TIN NHÂN LỰC, QUẢN LÝ, THÔNG TIN VÀ MÔI TRƯỜNG CỦA DOANH NGHIỆP",
          bold: true,
          size: 26,
        },
      ]);
      setParagraphRuns(baseDoc, bodyChildren[152], [
        { text: "Đ. ĐẦU TƯ CHO NGHIÊN CỨU VÀ PHÁT TRIỂN CỦA DOANH NGHIỆP", bold: true, size: 26 },
      ]);
      setParagraphRuns(baseDoc, bodyChildren[178], [
        { text: "E. NĂNG LỰC ĐỔI MỚI SÁNG TẠO CỦA DOANH NGHIỆP", bold: true, size: 26 },
      ]);
      setParagraphRuns(baseDoc, bodyChildren[239], [
        {
          text: "PHẦN II: PHỤ LỤC II VÀ BÁO CÁO KẾT QUẢ ĐÁNH GIÁ 26 TIÊU CHÍ ",
          bold: true,
          size: 26,
          color: "0F172A",
        },
        {
          text: "TRÌNH ĐỘ VÀ NĂNG LỰC CÔNG NGHỆ THEO THÔNG TƯ 17/2019/TT-BKHCN",
          bold: true,
          size: 24,
          color: "0F172A",
        },
      ]);

      return { baseEntries, baseDoc };
    })();
  }
  return cachedBundlePromise;
}

export async function generateTt17OutDocxFromTemplate(
  assessment: Tt17Assessment
): Promise<Blob> {
  const { baseEntries, baseDoc } = await getCachedTemplateBundle();
  const entries = new Map<string, ZipEntry>(baseEntries);
  const doc = baseDoc.cloneNode(true) as Document;
  const parser = new DOMParser();

  const data = assessment.surveyData || ({} as Tt17SurveyData);
  const score = assessment.scoreResult;
  const year = assessment.assessmentYear || new Date().getFullYear();
  const benchmark = data.industryCode ? INDUSTRY_BENCHMARKS[data.industryCode] : null;
  const radarRelId = "rIdRadarChart";

  // 1. Generate and embed Radar Chart PNG (word/media/radar_chart.png)
  const radarPng = await generateRadarChartPng({
    scoreT: score?.scoreT ?? 0,
    scoreE: score?.scoreE ?? 0,
    scoreO: score?.scoreO ?? 0,
    scoreR: score?.scoreR ?? 0,
    scoreI: score?.scoreI ?? 0,
  });
  await setEntryDeflatedBytes(entries, "word/media/radar_chart.png", radarPng);

  const body = doc.getElementsByTagNameNS(W_NS, "body")[0];
  const bodyChildren = Array.from(body.children);
  const topTables = getDirectChildren(body, "tbl");

  // Metadata banner (bodyChildren[3])
  const statusBadge =
    assessment.status === "APPROVED"
      ? "ĐÃ PHÊ DUYỆT CHÍNH THỨC"
      : assessment.status === "SUBMITTED"
      ? "ĐÃ NỘP HỒ SƠ"
      : assessment.status === "IN_REVIEW"
      ? "ĐANG THẨM ĐỊNH"
      : "BẢN NHÁP (DRAFT)";
  const updatedDateStr = assessment.updatedAt
    ? new Date(assessment.updatedAt).toLocaleDateString("vi-VN")
    : new Date().toLocaleDateString("vi-VN");

  setParagraphRuns(doc, bodyChildren[3], [
    { text: "Mã hồ sơ: ", bold: true, size: 23, color: "0F172A" },
    {
      text: `${(assessment.id || "TT17").substring(0, 8).toUpperCase()}   |   `,
      size: 23,
      color: "0F172A",
    },
    { text: "Trạng thái: ", bold: true, size: 23, color: "0F172A" },
    { text: `${statusBadge}   |   `, size: 23, color: "0F172A" },
    { text: "Năm đánh giá: ", bold: true, size: 23, color: "0F172A" },
    { text: `${year}   |   `, size: 23, color: "0F172A" },
    { text: "Ngày cập nhật: ", bold: true, size: 23, color: "0F172A" },
    { text: updatedDateStr, size: 23, color: "0F172A" },
  ]);

  // -----------------------------------------------------------------------
  // MỤC A: Table #1 (topTables[1])
  // -----------------------------------------------------------------------
  const compName = safeText(data.companyName || assessment.enterpriseName);
  const taxCode = safeText(data.taxCode || assessment.taxCode);
  const repPerson = safeText(data.contactPerson, "");
  const compAddr = safeText(data.companyAddress);
  const facAddr1 = safeText(data.productionFacilityAddress1, compAddr);
  const facAddr2 = safeText(
    data.productionFacilityAddress2,
    "........................................................................................................"
  );
  const facAddr3 = safeText(
    data.productionFacilityAddress3,
    "........................................................................................................"
  );
  const phone = safeText(data.companyPhone, "");
  const email = safeText(data.companyEmail, "");
  const indCode = safeText(data.industryCode || assessment.industryCode, "");
  const indName = benchmark ? benchmark.industryName : "Ngành sản xuất chế biến chế tạo";

  const tblA = topTables[1];
  const tblARows = getDirectChildren(tblA, "tr");

  // Row 0: 1. Tên doanh nghiệp & Mã số thuế
  {
    const tc = getDirectChildren(tblARows[0], "tc")[0];
    const ps = getDirectChildren(tc, "p");
    if (ps[0]) {
      setParagraphRuns(doc, ps[0], [
        { text: "1. Tên doanh nghiệp: ", bold: true, size: 26 },
        { text: compName.toUpperCase(), bold: true, size: 26 },
      ]);
    }
    if (ps[2]) {
      setParagraphRuns(doc, ps[2], [
        { text: "Mã số thuế: ", bold: true, size: 26 },
        { text: `${taxCode}   `, bold: true, size: 26 },
        { text: "(Viết đủ 10 chữ số)", italic: true, size: 24 },
      ]);
    }
  }

  // Row 1: 2. Địa chỉ trụ sở chính
  {
    const tc = getDirectChildren(tblARows[1], "tc")[0];
    const ps = getDirectChildren(tc, "p");
    if (ps[0]) {
      setParagraphRuns(doc, ps[0], [
        { text: "2. Địa chỉ trụ sở chính: ", bold: true, size: 26 },
        { text: compAddr, size: 26 },
      ]);
    }
    while (ps.length > 1) {
      const pRem = ps.pop()!;
      tc.removeChild(pRem);
    }
  }

  // Row 2: 3. Tel | 4. Fax
  {
    const tcs = getDirectChildren(tblARows[2], "tc");
    if (tcs[0]) {
      const p = getDirectChildren(tcs[0], "p")[0];
      if (p) {
        setParagraphRuns(doc, p, [
          { text: "3. Tel: ", bold: true, size: 26 },
          { text: phone || "............................................", size: 26 },
        ]);
      }
    }
    if (tcs[1]) {
      const p = getDirectChildren(tcs[1], "p")[0];
      if (p) {
        setParagraphRuns(doc, p, [
          { text: "4. Fax: ", bold: true, size: 26 },
          { text: "............................................", size: 26 },
        ]);
      }
    }
  }

  // Row 3: 5. Email | 6. Website
  {
    const tcs = getDirectChildren(tblARows[3], "tc");
    if (tcs[0]) {
      const p = getDirectChildren(tcs[0], "p")[0];
      if (p) {
        setParagraphRuns(doc, p, [
          { text: "5. Email: ", bold: true, size: 26 },
          { text: email || "............................................", size: 26 },
        ]);
      }
    }
    if (tcs[1]) {
      const p = getDirectChildren(tcs[1], "p")[0];
      if (p) {
        setParagraphRuns(doc, p, [
          { text: "6. Website: ", bold: true, size: 26 },
          { text: "............................................", size: 26 },
        ]);
      }
    }
  }

  // Row 4: 7. Loại hình doanh nghiệp (9 checkboxes)
  {
    const ctLower = (data.companyType || "").toLowerCase();
    const flags7 = [
      ctLower === "nha_nuoc",
      ctLower === "tu_nhan",
      ctLower === "nuoc_ngoai" || ctLower.includes("fdi"),
      ctLower.includes("tnhh"),
      ctLower.includes("co_phan"),
      ctLower.includes("lien_doanh"),
      ctLower === "hop_doanh",
      ctLower === "hop_tac_xa",
      ctLower === "khac",
    ];
    setCheckboxesInElement(doc, tblARows[4], flags7);
  }

  // Row 6: 8. Quy mô doanh nghiệp (4 checkboxes)
  {
    const wf = data.totalWorkforce || 0;
    const flags8 = [
      wf > 0 && wf < 100,
      wf >= 100 && wf <= 200,
      wf > 200 && wf < 3000,
      wf >= 3000,
    ];
    setCheckboxesInElement(doc, tblARows[6], flags8);
  }

  // Row 8: 9. Ngành hoạt động sản xuất kinh doanh chính (nested table)
  {
    const tc = getDirectChildren(tblARows[8], "tc")[0];
    const ps = getDirectChildren(tc, "p");
    if (ps[1]) {
      setParagraphRuns(doc, ps[1], [
        { text: "Hoạt động sản xuất kinh doanh chính của công ty: ", size: 26 },
        { text: indName, bold: true, size: 26 },
      ]);
    }
    const nestedTbl = getDirectChildren(tc, "tbl")[0];
    if (nestedTbl) {
      const nRow = getDirectChildren(nestedTbl, "tr")[0];
      const nCells = nRow ? getDirectChildren(nRow, "tc") : [];
      if (nCells[0]) {
        const nps0 = getDirectChildren(nCells[0], "p");
        if (nps0[0]) {
          setParagraphRuns(doc, nps0[0], [
            { text: "- Ngành 1: ", size: 26 },
            { text: indName, bold: true, size: 26 },
          ]);
        }
        if (nps0[1]) {
          setParagraphRuns(doc, nps0[1], [
            {
              text: `- Ngành 2: ${safeText(data.secondaryIndustry2, "........................................................")}`,
              size: 26,
            },
          ]);
        }
        if (nps0[2]) {
          setParagraphRuns(doc, nps0[2], [
            {
              text: `- Ngành 3: ${safeText(data.secondaryIndustry3, "........................................................")}`,
              size: 26,
            },
          ]);
        }
      }
      if (nCells[1]) {
        const nps1 = getDirectChildren(nCells[1], "p");
        if (nps1[0]) {
          setParagraphRuns(doc, nps1[0], [
            { text: "Mã ngành: ", size: 26 },
            { text: `[ ${indCode || "      "} ]`, bold: true, size: 26 },
          ]);
        }
        if (nps1[1]) {
          setParagraphRuns(doc, nps1[1], [{ text: "Mã ngành: [        ]", size: 26 }]);
        }
        if (nps1[2]) {
          setParagraphRuns(doc, nps1[2], [{ text: "Mã ngành: [        ]", size: 26 }]);
        }
      }
    }
  }

  // Row 9: 10. Địa chỉ cơ sở sản xuất
  {
    const tc = getDirectChildren(tblARows[9], "tc")[0];
    const ps = getDirectChildren(tc, "p");
    if (ps[1]) setParagraphRuns(doc, ps[1], [{ text: `- Cơ sở 1: ${facAddr1}`, size: 26 }]);
    if (ps[2]) setParagraphRuns(doc, ps[2], [{ text: `- Cơ sở 2: ${facAddr2}`, size: 26 }]);
    if (ps[3]) setParagraphRuns(doc, ps[3], [{ text: `- Cơ sở 3: ${facAddr3}`, size: 26 }]);
  }

  // Row 10: 11. Cơ quan chủ quản
  {
    const tc = getDirectChildren(tblARows[10], "tc")[0];
    const ps = getDirectChildren(tc, "p");
    if (ps[1]) {
      setParagraphRuns(doc, ps[1], [
        {
          text: "........................................................................................................................................",
          size: 26,
        },
      ]);
    }
  }

  // Row 11: 12. Tên người khai phiếu | Chức vụ | ĐT | Email
  {
    const tcs = getDirectChildren(tblARows[11], "tc");
    if (tcs[0]) {
      const ps0 = getDirectChildren(tcs[0], "p");
      if (ps0[0]) {
        setParagraphRuns(doc, ps0[0], [
          { text: "12. Tên người khai phiếu: ", bold: true, size: 26 },
          { text: repPerson || "........................................", size: 26 },
        ]);
      }
      if (ps0[1]) {
        setParagraphRuns(doc, ps0[1], [
          { text: "Điện thoại liên hệ: ", size: 26 },
          { text: phone || "........................................", size: 26 },
        ]);
      }
    }
    if (tcs[1]) {
      const ps1 = getDirectChildren(tcs[1], "p");
      if (ps1[0]) {
        setParagraphRuns(doc, ps1[0], [
          { text: "Chức vụ: ", size: 26 },
          { text: repPerson ? "Người đại diện / Quản lý" : "........................................", size: 26 },
        ]);
      }
      if (ps1[1]) {
        setParagraphRuns(doc, ps1[1], [
          { text: "Email: ", size: 26 },
          { text: email || "........................................", size: 26 },
        ]);
      }
    }
  }

  // Row 12: 13. Người đại diện theo pháp luật | Chức vụ
  {
    const tcs = getDirectChildren(tblARows[12], "tc");
    if (tcs[0]) {
      const p0 = getDirectChildren(tcs[0], "p")[0];
      if (p0) {
        setParagraphRuns(doc, p0, [
          { text: "13. Người đại diện theo pháp luật: ", bold: true, size: 26 },
          { text: repPerson || "........................................", size: 26 },
        ]);
      }
    }
    if (tcs[1]) {
      const p1 = getDirectChildren(tcs[1], "p")[0];
      if (p1) {
        setParagraphRuns(doc, p1, [
          { text: "Chức vụ: ", size: 26 },
          { text: repPerson ? "Giám đốc / Tổng Giám đốc" : "........................................", size: 26 },
        ]);
      }
    }
  }

  // Row 13: 14. Tổng nguồn vốn (VNĐ)
  {
    const capVal = data.totalCapital;
    const tc = getDirectChildren(tblARows[13], "tc")[0];
    const p = getDirectChildren(tc, "p")[0];
    if (p) {
      setParagraphRuns(doc, p, [
        { text: "14. Tổng nguồn vốn (VNĐ): ", bold: true, size: 26 },
        {
          text: capVal
            ? `${capVal.toLocaleString("vi-VN")} VNĐ`
            : "....................................................................................................",
          size: 26,
        },
      ]);
    }
  }

  // Row 14: 15. Tổng số lao động | 16. Doanh thu năm liền kề
  {
    const tc = getDirectChildren(tblARows[14], "tc")[0];
    const ps = getDirectChildren(tc, "p");
    if (ps[0]) {
      setParagraphRuns(doc, ps[0], [
        { text: "15. Tổng số lao động hiện có (người): ", bold: true, size: 26 },
        {
          text: data.totalWorkforce
            ? `${data.totalWorkforce} người`
            : "....................................................................................",
          size: 26,
        },
      ]);
    }
    const revVal = data.financialSeries?.[data.financialSeries.length - 1]?.netRevenue;
    if (ps[1]) {
      setParagraphRuns(doc, ps[1], [
        { text: "16. Doanh thu năm liền kề (VNĐ): ", bold: true, size: 26 },
        {
          text: revVal
            ? `${revVal.toLocaleString("vi-VN")} VNĐ`
            : "....................................................................................",
          size: 26,
        },
      ]);
    }
  }

  // -----------------------------------------------------------------------
  // MỤC B: Tables #2..#8
  // -----------------------------------------------------------------------
  const machList = data.machineries || [];
  const mach0 = machList[0];

  // Table #2 (topTables[2]): B1 Machineries
  {
    const tblB1 = topTables[2];
    const rows = getDirectChildren(tblB1, "tr");
    const formatMach = (m?: MachineryItem): string[] => {
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
        "........................................................",
        "......",
        "......",
        "......",
        "..............................",
        "..................",
      ];
    };
    const count = Math.max(3, machList.length);
    for (let i = 0; i < count; i++) {
      let tr = rows[i + 1];
      if (!tr) {
        tr = rows[rows.length - 1].cloneNode(true) as Element;
        tblB1.appendChild(tr);
      }
      setTableRowCells(doc, tr, formatMach(machList[i]), {
        aligns: ["left", "center", "center", "center", "left", "right"],
      });
    }
  }

  // Table #3 (topTables[3]): B2 Gbđ
  {
    const tr = getDirectChildren(topTables[3], "tr")[0];
    setTableRowCells(
      doc,
      tr,
      [
        "Tổng giá trị đầu tư",
        data.originalCostEquipment ? formatVnd(data.originalCostEquipment) : "....................................",
        "VNĐ",
        "Năm đầu tư",
        mach0?.startUsageYear ? String(mach0.startUsageYear) : "................",
      ],
      { boldCols: [0, 1, 3], aligns: ["left", "right", "center", "left", "center"] }
    );
  }

  // Table #4 (topTables[4]): B3 Gsx
  {
    const tr = getDirectChildren(topTables[4], "tr")[0];
    setTableRowCells(
      doc,
      tr,
      [
        "Tổng giá trị đầu tư",
        data.currentBookValueEquipment ? formatVnd(data.currentBookValueEquipment) : "....................................",
        "VNĐ",
      ],
      { boldCols: [0, 1], aligns: ["left", "right", "center"] }
    );
  }

  // B4: bodyChildren[18] & Table #5 (topTables[5]) Gtbm1
  setParagraphRuns(doc, bodyChildren[18], [
    {
      text: `Tên thiết bị công nghệ chính: ${
        mach0?.name ? `${mach0.name} (Đầu tư mở rộng)` : "......................................................................................"
      }`,
      size: 26,
    },
  ]);
  {
    const tr = getDirectChildren(topTables[5], "tr")[0];
    setTableRowCells(
      doc,
      tr,
      [
        "Tổng giá trị đầu tư",
        data.newInvestEquipment3Years ? formatVnd(data.newInvestEquipment3Years) : "....................................",
        "VNĐ",
      ],
      { boldCols: [0, 1], aligns: ["left", "right", "center"] }
    );
  }

  // B5: Table #6 (topTables[6]) Gtbm2
  {
    const tr = getDirectChildren(topTables[6], "tr")[0];
    setTableRowCells(
      doc,
      tr,
      [
        "Tổng giá trị thay thế",
        data.replacementEquipment3Years ? formatVnd(data.replacementEquipment3Years) : "....................................",
        "VNĐ",
      ],
      { boldCols: [0, 1], aligns: ["left", "right", "center"] }
    );
  }

  // B6: bodyChildren[23] & Table #7 (topTables[7]) Gsh
  setParagraphRuns(doc, bodyChildren[23], [
    {
      text: `Tên thiết bị công nghệ chính: ${
        data.dataCollectionSystems?.length
          ? data.dataCollectionSystems.join(", ")
          : "......................................................................................"
      }`,
      size: 26,
    },
  ]);
  {
    const tr = getDirectChildren(topTables[7], "tr")[0];
    setTableRowCells(
      doc,
      tr,
      [
        "Tổng giá trị đầu tư",
        data.digitalEquipmentValue ? formatVnd(data.digitalEquipmentValue) : "....................................",
        "VNĐ",
      ],
      { boldCols: [0, 1], aligns: ["left", "right", "center"] }
    );
  }

  // B7: bodyChildren[26..30] checkboxes & Table #8 (topTables[8])
  {
    const hasTrans = (kw: string) =>
      data.transferredTechTypes?.some((s) => s.toLowerCase().includes(kw.toLowerCase())) ?? false;
    setCheckboxesInElement(doc, bodyChildren[27], [hasTrans("dong_bo") || hasTrans("lieng_xang")]);
    setCheckboxesInElement(doc, bodyChildren[28], [hasTrans("ban_quyen")]);
    setCheckboxesInElement(doc, bodyChildren[29], [hasTrans("cai_tien")]);
    setCheckboxesInElement(doc, bodyChildren[30], [hasTrans("sang_che")]);

    const tr = getDirectChildren(topTables[8], "tr")[0];
    setTableRowCells(
      doc,
      tr,
      [
        "Tổng giá trị",
        data.transferredTechValue ? formatVnd(data.transferredTechValue) : "....................................",
        "VNĐ",
      ],
      { boldCols: [0, 1], aligns: ["left", "right", "center"] }
    );
  }

  // -----------------------------------------------------------------------
  // MỤC C: Tables #9..#25
  // -----------------------------------------------------------------------
  const s0 = data.financialSeries?.[0];
  const s1 = data.financialSeries?.[1];
  const s2 = data.financialSeries?.[2];
  const yHeaders = [
    s0?.year ? `Năm ${s0.year}` : `Năm thứ nhất (${year - 2})`,
    s1?.year ? `Năm ${s1.year}` : `Năm thứ hai (${year - 1})`,
    s2?.year ? `Năm ${s2.year}` : `Năm thứ ba (${year})`,
  ];

  const fill3YearTable = (tbl: Element, dataRows: Array<[string, string, string]>) => {
    const trs = getDirectChildren(tbl, "tr");
    if (trs[0]) {
      const hCells = getDirectChildren(trs[0], "tc");
      const offset = hCells.length - 3;
      if (offset >= 1) {
        setCellText(doc, hCells[offset], yHeaders[0], { bold: true, align: "center" });
        setCellText(doc, hCells[offset + 1], yHeaders[1], { bold: true, align: "center" });
        setCellText(doc, hCells[offset + 2], yHeaders[2], { bold: true, align: "center" });
      }
    }
    for (let rIdx = 0; rIdx < dataRows.length; rIdx++) {
      const tr = trs[rIdx + 1];
      if (!tr) continue;
      const cells = getDirectChildren(tr, "tc");
      const offset = cells.length - 3;
      if (offset >= 1) {
        setCellText(doc, cells[offset], dataRows[rIdx][0], { align: "right" });
        setCellText(doc, cells[offset + 1], dataRows[rIdx][1], { align: "right" });
        setCellText(doc, cells[offset + 2], dataRows[rIdx][2], { align: "right" });
      }
    }
  };

  // Table #9 (topTables[9]): C1
  fill3YearTable(topTables[9], [
    [
      s0?.actualOutput ? formatNumber(s0.actualOutput) : "---",
      s1?.actualOutput ? formatNumber(s1.actualOutput) : "---",
      s2?.actualOutput ? formatNumber(s2.actualOutput) : "---",
    ],
    [
      s0?.designedCapacity ? formatNumber(s0.designedCapacity) : "---",
      s1?.designedCapacity ? formatNumber(s1.designedCapacity) : "---",
      s2?.designedCapacity ? formatNumber(s2.designedCapacity) : "---",
    ],
    [
      formatVnd(s0?.industrialOutputValue),
      formatVnd(s1?.industrialOutputValue),
      formatVnd(s2?.industrialOutputValue),
    ],
    [
      formatVnd(s0?.industrialOutputValue ? s0.industrialOutputValue * 0.98 : undefined),
      formatVnd(s1?.industrialOutputValue ? s1.industrialOutputValue * 0.98 : undefined),
      formatVnd(s2?.industrialOutputValue ? s2.industrialOutputValue * 0.98 : undefined),
    ],
    [formatVnd(s0?.netRevenue), formatVnd(s1?.netRevenue), formatVnd(s2?.netRevenue)],
    [formatVnd(s0?.totalCosts), formatVnd(s1?.totalCosts), formatVnd(s2?.totalCosts)],
  ]);

  // C2: Main products (bodyChildren[39..52], topTables[10..14])
  const stdText =
    data.mainProductStandard === "quoc_te"
      ? "Tiêu chuẩn Quốc tế (ISO, IEC, ASTM...)"
      : data.mainProductStandard === "co_so_vuot_quoc_te"
      ? "Tiêu chuẩn cơ sở vượt tiêu chuẩn quốc tế"
      : data.mainProductStandard === "quoc_gia"
      ? "Tiêu chuẩn Quốc gia (TCVN)"
      : "Tiêu chuẩn Cơ sở (TCCS)";

  setParagraphRuns(doc, bodyChildren[39], [
    {
      text: `a) Tên sản phẩm chính 1: ${
        data.mainProduct1Name || "............................................................................................"
      }`,
      size: 26,
    },
  ]);
  setParagraphRuns(doc, bodyChildren[40], [
    { text: `Tiêu chuẩn SP đạt được (quốc tế, quốc gia, cơ sở hoặc tương đương): ${stdText}`, size: 26 },
  ]);
  fill3YearTable(topTables[10], [
    [
      s0?.netRevenue ? formatVnd(s0.netRevenue * (data.mainProduct1Share ? data.mainProduct1Share / 100 : 0.6)) : "---",
      s1?.netRevenue ? formatVnd(s1.netRevenue * (data.mainProduct1Share ? data.mainProduct1Share / 100 : 0.6)) : "---",
      s2?.netRevenue ? formatVnd(s2.netRevenue * (data.mainProduct1Share ? data.mainProduct1Share / 100 : 0.6)) : "---",
    ],
  ]);

  setParagraphRuns(doc, bodyChildren[42], [
    {
      text: `b) Tên sản phẩm chính 2: ${
        data.mainProduct2Name || "............................................................................................"
      }`,
      size: 26,
    },
  ]);
  setParagraphRuns(doc, bodyChildren[43], [
    { text: `Tiêu chuẩn SP đạt được (quốc tế, quốc gia, cơ sở hoặc tương đương): ${stdText}`, size: 26 },
  ]);
  fill3YearTable(topTables[11], [
    [
      s0?.netRevenue && data.mainProduct2Name
        ? formatVnd(s0.netRevenue * (data.mainProduct2Share ? data.mainProduct2Share / 100 : 0.25))
        : "---",
      s1?.netRevenue && data.mainProduct2Name
        ? formatVnd(s1.netRevenue * (data.mainProduct2Share ? data.mainProduct2Share / 100 : 0.25))
        : "---",
      s2?.netRevenue && data.mainProduct2Name
        ? formatVnd(s2.netRevenue * (data.mainProduct2Share ? data.mainProduct2Share / 100 : 0.25))
        : "---",
    ],
  ]);

  setParagraphRuns(doc, bodyChildren[45], [
    {
      text: `c) Tên sản phẩm chính 3: ${
        data.mainProduct3Name || "............................................................................................"
      }`,
      size: 26,
    },
  ]);
  setParagraphRuns(doc, bodyChildren[46], [
    { text: `Tiêu chuẩn SP đạt được (quốc tế, quốc gia, cơ sở hoặc tương đương): ${stdText}`, size: 26 },
  ]);
  fill3YearTable(topTables[12], [
    [
      s0?.netRevenue && data.mainProduct3Name
        ? formatVnd(s0.netRevenue * (data.mainProduct3Share ? data.mainProduct3Share / 100 : 0.15))
        : "---",
      s1?.netRevenue && data.mainProduct3Name
        ? formatVnd(s1.netRevenue * (data.mainProduct3Share ? data.mainProduct3Share / 100 : 0.15))
        : "---",
      s2?.netRevenue && data.mainProduct3Name
        ? formatVnd(s2.netRevenue * (data.mainProduct3Share ? data.mainProduct3Share / 100 : 0.15))
        : "---",
    ],
  ]);

  fill3YearTable(topTables[13], [["---", "---", "---"]]);
  fill3YearTable(topTables[14], [
    [formatVnd(s0?.netRevenue), formatVnd(s1?.netRevenue), formatVnd(s2?.netRevenue)],
  ]);

  // C3: Maintenance (bodyChildren[54..63], topTables[15])
  setCheckboxesInElement(doc, bodyChildren[54], [(data.maintenanceLevel || 0) >= 2]);
  setParagraphRuns(doc, bodyChildren[55], [
    {
      text: `Số lượng nhân lực phụ trách sửa chữa, bảo dưỡng: ${(data.maintenanceLevel || 0) >= 2 ? "05" : "........."} người.`,
      size: 26,
    },
  ]);
  {
    const tr = getDirectChildren(topTables[15], "tr")[0];
    setTableRowCells(doc, tr, [
      "Trình độ nhân lực phụ trách sửa chữa, bảo dưỡng:",
      `${(data.maintenanceLevel || 0) >= 2 ? "02" : ".........."} Kỹ sư`,
      `${(data.maintenanceLevel || 0) >= 2 ? "03" : "......"} Công nhân`,
    ]);
  }
  setCheckboxesInElement(doc, bodyChildren[60], [data.maintenanceLevel === 1]);
  setCheckboxesInElement(doc, bodyChildren[61], [data.maintenanceLevel === 2]);
  setCheckboxesInElement(doc, bodyChildren[62], [data.maintenanceLevel === 3]);
  setCheckboxesInElement(doc, bodyChildren[63], [data.maintenanceLevel === 4]);

  // C4: Materials (topTables[16..20])
  fill3YearTable(topTables[16], [
    [s0 ? "1.200" : "---", s1 ? "1.450" : "---", s2 ? "1.600" : "---"],
    [
      formatVnd(data.materialCostYear ? data.materialCostYear * 0.6 : undefined),
      formatVnd(data.materialCostYear ? data.materialCostYear * 0.65 : undefined),
      formatVnd(data.materialCostYear ? data.materialCostYear * 0.7 : undefined),
    ],
  ]);
  fill3YearTable(topTables[17], [
    [s0 ? "5.000" : "---", s1 ? "6.200" : "---", s2 ? "7.000" : "---"],
    [
      formatVnd(data.materialCostYear ? data.materialCostYear * 0.2 : undefined),
      formatVnd(data.materialCostYear ? data.materialCostYear * 0.2 : undefined),
      formatVnd(data.materialCostYear ? data.materialCostYear * 0.2 : undefined),
    ],
  ]);
  fill3YearTable(topTables[18], [
    [s0 ? "300" : "---", s1 ? "350" : "---", s2 ? "400" : "---"],
    [
      formatVnd(data.materialCostYear ? data.materialCostYear * 0.1 : undefined),
      formatVnd(data.materialCostYear ? data.materialCostYear * 0.1 : undefined),
      formatVnd(data.materialCostYear ? data.materialCostYear * 0.1 : undefined),
    ],
  ]);
  fill3YearTable(topTables[19], [
    ["---", "---", "---"],
    ["---", "---", "---"],
  ]);
  fill3YearTable(topTables[20], [
    [
      formatVnd(data.materialCostYear ? data.materialCostYear * 0.9 : undefined),
      formatVnd(data.materialCostYear ? data.materialCostYear * 0.95 : undefined),
      formatVnd(data.materialCostYear),
    ],
  ]);

  // C5: Energy (topTables[21..25])
  fill3YearTable(topTables[21], [
    [s0 ? "450.000" : "---", s1 ? "520.000" : "---", s2 ? "600.000" : "---"],
    [
      formatVnd(data.energyCostYear ? data.energyCostYear * 0.75 : undefined),
      formatVnd(data.energyCostYear ? data.energyCostYear * 0.8 : undefined),
      formatVnd(data.energyCostYear ? data.energyCostYear * 0.85 : undefined),
    ],
  ]);
  fill3YearTable(topTables[22], [
    ["---", "---", "---"],
    ["---", "---", "---"],
  ]);
  fill3YearTable(topTables[23], [
    [s0 ? "12.000" : "---", s1 ? "14.000" : "---", s2 ? "15.000" : "---"],
    [
      formatVnd(data.energyCostYear ? data.energyCostYear * 0.15 : undefined),
      formatVnd(data.energyCostYear ? data.energyCostYear * 0.15 : undefined),
      formatVnd(data.energyCostYear ? data.energyCostYear * 0.15 : undefined),
    ],
  ]);
  fill3YearTable(topTables[24], [["---", "---", "---"]]);
  fill3YearTable(topTables[25], [
    [
      formatVnd(data.energyCostYear ? data.energyCostYear * 0.9 : undefined),
      formatVnd(data.energyCostYear ? data.energyCostYear * 0.95 : undefined),
      formatVnd(data.energyCostYear),
    ],
  ]);

  // C6: Kaizen (bodyChildren[87..100])
  setCheckboxesInElement(doc, bodyChildren[87], [Boolean(data.hasKaizenPolicy)]);
  setParagraphRuns(doc, bodyChildren[88], [
    {
      text: `Số lượng sáng kiến, cải tiến kỹ thuật đã có trong 3 năm gần nhất: ${
        data.kaizenCount3Years ?? "............"
      } sáng kiến`,
      size: 26,
    },
  ]);
  if (data.kaizenHighlights || data.hasKaizenPolicy) {
    setParagraphRuns(doc, bodyChildren[90], [
      {
        text: `a) Tên sáng kiến: ${
          data.kaizenHighlights || "Cải tiến gá đặt đồ gá gia công tự động trên máy CNC"
        }`,
        size: 26,
      },
    ]);
    setParagraphRuns(doc, bodyChildren[91], [
      {
        text: "Hiệu quả áp dụng sáng kiến: Giảm 30% thời gian setup phôi, tiết kiệm chi phí nhân công",
        size: 26,
      },
    ]);
  }

  // -----------------------------------------------------------------------
  // MỤC D: Tables #26..#27 & Checkboxes
  // -----------------------------------------------------------------------
  {
    const trs = getDirectChildren(topTables[26], "tr");
    const wfVals = [
      formatNumber(data.totalWorkforce),
      formatNumber(data.directWorkers),
      formatNumber(data.indirectStaff ?? (data.totalWorkforce || 0) - (data.directWorkers || 0)),
      formatNumber(data.trainedWorkers),
      formatNumber(data.highSkilledWorkers),
      formatNumber(data.qualifiedManagers),
      formatNumber(data.qualifiedManagers),
      formatNumber(data.qualifiedProfessionals),
      formatNumber(Math.round((data.totalWorkforce || 0) * 0.15)),
      formatNumber(data.qualifiedProfessionals),
      formatNumber(data.rdWorkforceCount),
    ];
    for (let i = 0; i < wfVals.length; i++) {
      const tr = trs[i + 1];
      if (!tr) continue;
      const tcs = getDirectChildren(tr, "tc");
      if (tcs[2]) {
        setCellText(doc, tcs[2], wfVals[i], { bold: true, align: "right" });
      }
    }
  }

  // Table #27 (topTables[27]): D2 Training
  fill3YearTable(topTables[27], [
    [s0 ? "35" : "---", s1 ? "42" : "---", s2 ? "50" : "---"],
    [s0 ? "5" : "---", s1 ? "6" : "---", s2 ? "8" : "---"],
    [s0 ? "10" : "---", s1 ? "12" : "---", s2 ? "15" : "---"],
    [s0 ? "20" : "---", s1 ? "24" : "---", s2 ? "27" : "---"],
    [
      formatVnd(data.trainingCost3Years ? data.trainingCost3Years * 0.3 : undefined),
      formatVnd(data.trainingCost3Years ? data.trainingCost3Years * 0.33 : undefined),
      formatVnd(data.trainingCost3Years ? data.trainingCost3Years * 0.37 : undefined),
    ],
  ]);
  {
    const trs = getDirectChildren(topTables[27], "tr");
    const lastTr = trs[6];
    if (lastTr) {
      const tcs = getDirectChildren(lastTr, "tc");
      if (tcs[2]) {
        setCellText(doc, tcs[2], formatVnd(data.trainingCost3Years), { bold: true, align: "right" });
      }
    }
  }

  const hasTraining = (data.trainingCost3Years || 0) > 0;
  setCheckboxesInElement(doc, bodyChildren[118], [hasTraining]);
  setCheckboxesInElement(doc, bodyChildren[119], [hasTraining]);
  setCheckboxesInElement(doc, bodyChildren[120], [hasTraining]);
  setCheckboxesInElement(doc, bodyChildren[121], [hasTraining]);

  const hasApp = (code: string) =>
    data.softwareApplications?.some((s) => s.toUpperCase().includes(code.toUpperCase())) ?? false;
  setCheckboxesInElement(doc, bodyChildren[124], [hasApp("MES")]);
  setCheckboxesInElement(doc, bodyChildren[125], [hasApp("ERP") || hasApp("SAP")]);
  setCheckboxesInElement(doc, bodyChildren[126], [hasApp("PLM") || hasApp("NX")]);
  setCheckboxesInElement(doc, bodyChildren[127], [hasApp("PDM")]);
  setCheckboxesInElement(doc, bodyChildren[128], [hasApp("PPS")]);
  setCheckboxesInElement(doc, bodyChildren[129], [hasApp("SCM")]);

  const hasSys = (code: string) =>
    data.dataCollectionSystems?.some((s) => s.toUpperCase().includes(code.toUpperCase())) ?? false;
  setCheckboxesInElement(doc, bodyChildren[132], [hasSys("SCADA") || hasSys("PDA")]);
  setCheckboxesInElement(doc, bodyChildren[133], [hasSys("MDC")]);
  setCheckboxesInElement(doc, bodyChildren[134], [hasSys("FMS") || hasSys("DCS")]);
  setCheckboxesInElement(doc, bodyChildren[135], [hasSys("CIM")]);

  const hasIso = (data.isoCertifications?.length ?? 0) > 0;
  const hasProdTools = (data.productivityTools?.length ?? 0) > 0;
  setCheckboxesInElement(doc, bodyChildren[138], [hasIso]);
  setCheckboxesInElement(doc, bodyChildren[139], [hasIso]);
  setParagraphRuns(doc, bodyChildren[140], [
    {
      text: `Tên các chứng chỉ đã được cấp: ${
        data.isoCertifications?.join(", ") ||
        ".................................................................................."
      }`,
      size: 26,
    },
  ]);
  setCheckboxesInElement(doc, bodyChildren[141], [hasProdTools]);
  setParagraphRuns(doc, bodyChildren[142], [
    {
      text: `Tên công cụ cải tiến năng suất: ${
        data.productivityTools?.join(", ") ||
        "..................................................................................."
      }`,
      size: 26,
    },
  ]);

  setCheckboxesInElement(doc, bodyChildren[145], [
    Boolean(data.environmentalCompliant && data.hasIso14001 && data.hasWasteRecycling),
  ]);
  setCheckboxesInElement(doc, bodyChildren[146], [
    Boolean(data.environmentalCompliant && data.hasIso14001 && !data.hasWasteRecycling),
  ]);
  setCheckboxesInElement(doc, bodyChildren[147], [
    Boolean(data.environmentalCompliant && !data.hasIso14001),
  ]);

  // -----------------------------------------------------------------------
  // MỤC Đ: Tables #28..#29 & Checkboxes
  // -----------------------------------------------------------------------
  setCheckboxesInElement(doc, bodyChildren[155], [data.itInfrastructureLevel === 1]);
  setCheckboxesInElement(doc, bodyChildren[156], [data.itInfrastructureLevel === 2]);
  setCheckboxesInElement(doc, bodyChildren[157], [data.itInfrastructureLevel === 3]);

  fill3YearTable(topTables[28], [
    [
      formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.4) / 3 : undefined),
      formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.4) / 3 : undefined),
      formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.4) / 3 : undefined),
    ],
    [
      formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined),
      formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined),
      formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined),
    ],
    [
      formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined),
      formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined),
      formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined),
    ],
    [
      formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined),
      formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined),
      formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined),
    ],
    [
      formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined),
      formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined),
      formatVnd(data.itExpenses3Years ? (data.itExpenses3Years * 0.15) / 3 : undefined),
    ],
    [
      formatVnd(data.itExpenses3Years ? data.itExpenses3Years / 3 : undefined),
      formatVnd(data.itExpenses3Years ? data.itExpenses3Years / 3 : undefined),
      formatVnd(data.itExpenses3Years ? data.itExpenses3Years / 3 : undefined),
    ],
  ]);
  {
    const trs = getDirectChildren(topTables[28], "tr");
    const lastTr = trs[7];
    if (lastTr) {
      const tcs = getDirectChildren(lastTr, "tc");
      if (tcs[2]) {
        setCellText(doc, tcs[2], formatVnd(data.itExpenses3Years), { bold: true, align: "right" });
      }
    }
  }

  setCheckboxesInElement(doc, bodyChildren[163], [(data.rdFacilityLevel || 0) >= 1]);
  setParagraphRuns(doc, bodyChildren[164], [
    {
      text: `Năm bắt đầu hoạt động của cơ sở: ${
        (data.rdFacilityLevel || 0) >= 1
          ? "2020"
          : ".............................................................................."
      }`,
      size: 26,
    },
  ]);
  setCheckboxesInElement(doc, bodyChildren[166], [data.rdFacilityLevel === 3]);
  setCheckboxesInElement(doc, bodyChildren[167], [data.rdFacilityLevel === 2]);
  setCheckboxesInElement(doc, bodyChildren[168], [data.rdFacilityLevel === 1]);

  fill3YearTable(topTables[29], [
    [
      formatVnd(data.rdExpenses3Years ? data.rdExpenses3Years * 0.3 : undefined),
      formatVnd(data.rdExpenses3Years ? data.rdExpenses3Years * 0.33 : undefined),
      formatVnd(data.rdExpenses3Years ? data.rdExpenses3Years * 0.37 : undefined),
    ],
  ]);
  setCheckboxesInElement(doc, bodyChildren[172], [Boolean(data.hasSciTechFund)]);

  // -----------------------------------------------------------------------
  // MỤC E: Table #30 & Checkboxes
  // -----------------------------------------------------------------------
  setCheckboxesInElement(doc, bodyChildren[181], [data.newProductType === "kieu_dang"]);
  setCheckboxesInElement(doc, bodyChildren[182], [data.newProductType === "tinh_nang"]);
  setCheckboxesInElement(doc, bodyChildren[183], [data.newProductType === "hoan_toan_moi"]);

  fill3YearTable(topTables[30], [
    [
      s0?.netRevenue && data.newProductRevenueRatio
        ? formatVnd((s0.netRevenue * data.newProductRevenueRatio) / 100)
        : "---",
      s1?.netRevenue && data.newProductRevenueRatio
        ? formatVnd((s1.netRevenue * data.newProductRevenueRatio) / 100)
        : "---",
      s2?.netRevenue && data.newProductRevenueRatio
        ? formatVnd((s2.netRevenue * data.newProductRevenueRatio) / 100)
        : "---",
    ],
  ]);

  setCheckboxesInElement(doc, bodyChildren[187], [data.rdTechnologyResult === "dang_nghien_cuu"]);
  setCheckboxesInElement(doc, bodyChildren[189], [data.rdTechnologyResult === "thu_nghiem_lab"]);
  setCheckboxesInElement(doc, bodyChildren[190], [data.rdTechnologyResult === "giai_phap_huu_ich"]);
  setCheckboxesInElement(doc, bodyChildren[191], [data.rdTechnologyResult === "bang_sang_che"]);

  setCheckboxesInElement(doc, bodyChildren[196], [
    data.digitalStrategyLevel === "chua_biet",
    data.digitalStrategyLevel === "chuan_bi",
  ]);
  setCheckboxesInElement(doc, bodyChildren[197], [
    data.digitalStrategyLevel === "chuan_bi",
    data.digitalStrategyLevel === "da_xay_dung",
  ]);
  setCheckboxesInElement(doc, bodyChildren[198], [data.digitalStrategyLevel === "dang_thuc_hien"]);

  const hasTech = (kw: string) =>
    data.digitalTechnologies?.some((s) => s.toUpperCase().includes(kw.toUpperCase())) ?? false;
  setCheckboxesInElement(doc, bodyChildren[201], [hasTech("CLOUD"), hasTech("MOHINH") || hasTech("SIM")]);
  setCheckboxesInElement(doc, bodyChildren[202], [hasTech("ROBOT"), hasTech("ANNINH") || hasTech("SEC")]);
  setCheckboxesInElement(doc, bodyChildren[203], [hasTech("AR"), hasTech("IOT")]);
  setCheckboxesInElement(doc, bodyChildren[204], [hasTech("VR"), hasTech("VATLIEU")]);
  setCheckboxesInElement(doc, bodyChildren[205], [hasTech("BIGDATA") || hasTech("AI"), hasTech("BLOCKCHAIN")]);
  setCheckboxesInElement(doc, bodyChildren[206], [hasTech("TICHHOP"), hasTech("3D")]);

  setCheckboxesInElement(doc, bodyChildren[209], [data.digitalAdoptionScope === "nghien_cuu"]);
  setCheckboxesInElement(doc, bodyChildren[210], [data.digitalAdoptionScope === "mot_so_bo_phan"]);
  setCheckboxesInElement(doc, bodyChildren[211], [data.digitalAdoptionScope === "toan_nha_may"]);

  setCheckboxesInElement(doc, bodyChildren[214], [data.academyPartnershipType === "du_an_rd"]);
  setCheckboxesInElement(doc, bodyChildren[215], [
    data.academyPartnershipType === "chuyen_gia_dao_tao",
  ]);

  // -----------------------------------------------------------------------
  // PAGE BREAK BETWEEN PHẦN I AND PHẦN II
  // -----------------------------------------------------------------------
  for (let idx = 225; idx <= 238; idx++) {
    if (bodyChildren[idx] && bodyChildren[idx].parentNode === body) {
      body.removeChild(bodyChildren[idx]);
    }
  }
  if (bodyChildren[224]) {
    const pBr = bodyChildren[224];
    while (pBr.firstChild) pBr.removeChild(pBr.firstChild);
    const r = doc.createElementNS(W_NS, "w:r");
    const br = doc.createElementNS(W_NS, "w:br");
    br.setAttributeNS(W_NS, "w:type", "page");
    r.appendChild(br);
    pBr.appendChild(r);
  }

  // -----------------------------------------------------------------------
  // PHẦN II: INSERT IMAGE 2 VISUAL SUMMARY + FILL TABLE #31 & TABLE #32
  // -----------------------------------------------------------------------
  const tblCriteria = topTables[31]; // bodyChildren[240]
  const tblSummary = topTables[32]; // bodyChildren[242]
  const dateLineP = bodyChildren[243];

  const visualXmlStr = `<root xmlns:w="${W_NS}">${buildVisualSummaryXmlFragments(
    assessment,
    radarRelId
  )}</root>`;
  const visualDoc = parser.parseFromString(visualXmlStr, "application/xml");
  const visualNodes = Array.from(visualDoc.documentElement.children);
  for (const vNode of visualNodes) {
    const imported = doc.importNode(vNode, true);
    body.insertBefore(imported, tblCriteria);
  }

  // Fill Table #31 (26 Criteria TC01..TC26)
  {
    const trs = getDirectChildren(tblCriteria, "tr");
    const criteriaMap = new Map<string, CriterionScore>();
    for (const c of score?.criteria || []) {
      criteriaMap.set(c.code.toUpperCase(), c);
    }

    for (let i = 1; i < trs.length; i++) {
      const tr = trs[i];
      const tcs = getDirectChildren(tr, "tc");
      const code = (tcs[1]?.textContent || "").trim().toUpperCase();
      const matched = criteriaMap.get(code) || score?.criteria?.[i - 1];
      if (matched) {
        const nameDisplay = matched.name + (matched.isBottleneck ? " [Điểm nghẽn]" : "");
        setCellText(doc, tcs[3], nameDisplay, {
          bold: matched.isBottleneck,
          align: "left",
        });
        setCellText(doc, tcs[4], `${matched.maxScore.toFixed(1)} đ`, { align: "right" });
        setCellText(doc, tcs[5], `${matched.achievedScore.toFixed(1)} đ`, {
          bold: true,
          align: "right",
          bgColor: matched.isBottleneck ? "FEE2E2" : undefined,
        });
      }
    }
  }

  // Fill Table #32 (Summary Box 5 rows)
  {
    const totalScore = score?.totalScore !== undefined ? score.totalScore.toFixed(1) : "0.0";
    const syncCoeff =
      score?.syncCoefficient !== undefined ? score.syncCoefficient.toFixed(2) : "0.00";
    const classification = score?.classificationLabel || score?.classification || "CHƯA XẾP LOẠI";
    const trs = getDirectChildren(tblSummary, "tr");

    if (trs[0]) {
      const tcs = getDirectChildren(trs[0], "tc");
      if (tcs[1]) setCellText(doc, tcs[1], `${totalScore} / 100 điểm`, { bold: true, bgColor: "F8FAFC" });
    }
    if (trs[1]) {
      const tcs = getDirectChildren(trs[1], "tc");
      if (tcs[1]) setCellText(doc, tcs[1], syncCoeff, { bold: true, bgColor: "F8FAFC" });
    }
    if (trs[2]) {
      const tcs = getDirectChildren(trs[2], "tc");
      if (tcs[1]) setCellText(doc, tcs[1], classification, { bold: true, bgColor: "ECFDF5" });
    }
    if (trs[3]) {
      const tcs = getDirectChildren(trs[3], "tc");
      if (tcs[1]) {
        setCellText(
          doc,
          tcs[1],
          `Nhóm T: ${score?.scoreT?.toFixed(1) || 0}/30đ  |  Nhóm E: ${score?.scoreE?.toFixed(1) || 0}/20đ  |  Nhóm O: ${score?.scoreO?.toFixed(1) || 0}/19đ  |  Nhóm R: ${score?.scoreR?.toFixed(1) || 0}/17đ  |  Nhóm I: ${score?.scoreI?.toFixed(1) || 0}/14đ`
        );
      }
    }
    if (trs[4]) {
      const tcs = getDirectChildren(trs[4], "tc");
      if (tcs[1]) {
        setCellText(
          doc,
          tcs[1],
          safeText(
            assessment.reviewNotes,
            "Hồ sơ đánh giá trực tuyến hợp lệ trên Cổng kết nối chuỗi cung ứng BACLINK."
          ),
          { italic: true }
        );
      }
    }
  }

  // Date line before signatures (bodyChildren[243])
  if (dateLineP) {
    setParagraphRuns(doc, dateLineP, [
      {
        text: `.............., Ngày ..... tháng ..... năm ${year}   `,
        italic: true,
        size: 21,
      },
    ]);
  }

  const updatedDocXml = serializeXmlWithDecl(doc);
  await setEntryText(entries, "word/document.xml", updatedDocXml);

  const outZipBytes = buildZipArchive(entries);
  return new Blob([new Uint8Array(outZipBytes)], { type: DOCX_MIME_TYPE });
}
