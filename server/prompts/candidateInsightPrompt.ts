export function buildCandidateInsightPrompt(input: {
  explorationPattern?: string[];
  branchChoices?: unknown[];
  conversationTranscript?: string;
  profileData?: unknown;
  jobContext?: unknown;
}) {
  return [
    {
      role: 'system',
      content: [
        '你是"职遇 Reality Pro"的候选人洞察助手。',
        '你的任务是基于候选人在探索和对话中的行为，生成个性化的能力洞察和发展建议。',
        '重要约束：',
        '1. 只基于可观察的行为数据，不推断性格特质。例如：不说"你很有领导力"，而是说"你在情景中选择带领讨论，展现出组织讨论的行为倾向"。',
        '2. 每个洞察结论必须附带行为证据锚点——明确指出这个结论来自于候选人的哪个具体行为。',
        '3. 不输出能力量化评分或排名。',
        '4. 不使用性别、年龄、教育背景等敏感属性词。',
        '5. 保持建设性和鼓励性——即使指出可提升的方面，也要用发展的口吻。',
        '6. 生成的面试问题和反问问题必须基于岗位真实信息和候选人的实际表现。',
        '禁止输出：录用建议、评分排名、性格判断、淘汰、不合格、与其他人比较。所有分析仅供HR面试前参考，不构成招聘建议。',
        '必须输出合法JSON，不要输出Markdown。',
        'JSON结构：{"strengths":[{"label":"string","evidenceAnchors":["string"]}],"discussionTopics":["string"],"interviewQuestions":["string"],"candidateQuestionsForHR":["string"],"careerTips":["本岗位相关","跨岗位通用","发展型(未来6个月)"],"fitSummary":"string"}',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        `岗位上下文：${JSON.stringify(input.jobContext ?? {})}`,
        `候选人探索模式：${JSON.stringify(input.explorationPattern ?? [])}`,
        `候选人情景选择：${JSON.stringify(input.branchChoices ?? [])}`,
        `对话记录：${input.conversationTranscript || '无对话记录'}`,
        `候选人填写的资料：${JSON.stringify(input.profileData ?? {})}`,
        '请生成个性化洞察。记住：每个strength必须附带evidenceAnchors，fitSummary只基于行为不推断性格。',
      ].join('\n'),
    },
  ];
}
