import { create } from 'zustand';
import type {
  SimulationMessage, SimulationAction, SimulationActionType, SimulationSession,
  SimulationResult, SimulationScenario, SimulationSSEEvent,
  ActionDistribution, ResponsePattern, CommunicationStyleProfile, UrgencyTier,
} from '../types';
import { getFollowUpForAction } from '../mock/workdaySimMock';

interface WorkdaySimState {
  session: SimulationSession | null;
  scenario: SimulationScenario | null;
  jobId: string | null;
  candidateId: string | null;
  messages: SimulationMessage[];
  readMessageIds: Set<string>;
  actions: SimulationAction[];
  actionByMessageId: Record<string, SimulationAction>;
  sessionStartReal: number | null;
  elapsedMs: number;
  remainingMs: number;
  timerIntervalId: ReturnType<typeof setInterval> | null;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  connectionError: string | null;
  ghostNudgeMessage: string | null;
  lastInteractionReal: number | null;
  ghostTimerId: ReturnType<typeof setTimeout> | null;
  actionCounts: ActionDistribution;
  result: SimulationResult | null;
  isGeneratingResult: boolean;
  selectedMessageId: string | null;
  showBriefing: boolean;
  showSummary: boolean;
  isPaused: boolean;
  deferredMessageIds: Set<string>;
  deferCountByMessageId: Record<string, number>;
  deferTimers: Record<string, ReturnType<typeof setTimeout>>;

  initSession: (params: { sessionId: string; jobId: string; candidateId: string; scenario: SimulationScenario }) => void;
  connect: () => void;
  disconnect: () => void;
  dispatchSSEEvent: (event: SimulationSSEEvent) => void;
  receiveMessage: (message: SimulationMessage) => void;
  performAction: (messageId: string, actionType: SimulationActionType, payload?: { content?: string; quickReplyTemplateId?: string; delegateTarget?: string; deferReason?: string }) => void;
  markRead: (messageId: string) => void;
  setSelectedMessage: (messageId: string | null) => void;
  startTimer: () => void;
  stopTimer: () => void;
  tick: () => void;
  showGhostNudge: (message: string) => void;
  dismissGhostNudge: () => void;
  resetGhostTimer: () => void;
  clearGhostTimer: () => void;
  completeSession: () => void;
  setPaused: (paused: boolean) => void;
  generateResult: () => Promise<void>;
  reset: () => void;
}

const initialActionCounts = (): ActionDistribution => ({ reply: 0, defer: 0, delegate: 0, ignore: 0, total: 0 });

function computeLocalResult(
  messages: SimulationMessage[], actions: SimulationAction[],
  session: SimulationSession, candidateId: string, jobId: string,
): SimulationResult {
  const actionByMsgId: Record<string, SimulationAction> = {};
  for (const a of actions) actionByMsgId[a.messageId] = a;

  const patterns: ResponsePattern[] = (['critical', 'high', 'medium', 'low'] as const).map((tier) => {
    const tierActions = messages.filter((m) => m.urgency === tier).map((m) => actionByMsgId[m.id]).filter(Boolean);
    const times = tierActions.map((a) => a.responseTimeMs).sort((a, b) => a - b);
    return {
      urgencyTier: tier, averageResponseMs: times.length > 0 ? times.reduce((s, t) => s + t, 0) / times.length : 0,
      medianResponseMs: times.length > 0 ? times[Math.floor(times.length / 2)] : 0,
      count: tierActions.length, benchmarkComparison: 'average' as const,
    };
  });

  const dist: ActionDistribution = { reply: 0, defer: 0, delegate: 0, ignore: 0, total: actions.length };
  for (const a of actions) dist[a.type]++;

  const missedCritical = messages.filter((m) => m.urgency === 'critical' && !m.handled).map((m) => m.id);
  const criticalActions = actions.filter((a) => messages.find((m) => m.id === a.messageId)?.urgency === 'critical');
  const nonCriticalActions = actions.filter((a) => messages.find((m) => m.id === a.messageId)?.urgency !== 'critical');
  const avgCritical = criticalActions.length > 0 ? criticalActions.reduce((s, a) => s + a.responseTimeMs, 0) / criticalActions.length : 0;
  const avgNonCritical = nonCriticalActions.length > 0 ? nonCriticalActions.reduce((s, a) => s + a.responseTimeMs, 0) / nonCriticalActions.length : 0;
  const prioScore = criticalActions.length > 0 && nonCriticalActions.length > 0
    ? Math.max(0, Math.min(100, Math.round((1 - avgCritical / Math.max(avgNonCritical, 1)) * 100))) : 50;

  const replyRate = dist.total > 0 ? dist.reply / dist.total : 0;
  const ignoreRate = dist.total > 0 ? dist.ignore / dist.total : 0;
  const delegationRate = dist.total > 0 ? dist.delegate / dist.total : 0;

  // Factor in AI reply evaluations if available
  const replyEvals = actions.filter((a) => a.type === 'reply' && a.replyEvaluation);
  const avgReplyEvalScore = replyEvals.length > 0
    ? replyEvals.reduce((s, a) => s + (a.replyEvaluation!.overallScore || 0), 0) / replyEvals.length
    : null;

  const commScore = avgReplyEvalScore != null
    ? Math.round(avgReplyEvalScore * 0.6 + Math.min(40, replyRate * 40))
    : Math.round(50 + replyRate * 40);

  return {
    sessionId: session.id, candidateId, jobId,
    competencyScores: [
      { competency: 'prioritization', score: prioScore, evidence: missedCritical, interpretation: prioScore >= 70 ? '强' : prioScore >= 40 ? '中' : '弱' },
      { competency: 'communication', score: commScore, evidence: replyEvals.map((a) => `回复质量: ${a.replyEvaluation!.overallScore}/100`), interpretation: commScore >= 70 ? '强' : commScore >= 40 ? '中' : '弱' },
      { competency: 'stakeholder_management', score: Math.round(60 + delegationRate * 30 - ignoreRate * 20), evidence: [], interpretation: delegationRate >= 0.3 ? '强' : delegationRate >= 0.1 ? '中' : '弱' },
      { competency: 'emotional_regulation', score: 60, evidence: [], interpretation: '中' },
      { competency: 'task_management', score: Math.round(50 + delegationRate * 40), evidence: [], interpretation: delegationRate >= 0.2 ? '强' : delegationRate >= 0.1 ? '中' : '弱' },
    ],
    responsePatterns: patterns,
    communicationStyle: { dominantTone: replyRate >= 0.7 ? 'assertive' : replyRate >= 0.4 ? 'collaborative' : 'neutral', averageReplyLength: 0, usesTemplates: false, templateUsageRate: 0, escalationAwareness: prioScore >= 70 ? '高' : '中', boundarySetting: ignoreRate <= 0.1 ? '中' : '低', crossTeamCollaboration: delegationRate >= 0.2 ? '高' : '中' },
    actionDistribution: dist,
    strengths: avgReplyEvalScore != null && avgReplyEvalScore >= 70 ? ['回复质量获得了AI评估的高分', ...(replyRate >= 0.5 ? ['对关键消息响应及时'] : [])] : replyRate >= 0.5 ? ['积极回复了大部分消息', '对关键消息响应及时'] : ['合理使用了转交和延迟来管理负载'],
    improvementAreas: ignoreRate >= 0.2 ? ['有较多消息被忽略'] : [],
    narrativeSummary: `在${messages.length}条消息中，回复了${dist.reply}条，转交了${dist.delegate}条，延迟处理${dist.defer}条，忽略${dist.ignore}条。${avgReplyEvalScore != null ? `AI评估的回复质量平均分为${Math.round(avgReplyEvalScore)}/100。` : ''}${prioScore >= 70 ? '展现了良好的优先级判断力。' : '优先级判断还有提升空间。'}本地计算结果，完整AI分析将在服务可用后补充。`,
    missedCriticalMessages: missedCritical, prioritizationScore: prioScore,
  };
}

export const useWorkdaySimStore = create<WorkdaySimState>((set, get) => ({
  session: null, scenario: null, jobId: null, candidateId: null,
  messages: [], readMessageIds: new Set(), actions: [], actionByMessageId: {},
  sessionStartReal: null, elapsedMs: 0, remainingMs: 0, timerIntervalId: null,
  connectionState: 'disconnected', connectionError: null,
  ghostNudgeMessage: null, lastInteractionReal: null, ghostTimerId: null,
  actionCounts: initialActionCounts(), result: null, isGeneratingResult: false,
  selectedMessageId: null, showBriefing: true, showSummary: false, isPaused: false,
  deferredMessageIds: new Set(), deferCountByMessageId: {}, deferTimers: {},

  initSession: ({ sessionId, jobId, candidateId, scenario }) => {
    const session: SimulationSession = {
      id: sessionId, jobId, candidateId, scenarioId: scenario.id,
      messages: [], actions: [], startTime: new Date().toISOString(),
      status: 'waiting', actualDurationMs: 0, completionRate: 0, connectionState: 'disconnected',
    };
    set({
      session, scenario, jobId, candidateId, messages: [], actions: [], actionByMessageId: {},
      readMessageIds: new Set(), actionCounts: initialActionCounts(), result: null,
      showBriefing: true, showSummary: false, selectedMessageId: null,
      elapsedMs: 0, remainingMs: scenario.maxDurationMs, connectionState: 'disconnected',
      connectionError: null, ghostNudgeMessage: null,
    });
  },

  connect: () => {
    const { session, jobId, candidateId, scenario } = get();
    if (!session || !scenario) return;
    set({ connectionState: 'connecting', connectionError: null });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    fetch('/api/ai/workday-sim/stream', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id, jobId, candidateId, scenarioId: scenario.id, messages: scenario.messageScript, ambientEvents: scenario.ambientEvents }),
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok || !response.body) throw new Error(`SSE connection failed: ${response.status}`);
      set({ connectionState: 'connected' });
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.replace('data: ', '');
          if (dataStr === '[DONE]') { get().completeSession(); return; }
          try { get().dispatchSSEEvent(JSON.parse(dataStr)); } catch { /* skip */ }
        }
      }
    }).catch((err) => {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        console.warn('[WorkdaySim SSE] Connection timed out, falling back to local playback');
      } else {
        console.warn('[WorkdaySim SSE]', err);
      }
      set({ connectionState: 'error', connectionError: err.message });
      const { scenario: s } = get();
      if (s) startLocalPlayback(s);
    });
  },

  disconnect: () => { get().stopTimer(); get().clearGhostTimer(); set({ connectionState: 'disconnected' }); },

  dispatchSSEEvent: (event) => {
    switch (event.type) {
      case 'session_start':
        set((s) => ({ session: s.session ? { ...s.session, status: 'running', connectionState: 'connected' } : null, showBriefing: false, sessionStartReal: Date.now() }));
        get().startTimer(); get().resetGhostTimer(); break;
      case 'message_arrive': get().receiveMessage(event.message); break;
      case 'urgency_escalate':
        set((s) => {
          const { [event.messageId]: _, ...rest } = s.actionByMessageId;
          return { messages: s.messages.map((m) => m.id === event.messageId ? { ...m, urgency: event.newUrgency, handled: false } : m), actionByMessageId: rest };
        }); break;
      case 'ghost_nudge': get().showGhostNudge(event.message); break;
      case 'session_timeout':
      case 'session_complete': get().completeSession(); break;
      case 'error': set({ connectionError: event.message }); break;
    }
  },

  receiveMessage: (message) => {
    // Drop late messages after session completed
    if (get().session?.status === 'completed') return;
    // Deduplicate — skip if message ID already exists
    if (get().messages.some((m) => m.id === message.id)) return;
    const arrived = { ...message, actualArrivalIso: new Date().toISOString() };
    set((s) => {
      const newMessages = [...s.messages, arrived];
      return { messages: newMessages, session: s.session ? { ...s.session, messages: newMessages } : null };
    });
  },

  markRead: (messageId) => set((s) => { const next = new Set(s.readMessageIds); next.add(messageId); return { readMessageIds: next }; }),
  setSelectedMessage: (messageId) => set({ selectedMessageId: messageId }),

  performAction: (messageId, actionType, payload = {}) => {
    const state = get();
    const arrivalTime = state.messages.find((m) => m.id === messageId)?.actualArrivalIso;
    const responseTimeMs = arrivalTime ? Date.now() - new Date(arrivalTime).getTime() : 0;
    const action: SimulationAction = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, messageId, type: actionType,
      content: payload.content, quickReplyTemplateId: payload.quickReplyTemplateId,
      delegateTarget: payload.delegateTarget, deferReason: payload.deferReason,
      timestamp: new Date().toISOString(), responseTimeMs: Math.max(0, responseTimeMs),
    };
    set((s) => {
      const newActions = [...s.actions, action];
      const newMessages = s.messages.map((m) => m.id === messageId ? { ...m, handled: true } : m);
      const counts = { ...s.actionCounts }; counts[actionType]++; counts.total++;
      const handledCount = newMessages.filter((m) => m.handled).length;
      return {
        actions: newActions, actionByMessageId: { ...s.actionByMessageId, [messageId]: action },
        messages: newMessages, actionCounts: counts, lastInteractionReal: Date.now(),
        session: s.session ? { ...s.session, actions: newActions, completionRate: newMessages.length > 0 ? handledCount / newMessages.length : 0 } : null,
      };
    });
    // ── AI-driven interaction: call interact endpoint for all action types ──
    const msg = get().messages.find((m) => m.id === messageId);
    if (msg && get().scenario) {
      const deferCount = (get().deferCountByMessageId[messageId] || 0) + (actionType === 'defer' ? 1 : 0);

      if (actionType === 'defer') {
        const count = deferCount;
        const newCounts = { ...get().deferCountByMessageId, [messageId]: count };
        const newDeferred = new Set(get().deferredMessageIds); newDeferred.add(messageId);
        set({ deferCountByMessageId: newCounts, deferredMessageIds: newDeferred });
      }

      // Track reply/delegate for AI's action history context
      const recentActions = get().actions.slice(-10).map((a) => ({
        messageId: a.messageId, type: a.type, content: a.content,
        delegateTarget: a.delegateTarget, deferReason: a.deferReason,
      }));

      fetch('/api/ai/workday-sim/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: get().session?.id ?? '',
          jobId: get().jobId ?? '',
          scenarioId: get().scenario?.id ?? '',
          messageId,
          actionType,
          message: {
            id: msg.id, type: msg.type, sender: msg.sender, subject: msg.subject,
            content: msg.content, urgency: msg.urgency, competencyTags: msg.competencyTags,
          },
          candidateReply: actionType === 'reply' ? payload.content : undefined,
          delegateTarget: actionType === 'delegate' ? payload.delegateTarget : undefined,
          delegateRole: actionType === 'delegate' ? (payload as any).delegateRole : undefined,
          deferReason: actionType === 'defer' ? payload.deferReason : undefined,
          deferCount: actionType === 'defer' ? deferCount : undefined,
          actionHistory: recentActions,
          jobTitle: get().scenario?.managerPersona?.title ?? '',
          department: '', // derived from scenario
          scenario: get().scenario ? {
            managerPersona: get().scenario!.managerPersona,
            teamContext: get().scenario!.teamContext,
            title: get().scenario!.title,
          } : undefined,
        }),
      }).then((r) => r.json()).then((res) => {
        const data = res?.data;
        if (!data) return;

        // 1. Store reply evaluation on the action
        if (data.evaluation && actionType === 'reply') {
          set((s) => ({
            actions: s.actions.map((a) =>
              a.messageId === messageId && a.type === 'reply'
                ? { ...a, replyEvaluation: data.evaluation }
                : a
            ),
          }));
        }

        // 2. Dispatch AI-generated follow-up message
        if (data.followUpMessage) {
          const aiFollowUp: SimulationMessage = {
            ...data.followUpMessage,
            id: data.followUpMessage.id || `fup-${messageId}-${Date.now()}`,
            actualArrivalIso: new Date().toISOString(),
            scheduledArrivalSeconds: data.followUpMessage.scheduledArrivalSeconds ?? 0,
            expectedResponseType: 'reply',
          };
          const delayMs = (data.followUpMessage.scheduledArrivalSeconds ?? 0) * 1000;
          if (delayMs <= 0) {
            get().receiveMessage(aiFollowUp);
          } else {
            setTimeout(() => {
              if (get().session?.status === 'completed') return;
              get().receiveMessage(aiFollowUp);
            }, delayMs);
          }
        }

        // 3. Handle defer consequences from AI
        if (data.consequences && actionType === 'defer') {
          const cons = data.consequences;
          const resurfaceSec = cons.deferResurfaceSeconds ?? 60;
          const escalatedUrgency = cons.escalationUrgency;

          // Set resurface timer
          const timer = setTimeout(() => {
            const cur = get();
            if (cur.session?.status === 'completed') return;
            const newSet = new Set(cur.deferredMessageIds); newSet.delete(messageId);
            set((s) => ({
              deferredMessageIds: newSet,
              messages: s.messages.map((m) =>
                m.id === messageId
                  ? { ...m, handled: false, urgency: (escalatedUrgency as UrgencyTier) || m.urgency }
                  : m
              ),
            }));
          }, resurfaceSec * 1000);
          set((s) => ({ deferTimers: { ...s.deferTimers, [messageId]: timer } }));
        }
      }).catch(() => {
        // ── AI fallback: use hardcoded follow-ups from mock ──
        console.warn('[InboxSim] AI interact failed, using hardcoded fallback for', messageId, actionType);

        // Defer fallback
        if (actionType === 'defer') {
          const count = get().deferCountByMessageId[messageId] || 0;
          if (count >= 2) {
            const escalationMsg = getFollowUpForAction(messageId, 'defer', payload.content);
            if (escalationMsg) setTimeout(() => { get().receiveMessage(escalationMsg); }, 3000);
          } else {
            const timer = setTimeout(() => {
              const cur = get();
              if (cur.session?.status === 'completed') return;
              const newSet = new Set(cur.deferredMessageIds); newSet.delete(messageId);
              set((s) => ({ deferredMessageIds: newSet, messages: s.messages.map((m) => m.id === messageId ? { ...m, handled: false } : m) }));
            }, 60000);
            set((s) => ({ deferTimers: { ...s.deferTimers, [messageId]: timer } }));
          }
        }

        // Ignore fallback
        if (actionType === 'ignore') {
          const msg = get().messages.find((m) => m.id === messageId);
          if (msg && (msg.urgency === 'high' || msg.urgency === 'critical')) {
            const escalationMsg = getFollowUpForAction(messageId, 'ignore', payload.content);
            if (escalationMsg) {
              const delay = msg.urgency === 'critical' ? 10000 : 15000;
              setTimeout(() => { get().receiveMessage(escalationMsg); }, delay);
            }
          }
        }

        // Reply/Delegate fallback
        if (actionType === 'reply' || actionType === 'delegate') {
          const followUp = getFollowUpForAction(messageId, actionType, payload.content);
          if (followUp) {
            setTimeout(() => { get().receiveMessage(followUp); }, 2000 + Math.random() * 2000);
          }
        }
      });
    }

    get().resetGhostTimer();
    const { messages, scenario, elapsedMs } = get();

    // ── Auto-complete guards (prevent premature session end) ──
    // 1. Scenario must exist and have a defined message script
    if (!scenario || !scenario.messageScript || scenario.messageScript.length === 0) {
      console.warn('[InboxSim] Skipping auto-complete: scenario or messageScript not available');
      return;
    }

    // 2. Minimum elapsed time: at least 30 seconds of simulation time
    if (elapsedMs < 30000) {
      // Not enough time has passed — messages may still be arriving
      return;
    }

    // 3. At least 3 messages or 50% of expected must have arrived
    const totalExpected = scenario.messageScript.length;
    const minMessages = Math.max(3, Math.ceil(totalExpected * 0.5));
    if (messages.length < minMessages) {
      return;
    }

    // 4. Only auto-complete when ALL arrived messages have been handled
    if (messages.length >= totalExpected && messages.every((m) => m.handled)) {
      get().completeSession();
    } else if (messages.length >= minMessages && messages.every((m) => m.handled)) {
      // Edge case: if >50% of messages have arrived and all are handled,
      // but total expected hasn't arrived yet — don't auto-complete yet.
      // The session_complete event or maxDuration timer will end the session.
      console.log('[InboxSim] All arrived messages handled, waiting for remaining script messages...');
    }
  },

  startTimer: () => { if (get().timerIntervalId) return; set({ timerIntervalId: setInterval(() => get().tick(), 1000) }); },
  stopTimer: () => { const id = get().timerIntervalId; if (id) { clearInterval(id); set({ timerIntervalId: null }); } },
  tick: () => {
    const { elapsedMs, scenario, session } = get();
    const newElapsed = elapsedMs + 1000;
    const max = scenario?.maxDurationMs ?? 900000;
    const remaining = Math.max(0, max - newElapsed);
    set({ elapsedMs: newElapsed, remainingMs: remaining, session: session ? { ...session, actualDurationMs: newElapsed } : null });
    if (remaining <= 0) get().completeSession();
  },

  showGhostNudge: (message) => set({ ghostNudgeMessage: message }),
  dismissGhostNudge: () => set({ ghostNudgeMessage: null }),
  resetGhostTimer: () => {
    get().clearGhostTimer();
    const id = setTimeout(() => {
      // Don't nudge when paused — simulation is intentionally halted
      if (get().isPaused) return;
      const unhandled = get().messages.filter((m) => !m.handled);
      if (unhandled.length > 0) get().showGhostNudge(`还有 ${unhandled.length} 条消息等待处理。`);
    }, 15000);
    set({ ghostTimerId: id, lastInteractionReal: Date.now() });
  },
  clearGhostTimer: () => { const id = get().ghostTimerId; if (id) { clearTimeout(id); set({ ghostTimerId: null }); } },

  completeSession: () => {
    const { session } = get();
    if (!session || session.status === 'completed') return;
    get().stopTimer(); get().disconnect();
    set((s) => ({ session: s.session ? { ...s.session, status: 'completed', endTime: new Date().toISOString() } : null, showSummary: true }));
    get().generateResult();
  },

  setPaused: (paused) => { set({ isPaused: paused }); paused ? get().stopTimer() : get().startTimer(); },

  generateResult: async () => {
    const { session, messages, actions, candidateId, jobId, scenario } = get();
    if (!session) return;
    set({ isGeneratingResult: true });

    // Include reply evaluations in actions sent to server
    const actionsWithEvals = actions.map((a) => ({
      ...a,
      replyEvaluation: a.replyEvaluation,
    }));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch('/api/ai/workday-sim/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          sessionId: session.id, messages, actions: actionsWithEvals, candidateId, jobId,
          scenario: scenario ? {
            jobTitle: scenario.managerPersona?.title ?? '',
            title: scenario.title,
            managerPersona: scenario.managerPersona,
            teamContext: scenario.teamContext,
          } : undefined,
        }),
      });
      clearTimeout(timeout);
      if (res.ok) {
        const { data } = await res.json();
        set({ result: data, isGeneratingResult: false });
      } else throw new Error('analyze failed');
    } catch {
      set({ result: computeLocalResult(messages, actions, session, candidateId ?? '', jobId ?? ''), isGeneratingResult: false });
    } finally {
      clearTimeout(timeout);
    }
  },

  reset: () => {
    get().stopTimer(); get().clearGhostTimer(); get().disconnect();
    set({
      session: null, scenario: null, jobId: null, candidateId: null,
      messages: [], readMessageIds: new Set(), actions: [], actionByMessageId: {},
      sessionStartReal: null, elapsedMs: 0, remainingMs: 0, timerIntervalId: null,
      connectionState: 'disconnected', connectionError: null,
      ghostNudgeMessage: null, lastInteractionReal: null, ghostTimerId: null,
      actionCounts: initialActionCounts(), result: null, isGeneratingResult: false,
      selectedMessageId: null, showBriefing: true, showSummary: false, isPaused: false,
    });
  },
}));

function startLocalPlayback(scenario: SimulationScenario) {
  const store = useWorkdaySimStore.getState();
  store.startTimer();
  store.resetGhostTimer();
  useWorkdaySimStore.setState({ sessionStartReal: Date.now(), connectionState: 'connected' });
  if (store.session) {
    useWorkdaySimStore.setState({ session: { ...store.session, status: 'running' } });
  }
  const startTime = Date.now();
  for (const msg of scenario.messageScript) {
    const delay = msg.scheduledArrivalSeconds * 1000 - (Date.now() - startTime);
    setTimeout(() => { useWorkdaySimStore.getState().receiveMessage({ ...msg, actualArrivalIso: new Date().toISOString() }); }, Math.max(0, delay));
  }
  setTimeout(() => { useWorkdaySimStore.getState().completeSession(); }, scenario.maxDurationMs);
}
