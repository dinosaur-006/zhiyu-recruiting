import { describe, expect, it } from 'vitest';
import { createInitialState } from '../mock/data';
import { markTrustRepairTaskHandled, normalizeDemoState } from './demoStore';

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

  it('adds Trust+ fields to older state shapes', () => {
    const legacy = createInitialState();
    const normalized = normalizeDemoState({
      ...legacy,
      trialSessions: [
        {
          ...legacy.trialSessions[0],
          mutualConfirmation: undefined,
        } as never,
      ],
      realityReports: [
        {
          ...legacy.realityReports[0],
          trustNegotiationCard: undefined,
          mutualConfirmation: undefined,
          candidateFairnessIndex: undefined,
        } as never,
      ],
    });

    expect(normalized.jobTruthLabels[0].evidence.length).toBeGreaterThan(0);
    expect(normalized.trialSessions[0].mutualConfirmation.candidateConfirmedItems).toBeInstanceOf(Array);
    expect(normalized.realityReports[0].trustNegotiationCard.hrClarifications.length).toBeGreaterThan(0);
    expect(normalized.realityReports[0].candidateFairnessIndex.total).toBeGreaterThanOrEqual(0);
  });

  it('adds Trust Intelligence fields to older state shapes', () => {
    const legacy = createInitialState();
    const normalized = normalizeDemoState({
      ...legacy,
      trialSessions: [
        {
          ...legacy.trialSessions[0],
          exitReason: undefined,
        },
      ],
      realityReports: [
        {
          ...legacy.realityReports[0],
          trustLoopGraph: undefined,
          trustGapDiagnosis: undefined,
          commitmentConsistencyCheck: undefined,
          aiAdviceRelianceNotice: undefined,
        } as never,
      ],
    });

    expect(normalized.realityReports[0].trustLoopGraph.length).toBeGreaterThan(0);
    expect(normalized.realityReports[0].trustGapDiagnosis.length).toBeGreaterThan(0);
    expect(normalized.realityReports[0].commitmentConsistencyCheck.findings.length).toBeGreaterThan(0);
    expect(normalized.realityReports[0].aiAdviceRelianceNotice.reminders.length).toBeGreaterThan(0);
  });

  it('adds Trust Governance fields to older state shapes', () => {
    const legacy = createInitialState();
    const normalized = normalizeDemoState({
      ...legacy,
      trustAuditEvents: undefined,
      trustRepairTasks: undefined,
      realityReports: [
        {
          ...legacy.realityReports[0],
          trustAuditLog: undefined,
          silenceRisk: undefined,
          trustRepairTasks: undefined,
          auditCompletenessRate: undefined,
        } as never,
      ],
    });

    expect(normalized.trustAuditEvents.length).toBeGreaterThan(0);
    expect(normalized.trustRepairTasks.length).toBeGreaterThan(0);
    expect(normalized.realityReports[0].trustAuditLog.length).toBeGreaterThan(0);
    expect(normalized.realityReports[0].silenceRisk.level).toBeTypeOf('string');
    expect(normalized.realityReports[0].auditCompletenessRate).toBeGreaterThanOrEqual(0);
  });

  it('marks trust repair tasks as handled and updates metrics', () => {
    const initial = createInitialState();
    const taskId = initial.trustRepairTasks[0].id;

    const next = markTrustRepairTaskHandled(taskId);
    const task = next.trustRepairTasks.find((item) => item.id === taskId);

    expect(task?.status).toBe('已处理');
    expect(task?.estimatedImpact.length).toBeGreaterThan(0);
    expect(next.metrics.handledTrustRepairTasks).toBeGreaterThan(0);
  });

  it('adds closure signal fields to older state shapes', () => {
    const legacy = createInitialState();
    const normalized = normalizeDemoState({
      ...legacy,
      metrics: {
        ...legacy.metrics,
        recruitingTrustHealth: undefined,
      },
      realityReports: [
        {
          ...legacy.realityReports[0],
          adviceEvidenceTags: undefined,
          trustRepairTasks: legacy.realityReports[0].trustRepairTasks.map((task) => ({
            ...task,
            beforeTrustScore: undefined,
            estimatedAfterTrustScore: undefined,
            estimatedImpact: undefined,
          })),
        } as never,
      ],
    });

    expect(normalized.metrics.recruitingTrustHealth?.total).toBeGreaterThanOrEqual(0);
    expect(normalized.realityReports[0].adviceEvidenceTags.length).toBeGreaterThan(0);
    expect(normalized.realityReports[0].trustRepairTasks[0].estimatedImpact.length).toBeGreaterThan(0);
  });
});
