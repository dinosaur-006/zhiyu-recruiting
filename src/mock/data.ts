import {
  buildDefaultAvatarConfig,
  createDefaultRealityRoles,
  answerReverseQuestion,
  generateJobTruthLabel,
  generateJobTruthContract,
  generateHRStoryCard,
  generateRealityReport,
  generateRealityScripts,
  generateTruthVideoScript,
  getBranchScenarios,
  getScenarioChoices,
  parseJobDescription,
} from './ai';
import type { Candidate, Company, Conversation, DemoState, Job, JobInput, TrialSession } from '../types';

export const demoCompany: Company = {
  id: 'company-zhiyu-demo',
  name: '星河云智科技',
  industry: '企业服务 / AI招聘',
  size: '100-300人',
  location: '北京',
  description: '一家服务B端客户的成长型科技公司，重视清晰沟通、真实岗位信息和高质量人才匹配。',
};

export const demoJobInput: JobInput = {
  title: '前端开发工程师',
  department: '研发部',
  location: '北京 · 海淀',
  salaryMin: 20,
  salaryMax: 35,
  education: '本科',
  experience: '1-3年',
  responsibilities: '负责B端SaaS产品前端开发、组件化建设、接口联调、代码评审和前端体验优化。',
  requirements: '熟悉Vue、React、TypeScript，有B端后台或SaaS项目经验，重视代码质量和团队协作。',
  teamInfo: '团队重视技术氛围、Code Review和跨职能协作，产品、设计、研发每周同步需求重点。',
  growthPath: '可从业务模块负责人逐步成长为前端方向Owner，参与架构优化和新人辅导。',
  interviewProcess: 'HR初沟 - 技术一面 - 业务终面 - Offer沟通',
  workload: '整体节奏较快，关键版本节点需要集中协作，但会提前规划排期。',
  challenges: '业务场景复杂，需要处理复杂表单、权限配置、数据可视化和跨部门沟通。',
};

export function createInitialState(): DemoState {
  const job: Job = {
    ...demoJobInput,
    id: 'job-frontend-001',
    companyId: demoCompany.id,
    status: 'published',
    createdAt: '2026-05-13T09:00:00.000Z',
    analysis: parseJobDescription(demoJobInput),
  };

  const avatar = buildDefaultAvatarConfig(job);
  const realityRoles = createDefaultRealityRoles(job.id);
  const realityScenes = generateRealityScripts(job);
  const jobTruthLabel = generateJobTruthLabel(job);
  const jobTruthContract = generateJobTruthContract(job, jobTruthLabel);
  const branchScenarios = getBranchScenarios(job);
  const branchChoices = branchScenarios.map((scenario) => scenario.choices[1]);
  const truthVideoScript = generateTruthVideoScript(job, realityRoles, realityScenes);
  const candidate: Candidate = {
    id: 'candidate-lin-001',
    jobId: job.id,
    conversationId: 'conversation-lin-001',
    name: '林同学',
    phone: '13800000000',
    email: 'lin@example.com',
    sourceChannel: '校园招聘二维码',
    skills: 'Vue、React、TypeScript、SaaS后台',
    projectExperience: '在课程项目和实习中参与SaaS后台开发，负责组件封装、接口联调和页面性能优化。',
    motivation: '希望进入技术氛围更强、成长路径更清晰的团队。',
    concerns: '成长空间、团队技术氛围',
    rhythmAcceptance: '可以接受阶段性项目节点压力，希望提前了解排期机制。',
    followUpQuestion: '想进一步确认团队Code Review和新人培养方式。',
    scenarioReflection: '我会先和后端约定Mock字段，同时同步产品确认优先级。',
    status: '已投递',
    submittedAt: '2026-05-13T09:20:00.000Z',
  };
  const conversation: Conversation = {
    id: candidate.conversationId,
    candidateId: candidate.id,
    jobId: job.id,
    startedAt: '2026-05-13T09:10:00.000Z',
    endedAt: '2026-05-13T09:18:00.000Z',
    durationSeconds: 482,
    status: 'completed',
    messages: [
      {
        id: 'msg-001',
        role: 'avatar',
        text: avatar.openingScript,
        intent: '开场说明',
        createdAt: '2026-05-13T09:10:00.000Z',
      },
      {
        id: 'msg-002',
        role: 'candidate',
        text: '这个岗位日常工作是什么？',
        intent: '岗位职责',
        createdAt: '2026-05-13T09:11:00.000Z',
      },
      {
        id: 'msg-003',
        role: 'candidate',
        text: '团队技术氛围怎么样？我比较关注成长。',
        intent: '团队氛围',
        createdAt: '2026-05-13T09:12:00.000Z',
      },
      {
        id: 'msg-004',
        role: 'candidate',
        text: '我做过Vue、React和TypeScript相关的SaaS后台项目。',
        intent: '候选人经历',
        createdAt: '2026-05-13T09:13:00.000Z',
      },
    ],
  };
  const storyCard = generateHRStoryCard(candidate, job, conversation);
  const selectedChoice = getScenarioChoices().find((choice) => choice.label === 'B') ?? getScenarioChoices()[0];
  const trialSession: TrialSession = {
    id: 'trial-lin-001',
    jobId: job.id,
    candidateId: candidate.id,
    currentSceneId: realityScenes[2].id,
    completedSceneIds: realityScenes.map((scene) => scene.id),
    askedTopics: ['岗位职责', '团队氛围', '成长空间', '工作节奏', '技术挑战'],
    selectedChoiceIds: [selectedChoice.id],
    branchChoiceIds: branchChoices.map((choice) => choice.id),
    viewedTruthPoints: ['工作节奏', '协作密度', '成长速度', '压力来源'],
    focusedTruthPoints: ['工作节奏', '成长速度'],
    reverseQuestions: [answerReverseQuestion(job, jobTruthLabel, '成长空间')],
    truthContractAcknowledgement: {
      acknowledged: true,
      acknowledgedItems: ['工作节奏说明', '加班波动说明', '成长路径说明', 'AI辅助边界', '候选人数据使用边界'],
      unresolvedConcerns: ['薪资沟通节点'],
      acknowledgedAt: '2026-05-13T09:11:30.000Z',
    },
    trialEvents: [
      { id: 'event-lin-001', type: 'truth_label_viewed', label: '进入岗位真相舱并查看岗位真相标签', occurredAt: '2026-05-13T09:10:00.000Z' },
      { id: 'event-lin-002', type: 'truth_point_focused', label: '重点查看：工作节奏', occurredAt: '2026-05-13T09:10:18.000Z' },
      { id: 'event-lin-003', type: 'truth_contract_acknowledged', label: '确认岗位真相合约', occurredAt: '2026-05-13T09:11:30.000Z' },
      { id: 'event-lin-004', type: 'scene_completed', label: '完成第一幕：HR数字人讲岗位概览', occurredAt: '2026-05-13T09:12:20.000Z' },
      { id: 'event-lin-005', type: 'scene_completed', label: '完成第二幕：未来同事讲真实一天', occurredAt: '2026-05-13T09:14:10.000Z' },
      { id: 'event-lin-006', type: 'branch_choice_selected', label: '完成分岔任务沙盘：主动推进路径', occurredAt: '2026-05-13T09:16:05.000Z' },
      { id: 'event-lin-007', type: 'reverse_question_asked', label: '反向提问：成长空间', occurredAt: '2026-05-13T09:16:50.000Z' },
      { id: 'event-lin-008', type: 'profile_submitted', label: '补充B端SaaS项目经历', occurredAt: '2026-05-13T09:18:00.000Z' },
    ],
    directApply: false,
    startedAt: '2026-05-13T09:10:00.000Z',
    completedAt: '2026-05-13T09:18:00.000Z',
    completionRate: 100,
  };
  const realityReport = generateRealityReport(candidate, job, trialSession, [selectedChoice], branchChoices, jobTruthLabel);

  return {
    company: demoCompany,
    jobs: [job],
    avatars: [avatar],
    realityRoles,
    realityScenes,
    jobTruthLabels: [jobTruthLabel],
    jobTruthContracts: [jobTruthContract],
    branchScenarios,
    truthVideoScripts: [truthVideoScript],
    trialSessions: [trialSession],
    realityReports: [realityReport],
    drafts: [],
    candidates: [candidate],
    conversations: [conversation],
    storyCards: [storyCard],
    metrics: {
      visits: 128,
      chatStarts: 64,
      chatCompletions: 38,
      applications: 18,
      highIntentCandidates: 7,
      interviewInvites: 4,
      attendedInterviews: 3,
      hires: 1,
      trialStarts: 64,
      trialCompletions: 38,
      trialDropOffs: 26,
      misunderstandingCandidates: 11,
      savedInterviewEstimate: 8,
      savedHrHoursEstimate: 6,
      talentPoolAdds: 5,
      truthLabelViews: 42,
      branchTrialCompletions: 24,
      highConcernCandidates: 9,
      preInviteSuggestionCoverage: 18,
      invitationScriptsGenerated: 18,
      battleCardsGenerated: 18,
      averageTrustIndex: realityReport.candidateTrustIndex.total,
      highTrustCandidateRatio: 62,
      truthContractAcknowledgements: 31,
      aiRiskReviewPasses: 18,
      lowTrustReasonTop3: ['薪资沟通节点', '工作节奏', '成长路径'],
    },
  };
}
