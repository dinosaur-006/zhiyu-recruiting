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
});
