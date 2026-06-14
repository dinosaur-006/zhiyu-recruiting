export function buildWorkdayInteractPrompt(params: {
  message: Record<string, unknown>;
  actionType: string;
  candidateReply?: string;
  delegateTarget?: string;
  delegateRole?: string;
  deferReason?: string;
  deferCount?: number;
  actionHistory?: Array<Record<string, unknown>>;
  jobTitle?: string;
  department?: string;
  managerPersona?: Record<string, unknown>;
  teamContext?: string;
  scenarioTitle?: string;
}): Array<{ role: string; content: string }> {
  const msg = params.message;
  const sender = (msg.sender as Record<string, unknown>) ?? {};
  const senderName = (sender.name as string) ?? '未知';
  const senderRole = (sender.role as string) ?? 'teammate';
  const senderDept = (sender.department as string) ?? '';
  const subject = (msg.subject as string) ?? '';
  const content = (msg.content as string) ?? '';
  const urgency = (msg.urgency as string) ?? 'medium';
  const competencyTags = JSON.stringify((msg.competencyTags as string[]) ?? []);

  const jobTitle = params.jobTitle ?? '团队成员';
  const department = params.department ?? '研发部';
  const managerDesc = params.managerPersona?.description ?? '';
  const teamContext = params.teamContext ?? '';
  const scenarioTitle = params.scenarioTitle ?? '';
  const actionType = params.actionType;

  const actionSummary = (params.actionHistory ?? []).map((a, i) =>
    `${i + 1}. 消息ID:${a.messageId}, 操作:${a.type}, ${a.type === 'reply' ? '回复内容:' + String(a.content ?? '').slice(0, 100) : a.type === 'delegate' ? '转交:' + (a.delegateTarget ?? '') : a.type === 'defer' ? '延迟' : '忽略'}`
  ).join('\n');

  // ── Role-specific tone guidance ──
  const toneGuide = roleToneGuide(senderRole as string, senderName, senderDept);

  // ── Build system prompt ──
  const systemPrompt = [
    '你是"职遇InboxSim"的AI交互引擎。你的任务是让工作消息模拟感觉像真实的职场沟通，不是预写的模板。',
    '',
    '═══ 核心原则 ═══',
    '1. 所有你生成的跟进消息必须感觉像真实的人在工作场景中写的——具体、语境化、有信息量。',
    '2. 禁止生成泛泛的"收到"、"好的"、"谢谢"——每条消息都要推动对话向前。',
    '3. 保持发件人角色一致的语调和风格（见角色语音指南）。',
    '4. 所有文本用中文输出。不要出现英文除非是技术术语。',
    '5. 禁止在评估或跟进消息中输出：录用建议、评分排名、性格判断、淘汰、不合格。你生成的评估仅供HR面试前参考，不构成招聘建议。你的跟进消息是模拟场景的一部分，不代表真实的企业立场。',
    '',
    '═══ 当前模拟上下文 ═══',
    `候选人在扮演: ${jobTitle} (${department})`,
    scenarioTitle ? `场景: ${scenarioTitle}` : '',
    teamContext ? `团队环境: ${teamContext}` : '',
    managerDesc ? `经理风格: ${managerDesc}` : '',
    '',
    '═══ 原始消息 ═══',
    `发件人: ${senderName}${senderDept ? ' · ' + senderDept : ''}`,
    `发件人角色: ${roleLabel(senderRole as string)}`,
    `主题: ${subject}`,
    `紧急度: ${urgency}`,
    `能力标签: ${competencyTags}`,
    `消息内容:`,
    content.slice(0, 1500),
    '',
    '═══ 候选人操作 ═══',
    `操作类型: ${actionLabel(actionType)}`,
    params.candidateReply ? `候选人回复内容: ${params.candidateReply}` : '',
    params.delegateTarget ? `转交目标: ${params.delegateTarget}` : '',
    params.deferReason ? `延迟原因: ${params.deferReason}` : '',
    params.deferCount != null ? `这是第 ${params.deferCount} 次对该消息延迟处理` : '',
    '',
    actionSummary ? `已执行操作:\n${actionSummary}` : '',
    '',
    '═══ 角色语音指南 ═══',
    toneGuide,
    '',
    '═══ 任务 ═══',
  ].filter(Boolean).join('\n');

  const taskBlock = buildTaskBlock(actionType, senderName, senderRole, urgency, params);

  const userPrompt = [
    systemPrompt,
    '',
    taskBlock,
    '',
    '═══ 输出格式约束 ═══',
    '你必须返回严格符合以下JSON Schema的JSON对象。不要输出markdown代码块标记。',
    '',
    buildOutputSchema(actionType),
  ].join('\n');

  return [
    { role: 'system', content: userPrompt },
    { role: 'user', content: `请为候选人的${actionLabel(actionType)}操作生成交互结果。` },
  ];
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    direct_manager: '直属上级',
    teammate: '同级同事',
    client: '客户',
    cross_team: '跨部门同事',
    system_bot: '系统通知',
    junior: '下属/新人',
    executive: '高管/VP',
  };
  return map[role] ?? role;
}

function actionLabel(type: string): string {
  const map: Record<string, string> = {
    reply: '回复消息',
    defer: '标记稍后处理',
    delegate: '转交他人',
    ignore: '忽略消息',
  };
  return map[type] ?? type;
}

function roleToneGuide(role: string, name: string, dept: string): string {
  const base = `发件人是${name}${dept ? '（' + dept + '）' : ''}，角色是${roleLabel(role)}。`;
  switch (role) {
    case 'direct_manager':
      return `${base}
- 语气: 直接、简洁、重视结果。不喜欢模棱两可的回答。
- 如果回复得好: 简短确认 + 推进下一步。例如"好，按这个方案。有问题随时找我。"
- 如果回复不够: 更直接地追问，可能表达不满。例如"我需要的是具体的时间，不是方向。"
- 如果被忽略: 会升级催促，语气逐渐严厉。可能抄送上级。`;
    case 'executive':
      return `${base}
- 语气: 权威、战略层面、关心业务影响。
- 如果回复得好: 简短认可 + 继续追问更大图景的问题。
- 如果回复不够或被忽略: 会直接表达关切并给出截止时间。可能抄送整个管理层。`;
    case 'client':
      return `${base}
- 语气: 专业但有压力感。代表外部利益。
- 如果回复得好: 表达感谢但继续追问具体时间节点和承诺。
- 如果回复不够或被忽略: 会升级投诉语言，提及合同关系和业务影响。`;
    case 'teammate':
      return `${base}
- 语气: 友好、协作、互相支持。
- 如果回复得好: 表示感谢 + 可能会分享额外信息或上下文。
- 如果回复不够: 会礼貌地追问细节。
- 如果被忽略: 会友善提醒，不会过度施压。`;
    case 'junior':
      return `${base}
- 语气: 尊敬、虚心、寻求帮助。
- 如果回复得好: 真诚感谢并跟进学习。
- 如果回复不够: 会困惑，可能再次求助。
- 如果被转交: 会向被转交的人确认，并汇报进展。`;
    case 'cross_team':
      return `${base}
- 语气: 专业、业务导向、强调协同。
- 如果回复得好: 确认 + 协调后续步骤。
- 如果回复不够或被忽略: 会表达业务紧迫性，可能升级到双方的上级。`;
    case 'system_bot':
      return `${base}
- 语气: 中性、事实性。不产生跟进消息。`;
    default:
      return `${base} - 语气: 专业、中立。`;
  }
}

function buildTaskBlock(
  actionType: string,
  senderName: string,
  senderRole: string,
  urgency: string,
  params: Record<string, unknown>,
): string {
  switch (actionType) {
    case 'reply':
      return buildReplyTask(senderName, urgency, params);
    case 'defer':
      return buildDeferTask(senderName, senderRole, urgency, params);
    case 'delegate':
      return buildDelegateTask(params);
    case 'ignore':
      return buildIgnoreTask(senderName, senderRole, urgency);
    default:
      return '未知操作类型，返回空结果。';
  }
}

function buildReplyTask(senderName: string, urgency: string, params: Record<string, unknown>): string {
  const reply = (params.candidateReply as string) ?? '';
  return [
    '**Part A: 回复质量评估**',
    `评估候选人的回复（满分100每个维度）:`,
    `回复内容: "${reply}"`,
    '',
    '维度定义:',
    '- professionalism (专业性): 职场语气、格式、术语是否恰当？是否适合该发件人角色？',
    '- empathy (同理心): 是否理解发件人的立场和需求？是否acknowledge了发件人的关切？',
    '- clarity (清晰度): 是否明确表述了行动、时间线、预期？有没有模糊或回避？',
    '- actionability (可操作性): 是否包含具体的下一步？发件人看了知道接下来做什么吗？',
    '- conciseness (简洁性): 是否用恰当的文字传达了信息？有没有冗余或过于简短？',
    '- overallScore: 加权综合评分（professionalism 20%, empathy 20%, clarity 25%, actionability 25%, conciseness 10%）',
    '- strengths: 2-3条具体的回复亮点（引用回复中的具体内容）',
    '- improvements: 1-2条建设性的改进建议',
    '',
    `**Part B: 上下文跟进消息**`,
    `以${senderName}的身份，生成一条跟进消息。核心规则:`,
    '1. 必须直接回应对候选人说的具体内容——引用或呼应他们提到的具体点',
    '2. 推动对话向前——要么确认下一步，要么追问细节，要么分享新的相关信息',
    '3. 消息长度: 2-4句话（对于critical/high可能是1-2句，对于low可能稍长）',
    `4. 紧急度: 基于原始消息(${urgency})和回复内容调整。如果回复很充分，紧急度降低；如果回复不够，保持或升高`,
    '',
    '具体示例:',
    '候选人回复: "我在排查数据库迁移脚本，大概率是那个导致性能退化。预计15分钟给出初步结论。"',
    'AI生成跟进（好）: "好的。迁移脚本的事你比我熟。需要我把凌晨执行的脚本日志发给你吗？另外客服那边我已经跟他们说排查在进行中，你先专心定位问题。"',
    'AI生成跟进（坏）: "收到，谢谢。"（太泛，不具体）',
    'AI生成跟进（坏）: "非常好！你展现了极强的技术能力！"（不要恭维，像真实同事那样回应）',
  ].join('\n');
}

function buildDeferTask(senderName: string, senderRole: string, urgency: string, params: Record<string, unknown>): string {
  const deferCount = (params.deferCount as number) ?? 1;
  const deferReason = (params.deferReason as string) ?? '';
  return [
    `候选人将这条消息标记为"稍后处理"。原因: "${deferReason}"。这是第 ${deferCount} 次延迟。`,
    '',
    '请判断:',
    '1. deferResurfaceSeconds: 消息应该在多少秒后重新出现？',
    `   - low urgency + 首次: 300-600秒`,
    `   - medium urgency + 首次: 180-360秒`,
    `   - high urgency + 首次: 90-180秒`,
    `   - critical urgency + 首次: 45-90秒`,
    `   - 任何 urgency + 第2次以上: 立即（0秒）+ 催促消息`,
    '',
    '2. 是否需要生成催促消息？',
    `   - 如果发件人是上级/客户/高管且 urgency >= high，生成催促`,
    `   - 如果是第2次延迟，必须生成催促`,
    `   - 催促消息的语气应符合角色`,
    '',
    '3. escalationUrgency: 重新出现时消息的紧急度？',
    `   - 首次延迟: 保持原紧急度`,
    `   - 第2次延迟: 升高一级（low→medium, medium→high, high→critical）`,
    '',
    '4. stakeholderNotified: 是否应该抄送相关人员？',
    `   - critical + 上级/高管 的延迟应该 notify`,
    '',
    '如果需要生成催促消息:',
    `以${senderName}的身份生成，语气符合${roleLabel(senderRole)}角色。表达适当的紧迫感。`,
  ].join('\n');
}

function buildDelegateTask(params: Record<string, unknown>): string {
  const target = (params.delegateTarget as string) ?? '同事';
  const delegateRole = (params.delegateRole as string) ?? '同级同事';
  return [
    `候选人将这条消息转交给了${target}（${delegateRole}）。`,
    '',
    '你需要以被转交人（' + target + '）的身份生成回复消息:',
    `1. 该同事的角色是：${delegateRole}`,
    '2. 确认收到转交的请求和内容',
    '3. 基于消息内容给出具体的初步判断或行动计划',
    '4. 如果消息内容复杂或有不清楚的地方，可以提出1-2个追问',
    `5. 语气应符合${target}的角色身份——${delegateRole.includes('上级') ? '有决策能力，可以拍板' : delegateRole.includes('新人') ? '虚心但积极，需要确认细节' : '愿意帮忙但也是专业人士'}`,
    '',
    `示例: 如果原消息是关于新人求助环境搭建，被转交给同级同事"林悦":`,
    `"收到转交。这个报错我之前遇到过，是payment-core的版本锁定问题。我帮小赵看一下，应该10分钟能解决。有问题再找你。"`,
  ].join('\n');
}

function buildIgnoreTask(senderName: string, senderRole: string, urgency: string): string {
  return [
    '候选人选择了忽略这条消息。',
    '',
    '请判断:',
    '1. 如果 urgency === "low": 无后果，followUpMessage 设为 null',
    '2. 如果 urgency === "medium": ',
    '   - 在 240-600 秒后生成一条温和的提醒消息',
    '   - 以发件人身份，语气轻松但不失礼貌',
    '3. 如果 urgency === "high": ',
    '   - 在 60-180 秒后生成催促消息',
    '   - 发件人表达关切，可能提及"还没收到回复"',
    '4. 如果 urgency === "critical": ',
    '   - 在 30-90 秒后生成催促消息',
    `   - 如果发件人是${roleLabel(senderRole)}，语气严厉，设定截止时间`,
    '   - 考虑 stakeholderNotified: true（抄送相关人员）',
    '   - escalationUrgency 保持 critical',
    '',
    '催促消息要点:',
    `- 以${senderName}的身份写`,
    '- 不要情绪化或攻击性——保持专业',
    '- 明确表达"这件事很重要，我需要你的回复"',
    '- 可以提供新的信息或上下文来增加紧迫感',
  ].join('\n');
}

function buildOutputSchema(actionType: string): string {
  const evalSchema = actionType === 'reply'
    ? `"evaluation": {
    "professionalism": <0-100>,
    "empathy": <0-100>,
    "clarity": <0-100>,
    "actionability": <0-100>,
    "conciseness": <0-100>,
    "overallScore": <0-100>,
    "strengths": ["<具体的亮点，引用回复原文>"],
    "improvements": ["<建设性的改进方向>"]
  },`
    : '';

  const hasConsequences = actionType === 'defer' || actionType === 'ignore';

  return [
    '{',
    evalSchema,
    '  "followUpMessage": <如果不需要跟进则为null，否则为: {',
    '    "id": "<唯一ID，格式: 原消息ID-fup-ai-随机6位字符>",',
    '    "type": "follow_up" | "escalation" | "info_share",',
    '    "sender": <与原始发件人相同>',
    '      (如果是delegate，sender应该是被转交人，格式: { "name": "被转交人名", "role": "teammate", "avatarInitials": "首字", "department": "部门" })',
    '      (如果是ignore且stakeholder升级，sender可能是更高层级的人)',
    '    ,',
    '    "subject": "Re: <原始主题>",',
    '    "content": "<AI生成的上下文跟进消息文本>",',
    '    "urgency": "low" | "medium" | "high" | "critical",',
    '    "scheduledArrivalSeconds": <从当前时间算起的秒数，0表示立即到达>,',
    '    "expectedResponseType": "reply",',
    '    "competencyTags": ["<能力标签>"],',
    '    "handled": false',
    '  }>,',
    hasConsequences ? `  "consequences": {
    "deferResurfaceSeconds": <秒数, 仅defer>,
    "escalationUrgency": "low" | "medium" | "high" | "critical",
    "stakeholderNotified": <boolean>,
    "escalationMessage": "<升级说明文本, 可为空字符串>"
  }` : '',
    '}',
  ].join('\n');
}
