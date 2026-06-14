import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { createDeepseekChatCompletion, streamDeepSeekChat } from './deepseekClient.ts';
import { buildAnalyzeJobPrompt } from './prompts/analyzeJobPrompt.ts';
import { buildGenerateHrReportPrompt } from './prompts/generateHrReportPrompt.ts';
import { buildGenerateScenarioPrompt } from './prompts/generateScenarioPrompt.ts';
import { buildDigitalHumanChatPrompt } from './prompts/digitalHumanChatPrompt.ts';
import { buildCandidateInsightPrompt } from './prompts/candidateInsightPrompt.ts';
import { buildExtractProfilePrompt } from './prompts/extractProfilePrompt.ts';
import { buildExtractJobParamsPrompt } from './prompts/extractJobParamsPrompt.ts';
import { parseJsonContent, validateHrReport, validateJobAnalysis, validateScenario, validateChatResponse, validateInsight, validateExtractedProfile, validateInteractResponse } from './schemas.ts';
import { buildWorkdayInteractPrompt } from './prompts/workdayInteractPrompt.ts';
import { sanitizeAiOutput } from './safety.ts';
import { createTask, taskRegistry } from './workflow/engine.ts';
import { startWorkflow } from './workflow/orchestrator.ts';

const port = Number(process.env.PORT || 8787);
const modelFast = process.env.DEEPSEEK_MODEL_FAST || 'deepseek-v4-flash';
const modelPro = process.env.DEEPSEEK_MODEL_PRO || 'deepseek-v4-pro';

const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readJsonBody(request);

    if (request.url === '/api/ai/analyze-job') {
      const startedAt = Date.now();
      const content = await createDeepseekChatCompletion({
        model: modelFast,
        messages: buildAnalyzeJobPrompt(body),
        maxTokens: 3000,
      });
      const parsed = validateJobAnalysis(parseJsonContent(content));
      const sanitized = sanitizeAiOutput(parsed);
      sendJson(response, 200, {
        data: sanitized.data,
        meta: createAiMeta({
          model: modelFast,
          latencyMs: Date.now() - startedAt,
          safetyHits: sanitized.safetyHits,
          needsHumanReview: sanitized.needsHumanReview,
        }),
      });
      return;
    }

    if (request.url === '/api/ai/generate-hr-report') {
      const startedAt = Date.now();
      const content = await createDeepseekChatCompletion({
        model: modelPro,
        messages: buildGenerateHrReportPrompt(body),
        maxTokens: 4000,
      });
      const parsed = validateHrReport(parseJsonContent(content));
      const sanitized = sanitizeAiOutput(parsed);
      sendJson(response, 200, {
        data: sanitized.data,
        meta: createAiMeta({
          model: modelPro,
          latencyMs: Date.now() - startedAt,
          safetyHits: sanitized.safetyHits,
          needsHumanReview: sanitized.needsHumanReview,
        }),
      });
      return;
    }

    if (request.url === '/api/ai/generate-scenario') {
      const startedAt = Date.now();
      const content = await createDeepseekChatCompletion({
        model: modelFast,
        messages: buildGenerateScenarioPrompt(body),
        maxTokens: 3000,
      });
      const parsed = validateScenario(parseJsonContent(content));
      const sanitized = sanitizeAiOutput(parsed);
      sendJson(response, 200, {
        data: sanitized.data,
        meta: createAiMeta({ model: modelFast, latencyMs: Date.now() - startedAt, safetyHits: sanitized.safetyHits, needsHumanReview: sanitized.needsHumanReview }),
      });
      return;
    }

    if (request.url === '/api/ai/digital-human-chat') {
      const startedAt = Date.now();
      const content = await createDeepseekChatCompletion({
        model: modelFast,
        messages: buildDigitalHumanChatPrompt(body),
        maxTokens: 1500,
      });
      const parsed = validateChatResponse(parseJsonContent(content));
      const sanitized = sanitizeAiOutput(parsed);
      sendJson(response, 200, {
        data: sanitized.data,
        meta: createAiMeta({ model: modelFast, latencyMs: Date.now() - startedAt, safetyHits: sanitized.safetyHits, needsHumanReview: sanitized.needsHumanReview }),
      });
      return;
    }

    if (request.url === '/api/ai/candidate-insight') {
      const startedAt = Date.now();
      const content = await createDeepseekChatCompletion({
        model: modelPro,
        messages: buildCandidateInsightPrompt(body),
        maxTokens: 4000,
      });
      const parsed = validateInsight(parseJsonContent(content));
      const sanitized = sanitizeAiOutput(parsed);
      sendJson(response, 200, {
        data: sanitized.data,
        meta: createAiMeta({ model: modelPro, latencyMs: Date.now() - startedAt, safetyHits: sanitized.safetyHits, needsHumanReview: sanitized.needsHumanReview }),
      });
      return;
    }

    if (request.url === '/api/ai/extract-job-params') {
      const startedAt = Date.now();
      const content = await createDeepseekChatCompletion({
        model: modelFast,
        messages: buildExtractJobParamsPrompt({
          jdText: typeof body?.jdText === 'string' ? body.jdText : '',
          jobTitle: typeof body?.jobTitle === 'string' ? body.jobTitle : '',
          jobDepartment: typeof body?.jobDepartment === 'string' ? body.jobDepartment : '',
        }),
        maxTokens: 800,
      });
      const parsed = parseJsonContent(content);
      const { data: sanitized, safetyHits } = sanitizeAiOutput({
        paceThreshold: Number(parsed?.paceThreshold) || 50,
        collaborationDensity: Number(parsed?.collaborationDensity) || 50,
        codeHygiene: Number(parsed?.codeHygiene) || 50,
        ambiguityTolerance: Number(parsed?.ambiguityTolerance) || 50,
        autonomyLevel: Number(parsed?.autonomyLevel) || 50,
        derivedAtmosphere: String(parsed?.derivedAtmosphere || ''),
      });
      sendJson(response, 200, {
        data: sanitized,
        meta: createAiMeta({ model: modelFast, latencyMs: Date.now() - startedAt, safetyHits, needsHumanReview: safetyHits.length > 0 }),
      });
      return;
    }

    if (request.url === '/api/ai/extract-profile') {
      const startedAt = Date.now();
      const chatHistory = Array.isArray(body?.chatHistory) ? body.chatHistory : [];
      const branchChoices = Array.isArray(body?.branchChoices) ? body.branchChoices : [];
      const reverseQuestions = Array.isArray(body?.reverseQuestions) ? body.reverseQuestions : [];

      // 构建对话原文 corpus 用于 post-hoc quote 硬校验
      const dialogueCorpus = chatHistory
        .map((m: { role: string; content: string }) => `[${m.role}]: ${m.content}`)
        .join('\n');

      const content = await createDeepseekChatCompletion({
        model: modelPro,
        messages: buildExtractProfilePrompt({ chatHistory, branchChoices, reverseQuestions }),
        maxTokens: 3000,
      });
      const parsed = validateExtractedProfile(parseJsonContent(content), dialogueCorpus);
      const sanitized = sanitizeAiOutput(parsed);
      sendJson(response, 200, {
        data: sanitized.data,
        meta: createAiMeta({
          model: modelPro,
          latencyMs: Date.now() - startedAt,
          safetyHits: sanitized.safetyHits,
          needsHumanReview: sanitized.needsHumanReview,
        }),
      });
      return;
    }

    if (request.url === '/api/ai/digital-human-chat/stream') {
      response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });

      try {
        const history = Array.isArray(body?.history) ? body.history : [];
        const jobContext = body?.jobContext ?? {};
        const systemPrompt = buildStreamSystemPrompt(body?.jobContext);

        const tokenStream = streamDeepSeekChat(history, systemPrompt);
        for await (const token of tokenStream) {
          response.write(`data: ${JSON.stringify({ content: token })}\n\n`);
        }
        response.write('data: [DONE]\n\n');
      } catch (err) {
        console.error('[sse stream error]', err);
        response.write(`data: ${JSON.stringify({ error: 'AI响应生成失败，请重试。' })}\n\n`);
        response.write('data: [DONE]\n\n');
      }
      response.end();
      return;
    }

    if (request.method === 'POST' && request.url === '/api/ai/submit-trial') {
      const record = body && typeof body === 'object' ? body as Record<string, unknown> : {};
      const task = createTask(
        String(record.jobId ?? ''),
        String(record.candidateId ?? ''),
        record.sessionData ?? {},
      );
      sendJson(response, 200, { taskId: task.taskId, message: '任务已进入后台队列', stage: task.stageLabel });
      startWorkflow(task.taskId);
      return;
    }

    // ═══════════════════════════════════════════
    // Workday Simulation Endpoints
    // ═══════════════════════════════════════════

    // POST /api/ai/workday-sim/stream — SSE message stream
    if (request.method === 'POST' && request.url === '/api/ai/workday-sim/stream') {
      const body = await readBody(request);
      const { sessionId, scenarioId, messages } = body;
      response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
      response.write(`data: ${JSON.stringify({ type: 'session_start', sessionId, scenarioId: scenarioId ?? '', estimatedDuration: 720 })}\n\n`);
      handleWorkdaySimStream(response, (messages as Array<Record<string, unknown>>) ?? [], body.ambientEvents as Array<Record<string, unknown>> | undefined).catch(() => {
        response.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream interrupted' })}\n\n`);
        response.write('data: [DONE]\n\n');
        response.end();
      });
      return;
    }

    // POST /api/ai/workday-sim/interact — AI-driven interaction handler (reply/defer/delegate/ignore)
    if (request.method === 'POST' && request.url === '/api/ai/workday-sim/interact') {
      const body = await readBody(request);
      try {
        const result = await handleWorkdayInteract(body);
        sendJson(response, 200, { data: result });
      } catch (err) {
        console.warn('[workday-sim/interact] AI failed:', err);
        sendJson(response, 200, { data: null, error: 'AI interact unavailable' });
      }
      return;
    }

    // POST /api/ai/workday-sim/analyze — analyze simulation results
    if (request.method === 'POST' && request.url === '/api/ai/workday-sim/analyze') {
      const body = await readBody(request);
      try {
        const analysis = await analyzeWorkdaySimulation(body);
        sendJson(response, 200, { data: analysis, meta: { source: body.jobId ? 'deepseek' : 'local', createdAt: new Date().toISOString(), fallback: false } });
      } catch (err) {
        console.warn('[workday-sim/analyze] AI failed, using local fallback:', err);
        sendJson(response, 200, { data: computeLocalSimResult(body), meta: { source: 'local', createdAt: new Date().toISOString(), fallback: true } });
      }
      return;
    }

    if (request.method === 'GET' && request.url?.startsWith('/api/ai/task/')) {
      const taskId = request.url.replace('/api/ai/task/', '');
      const task = taskRegistry.get(taskId);
      if (!task) { sendJson(response, 404, { error: '任务不存在或已过期' }); return; }
      sendJson(response, 200, { status: task.status, stage: task.stageLabel, result: task.context.finalReport ?? null });
      return;
    }

    sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    console.error('[ai server error]', error);
    sendJson(response, 500, { error: 'AI request failed' });
  }
});

function buildStreamSystemPrompt(jobContext: unknown): string {
  const ctx = (jobContext && typeof jobContext === 'object' ? jobContext : {}) as Record<string, unknown>;
  const mode = ctx.mode as string | undefined;
  const sitCtx = (ctx.situationalContext as Record<string, unknown> | undefined) ?? {};

  const sitBlock = formatSituationalBlock(sitCtx);

  if (mode === 'scene-generation') {
    return [
      '你是"职遇 Reality Pro"的场景脚本生成器。',
      '你的任务是生成一段简洁的岗位场景描述，供候选人在沙盘推演界面中阅读。',
      sitBlock,
      '═══ 硬性约束 ═══',
      '1. 严格限制在 3-5 句话以内，绝对不超过 120 字。',
      '2. 只描述场景内容，不要打招呼，不要用问句结尾，不要反问候选人。',
      '3. 语气：客观、直接、信息密集。不美化岗位，不使用推销口吻。',
      '4. 绝不重复同一句话。如果发现自己开始重复输出，立刻结束。',
      '5. 不要输出"你好"、"欢迎"、"我是小遇"等自我介绍——这些已经在 UI 层处理。',
      `岗位上下文：${JSON.stringify(jobContext)}`,
      '现在生成场景描述脚本（3-5句话，不超过120字）：',
    ].join('\n');
  }

  if (mode === 'strategy-execution') {
    const strategyString = (ctx.strategyString as string) || '';
    return [
      '你是"职遇 Reality Pro"的战术分析引擎。',
      `候选人构建了一个复合执行策略：[ ${strategyString} ]。`,
      sitBlock,
      '═══ 点评要求 ═══',
      '1. 以主管身份，用专业工程视角审视这个策略组合。',
      '2. 协同性判定：指出这套组合拳的亮点（例如：Mock解耦争取时间 + 风险同步非常成熟）。',
      '3. 盲区暴击：直接指出此策略在当前时间压力下最致命的一个隐患（例如：分期交付会引起业务方反弹）。',
      '4. 语言风格：冷静、极客、一针见血，控制在 3-4 句话。绝不废话。',
      `岗位上下文：${JSON.stringify(jobContext)}`,
    ].join('\n');
  }

  if (mode === 'ghost-prompt') {
    return [
      '你是小遇，但你此刻的角色是"时间压力幽灵"。',
      '候选人在高压场景中迟疑了超过 8 秒没有操作。请用一句话简短催促。',
      sitBlock,
      '═══ 约束 ═══',
      '1. 严格一句话，不超过 30 字。',
      '2. 语气紧迫但不刻薄。用工作事实催促，不做人身攻击。',
      '3. 不重复。',
      `岗位上下文：${JSON.stringify(jobContext)}`,
    ].join('\n');
  }

  if (mode === 'butterfly-consequence') {
    return [
      '你是"职遇 Reality Pro"的蝴蝶效应引擎。',
      '候选人在前几轮做出了一些选择，现在这些选择产生了连锁后果。请生成一段情景叙事，将这个后果自然融入当前场景。',
      sitBlock,
      '═══ 约束 ═══',
      '1. 控制在 2-3 句话。',
      '2. 明确提及候选人之前的具体选择及其后果，但语气客观而非指责。',
      '3. 用"你之前选择了X，现在..."的句式推进。',
      `岗位上下文：${JSON.stringify(jobContext)}`,
    ].join('\n');
  }

  if (mode === 'priority-analysis') {
    return [
      '你是小遇，AI体验官。',
      '候选人拖拽调整了关注维度的权重，请对此给出简短的分析。',
      sitBlock,
      '限制：2-3 句话，不超过 60 字。不打招呼，不闲聊。',
      `岗位上下文：${JSON.stringify(jobContext)}`,
    ].join('\n');
  }

  if (mode === 'what-if-parallel-universe') {
    return [
      '你是"职遇 Reality Pro"的平行宇宙推演引擎。',
      '候选人在某个决策节点上做出了不同选择，请推演这个替代路径可能产生的影响。',
      sitBlock,
      '═══ 约束 ═══',
      '1. 推演基于已有对话上下文和岗位信息，不编造事实。',
      '2. 控制在 4-6 句话。',
      '3. 用"如果你当时选择了X，那么..."的句式推进，不评价好坏。',
      '4. 不重复已经说过的内容。',
      `岗位上下文：${JSON.stringify(jobContext)}`,
    ].join('\n');
  }

  // 默认：常规对话
  return [
    '你是小遇，AI体验官。你在与候选人进行岗位实境舱沙盘推演对话。',
    sitBlock,
    '═══ 约束 ═══',
    '1. 每次回复控制在 2-4 句话。',
    '2. 如果候选人的选择涉及具体技术决策，给出客观分析而非主观表扬。',
    '3. 不评价候选人能力或性格，只讨论选择本身的含义。',
    '4. 不重复之前已经说过的内容。如果候选人重复提问，简要指出已回答过。',
    `岗位上下文：${JSON.stringify(jobContext)}`,
  ].join('\n');
}

function formatSituationalBlock(sitCtx: Record<string, unknown>): string {
  const hasContent = Object.values(sitCtx).some((v) => v !== undefined && v !== null && v !== '');
  if (!hasContent) return '';

  const lines: string[] = ['═══ 情景上下文 ═══'];
  if (sitCtx.sceneMood) lines.push(`场景氛围：${sitCtx.sceneMood}`);
  if (sitCtx.timePressure) lines.push(`时间压力：${sitCtx.timePressure}`);
  if (sitCtx.characterDynamics) lines.push(`角色动态：${sitCtx.characterDynamics}`);
  if (sitCtx.officeAtmosphere) lines.push(`办公氛围：${sitCtx.officeAtmosphere}`);
  if (sitCtx.urgencyNarrative) lines.push(`紧急叙事：${sitCtx.urgencyNarrative}`);
  if (sitCtx.personaTone) lines.push(`人格语调：${sitCtx.personaTone}`);
  if (sitCtx.butterflyHistory) lines.push(`蝴蝶效应历史：\n${sitCtx.butterflyHistory}`);
  lines.push('═══ 情景上下文结束 ═══');
  return lines.join('\n');
}

// ═══════════════════════════════════════════
// Workday Simulation Helpers
// ═══════════════════════════════════════════

async function readBody(request: import('node:http').IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let data = '';
    request.on('data', (chunk) => { data += chunk; });
    request.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({}); } });
    request.on('error', reject);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

async function handleWorkdaySimStream(response: import('node:http').ServerResponse, messages: Array<Record<string, unknown>>, ambientEvents?: Array<Record<string, unknown>>) {
  let prevSeconds = 0;
  let ambientIndex = 0;
  const sortedAmbient = (ambientEvents ?? []).sort((a: Record<string, unknown>, b: Record<string, unknown>) => ((a.scheduledArrivalSeconds as number) ?? 0) - ((b.scheduledArrivalSeconds as number) ?? 0));

  for (const msg of messages) {
    const scheduledSeconds = (msg.scheduledArrivalSeconds as number) ?? 0;
    // Send any ambient events that should fire before this message
    while (ambientIndex < sortedAmbient.length && (sortedAmbient[ambientIndex].scheduledArrivalSeconds as number) <= scheduledSeconds) {
      const amb = sortedAmbient[ambientIndex];
      const ambDelay = Math.max(0, ((amb.scheduledArrivalSeconds as number) - prevSeconds) * 1000);
      await sleep(ambDelay);
      prevSeconds = amb.scheduledArrivalSeconds as number;
      if (response.destroyed) return;
      response.write(`data: ${JSON.stringify({ type: 'ambient_event', event: amb })}\n\n`);
      ambientIndex++;
    }
    const delay = Math.max(0, (scheduledSeconds - prevSeconds) * 1000);
    prevSeconds = scheduledSeconds;
    await sleep(delay);
    if (response.destroyed) return;
    const arrived = { ...msg, actualArrivalIso: new Date().toISOString(), handled: false };
    response.write(`data: ${JSON.stringify({ type: 'message_arrive', message: arrived })}\n\n`);
  }
  response.write(`data: ${JSON.stringify({ type: 'session_complete', summary: '所有消息已送达' })}\n\n`);
  response.write('data: [DONE]\n\n');
  response.end();
}

async function handleWorkdayInteract(body: Record<string, unknown>) {
  const message = (body.message as Record<string, unknown>) ?? {};
  const actionType = String(body.actionType ?? 'reply');
  const scenario = (body.scenario as Record<string, unknown>) ?? {};
  const actions = (body.actionHistory as Array<Record<string, unknown>>) ?? [];

  // Build structured input for the prompt
  const promptInput = {
    message,
    actionType,
    candidateReply: typeof body.candidateReply === 'string' ? body.candidateReply : undefined,
    delegateTarget: typeof body.delegateTarget === 'string' ? body.delegateTarget : undefined,
    delegateRole: typeof body.delegateRole === 'string' ? body.delegateRole : undefined,
    deferReason: typeof body.deferReason === 'string' ? body.deferReason : undefined,
    deferCount: typeof body.deferCount === 'number' ? body.deferCount : undefined,
    actionHistory: actions.slice(-10), // last 10 actions for context
    jobTitle: typeof body.jobTitle === 'string' ? body.jobTitle : undefined,
    department: typeof body.department === 'string' ? body.department : undefined,
    managerPersona: scenario.managerPersona as Record<string, unknown> | undefined,
    teamContext: typeof scenario.teamContext === 'string' ? scenario.teamContext : undefined,
    scenarioTitle: typeof scenario.title === 'string' ? scenario.title : undefined,
  };

  const messages = buildWorkdayInteractPrompt(promptInput);

  const startedAt = Date.now();
  const content = await createDeepseekChatCompletion({
    model: modelFast,
    messages,
    maxTokens: actionType === 'reply' ? 1500 : 800,
  });

  const parsed = validateInteractResponse(parseJsonContent(content));
  const sanitized = sanitizeAiOutput(parsed);

  return {
    ...sanitized.data,
    meta: createAiMeta({
      model: modelFast,
      latencyMs: Date.now() - startedAt,
      safetyHits: sanitized.safetyHits,
      needsHumanReview: sanitized.needsHumanReview,
    }),
  };
}

async function analyzeWorkdaySimulation(body: Record<string, unknown>) {
  const { messages, actions, jobId, scenario } = body;
  const actionsArr = (actions as Array<Record<string, unknown>>) ?? [];
  const messagesArr = (messages as Array<Record<string, unknown>>) ?? [];
  const scenarioData = (scenario as Record<string, unknown>) ?? {};

  // Build action summary including AI reply evaluations
  const actionSummaries = actionsArr.map((a: Record<string, unknown>, i: number) => {
    const evalData = a.replyEvaluation as Record<string, unknown> | undefined;
    let line = `${i + 1}. 消息ID: ${a.messageId}, 操作: ${a.type}, 响应时间: ${typeof a.responseTimeMs === 'number' ? Math.round(a.responseTimeMs / 1000) : '?'}秒`;
    if (a.content) line += `\n   回复内容: ${String(a.content).slice(0, 200)}`;
    if (evalData) line += `\n   AI回复质量评分: 综合${evalData.overallScore}/100 (专业性:${evalData.professionalism} 同理心:${evalData.empathy} 清晰度:${evalData.clarity} 可操作性:${evalData.actionability} 简洁性:${evalData.conciseness})`;
    if (a.delegateTarget) line += `\n   转交目标: ${a.delegateTarget}`;
    if (a.deferReason) line += `\n   延迟原因: ${a.deferReason}`;
    return line;
  }).join('\n\n');

  // Compute average reply quality from AI evaluations
  const replyEvaluations = actionsArr
    .filter((a: Record<string, unknown>) => a.type === 'reply' && a.replyEvaluation)
    .map((a: Record<string, unknown>) => a.replyEvaluation as Record<string, unknown>);
  const avgReplyScore = replyEvaluations.length > 0
    ? Math.round(replyEvaluations.reduce((s, e) => s + (Number(e.overallScore) || 0), 0) / replyEvaluations.length)
    : null;

  // Try AI analysis
  try {
    const prompt = `你是一位资深HR专家和沟通能力评估顾问。请深入分析候选人在工作日模拟中的表现。

模拟背景：候选人扮演${scenarioData.jobTitle || '团队成员'}角色，在真实工作消息流中处理了 ${messagesArr.length} 条消息，执行了 ${actionsArr.length} 次操作。
${scenarioData.title ? `场景主题：${scenarioData.title}` : ''}
${avgReplyScore !== null ? `AI实时评估的回复质量平均分: ${avgReplyScore}/100（基于${replyEvaluations.length}条回复的AI评估）` : ''}

候选人操作记录（含AI实时评估）：
${actionSummaries}

请从以下维度深入分析：

1. **优先级判断 (prioritization)**：候选人是否优先处理了高紧急度的消息？critical/high消息的平均响应时间是否快于medium/low消息？有没有忽略关键消息？

2. **沟通质量 (communication)**：回复内容的专业性、清晰度、同理心。请参考AI实时评估的回复质量分数。是否针对不同角色（上级/同事/客户）调整了沟通风格？

3. **利益相关方管理 (stakeholder_management)**：对上级、客户、同事、下属的回复是否有差异化策略？是否在适当的时候升级或寻求帮助？

4. **情绪稳定性 (emotional_regulation)**：在高压消息（客户投诉、上级催促）下是否保持了专业和冷静？回复语气是否一致？

5. **任务管理 (task_management)**：是否能区分紧急与重要？是否合理使用了"稍后"和"转交"来管理负载？

请以JSON格式返回：
{
  "competencyScores": [
    { "competency": "prioritization", "score": 0-100, "interpretation": "强|中|弱", "narrative": "具体的分析描述，包含证据（响应时间、操作选择等）" },
    { "competency": "communication", "score": 0-100, "interpretation": "强|中|弱", "narrative": "..." },
    { "competency": "stakeholder_management", "score": 0-100, "interpretation": "强|中|弱", "narrative": "..." },
    { "competency": "emotional_regulation", "score": 0-100, "interpretation": "强|中|弱", "narrative": "..." },
    { "competency": "task_management", "score": 0-100, "interpretation": "强|中|弱", "narrative": "..." }
  ],
  "communicationStyle": {
    "dominantTone": "assertive|collaborative|neutral|deferring|avoidant",
    "toneDescription": "对沟通风格的一句话总结",
    "escalationAwareness": "高|中|低",
    "boundarySetting": "高|中|低",
    "crossTeamCollaboration": "高|中|低"
  },
  "strengths": ["3个具体的、可引用的优势，要具体不要泛泛"],
  "improvementAreas": ["3个建设性的、可操作的改进方向"],
  "narrativeSummary": "3-5句话的总体评价，要有洞察力。描述候选人在这次模拟中展现的核心特质。"
}

分析原则：
- 基于实际数据，每个结论都要有证据支持
- 建设性和发展导向，不贴标签
- 禁止输出：录用建议、评分排名、性格判断、与其他人比较
- 用中文输出所有文本字段`;

    const result = await createDeepseekChatCompletion({
      model: modelPro,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: JSON.stringify({ messages: messagesArr.slice(0, 10), actions: actionsArr }) },
      ],
      maxTokens: 3000,
    });

    const parsed = JSON.parse(result);
    const { data: sanitized } = sanitizeAiOutput(parsed);
    return sanitized;
  } catch {
    // Fallback handled by caller
    throw new Error('AI analysis unavailable');
  }
}

function computeLocalSimResult(body: Record<string, unknown>) {
  const actionsArr = (body.actions as Array<Record<string, unknown>>) ?? [];
  const messagesArr = (body.messages as Array<Record<string, unknown>>) ?? [];
  return {
    competencyScores: [{ competency: 'prioritization', score: 70, evidence: [], interpretation: '中' }],
    communicationStyle: { dominantTone: 'neutral', escalationAwareness: '中', boundarySetting: '中', crossTeamCollaboration: '中' },
    strengths: ['完成了模拟中的消息处理'], improvementAreas: ['建议在真实环境中进一步观察'],
    narrativeSummary: '本地计算结果。AI深度分析暂不可用，已生成基础指标。',
    responsePatterns: [], actionDistribution: { reply: actionsArr.filter((a: Record<string, unknown>) => a.type === 'reply').length, defer: actionsArr.filter((a: Record<string, unknown>) => a.type === 'defer').length, delegate: actionsArr.filter((a: Record<string, unknown>) => a.type === 'delegate').length, ignore: actionsArr.filter((a: Record<string, unknown>) => a.type === 'ignore').length, total: actionsArr.length },
    missedCriticalMessages: [], prioritizationScore: 50,
  };
}

server.listen(port, () => {
  console.log(`AI server running at http://localhost:${port}`);
});

function readJsonBody(request: any): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk: Buffer) => {
      raw += chunk.toString('utf8');
      if (raw.length > 2 * 1024 * 1024) {
        reject(new Error('Request body too large'));
      }
    });
    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid request JSON'));
      }
    });
    request.on('error', reject);
  });
}

function sendJson(response: any, status: number, body: unknown) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function createAiMeta(input: {
  model: string;
  latencyMs: number;
  safetyHits: string[];
  needsHumanReview: boolean;
}) {
  return {
    provider: 'deepseek',
    model: input.model,
    requestId: randomUUID(),
    latencyMs: input.latencyMs,
    safetyHits: input.safetyHits,
    needsHumanReview: input.needsHumanReview,
    createdAt: new Date().toISOString(),
  };
}
