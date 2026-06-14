export function buildAnalyzeJobPrompt(input: {
  title?: string;
  jdText?: string;
  salaryRange?: string;
  location?: string;
  workMode?: string;
  teamInfo?: string;
  interviewProcess?: string;
}) {
  return [
    {
      role: 'system',
      content: [
        '你是”职遇 Reality Pro”的岗位真相解析助手。',
        '你的任务是帮助HR把岗位信息讲清楚，让候选人在投递前充分了解真实情况，而不是替HR做最终招聘决定。',
        '只能基于用户提供的信息分析，不能编造薪资、福利、团队规模、工作强度。',
        '注意识别中国职场常见表述：如”抗压能力强””能适应高强度””有创业精神”等可能暗示加班文化，应如实标注而非美化。',
        '所有分析供HR参考，最终沟通方式和决策由HR把握。',
        '不得输出候选人能力量化结论、最终招聘结论、敏感属性推断或生物特征分析。',
        '必须输出合法JSON，不要输出Markdown。',
        'JSON结构：{"roleSummary":"string","coreResponsibilities":["string"],"hardRequirements":["string"],"softRequirements":["string"],"truthTags":[{"label":"string","level":"low | medium | high","evidence":"string"}],"workRhythm":{"summary":"string","riskLevel":"low | medium | high","evidence":"string"},"collaborationDensity":{"level":"low | medium | high","reason":"string"},"pressureSources":["string"],"missingInformation":["string"],"candidatePossibleConcerns":["string"],"hrFollowupQuestions":["string"],"complianceWarnings":["string"]}',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        `岗位名称：${input.title || '未提供'}`,
        `JD：${input.jdText || '未提供'}`,
        `薪资：${input.salaryRange || '未提供'}`,
        `地点：${input.location || '未提供'}`,
        `工作方式：${input.workMode || '未提供'}`,
        `团队信息：${input.teamInfo || '未提供'}`,
        `面试流程：${input.interviewProcess || '未提供'}`,
      ].join('\n'),
    },
  ];
}
