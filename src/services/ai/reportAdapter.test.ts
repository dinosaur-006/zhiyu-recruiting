import { describe, expect, it } from 'vitest';
import { generateRealityReport, getBranchScenarios, getScenarioChoices, generateJobTruthLabel, parseJobDescription } from '../../mock/ai';
import type { Candidate, Job, TrialSession } from '../../types';
import { adaptAiJobAnalysis, adaptAiReportToRealityReport } from './reportAdapter';

const jobInput = {
  title: '前端开发工程师',
  department: '研发部',
  location: '北京',
  salaryMin: 20,
  salaryMax: 35,
  education: '本科',
  experience: '1-3年',
  responsibilities: '负责B端SaaS产品前端开发、组件化建设、接口联调和体验优化。',
  requirements: '熟悉React、TypeScript，有B端后台或SaaS项目经验。',
  teamInfo: '团队重视Code Review和跨职能协作。',
  growthPath: '可成长为前端方向Owner。',
  interviewProcess: 'HR初沟 - 技术面 - 业务终面。',
  workload: '整体节奏较快，关键版本节点需要集中协作。',
  challenges: '业务场景复杂，需要跨部门沟通。',
};

const job: Job = {
  ...jobInput,
  id: 'job-1',
  companyId: 'company-1',
  status: 'published',
  createdAt: '2026-05-18T00:00:00.000Z',
  analysis: parseJobDescription(jobInput),
};

const candidate: Candidate = {
  id: 'candidate-1',
  jobId: job.id,
  conversationId: 'conversation-1',
  name: '陈同学',
  phone: '13900000000',
  email: 'chen@example.com',
  sourceChannel: '岗位实境舱',
  skills: 'React、TypeScript、B端SaaS',
  projectExperience: '参与B端后台项目，负责复杂筛选和接口联调。',
  motivation: '希望加入成长路径清晰的团队。',
  concerns: '薪资沟通节点和工作节奏',
  status: '已投递',
  submittedAt: '2026-05-18T00:00:00.000Z',
};

const branchChoices = getBranchScenarios(job).map((scenario) => scenario.choices[1]);
const selectedChoice = getScenarioChoices()[1];
const session: TrialSession = {
  id: 'trial-1',
  jobId: job.id,
  candidateId: candidate.id,
  currentSceneId: 'scene-task',
  completedSceneIds: ['scene-intro', 'scene-day', 'scene-task'],
  askedTopics: ['薪资福利', '成长空间'],
  selectedChoiceIds: [selectedChoice.id],
  branchChoiceIds: branchChoices.map((choice) => choice.id),
  directApply: false,
  startedAt: '2026-05-18T00:00:00.000Z',
  completedAt: '2026-05-18T00:10:00.000Z',
  completionRate: 100,
  viewedTruthPoints: ['工作节奏', '成长速度'],
  focusedTruthPoints: ['薪资沟通节点'],
  reverseQuestions: [],
  truthContractAcknowledgement: {
    acknowledged: true,
    acknowledgedItems: ['工作节奏说明'],
    unresolvedConcerns: ['薪资沟通节点'],
  },
  mutualConfirmation: {
    candidateConfirmedItems: ['我已了解岗位节奏'],
    unresolvedReasons: ['薪资沟通节点'],
    hrCommitments: ['不会仅凭AI报告做最终决定'],
  },
  trialEvents: [],
};

describe('AI report adapter', () => {
  it('maps DeepSeek job analysis into current JobAnalysis shape', () => {
    const analysis = adaptAiJobAnalysis({
      roleSummary: '负责B端SaaS前端体验和组件化建设。',
      coreResponsibilities: ['组件化建设', '接口联调'],
      hardRequirements: ['React', 'TypeScript'],
      softRequirements: ['跨部门协作'],
      truthTags: [{ label: '工作节奏', level: 'high', evidence: '关键版本节点集中协作' }],
      pressureSources: ['上线节奏'],
      missingInformation: ['薪资沟通节点'],
      candidatePossibleConcerns: ['工作节奏'],
      hrFollowupQuestions: ['请说明薪资沟通节点'],
    });

    expect(analysis.summary).toContain('B端SaaS');
    expect(analysis.hardSkills).toEqual(expect.arrayContaining(['React', 'TypeScript']));
    expect(analysis.riskPoints.join('')).toContain('薪资沟通节点');
    expect(analysis.faq).toEqual(expect.arrayContaining(['请说明薪资沟通节点']));
  });

  it('merges DeepSeek HR report into an existing RealityReport without dropping governance fields', () => {
    const baseReport = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const adapted = adaptAiReportToRealityReport(baseReport, {
      summary: '候选人主要关注薪资沟通节点和团队成长机制，建议先补充说明再邀约。',
      mainConcerns: [
        { tag: 'salary', level: 'high', explanation: '候选人多次关注薪资沟通节点。' },
        { tag: 'growth', level: 'medium', explanation: '候选人关注成长路径。' },
      ],
      trustGapLevel: 'high',
      evidenceItems: [
        { source: 'candidate_question', label: '薪资福利', content: '候选人询问薪资沟通节点。' },
        { source: 'sandbox_choice', label: '任务沙盘', content: '候选人选择先同步风险再推进。' },
      ],
      repairTasks: [{ title: '补充薪资沟通节点', priority: 'high', action: '邀约前说明薪资沟通会在哪一轮展开。' }],
      inviteScript: '陈同学你好，我们会在面试前先说明薪资沟通节点和成长机制。',
      interviewFollowupQuestions: ['你希望薪资沟通在什么节点展开？'],
      aiRiskNotes: ['AI仅供面试前参考，最终决策由人工完成。'],
    });

    expect(adapted.trustGapSummary.majorGaps).toContain('薪资沟通节点');
    expect(adapted.concernRadar.salary).toBeGreaterThan(baseReport.concernRadar.salary);
    expect(adapted.trustRepairTasks[0].title).toBe('补充薪资沟通节点');
    expect(adapted.invitationScript).toContain('陈同学');
    expect(adapted.aiRiskReview.reminders.join('')).toContain('最终决策由人工完成');
    expect(adapted.trialReplay.length).toBe(baseReport.trialReplay.length);
  });
});
