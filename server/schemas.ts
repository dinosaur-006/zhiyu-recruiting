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

const riskLevels = ['高', '中', '低'] as const;
const judgmentLevels = ['强', '待确认', '偏弱'] as const;

function asRiskLevel(v: unknown): string {
  return typeof v === 'string' && riskLevels.includes(v as typeof riskLevels[number]) ? v : '中';
}
function asJudgment(v: unknown): string {
  return typeof v === 'string' && judgmentLevels.includes(v as typeof judgmentLevels[number]) ? v : '待确认';
}

export function validateScenario(value: unknown) {
  const record = asRecord(value);
  const scenarios = Array.isArray(record.scenarios) ? record.scenarios.map(asRecord) : [];
  return {
    scenarios: scenarios.map((s) => ({
      title: asString(s.title),
      description: asString(s.description),
      competencyAnchor: asString(s.competencyAnchor),
      choices: (Array.isArray(s.choices) ? s.choices.map(asRecord) : []).map((c) => ({
        label: ['A', 'B', 'C', 'D'].includes(asString(c.label)) ? asString(c.label) : 'A',
        text: asString(c.text),
        analysis: {
          collaboration: asString(c.analysis?.collaboration || asString((c as Record<string,unknown>).analysis && (c as Record<string,unknown>).analysis && typeof (c as Record<string,unknown>).analysis === 'object' ? ((c as Record<string,unknown>).analysis as Record<string,unknown>).collaboration : '')),
          riskAwareness: asRiskLevel(c.analysis?.riskAwareness),
          communication: asRiskLevel(c.analysis?.communication),
          technicalJudgment: asJudgment(c.analysis?.technicalJudgment),
          executionStyle: asString(c.analysis?.executionStyle),
        },
      })),
    })),
  };
}

export function validateChatResponse(value: unknown) {
  const record = asRecord(value);
  return {
    response: asString(record.response),
    suggestedFollowUps: asStringArray(record.suggestedFollowUps).slice(0, 3),
  };
}

export function validateInteractResponse(value: unknown) {
  const record = asRecord(value);

  const evalRecord = record.evaluation ? asRecord(record.evaluation) : null;
  const msgRecord = record.followUpMessage ? asRecord(record.followUpMessage) : null;
  const consRecord = record.consequences ? asRecord(record.consequences) : null;

  const senderRecord = msgRecord?.sender ? asRecord(msgRecord.sender) : null;

  return {
    evaluation: evalRecord ? {
      professionalism: Math.max(0, Math.min(100, Number(evalRecord.professionalism) || 50)),
      empathy: Math.max(0, Math.min(100, Number(evalRecord.empathy) || 50)),
      clarity: Math.max(0, Math.min(100, Number(evalRecord.clarity) || 50)),
      actionability: Math.max(0, Math.min(100, Number(evalRecord.actionability) || 50)),
      conciseness: Math.max(0, Math.min(100, Number(evalRecord.conciseness) || 50)),
      overallScore: Math.max(0, Math.min(100, Number(evalRecord.overallScore) || 50)),
      strengths: asStringArray(evalRecord.strengths).slice(0, 5),
      improvements: asStringArray(evalRecord.improvements).slice(0, 5),
    } : undefined,
    followUpMessage: msgRecord ? {
      id: asString(msgRecord.id, `fup-${Date.now()}`),
      type: asString(msgRecord.type, 'follow_up'),
      sender: senderRecord ? {
        name: asString(senderRecord.name, '系统'),
        role: asString(senderRecord.role, 'teammate'),
        avatarInitials: asString(senderRecord.avatarInitials, '系'),
        department: senderRecord.department ? asString(senderRecord.department) : undefined,
      } : { name: '系统', role: 'teammate', avatarInitials: '系' },
      subject: asString(msgRecord.subject, 'Re: 消息'),
      content: asString(msgRecord.content, '(内容生成失败)'),
      urgency: asLevel(msgRecord.urgency as Level, 'medium'),
      scheduledArrivalSeconds: Number(msgRecord.scheduledArrivalSeconds) || 0,
      expectedResponseType: 'reply',
      competencyTags: asStringArray(msgRecord.competencyTags),
      handled: false,
      attachments: Array.isArray(msgRecord.attachments) ? msgRecord.attachments as any[] : undefined,
    } : undefined,
    consequences: consRecord ? {
      deferResurfaceSeconds: consRecord.deferResurfaceSeconds ? Number(consRecord.deferResurfaceSeconds) : undefined,
      escalationUrgency: asLevel(consRecord.escalationUrgency as Level, 'medium'),
      stakeholderNotified: consRecord.stakeholderNotified === true,
      escalationMessage: asString(consRecord.escalationMessage),
    } : undefined,
  };
}

export function validateInsight(value: unknown) {
  const record = asRecord(value);
  const strengths = Array.isArray(record.strengths) ? record.strengths.map(asRecord) : [];
  return {
    strengths: strengths.map((s) => ({
      label: asString(s.label),
      evidenceAnchors: asStringArray(s.evidenceAnchors),
    })),
    discussionTopics: asStringArray(record.discussionTopics),
    interviewQuestions: asStringArray(record.interviewQuestions),
    candidateQuestionsForHR: asStringArray(record.candidateQuestionsForHR),
    careerTips: asStringArray(record.careerTips),
    fitSummary: asString(record.fitSummary),
  };
}

// ─── Extract Profile ───────────────────────────────────────────

interface QuoteVerificationResult {
  valid: boolean;
  reason: string;
}

function verifyQuoteInCorpus(quoteText: string, corpus: string): QuoteVerificationResult {
  if (!quoteText || quoteText.trim().length === 0) {
    return { valid: false, reason: 'quoteText 为空' };
  }

  // 1. 完全匹配
  if (corpus.includes(quoteText)) return { valid: true, reason: '' };

  // 2. 模糊容错：去首尾标点/空白后重试（AI 有时会多包一个句号）
  const trimmed = quoteText.trim().replace(/^[，,。.！!？?「」『』""''\s]+|[，,。.！!？?「」『』""''\s]+$/g, '');
  if (trimmed.length >= 5 && corpus.includes(trimmed)) {
    return { valid: true, reason: '模糊匹配通过（去首尾标点）' };
  }

  // 3. 短句精确子串匹配——截取 quoteText 的核心部分（去前5后3字再试）
  if (trimmed.length > 15) {
    const core = trimmed.slice(5, -3);
    if (core.length >= 6 && corpus.includes(core)) {
      return { valid: true, reason: '核心子串匹配通过' };
    }
  }

  return {
    valid: false,
    reason: `quoteText 在对话原文中未找到匹配。截断预览: "${quoteText.slice(0, 60)}${quoteText.length > 60 ? '...' : ''}"`,
  };
}

export function validateExtractedProfile(value: unknown, dialogueCorpus: string) {
  const record = asRecord(value);

  const quoteViolations: string[] = [];

  function processItems<T>(
    items: unknown[],
    itemType: string,
    nameKey: string,
    extraKeys: string[] = [],
  ) {
    return items.map((item) => {
      const rec = asRecord(item);
      const name = asString(rec[nameKey]);
      const qt = asString(rec.quoteText);
      const result = verifyQuoteInCorpus(qt, dialogueCorpus);

      if (!result.valid) {
        quoteViolations.push(`[${itemType}] "${name}": ${result.reason}`);
      }

      const base: Record<string, unknown> = {
        [nameKey]: name,
        confidence: asLevel(rec.confidence, 'medium'),
        quoteText: qt,
        quoteVerified: result.valid,
        quoteMatchDetail: result.valid ? (result.reason || '完全匹配') : result.reason,
        reasoning: asString(rec.reasoning),
      };

      // 对 inferredTraits 额外保留 trait 键
      if (nameKey === 'label' && rec.trait) {
        base.trait = asString(rec.trait);
      }

      return base;
    });
  }

  const skills = Array.isArray(record.skills) ? record.skills.map(asRecord) : [];
  const traits = Array.isArray(record.inferredTraits) ? record.inferredTraits.map(asRecord) : [];
  const concerns = Array.isArray(record.concerns) ? record.concerns.map(asRecord) : [];

  const selfReported = asRecord(record.selfReportedProfile);
  const metadata = asRecord(record.extractionMetadata);

  const totalItems = skills.length + traits.length + concerns.length;
  const verifiedCount = totalItems > 0
    ? [...processItems(skills, 'skill', 'name'), ...processItems(traits, 'trait', 'label'), ...processItems(concerns, 'concern', 'concern')]
        .filter((item) => item.quoteVerified).length
    : 0;

  return {
    skills: processItems(skills, 'skill', 'name'),
    inferredTraits: processItems(traits, 'trait', 'label'),
    concerns: processItems(concerns, 'concern', 'concern'),
    selfReportedProfile: {
      rawSkills: asStringArray(selfReported.rawSkills),
      yearsOfExperience: selfReported.yearsOfExperience ? asString(selfReported.yearsOfExperience) : null,
      currentRole: selfReported.currentRole ? asString(selfReported.currentRole) : null,
    },
    extractionMetadata: {
      totalDialogueTurns: Number(metadata.totalDialogueTurns) || 0,
      extractableTurns: Number(metadata.extractableTurns) || 0,
      lowConfidenceNote: metadata.lowConfidenceNote ? asString(metadata.lowConfidenceNote) : null,
    },
    _meta: {
      quoteViolations,
      quoteVerificationRate:
        totalItems === 0
          ? 'N/A — 无萃取条目'
          : `${Math.round((verifiedCount / totalItems) * 100)}% (${verifiedCount}/${totalItems} 条通过原文校验)`,
    },
  };
}
