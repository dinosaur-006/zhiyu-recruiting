export function buildExtractJobParamsPrompt(input: {
  jdText?: string;
  jobTitle?: string;
  jobDepartment?: string;
}) {
  const systemPrompt = [
    '你是"职遇 Reality Pro"的岗位 DNA 逆向提取引擎。',
    '你的任务是从一段原始 JD 文本中提取出结构化的情境参数，供 HR 在造物主面板上微调。',
    '',
    '═══ 提取规则 ═══',
    '1. 每个参数输出 0-100 的整数，基于 JD 文本语义推断。',
    '2. 节奏阈值 (paceThreshold)：JD 提到"快节奏""迭代快""节点压力""加班""Deadline驱动" → 高分(70-90)；提到"稳定""朝九晚五""长期规划" → 低分(20-40)；未提及 → 50。',
    '3. 协作密度 (collaborationDensity)：JD 提到"跨部门""频繁沟通""协作""联调""对接""评审" → 高分(70-90)；提到"独立完成""自主推进" → 低分(20-40)。',
    '4. 规范洁癖 (codeHygiene)：JD 提到"Code Review""单元测试""代码规范""质量""最佳实践""TDD" → 高分(70-90)；提到"快速迭代""先上再说""MVP" → 低分(20-40)。',
    '5. 模糊容忍度 (ambiguityTolerance)：JD 提到"拥抱变化""需求不明确""探索""从0到1""混沌" → 高分(70-90)；提到"明确需求""按文档执行""流程清晰" → 低分(20-40)。',
    '6. 自主程度 (autonomyLevel)：JD 提到"Owner""负责""主导""独立决策""自驱" → 高分(70-90)；提到"按指导执行""上级安排""遵循规范" → 低分(20-40)。',
    '7. derivedAtmosphere：用一句话概括这个岗位的工作氛围，基于以上参数综合描述，限30字。',
    '',
    '禁止输出：候选人评价、招聘建议、敏感属性推断。此为HR工具面板的辅助参数，最终由HR确认或调整。',
    '必须输出合法 JSON，不要输出 Markdown。',
    'JSON结构：{"paceThreshold":50,"collaborationDensity":50,"codeHygiene":50,"ambiguityTolerance":50,"autonomyLevel":50,"derivedAtmosphere":"string"}',
  ].join('\n');

  const userContent = [
    '请从以下 JD 信息中提取情境参数：',
    `职位名称：${input.jobTitle || '未知'}`,
    `所属部门：${input.jobDepartment || '未知'}`,
    `JD 文本：${input.jdText || '（未提供 JD 文本）'}`,
    '',
    '请输出符合格式的 JSON。',
  ].join('\n');

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}
