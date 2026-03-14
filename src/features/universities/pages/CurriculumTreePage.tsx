import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataEditor from "../components/DataEditor";
import { useUserRole } from "@/hooks/useUserRole";
import { ModeToggle } from "@/shared/ui/modetoggle";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import {
  getCurriculumsByMajor,
  createCurriculum,
  updateCurriculum,
  dtoToAppData,
  appDataToDto,
} from "../api/curriculumApi";

// ============================================================
const LAYOUT = { nodeW: 178, nodeH: 80, colGap: 90, rowGap: 54 };

// Per-column color palette (soft luminous pastels for dark backgrounds)
const COLUMN_COLORS = [
  "#FB7185", // 1 — Soft Rose
  "#FDBA74", // 2 — Peach
  "#FDE047", // 3 — Lemon
  "#86EFAC", // 4 — Mint
  "#67E8F9", // 5 — Sky
  "#93C5FD", // 6 — Periwinkle
  "#C4B5FD", // 7 — Lavender
  "#F9A8D4", // 8 — Blush
  "#1a1e69ff", // 9 — Blue
  "#4b0046ff", // 10 — Purple
  "#004b2aff", // 11 — Green
];
const getColColor = (col: number) =>
  COLUMN_COLORS[(col - 1) % COLUMN_COLORS.length];

function buildPositions(
  courses: any[],
  layoutDir: string = "horizontal",
  L: any = LAYOUT,
) {
  const isVert = layoutDir === "vertical";
  const colAxisGap = isVert ? L.rowGap : L.colGap;
  const rowAxisGap = isVert ? L.colGap : L.rowGap;
  const colAxisW = isVert ? L.nodeH : L.nodeW;
  const rowAxisW = isVert ? L.nodeW : L.nodeH;

  const colAxisStep = colAxisW + colAxisGap;
  const rowAxisStep = rowAxisW + rowAxisGap;

  const colGroupsMain: any = {};
  const colGroupsOther: any = {};
  courses.forEach((c) => {
    if (c.isMain) {
      if (!colGroupsMain[c.col]) colGroupsMain[c.col] = [];
      colGroupsMain[c.col].push(c);
    } else {
      if (!colGroupsOther[c.col]) colGroupsOther[c.col] = [];
      colGroupsOther[c.col].push(c);
    }
  });

  const positions: any = {};
  const cols = [...new Set(courses.map((c) => c.col))].sort((a, b) => a - b);

  let maxMainCross = 0;
  Object.values(colGroupsMain).forEach((grp: any) => {
    const size = grp.length * rowAxisStep;
    if (size > maxMainCross) maxMainCross = size;
  });

  cols.forEach((col, colIdx) => {
    const mainGroup = colGroupsMain[col] || [];
    const otherGroup = colGroupsOther[col] || [];

    const totalMainCross = mainGroup.length * rowAxisStep - rowAxisGap;

    mainGroup.forEach((c: any, rowIdx: number) => {
      const colPos = colIdx * colAxisStep + 40;
      const crossPos =
        -totalMainCross / 2 + rowIdx * rowAxisStep - (isVert ? 40 : 100);

      positions[c.id] = {
        x: isVert ? crossPos : colPos,
        y: isVert ? colPos : crossPos,
      };
    });

    const crossOffsetOther = maxMainCross / 2 + (isVert ? 40 : 100);
    const baseOffset =
      maxMainCross > 0
        ? crossOffsetOther
        : -(otherGroup.length * rowAxisStep) / 2;

    otherGroup.forEach((c: any, rowIdx: number) => {
      const colPos = colIdx * colAxisStep + 40;
      const crossPos = baseOffset + rowIdx * rowAxisStep;

      positions[c.id] = {
        x: isVert ? crossPos : colPos,
        y: isVert ? colPos : crossPos,
      };
    });
  });

  return positions;
}

function getEdges(courses: any[], positions: any) {
  const edges: any[] = [];
  courses.forEach((c) => {
    c.prereqs.forEach((pid: string) => {
      if (positions[pid] && positions[c.id])
        edges.push({ from: pid, to: c.id });
    });
  });
  return edges;
}

// ── SVG/Canvas export builder ────────────────────────────────
const xmlEsc = (s: any) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function buildExportData(
  format: string,
  coursesToExport: any[],
  CATEGORIES: any,
  TITLE: any,
  showAllArrows: boolean = false,
  layoutDir: string = "horizontal",
) {
  const isVert = layoutDir === "vertical";
  // Increase gap and node size significantly for vertical exports
  const L = isVert
    ? { nodeW: 300, nodeH: 140, colGap: 160, rowGap: 220 }
    : LAYOUT;
  const S = L.nodeW / LAYOUT.nodeW;
  const pos = buildPositions(coursesToExport, layoutDir, L);
  const eds = getEdges(coursesToExport, pos);
  const cols = [...new Set(coursesToExport.map((c) => c.col))].sort(
    (a, b) => a - b,
  );
  const allX = Object.values(pos).map((p: any) => p.x);
  const allY = Object.values(pos).map((p: any) => p.y);

  const minNodeX = Math.min(...allX);
  const minNodeY = Math.min(...allY);
  const treeW = Math.max(...allX) + L.nodeW - minNodeX;
  const treeH = Math.max(...allY) + L.nodeH - minNodeY;

  const PAD = Math.round(60 * S);
  // top: title area, bottom: horizontal legend + footer
  const TITLE_H = Math.round(60 * S);
  const LEG_H = Math.round(40 * S);
  const FOOT_H = Math.round(26 * S);
  const EXTRA = TITLE_H + LEG_H + FOOT_H;

  let W = treeW + 2 * PAD;
  let H = Math.max(treeH + EXTRA + 2 * PAD, Math.round(900 * S));

  if (isVert) {
    // 16:9 vertical ratio for phone wallpaper look
    const targetAspect = 16 / 9;
    if (H / W < targetAspect) {
      H = W * targetAspect;
    } else {
      W = H / targetAspect;
    }
  }

  // Center tree horizontally
  const MathRound = Math.round;
  W = MathRound(W);
  H = MathRound(H);

  const OX = MathRound((W - treeW) / 2) - minNodeX;
  const availableH = H - EXTRA;
  const OY =
    TITLE_H + Math.max(0, MathRound((availableH - treeH) / 2)) - minNodeY;

  const COL_LABEL_Y = minNodeY + OY - Math.round(24 * S); // column labels just above nodes
  const LEG_Y = H - FOOT_H - LEG_H + Math.round(12 * S); // y baseline for legend items
  const FY = H - Math.round(12 * S); // footer y

  // Scaled text sizes and positions with a boost for readability on vertical
  const FONT_TITLE = Math.round(isVert ? 22 * S : 18 * S);
  const FONT_SUB = Math.round(isVert ? 14 * S : 11 * S);
  const FONT_COL = Math.round(isVert ? 14 * S : 10 * S);
  const FONT_NM = Math.round(isVert ? 14 * S : 10 * S);
  const FONT_NM_W = Math.round(isVert ? 12 * S : 9 * S);
  const FONT_ID = Math.round(isVert ? 13 * S : 9 * S);
  const FONT_CR = Math.round(isVert ? 11 * S : 8 * S);

  const TY_NM = Math.round(isVert ? 40 * S : 28 * S);
  const TY_NM_W1 = Math.round(isVert ? 30 * S : 22 * S);
  const TY_NM_W2 = Math.round(isVert ? 48 * S : 33 * S);
  const TY_ID = Math.round(isVert ? 68 * S : 47 * S);
  const TY_CR = Math.round(isVert ? 85 * S : 60 * S);

  // Build horizontal legend data
  const legList = Object.entries(CATEGORIES);
  const LEG_ITEM_W = Math.round(120 * S);
  const LEG_TOTAL_W = legList.length * LEG_ITEM_W;
  const LEG_START_X = Math.max(PAD, (W - LEG_TOTAL_W) / 2);

  if (format === "svg") {
    const p = [];
    p.push(
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}">`,
    );
    p.push(`<rect width="${W}" height="${H}" fill="#0F172A"/>`);
    let markerDefs = `<marker id="ar" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><polygon points="0 0,7 3,0 6" fill="#94A3B8"/></marker>`;
    if (showAllArrows) {
      COLUMN_COLORS.forEach((cc, idx) => {
        markerDefs += `<marker id="arc${idx + 1}" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="${cc}"/></marker>`;
      });
    }
    p.push(`<defs>${markerDefs}</defs>`);
    // Title
    p.push(
      `<text x="${W / 2}" y="${Math.round(26 * S)}" text-anchor="middle" font-size="${FONT_TITLE}" font-weight="bold" fill="#F1F5F9" font-family="Arial">${xmlEsc(TITLE.main)}</text>`,
    );
    p.push(
      `<text x="${W / 2}" y="${Math.round(44 * S)}" text-anchor="middle" font-size="${FONT_SUB}" fill="#94A3B8" font-family="Arial">${xmlEsc(TITLE.sub)}</text>`,
    );
    // Column labels
    cols.forEach((col, i) => {
      if (isVert) {
        const ly = Math.round(i * (L.nodeH + L.colGap) + 40 + L.nodeH / 2 + OY);
        p.push(
          `<text x="${Math.round(OX + 22 * S)}" y="${ly}" alignment-baseline="middle" font-size="${FONT_COL}" fill="#94A3B8" font-family="Arial" font-weight="bold">Col ${col}</text>`,
        );
      } else {
        const lx = Math.round(i * (L.nodeW + L.colGap) + 40 + L.nodeW / 2 + OX);
        p.push(
          `<text x="${lx}" y="${COL_LABEL_Y}" text-anchor="middle" font-size="${FONT_COL}" fill="#94A3B8" font-family="Arial" font-weight="bold">Col ${col}</text>`,
        );
      }
    });
    // Edges
    const courseColMap: any = {};
    coursesToExport.forEach((c) => {
      courseColMap[c.id] = c.col;
    });
    eds.forEach((e) => {
      const fp = pos[e.from],
        tp = pos[e.to];
      if (!fp || !tp) return;
      const x1 = Math.round(
        (isVert ? fp.x + L.nodeW / 2 : fp.x + L.nodeW) + OX,
      );
      const y1 = Math.round(
        (isVert ? fp.y + L.nodeH : fp.y + L.nodeH / 2) + OY,
      );
      const x2 = Math.round((isVert ? tp.x + L.nodeW / 2 : tp.x) + OX);
      const y2 = Math.round((isVert ? tp.y : tp.y + L.nodeH / 2) + OY);

      const cx1 = isVert ? x1 : Math.round(x1 + (x2 - x1) * 0.5);
      const cy1 = isVert ? Math.round(y1 + (y2 - y1) * 0.5) : y1;
      const cx2 = isVert ? x2 : cx1;
      const cy2 = isVert ? cy1 : y2;

      if (showAllArrows) {
        const fromCol = courseColMap[e.from] || 1;
        const edgeColor = getColColor(fromCol);
        p.push(
          `<path d="M${x1} ${y1} C${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}" fill="none" stroke="${edgeColor}" stroke-width="2" stroke-opacity="0.75" marker-end="url(#arc${fromCol})"/>`,
        );
      } else {
        p.push(
          `<path d="M${x1} ${y1} C${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}" fill="none" stroke="#2D4A6B" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#ar)"/>`,
        );
      }
    });
    // Nodes
    coursesToExport.forEach((c) => {
      const px = Math.round(pos[c.id].x + OX),
        py = Math.round(pos[c.id].y + OY);
      const col = CATEGORIES[c.cat]?.color || "#94A3B8";
      const r = parseInt(col.slice(1, 3), 16),
        g = parseInt(col.slice(3, 5), 16),
        b = parseInt(col.slice(5, 7), 16);
      const borderColor = showAllArrows ? getColColor(c.col) : col;
      const href = c.courseSystemId
        ? `${window.location.origin}/courses/${c.courseSystemId}/info`
        : c.link ||
          `https://www.google.com/search?q=${encodeURIComponent(c.nameEn + " course")}`;
      p.push(`<a xlink:href="${xmlEsc(href)}" target="_blank">`);
      p.push(
        `<rect x="${px}" y="${py}" width="${L.nodeW}" height="${L.nodeH}" rx="${Math.round(9 * S)}" fill="rgba(${r},${g},${b},0.14)" stroke="${borderColor}" stroke-width="${showAllArrows ? Math.round(2 * S) : Math.round(1.5 * S)}" stroke-opacity="${showAllArrows ? "0.85" : "1"}"/>`,
      );
      p.push(
        `<rect x="${px + Math.round(2 * S)}" y="${py + Math.round(2 * S)}" width="${L.nodeW - Math.round(4 * S)}" height="${Math.round(4 * S)}" rx="${Math.round(3 * S)}" fill="${col}" fill-opacity="0.45"/>`,
      );
      const ws = (c.name || "").split(" ");
      if (ws.length <= 3) {
        p.push(
          `<text x="${px + L.nodeW / 2}" y="${py + TY_NM}" text-anchor="middle" font-size="${FONT_NM}" font-weight="bold" fill="#F1F5F9" font-family="Arial" direction="rtl">${xmlEsc(c.name)}</text>`,
        );
      } else {
        const h2 = Math.ceil(ws.length / 2);
        p.push(
          `<text x="${px + L.nodeW / 2}" y="${py + TY_NM_W1}" text-anchor="middle" font-size="${FONT_NM_W}" font-weight="bold" fill="#F1F5F9" font-family="Arial" direction="rtl">${xmlEsc(ws.slice(0, h2).join(" "))}</text>`,
        );
        p.push(
          `<text x="${px + L.nodeW / 2}" y="${py + TY_NM_W2}" text-anchor="middle" font-size="${FONT_NM_W}" font-weight="bold" fill="#F1F5F9" font-family="Arial" direction="rtl">${xmlEsc(ws.slice(h2).join(" "))}</text>`,
        );
      }
      p.push(
        `<text x="${px + L.nodeW / 2}" y="${py + TY_ID}" text-anchor="middle" font-size="${FONT_ID}" fill="#94A3B8" font-family="Courier New,monospace">${xmlEsc(c.id)}</text>`,
      );
      p.push(
        `<text x="${px + L.nodeW / 2}" y="${py + TY_CR}" text-anchor="middle" font-size="${FONT_CR}" fill="#94A3B8" font-family="Arial">${xmlEsc(c.credits + " cr")}</text>`,
      );
      p.push(`</a>`);
    });
    // Horizontal legend
    p.push(
      `<line x1="0" y1="${LEG_Y - Math.round(14 * S)}" x2="${W}" y2="${LEG_Y - Math.round(14 * S)}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`,
    );
    legList.forEach(([_, lg]: any, i) => {
      const lx = LEG_START_X + i * LEG_ITEM_W;
      p.push(
        `<rect x="${Math.round(lx)}" y="${LEG_Y - Math.round(9 * S)}" width="${Math.round(10 * S)}" height="${Math.round(10 * S)}" rx="2" fill="${lg.color}"/>`,
      );
      p.push(
        `<text x="${Math.round(lx + 14 * S)}" y="${LEG_Y + Math.round(1 * S)}" font-size="${FONT_ID}" fill="#94A3B8" font-family="Arial">${xmlEsc(lg.label)}</text>`,
      );
    });
    // Footer
    p.push(
      `<a xlink:href="https://www.linkedin.com/in/mohammad-nour-aldeen-swedan-a985071b5" target="_blank"><text x="${W / 2}" y="${FY}" text-anchor="middle" font-size="${FONT_ID}" fill="#475569" font-family="Arial" text-decoration="underline">Made with ❤️ by Mohammad Swedan</text></a>`,
    );
    p.push(`</svg>`);
    const svgText = p.join("\n");
    return {
      type: "svg",
      dataUrl:
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgText))),
      svgText,
    };
  }

  // PNG
  const SC = 2;
  const cv = document.createElement("canvas");
  cv.width = W * SC;
  cv.height = H * SC;
  const ctx = cv.getContext("2d");
  if (!ctx) return null;
  ctx.scale(SC, SC);
  ctx.fillStyle = "#0F172A";
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.textAlign = "center";
  ctx.font = `bold ${FONT_TITLE}px Arial`;
  ctx.fillStyle = "#F1F5F9";
  ctx.fillText(TITLE.main, W / 2, Math.round(26 * S));
  ctx.font = `${FONT_SUB}px Arial`;
  ctx.fillStyle = "#475569";
  ctx.fillText(TITLE.sub, W / 2, Math.round(44 * S));

  // Column labels
  cols.forEach((col, i) => {
    ctx.font = `bold ${FONT_COL}px Arial`;
    ctx.fillStyle = "#334155";
    if (isVert) {
      const ly = i * (L.nodeH + L.colGap) + 40 + L.nodeH / 2 + OY;
      ctx.textAlign = "left";
      ctx.fillText(
        "Col " + col,
        OX + Math.round(22 * S),
        ly + Math.round(3 * S),
      );
    } else {
      const lx = i * (L.nodeW + L.colGap) + 40 + L.nodeW / 2 + OX;
      ctx.textAlign = "center";
      ctx.fillText("Col " + col, lx, COL_LABEL_Y);
    }
  });

  // Edges
  const courseColMapPng: any = {};
  coursesToExport.forEach((c) => {
    courseColMapPng[c.id] = c.col;
  });
  eds.forEach((e) => {
    const fp = pos[e.from],
      tp = pos[e.to];
    if (!fp || !tp) return;
    const x1 = (isVert ? fp.x + L.nodeW / 2 : fp.x + L.nodeW) + OX;
    const y1 = (isVert ? fp.y + L.nodeH : fp.y + L.nodeH / 2) + OY;
    const x2 = (isVert ? tp.x + L.nodeW / 2 : tp.x) + OX;
    const y2 = (isVert ? tp.y : tp.y + L.nodeH / 2) + OY;
    const cx1 = isVert ? x1 : x1 + (x2 - x1) * 0.5;
    const cy1 = isVert ? y1 + (y2 - y1) * 0.5 : y1;
    const cx2 = isVert ? x2 : cx1;
    const cy2 = isVert ? cy1 : y2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
    if (showAllArrows) {
      const fromCol = courseColMapPng[e.from] || 1;
      const edgeColor = getColColor(fromCol);
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.75;
      ctx.setLineDash([]);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
      const ang = Math.atan2(y2 - cy2, x2 - cx2);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 8 * Math.cos(ang - 0.4), y2 - 8 * Math.sin(ang - 0.4));
      ctx.lineTo(x2 - 8 * Math.cos(ang + 0.4), y2 - 8 * Math.sin(ang + 0.4));
      ctx.closePath();
      ctx.fillStyle = edgeColor;
      ctx.globalAlpha = 0.75;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    } else {
      ctx.strokeStyle = "rgba(96,165,250,0.3)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      const ang = Math.atan2(y2 - cy2, x2 - cx2);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 8 * Math.cos(ang - 0.4), y2 - 8 * Math.sin(ang - 0.4));
      ctx.lineTo(x2 - 8 * Math.cos(ang + 0.4), y2 - 8 * Math.sin(ang + 0.4));
      ctx.closePath();
      ctx.fillStyle = "rgba(96,165,250,0.4)";
      ctx.fill();
    }
  });

  // Nodes
  coursesToExport.forEach((c) => {
    const col = CATEGORIES[c.cat]?.color || "#94A3B8";
    const borderColor = showAllArrows ? getColColor(c.col) : col;
    const px = pos[c.id].x + OX,
      py = pos[c.id].y + OY;
    const r = parseInt(col.slice(1, 3), 16),
      g = parseInt(col.slice(3, 5), 16),
      b = parseInt(col.slice(5, 7), 16);

    ctx.beginPath();
    ctx.roundRect(px, py, L.nodeW, L.nodeH, Math.round(9 * S));
    ctx.fillStyle = `rgba(${r},${g},${b},0.14)`;
    ctx.fill();
    ctx.lineWidth = showAllArrows ? Math.round(2 * S) : Math.round(1.5 * S);
    ctx.strokeStyle = borderColor;
    if (showAllArrows) {
      ctx.globalAlpha = 0.85;
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    ctx.beginPath();
    ctx.roundRect(
      px + Math.round(2 * S),
      py + Math.round(2 * S),
      L.nodeW - Math.round(4 * S),
      Math.round(4 * S),
      Math.round(3 * S),
    );
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.45;
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = "#F1F5F9";
    ctx.textAlign = "center";
    const ws = (c.name || "").split(" ");
    if (ws.length <= 3) {
      ctx.font = `bold ${FONT_NM}px Arial`;
      ctx.fillText(c.name || "", px + L.nodeW / 2, py + TY_NM);
    } else {
      ctx.font = `bold ${FONT_NM_W}px Arial`;
      const h2 = Math.ceil(ws.length / 2);
      ctx.fillText(ws.slice(0, h2).join(" "), px + L.nodeW / 2, py + TY_NM_W1);
      ctx.fillText(ws.slice(h2).join(" "), px + L.nodeW / 2, py + TY_NM_W2);
    }
    ctx.fillStyle = "#94A3B8";
    ctx.font = `${FONT_ID}px Courier New, monospace`;
    ctx.fillText(c.id, px + L.nodeW / 2, py + TY_ID);

    ctx.fillStyle = "#64748B";
    ctx.font = `${FONT_CR}px Arial`;
    ctx.fillText(c.credits + " cr", px + L.nodeW / 2, py + TY_CR);
  });

  // Horizontal legend
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, LEG_Y - Math.round(14 * S));
  ctx.lineTo(W, LEG_Y - Math.round(14 * S));
  ctx.stroke();
  legList.forEach(([_, lg]: any, i) => {
    const lx = LEG_START_X + i * LEG_ITEM_W;
    ctx.fillStyle = lg.color;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(
        lx,
        LEG_Y - Math.round(9 * S),
        Math.round(10 * S),
        Math.round(10 * S),
        2,
      );
      ctx.fill();
    } else
      ctx.fillRect(
        lx,
        LEG_Y - Math.round(9 * S),
        Math.round(10 * S),
        Math.round(10 * S),
      );
    ctx.font = `${FONT_ID}px Arial`;
    ctx.fillStyle = "#94A3B8";
    ctx.textAlign = "left";
    ctx.fillText(lg.label, lx + Math.round(14 * S), LEG_Y + Math.round(1 * S));
  });

  // Footer
  ctx.font = `${FONT_ID}px Arial`;
  ctx.fillStyle = "#1E293B";
  ctx.textAlign = "center";
  ctx.fillText(
    "Made with ❤️ by Mohammad Swedan  •  linkedin.com/in/mohammad-nour-aldeen-swedan-a985071b5",
    W / 2,
    FY,
  );

  return { type: "png", dataUrl: cv.toDataURL("image/png") };
}

// ── Card component ───────────────────────────────────────────
function CourseCard({
  course,
  pos,
  isSelected,
  isHighlighted,
  isDimmed,
  onClick,
  categories,
  showAllArrows,
  isPassed,
}: any) {
  const catCol = categories[course.cat]?.color || "#94A3B8";
  const colColor = getColColor(course.col);
  const arrowActive = showAllArrows && !isSelected && !isDimmed;
  const r = parseInt(catCol.slice(1, 3), 16),
    g = parseInt(catCol.slice(3, 5), 16),
    b = parseInt(catCol.slice(5, 7), 16);

  // Only the border changes to column color in arrows mode — everything else stays category-based
  const strokeCol = arrowActive ? colColor : catCol;

  return (
    <g
      transform={`translate(${pos.x},${pos.y})`}
      onClick={() => onClick(course)}
      style={{ cursor: "pointer" }}
    >
      <rect
        width={LAYOUT.nodeW}
        height={LAYOUT.nodeH}
        rx={12}
        fill={`rgba(${r},${g},${b},${isSelected ? 0.35 : isHighlighted ? 0.18 : 0.1})`}
        stroke={isPassed ? "#22C55E" : strokeCol}
        strokeWidth={
          isSelected
            ? 2.5
            : isHighlighted
              ? 2
              : arrowActive
                ? 2
                : isPassed
                  ? 2
                  : 1.5
        }
        strokeOpacity={
          isSelected
            ? 1
            : isHighlighted
              ? 0.95
              : arrowActive
                ? 0.9
                : isPassed
                  ? 0.9
                  : 0.6
        }
        style={{
          filter: isSelected
            ? `drop-shadow(0 0 16px ${catCol}99)`
            : isHighlighted
              ? `drop-shadow(0 0 8px ${catCol}66)`
              : arrowActive
                ? `drop-shadow(0 0 6px ${colColor}44)`
                : isPassed
                  ? `drop-shadow(0 0 6px rgba(34,197,94,0.35))`
                  : `drop-shadow(0 0 3px ${catCol}22)`,
          opacity: isDimmed ? 0.15 : 1,
          transition: "all 0.25s ease",
        }}
      />
      <rect
        x={2}
        y={2}
        width={LAYOUT.nodeW - 4}
        height={5}
        rx={3}
        fill={catCol}
        fillOpacity={isSelected ? 0.7 : 0.45}
        style={{ opacity: isDimmed ? 0.18 : 1 }}
      />
      {isPassed && (
        <g
          transform={`translate(${LAYOUT.nodeW - 16}, 18)`}
          style={{ opacity: isDimmed ? 0.18 : 1 }}
        >
          <circle
            cx="0"
            cy="0"
            r="9"
            fill="var(--background)"
            stroke="#22C55E"
            strokeWidth="1.5"
          />
          <path
            d="M-3.5,0.5 L-1,3 L3.5,-2.5"
            fill="none"
            stroke="#22C55E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
      <text
        x={LAYOUT.nodeW / 2}
        y={31}
        textAnchor="middle"
        fontSize={12.5}
        fontWeight="800"
        fontFamily="'Noto Sans Arabic',sans-serif"
        style={{
          fill: "#F1F5F9",
          opacity: isDimmed ? 0.22 : 1,
          letterSpacing: "-0.2px",
        }}
      >
        {course.name}
      </text>
      <text
        x={LAYOUT.nodeW / 2}
        y={48}
        textAnchor="middle"
        fontSize={10}
        fontWeight="700"
        fontFamily="'Space Mono',monospace"
        style={{
          fill: "#94A3B8",
          opacity: isDimmed ? 0.18 : 1,
        }}
      >
        {course.id}
      </text>
      <text
        x={LAYOUT.nodeW / 2}
        y={63}
        textAnchor="middle"
        fontSize={9.5}
        fontFamily="'Noto Sans Arabic',sans-serif"
        style={{
          fill: "#94A3B8",
          opacity: isDimmed ? 0.18 : 1,
        }}
      >
        {course.credits} ساعات
      </text>
    </g>
  );
}

// ── Detail modal ─────────────────────────────────────────────
function CourseModal({
  course,
  categories,
  onClose,
  isPassed,
  onTogglePassed,
}: any) {
  if (!course) return null;
  const col = categories[course.cat]?.color || "#94A3B8";
  const catLabel = categories[course.cat]?.label || course.cat;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(8px)",
        fontFamily: "'Noto Sans Arabic',sans-serif",
      }}
      onClick={onClose}
    >
      <div
        className="bg-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          border: `1px solid ${col}44`,
          borderRadius: 20,
          padding: 30,
          maxWidth: 380,
          width: "90%",
          boxShadow: `0 0 60px ${col}33`,
          direction: "rtl",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                gap: 7,
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  background: col,
                  color: "var(--background)",
                  padding: "2px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontFamily: "'Space Mono',monospace",
                  fontWeight: 700,
                }}
              >
                {course.id}
              </span>
              <span
                style={{
                  background: `${col}22`,
                  border: `1px solid ${col}55`,
                  color: col,
                  padding: "2px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                }}
              >
                {catLabel}
              </span>
            </div>
            <h2
              style={{
                color: "var(--foreground)",
                fontSize: 20,
                margin: 0,
                fontWeight: 800,
              }}
            >
              {course.name}
            </h2>
            <p
              style={{
                color: "var(--muted-foreground)",
                fontSize: 13,
                margin: "4px 0 0",
              }}
            >
              {course.nameEn} · {course.credits} ساعات
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none",
              color: "var(--muted-foreground)",
              borderRadius: 8,
              padding: "5px 10px",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={onTogglePassed}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: isPassed
                ? "rgba(34,197,94,0.15)"
                : "rgba(255,255,255,0.05)",
              border: isPassed
                ? "1px solid rgba(34,197,94,0.3)"
                : `1px solid rgba(255,255,255,0.1)`,
              color: isPassed ? "#4ADE80" : "#F1F5F9",
              padding: "12px",
              borderRadius: 12,
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 700,
              transition: "all 0.2s",
            }}
          >
            {isPassed ? (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                مادة مجتازة
              </>
            ) : (
              <>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    border: "2px solid currentColor",
                    borderRadius: 4,
                  }}
                ></div>
                تحديد كمجتازة
              </>
            )}
          </button>
          {course.courseSystemId && (
            <a
              href={`${window.location.origin}/courses/${course.courseSystemId}/info`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: `linear-gradient(135deg,${col},${col}bb)`,
                color: "var(--background)",
                padding: "12px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 15,
                transition: "all 0.2s",
                boxShadow: `0 4px 14px ${col}40`,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              تفاصيل المادة
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main app ─────────────────────────────────────────────────
export function CurriculumTree({
  onEdit,
  onCreate,
  CATEGORIES,
  TITLE,
  COURSES,
  isAdmin,
  isStandalone,
}: any) {
  const [selected, setSelected] = useState<any>(null);
  const [modal, setModal] = useState<any>(null);
  const [pan, setPan] = useState(() => {
    if (typeof window === "undefined") return { x: 60, y: 380 };
    const w = window.innerWidth,
      h = window.innerHeight;
    return { x: w < 1024 ? w / 2 : 60, y: w < 1024 ? 120 : h / 2 };
  });
  const [zoom, setZoom] = useState(0.82);
  const [dragging, setDragging] = useState(false);
  const [exportData, setExportData] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [showAllArrows, setShowAllArrows] = useState(true);
  const dragStart = useRef<any>(null);
  const svgRef = useRef<any>(null);
  const lastDist = useRef<any>(null);

  const [layoutDir, setLayoutDir] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 1024
      ? "vertical"
      : "horizontal",
  );
  const isVert = layoutDir === "vertical";

  const navigate = useNavigate();

  const toggleLayout = () => {
    setLayoutDir((d) => {
      const isNowVert = d === "horizontal";
      const w = typeof window !== "undefined" ? window.innerWidth : 800;
      const h = typeof window !== "undefined" ? window.innerHeight : 800;
      if (isNowVert) {
        setPan({ x: w / 2, y: 120 });
      } else {
        setPan({ x: 60, y: h / 2 });
      }
      return isNowVert ? "vertical" : "horizontal";
    });
  };

  const [passedCourses, setPassedCourses] = useState(() => {
    try {
      const stored = localStorage.getItem("passedCourses_v1");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const togglePassed = useCallback((id: string) => {
    setPassedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem("passedCourses_v1", JSON.stringify([...next]));
      } catch (e) {}
      return next;
    });
  }, []);

  const [visibleCats, setVisibleCats] = useState(() => {
    const init: any = {};
    for (const key in CATEGORIES) {
      init[key] = CATEGORIES[key].showByDefault ?? false;
    }
    return init;
  });

  const visibleCourses = useMemo(() => {
    return COURSES.filter((c: any) => visibleCats[c.cat] !== false);
  }, [COURSES, visibleCats]);

  const positions = useMemo(
    () => buildPositions(visibleCourses, layoutDir),
    [visibleCourses, layoutDir],
  );
  const edges = useMemo(
    () => getEdges(visibleCourses, positions),
    [visibleCourses, positions],
  );
  const cols = useMemo(
    () =>
      [...new Set(visibleCourses.map((c: any) => c.col))].sort(
        (a: any, b: any) => a - b,
      ),
    [visibleCourses],
  );

  const getHL = (id: string) => {
    if (!id) return new Set();
    const s = new Set([id]);
    visibleCourses
      .find((c: any) => c.id === id)
      ?.prereqs.forEach((p: any) => s.add(p));
    visibleCourses
      .filter((c: any) => c.prereqs.includes(id))
      .forEach((c: any) => s.add(c.id));
    return s;
  };
  const hl = getHL(selected);

  const onMouseDown = (e: any) => {
    if (e.target.closest("g")) return;
    setDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const onMouseMove = useCallback(
    (e: any) => {
      if (!dragging) return;
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    },
    [dragging, pan],
  );
  const onMouseUp = () => setDragging(false);
  const onWheel = (e: any) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.25, Math.min(2.2, z - e.deltaY * 0.001)));
  };

  // Touch handlers for mobile
  const onTouchStart = (e: any) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      dragStart.current = { x: t.clientX - pan.x, y: t.clientY - pan.y };
      lastDist.current = null;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDist.current = Math.hypot(dx, dy);
    }
  };
  const onTouchMove = (e: any) => {
    if (e.touches.length === 1 && dragStart.current) {
      const t = e.touches[0];
      setPan({
        x: t.clientX - dragStart.current.x,
        y: t.clientY - dragStart.current.y,
      });
    } else if (e.touches.length === 2 && lastDist.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const delta = dist - lastDist.current;
      setZoom((z) => Math.max(0.25, Math.min(2.2, z + delta * 0.005)));
      lastDist.current = dist;
    }
  };
  const onTouchEnd = () => {
    dragStart.current = null;
    lastDist.current = null;
  };

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const preventDefaultTouch = (e: any) => {
      if (typeof e.cancelable !== "boolean" || e.cancelable) {
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchmove", preventDefaultTouch, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchmove", preventDefaultTouch);
    };
  }, []);

  const doExport = async (fmt: string) => {
    setShowExport(false);
    setExporting(true);
    try {
      if (!document.fonts.ready) await new Promise((r) => setTimeout(r, 500));
      else await document.fonts.ready;
      const res = buildExportData(
        fmt,
        visibleCourses,
        CATEGORIES,
        TITLE,
        showAllArrows,
        layoutDir,
      );
      setExportData(res);
    } catch (e) {
      console.error(e);
      alert("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const onCardClick = (course: any) => {
    if (selected === course.id) {
      setModal(course);
      setSelected(null);
    } else setSelected(course.id);
  };

  return (
    <div
      className="w-full relative overflow-hidden bg-background text-foreground rounded-xl border border-border"
      style={{
        height: isStandalone ? "100vh" : "calc(100vh - 120px)",
        fontFamily: "'Noto Sans Arabic',sans-serif",
      }}
    >
      {/* <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/> */}
      <style>{`
        .ctrl-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          color: #94A3B8;
          border-radius: 8px;
          padding: 7px 10px;
          cursor: pointer;
          font-family: 'Noto Sans Arabic', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-weight: 600;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          box-shadow: none;
        }
        .ctrl-btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.25);
          color: #F1F5F9;
          box-shadow: none;
          transform: none;
        }
        :root[class~='light'] .ctrl-btn,
        html.light .ctrl-btn,
        [data-theme='light'] .ctrl-btn {
          background: rgba(15,23,42,0.06);
          border: 1px solid rgba(15,23,42,0.14);
          color: #334155;
          box-shadow: none;
        }
        :root[class~='light'] .ctrl-btn:hover,
        html.light .ctrl-btn:hover,
        [data-theme='light'] .ctrl-btn:hover {
          background: rgba(15,23,42,0.11);
          border-color: rgba(15,23,42,0.22);
          color: #0F172A;
          box-shadow: none;
          transform: none;
        }
        .ctrl-btn:active {
          transform: translateY(1px);
        }
        .cancel-btn {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.25);
          color: #FCA5A5;
          padding: 8px 12px;
          animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .cancel-btn:hover {
          background: rgba(239, 68, 68, 0.3);
          border-color: rgba(239, 68, 68, 0.5);
          color: #FECACA;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.35);
        }
        .export-btn {
          background: #6366F1;
          border: 1px solid #6366F1;
          color: #fff;
          padding: 7px 14px;
          box-shadow: none;
        }
        .export-btn:hover:not(:disabled) {
          background: #4F46E5;
          border-color: #4F46E5;
          box-shadow: none;
          transform: none;
        }
        .export-btn:disabled {
          background: rgba(99, 102, 241, 0.35);
          border-color: transparent;
          cursor: wait;
          box-shadow: none;
          transform: none;
        }
        @keyframes popIn {
          0% { transform: scale(0.6) translateY(10px); opacity: 0; }
          60% { transform: scale(1.05) translateY(-2px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .filter-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #94A3B8;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-family: 'Noto Sans Arabic', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .filter-btn:hover {
          background: rgba(255,255,255,0.12);
          color: #F1F5F9;
        }
        .filter-btn.active {
          background: rgba(56, 189, 248, 0.15);
          border-color: rgba(56, 189, 248, 0.4);
          color: #38BDF8;
        }
        .top-header {
          position: absolute; top: 0; left: 0; right: 0; z-index: 10;
          background: rgba(var(--background), 0.92); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(150,150,150,0.1);
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 8px 16px; min-height: 60px;
          gap: 16px;
        }
        .header-title-container {
          position: relative;
          direction: rtl; text-align: center; pointer-events: none;
        }
        .left-controls {
          display: flex; gap: 8px; align-items: center; z-index: 10; flex-wrap: wrap; justify-content: flex-start;
        }
        .right-controls {
          display: flex; gap: 8px; align-items: center; z-index: 10; flex-wrap: wrap; justify-content: flex-end;
        }
        @media (max-width: 1024px) {
          .top-header {
            display: flex; flex-direction: column; justify-content: center; gap: 12px;
            padding: 12px 16px;
          }
          .header-title-container {
            order: -1;
          }
          .left-controls, .right-controls {
            justify-content: center;
          }
        }
      `}</style>

      {/* Header */}
      <div className="top-header">
        <div className="left-controls">
          <button
            className="ctrl-btn"
            onClick={() => {
              if (isStandalone) {
                window.close();
              } else {
                navigate(-1);
              }
            }}
            title={isStandalone ? "إغلاق" : "العودة"}
          >
            <span style={{ fontSize: "12px", marginRight: "4px" }}>
              {isStandalone ? "✕ إغلاق" : "← عودة"}
            </span>
          </button>
          <button
            className="ctrl-btn"
            onClick={toggleLayout}
            title="تغيير الاتجاه"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              {layoutDir === "horizontal" ? (
                <line x1="3" y1="12" x2="21" y2="12"></line>
              ) : (
                <line x1="12" y1="3" x2="12" y2="21"></line>
              )}
            </svg>
            <span style={{ fontSize: "12px", marginRight: "4px" }}>
              تغيير الاتجاه
            </span>
          </button>
          {isAdmin && onCreate && (
            <button
              className="ctrl-btn"
              onClick={onCreate}
              title="إنشاء خطة جديدة"
              style={{
                background: "rgba(16, 185, 129, 0.2)",
                borderColor: "rgba(16, 185, 129, 0.4)",
                color: "#10B981",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span style={{ fontSize: "12px", marginRight: "4px" }}>
                إنشاء
              </span>
            </button>
          )}
          {isAdmin && (
            <button
              className="ctrl-btn"
              onClick={onEdit}
              title="تعديل الخطة"
              style={{
                background: "rgba(99, 102, 241, 0.2)",
                borderColor: "rgba(99, 102, 241, 0.4)",
                color: "#818CF8",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              <span style={{ fontSize: "12px", marginRight: "4px" }}>
                تعديل
              </span>
            </button>
          )}
        </div>

        <div className="header-title-container">
          <div
            style={{
              color: "var(--foreground)",
              fontSize: 16,
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            {TITLE?.main || "خطة بدون عنوان"}
          </div>
          <div
            style={{
              color: "var(--muted-foreground)",
              fontSize: 11,
              marginTop: 2,
            }}
          >
            {TITLE?.sub || "النسخة"}
          </div>
        </div>

        <div className="right-controls">
          <button
            className="ctrl-btn"
            onClick={() => setZoom((z) => Math.min(2.2, z + 0.15))}
            title="تكبير"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button
            className="ctrl-btn"
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.15))}
            title="تصغير"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button
            className="ctrl-btn"
            onClick={() => {
              const w = window.innerWidth,
                h = window.innerHeight;
              setPan({ x: isVert ? w / 2 : 60, y: isVert ? 120 : h / 2 });
              setZoom(0.82);
            }}
            title="إعادة الضبط"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </button>
          {selected && (
            <button
              title="إغلاق التحديد"
              className="ctrl-btn cancel-btn"
              onClick={() => setSelected(null)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
          <button
            className="ctrl-btn"
            onClick={() => setShowAllArrows((v) => !v)}
            title="إظهار أسهم المتطلبات"
            style={
              showAllArrows
                ? {
                    background: "rgba(96,165,250,0.2)",
                    borderColor: "rgba(96,165,250,0.5)",
                    color: "#60A5FA",
                    boxShadow: "0 0 12px rgba(96,165,250,0.25)",
                  }
                : {}
            }
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
            <span style={{ fontSize: "12px", marginRight: "4px" }}>
              أسهم المتطلبات
            </span>
          </button>

          {/* Export */}
          <div style={{ position: "relative" }}>
            <button
              className="ctrl-btn export-btn"
              onClick={() => setShowExport((v) => !v)}
              disabled={exporting}
            >
              {exporting ? (
                <span
                  style={{
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  ⏳...
                </span>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="black"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    color="000"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span
                    style={{
                      fontSize: "12px",
                      marginRight: "4px",
                      color: "#000",
                    }}
                  >
                    تصدير الخطة
                  </span>
                </>
              )}
            </button>
            {showExport && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  background: "var(--card)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  overflow: "hidden",
                  zIndex: 200,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  minWidth: 160,
                }}
              >
                {[
                  { fmt: "png", icon: "🖼", label: "صورة PNG" },
                  { fmt: "svg", icon: "📐", label: "SVG (قابل للنقر)" },
                ].map((item) => (
                  <button
                    key={item.fmt}
                    onClick={() => doExport(item.fmt)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px 14px",
                      background: "none",
                      border: "none",
                      borderBottom:
                        item.fmt === "png"
                          ? "1px solid rgba(255,255,255,0.06)"
                          : "none",
                      color: "var(--foreground)",
                      cursor: "pointer",
                      textAlign: "right",
                      fontFamily: "'Noto Sans Arabic',sans-serif",
                      fontSize: 12,
                      direction: "rtl",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(99,102,241,0.15)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Share and Mode Toggle - only in standalone mode */}
          {isStandalone && (
            <>
              <button
                className="ctrl-btn"
                onClick={() => {
                  const url = window.location.href;
                  if (navigator.share) {
                    navigator
                      .share({
                        title: "Curriculum Tree",
                        url: url,
                      })
                      .catch(() => {
                        navigator.clipboard.writeText(url);
                        toast.success("Link copied to clipboard!");
                      });
                  } else {
                    navigator.clipboard.writeText(url);
                    toast.success("Link copied to clipboard!");
                  }
                }}
                title="مشاركة"
              >
                <Share2 size={16} />
                <span style={{ fontSize: "12px", marginRight: "4px" }}>
                  مشاركة
                </span>
              </button>

              <div
                style={{
                  width: "1px",
                  height: "20px",
                  background: "rgba(255,255,255,0.1)",
                  margin: "0 4px",
                }}
              />

              <div style={{ padding: "4px" }}>
                <ModeToggle />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Column labels */}
      {!isVert && (
        <div
          style={{
            position: "absolute",
            top: window.innerWidth <= 1024 ? 108 : 62,
            left: 0,
            right: 0,
            zIndex: 5,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: pan.x,
              width: "9999px",
              height: 32,
            }}
          >
            {cols.map((col: any, i: number) => (
              <text
                key={col}
                x={
                  (i * (LAYOUT.nodeW + LAYOUT.colGap) + 40 + LAYOUT.nodeW / 2) *
                  zoom
                }
                y={22}
                textAnchor="middle"
                fill="var(--muted-foreground)"
                fontSize={11 * zoom}
                fontFamily="'Space Mono',monospace"
                fontWeight="700"
              >
                Column {col}
              </text>
            ))}
          </svg>
        </div>
      )}
      {isVert && (
        <div
          style={{
            position: "absolute",
            top: window.innerWidth <= 1024 ? 108 : 62,
            bottom: 0,
            left: 22,
            zIndex: 5,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <svg
            style={{
              position: "absolute",
              top: pan.y + 68,
              left: 0,
              width: 80,
              height: "9999px",
            }}
          >
            {cols.map((col: any, i: number) => (
              <text
                key={col}
                x={0}
                y={
                  (i * (LAYOUT.nodeH + LAYOUT.colGap) + 40 + LAYOUT.nodeH / 2) *
                  zoom
                }
                alignmentBaseline="middle"
                fill="var(--muted-foreground)"
                fontSize={11 * zoom}
                fontFamily="'Space Mono',monospace"
                fontWeight="700"
              >
                Column {col}
              </text>
            ))}
          </svg>
        </div>
      )}

      {/* Main canvas */}
      <svg
        ref={svgRef}
        style={{
          width: "100%",
          height: "100%",
          cursor: dragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L8,3 L0,6 Z" fill="rgba(255,255,255,0.35)" />
          </marker>
          <marker
            id="arrowhl"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L8,3 L0,6 Z" fill="#60A5FA" />
          </marker>
          <marker
            id="arrowbright"
            markerWidth="9"
            markerHeight="9"
            refX="7"
            refY="3.5"
            orient="auto"
          >
            <path d="M0,0 L9,3.5 L0,7 Z" fill="#38BDF8" />
          </marker>
          {/* Per-column colored arrow markers */}
          {COLUMN_COLORS.map((cc, idx) => (
            <marker
              key={`arrcol${idx}`}
              id={`arrcol${idx + 1}`}
              markerWidth="9"
              markerHeight="9"
              refX="7"
              refY="3.5"
              orient="auto"
            >
              <path d={`M0,0 L9,3.5 L0,7 Z`} fill={cc} />
            </marker>
          ))}
        </defs>
        <g transform={`translate(${pan.x},${pan.y + 68}) scale(${zoom})`}>
          {edges.map((e, i) => {
            const fp = positions[e.from],
              tp = positions[e.to];
            if (!fp || !tp) return null;
            const isHL = selected && hl.has(e.from) && hl.has(e.to);
            const isDim = selected && !(hl.has(e.from) && hl.has(e.to));
            const isBright = showAllArrows && !selected;
            // Find the source course's column for per-column coloring
            const fromCourse = isBright
              ? visibleCourses.find((c: any) => c.id === e.from)
              : null;
            const fromCol = fromCourse ? fromCourse.col : 1;
            const colColor = getColColor(fromCol);

            const x1 = isVert ? fp.x + LAYOUT.nodeW / 2 : fp.x + LAYOUT.nodeW;
            const y1 = isVert ? fp.y + LAYOUT.nodeH : fp.y + LAYOUT.nodeH / 2;
            const x2 = isVert ? tp.x + LAYOUT.nodeW / 2 : tp.x;
            const y2 = isVert ? tp.y : tp.y + LAYOUT.nodeH / 2;

            const cx1 = isVert ? x1 : x1 + (x2 - x1) * 0.5;
            const cy1 = isVert ? y1 + (y2 - y1) * 0.5 : y1;
            const cx2 = isVert ? x2 : cx1;
            const cy2 = isVert ? cy1 : y2;

            const edgeStroke = isHL
              ? "#60A5FA"
              : isBright
                ? colColor
                : "rgba(148,163,184,0.28)";
            const edgeWidth = isHL ? 2.5 : isBright ? 2.2 : 2;
            const edgeDash = isHL ? "none" : isBright ? "none" : "6,3";
            const edgeMarker = isHL
              ? "arrowhl"
              : isBright
                ? `arrcol${fromCol}`
                : "arrow";
            const edgeOpacity = isDim ? 0.06 : isBright ? 0.75 : 1;
            return (
              <path
                key={i}
                d={`M${x1},${y1} C${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`}
                fill="none"
                stroke={edgeStroke}
                strokeWidth={edgeWidth}
                strokeDasharray={edgeDash}
                markerEnd={`url(#${edgeMarker})`}
                style={{
                  opacity: edgeOpacity,
                  transition: "all 0.4s ease",
                  filter: isBright
                    ? `drop-shadow(0 0 6px ${colColor}55)`
                    : "none",
                }}
              />
            );
          })}
          {visibleCourses.map((c: any) => (
            <CourseCard
              key={c.id}
              course={c}
              pos={positions[c.id]}
              isSelected={selected === c.id}
              isHighlighted={selected ? hl.has(c.id) : false}
              isDimmed={selected ? !hl.has(c.id) : false}
              onClick={onCardClick}
              categories={CATEGORIES}
              showAllArrows={showAllArrows}
              isPassed={passedCourses.has(c.id)}
            />
          ))}
        </g>
      </svg>

      {/* Legend toggle button + panel */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          right: 14,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 6,
          zIndex: 20,
        }}
      >
        {showLegend && (
          <div
            style={{
              background: "rgba(10,10,10,0.94)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "10px 13px",
            }}
          >
            {Object.entries(CATEGORIES || {}).map(([k, cat]: any) => {
              const isVis = visibleCats[k] !== false;
              return (
                <button
                  key={k}
                  onClick={() =>
                    setVisibleCats((p: any) => ({ ...p, [k]: !p[k] }))
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                    color: isVis ? "#CBD5E1" : "#475569",
                    fontSize: 12,
                    fontFamily: "'Noto Sans Arabic',sans-serif",
                    direction: "rtl",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    width: "100%",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.06)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: isVis ? cat.color : "#334155",
                      flexShrink: 0,
                      transition: "all 0.3s",
                      boxShadow: isVis ? `0 0 10px ${cat.color}66` : "none",
                    }}
                  />
                  <span
                    style={{
                      textDecoration: isVis ? "none" : "line-through",
                      flex: 1,
                      textAlign: "right",
                      transition: "all 0.3s",
                    }}
                  >
                    {cat.label}
                  </span>
                  <span
                    style={{
                      marginRight: "8px",
                      display: "flex",
                      alignItems: "center",
                      color: isVis ? "#94A3B8" : "#475569",
                      transition: "all 0.3s",
                    }}
                  >
                    {isVis ? (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    ) : (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <button
          onClick={() => setShowLegend((v) => !v)}
          style={{
            background: showLegend
              ? "rgba(99,102,241,0.2)"
              : "rgba(255,255,255,0.07)",
            border: `1px solid ${showLegend ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.09)"}`,
            color: showLegend ? "#818CF8" : "#64748B",
            borderRadius: 8,
            padding: "5px 11px",
            cursor: "pointer",
            fontSize: 11,
            fontFamily: "'Noto Sans Arabic',sans-serif",
            transition: "all 0.2s",
          }}
        >
          {showLegend ? "◉ إخفاء التصنيف" : "○ إظهار التصنيف"}
        </button>
      </div>

      {/* Footer — small, bottom-left, part of page flow */}
      <div
        style={{
          position: "absolute",
          bottom: 6,
          left: 14,
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 10,
          color: "var(--muted-foreground)",
          zIndex: 5,
          pointerEvents: "auto",
        }}
      >
        <span>made with</span>
        <span style={{ color: "#ef4444", fontSize: 11 }}>♥</span>
        <span style={{ color: "var(--muted-foreground)", fontSize: 10 }}>
          by
        </span>
        <a
          href="https://www.linkedin.com/in/mohammad-nour-aldeen-swedan-a985071b5"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#818CF8", textDecoration: "none", fontWeight: 600 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#6366F1")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#818CF8")}
        >
          Mohammad Swedan
        </a>
      </div>

      {/* Export result modal */}
      {exportData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            backdropFilter: "blur(10px)",
          }}
          onClick={() => setExportData(null)}
        >
          <div
            className="bg-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: 28,
              maxWidth: 460,
              width: "90%",
              fontFamily: "'Noto Sans Arabic',sans-serif",
              direction: "rtl",
              boxShadow: "0 0 60px rgba(99,102,241,0.3)",
            }}
          >
            <div
              style={{
                color: "var(--foreground)",
                fontSize: 17,
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              {exportData.type === "png"
                ? "🖼 صورة PNG جاهزة"
                : "📐 ملف SVG جاهز"}
            </div>
            <div
              style={{
                color: "var(--muted-foreground)",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {exportData.type === "svg"
                ? "الملف يحتوي على روابط قابلة للنقر — افتحه في المتصفح."
                : "انقر تحميل ثم احفظ الصورة."}
            </div>
            {exportData.type === "png" && (
              <div
                style={{
                  marginBottom: 16,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.08)",
                  maxHeight: 160,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--background)",
                }}
              >
                <img
                  src={exportData.dataUrl}
                  alt="preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 160,
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <a
                href={exportData.dataUrl}
                download={
                  exportData.type === "png"
                    ? "curriculum-tree.png"
                    : "curriculum-tree.svg"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md font-bold text-sm no-underline"
              >
                تحميل {exportData.type.toUpperCase()}
              </a>
              <button
                onClick={() => setExportData(null)}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--muted-foreground)",
                  padding: "10px 20px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "'Noto Sans Arabic',sans-serif",
                }}
              >
                إغلاق
              </button>
            </div>
            {exportData.type === "svg" && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  background: "rgba(99,102,241,0.1)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--muted-foreground)",
                  lineHeight: 1.6,
                }}
              >
                افتح الملف في Chrome أو Firefox — كل مادة قابلة للنقر.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Course detail modal */}
      {modal && (
        <CourseModal
          course={modal}
          categories={CATEGORIES}
          onClose={() => setModal(null)}
          isPassed={passedCourses.has(modal.id)}
          onTogglePassed={() => togglePassed(modal.id)}
        />
      )}
    </div>
  );
}

export default function CurriculumTreePage({
  isStandalone,
}: { isStandalone?: boolean } = {}) {
  const { majorId } = useParams<{ majorId: string }>();
  const { isAdmin } = useUserRole();
  const [editorMode, setEditorMode] = useState<string | null>(null); // 'edit', 'create', or null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Curriculum data state — populated from API only
  const [CATEGORIES, setCategories] = useState({});
  const [TITLE, setTitle] = useState({ main: "", sub: "" });
  const [COURSES, setCourses] = useState([]);
  const [meta, setMeta] = useState<any>(null); // API metadata (id, majorId, versionNumber, etc.)

  // ── Load data from API on mount ──────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadFromApi() {
      if (!majorId) return;
      try {
        setLoading(true);
        setError(null);

        const curriculums = await getCurriculumsByMajor(majorId);

        if (cancelled) return;

        // The API returns newest first — pick the active one, or the first
        const active =
          curriculums.find((c: any) => c.isActive) || curriculums[0];

        if (active) {
          const appData = dtoToAppData(active);
          setCategories(appData.CATEGORIES);
          setTitle(appData.TITLE);
          setCourses(appData.COURSES as any);
          setMeta(appData._meta);
        } else {
          setEditorMode("create");
        }
      } catch (err: any) {
        console.error("API unreachable.", err);
        if (!cancelled)
          setError(err.message || "Error loading curriculum data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFromApi();
    return () => {
      cancelled = true;
    };
  }, [majorId]);

  // ── Save handler (creates or updates via API) ────────────────
  const handleSave = async (newData: any) => {
    setSaving(true);
    try {
      const isCreate = editorMode === "create" || !meta?.id;
      const metaToSave = isCreate
        ? { majorId: Number(majorId) }
        : meta || { majorId: Number(majorId) };

      const dto = appDataToDto({
        ...newData,
        _meta: metaToSave,
      });

      let result;
      if (!isCreate && metaToSave.id) {
        // Update existing curriculum
        result = await updateCurriculum(metaToSave.id, dto);
      } else {
        // Create new curriculum
        result = await createCurriculum(dto);
      }

      // Apply the returned data
      const appData = dtoToAppData(result);
      setCategories(appData.CATEGORIES);
      setTitle(appData.TITLE);
      setCourses(appData.COURSES as any);
      setMeta(appData._meta);
      setEditorMode(null);
    } catch (err: any) {
      console.error("Save failed:", err);
      alert("فشل الحفظ: " + (err.message || ""));
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="bg-background flex items-center justify-center flex-col gap-4"
        style={{
          width: "100%",
          height: "calc(100vh - 120px)",
          zIndex: 10,
          fontFamily: "'Noto Sans Arabic',sans-serif",
        }}
      >
        {/* <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700;800&display=swap" rel="stylesheet"/> */}
        <div
          style={{
            width: 48,
            height: 48,
            border: "3px solid rgba(99,102,241,0.2)",
            borderTop: "3px solid #818CF8",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div
          style={{
            color: "var(--muted-foreground)",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          جاري تحميل الخطة...
        </div>
      </div>
    );
  }

  // ── Error state (API unreachable) ────────────────────────────
  if (error) {
    return (
      <div
        className="bg-background flex items-center justify-center flex-col gap-5 p-6 box-border direction-rtl"
        style={{
          width: "100%",
          height: "calc(100vh - 120px)",
          zIndex: 10,
          fontFamily: "'Noto Sans Arabic',sans-serif",
        }}
      >
        {/* <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700;800&display=swap" rel="stylesheet"/> */}
        <div style={{ fontSize: 48 }}>⚠️</div>
        <div
          style={{
            color: "var(--foreground)",
            fontSize: 20,
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          تعذّر الاتصال بالخادم
        </div>
        <div
          style={{
            color: "var(--muted-foreground)",
            fontSize: 13,
            textAlign: "center",
            maxWidth: 360,
            lineHeight: 1.8,
          }}
        >
          لم يتمكن التطبيق من تحميل البيانات. تأكد من أن الخادم يعمل ثم حاول
          مجدداً.
        </div>
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 10,
            padding: "10px 18px",
            color: "#FCA5A5",
            fontSize: 11,
            fontFamily: "monospace",
            direction: "ltr",
            maxWidth: "90%",
            wordBreak: "break-all",
            textAlign: "left",
          }}
        >
          {error}
        </div>
        <button
          className="bg-primary text-primary-foreground border-none px-7 py-3 rounded-xl cursor-pointer text-sm font-bold shadow-md"
          onClick={() => window.location.reload()}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (editorMode) {
    const isCreate = editorMode === "create";
    return (
      <DataEditor
        initialData={
          isCreate
            ? {
                CATEGORIES: {},
                TITLE: { main: "خطة جديدة", sub: "يرجى تعديل العناوين" },
                COURSES: [],
              }
            : { CATEGORIES, TITLE, COURSES }
        }
        onSave={handleSave}
        onCancel={() => {
          if (isCreate) {
            window.history.back(); // If they cancel creating a new one, go back
          } else {
            setEditorMode(null);
          }
        }}
        saving={saving}
      />
    );
  }

  return (
    <>
      <CurriculumTree
        onEdit={() => setEditorMode("edit")}
        onCreate={() => setEditorMode("create")}
        CATEGORIES={CATEGORIES}
        TITLE={TITLE}
        COURSES={COURSES}
        isAdmin={isAdmin}
        isStandalone={isStandalone}
      />
    </>
  );
}
