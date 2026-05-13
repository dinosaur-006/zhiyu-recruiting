import { describe, expect, it } from 'vitest';
import {
  buildDefaultAvatarConfig,
  analyzeDecisionPath,
  answerReverseQuestion,
  calculateCandidateTrustIndex,
  detectJobRealityRisk,
  generateAIAdviceRelianceNotice,
  generateAIRiskReview,
  calculateAuditCompleteness,
  generateCandidateFairnessIndex,
  generateCommitmentConsistencyCheck,
  generateConcernRadar,
  generateAvatarReply,
  generateHRStoryCard,
  generateInterviewBattleCard,
  generateJobTruthContract,
  generateJobTruthLabel,
  generateInterviewMutualConfirmation,
  generateNoShowPreventionCard,
  generateRealityReport,
  generateRealityScripts,
  generateTrialReplay,
  generateTrustGapSummary,
  generateTrustNegotiationCard,
  generateTrustLoopGraph,
  generateTrustGapDiagnosis,
  generateTrustRepairScript,
  generateTruthVideoScript,
  generateSilenceRisk,
  generateTrustAuditLog,
  getBranchScenarios,
  getScenarioChoices,
  parseJobDescription,
  generateTrustRepairTasks,
} from './ai';
import type { Candidate, Conversation, Job, TrialSession } from '../types';

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
    const session: TrialSession = {
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
      truthContractAcknowledgement: { acknowledged: false, acknowledgedItems: [], unresolvedConcerns: [] },
      mutualConfirmation: { candidateConfirmedItems: [], unresolvedReasons: [], hrCommitments: [] },
      trialEvents: [],
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
    const session: TrialSession = {
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
      truthContractAcknowledgement: { acknowledged: false, acknowledgedItems: [], unresolvedConcerns: [] },
      mutualConfirmation: { candidateConfirmedItems: [], unresolvedReasons: [], hrCommitments: [] },
      trialEvents: [],
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
    const session: TrialSession = {
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
      truthContractAcknowledgement: { acknowledged: false, acknowledgedItems: [], unresolvedConcerns: [] },
      mutualConfirmation: { candidateConfirmedItems: [], unresolvedReasons: [], hrCommitments: [] },
      trialEvents: [],
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

describe('Trust Layer AI', () => {
  const candidate: Candidate = {
    id: 'candidate-trust',
    jobId: job.id,
    conversationId: 'conversation-trust',
    name: '周同学',
    phone: '13500000000',
    email: 'zhou@example.com',
    sourceChannel: '岗位真相舱链接',
    skills: 'Vue React TypeScript B端SaaS',
    projectExperience: '负责过B端SaaS复杂筛选、接口联调和Code Review。',
    motivation: '希望加入成长路径更清晰、团队协作更透明的团队。',
    concerns: '薪资沟通节点、工作节奏、成长路径',
    rhythmAcceptance: '可以接受阶段性压力，但希望确认项目节点是否常态化。',
    followUpQuestion: '想知道薪资沟通节点和新人培养机制。',
    scenarioReflection: '我会先澄清边界，再和后端约定Mock字段推进。',
    status: '已投递',
    submittedAt: '2026-05-13T00:00:00.000Z',
  };
  const selectedChoice = getScenarioChoices()[1];
  const branchChoices = getBranchScenarios(job).map((scenario) => scenario.choices[1]);
  const session: TrialSession = {
    id: 'trial-trust',
    jobId: job.id,
    candidateId: candidate.id,
    currentSceneId: `scene_task_${job.id}`,
    completedSceneIds: [`scene_intro_${job.id}`, `scene_day_${job.id}`, `scene_task_${job.id}`],
    askedTopics: ['薪资福利', '成长空间', '工作节奏', '团队氛围'],
    selectedChoiceIds: [selectedChoice.id],
    branchChoiceIds: branchChoices.map((choice) => choice.id),
    viewedTruthPoints: ['工作节奏', '加班波动', '成长速度', '薪资沟通节点'],
    focusedTruthPoints: ['工作节奏', '薪资沟通节点'],
    reverseQuestions: [answerReverseQuestion(job, generateJobTruthLabel(job), '薪资福利')],
    truthContractAcknowledgement: {
      acknowledged: true,
      acknowledgedItems: ['工作节奏说明', '加班波动说明', 'AI辅助边界'],
      unresolvedConcerns: ['薪资沟通节点', '成长路径说明'],
      acknowledgedAt: '2026-05-13T00:03:00.000Z',
    },
    mutualConfirmation: { candidateConfirmedItems: [], unresolvedReasons: [], hrCommitments: [] },
    trialEvents: [
      { id: 'event-1', type: 'truth_label_viewed', label: '查看岗位真相标签', occurredAt: '2026-05-13T00:00:00.000Z' },
      { id: 'event-2', type: 'truth_contract_acknowledged', label: '确认岗位真相合约', occurredAt: '2026-05-13T00:03:00.000Z' },
      { id: 'event-3', type: 'branch_choice_selected', label: '完成分岔任务选择', occurredAt: '2026-05-13T00:06:00.000Z' },
    ],
    directApply: false,
    startedAt: '2026-05-13T00:00:00.000Z',
    completedAt: '2026-05-13T00:08:00.000Z',
    completionRate: 100,
  };

  it('generates a Job Truth Contract from the truth label', () => {
    const contract = generateJobTruthContract(job, generateJobTruthLabel(job));

    expect(contract.jobId).toBe(job.id);
    expect(contract.commitments.map((item) => item.title)).toEqual(
      expect.arrayContaining(['工作节奏说明', '加班波动说明', '成长路径说明', 'AI辅助边界', '候选人数据使用边界']),
    );
    expect(contract.aiDecisionBoundary).toContain('不评价候选人能力');
    expect(contract.dataUsageNotice).toContain('主动提问');
  });

  it('calculates a candidate trust index without scoring candidate ability', () => {
    const report = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const trustIndex = calculateCandidateTrustIndex(candidate, session, report);

    expect(trustIndex.total).toBeGreaterThan(50);
    expect(trustIndex.dimensions.aiTransparency).toBeGreaterThan(70);
    expect(trustIndex.gapReasons).toEqual(expect.arrayContaining(['薪资沟通节点仍需补充说明']));
    expect(trustIndex.explanation).toContain('不评价候选人能力');
  });

  it('generates trust gap summary and repair script from concerns', () => {
    const report = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const trustIndex = calculateCandidateTrustIndex(candidate, session, report);
    const summary = generateTrustGapSummary(trustIndex, report);
    const script = generateTrustRepairScript(candidate, trustIndex, summary);

    expect(summary.repairSuggestions.length).toBeGreaterThan(0);
    expect(script).toContain(candidate.name);
    expect(script).toContain('工作节奏');
    expect(script).toContain('15分钟沟通');
  });

  it('generates a replay timeline with the key trial events', () => {
    const replay = generateTrialReplay(session);

    expect(replay.map((event) => event.label)).toEqual(
      expect.arrayContaining(['查看岗位真相标签', '确认岗位真相合约', '完成分岔任务选择']),
    );
    expect(replay[0].timeLabel).toBe('00:00');
  });

  it('reviews report risk boundaries and evidence sources', () => {
    const report = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const review = generateAIRiskReview(report);

    expect(review.result).toBe('复核通过');
    expect(review.checkedItems).toEqual(expect.arrayContaining(['未出现自动化最终决策表述', '已包含人工复核声明']));
    expect(review.reminders.join('')).toContain('最终招聘决策由企业人工完成');
  });
});

describe('Trust+ AI', () => {
  const candidate: Candidate = {
    id: 'candidate-trust-plus',
    jobId: job.id,
    conversationId: 'conversation-trust-plus',
    name: '许同学',
    phone: '13400000000',
    email: 'xu@example.com',
    sourceChannel: 'Trust+岗位入口',
    skills: 'Vue React TypeScript',
    projectExperience: '参与过SaaS权限和筛选模块。',
    motivation: '想确认成长路径和团队协作方式。',
    concerns: '工作节奏、薪资沟通节点、成长路径',
    rhythmAcceptance: '接受阶段性压力，希望不是长期高压。',
    followUpQuestion: '薪资范围是否可谈，面试后多久反馈？',
    scenarioReflection: '会先澄清边界，再拆分核心功能。',
    status: '已投递',
    submittedAt: '2026-05-13T00:00:00.000Z',
  };
  const selectedChoice = getScenarioChoices()[1];
  const branchChoices = getBranchScenarios(job).map((scenario) => scenario.choices[1]);
  const session: TrialSession = {
    id: 'trial-trust-plus',
    jobId: job.id,
    candidateId: candidate.id,
    currentSceneId: `scene_task_${job.id}`,
    completedSceneIds: [`scene_intro_${job.id}`, `scene_day_${job.id}`, `scene_task_${job.id}`],
    askedTopics: ['工作节奏', '薪资福利', '成长空间'],
    selectedChoiceIds: [selectedChoice.id],
    branchChoiceIds: branchChoices.map((choice) => choice.id),
    viewedTruthPoints: ['工作节奏', '协作密度', '成长速度'],
    focusedTruthPoints: ['工作节奏', '成长速度'],
    reverseQuestions: [answerReverseQuestion(job, generateJobTruthLabel(job), '工作节奏')],
    truthContractAcknowledgement: {
      acknowledged: true,
      acknowledgedItems: ['工作节奏说明', '面试流程承诺', 'AI辅助边界'],
      unresolvedConcerns: ['薪资沟通节点'],
      acknowledgedAt: '2026-05-13T00:03:00.000Z',
    },
    mutualConfirmation: {
      candidateConfirmedItems: ['我已了解岗位节奏', '我已了解面试流程', '我仍愿意继续面试'],
      unresolvedReasons: ['薪资沟通节点'],
      hrCommitments: [],
      confirmedAt: '2026-05-13T00:08:30.000Z',
    },
    trialEvents: [],
    directApply: false,
    startedAt: '2026-05-13T00:00:00.000Z',
    completedAt: '2026-05-13T00:08:00.000Z',
    completionRate: 100,
  };

  it('adds trusted source and evidence text to Job Truth Label', () => {
    const truth = generateJobTruthLabel(job);

    expect(truth.evidence.length).toBeGreaterThanOrEqual(6);
    expect(truth.evidence.map((item) => item.source)).toEqual(expect.arrayContaining(['岗位职责', '团队介绍', '面试流程', 'HR配置']));
    expect(truth.evidence.find((item) => item.label === '工作节奏')?.evidenceText).toContain('节奏');
  });

  it('generates a trust negotiation card before invitation', () => {
    const report = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const card = generateTrustNegotiationCard(report);

    expect(card.candidateQuestions).toEqual(expect.arrayContaining(['薪资沟通节点']));
    expect(card.hrClarifications.length).toBeGreaterThan(0);
    expect(card.trustRepairScript).toContain('15分钟');
    expect(card.formalInvitationScript).toContain(candidate.name);
  });

  it('generates an interview mutual confirmation', () => {
    const report = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const confirmation = generateInterviewMutualConfirmation(session, report);

    expect(confirmation.candidateConfirmedItems).toContain('我已了解岗位节奏');
    expect(confirmation.hrCommitments).toEqual(
      expect.arrayContaining(['本轮面试会重点沟通候选人关心的问题', '不会仅凭AI报告做最终决定']),
    );
  });

  it('generates candidate fairness index with transparent-process dimensions', () => {
    const report = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const fairness = generateCandidateFairnessIndex(report);

    expect(fairness.total).toBeGreaterThan(80);
    expect(fairness.dimensions.aiDisclosure).toBe(100);
    expect(fairness.optimizationSuggestions).toContain('持续明确面试结果反馈节点。');
  });

  it('asks risk reviewer to flag missing job truth evidence', () => {
    const report = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const review = generateAIRiskReview({
      ...report,
      evidenceSources: {
        ...report.evidenceSources,
        fromJobTruthLabel: [],
      },
    });

    expect(review.result).toBe('需要人工确认');
    expect(review.reminders.join('')).toContain('需要HR补充证据');
  });
});

describe('Trust Intelligence AI', () => {
  const candidate: Candidate = {
    id: 'candidate-intel',
    jobId: job.id,
    conversationId: 'conversation-intel',
    name: '沈同学',
    phone: '13300000000',
    email: 'shen@example.com',
    sourceChannel: 'Trust Intelligence入口',
    skills: 'Vue React TypeScript B端SaaS',
    projectExperience: '参与过B端SaaS筛选、权限和数据看板模块，负责接口联调。',
    motivation: '希望确认团队成长机制和岗位真实节奏。',
    concerns: '薪资沟通节点、工作节奏、成长路径',
    rhythmAcceptance: '能接受阶段性压力，但希望确认是否长期高压。',
    followUpQuestion: '想确认薪资沟通节点和面试反馈时效。',
    scenarioReflection: '会先澄清目标，再拆分核心功能和延期功能。',
    status: '已投递',
    submittedAt: '2026-05-13T00:00:00.000Z',
  };
  const selectedChoice = getScenarioChoices()[1];
  const branchChoices = getBranchScenarios(job).map((scenario) => scenario.choices[1]);
  const session: TrialSession = {
    id: 'trial-intel',
    jobId: job.id,
    candidateId: candidate.id,
    currentSceneId: `scene_task_${job.id}`,
    completedSceneIds: [`scene_intro_${job.id}`, `scene_day_${job.id}`, `scene_task_${job.id}`],
    askedTopics: ['薪资福利', '成长空间', '工作节奏', '团队氛围'],
    selectedChoiceIds: [selectedChoice.id],
    branchChoiceIds: branchChoices.map((choice) => choice.id),
    viewedTruthPoints: ['工作节奏', '加班波动', '成长速度', '薪资沟通节点'],
    focusedTruthPoints: ['工作节奏', '薪资沟通节点'],
    reverseQuestions: [answerReverseQuestion(job, generateJobTruthLabel(job), '薪资福利')],
    truthContractAcknowledgement: {
      acknowledged: true,
      acknowledgedItems: ['工作节奏说明', '加班波动说明', 'AI辅助边界'],
      unresolvedConcerns: ['薪资沟通节点', '成长路径说明'],
      acknowledgedAt: '2026-05-13T00:03:00.000Z',
    },
    mutualConfirmation: {
      candidateConfirmedItems: ['我已了解岗位节奏', '我已了解面试流程', '我仍愿意继续面试'],
      unresolvedReasons: ['薪资沟通节点'],
      hrCommitments: [],
      confirmedAt: '2026-05-13T00:08:30.000Z',
    },
    trialEvents: [
      { id: 'event-i-1', type: 'truth_label_viewed', label: '查看岗位真相标签', occurredAt: '2026-05-13T00:00:00.000Z' },
      { id: 'event-i-2', type: 'truth_point_focused', label: '重点查看：工作节奏', occurredAt: '2026-05-13T00:00:20.000Z' },
      { id: 'event-i-3', type: 'truth_contract_acknowledged', label: '确认岗位真相合约', occurredAt: '2026-05-13T00:03:00.000Z' },
      { id: 'event-i-4', type: 'branch_choice_selected', label: '完成分岔任务选择', occurredAt: '2026-05-13T00:06:00.000Z' },
      { id: 'event-i-5', type: 'reverse_question_asked', label: '反向提问：薪资福利', occurredAt: '2026-05-13T00:07:00.000Z' },
    ],
    exitReason: '薪资信息不明确',
    directApply: false,
    startedAt: '2026-05-13T00:00:00.000Z',
    completedAt: '2026-05-13T00:09:00.000Z',
    completionRate: 100,
  };

  it('generates a trust loop graph with status nodes', () => {
    const report = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const graph = generateTrustLoopGraph(report);

    expect(graph.map((node) => node.title)).toEqual(
      expect.arrayContaining(['岗位真相公开', '候选人知情确认', '信任缺口识别', 'HR人工复核']),
    );
    expect(graph.some((node) => node.status === '有缺口')).toBe(true);
  });

  it('generates trust gap diagnosis with repair actions', () => {
    const report = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const diagnosis = generateTrustGapDiagnosis(report);

    expect(diagnosis.map((item) => item.type)).toEqual(expect.arrayContaining(['信息缺口', '情绪缺口', '承诺缺口']));
    expect(diagnosis[0].repairAction.length).toBeGreaterThan(0);
    expect(diagnosis[0].repairScript).toContain(candidate.name);
  });

  it('checks commitment consistency across JD, truth label, contract and scripts', () => {
    const check = generateCommitmentConsistencyCheck(job, generateJobTruthLabel(job), generateJobTruthContract(job, generateJobTruthLabel(job)), generateRealityScripts(job));

    expect(check.riskLevel).not.toBe('低');
    expect(check.findings.length).toBeGreaterThan(0);
    expect(check.suggestions.join('')).toContain('补充');
  });

  it('creates an AI advice reliance notice from evidence sources', () => {
    const report = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const notice = generateAIAdviceRelianceNotice(report);

    expect(notice.evidenceSupportedCount).toBeGreaterThan(0);
    expect(notice.reminders.join('')).toContain('不得作为最终招聘决定');
  });

  it('risk reviewer flags commitment inconsistency and weak evidence', () => {
    const report = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const review = generateAIRiskReview({
      ...report,
      commitmentConsistencyCheck: {
        riskLevel: '高',
        findings: ['岗位真相标签与合约表达不一致'],
        suggestions: ['需要HR补充说明。'],
      },
      aiAdviceRelianceNotice: {
        evidenceSupportedCount: 1,
        needsHumanConfirmationCount: 3,
        reminders: ['部分建议需要人工确认。'],
      },
    });

    expect(review.result).toBe('需要人工确认');
    expect(review.reminders.join('')).toContain('承诺一致性');
    expect(review.reminders.join('')).toContain('证据不足');
  });
});

describe('Trust Governance AI', () => {
  const candidate: Candidate = {
    id: 'candidate-gov',
    jobId: job.id,
    conversationId: 'conversation-gov',
    name: '顾同学',
    phone: '13200000000',
    email: 'gu@example.com',
    sourceChannel: 'Trust Governance入口',
    skills: 'Vue React TypeScript',
    projectExperience: '做过B端SaaS表单和权限模块。',
    motivation: '想确认岗位是否值得继续投入面试时间。',
    concerns: '薪资沟通节点、工作节奏',
    rhythmAcceptance: '对长期高压比较谨慎。',
    followUpQuestion: '如果我不完成云试岗，是否还能直接投递？',
    scenarioReflection: '会先澄清边界，再推进核心路径。',
    status: '已邀约',
    submittedAt: '2026-05-13T00:10:00.000Z',
  };
  const selectedChoice = getScenarioChoices()[1];
  const branchChoices = getBranchScenarios(job).map((scenario) => scenario.choices[1]);
  const session: TrialSession = {
    id: 'trial-gov',
    jobId: job.id,
    candidateId: candidate.id,
    currentSceneId: `scene_task_${job.id}`,
    completedSceneIds: [`scene_intro_${job.id}`, `scene_day_${job.id}`],
    askedTopics: ['薪资福利', '工作节奏'],
    selectedChoiceIds: [selectedChoice.id],
    branchChoiceIds: [branchChoices[0].id],
    viewedTruthPoints: ['工作节奏', '薪资沟通节点'],
    focusedTruthPoints: ['工作节奏'],
    reverseQuestions: [],
    truthContractAcknowledgement: {
      acknowledged: false,
      acknowledgedItems: [],
      unresolvedConcerns: ['薪资沟通节点'],
    },
    mutualConfirmation: { candidateConfirmedItems: [], unresolvedReasons: ['薪资沟通节点'], hrCommitments: [] },
    trialEvents: [
      { id: 'event-g-1', type: 'truth_label_viewed', label: '查看岗位真相标签', occurredAt: '2026-05-13T00:00:00.000Z' },
      { id: 'event-g-2', type: 'truth_point_focused', label: '重点查看：工作节奏', occurredAt: '2026-05-13T00:01:00.000Z' },
      { id: 'event-g-3', type: 'branch_choice_selected', label: '完成分岔任务选择', occurredAt: '2026-05-13T00:05:00.000Z' },
    ],
    exitReason: '薪资信息不明确',
    directApply: false,
    startedAt: '2026-05-13T00:00:00.000Z',
    completedAt: '2026-05-13T00:06:00.000Z',
    completionRate: 62,
  };

  it('generates a trust audit log with risk review and invitation events', () => {
    const report = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const events = generateTrustAuditLog(report, session, candidate);

    expect(events.map((event) => event.type)).toEqual(
      expect.arrayContaining(['job_truth_label_generated', 'ai_risk_review_completed', 'trust_repair_suggestion_generated', 'hr_invitation_sent']),
    );
    expect(events.some((event) => event.actor === 'ai')).toBe(true);
  });

  it('generates silence risk from incomplete confirmation and exit reason', () => {
    const report = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const risk = generateSilenceRisk(report, session);

    expect(risk.level).toBe('高');
    expect(risk.possibleReasons).toEqual(expect.arrayContaining(['候选人已留下退出或中断原因：薪资信息不明确']));
    expect(risk.wakeUpScript).toContain(candidate.name);
    expect(risk.wakeUpScript).toContain('不评价你的能力');
  });

  it('generates trust repair tasks from gaps, silence and consistency risk', () => {
    const report = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const tasks = generateTrustRepairTasks(report);

    expect(tasks.length).toBeGreaterThan(1);
    expect(tasks.map((task) => task.status)).toEqual(expect.arrayContaining(['待处理']));
    expect(tasks.map((task) => task.source)).toEqual(expect.arrayContaining(['信任缺口', '沉默风险']));
  });

  it('calculates audit completeness from required governance events', () => {
    const report = generateRealityReport(candidate, job, session, [selectedChoice], branchChoices, generateJobTruthLabel(job));
    const events = generateTrustAuditLog(report, session, candidate);

    expect(calculateAuditCompleteness(events)).toBeGreaterThanOrEqual(80);
    expect(calculateAuditCompleteness(events.slice(0, 2))).toBeLessThan(50);
  });
});
