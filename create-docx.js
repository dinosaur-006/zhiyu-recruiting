import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType,
  TableOfContents, PageBreak, Header, Footer, PageNumber,
  ShadingType, convertInchesToTwip, TabStopPosition, TabStopType,
} from "docx";
import * as fs from "fs";
import * as path from "path";

// ├───────────────────────────────────────────────────────────────
// BRAND TOKENS
// └───────────────────────────────────────────────────────────────
const BRAND = {
  ink: "1A1A1A",
  inkDim: "4A4A4A",
  accent: "059669",
  accentSubtle: "D1FAE5",
  secondary: "6366F1",
  secondarySubtle: "E0E7FF",
  warning: "D97706",
  warningSubtle: "FEF3C7",
  positive: "059669",
  negative: "DC2626",
  muted: "6B7280",
  surface: "F9FAFB",
  border: "E5E7EB",
  borderStrong: "D1D5DB",
};

const FONT_SANS = "Microsoft YaHei";
const FONT_MONO = "Consolas";
const FONT_DISPLAY = "SimHei";

// ├───────────────────────────────────────────────────────────────
// STYLES
// └───────────────────────────────────────────────────────────────
const styles = {
  default: {
    document: {
      run: {
        font: FONT_SANS,
        size: 22, // ~11pt
        color: BRAND.ink,
      },
      paragraph: {
        spacing: { after: 120, line: 276 }, // 1.15x line
      },
    },
  },
  paragraphStyles: [
    {
      id: "heading1",
      name: "Heading 1",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: {
        font: FONT_DISPLAY,
        size: 40, // 20pt
        bold: true,
        color: BRAND.ink,
      },
      paragraph: {
        spacing: { before: 400, after: 200, line: 360 },
        border: {
          bottom: { color: BRAND.accent, size: 6, space: 8, style: BorderStyle.SINGLE },
        },
      },
    },
    {
      id: "heading2",
      name: "Heading 2",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: {
        font: FONT_DISPLAY,
        size: 32, // 16pt
        bold: true,
        color: BRAND.accent,
      },
      paragraph: {
        spacing: { before: 320, after: 160, line: 320 },
      },
    },
    {
      id: "heading3",
      name: "Heading 3",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: {
        font: FONT_SANS,
        size: 26, // 13pt
        bold: true,
        color: BRAND.ink,
      },
      paragraph: {
        spacing: { before: 240, after: 120, line: 300 },
      },
    },
  ],
};

// ├───────────────────────────────────────────────────────────────
// HELPERS
// └───────────────────────────────────────────────────────────────

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: FONT_DISPLAY, size: 40, bold: true, color: BRAND.ink })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: FONT_DISPLAY, size: 32, bold: true, color: BRAND.accent })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, font: FONT_SANS, size: 26, bold: true, color: BRAND.ink })],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: opts.spacing || { after: 120, line: 276 },
    children: [new TextRun({ text, font: FONT_SANS, size: 22, color: opts.color || BRAND.inkDim, ...opts.run })],
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
  });
}

function boldP(label, text) {
  return new Paragraph({
    spacing: { after: 120, line: 276 },
    children: [
      new TextRun({ text: label, font: FONT_SANS, size: 22, bold: true, color: BRAND.ink }),
      new TextRun({ text: "  " + text, font: FONT_SANS, size: 22, color: BRAND.inkDim }),
    ],
    alignment: AlignmentType.JUSTIFIED,
  });
}

function bulletP(text) {
  return new Paragraph({
    spacing: { after: 80, line: 276 },
    children: [new TextRun({ text: `•  ${text}`, font: FONT_SANS, size: 22, color: BRAND.inkDim })],
    indent: { left: convertInchesToTwip(0.3) },
  });
}

function numberP(num, text) {
  return new Paragraph({
    spacing: { after: 80, line: 276 },
    children: [new TextRun({ text: `${num}. ${text}`, font: FONT_SANS, size: 22, color: BRAND.inkDim })],
    indent: { left: convertInchesToTwip(0.3) },
  });
}

function metricCard(title, value, unit) {
  return new Paragraph({
    spacing: { after: 80, line: 300 },
    children: [
      new TextRun({ text: `${title}: `, font: FONT_SANS, size: 22, bold: true, color: BRAND.ink }),
      new TextRun({ text: `${value}`, font: FONT_MONO, size: 24, bold: true, color: BRAND.accent }),
      new TextRun({ text: ` ${unit}`, font: FONT_SANS, size: 20, color: BRAND.muted }),
    ],
  });
}

function makeCell(text, opts = {}) {
  return new TableCell({
    shading: opts.shading ? { type: ShadingType.SOLID, color: opts.shading } : undefined,
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    children: [new Paragraph({
      spacing: { before: 40, after: 40, line: 240 },
      alignment: opts.alignment || AlignmentType.LEFT,
      children: [new TextRun({
        text,
        font: FONT_SANS,
        size: opts.size || 20,
        bold: opts.bold || false,
        color: opts.color || BRAND.ink,
      })],
    })],
  });
}

function makeHeaderCell(text, width) {
  return makeCell(text, {
    bold: true,
    width,
    shading: BRAND.accentSubtle,
    color: BRAND.accent,
    size: 20,
    alignment: AlignmentType.CENTER,
  });
}

function makeTable(headers, rows, colWidths) {
  const headerRow = new TableRow({
    children: headers.map((h, i) => makeHeaderCell(h, colWidths ? colWidths[i] : undefined)),
    tableHeader: true,
  });
  const dataRows = rows.map((row) =>
    new TableRow({
      children: row.map((cell, i) => makeCell(cell, { width: colWidths ? colWidths[i] : undefined, size: 20 })),
    })
  );
  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: BRAND.border },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: BRAND.border },
      left: { style: BorderStyle.SINGLE, size: 1, color: BRAND.border },
      right: { style: BorderStyle.SINGLE, size: 1, color: BRAND.border },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 0.5, color: BRAND.border },
      insideVertical: { style: BorderStyle.SINGLE, size: 0.5, color: BRAND.border },
    },
  });
}

function spacer(lines = 1) {
  const result = [];
  for (let i = 0; i < lines; i++) {
    result.push(new Paragraph({
      spacing: { before: 0, after: 0, line: 140 },
      children: [new TextRun({ text: "", size: 8 })],
    }));
  }
  return result;
}

// ├───────────────────────────────────────────────────────────────
// CONTENT SECTIONS
// └───────────────────────────────────────────────────────────────

function coverPage() {
  return [
    new Paragraph({ spacing: { before: 2400 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200, line: 400 },
      children: [new TextRun({ text: "智遇", font: FONT_DISPLAY, size: 72, bold: true, color: BRAND.accent })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160, line: 320 },
      children: [new TextRun({ text: "AI数字人招聘前置筛选与双向匹配系统", font: FONT_DISPLAY, size: 32, bold: true, color: BRAND.ink })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400, line: 300 },
      children: [new TextRun({ text: "产品说明文档", font: FONT_SANS, size: 28, color: BRAND.inkDim })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80, line: 300 },
      border: {
        top: { color: BRAND.accent, size: 2, space: 16, style: BorderStyle.SINGLE },
        bottom: { color: BRAND.accent, size: 2, space: 16, style: BorderStyle.SINGLE },
      },
      children: [new TextRun({ text: "展示真实的你，而不只是一份简历", font: FONT_SANS, size: 24, italics: true, color: BRAND.accent })],
    }),
    new Paragraph({ spacing: { before: 600 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80, line: 260 },
      children: [new TextRun({ text: "版本：Alpha v0.1", font: FONT_MONO, size: 20, color: BRAND.muted })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80, line: 260 },
      children: [new TextRun({ text: "更新日期：2026年6月14日", font: FONT_MONO, size: 20, color: BRAND.muted })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80, line: 260 },
      children: [new TextRun({ text: "所属企业：星河云智科技（Demo）", font: FONT_MONO, size: 20, color: BRAND.muted })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80, line: 260 },
      children: [new TextRun({ text: "部署域名：dinozone.asia", font: FONT_MONO, size: 20, color: BRAND.muted })],
    }),
    ...spacer(2),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200, line: 300 },
      children: [new TextRun({ text: "本文档基于产品实际代码结构与数据生成，全面描述智遇系统的产品定位、技术架构、功能模块与信任治理体系。", font: FONT_SANS, size: 18, color: BRAND.muted })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function tocSection() {
  return [
    h1("目录"),
    spacer(),
    p("1.  产品概述", { run: { bold: true, font: FONT_DISPLAY } }),
    p("2.  核心价值主张", { run: { bold: true, font: FONT_DISPLAY } }),
    p("3.  系统架构", { run: { bold: true, font: FONT_DISPLAY } }),
    p("4.  功能模块详解", { run: { bold: true, font: FONT_DISPLAY } }),
    p("    4.1  候选人端功能", { run: { bold: true } }),
    p("    4.2  HR端功能", { run: { bold: true } }),
    p("    4.3  信任治理体系", { run: { bold: true } }),
    p("5.  岗位数据", { run: { bold: true, font: FONT_DISPLAY } }),
    p("6.  关键指标与数据", { run: { bold: true, font: FONT_DISPLAY } }),
    p("7.  技术栈", { run: { bold: true, font: FONT_DISPLAY } }),
    p("8.  产品路线与限制", { run: { bold: true, font: FONT_DISPLAY } }),
    p("9.  附录：页面路由表", { run: { bold: true, font: FONT_DISPLAY } }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function section1_Overview() {
  return [
    h1("1. 产品概述"),
    p("智遇（ZhiYu）是一款面向招聘场景的AI数字人前置筛选与双向匹配系统。产品核心理念是通过AI构建沉浸式岗位实境，让候选人在真实工作场景中展示其思考方式和技术判断，而非依赖传统简历进行关键词匹配。同时为HR提供基于AI分析的候选人综合画像与信任治理工具，实现招聘过程中的信息透明与双向匹配。"),
    spacer(),
    h2("1.1 产品定位"),
    bulletP("产品名称：智遇（ZhiYu）"),
    bulletP("产品类型：SaaS Web应用"),
    bulletP("目标用户：企业HR / 候选人 双端"),
    bulletP("核心场景：招聘前置筛选、岗位匹配、信任建立"),
    bulletP("行业领域：企业服务 / AI招聘"),
    bulletP("Demo企业：星河云智科技（100-300人，Base北京）"),
    spacer(),
    h2("1.2 解决的核心问题"),
    p("传统招聘面临三大痛点："),
    numberP(1, "信息不对称 — 候选人仅凭JD文字无法真实感知岗位的工作节奏、团队氛围和技术挑战；HR仅凭简历关键词无法判断候选人的综合能力和文化匹配度。"),
    numberP(2, "双向不信任 — 候选人与企业之间存在天然的沟通壁垒，招聘过程中的承诺与实际情况经常出现落差，导致入职后快速流失。"),
    numberP(3, "筛选效率低下 — HR需花费大量时间进行初步沟通与简历筛选，但最终入职转化率仍然不理想。据统计，平台当前平均只完成约60%的沟通转化率。"),
    p("智遇通过AI实境体验+信任治理双重机制，在上述三大痛点上提供了系统性解决方案。"),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function section2_ValueProposition() {
  return [
    h1("2. 核心价值主张"),
    p("智遇的核心差异在于「不是让AI替代招聘决策，而是让AI帮助双方做出更真实、更知情的双向选择」。"),
    spacer(),
    h2("2.1 对候选人的价值"),
    bulletP("沉浸式岗位体验：进入AI构建的岗位实境（GravitySandbox），体验一日工作节奏、团队协作场景和真实任务挑战，而非仅凭JD文字判断。"),
    bulletP("岗位真相透明：通过「岗位真相标签」机制，7个关键维度（工作节奏、协作密度、代码规范度、模糊容忍度、自主空间、薪资福利、成长路径）以可量化的方式呈现。"),
    bulletP("双向选择权利：签署「真相合约」前可充分了解岗位信息；完成实境体验后可双向确认是否继续面试，候选人拥有知情权和拒绝权。"),
    bulletP("AI智能画像：对话过程中的信息被AI自动萃取并生成个人能力报告，替代传统繁琐的表单填写。所有萃取结果提供原文引用验证。"),
    spacer(),
    h2("2.2 对HR的价值"),
    bulletP("AI辅助筛选：系统自动生成候选人实境报告（Reality Report），包含沉默风险评估、承诺一致性检查、AI建议可信度标识等，HR始终保持最终决策权。"),
    bulletP("信任治理仪表盘：沙盘观测站（Dashboard）实时汇总所有候选人的信任健康度指标，提供优先行动建议和风险评估。"),
    bulletP("效率提升：根据Demo数据，系统预估已节省约48小时面试排期时间和42小时HR人工筛选时间。"),
    bulletP("风险预警：自动检测高沉默风险候选人、信任缺口、承诺一致性偏差等，帮助HR主动干预而非被动反应。"),
    spacer(),
    h2("2.3 平台核心指标（Demo数据）"),
    metricCard("页面访问量", "1,894", "次"),
    metricCard("对话启动数", "876", "次"),
    metricCard("对话完成率", "59.7", "%"),
    metricCard("实境体验启动", "580", "次"),
    metricCard("实境体验完成", "218", "次"),
    metricCard("候选人投递数", "218", "人"),
    metricCard("候选人公平指数", "88", "分"),
    metricCard("AI风险复核通过率", "85", "%"),
    metricCard("平均候选人信任指数", "71", "分"),
    metricCard("高信任候选人占比", "68", "%"),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function section3_Architecture() {
  return [
    h1("3. 系统架构"),
    p("智遇采用前后端分离的现代Web应用架构，前端基于React SPA，后端基于Node.js + TypeScript，AI能力通过DeepSeek API接入。"),
    spacer(),
    h2("3.1 整体架构"),
    bulletP("前端：React 19 + TypeScript + Vite 7，使用React Router v7实现SPA路由，Zustand进行状态管理，Recharts进行数据可视化，Framer Motion实现动画效果。"),
    bulletP("后端：Node.js + TypeScript，Express风格的路由分发，支持DeepSeek API代理调用与Mock数据双通道。"),
    bulletP("AI层：DeepSeek API提供岗位分析、候选人对话响应、实境报告生成、候选人画像萃取、场景分岔生成等AI能力。所有AI输出均经过结构化Schema验证。"),
    bulletP("数据存储：当前Alpha阶段使用内存状态管理（Zustand store），预置Demo数据。未来将接入持久化数据库。"),
    spacer(),
    h2("3.2 路由架构"),
    bulletP("候选人端（/candidate/*）：6个子路由，覆盖从岗位浏览到体验完成的完整流程。"),
    bulletP("HR端（/hr/*）：9个子路由，覆盖从沙盘观测到候选人管理、岗位发布、数据分析的全流程。"),
    bulletP("入口页（/）：编辑级Hero页，支持岗位搜索、分类筛选和快速匹配。"),
    spacer(),
    h2("3.3 AI交互架构"),
    p("系统通过5种核心AI Prompt类型实现智能化功能："),
    bulletP("岗位分析（Job Analysis）：解析JD文本，生成结构化岗位画像，包括硬技能、软技能、卖点、风险点等。"),
    bulletP("实境剧本生成（Reality Scripts）：基于岗位参数生成沉浸式对话场景和分岔任务。"),
    bulletP("HR综合报告（HR Report）：汇总候选人在体验中的关注维度、信任缺口、修复建议。"),
    bulletP("候选人画像萃取（Profile Extraction）：从对话数据中提取技能、特质、顾虑，并强制进行原文引用校验。"),
    bulletP("内省洞察（Insight）：生成候选人能力报告摘要、面试建议问题、职业发展建议。"),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function section4_Features() {
  return [
    h1("4. 功能模块详解"),
    spacer(),
    h2("4.1 候选人端功能"),
    p("候选人端提供完整的岗位探索与实境体验流程，共涵盖6个核心页面："),
    spacer(),
    h3("4.1.1 首页（Home）"),
    p("编辑级Hero页面，以「展示真实的你，而不只是一份简历」为核心标语。包含以下功能："),
    bulletP("Hero区：动态渐变光球+脉冲环动画+粒子漂浮效果+网点纹理背景，营造「沉浸式」视觉氛围。"),
    bulletP("信任指标条：实时展示AI风险复核通过率（100%）、累计体验完成数（76+）、候选人公平指数（88%）。"),
    bulletP("岗位搜索：支持按岗位名称、部门、技能关键词实时搜索。"),
    bulletP("分类筛选：6个分类标签（全部/前端/后端/全栈/AI数据/管理），带emoji标识。"),
    bulletP("岗位卡片：展示匹配度评分（50-95%）、NEW/HOT标签、薪资范围、技能标签、卖点摘要。"),
    bulletP("快速匹配测验（Skills Quiz）：30秒技能匹配问答，自动推荐适合的岗位方向。"),
    bulletP("操作流程说明（HowItWorks）：三步流程可视化展示。"),
    bulletP("信任透明区：展示AI辅助决策边界、候选人权利保障信息。"),
    spacer(),
    h3("4.1.2 岗位详情（JobDetail）"),
    p("以「GravitySandbox」（重力沙盒）为核心的岗位深度探索页："),
    bulletP("岗位真相标签（Job Truth Label）：7维度雷达图展示岗位真实画像，包括工作节奏、协作密度、代码规范度、模糊容忍度、自主空间等。"),
    bulletP("岗位真相合约（Job Truth Contract）：AI生成的6-8条岗位真相条款，包含置信度和证据来源。"),
    bulletP("实境角色：展示候选人将扮演的角色及其在团队中的位置。"),
    bulletP("实境剧本预览：展示体验流程中的场景概览。"),
    bulletP("分岔场景预告：预告体验中将面临的决策分岔点。"),
    bulletP("场景简报（Scene Briefing）：背景设定与挑战说明。"),
    bulletP("环境蓝图（Environment Blueprint）：团队构成与工作环境描述。"),
    spacer(),
    h3("4.1.3 AI对话体验（Chat）"),
    p("模拟入职第一天的工作场景，候选人与AI数字人进行沉浸式对话："),
    bulletP("场景进度（Scene Progress）：追踪体验进度，展示已完成/进行中的场景。"),
    bulletP("数字人卡片（Digital Human Card）：展示对话对象的身份、性格、角色定位。"),
    bulletP("选择构建器（Choice Builder）：在关键决策点提供多选一的分岔选择，每项选择附带多维能力评估分析。"),
    bulletP("问题芯片（Question Chips）：预设的追问选项，帮助候选人主动探索岗位信息。"),
    bulletP("一日预览（DayInLife Preview）：模拟一天工作生活的节奏快照。"),
    bulletP("反向提问机制：候选人在体验中可主动向岗位提问（如工作节奏、薪资福利、团队氛围等），系统生成拟真的团队同事回复。"),
    spacer(),
    h3("4.1.4 个人画像补充（Profile）"),
    p("对话式AI表单替代传统简历填写："),
    bulletP("AI对话引导：以自然对话方式收集技能、经验、动机、顾虑等信息。"),
    bulletP("自动信息萃取（Extracted Profile）：AI自动从对话提取技能标签、性格特质、核心顾虑，附带置信度和原文引用验证。"),
    bulletP("萃取透明度：所有AI提取结果标明原文出处，可验证可质疑。"),
    bulletP("自我报告档案（Self-Reported Profile）：保留候选人主动提供的信息，与AI萃取结果相互对照。"),
    spacer(),
    h3("4.1.5 能力报告预览（StoryPreview）"),
    p("候选人可在投递前预览自己的AI能力报告："),
    bulletP("优势亮点（Strengths）：基于对话识别的能力优势标签，附带证据锚点。"),
    bulletP("匹配度总结（Fit Summary）：AI生成的岗位匹配度综合评语。"),
    bulletP("面试建议问题：AI建议HR在面试中应深入提问的方向。"),
    bulletP("候选人反向提问建议：AI建议候选人在面试中应提出的问题。"),
    bulletP("职业发展建议（Career Tips）：基于当前能力画像的成长方向建议。"),
    spacer(),
    h3("4.1.6 投递成功（Success）"),
    p("体验完成后的庆祝与行动引导页："),
    bulletP("庆祝动画与进度时间线。"),
    bulletP("AI对话表现评估：专业度、共情力、清晰度、行动力、简洁度5维评分。"),
    bulletP("下一步指引：告知候选人后续HR联系的时间预期和准备建议。"),
    bulletP("收件箱模拟（InboxSim）：模拟企业内部的异步消息体验（如团队成员的欢迎消息、HR的确认通知等），进一步加深真实感。"),
    new Paragraph({ children: [new PageBreak()] }),
    h2("4.2 HR端功能"),
    p("HR端提供从沙盘观测到候选人深度分析、岗位管理、数据洞察的完整工作流："),
    spacer(),
    h3("4.2.1 沙盘观测站（Dashboard）"),
    p("HR端核心控制台，实时汇总所有招聘数据："),
    bulletP("KPI指标条：发布岗位数、待处理信任修复数、云试岗完成率。"),
    bulletP("今日优先行动：按优先级排序的信任修复任务列表，包括沉默风险处理、岗位承诺缺口补齐、证据不足建议确认。"),
    bulletP("沙盘行为特征云图：基于候选人注意力分布的5维雷达图（关注成长、关注薪资、关注团队、关注节奏、关注技术）。"),
    bulletP("星系图探索热力分布：展示候选人对不同维度的关注热度，附带AI洞察建议。"),
    bulletP("候选人队列：展示TOP候选人及其信任指数（彩色标识高/中/低风险），支持快速跳转详情。"),
    bulletP("AI信任健康度覆写：7维度AI自动评分+HR手动校准+备注追溯的混合决策界面。"),
    bulletP("候选人实时动态：最近候选人行为时间线（投递、邀约、入库等）。"),
    spacer(),
    h3("4.2.2 岗位管理（Jobs）"),
    bulletP("岗位列表：查看所有已发布岗位，按状态筛选。"),
    bulletP("新建岗位（JobNew）：填写岗位信息表单（标题、部门、职责、要求、团队、成长路径等），AI自动生成岗位分析与情景参数。"),
    bulletP("分享岗位（Share）：生成可分享的岗位链接和二维码。"),
    spacer(),
    h3("4.2.3 AI数字人配置（AvatarConfig）"),
    p("为每个岗位配置专属AI数字人："),
    bulletP("数字人身份：姓名、身份定位、沟通风格（严谨专业/轻松友好/专业且友好）。"),
    bulletP("对话时长：3分钟快聊/8分钟标准聊/15分钟深聊。"),
    bulletP("聚焦话题与禁止话题：自定义数字人对话的范围边界。"),
    bulletP("开场白与引导语：可定制的首轮对话脚本。"),
    spacer(),
    h3("4.2.4 候选人管理（Candidates）"),
    p("候选人列表管理与深度分析："),
    bulletP("候选人列表：按状态分栏（对话中/已投递/已邀约/已入库），展示姓名、来源渠道、信任指数、状态标签。"),
    bulletP("候选人详情（CandidateDetail）：多面板综合视图，包含："),
    bulletP("  - 实境报告（Reality Report）：综合信任评估，包含候选人信任指数、关注维度分布。"),
    bulletP("  - HR故事卡（Story Card）：AI生成的候选人叙事画像，包括亮点时刻、顾虑信号、AI面试建议。"),
    bulletP("  - 信任缺口诊断（Trust Gap Diagnosis）：识别候选人与岗位之间的信任差距。"),
    bulletP("  - 沉默风险评估（Silence Risk）：基于沟通信号检测候选人流失风险，提供唤醒话术。"),
    bulletP("  - 承诺一致性检查（Commitment Consistency）：比对岗位承诺与候选人实际关注点的一致性。"),
    bulletP("  - AI建议依赖标识（AI Advice Reliance）：对每条AI建议进行证据支撑度标识（充分/需人工确认/偏弱）。"),
    bulletP("  - 面试Battle Card：为HR准备的面试沟通战术卡，含必问问题、风险话题、亮点追问。"),
    bulletP("  - 信任审计日志（Trust Audit Log）：完整的候选人信任事件时间线。"),
    spacer(),
    h3("4.2.5 数据分析（Analytics）"),
    p("宏观招聘数据看板，支持数据驱动的招聘策略优化。"),
    spacer(),
    h3("4.2.6 系统设置（Settings）"),
    p("HR偏好与企业信息配置。"),
    new Paragraph({ children: [new PageBreak()] }),
    h2("4.3 信任治理体系"),
    p("信任治理（Trust Governance）是智遇产品区别于传统招聘系统的核心差异化模块。它是一个贯穿候选人全生命周期的AI辅助信任管理框架，涵盖以下关键机制："),
    spacer(),
    h3("4.3.1 岗位真相标签（Job Truth Label）"),
    p("每个岗位在发布前，AI自动分析JD并生成7维度真相标签："),
    bulletP("工作节奏（Pace）：从「松弛」到「高压冲刺」5级量化，标注强度阈值（0-100）。"),
    bulletP("协作密度（Collaboration Density）：独立工作 vs 高度协作的偏向程度。"),
    bulletP("代码/工作规范度（Code/Work Hygiene）：对规范、流程、文档的重视程度。"),
    bulletP("模糊容忍度（Ambiguity Tolerance）：需求确定性 vs 探索试错的环境倾向。"),
    bulletP("自主空间（Autonomy）：独立决策 vs 上级审批的权限范围。"),
    bulletP("团队氛围（Atmosphere）：AI综合分析的团队文化简述。"),
    bulletP("成长路径（Growth Path）：晋升通道、学习资源、技能成长空间。"),
    p("每个维度附有置信度标识（高/中/低）和来自JD的证据引用。"),
    spacer(),
    h3("4.3.2 岗位真相合约（Job Truth Contract）"),
    p("在候选人完成实境体验后展示的双向信息确认文件："),
    bulletP("6-8条核心真相条款，以第一人称企业承诺的形式呈现。"),
    bulletP("每条附带置信度评估和证据来源。"),
    bulletP("候选人需逐一确认理解，并可标记未解决的顾虑。"),
    bulletP("合约确认状态纳入候选人信任评估体系。"),
    spacer(),
    h3("4.3.3 AI风险复核（AI Risk Review）"),
    p("对AI生成的所有建议和分析进行风险标识："),
    bulletP("证据充分：AI结论有充足的对话/行为证据支持，可直接采纳。"),
    bulletP("需人工确认：AI结论有一定依据但需要HR人工核实。"),
    bulletP("证据偏弱：AI结论缺乏充分支撑，仅供HR参考。"),
    p("当前平台AI风险复核通过率为85%，确保AI辅助决策的安全边界。"),
    spacer(),
    h3("4.3.4 候选人信任指数（Candidate Trust Index）"),
    p("综合评估候选人与岗位之间匹配可信度的量化指标，由5个子维度加权计算："),
    bulletP("岗位真相查看率（Truth Label View Rate）"),
    bulletP("真相合约确认率（Truth Contract Acknowledgement Rate）"),
    bulletP("云试岗完成率（Trial Completion Rate）"),
    bulletP("信任修复任务处理率（Trust Repair Task Handled Rate）"),
    bulletP("AI风险复核通过率（AI Risk Review Pass Rate）"),
    spacer(),
    h3("4.3.5 候选人公平指数（Candidate Fairness Index）"),
    p("监控招聘过程公平性的指标（当前Demo值88%），确保每位候选人获得公正的评估和机会。"),
    spacer(),
    h3("4.3.6 信任修复任务（Trust Repair Tasks）"),
    p("当系统检测到候选人与岗位之间存在信任缺口时，自动生成修复任务："),
    bulletP("任务标题与触发条件。"),
    bulletP("优先级排序（高/中/低）。"),
    bulletP("建议行动方案。"),
    bulletP("HR处理后标记为已处理并记录审计日志。"),
    p("当前Demo系统中有12项待处理信任修复任务，28项已完成处理。"),
    spacer(),
    h3("4.3.7 双向确认机制（Mutual Confirmation）"),
    p("候选人在投递前需确认了解关键岗位信息，HR需承诺："),
    bulletP("候选人确认项：「我已了解岗位节奏」、「我已了解面试流程」、「我仍愿意继续面试」。"),
    bulletP("HR承诺项：「本轮面试会重点沟通候选人关心的问题」、「不会仅凭AI报告做最终决定」。"),
    spacer(),
    h3("4.3.8 沉默风险检测（Silence Risk Detection）"),
    p("基于候选人沟通信号的主动风险预警："),
    bulletP("风险等级判定（高/中/低）。"),
    bulletP("可能的沉默原因分析。"),
    bulletP("建议唤醒话术与行动方案。"),
    p("当前Demo系统已检测到5名高沉默风险候选人。"),
    spacer(),
    h3("4.3.9 候选人权利宪章（Candidate Rights）"),
    p("在平台中公开声明的候选人权利保障："),
    bulletP("AI辅助招聘决策的透明度说明。"),
    bulletP("候选人数据使用与隐私保护政策。"),
    bulletP("候选人拒绝权和知情权说明。"),
    bulletP("AI决策边界的明确声明。"),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function section5_Jobs() {
  return [
    h1("5. 岗位数据"),
    p("当前Demo系统预置7个真实感岗位，覆盖研发、销售、设计、产品4个部门，5个城市。"),
    spacer(),
    makeTable(
      ["岗位名称", "部门", "地点", "薪资范围", "经验要求", "核心卖点"],
      [
        ["前端架构师", "研发部", "北京·海淀", "35-55k", "5年以上", "千万级日活产品挑战"],
        ["华东区大客户销售经理", "销售部", "上海", "25-60k", "3年以上", "提成上不封顶"],
        ["资深体验设计师", "设计部", "北京·朝阳", "28-45k", "3-5年", "定义下一代交互范式"],
        ["前端开发工程师", "研发部", "北京·海淀", "20-35k", "1-3年", "完善的导师制度"],
        ["后端开发工程师(Go)", "研发部", "深圳·南山", "25-45k", "3-5年", "技术栈先进"],
        ["AI产品经理", "产品部", "北京·海淀", "30-50k", "3-5年", "前沿AI领域"],
        ["全栈开发工程师", "研发部", "杭州·余杭", "25-42k", "3-5年", "端到端全链路视野"],
      ],
      [22, 12, 12, 14, 12, 28]
    ),
    spacer(),
    h2("5.1 岗位情景参数"),
    p("每个岗位由AI自动分析生成5维情景参数（0-100分制），用于场景构建和匹配计算："),
    makeTable(
      ["岗位", "节奏强度", "协作密度", "规范度", "模糊容忍", "自主空间", "团队氛围关键词"],
      [
        ["前端架构师", "75", "60", "90", "20", "70", "极度严谨、技术驱动"],
        ["大客户销售", "95", "70", "20", "85", "90", "狼性铁军、结果导向"],
        ["体验设计师", "40", "90", "70", "70", "60", "开放包容、设计批评"],
        ["前端工程师", "45", "70", "75", "40", "50", "成长型技术团队"],
        ["后端工程师(Go)", "55", "60", "85", "30", "65", "技术驱动工程团队"],
        ["AI产品经理", "60", "85", "50", "80", "75", "跨学科协作创新"],
        ["全栈工程师", "55", "75", "80", "50", "70", "全栈工程文化"],
      ],
      [16, 12, 12, 12, 12, 12, 24]
    ),
    spacer(),
    h2("5.2 候选人数据概览"),
    p("Demo系统预置10位种子候选人，覆盖所有7个岗位，状态分布如下："),
    makeTable(
      ["候选人", "目标岗位", "来源渠道", "状态", "核心技能"],
      [
        ["陈思远", "前端架构师", "BOSS直聘", "已邀约", "React/TS/Vue3/微前端"],
        ["王晓芳", "前端架构师", "拉勾网", "已入库", "React/Angular/组件库"],
        ["李明远", "大客户销售", "猎头推荐", "已投递", "B2B销售/金融行业"],
        ["张雨婷", "大客户销售", "内推", "已邀约", "B2B销售/制造业"],
        ["王子涵", "体验设计师", "站酷", "已投递", "Figma/Design System"],
        ["刘浩然", "前端工程师", "BOSS直聘", "已入库", "React/Vue/TS"],
        ["赵凯文", "后端工程师", "脉脉", "已邀约", "Go/Rust/K8s/分布式"],
        ["林小雨", "后端工程师", "校园招聘", "已投递", "Go/Python/数据库"],
        ["黄思敏", "AI产品经理", "猎头推荐", "已邀约", "产品规划/AI应用"],
        ["杨帆", "全栈工程师", "GitHub", "已入库", "React/Node/PostgreSQL"],
      ],
      [13, 16, 14, 12, 45]
    ),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function section6_Metrics() {
  return [
    h1("6. 关键指标与数据"),
    p("以下数据为Demo系统运行时模拟数据，反映平台设计目标中的各项核心指标："),
    spacer(),
    h2("6.1 流量漏斗"),
    makeTable(
      ["指标", "数值", "转化率", "说明"],
      [
        ["页面访问", "1,894", "—", "候选人端页面总访问量"],
        ["对话启动", "876", "46.3%（基于访问）", "候选人开始AI对话的次数"],
        ["对话完成", "523", "59.7%（基于启动）", "完整走完对话流程的次数"],
        ["实境体验启动", "580", "—", "进入GravitySandbox体验的人数"],
        ["实境体验完成", "218", "37.6%（基于启动）", "完整完成实境体验的人数"],
        ["候选人投递", "218", "—", "完成体验后主动投递的候选人数"],
        ["高意向标记", "87", "39.9%（基于投递）", "HR标记为高意向的候选人数"],
        ["面试邀请", "34", "39.1%（基于高意向）", "实际发出的面试邀请数"],
        ["实际面试", "22", "64.7%（基于邀请）", "实际参加面试的人数"],
        ["最终入职", "5", "22.7%（基于面试）", "完成招聘闭环的入职人数"],
      ],
      [22, 18, 20, 40]
    ),
    spacer(),
    h2("6.2 信任治理指标"),
    makeTable(
      ["指标", "数值", "说明"],
      [
        ["候选人信任指数均值", "71分", "所有候选人的综合信任评分均值"],
        ["高信任候选人占比", "68%", "信任指数>=75分的候选人比例"],
        ["候选人公平指数", "88%", "招聘过程公平性监控得分"],
        ["AI风险复核通过率", "85%", "AI建议被验证为可靠的比率"],
        ["审计完整率", "78%", "所有招聘决策留有审计记录的比例"],
        ["真相标签查看率", "约55%", "候选人查看岗位真相标签的比例"],
        ["真相合约确认率", "约44%", "候选人确认真相合约的比例"],
        ["信任修复任务处理率", "约70%", "已处理/总信任修复任务"],
        ["双向确认率", "约28%", "完成双向确认的候选人比例"],
      ],
      [38, 18, 44]
    ),
    spacer(),
    h2("6.3 效率指标"),
    makeTable(
      ["指标", "数值", "说明"],
      [
        ["预估节省面试排期", "48小时", "AI预筛选替代的HR手动排期时间"],
        ["预估节省HR工时", "42小时", "AI自动分析替代的人工评估时间"],
        ["人才库新增", "41人", "因实境体验而发现的高潜力候选人"],
        ["邀请话术生成", "128条", "AI自动生成的个性化面试邀请"],
        ["面试Battle Card", "128张", "AI自动生成的面试战术卡"],
        ["证据支撑建议数", "34条", "AI建议中有充分证据支撑的数量"],
        ["需人工确认建议数", "22条", "AI建议中需要HR复核的数量"],
      ],
      [38, 18, 44]
    ),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function section7_TechStack() {
  return [
    h1("7. 技术栈"),
    p("智遇系统采用现代Web技术栈构建，以下是完整的技术选型："),
    spacer(),
    h2("7.1 前端技术栈"),
    makeTable(
      ["技术", "版本", "用途"],
      [
        ["React", "19.2", "UI框架，并发渲染支持"],
        ["TypeScript", "5.9", "类型安全开发语言"],
        ["Vite", "7.1", "构建工具与开发服务器"],
        ["React Router DOM", "7.9", "SPA客户端路由"],
        ["Zustand", "5.0", "轻量级状态管理"],
        ["Recharts", "3.8", "数据可视化图表库"],
        ["Framer Motion", "12.40", "声明式动画库"],
        ["Lucide React", "1.17", "图标库"],
        ["Zod", "4.4", "运行时Schema校验"],
      ],
      [28, 18, 54]
    ),
    spacer(),
    h2("7.2 后端技术栈"),
    makeTable(
      ["技术", "版本", "用途"],
      [
        ["Node.js", "—", "运行环境"],
        ["TypeScript", "5.9", "类型安全开发语言"],
        ["Express风格路由", "—", "HTTP请求分发"],
        ["DeepSeek API", "—", "AI对话与分析能力"],
        ["Node Fetch", "—", "AI API调用客户端"],
      ],
      [28, 18, 54]
    ),
    spacer(),
    h2("7.3 AI能力矩阵"),
    makeTable(
      ["AI功能", "模型", "输出Schema", "说明"],
      [
        ["岗位分析", "DeepSeek V3", "JobAnalysis", "解析JD生成结构化岗位画像"],
        ["HR综合报告", "DeepSeek V3", "HrReport", "生成多维度候选人评估报告"],
        ["实境场景生成", "DeepSeek V3", "Scenario", "生成沉浸式对话场景与选择"],
        ["对话响应", "DeepSeek V3", "ChatResponse", "AI数字人实时对话"],
        ["交互评估", "DeepSeek V3", "InteractResponse", "评估对话质量与生成跟进"],
        ["候选人画像萃取", "DeepSeek V3", "ExtractedProfile", "对话数据→能力画像+原文校验"],
        ["内省洞察", "DeepSeek V3", "Insight", "生成能力报告与面试建议"],
      ],
      [24, 20, 26, 30]
    ),
    spacer(),
    h2("7.4 设计系统"),
    bulletP("双字体体系：DM Sans/DM Serif Display（英文标题）+ Noto Sans SC/Noto Serif SC（中文正文）"),
    bulletP("编辑级色彩系统：以暖琥珀+鼠尾草绿+靛蓝紫为核心的三色品牌语言"),
    bulletP("自定义CSS变量体系：覆盖颜色、间距、圆角、阴影、字体等完整Design Token"),
    bulletP("响应式设计：支持桌面端至移动端的完整自适应布局"),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function section8_Roadmap() {
  return [
    h1("8. 产品路线与限制"),
    spacer(),
    h2("8.1 当前版本（Alpha v0.1）"),
    p("已完成功能："),
    bulletP("DeepSeek本地后端代理，实现真实AI路径。"),
    bulletP("岗位真值分析AI通路（Job Truth Analysis）。"),
    bulletP("HR Pro报告生成AI通路。"),
    bulletP("Mock降级通道（AI服务不可用时自动切换）。"),
    bulletP("候选人体验v3「匠心透明」完整视觉重设计。"),
    bulletP("候选人端6个页面全部实现（Home/JobDetail/Chat/Profile/StoryPreview/Success）。"),
    bulletP("HR端7个页面全部实现（Dashboard/Jobs/JobNew/AvatarConfig/Share/Candidates/CandidateDetail/Analytics/Settings）。"),
    bulletP("信任治理9大模块全部实现（真相标签/真相合约/信任指数/公平指数/风险复核/信任修复/双向确认/沉默风险/候选人权利）。"),
    bulletP("收件箱模拟功能（InboxSim），增强实境体验真实感。"),
    spacer(),
    h2("8.2 当前限制"),
    bulletP("无真实数据库（当前使用内存状态+预置Demo数据）。"),
    bulletP("无登录与权限模型（未实现用户认证）。"),
    bulletP("无ATS或企业通讯集成（未对接外部系统）。"),
    bulletP("无多租户SaaS层（单企业Demo模式）。"),
    bulletP("AI输出定位于面试沟通辅助，不做招聘决策（最终决策权在HR手中）。"),
    spacer(),
    h2("8.3 候选路线图"),
    bulletP("持久化数据库接入（PostgreSQL/Supabase）。"),
    bulletP("用户认证与多租户权限体系。"),
    bulletP("企业与候选人真实注册流程。"),
    bulletP("ATS/HR系统API集成（飞书、企业微信、主流ATS）。"),
    bulletP("AI数字人视频/语音交互（当前为文本对话）。"),
    bulletP("移动端PWA或原生App。"),
    bulletP("多语言支持（中/英）。"),
    bulletP("招聘效果归因分析与ROI计算。"),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function section9_Appendix() {
  return [
    h1("9. 附录：页面路由表"),
    p("以下是系统完整的路由映射，涵盖候选人端和HR端所有页面："),
    spacer(),
    h2("9.1 公开页面"),
    makeTable(
      ["路由", "页面", "功能说明"],
      [
        ["/", "Home", "编辑级Hero首页，岗位搜索与探索"],
      ],
      [28, 28, 44]
    ),
    spacer(),
    h2("9.2 候选人端（/candidate/*）"),
    makeTable(
      ["路由", "页面", "功能说明"],
      [
        ["/candidate/job/:jobId", "JobDetail", "岗位详情+GravitySandbox入口"],
        ["/candidate/chat/:jobId", "Chat", "AI数字人实境对话体验"],
        ["/candidate/profile/:jobId", "Profile", "对话式画像补充与AI萃取"],
        ["/candidate/story/:candidateId", "StoryPreview", "AI能力报告预览"],
        ["/candidate/success/:candidateId", "Success", "投递成功+AI评估展示"],
        ["/candidate/inbox/:jobId", "InboxSim", "收件箱模拟（异步消息体验）"],
      ],
      [30, 26, 44]
    ),
    spacer(),
    h2("9.3 HR端（/hr/*）"),
    makeTable(
      ["路由", "页面", "功能说明"],
      [
        ["/hr", "Dashboard", "沙盘观测站·信任健康度总览"],
        ["/hr/jobs", "Jobs", "岗位列表与管理"],
        ["/hr/jobs/new", "JobNew", "新建岗位·AI自动分析"],
        ["/hr/avatar/:jobId", "AvatarConfig", "AI数字人角色配置"],
        ["/hr/share/:jobId", "Share", "岗位分享链接与二维码"],
        ["/hr/candidates", "Candidates", "候选人列表·状态分栏"],
        ["/hr/candidates/:candidateId", "CandidateDetail", "候选人深度分析多面板视图"],
        ["/hr/analytics", "Analytics", "招聘数据分析看板"],
        ["/hr/settings", "Settings", "系统设置与偏好"],
      ],
      [30, 26, 44]
    ),
    spacer(),
    h2("9.4 核心组件清单"),
    p("系统包含40+专用业务组件，以下为关键组件分类："),
    spacer(),
    h3("候选人体验组件"),
    bulletP("GravitySandbox — 重力沙盒（岗位探索核心组件）"),
    bulletP("SceneProgress — 场景进度追踪器"),
    bulletP("TrustSignal — 信任信号指示器"),
    bulletP("DigitalHumanCard — AI数字人身份卡片"),
    bulletP("ChoiceCard/ChoiceBuilder — 分岔选择构建器"),
    bulletP("QuestionChip — 追问问题芯片"),
    bulletP("SceneBriefing — 场景背景简报"),
    bulletP("DayInLifePreview — 一日工作生活预览"),
    bulletP("HowItWorks — 操作流程说明"),
    bulletP("SkillsQuiz — 快速匹配测验"),
    spacer(),
    h3("HR分析组件"),
    bulletP("RealityReportPanel — 实境报告面板"),
    bulletP("StoryCardPanel — HR故事卡面板"),
    bulletP("TrustGapDiagnosisPanel — 信任缺口诊断面板"),
    bulletP("CandidateTrustIndexPanel — 候选人信任指数面板"),
    bulletP("JobTruthLabelPanel — 岗位真相标签面板"),
    bulletP("JobTruthContractPanel — 岗位真相合约面板"),
    bulletP("SilenceRiskPanel — 沉默风险检测面板"),
    bulletP("CommitmentConsistencyPanel — 承诺一致性检查面板"),
    bulletP("AIAdviceReliancePanel — AI建议依赖标识面板"),
    bulletP("AIRiskReviewPanel — AI风险复核面板"),
    bulletP("InterviewBattleCardPanel — 面试Battle Card面板"),
    bulletP("TrustAuditLogPanel — 信任审计日志面板"),
    bulletP("TrustRepairTaskPanel — 信任修复任务面板"),
    bulletP("TrustNegotiationCardPanel — 信任协商卡片面板"),
    bulletP("ConcernRadarPanel — 候选人关注雷达面板"),
    bulletP("CandidateFairnessIndexPanel — 候选人公平指数面板"),
    bulletP("MutualConfirmationPanel — 双向确认面板"),
    bulletP("NoShowPreventionCardPanel — 防爽约卡片面板"),
    bulletP("TrialReplayPanel — 试岗回放面板"),
    bulletP("CandidateRightsPanel — 候选人权利宪章面板"),
    spacer(),
    h3("通用组件"),
    bulletP("StatCard — 统计卡片"),
    bulletP("Badge — 状态徽章"),
    bulletP("EmptyState — 空状态占位"),
    bulletP("ComplianceNotice — 合规通知"),
    bulletP("Panel — 通用面板容器"),
    new Paragraph({ children: [new PageBreak()] }),
    h2("9.5 术语表"),
    makeTable(
      ["中文术语", "英文/代码标识", "说明"],
      [
        ["智遇", "ZhiYu", "产品名称"],
        ["实境体验", "GravitySandbox", "沉浸式岗位体验的代号（原沙盘推演）"],
        ["岗位真相标签", "JobTruthLabel", "7维度岗位真实性评估"],
        ["岗位真相合约", "JobTruthContract", "双向信息确认文件"],
        ["云试岗", "Trial", "在线岗位实境体验流程"],
        ["沙盘观测站", "Dashboard", "HR核心控制台"],
        ["沉默风险", "SilenceRisk", "候选人可能流失的预警机制"],
        ["信任修复任务", "TrustRepairTask", "AI生成的信任缺口修复建议"],
        ["候选人信任指数", "CandidateTrustIndex", "综合信任度量化评分"],
        ["候选人公平指数", "CandidateFairnessIndex", "招聘公平性监控指标"],
        ["双向确认", "MutualConfirmation", "候选人与HR的相互确认机制"],
        ["AI风险复核", "AIRiskReview", "AI建议的可信度验证"],
        ["审计日志", "TrustAuditLog", "所有信任事件的完整记录"],
        ["分岔场景", "BranchScenario", "体验中的关键决策点"],
        ["反向提问", "ReverseQuestion", "候选人向岗位的主动提问"],
        ["收件箱模拟", "InboxSim", "企业内部异步消息的仿真"],
        ["画像萃取", "ProfileExtraction", "AI从对话中提取候选人特征"],
        ["面试Battle Card", "InterviewBattleCard", "HR面试战术参考卡"],
      ],
      [28, 30, 42]
    ),
  ];
}

// ├───────────────────────────────────────────────────────────────
// MAIN DOCUMENT ASSEMBLY
// └───────────────────────────────────────────────────────────────

async function main() {
  const doc = new Document({
    styles,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1.0),
              bottom: convertInchesToTwip(1.0),
              left: convertInchesToTwip(1.2),
              right: convertInchesToTwip(1.2),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 0, line: 200 },
                border: {
                  bottom: { color: BRAND.border, size: 1, space: 4, style: BorderStyle.SINGLE },
                },
                children: [
                  new TextRun({ text: "智遇·产品说明文档", font: FONT_SANS, size: 18, color: BRAND.muted }),
                  new TextRun({ text: "  |  Alpha v0.1", font: FONT_MONO, size: 16, color: BRAND.muted }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: {
                  top: { color: BRAND.border, size: 1, space: 4, style: BorderStyle.SINGLE },
                },
                children: [
                  new TextRun({ text: "第 ", font: FONT_SANS, size: 18, color: BRAND.muted }),
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT_MONO, size: 18, color: BRAND.muted }),
                  new TextRun({ text: " 页 / 共 ", font: FONT_SANS, size: 18, color: BRAND.muted }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT_MONO, size: 18, color: BRAND.muted }),
                  new TextRun({ text: " 页", font: FONT_SANS, size: 18, color: BRAND.muted }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...coverPage(),
          ...tocSection(),
          ...section1_Overview(),
          ...section2_ValueProposition(),
          ...section3_Architecture(),
          ...section4_Features(),
          ...section5_Jobs(),
          ...section6_Metrics(),
          ...section7_TechStack(),
          ...section8_Roadmap(),
          ...section9_Appendix(),
        ],
      },
    ],
  });

  const outDir = path.resolve("d:/AI招聘/docs");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, "智遇-产品说明文档.docx");

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);

  console.log(`[智遇] 产品说明文档已生成: ${outPath}`);
  console.log(`[智遇] 文件大小: ${(buffer.byteLength / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error("生成失败:", err);
  process.exit(1);
});
