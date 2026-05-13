import { describe, expect, it } from 'vitest';
import { createInitialState } from '../mock/data';
import { normalizeDemoState } from './demoStore';

describe('normalizeDemoState', () => {
  it('adds Reality fields to older stored state shapes', () => {
    const legacy = createInitialState();
    const { realityRoles, realityScenes, trialSessions, realityReports, ...legacyShape } = legacy;

    const normalized = normalizeDemoState(legacyShape);

    expect(normalized.realityRoles.length).toBeGreaterThan(0);
    expect(normalized.realityScenes.length).toBeGreaterThan(0);
    expect(normalized.jobTruthLabels.length).toBeGreaterThan(0);
    expect(normalized.branchScenarios.length).toBeGreaterThan(0);
    expect(normalized.truthVideoScripts.length).toBeGreaterThan(0);
    expect(normalized.trialSessions).toEqual([]);
    expect(normalized.realityReports.length).toBeGreaterThan(0);
  });

  it('adds Trust Layer fields to older trial sessions and reports', () => {
    const legacy = createInitialState();
    const legacySession = legacy.trialSessions[0];
    const legacyReport = legacy.realityReports[0];
    const normalized = normalizeDemoState({
      ...legacy,
      trialSessions: [
        {
          ...legacySession,
          truthContractAcknowledgement: undefined,
          trialEvents: undefined,
        } as never,
      ],
      realityReports: [
        {
          ...legacyReport,
          truthContractSummary: undefined,
          candidateTrustIndex: undefined,
          trustGapSummary: undefined,
          trustRepairScript: undefined,
          trialReplay: undefined,
          aiRiskReview: undefined,
        } as never,
      ],
    });

    expect(normalized.trialSessions[0].trialEvents.length).toBeGreaterThan(0);
    expect(normalized.trialSessions[0].truthContractAcknowledgement.acknowledged).toBeTypeOf('boolean');
    expect(normalized.realityReports[0].candidateTrustIndex.total).toBeGreaterThanOrEqual(0);
    expect(normalized.realityReports[0].aiRiskReview.checkedItems).toContain('已包含人工复核声明');
  });
});
