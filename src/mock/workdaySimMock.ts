import type { SimulationScenario, SimulationMessage, SimulationSender, UrgencyTier, SimulationActionType, Job } from '../types';

function s(name: string, role: SimulationSender['role'], initials: string, dept?: string): SimulationSender {
  return { name, role, avatarInitials: initials, department: dept };
}
function msg(
  id: string, type: SimulationMessage['type'], sender: SimulationSender,
  subject: string, content: string, urgency: UrgencyTier,
  seconds: number, expected: SimulationActionType, tags: string[],
  attachments?: SimulationMessage['attachments'],
): SimulationMessage {
  return { id, type, sender, subject, content, urgency, scheduledArrivalSeconds: seconds, expectedResponseType: expected, competencyTags: tags, handled: false, attachments };
}

// ─── Personas ───
const Z = s('周哲', 'direct_manager', '周', '研发部');
const L = s('林悦', 'teammate', '林', '研发部');
const C = s('陈思远', 'cross_team', '陈', '运营部');
const K = s('王总(客户)', 'client', '王');
const B = s('系统通知', 'system_bot', '系');
const J = s('小赵·新人', 'junior', '赵', '研发部');
const E = s('李建国', 'executive', '李');

// ─── Scenario Builder ───
export function generateWorkdaySimScenario(job: Job): SimulationScenario {
  const isTech = job.department.includes('研发') || job.title.includes('前端') || job.title.includes('后端') || job.title.includes('架构') || job.title.includes('全栈');
  const isSales = job.department.includes('销售') || job.title.includes('销售');
  const msgs = isSales ? buildSalesMessages(job) : buildTechMessages(job);

  return {
    id: `scenario-${job.id}`, jobId: job.id,
    title: isTech ? 'Sprint 冲刺日的突发风暴' : '季度末的客户攻坚战',
    description: isTech
      ? `你将扮演${job.title}角色。这是一个普通周二上午，团队正在进行Sprint冲刺。然而，线上故障、客户投诉、新人求助和上级催促将在接下来的12分钟内密集到达。你的每一个选择——回复、延迟、转交还是忽略——都将被追踪和分析。这不是测试，而是一次让你展示真实工作能力的实境体验。`
      : `你将扮演${job.title}角色。季度最后两周，Pipeline压力、客户投诉、新人求助和VP关注同时涌来。在接下来的12分钟里，你需要判断优先级、协调资源、做出决策。你的处理方式将直接展示你的商业判断和沟通风格。`,
    estimatedDurationMinutes: 6, maxDurationMs: 420000,
    targetCompetencies: ['prioritization', 'communication', 'stakeholder_management', 'emotional_regulation', 'task_switching'],
    managerPersona: {
      name: '周哲', title: isTech ? '技术总监' : '销售总监',
      style: 'demanding',
      description: isTech
        ? '结果导向，重视逻辑和数据。不欣赏模棱两可的回答。对自己和团队要求严格，但会为团队争取资源。回复消息时喜欢直接、简洁的风格。'
        : '数字导向，雷厉风行。关注Pipeline数据和季度完成率。对团队成员有清晰的期望，赏罚分明。喜欢简洁有力的沟通，讨厌借口和拖延。',
    },
    teamContext: isTech
      ? '团队共12人，你在负责用户支付模块的迭代开发。当前Sprint还剩3天，你的Story还剩40%未完成。林悦是你的同级，正在做搜索优化。小赵是入职3个月的新人，需要你的指导。'
      : '华东团队共8人，当前季度完成率65%。你在跟进3个重点客户（A公司已签约，B公司谈判中，C公司初步接触）。小赵是你的新人搭档。',
    messageScript: msgs,
    ambientEvents: [
      { type: 'calendar_ping', scheduledArrivalSeconds: 120, content: '⏰ 15分钟后：Sprint Standup' },
      { type: 'deadline_reminder', scheduledArrivalSeconds: 300, content: '⚠️ Sprint 还有3天结束' },
      { type: 'calendar_ping', scheduledArrivalSeconds: 480, content: '⏰ 30分钟后：架构评审会议' },
    ],
    roleCalibration: {
      jobFamily: isTech ? 'engineering' : 'sales',
      seniorityLevel: job.experience?.includes('5') || job.experience?.includes('8') ? 'senior' : 'mid',
    },
  };
}

// ═══════════════════════════════════════════
// TECH SCENARIO — 11 deeply contextual messages
// ═══════════════════════════════════════════

function buildTechMessages(_job: Job): SimulationMessage[] {
  return [
    // Act 1: 日常 (0-2min)
    msg('m1', 'task_request', Z,
      'Sprint 进度同步 — 下班前完成',
      `@你 麻烦今天下班前把你这周的需求进度更新到 Wiki 上。重点写清楚：

1. 支付模块重构的当前状态（完成了哪些接口，还有哪些在做）
2. 有没有阻塞项（依赖其他团队、等API文档、等环境等）
3. 预计能否在 Sprint 结束前完成

另外，周四下午3点的架构评审会议，你准备一下支付模块的技术方案。这次评审 CTO 也会参加，方案要讲清楚：为什么选这个方案、替代方案是什么、风险点在哪里。

不用太紧张，但要认真准备。有问题随时找我。`,
      'medium', 1, 'reply', ['communication', 'task_tracking', 'preparation'],
      [{ type: 'link', label: 'Sprint Wiki 模板', url: '#' }]),

    msg('m2', 'help_request', J,
      '新人求助：本地环境报错，卡了一上午',
      `学长好！不好意思打扰你。我在搭本地开发环境的时候一直报这个错：

\`\`\`
Error: Module 'payment-core' version mismatch.
Expected: ^2.3.1, Got: 1.8.4
\`\`\`

我试了重装 node_modules、切换 Node 版本、清缓存都不行。文档上也没有写这个问题的解决方案。

我知道你很忙，不着急回复。但如果方便的话能帮我看一眼吗？我被这个问题卡了一上午了，后面的需求开发完全没法开始。`,
      'medium', 15, 'reply', ['mentoring', 'communication']),

    msg('m3', 'escalation', C,
      '🚨 线上告警 — 支付模块响应超时，影响用户下单',
      `@你 @周哲 紧急！刚才运维监控告警，支付模块 P99 响应时间飙到了 8.5 秒（正常水平 < 500ms）。目前已知影响：

• 受影响用户数：目前约 2300+ 活跃用户正在下单流程中
• 受影响商家：3个KA客户反馈用户无法完成支付
• 开始时间：约 15 分钟前（10:15 左右）
• 客服团队已经收到 40+ 投诉工单，还在持续增长

运维同事初步排查认为可能是今天凌晨的数据库迁移脚本有问题，但需要研发确认。

能不能立刻帮看一下是什么问题？如果需要回滚，我们可以协调运维操作。请尽快给个初步判断，我好回复客户和客服团队。`,
      'high', 30, 'reply', ['incident_response', 'cross_team_communication', 'diagnosis'],
      [{ type: 'link', label: 'Grafana 监控面板', url: '#' }, { type: 'link', label: '客服投诉工单汇总', url: '#' }]),

    msg('m4', 'meeting_invite', C,
      '紧急同步会议 — 支付模块排查',
      `@你 @周哲 @林悦

各位，支付延迟问题还在持续。客服团队电话快被打爆了。客户成功VP已经在关注。

我们能不能 10 分钟后拉一个 15 分钟的快速同步会（线上）？我需要知道：
1. 当前排查进展
2. 预计修复时间（哪怕是粗略估计）
3. 临时止损方案（能不能先降级或切备用通道）

我把会议链接放在下面了。请务必参加，哪怕你只来5分钟也行。`,
      'high', 45, 'reply', ['escalation_handling', 'communication'],
      [{ type: 'link', label: '腾讯会议 #884-221-993', url: '#' }]),

    msg('m5', 'follow_up', Z,
      'Re: 线上告警 — CTO 在问进展',
      `林同学，支付排查进展怎么样？

CTO 刚在管理群里 @我了。客户那边的CTO也直接打电话给了李总。压力很大。

我现在需要你立刻给我一个状态更新（直接回复这条消息就行）：
• 问题定位到了吗？（是数据库迁移？还是代码变更？）
• 预计什么时候能恢复？（哪怕是最乐观估计）
• 需要什么支持？（需要更多人手？需要运维权限？）

不用写很长，三句话告诉我现在的情况。`,
      'critical', 60, 'reply', ['stakeholder_management', 'crisis_communication']),

    msg('m6', 'escalation', E,
      '客户投诉升级 — 要求30分钟内给答复',
      `各位：

刚和最大客户方（XX商城）CTO 通了电话。他们很生气——支付异常已经持续了40分钟，影响了他们今天上午的GMV。

对方CTO原话："如果30分钟内看不到明确的处理方案和时间表，我们会认真考虑暂停与贵司的合作关系。"

@周哲 我需要你亲自盯这件事。
@所有人 30分钟内给我一个书面的处理方案，包括：
1. 根本原因分析（哪怕是初步的）
2. 恢复时间表
3. 预防再次发生的措施
4. 客户沟通口径

这不是演习。这是今年最重要的客户关系之一。`,
      'critical', 80, 'reply', ['crisis_management', 'executive_communication']),

    msg('m7', 'task_request', Z,
      '临时紧急需求 — 客户Q3数据报告',
      `林同学，我知道你现在很忙，但这个也很紧急。

XX商城（就是刚才投诉的那个客户）的运营总监刚发消息过来，要求在下周一之前提供一份他们平台 Q3 的完整数据使用报告。内容包括：
• Q3 总交易额、订单数、退款率
• 各支付渠道的使用占比和成功率
• 与 Q2 的对比分析
• 异常交易的趋势分析

这个客户是我们年度框架客户，一年贡献 30% 的营收。虽然时间很紧，但必须优先处理。

你看看能不能在下周一前完成。如果需要数据提取的支持，让林悦帮你。`,
      'high', 110, 'reply', ['prioritization', 'boundary_setting', 'task_management'],
      [{ type: 'doc', label: 'Q3数据报告模板.xlsx', url: '#' }]),

    msg('m8', 'help_request', L,
      '能帮我看一下这段代码的逻辑吗？',
      `嘿，方便帮我看一段代码吗？我在做搜索优化的时候发现支付模块里有一段逻辑我不太确定：

\`\`\`typescript
// payment-service/src/refund.ts
async function processRefund(orderId: string) {
  const order = await getOrder(orderId);  // ← 这里没有处理 order 为 null 的情况
  if (order.status !== 'paid') throw new Error('Order not paid');
  // ... 退款逻辑
}
\`\`\`

我怀疑这里 order 如果查不到会直接抛异常而不是返回一个明确的错误码。这可能和今天的支付异常有关系吗？

你比我更熟悉支付模块，帮我确认一下这个逻辑是否正确。不着急，等你忙完手头的事再说。`,
      'medium', 140, 'reply', ['collaboration', 'code_review', 'technical_judgment']),

    msg('m9', 'info_share', C,
      '✅ 支付模块恢复 — 临时总结',
      `更新：支付模块已于 11:05 恢复正常。运维团队确认是通过回滚数据库迁移脚本解决的。

临时总结：
• 根因：凌晨3:00执行的数据库迁移（payment_v2.3_migration.sql）修改了索引结构，导致特定查询路径下的性能退化
• 恢复方式：回滚迁移 → 重启支付服务 → 验证恢复（全程8分钟）
• 当前状态：各项指标恢复正常，错误率归零

感谢大家的快速响应。客服团队正在给投诉客户逐一回访致歉。

正式的根因分析（RCA）报告请研发团队在周四前完成。`,
      'medium', 170, 'reply', ['closure', 'knowledge_sharing']),

    msg('m10', 'task_request', Z,
      '复盘分享 — 下周二团队周会',
      `林同学，这次事件处理得不错。你在高压下保持了清晰的判断和及时的沟通，李总也注意到了。

下周二团队周会上，你来做一下这次事件的复盘分享，大约15分钟。主要讲三点：
1. 事件处理的时间线和关键决策点
2. 做对了什么、哪些地方可以改进
3. 团队可以从中学到什么

这是一个很好的 visibility 机会。好好准备，让大家看到你在压力下的表现。`,
      'medium', 210, 'reply', ['reflection', 'leadership', 'communication']),

    msg('m11', 'announcement', B,
      '本周五 Team Lunch — 庆祝Sprint交付',
      `📢 全员通知：本周五中午 12:30，公司安排了团队午餐（地点：3楼食堂 VIP包间），庆祝本周Sprint的（几乎）按时交付和昨天的线上事件顺利解决。

这周大家都辛苦了。周哲说这顿饭他请客 😄

如果有特殊饮食需求（素食、过敏等），请在周四下班前回复这条消息。`,
      'low', 250, 'reply', ['team_spirit']),
  ];
}

// ═══════════════════════════════════════════
// SALES SCENARIO — 10 deeply contextual messages
// ═══════════════════════════════════════════

function buildSalesMessages(_job: Job): SimulationMessage[] {
  return [
    msg('m1', 'task_request', Z,
      '季度Pipeline更新 + 本周工作计划',
      `@你 两件事：

1. 把你负责的客户Pipeline更新到CRM系统。重点关注：
   - A公司（已签）：确保交付团队按计划推进，有任何风险提前预警
   - B公司（谈判中）：本周四之前给最终报价和合同条款
   - C公司（初步接触）：下周一安排首次方案演示
   - D公司（新线索）：市场部转过来的，你先做个初步接触和需求分析

2. 另外，市场部刚同步了竞品动态——X公司在华东区推出了买二送一的优惠政策，主要针对金融行业客户。你评估一下对我们Pipeline的影响，明天之前给我一个简要分析。

季度还剩两周，我们华东区完成率65%。这两周是关键中的关键。`,
      'medium', 20, 'reply', ['pipeline_management', 'competitive_analysis', 'planning'],
      [{ type: 'link', label: 'CRM Pipeline Dashboard', url: '#' }]),

    msg('m2', 'info_share', C,
      '竞品动态紧急同步 — X公司降价策略',
      `各位销售同事：

刚得到确认消息，竞品X公司本周正式在华东区金融行业推出"签约即享前3个月免费+后续8折"的激进策略。已知：
• 目标客户群：年营收5000万以上的金融科技公司
• 推广时间：本周开始，持续到季度末
• 覆盖城市：上海、杭州、南京、苏州

我们的B公司（XX金科）正好在他们的目标清单上。这家公司已经跟我们谈了两个月，合同条款基本谈好了。

@你 B公司是你的客户，请尽快评估：
1. 这个竞品政策对B公司决策有多大影响
2. 我们需要调整报价策略吗？如果需要，底线在哪里

时间窗口很紧，今天之内给我一个初步判断。`,
      'high', 50, 'reply', ['competitive_response', 'strategic_thinking', 'urgency'],
      [{ type: 'doc', label: '竞品X公司优惠政策详情.pdf', url: '#' }]),

    msg('m3', 'escalation', K,
      '投诉：项目交付严重延迟',
      `王经理，

上个月签订的合同明确写了交付时间是11月15日。今天已经是11月20日，项目还没有任何实质性交付。

我们内部每周都要向CEO汇报数字化转型进展，这个项目的延迟已经影响到了我们的KPI考核。老板上周在会上点名批评了这件事。

我需要你立刻给我一个明确的答复：
1. 具体什么时候能看到第一批交付成果
2. 延迟的原因是什么（我需要给老板一个交代）
3. 后续如何确保不再延迟

如果本周五之前我还看不到实质进展，我不得不向贵司正式提出投诉，并重新评估我们的合作关系。这不是威胁，是我需要保护我们公司的利益。

请尽快回复。`,
      'critical', 80, 'reply', ['client_management', 'crisis_communication', 'accountability'],
      [{ type: 'doc', label: '合同-XX金科-2025Q4.pdf', url: '#' }]),

    msg('m4', 'follow_up', Z,
      'Re: 客户投诉 — 马上处理',
      `王客户的投诉我看到了。他刚才抄送了李总。

立刻放下手头所有事情，先处理这件事。我给你3个明确的行动指令：

1. 马上给王客户打电话（不是发消息，是打电话），先道歉，然后告诉他今天下班前你会给一个详细的处理方案
2. 联系交付团队的张经理，确认实际交付进度和预估完成时间。如果交付团队确实延迟了，搞清楚原因
3. 准备一个补救方案：能不能分阶段交付？能不能先交付一部分核心功能？有没有补偿措施？

给我电话汇报最新进展。这件事处理不好，B公司30万的单子就飞了，C公司的初步接触也会受影响。`,
      'critical', 100, 'reply', ['escalation_handling', 'stakeholder_management', 'decisiveness']),

    msg('m5', 'escalation', E,
      'VP关注：季度Pipeline风险',
      `小王，

我刚看了CRM里的Pipeline数据。我们是华东区负责人，季度还剩两周，完成率65%。

坦率地说，这个数字让我很不安。如果本周不能把B公司和C公司推进到签约阶段，这个季度华东区将首次未完成指标。

我需要你明天早上9点前给我一份详细的行动计划，涵盖：
• 本周具体的客户推进计划（每家客户的目标、策略、时间节点）
• 需要什么资源支持（技术方案、产品Demo、高层站台等）
• 风险预判——如果B公司被竞品抢走，我们的Plan B是什么
• 你对季度最终数字的预测（保守/乐观）

这份计划不是给我看的，我会在周五的管理层会议上用它来汇报华东区的情况。所以请务必认真对待。`,
      'critical', 180, 'reply', ['executive_communication', 'strategic_planning', 'accountability']),

    msg('m6', 'help_request', J,
      '王哥，客户谈判卡壳了，能帮帮我吗',
      `王哥，实在不好意思又来打扰你。但这次我确实有点搞不定了。

我在跟的那个客户（XX保险科技），谈到价格环节完全卡住了。情况是：
• 他们要求：年费打7折 + 赠送3个月 + 免费POC
• 我们底线：年费最多打9折，POC可以免费但不赠送服务期
• 已经谈了3轮了，对方态度越来越硬
• 他们在比较我们和X公司（竞品）的方案

我感觉我快把这个客户谈丢了。但现在放弃又不甘心，毕竟前期花了很多时间。

能不能：
1. 帮我看一下这个客户的整体方案，看看我们的底线有没有调整空间
2. 或者如果你愿意，你亲自来接这个客户的谈判（我只是提议，不是甩锅）
3. 至少给我一些话术建议，怎么回复他们的价格要求

我看到你今天也在忙季度的事。如果太忙就先别管我，我再自己想办法。`,
      'high', 230, 'reply', ['mentoring', 'negotiation', 'team_support']),

    msg('m7', 'meeting_invite', C,
      '紧急协调会：B公司交付方案',
      `@你 @交付团队张经理

刚才跟交付团队确认了一下：
• B公司的项目确实因为技术方案变更延迟了10天
• BUT！好消息是核心模块已经完成了80%，可以分阶段交付
• 交付团队建议：本周五先交付Phase 1（数据面板+基础报表），12月10日交付Phase 2（高级分析+API集成）

如果我们能说服王客户接受分阶段交付，问题就解决了。

我们15分钟后拉一个10分钟的快速电话会，对齐口径：
1. 分阶段交付方案的具体内容
2. 给王客户的回复话术
3. 补偿措施（比如免费延长3个月服务期？）

你能参加吗？`,
      'high', 270, 'reply', ['cross_team_coordination', 'solution_design']),

    msg('m8', 'info_share', Z,
      '好消息：A公司正式签约 + 季度冲刺动员',
      `跟大家同步一个好消息。A公司（XX金融集团）今天早上正式签约了！年度合同金额180万，是华东区本季度最大的单子。

特别感谢小王的努力——从前期的方案定制到后期的多轮谈判，整个过程非常专业。A公司的CTO专门发消息说对我们的方案"印象深刻"。

现在季度还剩最后两周：
• ✅ A公司——已签（180万）
• 🔄 B公司——谈判中，分阶段交付方案今天发给客户
• 🔄 C公司——方案演示定在下周一
• 🆕 D公司——小王明天做初步接触

华东区能不能完成季度指标，就看这两周了。大家加油！周五一早我请全员喝咖啡。☕`,
      'low', 340, 'reply', ['team_morale', 'momentum']),

    msg('m9', 'task_request', Z,
      '季度复盘准备 — 下周一管理层会议',
      `小王，

季度快结束了。下周一的管理层会议上，你做15分钟的华东区季度复盘分享。重点讲：

1. A客户的打单过程和关键成功因素（这是我们本季度最好的案例）
2. B客户的挑战和分阶段交付的解决方案（这个经验值得分享给其他区域）
3. 竞品动态对我们的实际影响和你的应对策略
4. 下个季度的Pipeline规划

准备一个简洁的PPT（10页以内），周日前发给我审核。

这对你来说是一个很好的visibility机会。公司VP和CTO都会参加。`,
      'medium', 420, 'reply', ['reflection', 'leadership', 'strategic_narrative']),

    msg('m10', 'announcement', B,
      '🎉 季度庆功宴通知',
      `📢 全员通知：下周五晚上 6:30，公司在丽思卡尔顿酒店举办季度庆功晚宴！

无论华东区最终数字如何，大家的努力和付出都值得庆祝。晚宴安排：
• 18:30-19:00 签到 + 鸡尾酒
• 19:00-20:00 季度总结 + 颁奖（最佳团队、最佳个人、最佳案例）
• 20:00-22:00 晚宴 + 自由交流

请于周四前回复是否参加（方便行政统计人数）。正装出席。🍾`,
      'low', 520, 'reply', ['celebration']),
  ];
}

// ─── Quick Reply Templates ───
export function getDefaultQuickReplies() {
  return [
    { id: 'qr1', label: '收到，我来看', text: '收到。我先了解一下具体情况，稍后同步进展。', tone: 'assertive' as const },
    { id: 'qr2', label: '能补充一些背景吗', text: '明白。在做决定之前，我需要了解一些额外的背景信息，能帮忙补充一下吗？', tone: 'neutral' as const },
    { id: 'qr3', label: '建议拉上XX一起看', text: '这个可能需要多方协调。建议拉上相关同事一起对齐，我来发起。', tone: 'deferring' as const },
    { id: 'qr4', label: '下班前给方案', text: '收到。我今天下班前把方案整理出来同步给你。', tone: 'assertive' as const },
    { id: 'qr5', label: '我先评估一下影响范围', text: '了解。我先评估一下影响面和所需资源，有结论了第一时间同步。', tone: 'collaborative' as const },
    { id: 'qr6', label: '手上有个紧急事先处理', text: '收到。目前正在处理一个紧急问题，预估15分钟后开始看这个。如果更紧急请直接电话我。', tone: 'assertive' as const },
    { id: 'qr7', label: '这个我建议找XX处理', text: '这个问题我不太熟悉，建议找更擅长这块的同学来处理。我可以帮忙转达。', tone: 'deferring' as const },
    { id: 'qr8', label: '已经在处理了', text: '已经在看了。目前初步判断是XX原因，正在验证。有结果会立刻同步。', tone: 'collaborative' as const },
  ];
}

/** Context-aware quick replies based on message urgency and sender role */
export function getContextQuickReplies(message: SimulationMessage): QuickReplyTemplate[] {
  if (message.urgency === 'critical' && message.sender.role === 'executive') {
    return [
      { id: 'c1', label: '已启动应急响应', text: '收到。已经启动应急排查，初步判断会在10分钟内反馈。完整处理方案30分钟内提交，请放心。', tone: 'assertive' as const },
      { id: 'c2', label: '已拉通相关团队', text: '已经拉通运维和研发同学在处理。目前已定位到疑似根因，正在验证。我会每10分钟同步进展。', tone: 'collaborative' as const },
    ];
  }
  if (message.urgency === 'critical' || message.urgency === 'high') {
    return [
      { id: 'h1', label: '立即处理，暂停手头工作', text: '收到。我现在放下手头的事先处理这个。预计很快会有初步结论。', tone: 'assertive' as const },
      { id: 'h2', label: '已介入排查', text: '已经在处理了。目前的初步判断是XX方向，正在收集更多数据确认。有结论第一时间同步。', tone: 'collaborative' as const },
      { id: 'h3', label: '影响面较大，需要更多人手', text: '这个问题的波及范围比预期大。我建议让林悦也参与进来，她在这方面有经验。我来协调分工。', tone: 'deferring' as const },
    ];
  }
  return getDefaultQuickReplies();
}

// ─── Branching Follow-Ups ───
let fupCounter = 0;
function uniqueFupId(base: string) { fupCounter++; return `${base}-fup-${Date.now()}-${fupCounter}`; }

export function getFollowUpForAction(
  messageId: string, actionType: SimulationActionType, _content?: string,
): SimulationMessage | null {
  // Tech scenario follow-ups
  if (actionType === 'ignore' && messageId === 'm5') {
    return msg(uniqueFupId('m5'), 'follow_up', Z, 'Re: 线上告警 — 第二次催促',
      `林同学，我还没收到你的回复。CTO又在群里问了。请立刻给我一个状态更新。`, 'critical', 0, 'reply', ['urgency_response']);
  }
  if (actionType === 'delegate' && messageId === 'm2') {
    return msg(uniqueFupId('m2'), 'info_share', J, 'Re: 已转交',
      `谢谢学长帮我转交给林悦姐！她刚才回复我了，问题已经解决了。`, 'low', 0, 'reply', ['closure']);
  }
  if (messageId === 'm3' && actionType === 'reply') {
    return msg(uniqueFupId('m3'), 'info_share', C, 'Re: 收到你的排查回复',
      `收到，谢谢快速响应。我先把你的初步判断同步给客服团队和客户。`, 'medium', 0, 'reply', ['acknowledgment']);
  }
  if (actionType === 'ignore' && messageId === 'm6') {
    return msg(uniqueFupId('m6'), 'follow_up', E, 'Re: 未收到回复 — 再次催促',
      `我还没有收到你的处理方案。请在10分钟内提交。这是今年最重要的客户关系。`, 'critical', 0, 'reply', ['urgency_response']);
  }
  if (actionType === 'defer' && (messageId === 'm7' || messageId === 'm9')) {
    return msg(uniqueFupId('m7'), 'follow_up', Z, 'Re: 提醒',
      `提醒一下，之前提到的事情如果还没处理请尽快。有问题随时同步。`, 'medium', 0, 'reply', ['reminder']);
  }

  // Sales scenario follow-ups
  if (actionType === 'ignore' && messageId === 'm3') {
    return msg(uniqueFupId('s3'), 'follow_up', Z, 'Re: 客户投诉 — 第二次催促',
      `王客户的投诉我还没看到你的回复。他抄送了李总。立刻处理。`, 'critical', 0, 'reply', ['urgency_response']);
  }
  if (actionType === 'ignore' && messageId === 'm5') {
    return msg(uniqueFupId('s5'), 'follow_up', E, 'Re: 未收到行动计划',
      `我还没有收到你的季度冲刺计划。请明天早上9点前提交。`, 'critical', 0, 'reply', ['urgency_response']);
  }
  if (actionType === 'reply' && messageId === 'm3') {
    return msg(uniqueFupId('s3'), 'info_share', Z, 'Re: 收到处理方案',
      `收到。按你说的方案推进。有任何变化随时同步我。`, 'medium', 0, 'reply', ['acknowledgment']);
  }
  if (actionType === 'delegate' && messageId === 'm6') {
    return msg(uniqueFupId('s6'), 'info_share', J, 'Re: 已转交处理',
      `王哥，那个客户我接手了。刚才跟他们通了电话，初步把价格稳住了。后续我会持续跟进。`, 'low', 0, 'reply', ['closure']);
  }
  if (actionType === 'defer' && (messageId === 'm7' || messageId === 'm9')) {
    return msg(uniqueFupId('s7'), 'follow_up', Z, 'Re: 提醒',
      `提醒一下，之前提到的事情如果还没处理请尽快。`, 'medium', 0, 'reply', ['reminder']);
  }
  return null;
}
