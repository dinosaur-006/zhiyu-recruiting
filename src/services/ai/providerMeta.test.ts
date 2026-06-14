import { describe, expect, it } from 'vitest';
import { unwrapApiResponse, createMockMeta } from './index';

describe('AI provider metadata helpers', () => {
  it('unwraps backend data and metadata response', () => {
    const result = unwrapApiResponse<{ summary: string }>({
      data: { summary: '岗位真相已生成' },
      meta: {
        provider: 'deepseek',
        model: 'deepseek-v4-pro',
        requestId: 'request-1',
        latencyMs: 1200,
        safetyHits: [],
        needsHumanReview: false,
        createdAt: '2026-05-18T00:00:00.000Z',
      },
    });

    expect(result.data.summary).toBe('岗位真相已生成');
    expect(result.meta?.provider).toBe('deepseek');
    expect(result.meta?.requestId).toBe('request-1');
  });

  it('creates fallback mock metadata with an error message', () => {
    const meta = createMockMeta(true, 'network failed');

    expect(meta.provider).toBe('mock');
    expect(meta.fallback).toBe(true);
    expect(meta.errorMessage).toBe('network failed');
  });
});
