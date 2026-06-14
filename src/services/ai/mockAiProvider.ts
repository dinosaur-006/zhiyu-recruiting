import { parseJobDescription, getBranchScenarios } from '../../mock/ai';
import type { Job, JobInput } from '../../types';

const fallbackInput: JobInput = {
  title: '',
  department: '',
  location: '',
  salaryMin: 0,
  salaryMax: 0,
  education: '',
  experience: '',
  responsibilities: '',
  requirements: '',
  teamInfo: '',
  growthPath: '',
  interviewProcess: '',
  workload: '',
  challenges: '',
};

export const mockAiProvider = {
  async analyzeJob(input: unknown) {
    return parseJobDescription({ ...fallbackInput, ...(input as Partial<JobInput>) });
  },

  async generateHrReport(input: unknown) {
    const params = input as Record<string, unknown> || {};
    const concerns = Array.isArray(params.candidateQuestions) ? params.candidateQuestions as string[] : [];
    return {
      summary: '候选人已完成实境体验。本报告基于体验数据生成，供HR面试前参考。所有招聘决定应由人工复核后做出。',
      mainConcerns: concerns.length > 0 ? concerns.slice(0, 5).map((q) => ({
        topic: String(q).slice(0, 50),
        level: 'medium' as const,
        description: `候选人在实境体验中提出了关于"${String(q).slice(0, 30)}"的问题。`,
      })) : [],
      trustAlignment: '中' as const,
      evidenceItems: [{ source: '实境体验行为数据' as const, detail: '基于候选人在模拟工作场景中的消息处理和决策模式', reliability: '中' as const }],
      repairTasks: [],
      inviteScript: '',
      interviewFollowupQuestions: concerns.map((q) => `关于您关心的"${String(q).slice(0, 30)}"，能否展开说说？`).slice(0, 5),
      aiRiskNotes: ['此报告由本地系统生成，仅供参考。完整AI分析将在连接DeepSeek服务后可用。'],
      candidateTrustIndex: { total: 70, dimensions: {}, level: '中' as const },
      candidateFairnessIndex: { total: 85, dimensions: {}, level: '高' as const },
    };
  },

  /** Mock fallback: returns null to signal "use static getBranchScenarios()" */
  async generateScenario() {
    return { scenarios: null };
  },
};
