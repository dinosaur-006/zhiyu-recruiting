import { useEffect, useState } from 'react';
import { buildDefaultAvatarConfig, detectIntent, generateHRStoryCard, parseJobDescription } from '../mock/ai';
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
    return JSON.parse(raw) as DemoState;
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

  updateDemoState((state) => ({
    ...state,
    jobs: [job, ...state.jobs],
    avatars: [avatar, ...state.avatars],
  }));

  return job;
}

export function updateAvatar(jobId: string, patch: Partial<AvatarConfig>) {
  updateDemoState((state) => ({
    ...state,
    avatars: state.avatars.map((avatar) => (avatar.jobId === jobId ? { ...avatar, ...patch } : avatar)),
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

export function submitCandidateApplication(jobId: string, profile: CandidateProfileInput, draftId?: string) {
  const state = getDemoState();
  const job = state.jobs.find((item) => item.id === jobId);
  if (!job) throw new Error('Job not found');

  const draft = state.drafts.find((item) => item.id === draftId);
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

  updateDemoState((current) => ({
    ...current,
    candidates: [candidate, ...current.candidates],
    conversations: [conversation, ...current.conversations],
    storyCards: [storyCard, ...current.storyCards],
    drafts: current.drafts.filter((item) => item.id !== draftId),
    metrics: {
      ...current.metrics,
      visits: current.metrics.visits + 1,
      applications: current.metrics.applications + 1,
      highIntentCandidates:
        storyCard.recommendation === '强推荐面试'
          ? current.metrics.highIntentCandidates + 1
          : current.metrics.highIntentCandidates,
    },
  }));

  return candidate;
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
