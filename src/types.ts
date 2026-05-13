export type Recommendation = '强推荐面试' | '建议进一步确认' | '暂缓邀约';

export type JobStatus = 'draft' | 'published';

export type CandidateStatus = '对话中' | '已投递' | '已邀约' | '已入库';

export type ConversationRole = 'avatar' | 'candidate';

export type RealityRoleType = 'hr' | 'teammate' | 'manager';

export type RealitySceneType = 'intro' | 'dayInLife' | 'taskChallenge';

export type AvatarProviderType = 'mockVideo' | 'liveAvatar' | 'synthesia';

export type Level = '高' | '中' | '低';

export type TruthScale = '高' | '中高' | '中' | '低';

export type JobUnderstandingLevel = '清晰' | '部分清晰' | '存在偏差';

export type HRActionSuggestion = '优先邀约' | '建议补充确认' | '建议入库观察';

export type ReverseQuestionType = '工作节奏' | '薪资福利' | '团队氛围' | '成长空间' | '岗位挑战' | '面试流程';

export type JobTruthSource = '岗位职责' | '任职要求' | '团队介绍' | '面试流程' | 'HR配置';

export interface JobAnalysis {
  summary: string;
  hardSkills: string[];
  softSkills: string[];
  sellingPoints: string[];
  riskPoints: string[];
  faq: string[];
}

export interface JobRealityRisk {
  clarity: Level;
  misunderstandingRisk: Level;
  missingInfo: string[];
  suggestions: string[];
  realityTags: string[];
}

export interface JobInput {
  title: string;
  department: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  education: string;
  experience: string;
  responsibilities: string;
  requirements: string;
  teamInfo: string;
  growthPath: string;
  interviewProcess: string;
  workload: string;
  challenges: string;
}

export interface Job extends JobInput {
  id: string;
  companyId: string;
  status: JobStatus;
  createdAt: string;
  analysis: JobAnalysis;
}

export interface AvatarConfig {
  id: string;
  jobId: string;
  name: string;
  identity: string;
  style: '严谨专业' | '轻松友好' | '专业且友好';
  duration: '3分钟快聊' | '8分钟标准聊' | '15分钟深聊';
  focusTopics: string[];
  forbiddenTopics: string[];
  openingScript: string;
}

export interface CandidateProfileInput {
  name: string;
  phone: string;
  email: string;
  sourceChannel: string;
  skills: string;
  projectExperience: string;
  motivation: string;
  concerns: string;
  rhythmAcceptance?: string;
  followUpQuestion?: string;
  scenarioReflection?: string;
}

export interface Candidate extends CandidateProfileInput {
  id: string;
  jobId: string;
  status: CandidateStatus;
  conversationId: string;
  submittedAt: string;
}

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  text: string;
  intent: string;
  createdAt: string;
}

export interface ConversationDraft {
  id: string;
  jobId: string;
  messages: ConversationMessage[];
  updatedAt: string;
}

export interface Conversation {
  id: string;
  candidateId: string;
  jobId: string;
  messages: ConversationMessage[];
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  status: 'completed' | 'direct_apply';
}

export interface HRStoryCard {
  id: string;
  candidateId: string;
  jobId: string;
  recommendation: Recommendation;
  selfIntro: string;
  jobUnderstanding: string;
  skillTags: string[];
  projectEvidence: string[];
  intentionSignals: string[];
  riskFlags: string[];
  interviewQuestions: string[];
  complianceStatement: string;
  createdAt: string;
}

export interface CandidateStoryPreview {
  candidateId: string;
  jobId: string;
  myJobUnderstanding: string;
  mySkillTags: string[];
  myConcerns: string[];
  applicationSuggestion: string;
  nextStep: string;
}

export interface RealityRole {
  id: string;
  jobId: string;
  type: RealityRoleType;
  name: string;
  title: string;
  persona: string;
  tone: string;
  responsibility: string;
  avatarImage?: string;
  videoUrl?: string;
  provider?: AvatarProviderType;
}

export interface RealityScene {
  id: string;
  jobId: string;
  type: RealitySceneType;
  roleType: RealityRoleType;
  title: string;
  script: string;
  candidateActions: string[];
  keySignals: string[];
}

export interface ScenarioChoice {
  id: string;
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
  signalTags: string[];
  analysis: {
    collaboration: string;
    riskAwareness: Level;
    communication: Level;
    technicalJudgment: '强' | '待确认' | '偏弱';
  };
}

export interface JobTruthLabel {
  jobId: string;
  workPace: TruthScale;
  collaborationDensity: Level;
  uncertainty: Level;
  overtimeVolatility: string;
  autonomy: Level;
  growthSpeed: Level;
  communicationCost: Level;
  pressureSources: string[];
  suitableFor: string[];
  notSuitableFor: string[];
  evidence: JobTruthEvidence[];
}

export interface JobTruthEvidence {
  label: string;
  value: string;
  source: JobTruthSource;
  evidenceText: string;
}

export interface BranchChoice {
  id: string;
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
  nextScenarioId?: string;
  analysis: {
    collaboration: string;
    riskAwareness: Level;
    communication: Level;
    technicalJudgment: '强' | '待确认' | '偏弱';
    executionStyle: string;
  };
}

export interface BranchScenario {
  id: string;
  jobId: string;
  round: 1 | 2 | 3;
  title: string;
  description: string;
  choices: BranchChoice[];
}

export interface DecisionPathAnalysis {
  collaboration: string;
  riskAwareness: Level;
  communication: Level;
  technicalJudgment: '强' | '待确认' | '偏弱';
  executionStyle: string;
  summary: string;
}

export interface ConcernRadar {
  salary: number;
  commute: number;
  growth: number;
  team: number;
  workload: number;
  roleClarity: number;
}

export interface ReverseQuestion {
  id: string;
  type: ReverseQuestionType;
  question: string;
  answer: string;
  createdAt: string;
}

export interface NoShowPreventionCard {
  possibleReasons: string[];
  preInviteActions: string[];
  invitationScript: string;
}

export interface InterviewBattleCard {
  interviewGoals: string[];
  keyQuestions: string[];
  needsClarification: string[];
  shouldExplain: string[];
  shouldAvoidAsking: string[];
}

export interface TruthVideoScript {
  jobId: string;
  title: string;
  segments: Array<{
    timeRange: string;
    roleType: RealityRoleType;
    title: string;
    script: string;
  }>;
  fullScript: string;
}

export interface TruthContractCommitment {
  id: string;
  title: string;
  detail: string;
  category: 'job' | 'process' | 'ai' | 'data';
}

export interface JobTruthContract {
  jobId: string;
  truthLabelId: string;
  commitments: TruthContractCommitment[];
  aiDecisionBoundary: string;
  dataUsageNotice: string;
}

export interface TruthContractAcknowledgement {
  acknowledged: boolean;
  acknowledgedItems: string[];
  unresolvedConcerns: string[];
  acknowledgedAt?: string;
}

export type TrialEventType =
  | 'truth_label_viewed'
  | 'truth_point_focused'
  | 'truth_contract_acknowledged'
  | 'truth_contract_concern_added'
  | 'trial_started'
  | 'scene_completed'
  | 'branch_choice_selected'
  | 'reverse_question_asked'
  | 'profile_submitted'
  | 'candidate_exit_reason'
  | 'direct_apply';

export interface TrialEvent {
  id: string;
  type: TrialEventType;
  label: string;
  occurredAt: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface TrialReplayEvent extends TrialEvent {
  timeLabel: string;
}

export interface CandidateTrustIndex {
  total: number;
  dimensions: {
    jobInfoClarity: number;
    salaryCertainty: number;
    teamTrust: number;
    growthCredibility: number;
    rhythmAcceptance: number;
    aiTransparency: number;
    interviewWillingness: number;
  };
  gapReasons: string[];
  repairSuggestions: string[];
  explanation: string;
}

export interface TrustGapSummary {
  majorGaps: string[];
  repairSuggestions: string[];
}

export interface AIRiskReview {
  result: '复核通过' | '需要人工确认';
  checkedItems: string[];
  reminders: string[];
}

export interface TrustNegotiationCard {
  candidateQuestions: string[];
  hrClarifications: string[];
  trustRepairScript: string;
  formalInvitationScript: string;
}

export interface InterviewMutualConfirmation {
  candidateConfirmedItems: string[];
  unresolvedReasons: string[];
  hrCommitments: string[];
  confirmedAt?: string;
}

export interface CandidateFairnessIndex {
  total: number;
  dimensions: {
    aiDisclosure: number;
    dataUsageNotice: number;
    directApplyPath: number;
    humanReview: number;
    explanationAndDeletion: number;
    sensitiveDataAvoidance: number;
    feedbackTiming: number;
  };
  optimizationSuggestions: string[];
}

export type TrustLoopNodeStatus = '已完成' | '有缺口' | '需HR补充';

export interface TrustLoopNode {
  id: string;
  title: string;
  status: TrustLoopNodeStatus;
  summary: string;
  anchor: string;
}

export interface TrustGapDiagnosisItem {
  type: '信息缺口' | '情绪缺口' | '证据缺口' | '承诺缺口';
  trigger: string;
  impact: string;
  repairAction: string;
  repairScript: string;
}

export interface CommitmentConsistencyCheck {
  riskLevel: Level;
  findings: string[];
  suggestions: string[];
}

export type CandidateExitReason =
  | '岗位节奏不适合'
  | '薪资信息不明确'
  | '成长路径不清晰'
  | '工作内容不符合预期'
  | 'AI流程让我不放心'
  | '暂时没有时间'
  | '其他';

export interface AIAdviceRelianceNotice {
  evidenceSupportedCount: number;
  needsHumanConfirmationCount: number;
  reminders: string[];
}

export type TrustAuditEventType =
  | 'job_truth_label_generated'
  | 'truth_contract_acknowledged'
  | 'truth_point_viewed'
  | 'branch_choice_completed'
  | 'trust_repair_suggestion_generated'
  | 'ai_risk_review_completed'
  | 'hr_report_viewed'
  | 'hr_invitation_sent';

export interface TrustAuditEvent {
  id: string;
  candidateId: string;
  jobId: string;
  type: TrustAuditEventType;
  actor: 'system' | 'candidate' | 'ai' | 'hr';
  title: string;
  description: string;
  occurredAt: string;
  evidenceLevel: '充分' | '需人工确认';
}

export interface SilenceRisk {
  level: Level;
  possibleReasons: string[];
  suggestedActions: string[];
  wakeUpScript: string;
}

export interface TrustRepairTask {
  id: string;
  candidateId: string;
  candidateName: string;
  title: string;
  trigger: string;
  suggestedAction: string;
  source: '信任缺口' | '沉默风险' | '承诺一致性' | 'AI风险复核';
  status: '待处理' | '已处理';
  createdAt: string;
  handledAt?: string;
}

export interface TrialSession {
  id: string;
  jobId: string;
  candidateId?: string;
  currentSceneId: string;
  completedSceneIds: string[];
  askedTopics: string[];
  selectedChoiceIds: string[];
  branchChoiceIds: string[];
  viewedTruthPoints: string[];
  focusedTruthPoints: string[];
  reverseQuestions: ReverseQuestion[];
  truthContractAcknowledgement: TruthContractAcknowledgement;
  mutualConfirmation: InterviewMutualConfirmation;
  trialEvents: TrialEvent[];
  exitReason?: CandidateExitReason;
  directApply: boolean;
  startedAt: string;
  completedAt?: string;
  completionRate: number;
}

export interface RealityReport {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  trialCompletion: number;
  realIntention: Level;
  jobUnderstanding: JobUnderstandingLevel;
  noShowRisk: Level;
  attentionMap: {
    growth: number;
    salary: number;
    team: number;
    workload: number;
    technology: number;
  };
  jobTruthViewSummary: {
    viewed: boolean;
    viewedPoints: string[];
    focusedPoints: string[];
  };
  truthContractSummary: {
    acknowledged: boolean;
    acknowledgedItems: string[];
    unresolvedConcerns: string[];
  };
  candidateTrustIndex: CandidateTrustIndex;
  trustGapSummary: TrustGapSummary;
  trustRepairScript: string;
  trialReplay: TrialReplayEvent[];
  aiRiskReview: AIRiskReview;
  trustNegotiationCard: TrustNegotiationCard;
  mutualConfirmation: InterviewMutualConfirmation;
  candidateFairnessIndex: CandidateFairnessIndex;
  trustLoopGraph: TrustLoopNode[];
  trustGapDiagnosis: TrustGapDiagnosisItem[];
  commitmentConsistencyCheck: CommitmentConsistencyCheck;
  aiAdviceRelianceNotice: AIAdviceRelianceNotice;
  candidateExitReason?: CandidateExitReason;
  trustAuditLog: TrustAuditEvent[];
  silenceRisk: SilenceRisk;
  trustRepairTasks: TrustRepairTask[];
  auditCompletenessRate: number;
  decisionPathAnalysis: DecisionPathAnalysis;
  concernRadar: ConcernRadar;
  sceneChoiceSummary: string[];
  skillEvidence: string[];
  potentialMismatchRisks: string[];
  noShowPreventionCard: NoShowPreventionCard;
  interviewBattleCard: InterviewBattleCard;
  invitationScript: string;
  reverseQuestions: ReverseQuestion[];
  interviewQuestions: string[];
  hrActionSuggestion: HRActionSuggestion;
  evidenceSources: {
    fromTrialScenes: string[];
    fromCandidateInput: string[];
    fromScenarioChoices: string[];
    fromJobTruthLabel: string[];
  };
  complianceNote: string;
}

export interface FunnelMetrics {
  visits: number;
  chatStarts: number;
  chatCompletions: number;
  applications: number;
  highIntentCandidates: number;
  interviewInvites: number;
  attendedInterviews: number;
  hires: number;
  trialStarts?: number;
  trialCompletions?: number;
  trialDropOffs?: number;
  misunderstandingCandidates?: number;
  savedInterviewEstimate?: number;
  savedHrHoursEstimate?: number;
  talentPoolAdds?: number;
  truthLabelViews?: number;
  branchTrialCompletions?: number;
  highConcernCandidates?: number;
  preInviteSuggestionCoverage?: number;
  invitationScriptsGenerated?: number;
  battleCardsGenerated?: number;
  averageTrustIndex?: number;
  highTrustCandidateRatio?: number;
  truthContractAcknowledgements?: number;
  aiRiskReviewPasses?: number;
  lowTrustReasonTop3?: string[];
  mutualConfirmations?: number;
  highConfirmationCandidateRatio?: number;
  unconfirmedReasonTop3?: string[];
  candidateFairnessIndex?: number;
  commitmentConsistencyIssues?: number;
  evidenceSupportedAdviceCount?: number;
  humanConfirmationAdviceCount?: number;
  candidateExitReasonTop3?: string[];
  pendingTrustRepairTasks?: number;
  handledTrustRepairTasks?: number;
  highSilenceRiskCandidates?: number;
  auditCompletenessRate?: number;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  location: string;
  description: string;
}

export interface DemoState {
  company: Company;
  jobs: Job[];
  avatars: AvatarConfig[];
  realityRoles: RealityRole[];
  realityScenes: RealityScene[];
  jobTruthLabels: JobTruthLabel[];
  jobTruthContracts: JobTruthContract[];
  branchScenarios: BranchScenario[];
  truthVideoScripts: TruthVideoScript[];
  trustAuditEvents: TrustAuditEvent[];
  trustRepairTasks: TrustRepairTask[];
  trialSessions: TrialSession[];
  realityReports: RealityReport[];
  drafts: ConversationDraft[];
  candidates: Candidate[];
  conversations: Conversation[];
  storyCards: HRStoryCard[];
  metrics: FunnelMetrics;
}
