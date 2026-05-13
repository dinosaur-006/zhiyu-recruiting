import { useEffect, useState } from 'react';
import {
  buildDefaultAvatarConfig,
  answerReverseQuestion,
  createDefaultRealityRoles,
  detectIntent,
  generateJobTruthLabel,
  generateHRStoryCard,
  generateRealityReport,
  generateRealityScripts,
  generateTruthVideoScript,
  getBranchScenarios,
  getScenarioChoices,
  parseJobDescription,
} from '../mock/ai';
import { createInitialState } from '../mock/data';
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
  ReverseQuestionType,
  RealityRole,
  TrialSession,
} from '../types';

const STORAGE_KEY = 'zhiyu-demo-state-v1';
const STORE_EVENT = 'zhiyu-demo-store-updated';

const nowIso = () => new Date().toISOString();

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
  const existingBranchScenarios = state.branchScenarios ?? [];
  const existingTruthVideoScripts = state.truthVideoScripts ?? [];

  const realityScenes =
    existingScenes.length > 0 ? existingScenes : jobs.flatMap((job) => generateRealityScripts(job));
  const realityRoles =
    existingRoles.length > 0 ? existingRoles : jobs.flatMap((job) => createDefaultRealityRoles(job.id));
  const jobTruthLabels =
    existingTruthLabels.length > 0 ? existingTruthLabels : jobs.map((job) => generateJobTruthLabel(job));
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

  return {
    company: state.company ?? initial.company,
    jobs,
    avatars: state.avatars ?? initial.avatars,
    realityRoles,
    realityScenes,
    jobTruthLabels,
    branchScenarios,
    truthVideoScripts,
    trialSessions: (state.trialSessions ?? []).map((session) => ({
      ...session,
      branchChoiceIds: session.branchChoiceIds ?? [],
      viewedTruthPoints: session.viewedTruthPoints ?? [],
      focusedTruthPoints: session.focusedTruthPoints ?? [],
      reverseQuestions: session.reverseQuestions ?? [],
    })),
    realityReports: state.realityReports ?? initial.realityReports,
    drafts: state.drafts ?? [],
    candidates: state.candidates ?? initial.candidates,
    conversations: state.conversations ?? initial.conversations,
    storyCards: state.storyCards ?? initial.storyCards,
    metrics: {
      ...initial.metrics,
      ...(state.metrics ?? {}),
    },
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

export function resetDemoState() {
  const initial = createInitialState();
  saveDemoState(initial);
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

export function addJob(input: JobInput) {
  const job: Job = {
    ...input,
    id: createId('job'),
    companyId: getDemoState().company.id,
    status: 'published',
    createdAt: nowIso(),
    analysis: parseJobDescription(input),
  };
  const avatar = buildDefaultAvatarConfig(job);
  const realityRoles = createDefaultRealityRoles(job.id);
  const realityScenes = generateRealityScripts(job);
  const jobTruthLabel = generateJobTruthLabel(job);
  const branchScenarios = getBranchScenarios(job);
  const truthVideoScript = generateTruthVideoScript(job, realityRoles, realityScenes);

  updateDemoState((state) => ({
    ...state,
    jobs: [job, ...state.jobs],
    avatars: [avatar, ...state.avatars],
    realityRoles: [...realityRoles, ...state.realityRoles.filter((role) => role.jobId !== job.id)],
    realityScenes: [...realityScenes, ...state.realityScenes.filter((scene) => scene.jobId !== job.id)],
    jobTruthLabels: [jobTruthLabel, ...state.jobTruthLabels.filter((label) => label.jobId !== job.id)],
    branchScenarios: [...branchScenarios, ...state.branchScenarios.filter((scenario) => scenario.jobId !== job.id)],
    truthVideoScripts: [truthVideoScript, ...state.truthVideoScripts.filter((script) => script.jobId !== job.id)],
  }));

  return job;
}

export function createRealityCabin(jobId: string) {
  updateDemoState((state) => {
    const job = state.jobs.find((item) => item.id === jobId);
    if (!job) return state;
    const roles = createDefaultRealityRoles(job.id);
    const scenes = generateRealityScripts(job);
    const truthLabel = generateJobTruthLabel(job);
    const branchScenarios = getBranchScenarios(job);
    const truthVideoScript = generateTruthVideoScript(job, roles, scenes);
    return {
      ...state,
      realityRoles: [...roles, ...state.realityRoles.filter((role) => role.jobId !== job.id)],
      realityScenes: [...scenes, ...state.realityScenes.filter((scene) => scene.jobId !== job.id)],
      jobTruthLabels: [truthLabel, ...state.jobTruthLabels.filter((label) => label.jobId !== job.id)],
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
          }
        : session,
    ),
    metrics: {
      ...state.metrics,
      truthLabelViews: (state.metrics.truthLabelViews ?? 0) + 1,
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
          }
        : item,
    ),
  }));

  return reverseQuestion;
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
    directApply: !existingSession,
    startedAt: existingSession?.startedAt ?? nowIso(),
    completedAt: nowIso(),
    completionRate: existingSession?.completionRate ?? (existingSession ? 100 : 0),
  };
  const completedSession: TrialSession = {
    ...fallbackSession,
    candidateId,
    completedAt: nowIso(),
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
    },
  }));

  return candidate;
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
    completionRate: session.completionRate || 100,
  };
  const report = generateRealityReport(candidate, job, completedSession, selectedChoices, branchChoices, truthLabel);

  updateDemoState((current) => ({
    ...current,
    trialSessions: current.trialSessions.map((item) => (item.id === sessionId ? completedSession : item)),
    realityReports: [report, ...current.realityReports.filter((item) => item.candidateId !== candidateId)],
  }));

  return report;
}

export function getRealityReport(candidateId: string) {
  return getDemoState().realityReports.find((report) => report.candidateId === candidateId);
}

export function inviteCandidate(candidateId: string) {
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

export function seedRealityDemoCase() {
  resetDemoState();
  return getDemoState();
}
