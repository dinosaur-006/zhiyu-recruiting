import { describe, expect, it } from 'vitest';
import { buildDefaultAvatarConfig, generateAvatarReply, generateHRStoryCard, parseJobDescription } from './ai';
import type { Candidate, Conversation, Job } from '../types';

const jobInput = {
  title: '前端开发工程师',
  department: '研发部',
  location: '北京',
  salaryMin: 20,
  salaryMax: 35,
  education: '本科',
  experience: '1-3年',
  responsibilities: '负责B端产品前端开发、组件化建设、接口联调和代码评审。',
  requirements: '熟悉Vue、React、TypeScript，有SaaS项目经验。',
  teamInfo: '团队重视技术氛围和Code Review。',
  growthPath: '提供技术成长、架构能力和项目owner机会。',
  interviewProcess: 'HR初沟 - 技术一面 - 业务终面',
  workload: '节奏较快，关键节点需要协同推进。',
  challenges: '业务复杂度较高，需要处理复杂状态和跨部门沟通。',
};

const job: Job = {
  ...jobInput,
  id: 'job-test',
  companyId: 'company-test',
  status: 'published',
  createdAt: '2026-05-13T00:00:00.000Z',
  analysis: parseJobDescription(jobInput),
};

it('extracts recognizable hard skills from a JD', () => {
  expect(job.analysis.hardSkills).toEqual(expect.arrayContaining(['Vue', 'React', 'TypeScript']));
});

it('answers salary questions with salary range and HR confirmation boundary', () => {
  const reply = generateAvatarReply('薪资真实吗？', job, buildDefaultAvatarConfig(job));
  expect(reply).toContain('20k-35k');
  expect(reply).toContain('以HR沟通为准');
});

describe('generateHRStoryCard', () => {
  it('marks growth and technology interest when candidate repeatedly asks about those topics', () => {
    const candidate: Candidate = {
      id: 'candidate-test',
      jobId: job.id,
      conversationId: 'conversation-test',
      name: '林同学',
      phone: '13800000000',
      email: 'lin@example.com',
      sourceChannel: '校园招聘二维码',
      skills: 'Vue React TypeScript',
      projectExperience: '参与SaaS后台项目，负责组件化开发和接口联调。',
      motivation: '希望进入技术氛围更强的团队',
      concerns: '成长空间',
      status: '已投递',
      submittedAt: '2026-05-13T00:00:00.000Z',
    };
    const conversation: Conversation = {
      id: 'conversation-test',
      candidateId: candidate.id,
      jobId: job.id,
      startedAt: '2026-05-13T00:00:00.000Z',
      endedAt: '2026-05-13T00:06:00.000Z',
      durationSeconds: 360,
      status: 'completed',
      messages: [
        { id: 'm1', role: 'candidate', text: '团队技术氛围怎么样？', intent: '团队氛围', createdAt: '2026-05-13T00:00:00.000Z' },
        { id: 'm2', role: 'candidate', text: '成长路径如何？', intent: '成长发展', createdAt: '2026-05-13T00:01:00.000Z' },
        { id: 'm3', role: 'candidate', text: '我做过Vue和React的SaaS项目。', intent: '候选人经历', createdAt: '2026-05-13T00:02:00.000Z' },
      ],
    };

    const card = generateHRStoryCard(candidate, job, conversation);

    expect(card.skillTags).toEqual(expect.arrayContaining(['Vue', 'React', 'TypeScript']));
    expect(card.intentionSignals).toContain('多次关注成长、团队与技术氛围');
    expect(card.recommendation).toBe('强推荐面试');
  });
});
