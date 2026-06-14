export function buildExtractProfilePrompt(input: {
  chatHistory?: Array<{ role: string; content: string }>;
  branchChoices?: string[];
  reverseQuestions?: Array<{ type: string; question: string; answer: string }>;
}) {
  const dialogueCorpus = (input.chatHistory ?? [])
    .map((m) => `[${m.role}]: ${m.content}`)
    .join('\n');

  const systemPrompt = [
    '你是"职遇 Reality Pro"的候选人画像萃取器。你的角色是**客观转录者**，不是主观评判者。',

    '═══ 核心铁律 ═══',
    '1. QUOTE ABOVE ALL：每个 skill、trait、concern 的 quoteText 字段，必须是对话记录中**真实出现的逐字原句**。',
    '   验证方法：你输出的 quoteText 应该能在输入的对话中用 Ctrl+F 精确匹配到。',
    '   如果原文不够精炼，宁可截取更长的原句，也绝不改写。',
    '2. CONFIDENCE GATING：',
    '   - high：有2段以上独立对话佐证同一结论',
    '   - medium：有1段对话支持，但可能只是偶发行为',
    '   - low：缺乏原文支撑，仅凭选项标签或间接信号推断',
    '3. NO INFERENCE WITHOUT QUOTE：如果找不到原文依据，就不要输出该条。宁可少一条，也不造一条。',
    '4. 禁止输出任何评分、等级、评判性语言。traits 用名词短语描述行为模式，不用形容词描述人格。',
    '5. quoteText 必须从对话原文中截取，长度控制在20-200字。',

    '═══ 输出 JSON 结构 ═══',
    '{',
    '  "skills": [',
    '    {',
    '      "name": "string — 技能名称，如 前后端协作推进",',
    '      "confidence": "high | medium | low",',
    '      "quoteText": "string — 对话中的逐字原句",',
    '      "reasoning": "string — 为什么这段原文展示了该技能，限50字"',
    '    }',
    '  ],',
    '  "inferredTraits": [',
    '    {',
    '      "trait": "string — 机器可读键，如 scope_negotiation",',
    '      "label": "string — 人类可读标签，如 范围协商意识",',
    '      "confidence": "high | medium | low",',
    '      "quoteText": "string — 对话中的逐字原句",',
    '      "reasoning": "string — 行为依据，限50字"',
    '    }',
    '  ],',
    '  "concerns": [',
    '    {',
    '      "concern": "string — 候选人关注的话题",',
    '      "confidence": "high | medium | low",',
    '      "quoteText": "string — 对话中的逐字原句",',
    '      "reasoning": "string — 限50字"',
    '    }',
    '  ],',
    '  "selfReportedProfile": {',
    '    "rawSkills": ["string"],',
    '    "yearsOfExperience": "string | null",',
    '    "currentRole": "string | null"',
    '  },',
    '  "extractionMetadata": {',
    '    "totalDialogueTurns": "number",',
    '    "extractableTurns": "number",',
    '    "lowConfidenceNote": "string | null"',
    '  }',
    '}',
  ].join('\n');

  // ── Few-Shot: 正例 ──
  const positiveExampleInput = [
    '[数字人(主管)]: 产品临时加了一个复杂筛选需求，后端接口还没定，但上线时间很紧，你打算怎么推进？',
    '[候选人]: 我先和后端约个15分钟快速对齐，把最小需要的字段定下来。然后前端用Mock数据先把结构和交互跑通，联调时再替换。如果产品那边还有不确定的范围，我建议拆成两期——核心筛选这期上，高级筛选放下个迭代。',
  ].join('\n');

  const positiveExampleOutput = {
    skills: [
      {
        name: '前后端协作推进',
        confidence: 'high',
        quoteText: '我先和后端约个15分钟快速对齐，把最小需要的字段定下来。然后前端用Mock数据先把结构和交互跑通',
        reasoning: '候选人在接口不确定时主动提出对齐方案和Mock策略',
      },
    ],
    inferredTraits: [
      {
        trait: 'scope_negotiation',
        label: '范围协商意识',
        confidence: 'high',
        quoteText: '我建议拆成两期——核心筛选这期上，高级筛选放下个迭代',
        reasoning: '面对上线压力主动提出分期交付，展现优先级判断能力',
      },
    ],
    concerns: [
      {
        concern: '需求不确定性',
        confidence: 'medium',
        quoteText: '如果产品那边还有不确定的范围',
        reasoning: '候选人在推进方案时仍关注需求的确定性边界',
      },
    ],
    selfReportedProfile: { rawSkills: [], yearsOfExperience: null, currentRole: null },
    extractionMetadata: { totalDialogueTurns: 2, extractableTurns: 2, lowConfidenceNote: null },
  };

  // ── Few-Shot: 反例 + 纠正 ──
  const negativeExampleInput = [
    '[数字人(HR)]: 你对薪资有什么期望吗？',
    '[候选人]: 我觉得还是先看看岗位具体做什么吧，薪资可以后面再聊。',
  ].join('\n');

  const negativeExampleWrong = {
    skills: [
      {
        name: '薪资谈判能力',
        confidence: 'high',
        quoteText: '候选人回避了薪资讨论，暗示其更关注工作内容而非薪酬',
        reasoning: '候选人在面对薪资问题时表现谨慎',
      },
    ],
  };

  const negativeExampleCorrected = {
    skills: [],
    inferredTraits: [
      {
        trait: 'task_first_mindset',
        label: '任务优先倾向',
        confidence: 'medium',
        quoteText: '我觉得还是先看看岗位具体做什么吧，薪资可以后面再聊',
        reasoning: '候选人主动将对话焦点从薪资拉回岗位内容，单次行为不足以高置信度',
      },
    ],
    concerns: [],
    selfReportedProfile: { rawSkills: [], yearsOfExperience: null, currentRole: null },
    extractionMetadata: { totalDialogueTurns: 2, extractableTurns: 1, lowConfidenceNote: null },
  };

  return [
    { role: 'system', content: systemPrompt },

    // Few-Shot 正例
    {
      role: 'user',
      content: `【学习样本 - 请观察正确的萃取方式】\n对话：\n${positiveExampleInput}`,
    },
    {
      role: 'assistant',
      content: JSON.stringify(positiveExampleOutput),
    },

    // Few-Shot 反例
    {
      role: 'user',
      content: `【错误示范 - 以下萃取有严重问题】\n对话：\n${negativeExampleInput}\n\n一个不合格的萃取结果：\n${JSON.stringify(negativeExampleWrong)}\n\n问题在哪？\n1. quoteText 是AI自己的归纳("候选人回避了薪资讨论...")，不是对话原文——在对话中Ctrl+F根本找不到这句话。\n2. 从单次回避行为推断"谈判能力"是过度推断。\n3. confidence 应该降为 medium，因为只有一段对话支撑。`,
    },
    {
      role: 'assistant',
      content: JSON.stringify(negativeExampleCorrected),
    },

    // 最终提示
    {
      role: 'user',
      content: `⚠️ 牢记：每个 quoteText 必须能在原文中逐字匹配。这是不可妥协的硬性要求。`,
    },

    // 真实数据输入
    {
      role: 'user',
      content: [
        `【正式推演记录 — 请萃取】`,
        `对话：\n${dialogueCorpus || '（无对话记录）'}`,
        `分岔选择记录：${JSON.stringify(input.branchChoices ?? [])}`,
        `反向问答记录：${JSON.stringify(input.reverseQuestions ?? [])}`,
        '',
        '请萃取该候选人的画像。记住：',
        '1. 每个 quoteText 必须从对话原文中 Ctrl+F 可查。',
        '2. 找不到原文依据的条目不要输出。',
        '3. 单次行为 → confidence=medium；两次以上独立佐证 → confidence=high。',
      ].join('\n'),
    },
  ];
}
