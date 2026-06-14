import { describe, expect, it } from 'vitest';
import { sanitizeAiOutput } from './safety';

describe('sanitizeAiOutput', () => {
  it('cleans prohibited output and records review metadata', () => {
    const result = sanitizeAiOutput({
      summary: '建议录用，候选人评分较高。',
      notes: ['不分析岗位无关信息'],
    });

    expect(result.data.summary).toContain('需人工复核');
    expect(result.safetyHits).toEqual(expect.arrayContaining(['建议录用', '候选人评分']));
    expect(result.needsHumanReview).toBe(true);
  });

  it('keeps safe output without forcing review', () => {
    const result = sanitizeAiOutput({
      summary: '建议HR补充说明薪资沟通节点。',
    });

    expect(result.data.summary).toContain('薪资沟通节点');
    expect(result.safetyHits).toEqual([]);
    expect(result.needsHumanReview).toBe(false);
  });
});
