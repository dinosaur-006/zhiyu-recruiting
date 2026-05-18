type Level = 'low' | 'medium' | 'high';

const levels: Level[] = ['low', 'medium', 'high'];
const concernTags = ['salary', 'growth', 'workload', 'team', 'stability', 'interview', 'location', 'role_scope'];
const evidenceSources = ['job_truth_contract', 'sandbox_choice', 'candidate_question', 'profile_supplement'];

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const asString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);

const asStringArray = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);

const asLevel = (value: unknown, fallback: Level = 'medium'): Level =>
  levels.includes(value as Level) ? (value as Level) : fallback;

export function parseJsonContent(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    throw new Error('AI returned invalid JSON');
  }
}

export function validateJobAnalysis(value: unknown) {
  const record = asRecord(value);
  const workRhythm = asRecord(record.workRhythm);
  const collaborationDensity = asRecord(record.collaborationDensity);
  const truthTags = Array.isArray(record.truthTags) ? record.truthTags.map(asRecord) : [];

  return {
    roleSummary: asString(record.roleSummary),
    coreResponsibilities: asStringArray(record.coreResponsibilities),
    hardRequirements: asStringArray(record.hardRequirements),
    softRequirements: asStringArray(record.softRequirements),
    truthTags: truthTags.map((tag) => ({
      label: asString(tag.label),
      level: asLevel(tag.level),
      evidence: asString(tag.evidence),
    })),
    workRhythm: {
      summary: asString(workRhythm.summary),
      riskLevel: asLevel(workRhythm.riskLevel),
      evidence: asString(workRhythm.evidence),
    },
    collaborationDensity: {
      level: asLevel(collaborationDensity.level),
      reason: asString(collaborationDensity.reason),
    },
    pressureSources: asStringArray(record.pressureSources),
    missingInformation: asStringArray(record.missingInformation),
    candidatePossibleConcerns: asStringArray(record.candidatePossibleConcerns),
    hrFollowupQuestions: asStringArray(record.hrFollowupQuestions),
    complianceWarnings: asStringArray(record.complianceWarnings),
  };
}

export function validateHrReport(value: unknown) {
  const record = asRecord(value);
  const concerns = Array.isArray(record.mainConcerns) ? record.mainConcerns.map(asRecord) : [];
  const evidenceItems = Array.isArray(record.evidenceItems) ? record.evidenceItems.map(asRecord) : [];
  const repairTasks = Array.isArray(record.repairTasks) ? record.repairTasks.map(asRecord) : [];

  return {
    summary: asString(record.summary),
    mainConcerns: concerns.map((concern) => ({
      tag: concernTags.includes(concern.tag as string) ? (concern.tag as string) : 'role_scope',
      level: asLevel(concern.level),
      explanation: asString(concern.explanation),
    })),
    trustGapLevel: asLevel(record.trustGapLevel),
    evidenceItems: evidenceItems.map((item) => ({
      source: evidenceSources.includes(item.source as string) ? (item.source as string) : 'profile_supplement',
      label: asString(item.label),
      content: asString(item.content),
    })),
    repairTasks: repairTasks.map((task) => ({
      title: asString(task.title),
      priority: asLevel(task.priority),
      action: asString(task.action),
    })),
    inviteScript: asString(record.inviteScript),
    interviewFollowupQuestions: asStringArray(record.interviewFollowupQuestions),
    aiRiskNotes: asStringArray(record.aiRiskNotes),
  };
}
