// 智遇 (ZhiYu) - Presentation Generator
// AI-driven immersive recruitment platform
// Uses pptxgenjs v4+ to produce a 12-slide professional deck

import PptxGenJS from "pptxgenjs";

// ── Color Palette ──────────────────────────────────────────
const C = {
  stone:    "#FAF9F7",   // warm stone background
  sage:     "#059669",   // primary accent - sage green
  sageDark: "#047857",   // darker sage for emphasis
  sageLight:"#D1FAE5",   // light sage for cards / highlights
  ink:      "#1E293B",   // dark ink for primary text
  inkMuted: "#475569",   // secondary text
  white:    "#FFFFFF",
  border:   "#E2E8F0",   // subtle border
  danger:   "#DC2626",   // only if needed
};

// ── Typography ──────────────────────────────────────────────
const F = {
  zh:   "Microsoft YaHei",
  en:   "Segoe UI",
  mono: "Consolas",
};

// Slide dimensions (LAYOUT_WIDE = 13.33 x 7.5 inches)
const SLIDE_W = 13.33;
const SLIDE_H = 7.5;
const MARGIN = 0.65;
const CONTENT_W = SLIDE_W - MARGIN * 2;

// ── Helpers ─────────────────────────────────────────────────

/** Add a consistent slide title with a green left accent bar */
function addSlideTitle(slide, pres, title, subtitle) {
  // Green accent bar on the left
  slide.addShape(pres.ShapeType.rect, {
    x: MARGIN,
    y: 0.55,
    w: 0.06,
    h: 0.55,
    fill: { color: C.sage },
  });
  // Title text
  slide.addText(title, {
    x: MARGIN + 0.22,
    y: 0.45,
    w: CONTENT_W - 0.22,
    h: 0.6,
    fontSize: 28,
    fontFace: F.zh,
    color: C.ink,
    bold: true,
    valign: "middle",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: MARGIN + 0.22,
      y: 0.95,
      w: CONTENT_W - 0.22,
      h: 0.35,
      fontSize: 14,
      fontFace: F.en,
      color: C.inkMuted,
      valign: "top",
    });
  }
  // Thin separator line
  slide.addShape(pres.ShapeType.rect, {
    x: MARGIN + 0.22,
    y: subtitle ? 1.35 : 1.1,
    w: CONTENT_W - 0.22,
    h: 0.012,
    fill: { color: C.border },
  });
  return subtitle ? 1.55 : 1.3; // returns y where content can start
}

/** Add a card with optional icon */
function addCard(slide, pres, x, y, w, h, icon, title, desc, accentColor) {
  const color = accentColor || C.sage;
  // Card background
  slide.addShape(pres.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.white },
    rectRadius: 0.08,
    shadow: { type: "outer", blur: 6, offset: 2, color: "000000", opacity: 0.06 },
    line: { color: C.border, width: 0.5 },
  });
  // Top accent line
  slide.addShape(pres.ShapeType.rect, {
    x, y, w, h: 0.045,
    fill: { color },
  });
  // Icon (emoji as text)
  if (icon) {
    slide.addText(icon, {
      x: x + 0.2,
      y: y + 0.2,
      w: 0.5,
      h: 0.5,
      fontSize: 22,
      align: "left",
      valign: "middle",
    });
  }
  // Title
  slide.addText(title, {
    x: x + 0.2,
    y: y + 0.65,
    w: w - 0.4,
    h: 0.4,
    fontSize: 13,
    fontFace: F.zh,
    color: C.ink,
    bold: true,
    valign: "middle",
  });
  // Description
  slide.addText(desc, {
    x: x + 0.2,
    y: y + 1.0,
    w: w - 0.4,
    h: h - 1.2,
    fontSize: 10.5,
    fontFace: F.zh,
    color: C.inkMuted,
    valign: "top",
    lineSpacingMultiple: 1.3,
  });
}

/** Add a page number to the bottom-right */
function addPageNum(slide, num, total) {
  slide.addText(`${num} / ${total}`, {
    x: SLIDE_W - 1.2,
    y: SLIDE_H - 0.45,
    w: 0.9,
    h: 0.3,
    fontSize: 9,
    fontFace: F.en,
    color: C.inkMuted,
    align: "right",
  });
}

/** Add a simple horizontal step indicator */
function addStep(slide, pres, x, y, stepNum, icon, title, desc) {
  const circleR = 0.28;
  // Circle with number
  slide.addShape(pres.ShapeType.ellipse, {
    x: x + 0.8 - circleR,
    y: y,
    w: circleR * 2,
    h: circleR * 2,
    fill: { color: C.sage },
  });
  slide.addText(`${stepNum}`, {
    x: x + 0.8 - circleR,
    y: y,
    w: circleR * 2,
    h: circleR * 2,
    fontSize: 16,
    fontFace: F.en,
    color: C.white,
    bold: true,
    align: "center",
    valign: "middle",
  });
  // Icon
  if (icon) {
    slide.addText(icon, {
      x: x + 0.3,
      y: y + circleR * 2 + 0.2,
      w: 1.0,
      h: 0.4,
      fontSize: 16,
      align: "center",
    });
  }
  // Title
  slide.addText(title, {
    x: x + 0.1,
    y: y + circleR * 2 + 0.55,
    w: 1.4,
    h: 0.35,
    fontSize: 11,
    fontFace: F.zh,
    color: C.ink,
    bold: true,
    align: "center",
  });
  // Description
  slide.addText(desc, {
    x: x + 0.05,
    y: y + circleR * 2 + 0.9,
    w: 1.5,
    h: 0.8,
    fontSize: 9,
    fontFace: F.zh,
    color: C.inkMuted,
    align: "center",
    lineSpacingMultiple: 1.2,
  });
}

/** Add a connecting arrow between steps */
function addStepArrow(slide, pres, x, y) {
  slide.addText("▸", {
    x, y: y + 0.2,
    w: 0.3,
    h: 0.3,
    fontSize: 18,
    color: C.sage,
    align: "center",
    valign: "middle",
  });
}

// ── Main ────────────────────────────────────────────────────

async function generate() {
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_WIDE";       // 13.33" x 7.5" — 16:9
  pres.author = "智遇团队";
  pres.title = "智遇 - AI驱动的沉浸式招聘平台";
  pres.subject = "产品介绍演示文稿";

  const TOTAL = 12;

  // ════════════════════════════════════════════════════════════
  // SLIDE 1 — COVER
  // ════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    // Full sage green background
    slide.background = { color: C.sage };
    // Decorative darker band at bottom
    slide.addShape(pres.ShapeType.rect, {
      x: 0, y: SLIDE_H - 1.5, w: SLIDE_W, h: 1.5,
      fill: { color: C.sageDark },
    });
    // Large centered title
    slide.addText("智 遇", {
      x: 0, y: 1.0, w: SLIDE_W, h: 1.8,
      fontSize: 80,
      fontFace: F.zh,
      color: C.white,
      bold: true,
      align: "center",
      valign: "middle",
      charSpacing: 12,
    });
    // Subtitle
    slide.addText("AI 驱动的沉浸式招聘平台", {
      x: 0, y: 2.8, w: SLIDE_W, h: 0.7,
      fontSize: 26,
      fontFace: F.zh,
      color: C.white,
      align: "center",
      valign: "middle",
    });
    // Divider line
    slide.addShape(pres.ShapeType.rect, {
      x: 4.5, y: 3.7, w: 4.33, h: 0.015,
      fill: { color: C.white },
    });
    // Tagline
    slide.addText("展示真实的你，而不只是一份简历", {
      x: 0, y: 3.9, w: SLIDE_W, h: 0.7,
      fontSize: 18,
      fontFace: F.zh,
      color: C.sageLight,
      align: "center",
      valign: "middle",
      italic: true,
    });
    // Date & URL
    slide.addText("2026.06  ·  dinozone.asia  ·  部署于腾讯云", {
      x: 0, y: SLIDE_H - 1.1, w: SLIDE_W, h: 0.5,
      fontSize: 12,
      fontFace: F.en,
      color: C.sageLight,
      align: "center",
      valign: "middle",
    });
  }

  // ════════════════════════════════════════════════════════════
  // SLIDE 2 — 市场痛点 (Market Pain Points)
  // ════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: C.stone };
    const cy = addSlideTitle(slide, pres, "招聘行业的四个痛点");

    // 2x2 grid of pain points
    const painPoints = [
      { icon: "📄", title: "简历同质化", desc: "数百份相似简历，关键词堆砌严重，HR难以区分真实能力与纸面功夫，筛选效率低下且误判率高。" },
      { icon: "⏰", title: "面试效率低", desc: "人均耗时2-3小时/候选人，面后流失率高达30-50%，大量时间投入却无法转化为有效录用。" },
      { icon: "🔒", title: "信息不对称", desc: "候选人无法了解真实岗位环境与企业文化，HR无法评估沟通、协作等核心软技能。" },
      { icon: "🤖", title: "AI 信任危机", desc: "候选人普遍抵触AI简历筛选，企业缺乏透明、可追溯、可解释的AI辅助招聘方案。" },
    ];

    const cardW = (CONTENT_W - 0.5) / 2;
    const cardH = 2.4;
    const startX = MARGIN;

    painPoints.forEach((pp, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = startX + col * (cardW + 0.5);
      const y = cy + row * (cardH + 0.35);
      addCard(slide, pres, x, y, cardW, cardH, pp.icon, pp.title, pp.desc);
    });

    addPageNum(slide, 2, TOTAL);
  }

  // ════════════════════════════════════════════════════════════
  // SLIDE 3 — 产品方案 (Solution)
  // ════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: C.stone };
    const cy = addSlideTitle(slide, pres, "从简历筛选 → 能力展示");

    // Before / After comparison
    const colW = 4.5;
    const colH = 2.8;
    const colY = cy + 0.2;
    const leftX = MARGIN + 0.8;
    const rightX = MARGIN + CONTENT_W - colW - 0.8;
    const arrowX = MARGIN + CONTENT_W / 2;

    // "Before" column
    slide.addShape(pres.ShapeType.rect, {
      x: leftX, y: colY, w: colW, h: colH,
      fill: { color: C.white },
      rectRadius: 0.08,
      line: { color: C.border, width: 0.5 },
    });
    slide.addShape(pres.ShapeType.rect, {
      x: leftX, y: colY, w: colW, h: 0.04,
      fill: { color: C.inkMuted },
    });
    slide.addText("Before · 传统模式", {
      x: leftX + 0.3, y: colY + 0.25, w: colW - 0.6, h: 0.4,
      fontSize: 15, fontFace: F.zh, color: C.inkMuted, bold: true,
    });
    const beforeSteps = [
      "📋  投递简历",
      "🔑  关键词匹配筛选",
      "⏳  等待通知",
      "👤  传统面试",
    ];
    beforeSteps.forEach((s, i) => {
      slide.addText(s, {
        x: leftX + 0.4, y: colY + 0.85 + i * 0.45, w: colW - 0.8, h: 0.4,
        fontSize: 12, fontFace: F.zh, color: C.inkMuted,
      });
    });

    // "After" column
    slide.addShape(pres.ShapeType.rect, {
      x: rightX, y: colY, w: colW, h: colH,
      fill: { color: C.sageLight },
      rectRadius: 0.08,
      line: { color: C.sage, width: 1.2 },
    });
    slide.addShape(pres.ShapeType.rect, {
      x: rightX, y: colY, w: colW, h: 0.04,
      fill: { color: C.sage },
    });
    slide.addText("After · 智遇模式", {
      x: rightX + 0.3, y: colY + 0.25, w: colW - 0.6, h: 0.4,
      fontSize: 15, fontFace: F.zh, color: C.sage, bold: true,
    });
    const afterSteps = [
      "🔍  浏览岗位",
      "💼  实境体验",
      "🤖  AI 智能分析",
      "📊  立体能力画像",
      "🎯  精准面试",
    ];
    afterSteps.forEach((s, i) => {
      slide.addText(s, {
        x: rightX + 0.4, y: colY + 0.85 + i * 0.4, w: colW - 0.8, h: 0.35,
        fontSize: 12, fontFace: F.zh, color: C.ink, bold: i === afterSteps.length - 1,
      });
    });

    // Arrow between columns
    slide.addText("→", {
      x: arrowX - 0.4, y: colY + colH / 2 - 0.4, w: 0.8, h: 0.8,
      fontSize: 36, color: C.sage, bold: true, align: "center", valign: "middle",
    });

    // Key differentiator quote
    const quoteY = colY + colH + 0.35;
    slide.addShape(pres.ShapeType.rect, {
      x: MARGIN + 0.8, y: quoteY, w: CONTENT_W - 1.6, h: 0.65,
      fill: { color: C.white },
      rectRadius: 0.06,
      line: { color: C.sage, width: 1 },
    });
    slide.addText("✦  不是用 AI 筛人，而是用 AI 创造展示能力的新场景", {
      x: MARGIN + 1.1, y: quoteY, w: CONTENT_W - 2.2, h: 0.65,
      fontSize: 15, fontFace: F.zh, color: C.sage, bold: true, valign: "middle",
    });

    addPageNum(slide, 3, TOTAL);
  }

  // ════════════════════════════════════════════════════════════
  // SLIDE 4 — 核心体验流程 (Core Experience Flow)
  // ════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: C.stone };
    const cy = addSlideTitle(slide, pres, "候选人体验流程");

    const steps = [
      { icon: "🔍", title: "探索岗位", desc: "浏览岗位列表\n重力沙盘表达偏好" },
      { icon: "💼", title: "实境体验", desc: "工作日收件箱模拟\n沙盘推演场景" },
      { icon: "📊", title: "能力画像", desc: "AI 生成\n5 维能力报告" },
      { icon: "📮", title: "投递简历", desc: "完整画像 + \n行为证据链" },
    ];

    const stepW = 2.35;
    const totalStepsW = steps.length * stepW + (steps.length - 1) * 0.4;
    const startX = MARGIN + (CONTENT_W - totalStepsW) / 2;
    const stepY = cy + 0.3;

    steps.forEach((s, i) => {
      const x = startX + i * (stepW + 0.4);
      // Step card
      slide.addShape(pres.ShapeType.rect, {
        x, y: stepY, w: stepW, h: 3.65,
        fill: { color: C.white },
        rectRadius: 0.08,
        shadow: { type: "outer", blur: 4, offset: 1, color: "000000", opacity: 0.04 },
        line: { color: C.border, width: 0.5 },
      });
      // Step number circle at top
      const circleX = x + stepW / 2 - 0.32;
      slide.addShape(pres.ShapeType.ellipse, {
        x: circleX, y: stepY + 0.25, w: 0.64, h: 0.64,
        fill: { color: C.sage },
      });
      slide.addText(`${i + 1}`, {
        x: circleX, y: stepY + 0.25, w: 0.64, h: 0.64,
        fontSize: 20, fontFace: F.en, color: C.white, bold: true,
        align: "center", valign: "middle",
      });
      // Icon
      slide.addText(s.icon, {
        x, y: stepY + 1.1, w: stepW, h: 0.55,
        fontSize: 28, align: "center",
      });
      // Step title
      slide.addText(s.title, {
        x: x + 0.2, y: stepY + 1.75, w: stepW - 0.4, h: 0.4,
        fontSize: 16, fontFace: F.zh, color: C.ink, bold: true,
        align: "center",
      });
      // Desc
      slide.addText(s.desc, {
        x: x + 0.25, y: stepY + 2.3, w: stepW - 0.5, h: 1.1,
        fontSize: 11, fontFace: F.zh, color: C.inkMuted,
        align: "center", lineSpacingMultiple: 1.4,
      });
    });

    // Connecting arrows between steps
    for (let i = 0; i < steps.length - 1; i++) {
      const ax = startX + (i + 1) * stepW + i * 0.4 + 0.05;
      slide.addText("→", {
        x: ax, y: stepY + 1.8, w: 0.3, h: 0.3,
        fontSize: 18, color: C.sage, align: "center",
      });
    }

    addPageNum(slide, 4, TOTAL);
  }

  // ════════════════════════════════════════════════════════════
  // SLIDE 5 — 工作日模拟 (InboxSim — Hero Feature)
  // ════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: C.stone };
    const cy = addSlideTitle(slide, pres, "核心功能：工作日收件箱模拟", "InboxSim — 沉浸式能力评估");

    // Left side — description
    slide.addText("模拟真实工作消息流，在飞书/Slack 风格界面中展示真实工作能力", {
      x: MARGIN, y: cy + 0.1, w: 6.5, h: 0.6,
      fontSize: 15, fontFace: F.zh, color: C.inkMuted, lineSpacingMultiple: 1.3,
    });

    // 4 key specs in a vertical list on the left
    const specs = [
      { label: "4 种操作", desc: "回复、延迟、转交、忽略 — 覆盖真实工作决策" },
      { label: "AI 实时分析", desc: "5 维度回复质量评分，毫秒级反馈" },
      { label: "沉浸式设计", desc: "Frame + Interior 双色板视觉感知切换" },
      { label: "角色感知", desc: "技术/销售/设计/全栈 — 不同岗位不同场景" },
    ];
    specs.forEach((spec, i) => {
      const sy = cy + 0.9 + i * 0.9;
      // Label badge
      slide.addShape(pres.ShapeType.rect, {
        x: MARGIN, y: sy, w: 1.65, h: 0.32,
        fill: { color: C.sage },
        rectRadius: 0.04,
      });
      slide.addText(spec.label, {
        x: MARGIN, y: sy, w: 1.65, h: 0.32,
        fontSize: 10, fontFace: F.zh, color: C.white, bold: true,
        align: "center", valign: "middle",
      });
      slide.addText(spec.desc, {
        x: MARGIN + 1.85, y: sy, w: 4.8, h: 0.32,
        fontSize: 11.5, fontFace: F.zh, color: C.ink, valign: "middle",
      });
    });

    // Right side — visual placeholder (a styled box suggesting the inbox UI)
    const rboxX = 7.0;
    const rboxY = cy + 0.1;
    const rboxW = 5.7;
    const rboxH = 4.6;
    slide.addShape(pres.ShapeType.rect, {
      x: rboxX, y: rboxY, w: rboxW, h: rboxH,
      fill: { color: C.white },
      rectRadius: 0.1,
      shadow: { type: "outer", blur: 8, offset: 3, color: "000000", opacity: 0.08 },
      line: { color: C.border, width: 0.5 },
    });
    // Simulated inbox header
    slide.addShape(pres.ShapeType.rect, {
      x: rboxX, y: rboxY, w: rboxW, h: 0.5,
      fill: { color: C.ink },
      rectRadius: 0.1,
    });
    // Cover the bottom corners of the header to keep rounded top only
    slide.addShape(pres.ShapeType.rect, {
      x: rboxX, y: rboxY + 0.4, w: rboxW, h: 0.1,
      fill: { color: C.ink },
    });
    slide.addText("📥  工作日收件箱  #产品经理 · 周二 10:30", {
      x: rboxX + 0.25, y: rboxY, w: rboxW - 0.5, h: 0.5,
      fontSize: 11, fontFace: F.en, color: C.white, valign: "middle",
    });
    // Simulated messages
    const msgs = [
      { from: "CTO 张总", text: "刚收到客户反馈，登录页加载超3秒，今天能出方案吗？", urgent: true },
      { from: "设计师 小李", text: "Figma里有个交互细节需要你确认一下，方便吗？", urgent: false },
      { from: "实习生 小王", text: "SQL查询跑不动了，能帮我看一下吗？", urgent: false },
    ];
    msgs.forEach((m, i) => {
      const my = rboxY + 0.7 + i * 0.85;
      slide.addShape(pres.ShapeType.rect, {
        x: rboxX + 0.2, y: my, w: rboxW - 0.4, h: 0.7,
        fill: { color: m.urgent ? "#FFF7ED" : C.stone },
        rectRadius: 0.05,
        line: { color: m.urgent ? "#FED7AA" : C.border, width: 0.5 },
      });
      if (m.urgent) {
        slide.addShape(pres.ShapeType.rect, {
          x: rboxX + 0.2, y: my, w: 0.04, h: 0.7,
          fill: { color: C.danger },
        });
      }
      slide.addText(m.from, {
        x: rboxX + 0.45, y: my + 0.05, w: rboxW - 1.0, h: 0.25,
        fontSize: 10, fontFace: F.zh, color: C.ink, bold: true,
      });
      slide.addText(m.text, {
        x: rboxX + 0.45, y: my + 0.28, w: rboxW - 1.0, h: 0.35,
        fontSize: 9, fontFace: F.zh, color: C.inkMuted,
      });
    });
    // 4 action buttons at bottom of the inbox
    const actions = ["↩ 回复", "⏱ 延迟", "↗ 转交", "✕ 忽略"];
    actions.forEach((a, i) => {
      slide.addShape(pres.ShapeType.rect, {
        x: rboxX + 0.3 + i * 1.3, y: rboxY + rboxH - 0.55, w: 1.1, h: 0.35,
        fill: { color: C.stone },
        rectRadius: 0.04,
        line: { color: C.border, width: 0.5 },
      });
      slide.addText(a, {
        x: rboxX + 0.3 + i * 1.3, y: rboxY + rboxH - 0.55, w: 1.1, h: 0.35,
        fontSize: 10, fontFace: F.zh, color: C.inkMuted, align: "center", valign: "middle",
      });
    });

    addPageNum(slide, 5, TOTAL);
  }

  // ════════════════════════════════════════════════════════════
  // SLIDE 6 — 技术架构 (Tech Architecture)
  // ════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: C.stone };
    const cy = addSlideTitle(slide, pres, "技术架构");

    const layers = [
      { label: "前端", color: "#3B82F6", tech: "React 19 + TypeScript + Vite + Framer Motion + Zustand" },
      { label: "网关", color: "#8B5CF6", tech: "Nginx（反向代理 + SSL）" },
      { label: "后端", color: "#F59E0B", tech: "Node.js 22 · 13 个 API 端点 · 8 个 Prompt 模块" },
      { label: "AI 层", color: "#059669", tech: "DeepSeek API（flash 实时 + pro 深度双模型）" },
      { label: "部署", color: "#6366F1", tech: "腾讯云 · PM2 · 腾讯云 SSL" },
    ];

    const layerH = 0.72;
    const layerGap = 0.15;
    const maxW = CONTENT_W - 0.6;
    const startX = MARGIN + 0.3;
    const startY = cy + 0.3;

    layers.forEach((layer, i) => {
      const y = startY + i * (layerH + layerGap);
      const w = maxW * (1 - i * 0.04); // each layer slightly narrower for visual hierarchy

      // Layer background
      slide.addShape(pres.ShapeType.rect, {
        x: startX + (maxW - w) / 2, y, w, h: layerH,
        fill: { color: layer.color },
        rectRadius: 0.06,
        shadow: { type: "outer", blur: 3, offset: 1, color: "000000", opacity: 0.08 },
      });
      // Label
      slide.addText(layer.label, {
        x: startX + (maxW - w) / 2 + 0.3, y, w: 1.2, h: layerH,
        fontSize: 15, fontFace: F.zh, color: C.white, bold: true, valign: "middle",
      });
      // Separator
      slide.addShape(pres.ShapeType.rect, {
        x: startX + (maxW - w) / 2 + 1.55, y: y + 0.15, w: 0.02, h: layerH - 0.3,
        fill: { color: "FFFFFF", transparency: 50 },
      });
      // Tech stack
      slide.addText(layer.tech, {
        x: startX + (maxW - w) / 2 + 1.8, y, w: w - 2.2, h: layerH,
        fontSize: 11, fontFace: F.en, color: C.white, valign: "middle",
      });
    });

    // Bottom annotation
    slide.addText("架构遵循关注点分离原则：前端表现层 → 网关安全层 → 业务逻辑层 → AI推理层 → 基础设施层", {
      x: MARGIN, y: startY + layers.length * (layerH + layerGap) + 0.25, w: CONTENT_W, h: 0.35,
      fontSize: 10, fontFace: F.zh, color: C.inkMuted, italic: true,
    });

    addPageNum(slide, 6, TOTAL);
  }

  // ════════════════════════════════════════════════════════════
  // SLIDE 7 — AI 能力矩阵 (AI Capabilities)
  // ════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: C.stone };
    const cy = addSlideTitle(slide, pres, "AI 能力矩阵");

    const capabilities = [
      ["JD 解析与岗位分析", "Flash", "结构化输出"],
      ["数字人角色对话", "Flash (流式)", "SSE 实时推送"],
      ["工作日模拟交互", "Flash", "实时质量评估"],
      ["候选人画像提取", "Pro", "证据锚点 + 后验证"],
      ["HR 综合报告", "Pro", "多维度评估"],
      ["行为深度洞察", "Pro", "探索模式分析"],
      ["沙盘场景生成", "Flash", "动态场景"],
      ["模拟结果分析", "Pro", "5 维能力评分"],
      ["岗位参数量化", "Flash", "数值提取"],
    ];

    // Table
    const tableRows = [
      [
        { text: "能力项", options: { bold: true, color: C.white, fill: { color: C.ink }, fontSize: 12, fontFace: F.zh, align: "center", valign: "middle" } },
        { text: "模型", options: { bold: true, color: C.white, fill: { color: C.ink }, fontSize: 12, fontFace: F.en, align: "center", valign: "middle" } },
        { text: "特性", options: { bold: true, color: C.white, fill: { color: C.ink }, fontSize: 12, fontFace: F.zh, align: "center", valign: "middle" } },
      ],
      ...capabilities.map((cap, i) => {
        const bgColor = i % 2 === 0 ? C.white : C.stone;
        return [
          { text: cap[0], options: { fill: { color: bgColor }, fontSize: 11, fontFace: F.zh, color: C.ink, valign: "middle" } },
          { text: cap[1], options: { fill: { color: bgColor }, fontSize: 10, fontFace: F.en, color: cap[1].includes("Pro") ? C.sageDark : "#6366F1", bold: true, align: "center", valign: "middle" } },
          { text: cap[2], options: { fill: { color: bgColor }, fontSize: 10, fontFace: F.zh, color: C.inkMuted, align: "center", valign: "middle" } },
        ];
      }),
    ];

    slide.addTable(tableRows, {
      x: MARGIN + 0.5,
      y: cy + 0.15,
      w: CONTENT_W - 1.0,
      colW: [(CONTENT_W - 1.0) * 0.45, (CONTENT_W - 1.0) * 0.22, (CONTENT_W - 1.0) * 0.33],
      rowH: [0.45, ...Array(9).fill(0.38)],
      border: { type: "solid", pt: 0.5, color: C.border },
      margin: [4, 8, 4, 8],
    });

    addPageNum(slide, 7, TOTAL);
  }

  // ════════════════════════════════════════════════════════════
  // SLIDE 8 — 产品创新点 (Innovation)
  // ════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: C.stone };
    const cy = addSlideTitle(slide, pres, "核心创新点");

    const innovations = [
      { icon: "🎯", title: "范式转移", desc: "从筛选简历到展示能力的场景革命 — 让候选人「做」而非「说」" },
      { icon: "🔍", title: "双向透明", desc: "候选人看真相 + HR 看证据 + AI 辅助不替代 — 打破信息黑箱" },
      { icon: "🎨", title: "Frame + Interior", desc: "视觉感知切换实现沉浸式场景模拟 — 飞书/微信等多场景覆盖" },
      { icon: "🧩", title: "角色感知", desc: "技术/销售/设计/全栈各有专属评估体系 — 因岗施策" },
      { icon: "⚡", title: "实时 AI 分析", desc: "回复质量 5 维度实时评分 + 情境化反馈 — 秒级智能评估" },
    ];

    const cardW = CONTENT_W - 0.4;
    const cardH = 0.72;
    const startX = MARGIN + 0.2;

    innovations.forEach((inv, i) => {
      const y = cy + i * (cardH + 0.18);
      // Card background
      slide.addShape(pres.ShapeType.rect, {
        x: startX, y, w: cardW, h: cardH,
        fill: { color: C.white },
        rectRadius: 0.06,
        shadow: { type: "outer", blur: 3, offset: 1, color: "000000", opacity: 0.04 },
        line: { color: C.border, width: 0.5 },
      });
      // Left accent
      slide.addShape(pres.ShapeType.rect, {
        x: startX, y, w: 0.06, h: cardH,
        fill: { color: C.sage },
      });
      // Icon
      slide.addText(inv.icon, {
        x: startX + 0.25, y, w: 0.55, h: cardH,
        fontSize: 22, align: "center", valign: "middle",
      });
      // Number
      slide.addText(`${i + 1}`, {
        x: startX + 0.85, y, w: 0.35, h: cardH,
        fontSize: 14, fontFace: F.en, color: C.sage, bold: true, valign: "middle",
      });
      // Title
      slide.addText(inv.title, {
        x: startX + 1.25, y: y + 0.03, w: 1.8, h: cardH - 0.06,
        fontSize: 14, fontFace: F.zh, color: C.ink, bold: true, valign: "middle",
      });
      // Description
      slide.addText(inv.desc, {
        x: startX + 3.1, y, w: cardW - 3.5, h: cardH,
        fontSize: 11, fontFace: F.zh, color: C.inkMuted, valign: "middle",
      });
    });

    addPageNum(slide, 8, TOTAL);
  }

  // ════════════════════════════════════════════════════════════
  // SLIDE 9 — 信任治理 (Trust Governance)
  // ════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: C.stone };
    const cy = addSlideTitle(slide, pres, "信任治理体系");

    const pillars = [
      {
        icon: "🛡️",
        title: "AI 辅助，HR 决策",
        desc: "所有招聘决定必须经过人工复核确认，AI 提供分析建议但不做最终判断，确保人类始终在决策闭环中。",
      },
      {
        icon: "📋",
        title: "全链路审计",
        desc: "每次 AI 分析附带证据锚点与安全扫描记录，形成可追溯、可复查的完整行为证据链。",
      },
      {
        icon: "⚖️",
        title: "公平指数",
        desc: "7 维度实时监控（性别/年龄/学历/地域/经验/语言/算法偏差），支持人工覆写与校准。",
      },
      {
        icon: "🔐",
        title: "候选人数据权利",
        desc: "依据《个人信息保护法》，候选人可查看、解释、删除自己的数据，全流程透明可追溯。",
      },
    ];

    const cardW = (CONTENT_W - 0.9) / 2;
    const cardH = 2.35;
    const startX = MARGIN;

    pillars.forEach((p, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = startX + col * (cardW + 0.9);
      const y = cy + row * (cardH + 0.25);

      // Card
      slide.addShape(pres.ShapeType.rect, {
        x, y, w: cardW, h: cardH,
        fill: { color: C.white },
        rectRadius: 0.08,
        shadow: { type: "outer", blur: 5, offset: 2, color: "000000", opacity: 0.05 },
        line: { color: C.border, width: 0.5 },
      });
      // Icon in a circle
      const circleX = x + 0.3;
      const circleY = y + 0.3;
      slide.addShape(pres.ShapeType.ellipse, {
        x: circleX, y: circleY, w: 0.65, h: 0.65,
        fill: { color: C.sageLight },
      });
      slide.addText(p.icon, {
        x: circleX, y: circleY, w: 0.65, h: 0.65,
        fontSize: 24, align: "center", valign: "middle",
      });
      // Title
      slide.addText(p.title, {
        x: x + 1.15, y: y + 0.3, w: cardW - 1.5, h: 0.4,
        fontSize: 15, fontFace: F.zh, color: C.ink, bold: true, valign: "middle",
      });
      // Description
      slide.addText(p.desc, {
        x: x + 0.3, y: y + 1.15, w: cardW - 0.6, h: cardH - 1.35,
        fontSize: 11, fontFace: F.zh, color: C.inkMuted, lineSpacingMultiple: 1.35,
      });
    });

    addPageNum(slide, 9, TOTAL);
  }

  // ════════════════════════════════════════════════════════════
  // SLIDE 10 — 应用场景 (Application Scenarios)
  // ════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: C.stone };
    const cy = addSlideTitle(slide, pres, "应用场景");

    const scenarios = [
      {
        icon: "💻",
        title: "技术岗位招聘",
        desc: "线上故障排查、新人求助响应、CTO 紧急催促 — 模拟真实开发场景，评估技术决策与沟通能力。",
        color: "#3B82F6",
      },
      {
        icon: "💼",
        title: "销售岗位招聘",
        desc: "客户投诉处理、Pipeline 风险评估、竞品威胁应对 — 考察抗压能力与商务沟通技巧。",
        color: "#F59E0B",
      },
      {
        icon: "🎨",
        title: "设计岗位招聘",
        desc: "模糊 Brief 响应、多方矛盾协调、设计评审会议 — 评估设计思维与跨部门协作能力。",
        color: "#8B5CF6",
      },
      {
        icon: "🎓",
        title: "校园批量招聘",
        desc: "标准化场景评估 + 自动化智能排序 — 批量筛选应届生，大幅降低初筛成本。",
        color: "#10B981",
      },
    ];

    const cardW = (CONTENT_W - 0.6) / 2;
    const cardH = 2.15;
    const startX = MARGIN;

    scenarios.forEach((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = startX + col * (cardW + 0.6);
      const y = cy + row * (cardH + 0.2);

      // Card
      slide.addShape(pres.ShapeType.rect, {
        x, y, w: cardW, h: cardH,
        fill: { color: C.white },
        rectRadius: 0.08,
        shadow: { type: "outer", blur: 4, offset: 1, color: "000000", opacity: 0.05 },
        line: { color: C.border, width: 0.5 },
      });
      // Top accent bar
      slide.addShape(pres.ShapeType.rect, {
        x, y, w: cardW, h: 0.045,
        fill: { color: s.color },
      });
      // Icon
      slide.addText(s.icon, {
        x: x + 0.25, y: y + 0.25, w: 0.55, h: 0.55,
        fontSize: 26, valign: "middle",
      });
      // Title
      slide.addText(s.title, {
        x: x + 0.9, y: y + 0.3, w: cardW - 1.2, h: 0.4,
        fontSize: 15, fontFace: F.zh, color: C.ink, bold: true, valign: "middle",
      });
      // Description
      slide.addText(s.desc, {
        x: x + 0.25, y: y + 0.9, w: cardW - 0.5, h: cardH - 1.1,
        fontSize: 10.5, fontFace: F.zh, color: C.inkMuted, lineSpacingMultiple: 1.35,
      });
    });

    addPageNum(slide, 10, TOTAL);
  }

  // ════════════════════════════════════════════════════════════
  // SLIDE 11 — 落地规划 (Roadmap)
  // ════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: C.stone };
    const cy = addSlideTitle(slide, pres, "落地规划");

    const phases = [
      {
        phase: "Phase 1 · 当前",
        label: "MVP v0.1",
        color: C.sage,
        items: ["7 个岗位覆盖", "全流程闭环", "AI 智能分析", "已部署腾讯云"],
      },
      {
        phase: "Phase 2 · 近期",
        label: "v0.2 – v0.3",
        color: "#3B82F6",
        items: ["企业入驻体系", "身份认证系统", "简历解析引擎", "通知推送系统"],
      },
      {
        phase: "Phase 3 · 中期",
        label: "v1.0",
        color: "#8B5CF6",
        items: ["视频数字人", "多语言支持", "ATS 系统集成", "移动端适配"],
      },
    ];

    const colW = (CONTENT_W - 1.2) / 3;
    const startX = MARGIN;
    const colY = cy + 0.2;
    const colH = 4.2;

    phases.forEach((p, i) => {
      const x = startX + i * (colW + 0.6);

      // Column card
      slide.addShape(pres.ShapeType.rect, {
        x, y: colY, w: colW, h: colH,
        fill: { color: C.white },
        rectRadius: 0.08,
        shadow: { type: "outer", blur: 4, offset: 1, color: "000000", opacity: 0.04 },
        line: { color: C.border, width: 0.5 },
      });

      // Phase header
      slide.addShape(pres.ShapeType.rect, {
        x, y: colY, w: colW, h: 0.7,
        fill: { color: p.color },
        rectRadius: 0.08,
      });
      slide.addShape(pres.ShapeType.rect, {
        x, y: colY + 0.6, w: colW, h: 0.1,
        fill: { color: p.color },
      });
      slide.addText(p.phase, {
        x, y: colY, w: colW, h: 0.35,
        fontSize: 10, fontFace: F.en, color: C.white, align: "center", valign: "bottom",
      });
      slide.addText(p.label, {
        x, y: colY + 0.25, w: colW, h: 0.4,
        fontSize: 16, fontFace: F.en, color: C.white, bold: true, align: "center", valign: "middle",
      });

      // Items
      p.items.forEach((item, j) => {
        const iy = colY + 1.05 + j * 0.72;
        // Check icon circle
        slide.addShape(pres.ShapeType.ellipse, {
          x: x + 0.3, y: iy + 0.08, w: 0.32, h: 0.32,
          fill: { color: p.color },
        });
        slide.addText("✓", {
          x: x + 0.3, y: iy + 0.08, w: 0.32, h: 0.32,
          fontSize: 12, fontFace: F.en, color: C.white, align: "center", valign: "middle",
        });
        slide.addText(item, {
          x: x + 0.75, y: iy, w: colW - 1.1, h: 0.47,
          fontSize: 12, fontFace: F.zh, color: C.ink, valign: "middle",
        });
      });

      // Progress indicator at bottom
      const progY = colY + colH - 0.55;
      slide.addText(i === 0 ? "● 进行中" : i === 1 ? "○ 规划中" : "○ 筹备中", {
        x: x + 0.3, y: progY, w: colW - 0.6, h: 0.35,
        fontSize: 10, fontFace: F.zh,
        color: i === 0 ? C.sage : C.inkMuted,
        bold: i === 0,
      });
    });

    addPageNum(slide, 11, TOTAL);
  }

  // ════════════════════════════════════════════════════════════
  // SLIDE 12 — Thank You / Contact
  // ════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: C.sage };

    // Dark overlay at bottom
    slide.addShape(pres.ShapeType.rect, {
      x: 0, y: SLIDE_H - 1.5, w: SLIDE_W, h: 1.5,
      fill: { color: C.sageDark },
    });

    // Large "谢谢"
    slide.addText("谢 谢", {
      x: 0, y: 1.4, w: SLIDE_W, h: 1.6,
      fontSize: 72,
      fontFace: F.zh,
      color: C.white,
      bold: true,
      align: "center",
      valign: "middle",
      charSpacing: 10,
    });

    // Subtitle
    slide.addText("智遇 · 让招聘回归能力本身", {
      x: 0, y: 3.2, w: SLIDE_W, h: 0.7,
      fontSize: 22,
      fontFace: F.zh,
      color: C.sageLight,
      align: "center",
      valign: "middle",
    });

    // Divider
    slide.addShape(pres.ShapeType.rect, {
      x: 5, y: 4.1, w: 3.33, h: 0.015,
      fill: { color: C.white },
    });

    // Contact info at bottom
    slide.addText("dinozone.asia  ·  部署于腾讯云  ·  2026.06", {
      x: 0, y: SLIDE_H - 1.1, w: SLIDE_W, h: 0.5,
      fontSize: 13,
      fontFace: F.en,
      color: C.sageLight,
      align: "center",
      valign: "middle",
    });
  }

  // ── Save ──────────────────────────────────────────────────
  const outPath = "d:/AI招聘/docs/智遇-演示文稿.pptx";
  await pres.writeFile({ fileName: outPath });
  console.log(`✅ Presentation saved to: ${outPath}`);
  console.log(`   ${TOTAL} slides · ${pres.layout} · 智遇 ZhiYu`);
}

generate().catch((err) => {
  console.error("❌ Failed to generate presentation:", err);
  process.exit(1);
});
