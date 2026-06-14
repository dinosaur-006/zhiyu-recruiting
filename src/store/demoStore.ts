import { useEffect, useState } from 'react';
import {
  buildDefaultAvatarConfig,
  answerReverseQuestion,
  calculateRecruitingTrustHealth,
  generateAIAdviceEvidenceTags,
  generateAIAdviceRelianceNotice,
  generateAIRiskReview,
  calculateCandidateTrustIndex,
  createDefaultRealityRoles,
  detectIntent,
  generateCommitmentConsistencyCheck,
  generateJobTruthContract,
  generateJobTruthLabel,
  generateCandidateFairnessIndex,
  generateHRStoryCard,
  generateInterviewMutualConfirmation,
  generateRealityReport,
  generateRealityScripts,
  generateTrialReplay,
  generateTrustGapDiagnosis,
  generateTrustNegotiationCard,
  generateTrustLoopGraph,
  generateTrustGapSummary,
  generateTrustRepairScript,
  generateTrustAuditLog,
  generateSilenceRisk,
  generateTrustRepairTasks,
  calculateAuditCompleteness,
  generateTruthVideoScript,
  getBranchScenarios,
  getScenarioChoices,
  parseJobDescription,
} from '../mock/ai';
import { createInitialState } from '../mock/data';
import { aiProvider, type AiResult } from '../services/ai';
import {
  adaptAiJobAnalysis,
  adaptAiReportToRealityReport,
  type AiHrReportResponse,
  type AiJobAnalysisResponse,
} from '../services/ai/reportAdapter';
import type {
  AvatarConfig,
  Candidate,
  CandidateProfileInput,
  Conversation,
  ConversationDraft,
  ConversationMessage,
  DemoState,
  Job,
  JobInput,
  CandidateExitReason,
  ReverseQuestionType,
  RealityRole,
  TrialEvent,
  TrialSession,
  InterviewMutualConfirmation,
  TruthContractAcknowledgement,
  AiGenerationMeta,
  JobAnalysis,
  RealityReport,
} from '../types';

const STORAGE_KEY = 'zhiyu-demo-state-v4';
const STORE_EVENT = 'zhiyu-demo-store-updated';

const nowIso = () => new Date().toISOString();

function defaultReportAiMeta(report?: Partial<RealityReport>): AiGenerationMeta {
  const existing = report?.aiMeta;
  const source = existing?.source ?? existing?.provider ?? 'mock';
  return {
    provider: existing?.provider ?? source,
    source,
    model: existing?.model,
    requestId: existing?.requestId,
    latencyMs: existing?.latencyMs,
    safetyHits: existing?.safetyHits ?? [],
    needsHumanReview: existing?.needsHumanReview ?? false,
    createdAt: existing?.createdAt ?? nowIso(),
    fallback: existing?.fallback ?? false,
    errorMessage: existing?.errorMessage,
  };
}

function aiResultToReportMeta(ai: AiResult<unknown>): AiGenerationMeta {
  return {
    provider: ai.meta?.provider ?? ai.source,
    source: ai.source,
    model: ai.meta?.model,
    requestId: ai.meta?.requestId,
    latencyMs: ai.meta?.latencyMs,
    safetyHits: ai.meta?.safetyHits ?? [],
    needsHumanReview: ai.meta?.needsHumanReview ?? false,
    createdAt: ai.meta?.createdAt ?? nowIso(),
    fallback: ai.fallback,
    errorMessage: ai.errorMessage ?? ai.meta?.errorMessage,
  };
}

const emptyTruthContractAcknowledgement = (): TruthContractAcknowledgement => ({
  acknowledged: false,
  acknowledgedItems: [],
  unresolvedConcerns: [],
});

const emptyMutualConfirmation = (): InterviewMutualConfirmation => ({
  candidateConfirmedItems: [],
  unresolvedReasons: [],
  hrCommitments: [
    '本轮面试会重点沟通候选人关心的问题',
    '不会仅凭AI报告做最终决定',
    '会尽量说明面试结果反馈节点',
  ],
});

function createTrialEvent(type: TrialEvent['type'], label: string, metadata?: TrialEvent['metadata']): TrialEvent {
  return {
    id: createId('event'),
    type,
    label,
    occurredAt: nowIso(),
    metadata,
  };
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hasBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function normalizeDemoState(state: Partial<DemoState>): DemoState {
  const initial = createInitialState();
  const jobs = state.jobs ?? initial.jobs;
  const existingScenes = state.realityScenes ?? [];
  const existingRoles = state.realityRoles ?? [];
  const existingTruthLabels = state.jobTruthLabels ?? [];
  const existingTruthContracts = state.jobTruthContracts ?? [];
  const existingBranchScenarios = state.branchScenarios ?? [];
  const existingTruthVideoScripts = state.truthVideoScripts ?? [];

  const realityScenes =
    existingScenes.length > 0 ? existingScenes : jobs.flatMap((job) => generateRealityScripts(job));
  const realityRoles =
    existingRoles.length > 0 ? existingRoles : jobs.flatMap((job) => createDefaultRealityRoles(job.id));
  const jobTruthLabels =
    existingTruthLabels.length > 0
      ? existingTruthLabels.map((label) => {
          const job = jobs.find((item) => item.id === label.jobId);
          return label.evidence?.length || !job ? label : generateJobTruthLabel(job);
        })
      : jobs.map((job) => generateJobTruthLabel(job));
  const jobTruthContracts =
    existingTruthContracts.length > 0
      ? existingTruthContracts
      : jobs.map((job) =>
          generateJobTruthContract(
            job,
            jobTruthLabels.find((label) => label.jobId === job.id) ?? generateJobTruthLabel(job),
          ),
        );
  const branchScenarios =
    existingBranchScenarios.length > 0 ? existingBranchScenarios : jobs.flatMap((job) => getBranchScenarios(job));
  const truthVideoScripts =
    existingTruthVideoScripts.length > 0
      ? existingTruthVideoScripts
      : jobs.map((job) =>
          generateTruthVideoScript(
            job,
            realityRoles.filter((role) => role.jobId === job.id),
            realityScenes.filter((scene) => scene.jobId === job.id),
          ),
        );
  const trialSessions = (state.trialSessions ?? []).map((session) => {
    const truthContractAcknowledgement =
      session.truthContractAcknowledgement ?? emptyTruthContractAcknowledgement();
    const trialEvents =
      session.trialEvents?.length
        ? session.trialEvents
        : [
            ...(session.viewedTruthPoints ?? []).map((point, index) => ({
              id: `legacy-event-truth-${session.id}-${index}`,
              type: 'truth_label_viewed' as const,
              label: `查看岗位真相：${point}`,
              occurredAt: session.startedAt,
            })),
            ...(truthContractAcknowledgement.acknowledged
              ? [
                  {
                    id: `legacy-event-contract-${session.id}`,
                    type: 'truth_contract_acknowledged' as const,
                    label: '确认岗位真相合约',
                    occurredAt: truthContractAcknowledgement.acknowledgedAt ?? session.startedAt,
                  },
                ]
              : []),
            ...(session.branchChoiceIds ?? []).map((choiceId, index) => ({
              id: `legacy-event-branch-${session.id}-${index}`,
              type: 'branch_choice_selected' as const,
              label: `完成分岔任务选择：${choiceId}`,
              occurredAt: session.completedAt ?? session.startedAt,
            })),
          ];

    return {
      ...session,
      branchChoiceIds: session.branchChoiceIds ?? [],
      viewedTruthPoints: session.viewedTruthPoints ?? [],
      focusedTruthPoints: session.focusedTruthPoints ?? [],
      reverseQuestions: session.reverseQuestions ?? [],
      truthContractAcknowledgement,
      mutualConfirmation: session.mutualConfirmation ?? emptyMutualConfirmation(),
      trialEvents,
      exitReason: session.exitReason,
    };
  });
  const realityReports = (state.realityReports ?? initial.realityReports).map((report) => {
    const candidate = (state.candidates ?? initial.candidates).find((item) => item.id === report.candidateId);
    const job = jobs.find((item) => item.id === report.jobId);
    const session = trialSessions.find((item) => item.candidateId === report.candidateId);
    const truthLabel =
      (job ? jobTruthLabels.find((item) => item.jobId === job.id) : undefined) ?? (job ? generateJobTruthLabel(job) : undefined);
    const truthContract =
      (job ? jobTruthContracts.find((item) => item.jobId === job.id) : undefined) ??
      (job && truthLabel ? generateJobTruthContract(job, truthLabel) : undefined);
    const scenes = job ? realityScenes.filter((scene) => scene.jobId === job.id) : [];
    const trialReplay = report.trialReplay ?? (session ? generateTrialReplay(session) : []);
    const truthContractSummary =
      report.truthContractSummary ??
      {
        acknowledged: session?.truthContractAcknowledgement.acknowledged ?? false,
        acknowledgedItems: session?.truthContractAcknowledgement.acknowledgedItems ?? [],
        unresolvedConcerns: session?.truthContractAcknowledgement.unresolvedConcerns ?? [],
      };
    const baseReport = {
      ...report,
      aiMeta: defaultReportAiMeta(report),
      humanReviewStatus: report.humanReviewStatus ?? 'pending',
      reviewedAt: report.reviewedAt,
      truthContractSummary,
      trialReplay,
      candidateTrustIndex:
        report.candidateTrustIndex ??
        (candidate && session
          ? calculateCandidateTrustIndex(candidate, session, report)
          : {
              total: 0,
              dimensions: {
                jobInfoClarity: 0,
                salaryCertainty: 0,
                teamTrust: 0,
                growthCredibility: 0,
                rhythmAcceptance: 0,
                aiTransparency: 0,
                interviewWillingness: 0,
              },
              gapReasons: [],
              repairSuggestions: [],
              explanation: '候选人信任指数衡量岗位信息是否足以支撑候选人继续投入面试时间，不评价候选人能力。',
            }),
      trustGapSummary:
        report.trustGapSummary ??
        {
          majorGaps: [],
          repairSuggestions: [],
        },
      trustRepairScript: report.trustRepairScript ?? '',
      mutualConfirmation:
        report.mutualConfirmation ??
        (session ? generateInterviewMutualConfirmation(session, report) : emptyMutualConfirmation()),
      trustNegotiationCard:
        report.trustNegotiationCard ??
        {
          candidateQuestions: [],
          hrClarifications: [],
          trustRepairScript: '',
          formalInvitationScript: '',
        },
      candidateFairnessIndex:
        report.candidateFairnessIndex ??
        {
          total: 0,
          dimensions: {
            aiDisclosure: 0,
            dataUsageNotice: 0,
            directApplyPath: 0,
            humanReview: 0,
            explanationAndDeletion: 0,
            sensitiveDataAvoidance: 0,
            feedbackTiming: 0,
          },
          optimizationSuggestions: [],
        },
      trustLoopGraph: report.trustLoopGraph ?? [],
      trustGapDiagnosis: report.trustGapDiagnosis ?? [],
      commitmentConsistencyCheck:
        report.commitmentConsistencyCheck ??
        (job && truthLabel && truthContract
          ? generateCommitmentConsistencyCheck(job, truthLabel, truthContract, scenes)
          : {
              riskLevel: '中' as const,
              findings: ['旧报告缺少岗位承诺一致性检测。'],
              suggestions: ['建议HR重新生成报告或补充岗位真相证据。'],
            }),
      aiAdviceRelianceNotice:
        report.aiAdviceRelianceNotice ??
        {
          evidenceSupportedCount: 0,
          needsHumanConfirmationCount: 0,
          reminders: [],
        },
      adviceEvidenceTags: report.adviceEvidenceTags ?? [],
      candidateExitReason: report.candidateExitReason ?? session?.exitReason,
      aiRiskReview:
        report.aiRiskReview ??
        {
          result: '需要人工确认' as const,
          checkedItems: [],
          reminders: [],
        },
    };
    const trustGapSummary =
      report.trustGapSummary ?? generateTrustGapSummary(baseReport.candidateTrustIndex, baseReport);
    const trustRepairScript =
      report.trustRepairScript && report.trustRepairScript.length > 0
        ? report.trustRepairScript
        : candidate
          ? generateTrustRepairScript(candidate, baseReport.candidateTrustIndex, trustGapSummary)
          : '';
    const enrichedReport = {
      ...baseReport,
      trustGapSummary,
      trustRepairScript,
    };
    const withTrustPlus = {
      ...enrichedReport,
      mutualConfirmation:
        report.mutualConfirmation ??
        (session ? generateInterviewMutualConfirmation(session, enrichedReport) : enrichedReport.mutualConfirmation),
      trustNegotiationCard:
        report.trustNegotiationCard && report.trustNegotiationCard.hrClarifications.length > 0
          ? report.trustNegotiationCard
          : generateTrustNegotiationCard(enrichedReport),
    };
    const withDiagnosis = {
      ...withTrustPlus,
      trustGapDiagnosis:
        report.trustGapDiagnosis && report.trustGapDiagnosis.length > 0
          ? report.trustGapDiagnosis
          : generateTrustGapDiagnosis(withTrustPlus),
    };
    const withEvidenceTags = {
      ...withDiagnosis,
      adviceEvidenceTags:
        report.adviceEvidenceTags && report.adviceEvidenceTags.length > 0
          ? report.adviceEvidenceTags
          : generateAIAdviceEvidenceTags(withDiagnosis),
    };
    const withReliance = {
      ...withEvidenceTags,
      aiAdviceRelianceNotice:
        report.aiAdviceRelianceNotice && report.aiAdviceRelianceNotice.reminders.length > 0
          ? report.aiAdviceRelianceNotice
          : generateAIAdviceRelianceNotice(withEvidenceTags),
    };
    const withReview = {
      ...withReliance,
      aiRiskReview: report.aiRiskReview ?? generateAIRiskReview(withReliance),
    };
    const withSilence = {
      ...withReview,
      silenceRisk: report.silenceRisk ?? (session ? generateSilenceRisk(withReview, session) : initial.realityReports[0]?.silenceRisk),
    };
    const withTasks = {
      ...withSilence,
      trustRepairTasks:
        report.trustRepairTasks &&
        report.trustRepairTasks.length > 0 &&
        report.trustRepairTasks.every((task) => task.estimatedImpact?.length > 0)
          ? report.trustRepairTasks
          : generateTrustRepairTasks(withSilence),
    };
    const trustAuditLog =
      report.trustAuditLog && report.trustAuditLog.length > 0
        ? report.trustAuditLog
        : candidate && session
          ? generateTrustAuditLog(withTasks, session, candidate)
          : [];
    const auditCompletenessRate = report.auditCompletenessRate ?? calculateAuditCompleteness(trustAuditLog);
    const withGovernance = {
      ...withTasks,
      trustAuditLog,
      auditCompletenessRate,
      aiRiskReview: generateAIRiskReview({ ...withTasks, trustAuditLog, auditCompletenessRate }),
    };
    return {
      ...withGovernance,
      trustLoopGraph:
        report.trustLoopGraph && report.trustLoopGraph.length > 0
          ? report.trustLoopGraph
          : generateTrustLoopGraph(withGovernance),
      candidateFairnessIndex:
        report.candidateFairnessIndex && report.candidateFairnessIndex.total > 0
          ? report.candidateFairnessIndex
          : generateCandidateFairnessIndex(withGovernance),
    };
  });

  const trustAuditEvents =
    state.trustAuditEvents && state.trustAuditEvents.length > 0
      ? state.trustAuditEvents
      : realityReports.flatMap((report) => report.trustAuditLog);
  const trustRepairTasks =
    state.trustRepairTasks && state.trustRepairTasks.length > 0
      ? state.trustRepairTasks
      : realityReports.flatMap((report) => report.trustRepairTasks);
  const pendingTrustRepairTasks = trustRepairTasks.filter((task) => !task.handledAt).length;
  const handledTrustRepairTasks = trustRepairTasks.filter((task) => Boolean(task.handledAt)).length;
  const highSilenceRiskCandidates = realityReports.filter((report) => report.silenceRisk.possibleReasons.length >= 3).length;
  const auditCompletenessRate = realityReports.length
    ? Math.round(realityReports.reduce((sum, report) => sum + report.auditCompletenessRate, 0) / realityReports.length)
    : 0;
  const baseMetrics = {
    ...initial.metrics,
    ...(state.metrics ?? {}),
  };
  const totalTrustTasks = pendingTrustRepairTasks + handledTrustRepairTasks;
  const recruitingTrustHealth =
    calculateRecruitingTrustHealth({
      truthLabelViewRate: baseMetrics.visits > 0 ? Math.round(((baseMetrics.truthLabelViews ?? 0) / baseMetrics.visits) * 100) : 0,
      truthContractAcknowledgementRate:
        baseMetrics.applications > 0 ? Math.round(((baseMetrics.truthContractAcknowledgements ?? 0) / baseMetrics.applications) * 100) : 0,
      trialCompletionRate:
        (baseMetrics.trialStarts ?? 0) > 0
          ? Math.round(((baseMetrics.trialCompletions ?? 0) / Math.max(1, baseMetrics.trialStarts ?? 0)) * 100)
          : 0,
      trustRepairTaskHandledRate: totalTrustTasks > 0 ? Math.round((handledTrustRepairTasks / totalTrustTasks) * 100) : 0,
      aiRiskReviewPassRate:
        realityReports.length > 0 ? Math.round(((baseMetrics.aiRiskReviewPasses ?? 0) / realityReports.length) * 100) : 0,
      candidateFairnessIndex: baseMetrics.candidateFairnessIndex ?? 0,
      auditCompletenessRate,
    });

  return {
    company: state.company ?? initial.company,
    jobs,
    avatars: state.avatars ?? initial.avatars,
    realityRoles,
    realityScenes,
    jobTruthLabels,
    jobTruthContracts,
    branchScenarios,
    truthVideoScripts,
    trustAuditEvents,
    trustRepairTasks,
    trialSessions,
    realityReports,
    drafts: state.drafts ?? [],
    candidates: state.candidates ?? initial.candidates,
    conversations: state.conversations ?? initial.conversations,
    storyCards: state.storyCards ?? initial.storyCards,
    metrics: {
      ...baseMetrics,
      pendingTrustRepairTasks,
      handledTrustRepairTasks,
      highSilenceRiskCandidates,
      auditCompletenessRate,
      recruitingTrustHealth,
    },
    latestCandidateActivity: state.latestCandidateActivity ?? [],
    scoreOverrides: state.scoreOverrides ?? [],
  };
}

export function getDemoState(): DemoState {
  if (!hasBrowserStorage()) {
    return createInitialState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = createInitialState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return normalizeDemoState(JSON.parse(raw) as Partial<DemoState>);
  } catch {
    const initial = createInitialState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

export function saveDemoState(state: DemoState) {
  if (!hasBrowserStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(STORE_EVENT));
}

export function updateDemoState(updater: (state: DemoState) => DemoState) {
  const nextState = updater(getDemoState());
  saveDemoState(nextState);
  return nextState;
}

export function saveInboxSimResult(jobId: string, result: unknown) {
  const key = `zhiyu-inbox-result-${jobId}`;
  localStorage.setItem(key, JSON.stringify(result));
  // Also persist to shared demo store so HR can access simulation results
  const state = getDemoState();
  // Store in metrics for HR dashboard aggregation
  const inboxResults = { ...(state.metrics as any).inboxSimResults ?? {} };
  inboxResults[jobId] = { result, savedAt: new Date().toISOString() };
  const updated = { ...state, metrics: { ...state.metrics, inboxSimResults } as any };
  saveDemoState(updated);
}

export function getInboxSimResult(jobId: string): unknown | null {
  // First check shared store
  const state = getDemoState();
  const storeResult = (state.metrics as any)?.inboxSimResults?.[jobId]?.result;
  if (storeResult) return storeResult;
  // Fallback to separate localStorage
  try { return JSON.parse(localStorage.getItem(`zhiyu-inbox-result-${jobId}`) || 'null'); } catch { return null; }
}

export function resetDemoState() {
  const initial = createInitialState();
  saveDemoState(initial);
  // Also clear IndexedDB-based chat history
  try { import('idb-keyval').then(({ del }) => del('reality-pro-chat-storage')).catch(() => {}); } catch {}
  return initial;
}

export function useDemoState() {
  const [state, setState] = useState<DemoState>(() => getDemoState());

  useEffect(() => {
    const sync = () => setState(getDemoState());
    window.addEventListener(STORE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(STORE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return state;
}

function addJobFromAnalysis(input: JobInput, analysis: JobAnalysis, sitParams?: import('../types').SituationalParams) {
  const job: Job = {
    ...input,
    id: createId('job'),
    companyId: getDemoState().company.id,
    status: 'published',
    createdAt: nowIso(),
    analysis,
    situationalParams: sitParams,
  };
  const avatar = buildDefaultAvatarConfig(job);
  const realityRoles = createDefaultRealityRoles(job.id);
  const realityScenes = generateRealityScripts(job);
  const jobTruthLabel = generateJobTruthLabel(job);
  const jobTruthContract = generateJobTruthContract(job, jobTruthLabel);
  const branchScenarios = getBranchScenarios(job);
  const truthVideoScript = generateTruthVideoScript(job, realityRoles, realityScenes);

  updateDemoState((state) => ({
    ...state,
    jobs: [job, ...state.jobs],
    avatars: [avatar, ...state.avatars],
    realityRoles: [...realityRoles, ...state.realityRoles.filter((role) => role.jobId !== job.id)],
    realityScenes: [...realityScenes, ...state.realityScenes.filter((scene) => scene.jobId !== job.id)],
    jobTruthLabels: [jobTruthLabel, ...state.jobTruthLabels.filter((label) => label.jobId !== job.id)],
    jobTruthContracts: [jobTruthContract, ...state.jobTruthContracts.filter((contract) => contract.jobId !== job.id)],
    branchScenarios: [...branchScenarios, ...state.branchScenarios.filter((scenario) => scenario.jobId !== job.id)],
    truthVideoScripts: [truthVideoScript, ...state.truthVideoScripts.filter((script) => script.jobId !== job.id)],
  }));

  return job;
}

export function addJob(input: JobInput) {
  return addJobFromAnalysis(input, parseJobDescription(input));
}

export async function addJobWithAi(input: JobInput, sitParams?: import('../types').SituationalParams): Promise<{ job: Job; ai: AiResult<AiJobAnalysisResponse> }> {
  const ai = await aiProvider.analyzeJob<AiJobAnalysisResponse>({
    title: input.title,
    jdText: [input.responsibilities, input.requirements, input.challenges].filter(Boolean).join('\n'),
    salaryRange: `${input.salaryMin}k-${input.salaryMax}k`,
    location: input.location,
    workMode: input.workload,
    teamInfo: input.teamInfo,
    interviewProcess: input.interviewProcess,
  });
  const job = addJobFromAnalysis(input, adaptAiJobAnalysis(ai.data), sitParams);

  // Phase 1: 尝试 AI 生成专属分岔场景，失败则保留静态场景
  aiProvider.generateScenario<{ scenarios: unknown }>({
    jobTitle: input.title,
    jobContext: [input.responsibilities, input.requirements, input.challenges, input.teamInfo, input.workload].join('\n'),
    coreCompetencies: job.analysis.hardSkills,
  }).then((scenarioResult) => {
    if (scenarioResult.data && scenarioResult.data.scenarios && !scenarioResult.fallback) {
      // AI 成功生成了专属场景 → 替换静态场景
      const validated = (scenarioResult.data as { scenarios: unknown[] }).scenarios;
      if (Array.isArray(validated) && validated.length > 0) {
        const adapted = validated.map((s: Record<string, unknown>, i: number) => ({
          id: `ai_branch_${job.id}_${i}`,
          jobId: job.id,
          round: (i + 1) as 1 | 2 | 3,
          title: (s.title as string) || `第${i + 1}轮`,
          description: (s.description as string) || '',
          choices: (Array.isArray(s.choices) ? s.choices.map((c: Record<string, unknown>, ci: number) => ({
            id: `ai_choice_${job.id}_${i}_${ci}`,
            label: (['A', 'B', 'C', 'D'][ci] ?? 'A') as 'A' | 'B' | 'C' | 'D',
            text: (c.text as string) || '',
            nextScenarioId: i < 2 ? `ai_branch_${job.id}_${i + 1}` : undefined,
            analysis: {
              collaboration: (c.analysis?.collaboration as string) || '待确认',
              riskAwareness: ((c.analysis?.riskAwareness as string) || '中') as '高' | '中' | '低',
              communication: ((c.analysis?.communication as string) || '中') as '高' | '中' | '低',
              technicalJudgment: ((c.analysis?.technicalJudgment as string) || '待确认') as '强' | '待确认' | '偏弱',
              executionStyle: (c.analysis?.executionStyle as string) || '',
            },
          })) : []),
        }));
        updateDemoState((current) => ({
          ...current,
          branchScenarios: [...adapted, ...current.branchScenarios.filter((sc) => sc.jobId !== job.id)],
        }));
      }
    }
  }).catch((err) => {
    console.warn('[Phase 1] AI scenario generation failed, keeping static scenarios:', err);
  });

  return { job, ai };
}

export function createRealityCabin(jobId: string) {
  updateDemoState((state) => {
    const job = state.jobs.find((item) => item.id === jobId);
    if (!job) return state;
    const roles = createDefaultRealityRoles(job.id);
    const scenes = generateRealityScripts(job);
    const truthLabel = generateJobTruthLabel(job);
    const truthContract = generateJobTruthContract(job, truthLabel);
    const branchScenarios = getBranchScenarios(job);
    const truthVideoScript = generateTruthVideoScript(job, roles, scenes);
    return {
      ...state,
      realityRoles: [...roles, ...state.realityRoles.filter((role) => role.jobId !== job.id)],
      realityScenes: [...scenes, ...state.realityScenes.filter((scene) => scene.jobId !== job.id)],
      jobTruthLabels: [truthLabel, ...state.jobTruthLabels.filter((label) => label.jobId !== job.id)],
      jobTruthContracts: [truthContract, ...state.jobTruthContracts.filter((contract) => contract.jobId !== job.id)],
      branchScenarios: [...branchScenarios, ...state.branchScenarios.filter((scenario) => scenario.jobId !== job.id)],
      truthVideoScripts: [truthVideoScript, ...state.truthVideoScripts.filter((script) => script.jobId !== job.id)],
    };
  });
}

export function updateAvatar(jobId: string, patch: Partial<AvatarConfig>) {
  updateDemoState((state) => ({
    ...state,
    avatars: state.avatars.map((avatar) => (avatar.jobId === jobId ? { ...avatar, ...patch } : avatar)),
  }));
}

export function updateRealityRole(roleId: string, patch: Partial<RealityRole>) {
  updateDemoState((state) => ({
    ...state,
    realityRoles: state.realityRoles.map((role) => (role.id === roleId ? { ...role, ...patch } : role)),
  }));
}

export function startTrialSession(jobId: string, directApply = false) {
  const state = getDemoState();
  const job = state.jobs.find((item) => item.id === jobId);
  if (!job) throw new Error('Job not found');
  const scenes = state.realityScenes.filter((scene) => scene.jobId === jobId);
  const firstScene = scenes[0] ?? generateRealityScripts(job)[0];
  const session: TrialSession = {
    id: createId('trial'),
    jobId,
    currentSceneId: firstScene.id,
    completedSceneIds: [],
    askedTopics: [],
    selectedChoiceIds: [],
    branchChoiceIds: [],
    viewedTruthPoints: [],
    focusedTruthPoints: [],
    reverseQuestions: [],
    truthContractAcknowledgement: emptyTruthContractAcknowledgement(),
    mutualConfirmation: emptyMutualConfirmation(),
    trialEvents: [
      createTrialEvent(directApply ? 'direct_apply' : 'trial_started', directApply ? '候选人选择直接投递' : '进入岗位真相舱'),
    ],
    directApply,
    startedAt: nowIso(),
    completionRate: 0,
  };

  updateDemoState((current) => ({
    ...current,
    trialSessions: [session, ...current.trialSessions],
    metrics: {
      ...current.metrics,
      trialStarts: (current.metrics.trialStarts ?? current.metrics.chatStarts) + (directApply ? 0 : 1),
    },
  }));

  return session;
}

export function completeRealityScene(sessionId: string, sceneId: string) {
  updateDemoState((state) => ({
    ...state,
    trialSessions: state.trialSessions.map((session) => {
      if (session.id !== sessionId) return session;
      const sceneCount = Math.max(1, state.realityScenes.filter((scene) => scene.jobId === session.jobId).length);
      const completedSceneIds = Array.from(new Set([...session.completedSceneIds, sceneId]));
      return {
        ...session,
        currentSceneId: sceneId,
        completedSceneIds,
        trialEvents: [
          ...session.trialEvents,
          createTrialEvent('scene_completed', `完成云试岗场景：${sceneId}`, { sceneId }),
        ],
        completionRate: Math.min(100, Math.round((completedSceneIds.length / sceneCount) * 100)),
      };
    }),
  }));
}

export function recordAskedTopic(sessionId: string, topic: string) {
  updateDemoState((state) => ({
    ...state,
    trialSessions: state.trialSessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            askedTopics: Array.from(new Set([...session.askedTopics, topic])),
          }
        : session,
    ),
  }));
}

export function selectScenarioChoice(sessionId: string, choiceId: string) {
  updateDemoState((state) => ({
    ...state,
    trialSessions: state.trialSessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            selectedChoiceIds: Array.from(new Set([...session.selectedChoiceIds, choiceId])),
          }
        : session,
    ),
  }));
}

export function recordTruthPoint(sessionId: string, point: string, focused = false) {
  updateDemoState((state) => ({
    ...state,
    trialSessions: state.trialSessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            viewedTruthPoints: Array.from(new Set([...session.viewedTruthPoints, point])),
            focusedTruthPoints: focused
              ? Array.from(new Set([...session.focusedTruthPoints, point]))
              : session.focusedTruthPoints,
            trialEvents: [
              ...session.trialEvents,
              createTrialEvent(focused ? 'truth_point_focused' : 'truth_label_viewed', `${focused ? '重点查看' : '查看岗位真相'}：${point}`, {
                point,
              }),
            ],
          }
        : session,
    ),
    metrics: {
      ...state.metrics,
      truthLabelViews: (state.metrics.truthLabelViews ?? 0) + 1,
    },
  }));
}

export function acknowledgeTruthContract(sessionId: string, acknowledgedItems: string[], unresolvedConcerns: string[] = []) {
  updateDemoState((state) => ({
    ...state,
    trialSessions: state.trialSessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            truthContractAcknowledgement: {
              acknowledged: acknowledgedItems.length > 0,
              acknowledgedItems,
              unresolvedConcerns,
              acknowledgedAt: nowIso(),
            },
            trialEvents: [
              ...session.trialEvents,
              createTrialEvent(
                acknowledgedItems.length > 0 ? 'truth_contract_acknowledged' : 'truth_contract_concern_added',
                acknowledgedItems.length > 0 ? '确认岗位真相合约' : '留下岗位真相合约疑问',
                {
                  acknowledgedCount: acknowledgedItems.length,
                  unresolvedCount: unresolvedConcerns.length,
                },
              ),
            ],
          }
        : session,
    ),
    metrics: {
      ...state.metrics,
      truthContractAcknowledgements:
        acknowledgedItems.length > 0
          ? (state.metrics.truthContractAcknowledgements ?? 0) + 1
          : (state.metrics.truthContractAcknowledgements ?? 0),
    },
  }));
}

export function selectBranchChoice(sessionId: string, choiceId: string) {
  updateDemoState((state) => ({
    ...state,
    trialSessions: state.trialSessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            branchChoiceIds: Array.from(new Set([...session.branchChoiceIds, choiceId])),
            trialEvents: [
              ...session.trialEvents,
              createTrialEvent('branch_choice_selected', `完成分岔任务选择：${choiceId}`, { choiceId }),
            ],
          }
        : session,
    ),
  }));
}

export function askReverseQuestion(sessionId: string, type: ReverseQuestionType) {
  const state = getDemoState();
  const session = state.trialSessions.find((item) => item.id === sessionId);
  if (!session) return undefined;
  const job = state.jobs.find((item) => item.id === session.jobId);
  if (!job) return undefined;
  const truthLabel = state.jobTruthLabels.find((item) => item.jobId === job.id) ?? generateJobTruthLabel(job);
  const reverseQuestion = answerReverseQuestion(job, truthLabel, type);

  updateDemoState((current) => ({
    ...current,
    trialSessions: current.trialSessions.map((item) =>
      item.id === sessionId
        ? {
            ...item,
            reverseQuestions: [...item.reverseQuestions, reverseQuestion],
            askedTopics: Array.from(new Set([...item.askedTopics, type])),
            trialEvents: [
              ...item.trialEvents,
              createTrialEvent('reverse_question_asked', `反向提问：${type}`, { questionType: type }),
            ],
          }
        : item,
    ),
  }));

  return reverseQuestion;
}

export function recordCandidateExitReason(sessionId: string, reason: CandidateExitReason) {
  updateDemoState((state) => {
    const nextTopReasons = Array.from(new Set([reason, ...(state.metrics.candidateExitReasonTop3 ?? [])])).slice(0, 3);

    return {
      ...state,
      trialSessions: state.trialSessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              exitReason: reason,
              trialEvents: [
                ...session.trialEvents,
                createTrialEvent('candidate_exit_reason', `候选人暂不继续：${reason}`, { reason }),
              ],
            }
          : session,
      ),
      metrics: {
        ...state.metrics,
        trialDropOffs: (state.metrics.trialDropOffs ?? 0) + 1,
        candidateExitReasonTop3: nextTopReasons,
      },
    };
  });
}

export function addCandidateActivity(candidateName: string, action: string) {
  updateDemoState((state) => ({
    ...state,
    latestCandidateActivity: [
      { candidateName, action, time: nowIso() },
      ...(state.latestCandidateActivity ?? []),
    ].slice(0, 5),
  }));
}

export function saveConversationDraft(jobId: string, messages: ConversationMessage[]) {
  const draft: ConversationDraft = {
    id: createId('draft'),
    jobId,
    messages,
    updatedAt: nowIso(),
  };

  updateDemoState((state) => ({
    ...state,
    drafts: [draft, ...state.drafts.filter((item) => item.jobId !== jobId)],
    metrics: {
      ...state.metrics,
      chatStarts: state.metrics.chatStarts + 1,
      chatCompletions: state.metrics.chatCompletions + 1,
    },
  }));

  return draft;
}

export function createMessage(role: ConversationMessage['role'], text: string): ConversationMessage {
  return {
    id: createId('msg'),
    role,
    text,
    intent: role === 'candidate' ? detectIntent(text) : 'AI回复',
    createdAt: nowIso(),
  };
}

export function submitCandidateApplication(
  jobId: string,
  profile: CandidateProfileInput,
  draftId?: string,
  trialSessionId?: string,
) {
  const state = getDemoState();
  const job = state.jobs.find((item) => item.id === jobId);
  if (!job) throw new Error('Job not found');

  const draft = state.drafts.find((item) => item.id === draftId);
  const existingSession = state.trialSessions.find((item) => item.id === trialSessionId);
  const candidateId = createId('candidate');
  const conversationId = createId('conversation');
  const messages =
    draft?.messages.length
      ? draft.messages
      : [
          createMessage(
            'candidate',
            '我选择直接投递，后续愿意和HR进一步沟通岗位职责、团队情况和面试安排。',
          ),
        ];

  const candidate: Candidate = {
    ...profile,
    id: candidateId,
    jobId,
    conversationId,
    status: '已投递',
    submittedAt: nowIso(),
  };

  const conversation: Conversation = {
    id: conversationId,
    candidateId,
    jobId,
    messages,
    startedAt: messages[0]?.createdAt ?? nowIso(),
    endedAt: nowIso(),
    durationSeconds: Math.max(90, messages.length * 55),
    status: draft ? 'completed' : 'direct_apply',
  };
  const storyCard = generateHRStoryCard(candidate, job, conversation);
  const scenes = state.realityScenes.filter((scene) => scene.jobId === jobId);
  const fallbackSession: TrialSession = {
    id: trialSessionId ?? createId('trial'),
    jobId,
    candidateId,
    currentSceneId: scenes.at(-1)?.id ?? '',
    completedSceneIds: existingSession?.completedSceneIds.length ? existingSession.completedSceneIds : [],
    askedTopics: existingSession?.askedTopics ?? [],
    selectedChoiceIds: existingSession?.selectedChoiceIds ?? [],
    branchChoiceIds: existingSession?.branchChoiceIds ?? [],
    viewedTruthPoints: existingSession?.viewedTruthPoints ?? [],
    focusedTruthPoints: existingSession?.focusedTruthPoints ?? [],
    reverseQuestions: existingSession?.reverseQuestions ?? [],
    truthContractAcknowledgement: existingSession?.truthContractAcknowledgement ?? emptyTruthContractAcknowledgement(),
    mutualConfirmation: existingSession?.mutualConfirmation ?? emptyMutualConfirmation(),
    trialEvents: existingSession?.trialEvents ?? [
      createTrialEvent(!existingSession ? 'direct_apply' : 'trial_started', !existingSession ? '候选人选择直接投递' : '进入岗位真相舱'),
    ],
    exitReason: existingSession?.exitReason,
    directApply: !existingSession,
    startedAt: existingSession?.startedAt ?? nowIso(),
    completedAt: nowIso(),
    completionRate: existingSession?.completionRate ?? (existingSession ? 100 : 0),
  };
  const completedSession: TrialSession = {
    ...fallbackSession,
    candidateId,
    completedAt: nowIso(),
    trialEvents: [
      ...fallbackSession.trialEvents,
      createTrialEvent('profile_submitted', '补充云试岗资料', { candidateId }),
    ],
    mutualConfirmation:
      fallbackSession.mutualConfirmation.candidateConfirmedItems.length > 0
        ? fallbackSession.mutualConfirmation
        : {
            candidateConfirmedItems: ['我已了解岗位节奏', '我已了解面试流程', '我已了解薪资沟通节点', '我仍愿意继续面试'],
            unresolvedReasons: fallbackSession.truthContractAcknowledgement.unresolvedConcerns,
            hrCommitments: emptyMutualConfirmation().hrCommitments,
            confirmedAt: nowIso(),
          },
    completionRate:
      fallbackSession.completionRate > 0
        ? fallbackSession.completionRate
        : Math.round((fallbackSession.completedSceneIds.length / Math.max(1, scenes.length)) * 100),
  };
  const selectedChoices = getScenarioChoices().filter((choice) => completedSession.selectedChoiceIds.includes(choice.id));
  const branchChoices = state.branchScenarios
    .filter((scenario) => scenario.jobId === jobId)
    .flatMap((scenario) => scenario.choices)
    .filter((choice) => completedSession.branchChoiceIds.includes(choice.id));
  const truthLabel = state.jobTruthLabels.find((label) => label.jobId === jobId) ?? generateJobTruthLabel(job);
  const realityReport = generateRealityReport(candidate, job, completedSession, selectedChoices, branchChoices, truthLabel);

  updateDemoState((current) => ({
    ...current,
    candidates: [candidate, ...current.candidates],
    conversations: [conversation, ...current.conversations],
    storyCards: [storyCard, ...current.storyCards],
    trialSessions: [
      completedSession,
      ...current.trialSessions.filter((session) => session.id !== completedSession.id),
    ],
    realityReports: [
      realityReport,
      ...current.realityReports.filter((report) => report.candidateId !== candidate.id),
    ],
    trustAuditEvents: [
      ...realityReport.trustAuditLog,
      ...current.trustAuditEvents.filter((event) => event.candidateId !== candidate.id),
    ],
    trustRepairTasks: [
      ...realityReport.trustRepairTasks,
      ...current.trustRepairTasks.filter((task) => task.candidateId !== candidate.id),
    ],
    drafts: current.drafts.filter((item) => item.id !== draftId),
    metrics: {
      ...current.metrics,
      visits: current.metrics.visits + 1,
      applications: current.metrics.applications + 1,
      trialCompletions:
        completedSession.completionRate >= 80
          ? (current.metrics.trialCompletions ?? current.metrics.chatCompletions) + 1
          : (current.metrics.trialCompletions ?? current.metrics.chatCompletions),
      trialDropOffs:
        completedSession.completionRate < 80
          ? (current.metrics.trialDropOffs ?? 0) + 1
          : (current.metrics.trialDropOffs ?? 0),
      misunderstandingCandidates:
        realityReport.jobUnderstanding === '存在偏差'
          ? (current.metrics.misunderstandingCandidates ?? 0) + 1
          : (current.metrics.misunderstandingCandidates ?? 0),
      savedInterviewEstimate: (current.metrics.savedInterviewEstimate ?? 0) + (realityReport.noShowRisk === '高' ? 1 : 0),
      savedHrHoursEstimate: Math.round(((current.metrics.savedHrHoursEstimate ?? 0) + 0.35) * 10) / 10,
      highIntentCandidates:
        realityReport.realIntention === '高'
          ? current.metrics.highIntentCandidates + 1
          : current.metrics.highIntentCandidates,
      branchTrialCompletions:
        completedSession.branchChoiceIds.length >= 3
          ? (current.metrics.branchTrialCompletions ?? 0) + 1
          : (current.metrics.branchTrialCompletions ?? 0),
      highConcernCandidates:
        Object.values(realityReport.concernRadar).some((value) => value >= 75)
          ? (current.metrics.highConcernCandidates ?? 0) + 1
          : (current.metrics.highConcernCandidates ?? 0),
      preInviteSuggestionCoverage: (current.metrics.preInviteSuggestionCoverage ?? 0) + 1,
      invitationScriptsGenerated: (current.metrics.invitationScriptsGenerated ?? 0) + 1,
      battleCardsGenerated: (current.metrics.battleCardsGenerated ?? 0) + 1,
      averageTrustIndex: Math.round(
        (((current.metrics.averageTrustIndex ?? realityReport.candidateTrustIndex.total) * Math.max(1, current.realityReports.length)) +
          realityReport.candidateTrustIndex.total) /
          Math.max(1, current.realityReports.length + 1),
      ),
      highTrustCandidateRatio:
        realityReport.candidateTrustIndex.total >= 75
          ? Math.min(100, (current.metrics.highTrustCandidateRatio ?? 0) + 5)
          : current.metrics.highTrustCandidateRatio ?? 0,
      truthContractAcknowledgements:
        completedSession.truthContractAcknowledgement.acknowledged
          ? (current.metrics.truthContractAcknowledgements ?? 0) + 1
          : (current.metrics.truthContractAcknowledgements ?? 0),
      aiRiskReviewPasses:
        realityReport.aiRiskReview.result === '复核通过'
          ? (current.metrics.aiRiskReviewPasses ?? 0) + 1
          : (current.metrics.aiRiskReviewPasses ?? 0),
      lowTrustReasonTop3: realityReport.candidateTrustIndex.gapReasons.slice(0, 3),
      mutualConfirmations:
        realityReport.mutualConfirmation.candidateConfirmedItems.length >= 3
          ? (current.metrics.mutualConfirmations ?? 0) + 1
          : (current.metrics.mutualConfirmations ?? 0),
      highConfirmationCandidateRatio:
        realityReport.mutualConfirmation.unresolvedReasons.length === 0
          ? Math.min(100, (current.metrics.highConfirmationCandidateRatio ?? 0) + 5)
          : current.metrics.highConfirmationCandidateRatio ?? 0,
      unconfirmedReasonTop3: realityReport.mutualConfirmation.unresolvedReasons.slice(0, 3),
      candidateFairnessIndex: realityReport.candidateFairnessIndex.total,
      commitmentConsistencyIssues:
        realityReport.commitmentConsistencyCheck.riskLevel !== '低'
          ? (current.metrics.commitmentConsistencyIssues ?? 0) + 1
          : (current.metrics.commitmentConsistencyIssues ?? 0),
      evidenceSupportedAdviceCount:
        (current.metrics.evidenceSupportedAdviceCount ?? 0) + realityReport.aiAdviceRelianceNotice.evidenceSupportedCount,
      humanConfirmationAdviceCount:
        (current.metrics.humanConfirmationAdviceCount ?? 0) +
        realityReport.aiAdviceRelianceNotice.needsHumanConfirmationCount,
      candidateExitReasonTop3: completedSession.exitReason
        ? Array.from(new Set([completedSession.exitReason, ...(current.metrics.candidateExitReasonTop3 ?? [])])).slice(0, 3)
        : current.metrics.candidateExitReasonTop3,
      pendingTrustRepairTasks: (current.metrics.pendingTrustRepairTasks ?? 0) + realityReport.trustRepairTasks.length,
      handledTrustRepairTasks: current.metrics.handledTrustRepairTasks ?? 0,
      highSilenceRiskCandidates:
        realityReport.silenceRisk.possibleReasons.length >= 3
          ? (current.metrics.highSilenceRiskCandidates ?? 0) + 1
          : current.metrics.highSilenceRiskCandidates ?? 0,
      auditCompletenessRate: Math.round(
        (((current.metrics.auditCompletenessRate ?? realityReport.auditCompletenessRate) * Math.max(1, current.realityReports.length)) +
          realityReport.auditCompletenessRate) /
          Math.max(1, current.realityReports.length + 1),
      ),
    },
  }));

  return candidate;
}

export async function submitCandidateApplicationWithAi(
  jobId: string,
  profile: CandidateProfileInput,
  draftId?: string,
  trialSessionId?: string,
): Promise<{ candidate: Candidate; ai: AiResult<AiHrReportResponse> }> {
  const candidate = submitCandidateApplication(jobId, profile, draftId, trialSessionId);
  const state = getDemoState();
  const job = state.jobs.find((item) => item.id === jobId);
  const baseReport = state.realityReports.find((report) => report.candidateId === candidate.id);
  const session = state.trialSessions.find((item) => item.candidateId === candidate.id);

  if (!job || !baseReport || !session) {
    const ai = await aiProvider.generateHrReport<AiHrReportResponse>({});
    return { candidate, ai };
  }

  const truthLabel = state.jobTruthLabels.find((item) => item.jobId === jobId);
  const branchChoices = state.branchScenarios
    .filter((scenario) => scenario.jobId === jobId)
    .flatMap((scenario) => scenario.choices)
    .filter((choice) => session.branchChoiceIds.includes(choice.id));
  const ai = await aiProvider.generateHrReport<AiHrReportResponse>({
    jobTruthProfile: truthLabel ?? job.analysis,
    candidateQuestions: session.reverseQuestions.length
      ? session.reverseQuestions
      : session.askedTopics.map((topic) => ({ type: topic, question: topic })),
    sandboxEvents: branchChoices.length ? branchChoices : session.trialEvents,
    supplementProfile: profile,
  });

  const adaptedReport = adaptAiReportToRealityReport(baseReport, ai.data, aiResultToReportMeta(ai));
  updateDemoState((current) => ({
    ...current,
    realityReports: [
      adaptedReport,
      ...current.realityReports.filter((report) => report.candidateId !== candidate.id),
    ],
    trustRepairTasks: [
      ...adaptedReport.trustRepairTasks,
      ...current.trustRepairTasks.filter((task) => task.candidateId !== candidate.id),
    ],
  }));

  return { candidate, ai };
}

export function completeTrialSession(sessionId: string, candidateId: string) {
  const state = getDemoState();
  const candidate = state.candidates.find((item) => item.id === candidateId);
  if (!candidate) return undefined;
  const job = state.jobs.find((item) => item.id === candidate.jobId);
  const session = state.trialSessions.find((item) => item.id === sessionId);
  if (!job || !session) return undefined;
  const selectedChoices = getScenarioChoices().filter((choice) => session.selectedChoiceIds.includes(choice.id));
  const branchChoices = state.branchScenarios
    .filter((scenario) => scenario.jobId === job.id)
    .flatMap((scenario) => scenario.choices)
    .filter((choice) => session.branchChoiceIds.includes(choice.id));
  const truthLabel = state.jobTruthLabels.find((label) => label.jobId === job.id) ?? generateJobTruthLabel(job);
  const completedSession = {
    ...session,
    candidateId,
    completedAt: nowIso(),
    trialEvents: [
      ...session.trialEvents,
      createTrialEvent('profile_submitted', '补充云试岗资料', { candidateId }),
    ],
    mutualConfirmation:
      session.mutualConfirmation.candidateConfirmedItems.length > 0
        ? session.mutualConfirmation
        : {
            candidateConfirmedItems: ['我已了解岗位节奏', '我已了解面试流程', '我已了解薪资沟通节点', '我仍愿意继续面试'],
            unresolvedReasons: session.truthContractAcknowledgement.unresolvedConcerns,
            hrCommitments: emptyMutualConfirmation().hrCommitments,
            confirmedAt: nowIso(),
          },
    completionRate: session.completionRate || 100,
  };
  const report = generateRealityReport(candidate, job, completedSession, selectedChoices, branchChoices, truthLabel);

  updateDemoState((current) => ({
    ...current,
    trialSessions: current.trialSessions.map((item) => (item.id === sessionId ? completedSession : item)),
    realityReports: [report, ...current.realityReports.filter((item) => item.candidateId !== candidateId)],
    trustAuditEvents: [
      ...report.trustAuditLog,
      ...current.trustAuditEvents.filter((event) => event.candidateId !== candidateId),
    ],
    trustRepairTasks: [
      ...report.trustRepairTasks,
      ...current.trustRepairTasks.filter((task) => task.candidateId !== candidateId),
    ],
    metrics: {
      ...current.metrics,
      pendingTrustRepairTasks: (current.metrics.pendingTrustRepairTasks ?? 0) + report.trustRepairTasks.length,
      highSilenceRiskCandidates:
        report.silenceRisk.possibleReasons.length >= 3
          ? (current.metrics.highSilenceRiskCandidates ?? 0) + 1
          : current.metrics.highSilenceRiskCandidates ?? 0,
      auditCompletenessRate: report.auditCompletenessRate,
    },
  }));

  return report;
}

export function getRealityReport(candidateId: string) {
  return getDemoState().realityReports.find((report) => report.candidateId === candidateId);
}

export function markTrustRepairTaskHandled(taskId: string) {
  return updateDemoState((state) => {
    const handledAt = nowIso();
    const trustRepairTasks = state.trustRepairTasks.map((task) =>
      task.id === taskId ? { ...task, status: '已处理' as const, handledAt } : task,
    );
    const realityReports = state.realityReports.map((report) => ({
      ...report,
      trustRepairTasks: report.trustRepairTasks.map((task) =>
        task.id === taskId ? { ...task, status: '已处理' as const, handledAt } : task,
      ),
    }));

    return {
      ...state,
      trustRepairTasks,
      realityReports,
      metrics: {
        ...state.metrics,
        pendingTrustRepairTasks: trustRepairTasks.filter((task) => !task.handledAt).length,
        handledTrustRepairTasks: trustRepairTasks.filter((task) => Boolean(task.handledAt)).length,
      },
    };
  });
}

export function markReportReviewed(reportId: string) {
  return updateDemoState((state) => {
    const reviewedAt = nowIso();
    return {
      ...state,
      realityReports: state.realityReports.map((report) =>
        report.id === reportId
          ? {
              ...report,
              humanReviewStatus: 'reviewed' as const,
              reviewedAt,
            }
          : report,
      ),
    };
  });
}

export function inviteCandidate(candidateId: string) {
  updateDemoState((state) => {
    const candidate = state.candidates.find((item) => item.id === candidateId);
    const auditEvent = candidate
      ? {
          id: createId('audit'),
          candidateId,
          jobId: candidate.jobId,
          type: 'hr_invitation_sent' as const,
          actor: 'hr' as const,
          title: 'HR发出邀约',
          description: 'HR基于云试岗报告和人工复核发出面试邀约。',
          occurredAt: nowIso(),
          evidenceLevel: '充分' as const,
        }
      : undefined;

    return {
      ...state,
      candidates: state.candidates.map((item) =>
        item.id === candidateId ? { ...item, status: '已邀约' } : item,
      ),
      trustAuditEvents: auditEvent ? [auditEvent, ...state.trustAuditEvents] : state.trustAuditEvents,
      realityReports: state.realityReports.map((report) => {
        if (report.candidateId !== candidateId || !auditEvent) return report;
        const trustAuditLog = [...report.trustAuditLog, auditEvent];
        return {
          ...report,
          trustAuditLog,
          auditCompletenessRate: calculateAuditCompleteness(trustAuditLog),
        };
      }),
      metrics: {
        ...state.metrics,
        interviewInvites: state.metrics.interviewInvites + 1,
      },
    };
  });
}

export function legacyInviteCandidate(candidateId: string) {
  updateDemoState((state) => ({
    ...state,
    candidates: state.candidates.map((candidate) =>
      candidate.id === candidateId ? { ...candidate, status: '已邀约' } : candidate,
    ),
    metrics: {
      ...state.metrics,
      interviewInvites: state.metrics.interviewInvites + 1,
    },
  }));
}

export function addCandidateToTalentPool(candidateId: string) {
  updateDemoState((state) => ({
    ...state,
    candidates: state.candidates.map((candidate) =>
      candidate.id === candidateId ? { ...candidate, status: '已入库' } : candidate,
    ),
    metrics: {
      ...state.metrics,
      talentPoolAdds: (state.metrics.talentPoolAdds ?? 0) + 1,
    },
  }));
}

export function overrideScore(dimension: string, hrScore: number, annotation: string) {
  return updateDemoState((state) => {
    const totalTrustTasks =
      (state.metrics.pendingTrustRepairTasks ?? 0) + (state.metrics.handledTrustRepairTasks ?? 0);
    const truthLabelViewRate =
      state.metrics.visits > 0
        ? Math.round(((state.metrics.truthLabelViews ?? 0) / state.metrics.visits) * 100)
        : 0;
    const truthContractAcknowledgementRate =
      state.metrics.applications > 0
        ? Math.round(((state.metrics.truthContractAcknowledgements ?? 0) / state.metrics.applications) * 100)
        : 0;
    const trialCompletionRate =
      (state.metrics.trialStarts ?? 0) > 0
        ? Math.round(
            ((state.metrics.trialCompletions ?? 0) / Math.max(1, state.metrics.trialStarts ?? 0)) * 100,
          )
        : 0;
    const trustRepairTaskHandledRate =
      totalTrustTasks > 0
        ? Math.round(((state.metrics.handledTrustRepairTasks ?? 0) / totalTrustTasks) * 100)
        : 0;
    const aiRiskReviewPassRate =
      state.realityReports.length > 0
        ? Math.round(((state.metrics.aiRiskReviewPasses ?? 0) / state.realityReports.length) * 100)
        : 0;

    const dimScores: Record<string, number> = {
      truthLabelViewRate,
      truthContractAcknowledgementRate,
      trialCompletionRate,
      trustRepairTaskHandledRate,
      aiRiskReviewPassRate,
      candidateFairnessIndex: state.metrics.candidateFairnessIndex ?? 0,
      auditCompletenessRate: state.metrics.auditCompletenessRate ?? 0,
    };

    const aiScore = dimScores[dimension] ?? 0;
    const existing = state.scoreOverrides ?? [];
    const idx = existing.findIndex((o) => o.dimension === dimension);
    const newOverride = { dimension, aiScore, hrScore, annotation };

    return {
      ...state,
      scoreOverrides:
        idx >= 0
          ? [...existing.slice(0, idx), newOverride, ...existing.slice(idx + 1)]
          : [...existing, newOverride],
    };
  });
}

export function seedRealityDemoCase() {
  resetDemoState();
  return getDemoState();
}
