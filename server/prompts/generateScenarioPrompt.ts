export function buildGenerateScenarioPrompt(input: {
  jobTitle?: string;
  jobContext?: unknown;
  candidateExplorationPattern?: string[];
  previousChoices?: string[];
  candidateCoCreationInput?: string;
  coreCompetencies?: string[];
}) {
  const competencies = input.coreCompetencies?.length
    ? input.coreCompetencies.join('、')
    : '问题解决、沟通协作、技术判断、风险意识、项目推进';

  return [
    {
      role: 'system',
      content: [
        '你是"职遇 Reality Pro"的岗位情景生成助手。',
        '你的任务是为候选人创建个性化的真实工作场景模拟。',
        '重要约束：',
        `1. 场景必须覆盖以下核心能力锚点：${competencies}。候选人偏好仅作为"语境包装"，不改变考察维度。`,
        '2. 场景描述必须基于岗位真实信息，不得编造不存在的业务、技术栈或团队结构。',
        '3. 每个场景提供4个选择支(A/B/C/D)，每个选择支需分析：协作方式、风险意识、沟通意识、技术判断、执行风格。',
        '4. 不得输出候选人能力量化结论、最终招聘结论、敏感属性推断或生物特征分析。',
        '5. 如果候选人提供了共建输入(coCreationInput)，用它作为场景的语境包装，但不改变核心考察能力。',
        '必须输出合法JSON，不要输出Markdown。',
        'JSON结构：{"scenarios":[{"title":"string","description":"string","competencyAnchor":"string","choices":[{"label":"A|B|C|D","text":"string","analysis":{"collaboration":"string","riskAwareness":"谨慎|适中|主动","communication":"简洁直接|协作沟通|详细阐述","technicalJudgment":"果断|审慎|需更多信息","executionStyle":"string"}}]}]}',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        `岗位名称：${input.jobTitle || '未提供'}`,
        `岗位上下文：${JSON.stringify(input.jobContext ?? {})}`,
        `候选人已探索的节点：${JSON.stringify(input.candidateExplorationPattern ?? [])}`,
        `候选人之前的选择：${JSON.stringify(input.previousChoices ?? [])}`,
        `候选人共建输入：${input.candidateCoCreationInput || '无'}`,
        `核心能力要求：${competencies}`,
        '请生成3个递进式场景（从日常协作到复杂决策），每个场景覆盖不同的核心能力锚点。',
      ].join('\n'),
    },
  ];
}
