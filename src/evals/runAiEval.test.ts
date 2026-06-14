import { describe, expect, it } from 'vitest';
import { validateHrReportEval, validateJobAnalysisEval } from './runAiEval';

describe('alpha AI eval validators', () => {
  it('accepts complete job analysis output', () => {
    const result = validateJobAnalysisEval({
      roleSummary: '负责产品需求分析与跨团队推进。',
      truthTags: [
        { label: '工作节奏', level: 'medium', evidence: '需要跟进版本节点。' },
        { label: '协作密度', level: 'high', evidence: '需要与设计和研发协作。' },
        { label: '成长路径', level: 'medium', evidence: '岗位要求参与完整产品流程。' },
      ],
      missingInformation: ['反馈时效未说明'],
      candidatePossibleConcerns: ['薪资沟通节点', '工作节奏'],
      complianceWarnings: ['仅用于岗位信息澄清，不做最终推进结论。'],
    });

    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('flags incomplete HR report output and prohibited wording', () => {
    const result = validateHrReportEval({
      summary: '',
      mainConcerns: [],
      evidenceItems: [{ source: 'candidate_question', label: '薪资', content: '询问薪资沟通节点。' }],
      repairTasks: [],
      inviteScript: ['推', '荐', '录', '用'].join('') + '这名候选人。',
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining(['summary is empty', 'repairTasks should include at least 1 item']));
    expect(result.issues.some((issue) => issue.includes('prohibited wording'))).toBe(true);
  });
});
