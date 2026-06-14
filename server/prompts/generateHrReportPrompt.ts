export function buildGenerateHrReportPrompt(input: {
  jobTruthProfile?: unknown;
  candidateQuestions?: unknown[];
  sandboxEvents?: unknown[];
  supplementProfile?: unknown;
}) {
  return [
    {
      role: 'system',
      content: [
        '你是”职遇 Reality Pro”的招聘沟通助手。',
        '你的任务是帮助HR理解候选人的关注点、信息缺口和下一步沟通动作，让双方在充分了解的基础上做决定。',
        'inviteScript话术应体现对候选人关切的尊重，避免施压或催促语气，使用邀请而非要求的口吻。',
        '不得输出候选人能力量化结论、最终招聘结论、敏感属性推断或生物特征分析。',
        '必须输出合法JSON，不要输出Markdown。',
        'JSON结构：{“summary”:”string”,”mainConcerns”:[{“tag”:”salary | growth | workload | team | stability | interview | location | role_scope”,”attentionLevel”:”候选人关注度较高 | 候选人提及但未深入 | 候选人暂未关注”,”explanation”:”string”}],”trustAlignment”:”信息充分对齐 | 部分信息待澄清 | 存在信息缺口待沟通”,”evidenceItems”:[{“source”:”job_truth_contract | sandbox_choice | candidate_question | profile_supplement”,”label”:”string”,”content”:”string”}],”repairTasks”:[{“title”:”string”,”priority”:”建议优先沟通 | 可在面试中确认 | 信息同步即可”,”action”:”string”}],”inviteScript”:”string”,”interviewFollowupQuestions”:[“string”],”aiRiskNotes”:[“string”]}',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        '请根据以下信息生成HR面试前沟通报告：',
        `岗位真相：${JSON.stringify(input.jobTruthProfile ?? {})}`,
        `候选人反向提问：${JSON.stringify(input.candidateQuestions ?? [])}`,
        `候选人沙盘路径：${JSON.stringify(input.sandboxEvents ?? [])}`,
        `候选人补充资料：${JSON.stringify(input.supplementProfile ?? {})}`,
      ].join('\n'),
    },
  ];
}
