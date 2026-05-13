import { describe, expect, it } from 'vitest';
import {
  buildDefaultAvatarConfig,
  analyzeDecisionPath,
  answerReverseQuestion,
  detectJobRealityRisk,
  generateConcernRadar,
  generateAvatarReply,
  generateHRStoryCard,
  generateInterviewBattleCard,
  generateJobTruthLabel,
  generateNoShowPreventionCard,
  generateRealityReport,
  generateRealityScripts,
  generateTruthVideoScript,
  getBranchScenarios,
  getScenarioChoices,
  parseJobDescription,
} from './ai';
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

describe('Reality cabin AI', () => {
  it('generates three scenes in hr, teammate, manager order', () => {
    const scenes = generateRealityScripts(job);

    expect(scenes).toHaveLength(3);
    expect(scenes.map((scene) => scene.roleType)).toEqual(['hr', 'teammate', 'manager']);
    expect(scenes.map((scene) => scene.type)).toEqual(['intro', 'dayInLife', 'taskChallenge']);
  });

  it('detects missing reality details in vague JDs', () => {
    const vagueJob: Job = {
      ...job,
      teamInfo: '',
      interviewProcess: '',
      responsibilities: '负责产品研发和功能开发。',
    };

    const risk = detectJobRealityRisk(vagueJob);

    expect(risk.clarity).not.toBe('高');
    expect(risk.missingInfo).toEqual(expect.arrayContaining(['团队协作方式描述不足', '面试流程不够清晰']));
  });

  it('returns four scenario choices with strong B and D collaboration signals', () => {
    const choices = getScenarioChoices();
    const choiceB = choices.find((choice) => choice.label === 'B');
    const choiceD = choices.find((choice) => choice.label === 'D');

    expect(choices).toHaveLength(4);
    expect(choiceB?.analysis.communication).toBe('高');
    expect(choiceB?.analysis.riskAwareness).toBe('高');
    expect(choiceD?.analysis.communication).toBe('高');
    expect(choiceD?.analysis.riskAwareness).toBe('高');
  });

  it('generates a Reality report with action suggestion and evidence chain', () => {
    const choices = getScenarioChoices();
    const selectedChoice = choices.find((choice) => choice.label === 'B');
    if (!selectedChoice) throw new Error('missing choice B');

    const candidate: Candidate = {
      id: 'candidate-reality',
      jobId: job.id,
      conversationId: 'conversation-reality',
      name: '陈同学',
      phone: '13900000000',
      email: 'chen@example.com',
      sourceChannel: '岗位实境舱链接',
      skills: 'Vue React TypeScript',
      projectExperience: '负责B端SaaS复杂筛选模块，参与Code Review和接口联调。',
      motivation: '关注技术成长和团队协作',
      concerns: '成长空间、工作节奏',
      status: '已投递',
      submittedAt: '2026-05-13T00:00:00.000Z',
    };
    const session = {
      id: 'trial-reality',
      jobId: job.id,
      candidateId: candidate.id,
      currentSceneId: `scene_task_${job.id}`,
      completedSceneIds: [`scene_intro_${job.id}`, `scene_day_${job.id}`, `scene_task_${job.id}`],
      askedTopics: ['团队氛围', '成长空间', '工作节奏', '技术挑战'],
      selectedChoiceIds: [selectedChoice.id],
      branchChoiceIds: [],
      viewedTruthPoints: [],
      focusedTruthPoints: [],
      reverseQuestions: [],
      directApply: false,
      startedAt: '2026-05-13T00:00:00.000Z',
      completedAt: '2026-05-13T00:05:00.000Z',
      completionRate: 100,
    };

    const report = generateRealityReport(candidate, job, session, [selectedChoice]);

    expect(report.realIntention).toBe('高');
    expect(report.jobUnderstanding).toBe('清晰');
    expect(report.hrActionSuggestion).toBe('优先邀约');
    expect(report.skillEvidence).toEqual(expect.arrayContaining(['Vue', 'React', 'TypeScript', 'B端SaaS', 'Code Review']));
    expect(report.evidenceSources.fromScenarioChoices).toContain(selectedChoice.id);
  });
});

describe('Reality Pro AI', () => {
  it('generates a complete Job Truth Label from the JD', () => {
    const truth = generateJobTruthLabel(job);

    expect(truth.jobId).toBe(job.id);
    expect(truth.workPace).toBe('中高');
    expect(truth.collaborationDensity).toBe('高');
    expect(truth.pressureSources.length).toBeGreaterThanOrEqual(2);
    expect(truth.suitableFor.length).toBeGreaterThan(0);
    expect(truth.notSuitableFor.length).toBeGreaterThan(0);
  });

  it('generates three branch scenarios with A/B/C/D choices in each round', () => {
    const scenarios = getBranchScenarios(job);

    expect(scenarios.map((scenario) => scenario.round)).toEqual([1, 2, 3]);
    scenarios.forEach((scenario) => {
      expect(scenario.choices.map((choice) => choice.label)).toEqual(['A', 'B', 'C', 'D']);
    });
  });

  it('analyzes a three-step decision path', () => {
    const choices = getBranchScenarios(job).map((scenario) => scenario.choices[1]);
    const analysis = analyzeDecisionPath(choices);

    expect(analysis.collaboration).toContain('主动');
    expect(analysis.riskAwareness).toBe('高');
    expect(analysis.communication).toBe('高');
    expect(analysis.executionStyle).toContain('并行');
  });

  it('generates concern radar from questions and candidate profile', () => {
    const candidate: Candidate = {
      id: 'candidate-pro',
      jobId: job.id,
      conversationId: 'conversation-pro',
      name: '赵同学',
      phone: '13700000000',
      email: 'zhao@example.com',
      sourceChannel: '岗位真相舱链接',
      skills: 'Vue React TypeScript',
      projectExperience: '做过B端SaaS项目。',
      motivation: '关注成长空间和团队氛围',
      concerns: '薪资、工作节奏、成长空间',
      followUpQuestion: '想确认薪资沟通节点和项目节奏。',
      status: '已投递',
      submittedAt: '2026-05-13T00:00:00.000Z',
    };
    const session = {
      id: 'trial-pro',
      jobId: job.id,
      candidateId: candidate.id,
      currentSceneId: `scene_task_${job.id}`,
      completedSceneIds: [`scene_intro_${job.id}`, `scene_day_${job.id}`, `scene_task_${job.id}`],
      askedTopics: ['成长空间', '工作节奏', '薪资福利'],
      selectedChoiceIds: [],
      branchChoiceIds: [],
      viewedTruthPoints: ['工作节奏', '成长速度'],
      focusedTruthPoints: ['工作节奏'],
      reverseQuestions: [],
      directApply: false,
      startedAt: '2026-05-13T00:00:00.000Z',
      completedAt: '2026-05-13T00:05:00.000Z',
      completionRate: 100,
    };

    const radar = generateConcernRadar(candidate, session);

    expect(radar.growth).toBeGreaterThan(60);
    expect(radar.salary).toBeGreaterThan(60);
    expect(radar.workload).toBeGreaterThan(60);
  });

  it('answers reverse questions from public job truth information', () => {
    const answer = answerReverseQuestion(job, generateJobTruthLabel(job), '工作节奏');

    expect(answer.type).toBe('工作节奏');
    expect(answer.answer).toContain('工作节奏');
    expect(answer.answer).toContain('面试中进一步确认');
  });

  it('generates no-show prevention and interview battle cards', () => {
    const selectedChoice = getScenarioChoices()[1];
    const candidate: Candidate = {
      id: 'candidate-card',
      jobId: job.id,
      conversationId: 'conversation-card',
      name: '王同学',
      phone: '13600000000',
      email: 'wang@example.com',
      sourceChannel: '岗位真相舱链接',
      skills: 'Vue React TypeScript',
      projectExperience: '负责B端SaaS复杂筛选模块，参与接口联调。',
      motivation: '关注成长空间和技术氛围',
      concerns: '薪资、工作节奏',
      status: '已投递',
      submittedAt: '2026-05-13T00:00:00.000Z',
    };
    const session = {
      id: 'trial-card',
      jobId: job.id,
      candidateId: candidate.id,
      currentSceneId: `scene_task_${job.id}`,
      completedSceneIds: [`scene_intro_${job.id}`, `scene_day_${job.id}`, `scene_task_${job.id}`],
      askedTopics: ['团队氛围', '成长空间', '工作节奏'],
      selectedChoiceIds: [selectedChoice.id],
      branchChoiceIds: getBranchScenarios(job).map((scenario) => scenario.choices[1].id),
      viewedTruthPoints: ['工作节奏', '协作密度', '成长速度'],
      focusedTruthPoints: ['工作节奏', '成长速度'],
      reverseQuestions: [answerReverseQuestion(job, generateJobTruthLabel(job), '成长空间')],
      directApply: false,
      startedAt: '2026-05-13T00:00:00.000Z',
      completedAt: '2026-05-13T00:05:00.000Z',
      completionRate: 100,
    };
    const branchChoices = getBranchScenarios(job).map((scenario) => scenario.choices[1]);
    const report = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const prevention = generateNoShowPreventionCard(report);
    const battleCard = generateInterviewBattleCard(report);

    expect(prevention.possibleReasons.length).toBeGreaterThan(0);
    expect(prevention.preInviteActions.length).toBeGreaterThan(0);
    expect(prevention.invitationScript).toContain(candidate.name);
    expect(battleCard.interviewGoals.length).toBeGreaterThan(0);
    expect(battleCard.shouldAvoidAsking).toEqual(expect.arrayContaining(['年龄、婚育、家庭情况等与岗位无关问题']));
  });

  it('generates a four-part truth video script', () => {
    const script = generateTruthVideoScript(job, [], generateRealityScripts(job));

    expect(script.jobId).toBe(job.id);
    expect(script.segments).toHaveLength(4);
    expect(script.segments[0].timeRange).toBe('0-10秒');
  });
});
