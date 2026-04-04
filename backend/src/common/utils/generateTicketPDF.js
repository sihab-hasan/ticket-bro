"use strict";

// ─── Page geometry ────────────────────────────────────────────────────────────
const PAGE_W = 595;   // A4 width  (pt)
const PAGE_H = 842;   // A4 height (pt)
const ML = 50;        // margin left
const MR = 50;        // margin right
const CONTENT_W = PAGE_W - ML - MR;  // 495 pt

// ─── Brand colors (r g b, 0-1 floats as strings) ─────────────────────────────
const LIME   = "0.639 0.898 0.208";  // #a3e635
const DARK   = "0.059 0.090 0.161";  // #0f172a
const MUTED  = "0.392 0.455 0.545";  // #64748b
const LIGHT  = "0.973 0.980 0.988";  // #f8fafc
const BORDER = "0.886 0.910 0.941";  // #e2e8f0
const GREEN  = "0.086 0.639 0.239";  // paid status
const AMBER  = "0.851 0.592 0.027";  // pending status

// ─── String escaping ──────────────────────────────────────────────────────────
const esc = (v = "") =>
  String(v)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\r\n]+/g, " ");

// ─── Drawing primitives ───────────────────────────────────────────────────────

/** Filled rectangle (PDF y = 0 at bottom) */
const fillRect = (x, y, w, h, rgb) =>
  `${rgb} rg ${x} ${y} ${w} ${h} re f\n`;

/** Horizontal rule */
const hLine = (x, y, w, rgb, lw = 0.5) =>
  `${lw} w ${rgb} RG ${x} ${y} m ${x + w} ${y} l S\n`;

/** Vertical rule */
const vLine = (x, y1, y2, rgb, lw = 0.5) =>
  `${lw} w ${rgb} RG ${x} ${y1} m ${x} ${y2} l S\n`;

/** Text at absolute position */
const text = (str, x, y, { font = "F1", size = 10, rgb = DARK } = {}) =>
  `BT /${font} ${size} Tf ${rgb} rg ${x} ${y} Td (${esc(str)}) Tj ET\n`;

// ─── Text width estimation (Helvetica metrics, in pt) ─────────────────────────
// Average glyph widths derived from AFM data for Helvetica / Helvetica-Bold
const AVG_REGULAR = 0.556;
const AVG_BOLD    = 0.615;

const textWidth = (str, size, bold = false) =>
  String(str).length * (bold ? AVG_BOLD : AVG_REGULAR) * size;

/** Right-align text so its right edge sits at `rx` */
const textRight = (str, rx, y, opts = {}) => {
  const bold = opts.font === "F2";
  const w = textWidth(str, opts.size || 10, bold);
  return text(str, rx - w, y, opts);
};

/** Center text around `cx` */
const textCenter = (str, cx, y, opts = {}) => {
  const bold = opts.font === "F2";
  const w = textWidth(str, opts.size || 10, bold);
  return text(str, cx - w / 2, y, opts);
};

// ─── Simple word-wrap ─────────────────────────────────────────────────────────
/**
 * Draws text wrapped within `maxW` pt.
 * Returns { ops: string, nextY: number }
 */
const wrapText = (str, x, startY, maxW, opts = {}) => {
  const { size = 9, lineH = 13, font = "F1", rgb = DARK } = opts;
  const bold = font === "F2";
  const words = String(str).split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (textWidth(test, size, bold) > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);

  let ops = "";
  let y = startY;
  for (const line of lines) {
    ops += text(line, x, y, { font, size, rgb });
    y -= lineH;
  }
  return { ops, nextY: y };
};

// ─── Formatting helpers ───────────────────────────────────────────────────────
const fmtDate = (val, withTime = false) => {
  if (!val) return "N/A";
  try {
    const d = new Date(val);
    const base = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    if (!withTime) return base;
    const t = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `${base}, ${t}`;
  } catch { return String(val); }
};

const fmtMoney = (val, sym = "BDT") => {
  const n = parseFloat(val);
  return isNaN(n) ? `${sym} 0.00` : `${sym} ${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
};

// ─── Content stream builder ───────────────────────────────────────────────────
const buildContentStream = (invoice) => {
  const booking = invoice.booking || {};
  const event   = booking.event   || {};
  const venue   = event.venue     || {};
  const user    = booking.user    || {};
  const items   = Array.isArray(booking.items) ? booking.items : [];

  // ── Data extraction ─────────────────────────────────────────────────────
  const invoiceRef    = invoice.invoiceRef   || "N/A";
  const issuedAt      = fmtDate(invoice.issuedAt, true);
  const bookingRef    = booking.bookingRef   || "N/A";
  const customerName  = booking.contactName  || user.firstName || "Guest";
  const customerEmail = booking.contactEmail || user.email     || "N/A";
  const eventTitle    = event.title          || "N/A";
  const eventDate     = fmtDate(event.startDate);
  const venueLine     = [venue.name, venue.city].filter(Boolean).join(", ") || "N/A";
  const subtotal      = booking.subtotal     ?? 0;
  const total         = booking.totalAmount  ?? 0;
  const payStatus     = (booking.paymentStatus || "").toUpperCase();

  let s = "";

  // ─────────────────────────────────────────────────────────────────────────
  // 1. HEADER BAR
  // ─────────────────────────────────────────────────────────────────────────
  const HDR_Y = PAGE_H - 54;
  const HDR_H = 46;
  s += fillRect(0, HDR_Y, PAGE_W, HDR_H, LIME);
  s += text("TicketBro", ML, HDR_Y + 14, { font: "F2", size: 24, rgb: DARK });
  s += textRight("INVOICE", PAGE_W - MR, HDR_Y + 14, { font: "F2", size: 24, rgb: DARK });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. META STRIP  (4 columns: Invoice No | Issued | Booking Ref | Status)
  // ─────────────────────────────────────────────────────────────────────────
  const META_TOP = HDR_Y - 2;
  const META_H   = 48;
  const META_BOT = META_TOP - META_H;
  const C4       = CONTENT_W / 4;   // column width

  s += fillRect(ML, META_BOT, CONTENT_W, META_H, LIGHT);

  const metaCols = [
    { label: "INVOICE NO.",  value: invoiceRef, bold: true,  rgb: DARK  },
    { label: "ISSUED",       value: issuedAt,   bold: false, rgb: DARK  },
    { label: "BOOKING REF",  value: bookingRef,  bold: false, rgb: DARK  },
    { label: "STATUS",       value: payStatus,   bold: true,
      rgb: payStatus === "PAID" ? GREEN : payStatus ? AMBER : DARK },
  ];

  metaCols.forEach(({ label, value, bold, rgb: valRgb }, i) => {
    const cx = ML + C4 * i + 10;
    if (i > 0) s += vLine(ML + C4 * i, META_BOT + 6, META_TOP - 6, BORDER);
    s += text(label, cx, META_TOP - 14, { font: "F2", size: 7, rgb: MUTED });
    s += text(value, cx, META_TOP - 29, { font: bold ? "F2" : "F1", size: 10, rgb: valRgb });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. BILL TO / EVENT  (two-column panel)
  // ─────────────────────────────────────────────────────────────────────────
  let curY = META_BOT - 28;
  const HALF = CONTENT_W / 2 - 8;
  const RC   = ML + CONTENT_W / 2 + 8;  // right column x

  // Left: Bill To
  s += text("BILL TO", ML, curY, { font: "F2", size: 7, rgb: MUTED });
  s += text(customerName,  ML, curY - 16, { font: "F2", size: 11, rgb: DARK });
  s += text(customerEmail, ML, curY - 30, { font: "F1", size: 9,  rgb: MUTED });

  // Right: Event
  s += text("EVENT DETAILS", RC, curY, { font: "F2", size: 7, rgb: MUTED });
  const evWrap = wrapText(eventTitle, RC, curY - 16, HALF, { font: "F2", size: 11, rgb: DARK, lineH: 14 });
  s += evWrap.ops;
  s += text(eventDate, RC, evWrap.nextY,       { font: "F1", size: 9, rgb: MUTED });
  s += text(venueLine, RC, evWrap.nextY - 13,  { font: "F1", size: 9, rgb: MUTED });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. ITEMS TABLE
  // ─────────────────────────────────────────────────────────────────────────
  curY -= 60;
  s += hLine(ML, curY, CONTENT_W, DARK, 1);
  curY -= 2;

  // Column x positions
  const xTicket = ML;
  const xQty    = ML + CONTENT_W * 0.46;
  const xUnit   = ML + CONTENT_W * 0.58;
  const xRight  = ML + CONTENT_W;

  // Table header
  const TH_H = 22;
  s += fillRect(ML, curY - TH_H, CONTENT_W, TH_H, LIGHT);

  const thY = curY - TH_H + 7;
  s += text("TICKET TYPE",        xTicket + 6,  thY, { font: "F2", size: 8, rgb: DARK });
  s += textRight("QTY",           xQty - 4,     thY, { font: "F2", size: 8, rgb: DARK });
  s += textRight("UNIT PRICE",    xUnit - 4,    thY, { font: "F2", size: 8, rgb: DARK });
  s += textRight("TOTAL",         xRight - 6,   thY, { font: "F2", size: 8, rgb: DARK });
  s += hLine(ML, curY - TH_H, CONTENT_W, DARK, 0.75);
  curY -= TH_H;

  // Data rows
  const ROW_H = 26;
  if (items.length === 0) {
    curY -= ROW_H;
    s += text("No items found.", xTicket + 6, curY + 9, { font: "F1", size: 9, rgb: MUTED });
  } else {
    items.forEach((item, idx) => {
      const name = item.ticketTypeName || item.ticketType?.name || "Ticket";
      const qty  = String(item.quantity ?? 1);
      const unit = fmtMoney(item.unitPrice  ?? 0);
      const tot  = fmtMoney(item.totalPrice ?? 0);

      if (idx % 2 === 1) s += fillRect(ML, curY - ROW_H, CONTENT_W, ROW_H, LIGHT);
      const rowY = curY - ROW_H + 9;

      s += text(name,          xTicket + 6, rowY, { font: "F1", size: 9, rgb: DARK  });
      s += textRight(qty,      xQty  - 4,   rowY, { font: "F1", size: 9, rgb: DARK  });
      s += textRight(unit,     xUnit - 4,   rowY, { font: "F1", size: 9, rgb: DARK  });
      s += textRight(tot,      xRight - 6,  rowY, { font: "F1", size: 9, rgb: DARK  });
      s += hLine(ML, curY - ROW_H, CONTENT_W, BORDER, 0.3);
      curY -= ROW_H;
    });
  }

  s += hLine(ML, curY, CONTENT_W, DARK, 1);
  curY -= 12;

  // ─────────────────────────────────────────────────────────────────────────
  // 5. TOTALS BLOCK  (right-aligned, ~40% width)
  // ─────────────────────────────────────────────────────────────────────────
  const TOT_W  = CONTENT_W * 0.42;
  const TOT_X  = ML + CONTENT_W - TOT_W;
  const TOT_LX = TOT_X + 10;
  const TOT_RX = xRight - 6;

  // Subtotal row
  s += text("Subtotal",                TOT_LX, curY, { font: "F1", size: 9,  rgb: DARK });
  s += textRight(fmtMoney(subtotal),   TOT_RX, curY, { font: "F1", size: 9,  rgb: DARK });

  curY -= 14;
  s += hLine(TOT_X, curY, TOT_W, BORDER, 0.5);
  curY -= 6;

  // Total Due – lime highlight
  const TOTAL_H = 30;
  s += fillRect(TOT_X, curY - TOTAL_H, TOT_W, TOTAL_H, LIME);
  const totY = curY - TOTAL_H + 10;
  s += text("TOTAL DUE",             TOT_LX, totY, { font: "F2", size: 10, rgb: DARK });
  s += textRight(fmtMoney(total),    TOT_RX, totY, { font: "F2", size: 13, rgb: DARK });

  // ─────────────────────────────────────────────────────────────────────────
  // 6. FOOTER
  // ─────────────────────────────────────────────────────────────────────────
  s += hLine(ML, 42, CONTENT_W, BORDER, 0.5);
  s += textCenter(
    "Thank you for booking with TicketBro  \xb7  support@ticketbro.com  \xb7  ticketbro.com",
    PAGE_W / 2, 28,
    { font: "F1", size: 8, rgb: MUTED }
  );

  return s;
};

// ─── PDF object / xref / trailer assembly ────────────────────────────────────
const createObj = (id, body) => `${id} 0 obj\n${body}\nendobj\n`;

const buildPdf = (invoice) => {
  const stream    = buildContentStream(invoice);
  const streamLen = Buffer.byteLength(stream, "latin1");

  const objects = [
    createObj(1, "<< /Type /Catalog /Pages 2 0 R >>"),
    createObj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
    createObj(3,
      `<< /Type /Page /Parent 2 0 R` +
      ` /MediaBox [0 0 ${PAGE_W} ${PAGE_H}]` +
      ` /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >>` +
      ` /Contents 4 0 R >>`
    ),
    createObj(4, `<< /Length ${streamLen} >>\nstream\n${stream}endstream`),
    createObj(5, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"),
    createObj(6, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"),
  ];

  const header = "%PDF-1.4\n";
  const body   = objects.join("");

  // Build xref table
  let offset = Buffer.byteLength(header, "latin1");
  const offsets = objects.map((obj) => {
    const v = offset;
    offset += Buffer.byteLength(obj, "latin1");
    return v;
  });

  const xref = [
    "xref",
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n `),
  ].join("\n") + "\n";

  const trailer =
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`;

  return Buffer.concat([
    Buffer.from(header,  "latin1"),
    Buffer.from(body,    "latin1"),
    Buffer.from(xref,    "latin1"),
    Buffer.from(trailer, "latin1"),
  ]);
};

// ─── Public API ───────────────────────────────────────────────────────────────
const generateInvoicePDF = (invoice) => buildPdf(invoice);

module.exports = { generateInvoicePDF };