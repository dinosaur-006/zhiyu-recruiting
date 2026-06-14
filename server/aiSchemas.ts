import { z } from 'zod';

// ============================================================
// AI Output Schemas — validates every DeepSeek response
// ============================================================

export const ChatResponseSchema = z.object({
  response: z.string(),
  suggestedFollowUps: z.array(z.string()).max(3).default([]),
});

export const ScenarioSchema = z.object({
  scenarios: z.array(z.object({
    title: z.string(),
    description: z.string(),
    competencyAnchor: z.string().default(''),
    choices: z.array(z.object({
      label: z.enum(['A', 'B', 'C', 'D']),
      text: z.string(),
      analysis: z.object({
        collaboration: z.string().default(''),
        riskAwareness: z.enum(['高', '中', '低']).default('中'),
        communication: z.enum(['高', '中', '低']).default('中'),
        technicalJudgment: z.enum(['强', '待确认', '偏弱']).default('待确认'),
        executionStyle: z.string().default(''),
      }),
    })).length(4),
  })).min(1).max(5),
});

export const InsightSchema = z.object({
  strengths: z.array(z.object({
    label: z.string(),
    evidenceAnchors: z.array(z.string()).default([]),
  })).default([]),
  discussionTopics: z.array(z.string()).default([]),
  interviewQuestions: z.array(z.string()).default([]),
  candidateQuestionsForHR: z.array(z.string()).default([]),
  careerTips: z.array(z.string()).default([]),
  fitSummary: z.string().default(''),
});

// ============================================================
// Workflow-node output schemas
// ============================================================

export const IntentExtractionSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  signals: z.array(z.string()),
});

export const RadarScoresSchema = z.object({
  架构思维: z.number().min(0).max(100),
  抗压能力: z.number().min(0).max(100),
  沟通表达: z.number().min(0).max(100),
  业务理解: z.number().min(0).max(100),
  主动推进: z.number().min(0).max(100),
  代码规范: z.number().min(0).max(100),
});

export const EvidenceAssemblySchema = z.object({
  evidenceAnchors: z.array(z.object({
    id: z.string(),
    label: z.string(),
    text: z.string(),
  })),
  finalReport: z.object({
    matchScore: z.number().min(0).max(100),
    tags: z.array(z.string()),
    summary: z.string(),
  }),
});

export const JobStorySchema = z.object({
  intro: z.string(),
  painPoint: z.string(),
  opportunity: z.string(),
  teamCulture: z.string().default(''),
  growthPath: z.string().default(''),
});

export const ReportSchema = z.object({
  matchScore: z.number().min(0).max(100),
  tags: z.array(z.string()),
  summary: z.string(),
});

// Safe defaults for graceful degradation
export const SAFE_CHAT_RESPONSE = { response: '抱歉，AI 暂时无法生成回复。请重试或联系 HR。', suggestedFollowUps: [] };
export const SAFE_SCENARIO = { scenarios: [{ title: '任务场景', description: '请根据你的经验选择最合适的推进方案。', competencyAnchor: '问题解决', choices: ['A', 'B', 'C', 'D'].map((label) => ({ label, text: `方案 ${label}`, analysis: { collaboration: '待确认', riskAwareness: '中' as const, communication: '中' as const, technicalJudgment: '待确认' as const, executionStyle: '待确认' } })) }] };
export const SAFE_INSIGHT = { strengths: [], discussionTopics: [], interviewQuestions: [], candidateQuestionsForHR: [], careerTips: [], fitSummary: '' };

export const SAFE_INTENT_EXTRACTION = { primary: '待确认', secondary: '待确认', signals: [] as string[] };
export const SAFE_RADAR_SCORES = { 架构思维: 50, 抗压能力: 50, 沟通表达: 50, 业务理解: 50, 主动推进: 50, 代码规范: 50 };
export const SAFE_EVIDENCE_ASSEMBLY = { evidenceAnchors: [] as { id: string; label: string; text: string }[], finalReport: { matchScore: 50, tags: [] as string[], summary: 'AI 分析暂时不可用，请稍后重试。' } };

export const InterviewManualSchema = z.object({
  suggestedDeepDiveQuestions: z.array(z.string()),
  topicsCandidateAvoided: z.array(z.string()),
  strengthsToVerify: z.array(z.string()),
  weaknessesToProbe: z.array(z.string()),
  gaps: z.array(z.object({
    dimension: z.string(),
    score: z.number(),
    requirement: z.number(),
    priority: z.enum(['must-ask', 'confirm', 'highlight']),
    question: z.string(),
  })),
});

export const SAFE_INTERVIEW_MANUAL = {
  suggestedDeepDiveQuestions: [] as string[],
  topicsCandidateAvoided: [] as string[],
  strengthsToVerify: [] as string[],
  weaknessesToProbe: [] as string[],
  gaps: [] as { dimension: string; score: number; requirement: number; priority: 'must-ask' | 'confirm' | 'highlight'; question: string }[],
};
export const SAFE_JOB_STORY = { intro: '', painPoint: '', opportunity: '', teamCulture: '', growthPath: '' };
export const SAFE_REPORT = { matchScore: 50, tags: [], summary: '' };

export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type ScenarioOutput = z.infer<typeof ScenarioSchema>;
export type InsightOutput = z.infer<typeof InsightSchema>;
export type IntentExtraction = z.infer<typeof IntentExtractionSchema>;
export type RadarScores = z.infer<typeof RadarScoresSchema>;
export type EvidenceAssembly = z.infer<typeof EvidenceAssemblySchema>;
export type JobStory = z.infer<typeof JobStorySchema>;
export type Report = z.infer<typeof ReportSchema>;
export type InterviewManual = z.infer<typeof InterviewManualSchema>;
