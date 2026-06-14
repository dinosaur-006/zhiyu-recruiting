import type {
  AIAdviceEvidenceTag,
  ConcernRadar,
  AiGenerationMeta,
  JobAnalysis,
  RealityReport,
  TrustRepairTask,
} from '../../types';

export interface AiJobAnalysisResponse {
  roleSummary?: string;
  coreResponsibilities?: string[];
  hardRequirements?: string[];
  softRequirements?: string[];
  truthTags?: Array<{
    label: string;
    level: 'low' | 'medium' | 'high';
    evidence: string;
  }>;
  pressureSources?: string[];
  missingInformation?: string[];
  candidatePossibleConcerns?: string[];
  hrFollowupQuestions?: string[];
}

export interface AiHrReportResponse {
  summary?: string;
  mainConcerns?: Array<{
    tag: 'salary' | 'growth' | 'workload' | 'team' | 'stability' | 'interview' | 'location' | 'role_scope';
    level: 'low' | 'medium' | 'high';
    explanation: string;
  }>;
  trustGapLevel?: 'low' | 'medium' | 'high';
  evidenceItems?: Array<{
    source: 'job_truth_contract' | 'sandbox_choice' | 'candidate_question' | 'profile_supplement';
    label: string;
    content: string;
  }>;
  repairTasks?: Array<{
    title: string;
    priority: 'low' | 'medium' | 'high';
    action: string;
  }>;
  inviteScript?: string;
  interviewFollowupQuestions?: string[];
  aiRiskNotes?: string[];
}

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

export function adaptAiJobAnalysis(aiAnalysis: AiJobAnalysisResponse): JobAnalysis {
  const existing = aiAnalysis as Partial<JobAnalysis>;
  if (existing.summary || existing.hardSkills || existing.softSkills) {
    return {
      summary: existing.summary || 'AI已完成岗位真相解析，建议HR继续补充岗位节奏、协作方式和面试流程。',
      hardSkills: existing.hardSkills ?? [],
      softSkills: existing.softSkills ?? [],
      sellingPoints: existing.sellingPoints ?? [],
      riskPoints: existing.riskPoints ?? [],
      faq: existing.faq ?? [],
    };
  }

  const truthRisks = (aiAnalysis.truthTags ?? [])
    .filter((tag) => tag.level !== 'low')
    .map((tag) => `${tag.label}：${tag.evidence}`);

  return {
    summary: aiAnalysis.roleSummary || 'AI已完成岗位真相解析，建议HR继续补充岗位节奏、协作方式和面试流程。',
    hardSkills: unique(aiAnalysis.hardRequirements ?? []),
    softSkills: unique(aiAnalysis.softRequirements ?? []),
    sellingPoints: unique([...(aiAnalysis.coreResponsibilities ?? []), ...(aiAnalysis.pressureSources ?? []).map((item) => `真实压力来源：${item}`)]),
    riskPoints: unique([...(aiAnalysis.missingInformation ?? []), ...truthRisks, ...(aiAnalysis.candidatePossibleConcerns ?? [])]),
    faq: unique(aiAnalysis.hrFollowupQuestions ?? []),
  };
}

export function adaptAiReportToRealityReport(
  baseReport: RealityReport,
  aiReport: AiHrReportResponse,
  aiMeta?: AiGenerationMeta,
): RealityReport {
  const concernRadar = adaptConcernRadar(baseReport.concernRadar, aiReport.mainConcerns ?? []);
  const majorGaps = unique([
    ...baseReport.trustGapSummary.majorGaps,
    ...(aiReport.mainConcerns ?? []).filter((item) => item.level !== 'low').map((item) => concernLabel(item.tag)),
    ...(aiReport.repairTasks ?? []).map((task) => task.title),
  ]);
  const repairSuggestions = unique([
    ...baseReport.trustGapSummary.repairSuggestions,
    ...(aiReport.repairTasks ?? []).map((task) => task.action),
  ]);
  const evidenceTags = adaptEvidenceTags(baseReport, aiReport);
  const trustRepairTasks = adaptRepairTasks(baseReport, aiReport);
  const riskNotes = aiReport.aiRiskNotes?.length
    ? aiReport.aiRiskNotes
    : ['AI仅整理候选人的关注点、信息缺口和沟通建议，最终决策由人工完成。'];

  return {
    ...baseReport,
    aiMeta: aiMeta ?? baseReport.aiMeta,
    humanReviewStatus: baseReport.humanReviewStatus ?? 'pending',
    reviewedAt: baseReport.reviewedAt,
    concernRadar,
    trustGapSummary: {
      majorGaps,
      repairSuggestions,
    },
    trustRepairScript: aiReport.inviteScript || baseReport.trustRepairScript,
    trustRepairTasks,
    adviceEvidenceTags: evidenceTags,
    aiAdviceRelianceNotice: {
      ...baseReport.aiAdviceRelianceNotice,
      evidenceSupportedCount: evidenceTags.filter((tag) => tag.status === '有行为证据').length,
      needsHumanConfirmationCount: evidenceTags.filter((tag) => tag.status === '需人工确认').length,
    },
    aiRiskReview: {
      result: baseReport.aiRiskReview.result,
      checkedItems: unique([...baseReport.aiRiskReview.checkedItems, '真实AI输出已经过结构校验和禁用表达清理']),
      reminders: unique([...baseReport.aiRiskReview.reminders, ...riskNotes]),
    },
    invitationScript: aiReport.inviteScript || baseReport.invitationScript,
    interviewQuestions: unique([...(aiReport.interviewFollowupQuestions ?? []), ...baseReport.interviewQuestions]),
    skillEvidence: unique([...baseReport.skillEvidence, ...(aiReport.evidenceItems ?? []).map((item) => item.content)]),
    evidenceSources: {
      ...baseReport.evidenceSources,
      fromCandidateInput: unique([
        ...baseReport.evidenceSources.fromCandidateInput,
        ...(aiReport.evidenceItems ?? []).filter((item) => item.source === 'profile_supplement').map((item) => item.label),
      ]),
      fromScenarioChoices: unique([
        ...baseReport.evidenceSources.fromScenarioChoices,
        ...(aiReport.evidenceItems ?? []).filter((item) => item.source === 'sandbox_choice').map((item) => item.label),
      ]),
    },
  };
}

function adaptConcernRadar(
  baseRadar: ConcernRadar,
  concerns: NonNullable<AiHrReportResponse['mainConcerns']>,
): ConcernRadar {
  return concerns.reduce(
    (radar, concern) => {
      const value = concern.level === 'high' ? 88 : concern.level === 'medium' ? 68 : 42;
      if (concern.tag === 'salary') radar.salary = Math.max(radar.salary, value);
      if (concern.tag === 'growth') radar.growth = Math.max(radar.growth, value);
      if (concern.tag === 'workload') radar.workload = Math.max(radar.workload, value);
      if (concern.tag === 'team') radar.team = Math.max(radar.team, value);
      if (concern.tag === 'location') radar.commute = Math.max(radar.commute, value);
      if (concern.tag === 'role_scope') radar.roleClarity = Math.max(radar.roleClarity, value);
      return radar;
    },
    { ...baseRadar },
  );
}

function adaptEvidenceTags(baseReport: RealityReport, aiReport: AiHrReportResponse): AIAdviceEvidenceTag[] {
  const aiTags =
    aiReport.evidenceItems?.map((item, index) => ({
      id: `ai-evidence-${baseReport.id}-${index}`,
      advice: item.label,
      status: '有行为证据' as const,
      evidence: [`${sourceLabel(item.source)}：${item.content}`],
      reason: '来自真实AI报告的结构化证据项。',
    })) ?? [];

  return [...aiTags, ...baseReport.adviceEvidenceTags];
}

function adaptRepairTasks(baseReport: RealityReport, aiReport: AiHrReportResponse): TrustRepairTask[] {
  const aiTasks =
    aiReport.repairTasks?.map((task, index) => ({
      id: `ai-task-${baseReport.id}-${index}`,
      candidateId: baseReport.candidateId,
      candidateName: baseReport.candidateName,
      title: task.title,
      trigger: task.priority === 'high' ? '真实AI识别为高优先级信任缺口' : '真实AI识别的沟通补充项',
      suggestedAction: task.action,
      source: '信任缺口' as const,
      status: '待处理' as const,
      createdAt: new Date().toISOString(),
      beforeTrustScore: baseReport.candidateTrustIndex.total,
      estimatedAfterTrustScore: Math.min(100, baseReport.candidateTrustIndex.total + (task.priority === 'high' ? 10 : 6)),
      estimatedImpact: ['AI辅助估算：降低候选人信息不确定性', 'AI辅助估算：提升邀约前沟通清晰度'],
    })) ?? [];

  return [...aiTasks, ...baseReport.trustRepairTasks];
}

function concernLabel(tag: NonNullable<AiHrReportResponse['mainConcerns']>[number]['tag']) {
  const labels = {
    salary: '薪资沟通节点',
    growth: '成长路径',
    workload: '工作节奏',
    team: '团队氛围',
    stability: '稳定性信息',
    interview: '面试流程',
    location: '地点通勤',
    role_scope: '岗位职责边界',
  };
  return labels[tag];
}

function sourceLabel(source: NonNullable<AiHrReportResponse['evidenceItems']>[number]['source']) {
  const labels = {
    job_truth_contract: '岗位真相合约',
    sandbox_choice: '任务沙盘',
    candidate_question: '候选人提问',
    profile_supplement: '资料补充',
  };
  return labels[source];
}
