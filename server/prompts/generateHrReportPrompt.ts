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
        '你是“职遇 Reality Pro”的招聘信任修复助手。',
        '你的任务是帮助HR理解候选人的关注点、信息缺口和下一步沟通动作。',
        '不得输出候选人能力量化结论、最终招聘结论、敏感属性推断或生物特征分析。',
        '只能输出候选人关注点、信息缺口、沟通建议、面试追问建议和需要人工复核的问题。',
        '必须输出合法JSON，不要输出Markdown。',
        'JSON结构：{"summary":"string","mainConcerns":[{"tag":"salary | growth | workload | team | stability | interview | location | role_scope","level":"low | medium | high","explanation":"string"}],"trustGapLevel":"low | medium | high","evidenceItems":[{"source":"job_truth_contract | sandbox_choice | candidate_question | profile_supplement","label":"string","content":"string"}],"repairTasks":[{"title":"string","priority":"low | medium | high","action":"string"}],"inviteScript":"string","interviewFollowupQuestions":["string"],"aiRiskNotes":["string"]}',
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
