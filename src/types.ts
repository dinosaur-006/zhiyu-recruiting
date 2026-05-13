export type Recommendation = '强推荐面试' | '建议进一步确认' | '暂缓邀约';

export type JobStatus = 'draft' | 'published';

export type CandidateStatus = '对话中' | '已投递' | '已邀约';

export type ConversationRole = 'avatar' | 'candidate';

export interface JobAnalysis {
  summary: string;
  hardSkills: string[];
  softSkills: string[];
  sellingPoints: string[];
  riskPoints: string[];
  faq: string[];
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

export interface FunnelMetrics {
  visits: number;
  chatStarts: number;
  chatCompletions: number;
  applications: number;
  highIntentCandidates: number;
  interviewInvites: number;
  attendedInterviews: number;
  hires: number;
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
  drafts: ConversationDraft[];
  candidates: Candidate[];
  conversations: Conversation[];
  storyCards: HRStoryCard[];
  metrics: FunnelMetrics;
}
