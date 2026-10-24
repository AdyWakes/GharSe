// Builds deck/GharSe_Pitch.pptx (16:9, 13.333 x 7.5 in).
// Usage (from deck/build): npm install && node build.js
// Then export the PDF with LibreOffice (see deck/README.md).
"use strict";

const path = require("node:path");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const sharp = require("sharp");
const pptxgen = require("pptxgenjs");
const lu = require("react-icons/lu");
const { applyTheme } = require(process.env.APPLY_THEME || "./apply_theme.js");

const OUT = path.resolve(__dirname, "..", "GharSe_Pitch.pptx");

// ------------------------------------------------------------------ theme
const HEX = {
  ink: "1E1B18",
  muted: "5E554D",
  bg: "FBF7F0",
  white: "FFFFFF",
  chilli: "9E2B25",
  turmeric: "E0A526",
  turmericTint: "F7E9C6",
  chilliTint: "F3DEDA",
  line: "D8CDBF",
  chilliDark: "7A1F1A",
};

const THEME = {
  name: "GharSe",
  headFontFace: "DM Serif Display",
  bodyFontFace: "Inter",
  colors: {
    dk1: HEX.ink,
    lt1: HEX.white,
    dk2: HEX.muted,
    lt2: HEX.bg,
    accent1: HEX.chilli,
    accent2: HEX.turmeric,
    accent3: HEX.turmericTint,
    accent4: HEX.chilliTint,
    accent5: HEX.line,
    accent6: HEX.chilliDark,
    hlink: HEX.chilli,
    folHlink: HEX.chilliDark,
  },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "GharSe: from home kitchen to store shelf";
pres.subject = "Tech4Bharat, GAVS 2026, Agentic AI track, Problem 6.3";
pres.author = "GharSe team";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };

const C = pres.SchemeColor;
const COL = {
  ink: C.text1,
  muted: C.text2,
  white: C.background1,
  bg: C.background2,
  chilli: C.accent1,
  turmeric: C.accent2,
  turmericTint: C.accent3,
  chilliTint: C.accent4,
  line: C.accent5,
  chilliDark: C.accent6,
};
const HEAD = "+mj-lt"; // theme heading font
const W = 13.333;
const M = 0.6; // side margin
const CW = W - 2 * M; // content width

// ---------------------------------------------------------------- layouts
// Layout text objects only take a plain string, so the footer wordmark is one colour.
const footerWordmark = (color) => ({
  text: {
    text: "GharSe",
    options: { x: M, y: 6.98, w: 2, h: 0.32, fontFace: HEAD, fontSize: 14, color, margin: 0, valign: "middle" },
  },
});

pres.defineSlideMaster({
  title: "Cover",
  background: { color: HEX.chilli },
  objects: [],
});

pres.defineSlideMaster({
  title: "Content",
  background: { color: HEX.bg },
  margin: [0.45, M, 0.6, M],
  objects: [
    {
      placeholder: {
        options: {
          name: "title",
          type: "title",
          x: M,
          y: 0.42,
          w: CW,
          h: 0.85,
          fontSize: 38,
          color: COL.ink,
          align: "left",
          valign: "middle",
          margin: 0,
        },
        text: "",
      },
    },
    footerWordmark(COL.muted),
  ],
  slideNumber: { x: W - M - 1, y: 6.98, w: 1, h: 0.32, fontSize: 12, color: COL.muted, align: "right", margin: 0 },
});

pres.defineSlideMaster({
  title: "Closing",
  background: { color: HEX.chilli },
  objects: [],
  slideNumber: { x: W - M - 1, y: 6.98, w: 1, h: 0.32, fontSize: 12, color: COL.bg, align: "right", margin: 0 },
});

// ---------------------------------------------------------------- helpers
const iconCache = new Map();
async function iconPng(name, hexColor) {
  const key = `${name}:${hexColor}`;
  if (!iconCache.has(key)) {
    const Icon = lu[name];
    if (!Icon) throw new Error(`missing icon ${name}`);
    const svg = renderToStaticMarkup(React.createElement(Icon, { size: 256, color: `#${hexColor}` }));
    const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
    iconCache.set(key, "image/png;base64," + buf.toString("base64"));
  }
  return iconCache.get(key);
}

let objCounter = 0;
const oid = (p) => `${p}-${++objCounter}`;

function txt(slide, text, opts) {
  slide.addText(text, {
    isTextBox: true,
    margin: 0,
    color: COL.ink,
    fontSize: 24,
    valign: "top",
    objectName: oid("text"),
    ...opts,
  });
}

const softShadow = () => ({ type: "outer", color: HEX.ink, opacity: 0.1, blur: 10, offset: 2, angle: 90 });

function card(slide, x, y, w, h, opts = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x,
    y,
    w,
    h,
    rectRadius: opts.radius ?? 0.14,
    fill: { color: opts.fill ?? COL.white },
    line: opts.line ? { color: opts.line, width: opts.lineWidth ?? 1 } : { type: "none" },
    shadow: opts.shadow === false ? undefined : softShadow(),
    objectName: oid(opts.name ?? "card"),
  });
}

/** Icon centred in a filled circle: the deck's repeating motif. */
async function iconCircle(slide, icon, x, y, d, bg, fgHex) {
  slide.addShape(pres.shapes.OVAL, {
    x,
    y,
    w: d,
    h: d,
    fill: { color: bg },
    line: { type: "none" },
    objectName: oid("icon-bg"),
  });
  const pad = d * 0.24;
  slide.addImage({
    data: await iconPng(icon, fgHex),
    x: x + pad,
    y: y + pad,
    w: d - 2 * pad,
    h: d - 2 * pad,
    altText: icon.replace(/^Lu/, "") + " icon",
    objectName: oid("icon"),
  });
}

function arrow(slide, x1, y1, x2, y2, color = COL.chilli, width = 2.5) {
  const flipH = x2 < x1;
  const flipV = y2 < y1;
  slide.addShape(pres.shapes.LINE, {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    w: Math.abs(x2 - x1),
    h: Math.abs(y2 - y1),
    flipH,
    flipV,
    line: { color, width, endArrowType: "triangle" },
    objectName: oid("arrow"),
  });
}

function line(slide, x1, y1, x2, y2, color = COL.line, width = 2) {
  slide.addShape(pres.shapes.LINE, {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    w: Math.abs(x2 - x1),
    h: Math.abs(y2 - y1),
    line: { color, width },
    objectName: oid("line"),
  });
}

function chip(slide, text, x, y, w, opts = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x,
    y,
    w,
    h: opts.h ?? 0.4,
    rectRadius: 0.2,
    fill: { color: opts.fill ?? COL.turmericTint },
    line: { type: "none" },
    objectName: oid("chip"),
  });
  txt(slide, text, {
    x,
    y,
    w,
    h: opts.h ?? 0.4,
    fontSize: opts.fontSize ?? 13,
    bold: true,
    charSpacing: opts.charSpacing ?? 1.5,
    align: "center",
    valign: "middle",
    color: opts.color ?? COL.ink,
  });
}

function sectionSlide(sectionTitle, title) {
  const s = pres.addSlide({ masterName: "Content", sectionTitle });
  s.addText(title, { placeholder: "title" });
  return s;
}

// ================================================================= slides
async function build() {
  // ---------------------------------------------------------------- 1 cover
  pres.addSection({ title: "Opening" });
  {
    const s = pres.addSlide({ masterName: "Cover", sectionTitle: "Opening" });
    txt(s, [
      { text: "Ghar", options: { color: COL.bg } },
      { text: "Se", options: { color: COL.turmeric } },
    ], { x: M + 0.1, y: 1.15, w: 7.6, h: 1.5, fontFace: HEAD, fontSize: 96, valign: "middle" });
    txt(s, [
      { text: "From home kitchen", options: { breakLine: true } },
      { text: "to store shelf" },
    ], { x: M + 0.1, y: 2.75, w: 7.6, h: 1.45, fontFace: HEAD, fontSize: 40, italic: true, color: COL.bg });
    txt(s, [
      { text: "Tech4Bharat, GAVS 2026", options: { breakLine: true } },
      { text: "Agentic AI track  ·  Problem 6.3" },
    ], { x: M + 0.1, y: 4.5, w: 7.6, h: 0.85, fontSize: 20, color: COL.bg });
    txt(s, "Team: [Team name]  ·  [Founder names]", {
      x: M + 0.1, y: 5.55, w: 7.6, h: 0.45, fontSize: 20, bold: true, color: COL.bg,
    });

    // A label being filled in: the product's core output, drawn as shapes.
    const lx = 8.75, ly = 1.15, lw = 3.95, lh = 5.2;
    card(s, lx, ly, lw, lh, { fill: COL.bg, radius: 0.18, name: "label-mock" });
    txt(s, "Aam ka Achaar", { x: lx + 0.35, y: ly + 0.3, w: lw - 0.7, h: 0.6, fontFace: HEAD, fontSize: 28, color: COL.chilli });
    txt(s, "Home-made mango pickle  ·  400 g", { x: lx + 0.35, y: ly + 0.88, w: lw - 0.7, h: 0.35, fontSize: 13, color: COL.muted });
    const fields = ["Ingredients", "Allergens", "Batch no.", "Best before", "FSSAI Reg. no.", "MRP"];
    fields.forEach((f, i) => {
      const fy = ly + 1.45 + i * 0.52;
      txt(s, f, { x: lx + 0.35, y: fy, w: 1.55, h: 0.32, fontSize: 13, bold: true, color: COL.ink, valign: "bottom" });
      line(s, lx + 1.95, fy + 0.3, lx + lw - 0.35, fy + 0.3, COL.line, 1.5);
    });
    chip(s, "DRAFT · CHECK BEFORE PRINTING", lx + 0.35, ly + lh - 0.68, lw - 0.7, { fill: COL.turmeric, fontSize: 11, charSpacing: 0.5 });

    s.addNotes(
      "Hi, we are GharSe. Ghar se means 'from home'.\n" +
        "We help home food makers take a product from their kitchen to a store shelf.\n" +
        "We're building for Problem 6.3 in the Agentic AI track."
    );
  }

  // ------------------------------------------------------- 2 meet the maker
  pres.addSection({ title: "Problem" });
  {
    const s = sectionSlide("Problem", "Meet the maker");
    chip(s, "ILLUSTRATIVE STORY", W - M - 2.6, 0.64, 2.6);

    txt(s, "A home pickle maker in Ghaziabad. Her neighbours love her aam ka achaar.", {
      x: M, y: 1.55, w: 6.3, h: 0.95,
    });

    card(s, M, 2.7, 6.3, 2.35);
    txt(s, "A local store and an online marketplace both say:", {
      x: M + 0.35, y: 2.92, w: 5.6, h: 0.4, fontSize: 16, color: COL.muted,
    });
    txt(s, "“Bring a proper label, a batch number and your FSSAI registration.”", {
      x: M + 0.35, y: 3.35, w: 5.6, h: 1.5, fontFace: HEAD, fontSize: 28, color: COL.chilli,
    });

    const rx = 7.45, rw = W - M - rx;
    txt(s, "TODAY", { x: rx, y: 1.6, w: rw, h: 0.35, fontSize: 14, bold: true, charSpacing: 2, color: COL.muted });
    const today = [
      ["LuPenLine", "Labels are handwritten"],
      ["LuBrain", "Batches live in memory"],
      ["LuIndianRupee", "Prices are guesswork"],
      ["LuFileText", "Registered once, or never"],
    ];
    for (const [i, [icon, label]] of today.entries()) {
      const y = 2.1 + i * 0.75;
      await iconCircle(s, icon, rx, y, 0.58, COL.turmericTint, HEX.chilli);
      txt(s, label, { x: rx + 0.8, y, w: rw - 0.8, h: 0.58, valign: "middle" });
    }

    card(s, M, 5.45, CW, 1.15, { fill: COL.chilli });
    txt(s, [
      { text: "Result: ", options: { bold: true } },
      { text: "she stays local, and often sells below her true cost without knowing it." },
    ], { x: M + 0.4, y: 5.45, w: CW - 0.8, h: 1.15, fontSize: 26, color: COL.bg, valign: "middle" });

    s.addNotes(
      "Picture a home pickle maker in Ghaziabad. This is an illustrative story, not a real person.\n" +
        "Her pickle sells out in her lane, but every store and marketplace asks for the same three things: a proper label, a batch number, and FSSAI registration.\n" +
        "She has none of them in a form a buyer trusts, so she stays local. Worse, she often sells below her real cost and has no way to know it."
    );
  }

  // ----------------------------------------------------------- 3 the scale
  {
    const s = sectionSlide("Problem", "The scale of it");
    const cw = (CW - 2 * 0.3) / 3;
    const cy = 1.6, ch = 4.55;
    const big = (n, unit) => [
      { text: n, options: { fontSize: 66 } },
      ...(unit ? [{ text: unit, options: { fontSize: 32 } }] : []),
    ];
    // Card 1
    let x = M;
    card(s, x, cy, cw, ch);
    txt(s, big("~25", " lakh"), { x: x + 0.35, y: cy + 0.3, w: cw - 0.7, h: 1.1, fontFace: HEAD, color: COL.chilli, valign: "bottom" });
    txt(s, "unregistered, informal food processing enterprises in India", {
      x: x + 0.35, y: cy + 1.55, w: cw - 0.7, h: 1.7,
    });
    txt(s, "About 98% of the sector", { x: x + 0.35, y: cy + 3.5, w: cw - 0.7, h: 0.75, bold: true, color: COL.chilli });

    // Card 2
    x = M + cw + 0.3;
    card(s, x, cy, cw, ch);
    txt(s, big("~66%"), { x: x + 0.35, y: cy + 0.3, w: cw - 0.7, h: 1.1, fontFace: HEAD, color: COL.chilli, valign: "bottom" });
    txt(s, "are in rural areas", { x: x + 0.35, y: cy + 1.5, w: cw - 0.7, h: 0.5 });
    line(s, x + 0.35, cy + 2.27, x + cw - 0.35, cy + 2.27, COL.line, 1.5);
    txt(s, big("~80%"), { x: x + 0.35, y: cy + 2.45, w: cw - 0.7, h: 1.1, fontFace: HEAD, color: COL.chilli, valign: "bottom" });
    txt(s, "are family-based", { x: x + 0.35, y: cy + 3.65, w: cw - 0.7, h: 0.5 });

    // Card 3
    x = M + 2 * (cw + 0.3);
    card(s, x, cy, cw, ch, { fill: COL.turmericTint });
    txt(s, big("~1.96", " lakh"), { x: x + 0.35, y: cy + 0.3, w: cw - 0.7, h: 1.1, fontFace: HEAD, color: COL.chilli, valign: "bottom" });
    txt(s, "micro food enterprises already supported by the PMFME scheme", {
      x: x + 0.35, y: cy + 1.55, w: cw - 0.7, h: 1.7,
    });
    txt(s, "The demand to formalise is real", { x: x + 0.35, y: cy + 3.5, w: cw - 0.7, h: 0.75, bold: true, color: COL.chilli });

    txt(s,
      "Sources: Cabinet approval of the PMFME scheme, pmindia.gov.in (May 2020; estimates from NSSO 73rd round and ASI 2015-16). " +
        "PMFME progress: MoFPI media briefing, May 2026, as reported by KNN India.",
      { x: M, y: 6.3, w: CW, h: 0.55, fontSize: 12, color: COL.muted, valign: "bottom" });

    s.addNotes(
      "This is not one woman. When the government approved the PMFME scheme, it estimated about 25 lakh unregistered food processing units: 98 percent of the sector.\n" +
        "Two thirds are rural, and four in five are family-run, just like our maker.\n" +
        "And the demand to formalise is real: PMFME has already supported around 1.96 lakh micro food enterprises. The government is pushing this; the gap is the last mile."
    );
  }

  // ---------------------------------------------------- 4 why still unsolved
  {
    const s = sectionSlide("Problem", "Why it's still unsolved");
    txt(s, "Each step alone is easy. Together, in English forms and regulation PDFs, they lock her out.", {
      x: M, y: 1.4, w: CW, h: 0.85,
    });
    const steps = [
      ["LuFileCheck", "Registration", "Which one? What documents?"],
      ["LuTag", "Label", "Weight order, allergens, nutrition, batch, dates"],
      ["LuCalculator", "Costing", "Does her price even cover cost?"],
      ["LuClipboardList", "Records", "Which batch went to whom?"],
    ];
    const gw = (CW - 3 * 0.3) / 4;
    for (const [i, [icon, head, body]] of steps.entries()) {
      const x = M + i * (gw + 0.3), y = 2.35;
      card(s, x, y, gw, 2.95);
      await iconCircle(s, icon, x + 0.28, y + 0.25, 0.6, COL.chilli, HEX.bg);
      txt(s, head, { x: x + 0.28, y: y + 0.95, w: gw - 0.5, h: 0.45, bold: true, valign: "middle" });
      txt(s, body, { x: x + 0.28, y: y + 1.45, w: gw - 0.5, h: 1.3, fontSize: 20, color: COL.muted });
    }

    txt(s, [
      { text: "What exists today: ", options: { bold: true } },
      { text: "consultants charge per registration, then stop. Canva doesn't know the rules. Billing apps skip compliance." },
    ], { x: M, y: 5.55, w: 6.85, h: 1.2, fontSize: 20, valign: "middle" });
    card(s, 7.75, 5.55, W - M - 7.75, 1.2, { fill: COL.chilli });
    txt(s, "Nobody joins it up, in Hindi, by voice.", {
      x: 8.1, y: 5.55, w: W - M - 8.45, h: 1.2, fontSize: 24, bold: true, color: COL.bg, valign: "middle",
    });

    s.addNotes(
      "None of these steps is hard on its own. The problem is that there are four of them, spread across English forms and regulation PDFs.\n" +
        "Which registration? How do you order ingredients on a label? Does your price even cover your cost? Which batch went where?\n" +
        "Consultants do the registration and leave. Design tools don't know the rules. Billing apps ignore compliance. Nobody connects the steps, in Hindi, by voice."
    );
  }

  // ------------------------------------------------------------- 5 solution
  pres.addSection({ title: "Solution" });
  {
    const s = sectionSlide("Solution", "GharSe: a Hindi-first AI agent on WhatsApp");
    txt(s, "She sends one voice note. GharSe makes her product shelf-ready.", {
      x: M, y: 1.4, w: CW, h: 0.7, fontFace: HEAD, fontSize: 28, italic: true, color: COL.chilli, valign: "middle",
    });

    // Flow row
    const fy = 2.4, fh = 1.05;
    card(s, M, fy, 4.6, fh);
    await iconCircle(s, "LuMic", M + 0.25, fy + 0.22, 0.6, COL.turmericTint, HEX.chilli);
    await iconCircle(s, "LuCamera", M + 0.95, fy + 0.22, 0.6, COL.turmericTint, HEX.chilli);
    txt(s, "Voice note or recipe photo", { x: M + 1.75, y: fy, w: 2.7, h: fh, fontSize: 22, bold: true, valign: "middle" });
    arrow(s, M + 4.75, fy + fh / 2, 6.25, fy + fh / 2);
    card(s, 6.4, fy, 3.5, fh, { fill: COL.chilli });
    txt(s, "GharSe agent", { x: 6.4, y: fy, w: 3.5, h: fh, fontFace: HEAD, fontSize: 30, color: COL.bg, align: "center", valign: "middle" });
    arrow(s, 10.05, fy + fh / 2, 11.0, fy + fh / 2);
    txt(s, "6 outputs", { x: 11.1, y: fy, w: W - M - 11.1, h: fh, fontSize: 24, bold: true, color: COL.chilli, valign: "middle" });

    const outs = [
      ["LuIndianRupee", "True cost + minimum price"],
      ["LuTag", "Draft label (PDF), FSSAI format"],
      ["LuAudioLines", "Batch records by voice"],
      ["LuListChecks", "Registration checklist"],
      ["LuStore", "Listing pack, Hindi + English"],
      ["LuBell", "Proactive nudges"],
    ];
    const gw = (CW - 2 * 0.3) / 3, gh = 1.3;
    for (const [i, [icon, label]] of outs.entries()) {
      const x = M + (i % 3) * (gw + 0.3);
      const y = 3.85 + Math.floor(i / 3) * (gh + 0.3);
      card(s, x, y, gw, gh);
      await iconCircle(s, icon, x + 0.28, y + (gh - 0.66) / 2, 0.66, COL.chilli, HEX.bg);
      txt(s, label, { x: x + 1.15, y, w: gw - 1.4, h: gh, fontSize: 22, valign: "middle" });
    }

    s.addNotes(
      "GharSe is an AI agent that lives where she already is: WhatsApp, in Hindi.\n" +
        "She sends a voice note or a photo of her handwritten recipe. That's the whole interface.\n" +
        "Out come six things: her true cost and minimum price, a draft FSSAI-format label, batch records she keeps by voice, a registration checklist, a marketplace listing pack, and nudges when something needs attention."
    );
  }

  // --------------------------------------------------------- 6 agent loop
  {
    const s = sectionSlide("Solution", "How it works: the agent loop");
    txt(s, "READINESS TRACKER, FOR EACH PRODUCT", {
      x: M, y: 1.42, w: 7, h: 0.35, fontSize: 14, bold: true, charSpacing: 2, color: COL.muted,
    });
    const steps = [
      ["Recipe", "done"],
      ["Costing", "done"],
      ["Label", "doing"],
      ["Registration", "todo"],
      ["Listing", "todo"],
    ];
    const tx0 = 1.6, tx1 = W - 1.6, ty = 2.25, d = 0.7;
    const step = (tx1 - tx0) / (steps.length - 1);
    line(s, tx0, ty, tx1, ty, COL.line, 3);
    line(s, tx0, ty, tx0 + 2 * step, ty, COL.chilli, 3);
    for (const [i, [label, state]] of steps.entries()) {
      const cx = tx0 + i * step;
      if (state === "done") {
        s.addShape(pres.shapes.OVAL, { x: cx - d / 2, y: ty - d / 2, w: d, h: d, fill: { color: COL.chilli }, line: { type: "none" }, objectName: oid("node") });
        s.addImage({ data: await iconPng("LuCheck", HEX.bg), x: cx - 0.2, y: ty - 0.2, w: 0.4, h: 0.4, altText: "done", objectName: oid("check") });
      } else if (state === "doing") {
        s.addShape(pres.shapes.OVAL, { x: cx - d / 2, y: ty - d / 2, w: d, h: d, fill: { color: COL.white }, line: { color: COL.turmeric, width: 4 }, objectName: oid("node") });
        s.addShape(pres.shapes.OVAL, { x: cx - 0.17, y: ty - 0.17, w: 0.34, h: 0.34, fill: { color: COL.turmeric }, line: { type: "none" }, objectName: oid("node-dot") });
      } else {
        s.addShape(pres.shapes.OVAL, { x: cx - d / 2, y: ty - d / 2, w: d, h: d, fill: { color: COL.white }, line: { color: COL.line, width: 3 }, objectName: oid("node") });
      }
      const sub = state === "done" ? "done" : state === "doing" ? "next step" : "missing";
      txt(s, [
        { text: label, options: { bold: true, breakLine: true } },
        { text: sub, options: { fontSize: 16, color: state === "doing" ? COL.chilli : COL.muted, bold: state === "doing" } },
      ], { x: cx - 1.2, y: ty + 0.48, w: 2.4, h: 0.8, fontSize: 20, align: "center" });
    }

    txt(s, "The agent finds the next missing step and asks for it.", {
      x: M, y: 3.7, w: 5.4, h: 1.15, fontFace: HEAD, fontSize: 30, color: COL.ink,
    });
    txt(s, "One short question at a time, in simple spoken Hindi.", {
      x: M, y: 5.0, w: 5.2, h: 0.85,
    });

    // Chat panel
    const px = 6.35, py = 3.42, pw = W - M - px, ph = 3.45;
    card(s, px, py, pw, ph, { fill: COL.turmericTint, shadow: false, radius: 0.18 });
    // Her voice note (right)
    const b1w = pw - 0.5;
    card(s, px + 0.25, py + 0.2, b1w, 0.85, { fill: COL.white, radius: 0.12, shadow: false });
    s.addImage({ data: await iconPng("LuMic", HEX.chilli), x: px + 0.45, y: py + 0.44, w: 0.36, h: 0.36, altText: "voice note", objectName: oid("mic") });
    txt(s, "“5 kilo aam, 1 kilo namak, 2 katori mirchi”", {
      x: px + 0.95, y: py + 0.2, w: b1w - 0.85, h: 0.85, fontSize: 20, italic: true, valign: "middle",
    });
    // GharSe replies
    card(s, px + 0.25, py + 1.2, 5.2, 0.75, { fill: COL.bg, radius: 0.12, shadow: false });
    txt(s, "2 katori mirchi lagbhag 200 gram hai. Sahi hai?", {
      x: px + 0.45, y: py + 1.2, w: 4.9, h: 0.75, fontSize: 20, valign: "middle",
    });
    card(s, px + 0.25, py + 2.1, b1w, 1.15, { fill: COL.bg, radius: 0.12, shadow: false });
    txt(s, "Aapka daam ₹120 hai, lekin ek jar ki lagat ₹134 aa rahi hai. Kam se kam ₹149 rakhein?", {
      x: px + 0.45, y: py + 2.1, w: b1w - 0.4, h: 1.15, fontSize: 20, valign: "middle",
    });
    txt(s, "Chat numbers are illustrative.", { x: M, y: 6.3, w: 5, h: 0.35, fontSize: 14, color: COL.muted });

    s.addNotes(
      "This is what makes it an agent, not a form. For every product, GharSe tracks five steps: recipe, costing, label, registration and listing.\n" +
        "It works out the next missing step itself and asks only for that, one short question at a time, in everyday Hindi.\n" +
        "Here she says '2 katori mirchi'. GharSe converts it, then asks her to confirm. Then it spots that her price is below her cost and suggests a minimum. These numbers are illustrative."
    );
  }

  // ------------------------------------------------------------ 7 trusted
  {
    const s = sectionSlide("Solution", "Built to be trusted");
    // Architecture
    const ax = M, aw = 5.55;
    const box = (y, h, title, body, fill, color) => {
      card(s, ax, y, aw, h, { fill, shadow: fill === COL.white ? undefined : false });
      txt(s, body ? [
        { text: title, options: { bold: true, breakLine: true } },
        { text: body, options: { fontSize: 16 } },
      ] : title, { x: ax + 0.3, y, w: aw - 0.6, h, fontSize: 18, bold: !body, color, valign: "middle", align: "center" });
    };
    box(1.45, 0.58, "WhatsApp or web chat", null, COL.white, COL.ink);
    arrow(s, ax + aw / 2, 2.05, ax + aw / 2, 2.27);
    box(2.29, 0.8, "Agent", "LLM understands her and asks questions", COL.chilli, COL.bg);
    arrow(s, ax + aw * 0.25, 3.11, ax + aw * 0.25, 3.33);
    arrow(s, ax + aw * 0.75, 3.11, ax + aw * 0.75, 3.33);
    const hw = (aw - 0.25) / 2;
    const cTop = 3.35, cH = 1.3;
    card(s, ax, cTop, hw, cH, { fill: COL.turmericTint, shadow: false });
    txt(s, [
      { text: "Deterministic core", options: { bold: true, breakLine: true } },
      { text: "Costing, units, nutrition (IFCT), batch numbers", options: { fontSize: 16 } },
    ], { x: ax + 0.2, y: cTop, w: hw - 0.4, h: cH, fontSize: 18, align: "center", valign: "middle" });
    card(s, ax + hw + 0.25, cTop, hw, cH, { fill: COL.turmericTint, shadow: false });
    txt(s, [
      { text: "Rules file", options: { bold: true, breakLine: true } },
      { text: "Every FSSAI rule cited to its regulation", options: { fontSize: 16 } },
    ], { x: ax + hw + 0.45, y: cTop, w: hw - 0.4, h: cH, fontSize: 18, align: "center", valign: "middle" });
    arrow(s, ax + aw * 0.25, cTop + cH + 0.02, ax + aw * 0.25, cTop + cH + 0.24);
    arrow(s, ax + aw * 0.75, cTop + cH + 0.02, ax + aw * 0.75, cTop + cH + 0.24);
    box(cTop + cH + 0.26, 0.58, "PDF labels, checklists, listings", null, COL.white, COL.ink);

    // Principles
    const rx = 6.75, rw = W - M - rx;
    const principles = [
      ["LuCalculator", "The AI never does the maths.", "Every number comes from tested code."],
      ["LuBookOpen", "The AI never invents a rule.", "Rules are data with citations, so a rule change is a data update."],
      ["LuUserCheck", "A person signs off on every label and every cost.", "Safety certification stays with authorities and accredited labs."],
    ];
    const ys = [1.45, 2.7, 3.95];
    for (const [i, [icon, head, body]] of principles.entries()) {
      await iconCircle(s, icon, rx, ys[i] + 0.05, 0.62, COL.chilli, HEX.bg);
      txt(s, [
        { text: head, options: { bold: true, breakLine: true } },
        { text: body, options: { color: COL.muted } },
      ], { x: rx + 0.85, y: ys[i], w: rw - 0.85, h: i === 2 ? 1.45 : 1.25, fontSize: 20 });
    }

    // Built for
    const builtFor = [
      ["LuMic", "Low literacy", "Voice in, voice out"],
      ["LuWifi", "Low connectivity", "Small images, light pages"],
      ["LuSmartphone", "Cheap Android phones", "Big buttons, small app"],
    ];
    const bw = (CW - 2 * 0.3) / 3;
    for (const [i, [icon, head, sub]] of builtFor.entries()) {
      const x = M + i * (bw + 0.3), y = 5.85;
      card(s, x, y, bw, 0.9, { fill: COL.chilliTint, shadow: false, radius: 0.2 });
      s.addImage({ data: await iconPng(icon, HEX.chilli), x: x + 0.25, y: y + 0.24, w: 0.42, h: 0.42, altText: head, objectName: oid("icon") });
      txt(s, [
        { text: head, options: { bold: true, breakLine: true } },
        { text: sub, options: { fontSize: 15, color: COL.muted } },
      ], { x: x + 0.85, y, w: bw - 1.0, h: 0.9, fontSize: 18, valign: "middle" });
    }

    s.addNotes(
      "Food labels and prices have to be right, so we split the work. The AI understands her and asks questions. It never does the maths: costing, unit conversion, nutrition from the Indian Food Composition Tables, and batch numbers all live in plain code with unit tests.\n" +
        "It never invents a rule either. Every FSSAI rule is a data entry with its regulation and clause, so when the rules change, we update data, not prompts.\n" +
        "And a person signs off on every label and every cost. Certifying food safety stays with the authorities and accredited labs.\n" +
        "It's built for voice, slow networks and cheap phones."
    );
  }

  // ----------------------------------------------------- 8 business model
  pres.addSection({ title: "Business" });
  {
    const s = sectionSlide("Business", "Follow the money");
    const cy = 1.6, ch = 4.95, side = 3.3, mid = CW - 2 * side - 0.6;
    const cols = [
      { x: M, w: side, icon: "LuHouse", head: "Sellers", body: "Core is free. A paid plan adds unlimited products and print-ready label packs at [₹__/month], to be validated.", hi: false },
      { x: M + side + 0.3, w: mid, icon: "LuStore", head: "Buyers", body: "Retailers, ONDC seller apps and marketplaces spend effort finding small suppliers whose paperwork is in order. GharSe brings them compliance-ready producers. Paid per lead or by subscription.", hi: true },
      { x: M + side + mid + 0.6, w: side, icon: "LuHandshake", head: "Partners", body: "Referral fees from packaging and label printers, and from food testing labs for shelf-life tests.", hi: false },
    ];
    for (const c of cols) {
      card(s, c.x, cy, c.w, ch, { fill: c.hi ? COL.chilli : COL.white });
      await iconCircle(s, c.icon, c.x + 0.35, cy + 0.35, 0.66, c.hi ? COL.turmeric : COL.chilli, c.hi ? HEX.ink : HEX.bg);
      txt(s, c.head, { x: c.x + 1.2, y: cy + 0.35, w: c.w - 1.5, h: 0.66, fontFace: HEAD, fontSize: 32, color: c.hi ? COL.bg : COL.ink, valign: "middle" });
      txt(s, c.body, { x: c.x + 0.35, y: cy + 1.3, w: c.w - 0.7, h: ch - 1.6, fontSize: 22, color: c.hi ? COL.bg : COL.ink });
    }
    chip(s, "THE BIG ONE", M + side + 0.3 + mid - 2.15, cy + 0.48, 1.8, { fill: COL.turmeric });

    s.addNotes(
      "We follow the money in three directions.\n" +
        "Sellers get the core for free, with a paid plan for more products and print-ready label packs. We'll validate the price in our interviews.\n" +
        "The big one is buyers. Retailers, ONDC seller apps and marketplaces all struggle to find small suppliers whose paperwork is in order. We bring them those producers, paid per lead or by subscription.\n" +
        "And partners like label printers and testing labs pay referral fees."
    );
  }

  // ------------------------------------------------------------- 9 GTM
  {
    const s = sectionSlide("Business", "Go-to-market");
    const rows = [
      ["LuMapPin", "Wedge", "Home food sellers in Delhi NCR, reached through Instagram and WhatsApp seller communities.", 1.15],
      ["LuUsers", "Scale", "Self-help group federations and state rural livelihood missions, which already run formalisation programmes, plus food processing training institutes.", 1.55],
      ["LuDoorOpen", "Why now", "FSSAI simplified registration for small businesses in 2026, and ONDC is opening e-commerce to small sellers. The door is open; sellers just need help walking through it.", 1.85],
    ];
    let y = 1.5;
    for (const [icon, head, body, h] of rows) {
      card(s, M, y, CW, h);
      await iconCircle(s, icon, M + 0.35, y + (h - 0.66) / 2, 0.66, COL.chilli, HEX.bg);
      txt(s, head, { x: M + 1.25, y, w: 2.2, h, fontFace: HEAD, fontSize: 32, color: COL.chilli, valign: "middle" });
      txt(s, body, { x: M + 3.5, y, w: CW - 3.85, h, fontSize: 22, valign: "middle" });
      y += h + 0.25;
    }

    s.addNotes(
      "We start narrow: home food sellers in Delhi NCR, whom we can reach through Instagram and WhatsApp seller groups, and meet in person.\n" +
        "To scale, we go through the institutions that already run formalisation programmes: SHG federations, state rural livelihood missions and food processing training institutes.\n" +
        "Why now? FSSAI simplified registration for small businesses this year, and ONDC is opening e-commerce to small sellers. The door is open. Sellers need help walking through it."
    );
  }

  // ------------------------------------------------------- 10 roadmap
  pres.addSection({ title: "Plan" });
  {
    const s = sectionSlide("Plan", "Status and roadmap");
    const items = [
      ["Now", "Prototype in build", "Chat simulator, tested maths core, 2 demo products: aam ka achaar, besan ladoo", true],
      ["Nov 2026", "Field interviews", "with home food sellers in NCR. Findings: [to add]", false],
      ["Dec 2026", "End-to-end demo", "Voice note to label PDF, costing, batch, checklist and listing in under 3 minutes", false],
      ["Next 6 months", "Pilot", "with [__] sellers, WhatsApp live, first buyer-side partnership", false],
    ];
    const gw = (CW - 3 * 0.3) / 4, ly = 2.25;
    line(s, M + gw / 2, ly, W - M - gw / 2, ly, COL.line, 3);
    for (const [i, [when, lead, what, now]] of items.entries()) {
      const x = M + i * (gw + 0.3), cx = x + gw / 2;
      txt(s, when, { x, y: 1.4, w: gw, h: 0.55, fontFace: HEAD, fontSize: 28, color: COL.chilli, align: "center", valign: "middle" });
      s.addShape(pres.shapes.OVAL, {
        x: cx - 0.2, y: ly - 0.2, w: 0.4, h: 0.4,
        fill: { color: now ? COL.chilli : COL.white },
        line: now ? { type: "none" } : { color: COL.turmeric, width: 3 },
        objectName: oid("milestone"),
      });
      card(s, x, 2.6, gw, 3.0, { fill: now ? COL.chilliTint : COL.white, shadow: now ? false : undefined });
      txt(s, [
        { text: lead, options: { bold: true, breakLine: true } },
        { text: what },
      ], { x: x + 0.22, y: 2.78, w: gw - 0.44, h: 2.72, fontSize: 20 });
    }
    card(s, M, 5.85, CW, 0.9, { fill: COL.turmericTint, shadow: false });
    txt(s, [
      { text: "Pilot success metric: ", options: { bold: true } },
      { text: "[__] sellers with a compliant label and at least one sale beyond their town." },
    ], { x: M + 0.35, y: 5.85, w: CW - 0.7, h: 0.9, fontSize: 22, valign: "middle" });

    s.addNotes(
      "Where we are: the prototype is in build, with a WhatsApp-style chat, a tested maths core and two fully worked demo products.\n" +
        "In November we interview home food sellers in NCR. In December we show the full flow live: one voice note to a label, a costing, a batch, a checklist and a listing in under three minutes.\n" +
        "After that, a pilot. We'll judge it on one thing: sellers with a compliant label who make at least one sale beyond their town."
    );
  }

  // ------------------------------------------------------- 11 closing
  {
    const s = pres.addSlide({ masterName: "Closing", sectionTitle: "Plan" });
    txt(s, "Every home kitchen in India can be a brand. The paperwork shouldn't be the reason it isn't.", {
      x: M + 0.1, y: 0.8, w: 11.6, h: 2.3, fontFace: HEAD, fontSize: 44, color: COL.bg, valign: "middle",
    });
    txt(s, "WHAT WE'RE LOOKING FOR", { x: M + 0.1, y: 3.5, w: 8, h: 0.4, fontSize: 14, bold: true, charSpacing: 2, color: COL.turmeric });
    const asks = [
      ["LuHandshake", "Pilot partners: SHG federations, retail buyers, ONDC seller apps"],
      ["LuBookOpen", "Mentorship on food regulation"],
    ];
    for (const [i, [icon, label]] of asks.entries()) {
      const y = 4.05 + i * 0.85;
      await iconCircle(s, icon, M + 0.1, y, 0.62, COL.turmeric, HEX.ink);
      txt(s, label, { x: M + 0.95, y, w: 10.5, h: 0.62, color: COL.bg, valign: "middle" });
    }
    txt(s, [
      { text: "Ghar", options: { color: COL.bg } },
      { text: "Se", options: { color: COL.turmeric } },
    ], { x: M + 0.1, y: 5.95, w: 3, h: 0.7, fontFace: HEAD, fontSize: 40, valign: "middle" });
    txt(s, "[email]  ·  [GitHub repo link]", {
      x: 4.2, y: 5.95, w: W - M - 4.2, h: 0.7, fontSize: 20, color: COL.bg, align: "right", valign: "middle",
    });

    s.addNotes(
      "Every home kitchen in India can be a brand. The paperwork shouldn't be the reason it isn't.\n" +
        "We're looking for pilot partners: SHG federations, retail buyers and ONDC seller apps, and for mentors who know food regulation.\n" +
        "Thank you. We'd love to show you the live demo."
    );
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
