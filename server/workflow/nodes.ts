import type { WorkflowContext } from './engine.ts';
import {
  IntentExtractionSchema,
  RadarScoresSchema,
  EvidenceAssemblySchema,
  InterviewManualSchema,
  SAFE_INTENT_EXTRACTION,
  SAFE_RADAR_SCORES,
  SAFE_EVIDENCE_ASSEMBLY,
  SAFE_INTERVIEW_MANUAL,
} from '../aiSchemas.ts';

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

const MAX_RETRIES = 2;

export async function intentExtractionNode(ctx: WorkflowContext): Promise<WorkflowContext> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // TODO: Replace with real DeepSeek call to extract candidate intent from chatHistory
      await sleep(1500);
      const raw = {
        primary: '主动推进型',
        secondary: '技术驱动',
        signals: ['选择了Mock先行方案', '关注技术栈细节', '主动询问架构决策'],
      };

      const parsed = IntentExtractionSchema.parse(raw);
      return { ...ctx, extractedIntent: parsed };
    } catch (err) {
      console.error(`[intentExtractionNode] attempt ${attempt + 1} failed:`, err);
      if (attempt < MAX_RETRIES) continue;
    }
  }
  // All retries exhausted — return safe default
  return { ...ctx, extractedIntent: SAFE_INTENT_EXTRACTION };
}

export async function radarCalculationNode(ctx: WorkflowContext): Promise<WorkflowContext> {
  if (!ctx.extractedIntent) throw new Error('前置依赖缺失：extractedIntent 未生成，无法计算雷达图');

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // TODO: Replace with real DeepSeek call to score 6 dimensions
      await sleep(2000);
      const raw = {
        架构思维: 90,
        抗压能力: 85,
        沟通表达: 92,
        业务理解: 88,
        主动推进: 95,
        代码规范: 80,
      };

      const parsed = RadarScoresSchema.parse(raw);
      return { ...ctx, radarScores: parsed };
    } catch (err) {
      console.error(`[radarCalculationNode] attempt ${attempt + 1} failed:`, err);
      if (attempt < MAX_RETRIES) continue;
    }
  }
  // All retries exhausted — return safe default
  return { ...ctx, radarScores: SAFE_RADAR_SCORES };
}

export async function evidenceAssemblyNode(ctx: WorkflowContext): Promise<WorkflowContext> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // TODO: Replace with real DeepSeek call to extract evidence anchors from session data
      await sleep(1500);
      const raw = {
        evidenceAnchors: [
          { id: 'mock-1', label: 'Mock先行决策', text: '在接口缺失的情况下选择Mock先行推进前端结构，展现了主动推进能力' },
          { id: 'mock-2', label: '技术深度追问', text: '主动询问架构决策和协作机制，展现了技术深度和全局思维' },
        ],
        finalReport: {
          matchScore: 92,
          tags: ['主动推进型', '跨部门协同', '结果导向'],
          summary: '候选人在云试岗中展现出极强的项目Owner意识和结构化问题拆解思维。',
        },
      };

      const parsed = EvidenceAssemblySchema.parse(raw);
      return { ...ctx, evidenceAnchors: parsed.evidenceAnchors, finalReport: parsed.finalReport };
    } catch (err) {
      console.error(`[evidenceAssemblyNode] attempt ${attempt + 1} failed:`, err);
      if (attempt < MAX_RETRIES) continue;
    }
  }
  // All retries exhausted — return safe default
  return {
    ...ctx,
    evidenceAnchors: SAFE_EVIDENCE_ASSEMBLY.evidenceAnchors,
    finalReport: SAFE_EVIDENCE_ASSEMBLY.finalReport,
  };
}

export async function interviewManualNode(ctx: WorkflowContext): Promise<WorkflowContext> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // TODO: Replace with real DeepSeek call to generate interview manual from evidence and radar scores
      await sleep(1200);
      const raw = {
        suggestedDeepDiveQuestions: [
          '在Mock先行方案的推进过程中，你如何与其他团队协调接口约定变更？',
          '能否分享一次你主动推动技术决策并获得团队认可的具体经历？',
          '当你面对模糊的业务需求时，通常会采取什么方法进行问题拆解？',
        ],
        topicsCandidateAvoided: [
          '错误处理与边界情况覆盖',
          '性能优化与监控策略',
          '跨团队冲突处理经历',
        ],
        strengthsToVerify: [
          '项目Owner意识是否具备可持续性',
          '结构化思维在更大规模系统中的迁移能力',
          '技术深度与架构设计能力的边界',
        ],
        weaknessesToProbe: [
          '在高压多任务并行场景下的优先级管理',
          '对非功能性需求的关注度',
          '知识分享与团队技术氛围建设的主动性',
        ],
        gaps: [
          { dimension: '代码规范', score: 80, requirement: 85, priority: 'must-ask' as const, question: '请描述你平时的代码审查流程，以及你如何确保团队代码质量？' },
          { dimension: '抗压能力', score: 85, requirement: 80, priority: 'confirm' as const, question: '在面对多任务并行压力时，你通常如何管理优先级和精力分配？' },
          { dimension: '业务理解', score: 88, requirement: 85, priority: 'confirm' as const, question: '当面对模糊的业务需求时，你的需求拆解步骤是什么？能否给一个具体例子？' },
          { dimension: '架构思维', score: 90, requirement: 75, priority: 'highlight' as const, question: '在Mock先行方案中，你的架构决策考虑了哪些非功能性需求？如何看待可扩展性？' },
          { dimension: '沟通表达', score: 92, requirement: 80, priority: 'highlight' as const, question: '请分享一次你成功推动跨团队技术决策的经历，具体是如何说服和协调的？' },
          { dimension: '主动推进', score: 95, requirement: 80, priority: 'highlight' as const, question: '在Mock先行方案执行中，你是如何主动协调上下游来保证推进节奏的？' },
        ],
      };

      const parsed = InterviewManualSchema.parse(raw);
      return { ...ctx, interviewManual: parsed };
    } catch (err) {
      console.error(`[interviewManualNode] attempt ${attempt + 1} failed:`, err);
      if (attempt < MAX_RETRIES) continue;
    }
  }
  // All retries exhausted — return safe default
  return { ...ctx, interviewManual: SAFE_INTERVIEW_MANUAL };
}
