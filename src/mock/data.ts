import { buildDefaultAvatarConfig, generateHRStoryCard, parseJobDescription } from './ai';
import type { Candidate, Company, Conversation, DemoState, Job, JobInput } from '../types';

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

  return {
    company: demoCompany,
    jobs: [job],
    avatars: [avatar],
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
    },
  };
}
