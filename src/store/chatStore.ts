import { create } from 'zustand';

// Phase 4: 幽灵催促定时器（模块级，非 state）
let ghostTimerId: ReturnType<typeof setTimeout> | null = null;

export type Role = 'user' | 'hr' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
}

// ─── Timeline Tree Types ───────────────────────────────────────

/** 某一时刻的完整沙盘状态快照，用于 checkout 时空回溯 */
export interface Snapshot {
  chatHistory: Message[];
  sceneIndex: number;
  branchRound: number;
  branchChoices: Array<{ id: string; label: string; text: string }>;
  reverseAnswers: Array<{ type: string; question: string; answer: string }>;
}

/** AST 状态树节点 — 每个 AI 回复或重大选择生成一个节点 */
export interface TimelineNode {
  id: string;
  message: Message | null;
  parentId: string | null;
  childrenIds: string[];
  snapshot: Snapshot;
  abandoned: boolean;
  createdAt: string;
}

// ─── Chat State ────────────────────────────────────────────────

interface ChatState {
  chatHistory: Message[];
  activeStreamContent: string | null;
  isAiTyping: boolean;
  exploreNodeId: string | null;
  activeEvidenceId: string | null;
  abortController: AbortController | null;

  // ─── 沙盘核心数据 (Phase 1.5: 从 Chat.tsx 本地 state 迁入) ───
  sceneIndex: number;
  branchRound: number;
  branchChoices: Array<{ id: string; label: string; text: string }>;
  reverseAnswers: Array<{ type: string; question: string; answer: string }>;

  // ─── 多重宇宙时间线 (Phase 1.5: 树状状态机) ───
  nodes: Record<string, TimelineNode>;
  currentNodeId: string | null;

  parallelUniverseScores: Record<string, number> | null;
  whatIfAnalysis: string | null;
  isWhatIfStreaming: boolean;

  sceneScriptContent: string | null;
  isGeneratingSceneScript: boolean;

  priorityWeights: Record<string, number>;
  setPriorityWeight: (nodeId: string, weight: number) => void;
  analyzePrioritiesWithAi: (jobContext: unknown) => Promise<void>;

  sessionState: { sessionId: string | null; sceneIndex: number };

  prefetchTaskId: string | null;
  setPrefetchTaskId: (id: string) => void;

  addUserMessage: (content: string) => void;
  simulateAiStream: (fullResponse: string) => Promise<void>;
  streamAiResponse: (jobContext: unknown) => Promise<void>;
  generateSceneScript: (sceneContext: unknown) => Promise<void>;
  setExploreNodeId: (id: string | null) => void;
  setActiveEvidenceId: (id: string | null) => void;
  simulateWhatIf: (sceneContext: unknown, alternativeChoice: string) => Promise<void>;

  resetWithJob: (jobTitle: string) => void;

  saveSession: (sid: string, idx: number) => Promise<void>;
  loadSession: () => Promise<{ sessionId: string; sceneIndex: number } | null>;
  clearSession: () => Promise<void>;

  startStream: () => void;
  appendStreamChar: (char: string) => void;
  finishStream: () => void;
  abortStream: () => void;

  // Phase 4: 感官觉醒
  timePressure: 'none' | 'moderate' | 'urgent';
  setTimePressure: (tp: 'none' | 'moderate' | 'urgent') => void;
  startGhostTimer: (onTimeout: () => void) => void;
  stopGhostTimer: () => void;

  // ─── Phase 1.5 Actions ────────────────────────────────────────
  /** Chat.tsx 调用，替代本地 localBranchIds state */
  addBranchChoice: (choice: { id: string; label: string; text: string }) => void;
  /** Chat.tsx 调用，替代本地 reverseAnswer state */
  addReverseAnswer: (answer: { type: string; question: string; answer: string }) => void;
  /** 设置当前场景索引 */
  setSceneIndex: (idx: number) => void;
  /** 设置分岔轮次 */
  setBranchRound: (round: number) => void;
  /** 时间回溯：恢复到指定节点的全量快照 */
  checkout: (nodeId: string) => void;
  /** 获取当前节点到根节点的路径（供 Timeline UI 渲染） */
  getAncestorPath: () => TimelineNode[];
}

export const useChatStore = create<ChatState>((set, get) => ({
  chatHistory: [
    {
      id: 'msg-init',
      role: 'hr',
      content: '你好！我是这个岗位的AI体验官。接下来我们将进入前端开发的日常工作沙盘。我们现在面临一个紧急上线任务，但在需求评审时发现少了一个关键接口，如果由你来负责推进，你会怎么选？',
    }
  ],
  activeStreamContent: null,
  isAiTyping: false,
  exploreNodeId: null,
  activeEvidenceId: null,
  abortController: null,
  sceneScriptContent: null,

  // Phase 1.5: 沙盘核心数据初始化
  sceneIndex: 0,
  branchRound: 0,
  branchChoices: [],
  reverseAnswers: [],

  // Phase 1.5: 时间线树初始化
  nodes: {},
  currentNodeId: null,

  parallelUniverseScores: null,
  whatIfAnalysis: null,
  isWhatIfStreaming: false,
  isGeneratingSceneScript: false,
  priorityWeights: { '薪资福利': 50, '技术栈': 50, '工作节奏': 50, '团队氛围': 50, '成长路径': 50, '岗位挑战': 50, '面试流程': 50 },

  setPriorityWeight: (nodeId, weight) => set((state) => ({ priorityWeights: { ...state.priorityWeights, [nodeId]: weight } })),

  analyzePrioritiesWithAi: async (jobContext) => {
    const { priorityWeights, streamAiResponse } = get();
    const top = Object.entries(priorityWeights).sort(([, a], [, b]) => b - a).slice(0, 2).map(([k]) => k);
    await streamAiResponse({ ...(jobContext as object), topPriorities: top, mode: 'priority-analysis' });
  },

  sessionState: { sessionId: null, sceneIndex: 0 },

  // Phase 4
  timePressure: 'none' as const,
  setTimePressure: (tp) => set({ timePressure: tp }),

  prefetchTaskId: null,
  setPrefetchTaskId: (id) => set({ prefetchTaskId: id }),

  resetWithJob: (jobTitle) => {
    const initMessage: Message = {
      id: 'msg-init',
      role: 'hr' as Role,
      content: `你好！我是这个岗位的AI体验官。接下来我们将进入${jobTitle}的日常工作沙盘...`,
    };
    const rootNodeId = 'node-root-init';
    const rootNode: TimelineNode = {
      id: rootNodeId,
      message: initMessage,
      parentId: null,
      childrenIds: [],
      snapshot: {
        chatHistory: [initMessage],
        sceneIndex: 0,
        branchRound: 0,
        branchChoices: [],
        reverseAnswers: [],
      },
      abandoned: false,
      createdAt: new Date().toISOString(),
    };
    return set({
      chatHistory: [initMessage],
      // Phase 1.5: 切换岗位时重置沙盘状态和时间线
      sceneIndex: 0,
      branchRound: 0,
      branchChoices: [],
      reverseAnswers: [],
      nodes: { [rootNodeId]: rootNode },
      currentNodeId: rootNodeId,
    });
  },

  setExploreNodeId: (id) => set({ exploreNodeId: id }),
  setActiveEvidenceId: (id) => set({ activeEvidenceId: id }),

  addUserMessage: (content) => {
    const newMessage: Message = { id: `user-${Date.now()}`, role: 'user', content };
    set((state) => {
      const nodeId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newHistory = [...state.chatHistory, newMessage];

      const newNode: TimelineNode = {
        id: nodeId,
        message: newMessage,
        parentId: state.currentNodeId,
        childrenIds: [],
        snapshot: {
          chatHistory: newHistory,
          sceneIndex: state.sceneIndex,
          branchRound: state.branchRound,
          branchChoices: [...state.branchChoices],
          reverseAnswers: [...state.reverseAnswers],
        },
        abandoned: false,
        createdAt: new Date().toISOString(),
      };

      const updatedNodes = { ...state.nodes, [nodeId]: newNode };
      if (state.currentNodeId && updatedNodes[state.currentNodeId]) {
        updatedNodes[state.currentNodeId] = {
          ...updatedNodes[state.currentNodeId],
          childrenIds: [...updatedNodes[state.currentNodeId].childrenIds, nodeId],
        };
      }

      return {
        chatHistory: newHistory,
        nodes: updatedNodes,
        currentNodeId: nodeId,
      };
    });
  },

  startStream: () => set({ isAiTyping: true, activeStreamContent: '' }),

  appendStreamChar: (char) => set((state) => ({
    activeStreamContent: (state.activeStreamContent || '') + char
  })),

  finishStream: () => set((state) => {
    if (!state.activeStreamContent) return { isAiTyping: false };
    const finalizedMessage: Message = {
      id: `ai-${Date.now()}`,
      role: 'hr',
      content: state.activeStreamContent
    };
    const newHistory = [...state.chatHistory, finalizedMessage];

    // Phase 1.5: AI 回复也创建 TimelineNode
    const nodeId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newNode: TimelineNode = {
      id: nodeId,
      message: finalizedMessage,
      parentId: state.currentNodeId,
      childrenIds: [],
      snapshot: {
        chatHistory: newHistory,
        sceneIndex: state.sceneIndex,
        branchRound: state.branchRound,
        branchChoices: [...state.branchChoices],
        reverseAnswers: [...state.reverseAnswers],
      },
      abandoned: false,
      createdAt: new Date().toISOString(),
    };

    const updatedNodes = { ...state.nodes, [nodeId]: newNode };
    if (state.currentNodeId && updatedNodes[state.currentNodeId]) {
      updatedNodes[state.currentNodeId] = {
        ...updatedNodes[state.currentNodeId],
        childrenIds: [...updatedNodes[state.currentNodeId].childrenIds, nodeId],
      };
    }

    return {
      chatHistory: newHistory,
      activeStreamContent: null,
      isAiTyping: false,
      nodes: updatedNodes,
      currentNodeId: nodeId,
    };
  }),

  abortStream: () => {
    const { abortController, finishStream } = get();
    if (abortController) {
      abortController.abort();
    }
    finishStream();
    set({ abortController: null });
  },

  simulateAiStream: async (fullResponse) => {
    const { startStream, appendStreamChar, finishStream, timePressure } = get();
    startStream();
    await new Promise(resolve => setTimeout(resolve, timePressure === 'urgent' ? 200 : 600));
    const baseDelay = timePressure === 'urgent' ? 10 : timePressure === 'moderate' ? 20 : 35;
    const variance = timePressure === 'urgent' ? 8 : timePressure === 'moderate' ? 15 : 25;
    const chunks = fullResponse.split('');
    for (let i = 0; i < chunks.length; i++) {
      appendStreamChar(chunks[i]);
      let delay = baseDelay + Math.random() * variance;
      // 高压随机卡顿（模拟思考停顿）
      if (timePressure === 'urgent' && Math.random() < 0.04) delay += 200;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    finishStream();
  },

  streamAiResponse: async (jobContext: unknown) => {
    const { startStream, appendStreamChar, finishStream, chatHistory } = get();
    startStream();

    const controller = new AbortController();
    set({ abortController: controller });

    try {
      const response = await fetch('/api/ai/digital-human-chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: chatHistory, jobContext }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) throw new Error('Stream connection failed');

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
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const dataStr = trimmed.replace('data: ', '');
          if (dataStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) { appendStreamChar(`\n[${parsed.error}]`); }
            else if (parsed.content) { appendStreamChar(parsed.content); }
          } catch { /* skip parse errors */ }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // Stream intentionally aborted, abortStream already cleaned up
      }
      console.warn('SSE stream failed, falling back to Mock:', err);
      const fallbackMsg = '非常有主动性的选择！Mock先行确实能解耦前后端依赖。但随之而来的问题是：联调时如果发现后端实际数据结构与Mock差异很大，你会怎么优化这套协作机制？';
      const { simulateAiStream, finishStream } = get();
      finishStream(); // Clear the failed stream state
      await simulateAiStream(fallbackMsg);
      return; // Skip finally's finishStream since simulateAiStream handles it
    } finally {
      set({ abortController: null });
      finishStream();
    }
  },

  saveSession: async (sid, idx) => {
    try {
      const { set: idbSet } = await import('idb-keyval');
      await idbSet('trial-session-recovery', { sessionId: sid, sceneIndex: idx });
      set({ sessionState: { sessionId: sid, sceneIndex: idx } });
    } catch (e) {
      console.warn('Failed to save session to IndexedDB:', e);
    }
  },

  loadSession: async () => {
    try {
      const { get: idbGet } = await import('idb-keyval');
      const data = await idbGet('trial-session-recovery');
      if (data && data.sessionId) {
        set({ sessionState: { sessionId: data.sessionId, sceneIndex: data.sceneIndex ?? 0 } });
        return data as { sessionId: string; sceneIndex: number };
      }
      return null;
    } catch (e) {
      console.warn('Failed to load session from IndexedDB:', e);
      return null;
    }
  },

  clearSession: async () => {
    try {
      const { del: idbDel } = await import('idb-keyval');
      await idbDel('trial-session-recovery');
      set({ sessionState: { sessionId: null, sceneIndex: 0 } });
    } catch (e) {
      console.warn('Failed to clear session from IndexedDB:', e);
    }
  },

  generateSceneScript: async (sceneContext) => {
    const { chatHistory } = get();
    set({ isGeneratingSceneScript: true, sceneScriptContent: '' });

    try {
      const response = await fetch('/api/ai/digital-human-chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: [], jobContext: { ...(sceneContext as Record<string, unknown>), mode: 'scene-generation' } }),
      });

      if (!response.ok || !response.body) throw new Error('Stream connection failed');

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
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const dataStr = trimmed.replace('data: ', '');
          if (dataStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              // AI failed — clear content so UI falls back to static scene script
              // AI temporarily unavailable — use static script, don't retry
              set({ sceneScriptContent: null, isGeneratingSceneScript: false });
            } else if (parsed.content) {
              set((s) => ({ sceneScriptContent: (s.sceneScriptContent || '') + parsed.content }));
            }
          } catch { /* skip parse errors */ }
        }
      }
    } catch (err) {
      console.warn('Scene script generation failed, will use static fallback:', err);
      set({ sceneScriptContent: null });
    } finally {
      set({ isGeneratingSceneScript: false });
    }
  },

  simulateWhatIf: async (sceneContext, alternativeChoice) => {
    const { chatHistory } = get();
    set({ isWhatIfStreaming: true, whatIfAnalysis: '' });

    const controller = new AbortController();

    try {
      const response = await fetch('/api/ai/digital-human-chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: [
            ...chatHistory,
            { role: 'user', content: `如果在这个决策点上我做出了不同的选择：${alternativeChoice}` },
          ],
          jobContext: {
            ...(sceneContext as object),
            mode: 'what-if-parallel-universe',
            alternativeChoice,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) throw new Error('Stream connection failed');

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
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const dataStr = trimmed.replace('data: ', '');
          if (dataStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.content) {
              set((s) => ({ whatIfAnalysis: (s.whatIfAnalysis || '') + parsed.content }));
            }
          } catch { /* skip parse errors */ }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        set({ isWhatIfStreaming: false });
        return;
      }
      console.warn('What-if stream failed, using fallback:', err);
      const fallback = '如果在那个决策节点上你选择了不同的路径——比如优先等待后端接口就绪而不是Mock先行——项目进度可能会延迟2-3天，但你会获得更完整的真实数据结构理解。这种取舍本质上是在"速度"与"准确性"之间做权衡。你的Mock先行方案展示了优秀的推进能力，而等待方案则可能培养更深层的技术判断力。建议在未来的项目中，可以在Mock方案启动的同时，主动与后端约定数据契约，两全其美。';
      set({ whatIfAnalysis: fallback, isWhatIfStreaming: false });
      return;
    } finally {
      set({ isWhatIfStreaming: false });
    }
  },

  // ─── Phase 1.5 Actions ────────────────────────────────────────

  addBranchChoice: (choice) =>
    set((state) => ({
      branchChoices: [...state.branchChoices, choice],
    })),

  addReverseAnswer: (answer) =>
    set((state) => ({
      reverseAnswers: [...state.reverseAnswers, answer],
    })),

  setSceneIndex: (idx) => set({ sceneIndex: idx }),

  setBranchRound: (round) => set({ branchRound: round }),

  /** 时间回溯：恢复到指定节点的全量快照 */
  checkout: (nodeId) => {
    const targetNode = get().nodes[nodeId];
    if (!targetNode) return;

    const snap = targetNode.snapshot;
    set({
      currentNodeId: nodeId,
      chatHistory: snap.chatHistory,
      sceneIndex: snap.sceneIndex,
      branchRound: snap.branchRound,
      branchChoices: [...snap.branchChoices],
      reverseAnswers: [...snap.reverseAnswers],
    });
  },

  /** 获取当前节点到根节点的路径（供 Timeline UI 渲染） */
  getAncestorPath: () => {
    const { nodes, currentNodeId } = get();
    const path: TimelineNode[] = [];
    let cursor: string | null = currentNodeId;

    // 安全上限：防止循环引用导致的无限循环
    const visited = new Set<string>();
    while (cursor !== null && !visited.has(cursor)) {
      visited.add(cursor);
      const node = nodes[cursor];
      if (!node) break;
      path.unshift(node);
      cursor = node.parentId;
    }

    return path;
  },

  // Phase 4: 幽灵催促
  startGhostTimer: (onTimeout) => {
    stopGhostTimer();
    ghostTimerId = setTimeout(() => {
      onTimeout();
      ghostTimerId = null;
    }, 8000);
  },
  stopGhostTimer: () => {
    if (ghostTimerId !== null) {
      clearTimeout(ghostTimerId);
      ghostTimerId = null;
    }
  },
}));

function stopGhostTimer() {
  if (ghostTimerId !== null) {
    clearTimeout(ghostTimerId);
    ghostTimerId = null;
  }
}
