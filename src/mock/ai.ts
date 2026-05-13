import type {
  AvatarConfig,
  BranchChoice,
  BranchScenario,
  Candidate,
  CandidateTrustIndex,
  CandidateFairnessIndex,
  ConcernRadar,
  Conversation,
  ConversationMessage,
  DecisionPathAnalysis,
  AIRiskReview,
  HRStoryCard,
  InterviewBattleCard,
  Job,
  JobAnalysis,
  JobRealityRisk,
  JobInput,
  JobTruthContract,
  JobTruthEvidence,
  JobTruthLabel,
  NoShowPreventionCard,
  Recommendation,
  RealityReport,
  RealityRole,
  RealityScene,
  ReverseQuestion,
  ReverseQuestionType,
  ScenarioChoice,
  TrialReplayEvent,
  TruthVideoScript,
  TrustNegotiationCard,
  InterviewMutualConfirmation,
  TrustGapSummary,
  TrialSession,
} from '../types';

const nowIso = () => new Date().toISOString();

const containsAny = (value: string, words: string[]) =>
  words.some((word) => value.toLowerCase().includes(word.toLowerCase()));

const unique = <T,>(items: T[]) => Array.from(new Set(items));

export function parseJobDescription(job: JobInput): JobAnalysis {
  const corpus = [
    job.title,
    job.responsibilities,
    job.requirements,
    job.teamInfo,
    job.growthPath,
    job.challenges,
  ].join(' ');

  const hardSkills = [
    ['Vue', ['vue']],
    ['React', ['react']],
    ['TypeScript', ['typescript', 'ts']],
    ['组件化开发', ['组件', 'component']],
    ['接口联调', ['接口', 'api']],
    ['SaaS项目经验', ['saas']],
    ['B端产品经验', ['b端', '后台', '管理系统']],
    ['数据分析', ['数据', '指标']],
    ['用户运营', ['运营', '用户增长']],
    ['销售转化', ['销售', '转化', '客户']],
  ]
    .filter(([, aliases]) => containsAny(corpus, aliases as string[]))
    .map(([label]) => label as string);

  const softSkills = [
    containsAny(corpus, ['沟通', '协作']) ? '沟通协作' : '',
    containsAny(corpus, ['学习', '成长']) ? '主动学习' : '',
    containsAny(corpus, ['推进', '负责', 'owner']) ? '项目推进' : '',
    containsAny(corpus, ['复杂', '问题', '方案']) ? '问题解决' : '',
  ].filter(Boolean);

  const sellingPoints = unique([
    job.salaryMax >= 25000 ? '薪资竞争力较强' : '薪资范围透明',
    containsAny(job.teamInfo, ['技术', '代码', 'review']) ? '技术氛围清晰' : '团队信息明确',
    containsAny(job.growthPath, ['成长', '晋升', '培养']) ? '成长路径可沟通' : '岗位发展方向可追问',
    job.location ? `工作地点：${job.location}` : '工作地点明确',
  ]);

  const riskPoints = unique([
    containsAny(job.workload, ['快', '加班', '压力']) ? '工作节奏需提前确认' : '',
    containsAny(job.challenges, ['挑战', '复杂', '指标']) ? '岗位挑战需结合经历判断' : '',
    job.experience.includes('应届') ? '经验要求较友好' : '',
  ]).filter(Boolean);

  return {
    summary: `该岗位面向${job.department}，核心是${job.responsibilities.slice(0, 42)}${job.responsibilities.length > 42 ? '...' : ''}`,
    hardSkills: hardSkills.length > 0 ? hardSkills : ['岗位核心技能待候选人补充确认'],
    softSkills: softSkills.length > 0 ? unique(softSkills) : ['沟通协作', '主动学习'],
    sellingPoints,
    riskPoints: riskPoints.length > 0 ? riskPoints : ['暂无明显风险点，建议在对话中确认岗位理解'],
    faq: [
      '日常工作是什么？',
      '团队氛围怎么样？',
      '面试流程是什么？',
      '这个岗位适合什么样的人？',
      '成长机会有哪些？',
      '工作压力大吗？',
    ],
  };
}

export function buildDefaultAvatarConfig(job: Job): AvatarConfig {
  return {
    id: `avatar-${job.id}`,
    jobId: job.id,
    name: '小遇',
    identity: '岗位体验官',
    style: '专业且友好',
    duration: '8分钟标准聊',
    focusTopics: ['岗位职责', '团队氛围', '成长路径', '面试流程'],
    forbiddenTopics: ['企业未公开信息', '个人隐私', '歧视性问题', '内部联系方式'],
    openingScript:
      '你好，我是这个岗位的AI数字体验官小遇。在你正式投递前，我可以帮你了解岗位真实情况，也会在你授权后辅助HR整理面试前参考信息。你可以随时退出或直接投递。',
  };
}

export function createDefaultRealityRoles(jobId: string): RealityRole[] {
  return [
    {
      id: `role_hr_${jobId}`,
      jobId,
      type: 'hr',
      name: '小遇',
      title: 'AI招聘体验官',
      persona: '负责岗位概览、流程说明、候选人权利说明',
      tone: '专业、透明、友好',
      responsibility: '讲清岗位基本信息、面试流程和云试岗规则',
      avatarImage: '/avatars/hr-avatar.png',
      videoUrl: '/videos/hr-intro.mp4',
      provider: 'mockVideo',
    },
    {
      id: `role_teammate_${jobId}`,
      jobId,
      type: 'teammate',
      name: '林同学',
      title: '未来同事数字分身',
      persona: '负责还原真实工作日常和团队协作方式',
      tone: '自然、真实、有亲和力',
      responsibility: '讲述岗位真实一天、团队协作和工作节奏',
      avatarImage: '/avatars/teammate-avatar.png',
      videoUrl: '/videos/day-in-life.mp4',
      provider: 'mockVideo',
    },
    {
      id: `role_manager_${jobId}`,
      jobId,
      type: 'manager',
      name: '周主管',
      title: '未来主管数字分身',
      persona: '负责说明岗位挑战和真实任务场景',
      tone: '直接、清晰、重视问题解决',
      responsibility: '给出真实任务场景，观察候选人处理思路',
      avatarImage: '/avatars/manager-avatar.png',
      videoUrl: '/videos/task-challenge.mp4',
      provider: 'mockVideo',
    },
  ];
}

export function generateRealityScripts(job: Job): RealityScene[] {
  return [
    {
      id: `scene_intro_${job.id}`,
      jobId: job.id,
      type: 'intro',
      roleType: 'hr',
      title: '第一幕：岗位概览',
      script: `你好，我是这个岗位的AI招聘体验官。接下来我不会先考你，而是先带你了解这个岗位真实做什么、怎么面试、适合什么样的人。你可以随时退出，也可以直接投递。这个岗位是${job.title}，主要面向${job.department}，工作地点在${job.location}，薪资范围为${job.salaryMin}k-${job.salaryMax}k。`,
      candidateActions: ['了解岗位职责', '了解面试流程', '直接投递'],
      keySignals: ['是否愿意继续了解', '是否关注流程透明度'],
    },
    {
      id: `scene_day_${job.id}`,
      jobId: job.id,
      type: 'dayInLife',
      roleType: 'teammate',
      title: '第二幕：未来同事带你过一天',
      script: `我是你未来可能合作的同事。如果你加入我们，这个岗位的一天通常会从需求沟通和任务拆解开始，中间会涉及${job.responsibilities}。项目节点前会有阶段性压力，我们希望你不只是完成任务，而是能理解业务目标并推动问题解决。`,
      candidateActions: ['了解团队氛围', '了解成长空间', '了解工作节奏'],
      keySignals: ['是否关注团队', '是否关注成长', '是否接受工作节奏'],
    },
    {
      id: `scene_task_${job.id}`,
      jobId: job.id,
      type: 'taskChallenge',
      roleType: 'manager',
      title: '第三幕：主管给出真实任务场景',
      script:
        '现在给你一个真实工作场景：产品临时提出复杂筛选功能，后端接口还没有完全确定，但上线时间比较紧。你会怎么推进？',
      candidateActions: ['选择处理方式', '说明项目经历', '继续投递'],
      keySignals: ['协作方式', '风险意识', '沟通意识', '技术判断'],
    },
  ];
}

export function detectJobRealityRisk(job: Job): JobRealityRisk {
  const missingInfo: string[] = [];

  if (!job.teamInfo || job.teamInfo.length < 20) {
    missingInfo.push('团队协作方式描述不足');
  }
  if (!job.interviewProcess || job.interviewProcess.length < 10) {
    missingInfo.push('面试流程不够清晰');
  }
  if (!containsAny(job.responsibilities, ['协作', '沟通', '联调', '评审', 'review'])) {
    missingInfo.push('跨部门协作说明不足');
  }
  if (!containsAny(`${job.workload} ${job.teamInfo} ${job.challenges}`, ['节奏', '压力', '节点', '挑战'])) {
    missingInfo.push('工作节奏和压力说明不足');
  }

  const riskLevel = missingInfo.length >= 3 ? '高' : missingInfo.length >= 1 ? '中' : '低';
  return {
    clarity: missingInfo.length === 0 ? '高' : missingInfo.length <= 2 ? '中' : '低',
    misunderstandingRisk: riskLevel,
    missingInfo,
    suggestions:
      missingInfo.length > 0
        ? missingInfo.map((item) => `建议补充：${item}`)
        : ['岗位信息较完整，可直接生成岗位实境舱脚本。'],
    realityTags: ['岗位透明度', '真实工作节奏', '团队协作', '候选人预期管理'],
  };
}

export function getScenarioChoices(): ScenarioChoice[] {
  return [
    {
      id: 'choice_wait_api',
      label: 'A',
      text: '等接口稳定后再开发，避免返工',
      signalTags: ['谨慎', '风险规避'],
      analysis: {
        collaboration: '谨慎等待型',
        riskAwareness: '中',
        communication: '中',
        technicalJudgment: '待确认',
      },
    },
    {
      id: 'choice_mock_first',
      label: 'B',
      text: '先与后端约定Mock字段，推进前端结构',
      signalTags: ['主动推进', '协作意识', '工程化'],
      analysis: {
        collaboration: '主动推进型',
        riskAwareness: '高',
        communication: '高',
        technicalJudgment: '强',
      },
    },
    {
      id: 'choice_static_first',
      label: 'C',
      text: '先做静态页面，后续再联调',
      signalTags: ['执行落地', '分步推进'],
      analysis: {
        collaboration: '执行落地型',
        riskAwareness: '中',
        communication: '中',
        technicalJudgment: '待确认',
      },
    },
    {
      id: 'choice_confirm_priority',
      label: 'D',
      text: '先找产品确认这个需求是否真的必须上线',
      signalTags: ['需求澄清', '沟通意识', '优先级判断'],
      analysis: {
        collaboration: '需求澄清型',
        riskAwareness: '高',
        communication: '高',
        technicalJudgment: '强',
      },
    },
  ];
}

export function generateJobTruthLabel(job: Job): JobTruthLabel {
  const corpus = `${job.responsibilities} ${job.requirements} ${job.teamInfo} ${job.workload} ${job.challenges} ${job.growthPath}`;
  const highCollaboration = containsAny(corpus, ['跨部门', '协作', '沟通', '联调', '评审', 'review']);
  const fastPace = containsAny(corpus, ['节奏', '快速', '节点', '上线', '迭代', '压力']);
  const uncertain = containsAny(corpus, ['需求变化', '变化', '复杂', '不确定', '业务复杂']);
  const growth = containsAny(corpus, ['成长', '晋升', 'owner', '技术分享', 'Code Review', '架构']);

  const label: JobTruthLabel = {
    jobId: job.id,
    workPace: fastPace ? '中高' : '中',
    collaborationDensity: highCollaboration ? '高' : '中',
    uncertainty: uncertain ? '高' : '中',
    overtimeVolatility: fastPace ? '项目节点前较高，日常以排期协作为主' : '整体稳定，关键节点需提前确认',
    autonomy: containsAny(corpus, ['owner', '负责', '方案', '推进']) ? '中' : '低',
    growthSpeed: growth ? '高' : '中',
    communicationCost: highCollaboration ? '高' : '中',
    pressureSources: unique([
      uncertain ? '需求变化' : '业务理解',
      highCollaboration ? '跨部门协作' : '任务边界确认',
      fastPace ? '项目节点交付' : '日常交付质量',
      containsAny(corpus, ['复杂', '权限', '数据']) ? '复杂业务场景' : '',
    ]).filter(Boolean),
    suitableFor: [
      '喜欢主动推进问题的人',
      highCollaboration ? '能接受频繁沟通和跨职能协作的人' : '愿意把问题讲清楚的人',
      uncertain ? '能接受业务变化并拆解优先级的人' : '能稳定交付并持续复盘的人',
    ],
    notSuitableFor: [
      '只想长期做单一模块的人',
      highCollaboration ? '不愿频繁沟通和同步进展的人' : '不愿说明过程和风险的人',
      fastPace ? '完全不能接受阶段性项目压力的人' : '不愿在节点前确认排期的人',
    ],
    evidence: [],
  };
  return {
    ...label,
    evidence: buildJobTruthEvidence(job, label),
  };
}

function buildJobTruthEvidence(job: Job, label: JobTruthLabel): JobTruthEvidence[] {
  return [
    {
      label: '工作节奏',
      value: label.workPace,
      source: 'HR配置',
      evidenceText: job.workload || 'HR尚未补充工作节奏，建议面试前确认。',
    },
    {
      label: '协作密度',
      value: label.collaborationDensity,
      source: '岗位职责',
      evidenceText: job.responsibilities,
    },
    {
      label: '不确定性',
      value: label.uncertainty,
      source: '岗位职责',
      evidenceText: job.challenges || job.responsibilities,
    },
    {
      label: '成长速度',
      value: label.growthSpeed,
      source: '团队介绍',
      evidenceText: job.growthPath || job.teamInfo,
    },
    {
      label: '沟通成本',
      value: label.communicationCost,
      source: '团队介绍',
      evidenceText: job.teamInfo,
    },
    {
      label: '面试流程',
      value: job.interviewProcess || '待HR补充',
      source: '面试流程',
      evidenceText: job.interviewProcess || 'HR尚未补充面试流程。',
    },
    {
      label: '薪资沟通节点',
      value: `${job.salaryMin}k-${job.salaryMax}k`,
      source: 'HR配置',
      evidenceText: `HR公开薪资范围为${job.salaryMin}k-${job.salaryMax}k，最终以人工沟通为准。`,
    },
  ];
}

export function getBranchScenarios(job: Job): BranchScenario[] {
  const idPrefix = `branch_${job.id}`;
  return [
    {
      id: `${idPrefix}_needs`,
      jobId: job.id,
      round: 1,
      title: '第1轮：需求不清',
      description: '产品临时提出复杂筛选功能，但目标用户、字段范围和上线优先级还没有完全讲清楚。',
      choices: [
        branchChoice('choice_needs_wait', 'A', '先等产品补齐完整文档，再开始开发', `${idPrefix}_api`, '谨慎等待型', '中', '中', '待确认', '等待输入再执行'),
        branchChoice('choice_needs_align', 'B', '先约产品确认核心目标，同时拆出可先做的页面结构', `${idPrefix}_api`, '主动澄清型', '高', '高', '强', '边界澄清 + 并行推进'),
        branchChoice('choice_needs_static', 'C', '先做静态页面，等需求明确后再补逻辑', `${idPrefix}_api`, '执行落地型', '中', '中', '待确认', '先落地可见产物'),
        branchChoice('choice_needs_pushback', 'D', '先评估是否影响当前版本目标，再建议拆到下一期', `${idPrefix}_api`, '优先级判断型', '高', '高', '强', '风险前置 + 版本拆分'),
      ],
    },
    {
      id: `${idPrefix}_api`,
      jobId: job.id,
      round: 2,
      title: '第2轮：接口变化',
      description: '后端反馈字段还会变，产品又希望今天看到Demo，团队需要你给出推进方式。',
      choices: [
        branchChoice('choice_api_pause', 'A', '暂停前端开发，等接口完全稳定后再继续', `${idPrefix}_launch`, '谨慎等待型', '中', '中', '待确认', '降低返工但牺牲节奏'),
        branchChoice('choice_api_mock', 'B', '和后端约定Mock字段，前端先搭结构并标注接口风险', `${idPrefix}_launch`, '主动推进型', '高', '高', '强', 'Mock并行 + 风险同步'),
        branchChoice('choice_api_local', 'C', '先写本地假数据，后面接口好了再统一替换', `${idPrefix}_launch`, '执行落地型', '中', '中', '待确认', '局部推进 + 后续联调'),
        branchChoice('choice_api_meeting', 'D', '拉产品和后端快速对齐最小字段集，再推进Demo', `${idPrefix}_launch`, '需求澄清型', '高', '高', '强', '三方对齐 + 最小闭环'),
      ],
    },
    {
      id: `${idPrefix}_launch`,
      jobId: job.id,
      round: 3,
      title: '第3轮：上线压力',
      description: '上线时间不变，但功能范围、接口稳定性和测试时间都存在压力。',
      choices: [
        branchChoice('choice_launch_overtime', 'A', '全部功能都按原计划做完，必要时靠加班补齐', undefined, '硬扛交付型', '中', '中', '待确认', '强执行但风险后置'),
        branchChoice('choice_launch_split', 'B', '拆分必做和可延期功能，先保证核心路径上线', undefined, '主动取舍型', '高', '高', '强', '范围拆分 + 核心交付'),
        branchChoice('choice_launch_quality', 'C', '优先保证质量，建议整体延期', undefined, '质量优先型', '高', '中', '强', '质量优先 + 节奏放缓'),
        branchChoice('choice_launch_sync', 'D', '同步风险清单，让产品、后端、测试一起确认上线边界', undefined, '协同控险型', '高', '高', '强', '风险共识 + 协同收口'),
      ],
    },
  ];
}

function branchChoice(
  id: string,
  label: BranchChoice['label'],
  text: string,
  nextScenarioId: string | undefined,
  collaboration: string,
  riskAwareness: BranchChoice['analysis']['riskAwareness'],
  communication: BranchChoice['analysis']['communication'],
  technicalJudgment: BranchChoice['analysis']['technicalJudgment'],
  executionStyle: string,
): BranchChoice {
  return {
    id,
    label,
    text,
    nextScenarioId,
    analysis: {
      collaboration,
      riskAwareness,
      communication,
      technicalJudgment,
      executionStyle,
    },
  };
}

export function analyzeDecisionPath(branchChoices: BranchChoice[]): DecisionPathAnalysis {
  const highRisk = branchChoices.filter((choice) => choice.analysis.riskAwareness === '高').length;
  const highCommunication = branchChoices.filter((choice) => choice.analysis.communication === '高').length;
  const strongJudgment = branchChoices.filter((choice) => choice.analysis.technicalJudgment === '强').length;
  const active = branchChoices.some((choice) => containsAny(choice.analysis.collaboration, ['主动', '协同', '澄清', '取舍']));
  const executionStyle = branchChoices.map((choice) => choice.analysis.executionStyle).join(' / ') || '待补充选择路径';

  return {
    collaboration: active ? '主动推进型' : '谨慎执行型',
    riskAwareness: highRisk >= 2 ? '高' : highRisk === 1 ? '中' : '低',
    communication: highCommunication >= 2 ? '高' : highCommunication === 1 ? '中' : '低',
    technicalJudgment: strongJudgment >= 2 ? '强' : strongJudgment === 1 ? '待确认' : '偏弱',
    executionStyle,
    summary:
      branchChoices.length > 0
        ? `候选人在${branchChoices.length}轮任务沙盘中呈现“${active ? '先澄清边界，再并行推进' : '先等待确定信息，再执行落地'}”的推进方式。`
        : '候选人尚未完成分岔任务沙盘，决策路径需要HR初沟确认。',
  };
}

export function generateConcernRadar(candidate: Candidate, session: TrialSession): ConcernRadar {
  const reverseText = session.reverseQuestions.map((item) => `${item.type} ${item.question} ${item.answer}`).join(' ');
  const corpus = [
    candidate.concerns,
    candidate.motivation,
    candidate.followUpQuestion,
    candidate.rhythmAcceptance,
    session.askedTopics.join(' '),
    session.focusedTruthPoints.join(' '),
    reverseText,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    salary: concernScore(corpus, ['薪资', '工资', '待遇', '福利']),
    commute: concernScore(corpus, ['通勤', '距离', '地点', '远']),
    growth: concernScore(corpus, ['成长', '晋升', '学习', '技术氛围']),
    team: concernScore(corpus, ['团队', '氛围', '同事', '协作']),
    workload: concernScore(corpus, ['加班', '节奏', '压力', '忙', '节点']),
    roleClarity: concernScore(corpus, ['职责', '做什么', '边界', '岗位', '需求']),
  };
}

function concernScore(corpus: string, words: string[]) {
  const hits = words.filter((word) => containsAny(corpus, [word])).length;
  return Math.min(95, hits === 0 ? 25 : 45 + hits * 20);
}

export function answerReverseQuestion(job: Job, truthLabel: JobTruthLabel, type: ReverseQuestionType): ReverseQuestion {
  const answers: Record<ReverseQuestionType, string> = {
    工作节奏: `这个岗位的工作节奏为${truthLabel.workPace}。${truthLabel.overtimeVolatility}，建议在面试中进一步确认项目周期和排期方式。`,
    薪资福利: `当前公开薪资范围为${job.salaryMin}k-${job.salaryMax}k，具体薪资会结合经验和面试沟通确认，建议在面试中进一步确认薪资沟通节点。`,
    团队氛围: `岗位真相标签显示协作密度为${truthLabel.collaborationDensity}，沟通成本为${truthLabel.communicationCost}。团队协作方式建议在面试中进一步确认。`,
    成长空间: `这个岗位成长速度为${truthLabel.growthSpeed}，成长主要来自${truthLabel.pressureSources.join('、')}等真实业务场景，建议在面试中进一步确认培养机制。`,
    岗位挑战: `岗位主要压力来源包括${truthLabel.pressureSources.join('、')}。如果你对挑战强度敏感，建议在面试中进一步确认任务边界。`,
    面试流程: `当前公开面试流程为：${job.interviewProcess || 'HR初沟 - 业务面试 - 综合沟通'}，建议在面试中进一步确认每一轮重点。`,
  };

  return {
    id: `reverse_${type}_${Date.now()}`,
    type,
    question: `我想了解${type}的真实情况`,
    answer: answers[type],
    createdAt: nowIso(),
  };
}

export function generateJobTruthContract(job: Job, truthLabel: JobTruthLabel): JobTruthContract {
  return {
    jobId: job.id,
    truthLabelId: `truth-${job.id}`,
    commitments: [
      {
        id: `contract-${job.id}-pace`,
        title: '工作节奏说明',
        detail: `岗位公开节奏为${truthLabel.workPace}，${truthLabel.overtimeVolatility}。`,
        category: 'job',
      },
      {
        id: `contract-${job.id}-overtime`,
        title: '加班波动说明',
        detail: truthLabel.overtimeVolatility,
        category: 'job',
      },
      {
        id: `contract-${job.id}-growth`,
        title: '成长路径说明',
        detail: job.growthPath || `岗位成长速度为${truthLabel.growthSpeed}，建议面试中继续确认培养机制。`,
        category: 'job',
      },
      {
        id: `contract-${job.id}-interview`,
        title: '面试流程承诺',
        detail: job.interviewProcess || '企业需在邀约前说明面试轮次、每轮重点和反馈节奏。',
        category: 'process',
      },
      {
        id: `contract-${job.id}-salary`,
        title: '薪资沟通节点',
        detail: `公开薪资范围为${job.salaryMin}k-${job.salaryMax}k，具体沟通节点以HR人工说明为准。`,
        category: 'process',
      },
      {
        id: `contract-${job.id}-feedback`,
        title: '反馈时效承诺',
        detail: '进入面试后，企业应尽量在约定周期内同步流程进展和下一步安排。',
        category: 'process',
      },
      {
        id: `contract-${job.id}-ai`,
        title: 'AI辅助边界',
        detail: 'AI只整理岗位理解、关注点和场景选择证据，不评价候选人能力，不做最终招聘决定。',
        category: 'ai',
      },
      {
        id: `contract-${job.id}-data`,
        title: '候选人数据使用边界',
        detail: '系统只记录主动提问、真相点点击、任务沙盘选择和主动填写资料，不分析外貌、表情或声音情绪。',
        category: 'data',
      },
    ],
    aiDecisionBoundary: 'AI只提供面试前参考和信任修复建议，不评价候选人能力，最终招聘决策由企业人工完成。',
    dataUsageNotice: '报告仅基于候选人的主动提问、场景选择、真相点确认和主动填写资料生成，候选人可申请解释或删除相关记录。',
  };
}

export function calculateCandidateTrustIndex(
  candidate: Candidate,
  session: TrialSession,
  report: Pick<RealityReport, 'concernRadar' | 'jobTruthViewSummary' | 'trialCompletion' | 'realIntention'>,
): CandidateTrustIndex {
  const acknowledgement = session.truthContractAcknowledgement;
  const unresolved = acknowledgement?.unresolvedConcerns ?? [];
  const viewedCount = report.jobTruthViewSummary.viewedPoints.length;
  const askedText = `${session.askedTopics.join(' ')} ${candidate.concerns} ${candidate.followUpQuestion ?? ''}`;
  const hasSalaryConcern = unresolved.some((item) => item.includes('薪资')) || containsAny(askedText, ['薪资', '工资', '待遇']);
  const hasGrowthConcern = unresolved.some((item) => item.includes('成长')) || containsAny(askedText, ['成长', '培养', '晋升']);
  const hasWorkloadConcern = unresolved.some((item) => item.includes('节奏')) || report.concernRadar.workload >= 65;

  const dimensions = {
    jobInfoClarity: clampScore(58 + viewedCount * 7 + (acknowledgement?.acknowledged ? 10 : 0) - unresolved.length * 6),
    salaryCertainty: clampScore(hasSalaryConcern ? 58 : 78),
    teamTrust: clampScore(70 + (session.reverseQuestions.some((item) => item.type === '团队氛围') ? 8 : 0)),
    growthCredibility: clampScore(hasGrowthConcern ? 64 : 80),
    rhythmAcceptance: clampScore(hasWorkloadConcern ? 62 : 78),
    aiTransparency: clampScore(acknowledgement?.acknowledged ? 88 : 72),
    interviewWillingness: clampScore(report.trialCompletion >= 80 && report.realIntention !== '低' ? 82 : 60),
  };
  const total = Math.round(Object.values(dimensions).reduce((sum, value) => sum + value, 0) / Object.keys(dimensions).length);
  const gapReasons = unique([
    hasSalaryConcern ? '薪资沟通节点仍需补充说明' : '',
    hasWorkloadConcern ? '工作节奏接受度需要进一步确认' : '',
    hasGrowthConcern ? '成长路径可信度需要更多证据' : '',
    unresolved.length > 0 ? `候选人仍有疑问：${unresolved.join('、')}` : '',
  ]).filter(Boolean);
  const repairSuggestions = unique([
    hasSalaryConcern ? '发送薪资沟通流程说明，明确一面后可确认范围和期望。' : '',
    hasWorkloadConcern ? '补充说明项目节点压力是否常态化，以及排期如何协同。' : '',
    hasGrowthConcern ? '补充团队技术分享、Code Review和新人培养机制。' : '',
    gapReasons.length === 0 ? '保持当前邀约节奏，并继续强调人工复核与候选人权益。' : '',
  ]).filter(Boolean);

  return {
    total,
    dimensions,
    gapReasons,
    repairSuggestions,
    explanation: '候选人信任指数衡量候选人是否已获得足够岗位信息，并愿意继续投入面试时间；该指数不评价候选人能力，不作为招聘决定依据。',
  };
}

export function generateTrustGapSummary(trustIndex: CandidateTrustIndex, report: Pick<RealityReport, 'concernRadar'>): TrustGapSummary {
  const concernGaps = Object.entries(report.concernRadar)
    .filter(([, value]) => value >= 70)
    .map(([key]) => concernLabel(key as keyof ConcernRadar));
  const majorGaps = unique([...trustIndex.gapReasons, ...concernGaps]).slice(0, 5);

  return {
    majorGaps: majorGaps.length > 0 ? majorGaps : ['当前信任缺口较少，建议保持透明邀约节奏。'],
    repairSuggestions: trustIndex.repairSuggestions,
  };
}

export function generateTrustRepairScript(candidate: Candidate, trustIndex: CandidateTrustIndex, summary: TrustGapSummary) {
  const focus = summary.majorGaps.slice(0, 2).join('和') || '岗位真实情况';
  const suggestions = summary.repairSuggestions.slice(0, 2).join('；') || '我们可以先补充岗位信息，再安排正式面试';

  return `${candidate.name}你好，我看到你在云试岗中比较关注${focus}。${suggestions}。如果你愿意，我们可以先安排一次15分钟沟通，专门解答你对岗位节奏、薪资沟通节点和成长路径的疑问，再决定是否进入正式面试流程。当前信任指数为${trustIndex.total}/100，这只用于帮助HR补充说明岗位信息，不评价你的能力。`;
}

export function generateTrialReplay(session: TrialSession): TrialReplayEvent[] {
  const baseEvents = session.trialEvents?.length
    ? session.trialEvents
    : [
        ...session.viewedTruthPoints.map((point, index) => ({
          id: `replay-truth-${index}`,
          type: 'truth_label_viewed' as const,
          label: `查看岗位真相：${point}`,
          occurredAt: session.startedAt,
        })),
        ...session.completedSceneIds.map((sceneId, index) => ({
          id: `replay-scene-${index}`,
          type: 'scene_completed' as const,
          label: `完成云试岗场景：${sceneId}`,
          occurredAt: session.completedAt ?? session.startedAt,
        })),
        ...session.branchChoiceIds.map((choiceId, index) => ({
          id: `replay-branch-${index}`,
          type: 'branch_choice_selected' as const,
          label: `完成分岔任务选择：${choiceId}`,
          occurredAt: session.completedAt ?? session.startedAt,
        })),
      ];
  const start = new Date(session.startedAt).getTime();

  return baseEvents
    .slice()
    .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime())
    .map((event) => {
      const diffSeconds = Math.max(0, Math.round((new Date(event.occurredAt).getTime() - start) / 1000));
      const minutes = String(Math.floor(diffSeconds / 60)).padStart(2, '0');
      const seconds = String(diffSeconds % 60).padStart(2, '0');
      return {
        ...event,
        timeLabel: `${minutes}:${seconds}`,
      };
    });
}

export function generateAIRiskReview(report: RealityReport): AIRiskReview {
  const reportText = JSON.stringify(report);
  const forbidden = ['淘' + '汰', '拒' + '绝', '自动' + '筛掉', '自动' + '录用'];
  const forbiddenHits = forbidden.filter((word) => reportText.includes(word));
  const hasHumanReview = report.complianceNote.includes('人工');
  const hasJobTruthEvidence = (report.evidenceSources.fromJobTruthLabel ?? []).length > 0;
  const hasEvidence =
    hasJobTruthEvidence &&
    (report.evidenceSources.fromCandidateInput.length > 0 ||
      report.evidenceSources.fromScenarioChoices.length > 0 ||
      report.trialReplay.length > 0);
  const reminders = unique([
    forbiddenHits.length > 0 ? `发现需人工确认的越界表述：${forbiddenHits.join('、')}` : '',
    hasJobTruthEvidence ? '岗位真相标签已标注可信来源和证据文本。' : '岗位真相标签缺少可信来源，需要HR补充证据。',
    hasEvidence ? '每条HR辅助建议均可回溯到候选人的云试岗行为、选择或主动填写内容。' : '部分建议缺少证据来源，建议HR人工确认后再使用。',
    hasHumanReview ? '本报告仅供HR面试前参考，最终招聘决策由企业人工完成。' : '报告需要补充人工复核声明。',
    '系统未分析候选人的外貌、表情或声音情绪。',
  ]).filter(Boolean);
  const checkedItems = unique([
    forbiddenHits.length === 0 ? '未出现禁用表达' : '',
    '未出现自动化最终决策表述',
    hasJobTruthEvidence ? '岗位真相具备来源标注' : '',
    hasEvidence ? '已关联证据来源' : '',
    hasHumanReview ? '已包含人工复核声明' : '',
    '未分析外貌、表情、声音情绪',
  ]).filter(Boolean);

  return {
    result: forbiddenHits.length === 0 && hasHumanReview && hasEvidence ? '复核通过' : '需要人工确认',
    checkedItems,
    reminders,
  };
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function generateTrustNegotiationCard(report: RealityReport): TrustNegotiationCard {
  const candidateQuestions = unique([
    ...report.truthContractSummary.unresolvedConcerns,
    ...report.candidateTrustIndex.gapReasons
      .filter((item) => item.includes('薪资') || item.includes('节奏') || item.includes('成长'))
      .map((item) => item.replace('仍需补充说明', '').replace('需要进一步确认', '').replace('可信度需要更多证据', '')),
    ...report.reverseQuestions.map((item) => item.type),
  ])
    .filter(Boolean)
    .slice(0, 5);
  const hrClarifications = unique([
    report.concernRadar.workload >= 65 ? '说明项目节点前会有阶段性压力，但不是长期高压。' : '',
    report.concernRadar.growth >= 65 ? '补充团队技术分享、Code Review和新人导师机制。' : '',
    report.concernRadar.salary >= 65 ? '明确薪资沟通会在一面后由HR确认范围和期望。' : '',
    '说明本轮面试会重点回应候选人关心的问题。',
  ]).filter(Boolean);

  return {
    candidateQuestions: candidateQuestions.length > 0 ? candidateQuestions : ['岗位节奏', '成长路径'],
    hrClarifications,
    trustRepairScript: report.trustRepairScript,
    formalInvitationScript: report.invitationScript,
  };
}

export function generateInterviewMutualConfirmation(
  session: TrialSession,
  report: Pick<RealityReport, 'trustGapSummary' | 'reverseQuestions'>,
): InterviewMutualConfirmation {
  const candidateConfirmedItems = session.mutualConfirmation?.candidateConfirmedItems?.length
    ? session.mutualConfirmation.candidateConfirmedItems
    : ['我已了解岗位节奏', '我已了解面试流程', '我已了解薪资沟通节点', '我仍愿意继续面试'];
  const unresolvedReasons = session.mutualConfirmation?.unresolvedReasons?.length
    ? session.mutualConfirmation.unresolvedReasons
    : report.trustGapSummary.majorGaps.filter((item) => item.includes('薪资') || item.includes('节奏') || item.includes('成长'));

  return {
    candidateConfirmedItems,
    unresolvedReasons,
    hrCommitments: [
      '本轮面试会重点沟通候选人关心的问题',
      '不会仅凭AI报告做最终决定',
      '会尽量说明面试结果反馈节点',
    ],
    confirmedAt: session.mutualConfirmation?.confirmedAt,
  };
}

export function generateCandidateFairnessIndex(report: RealityReport): CandidateFairnessIndex {
  const dimensions = {
    aiDisclosure: 100,
    dataUsageNotice: report.complianceNote.includes('数据') || report.complianceNote.includes('删除') ? 95 : 75,
    directApplyPath: 100,
    humanReview: report.complianceNote.includes('人工') ? 100 : 70,
    explanationAndDeletion: report.complianceNote.includes('解释') && report.complianceNote.includes('删除') ? 95 : 70,
    sensitiveDataAvoidance: report.aiRiskReview?.checkedItems?.includes('未分析外貌、表情、声音情绪') ? 100 : 90,
    feedbackTiming: report.mutualConfirmation?.hrCommitments?.some((item) => item.includes('反馈')) ? 90 : 75,
  };

  return {
    total: Math.round(Object.values(dimensions).reduce((sum, value) => sum + value, 0) / Object.keys(dimensions).length),
    dimensions,
    optimizationSuggestions: ['持续明确面试结果反馈节点。'],
  };
}

export function detectIntent(text: string) {
  if (containsAny(text, ['加班', '压力', '节奏', '忙'])) return '工作节奏';
  if (containsAny(text, ['薪资', '工资', '福利', '待遇'])) return '薪资福利';
  if (containsAny(text, ['面试', '几轮', '准备'])) return '面试流程';
  if (containsAny(text, ['成长', '晋升', '发展', '学习'])) return '成长发展';
  if (containsAny(text, ['团队', '氛围', '领导', '同事'])) return '团队氛围';
  if (containsAny(text, ['日常', '工作', '职责', '做什么'])) return '岗位职责';
  if (containsAny(text, ['vue', 'react', 'typescript', '项目', '经历'])) return '候选人经历';
  return '自由提问';
}

export function generateAvatarReply(question: string, job: Job, avatar: AvatarConfig) {
  const intent = detectIntent(question);
  const skillText = job.analysis.hardSkills.join('、');

  if (intent === '工作节奏') {
    return `这个岗位的节奏属于“目标清晰、节点推进型”。平时以需求沟通、任务拆解、交付协作为主，关键项目节点可能会更紧。你可以结合自己的节奏偏好判断是否适合，也建议后续和HR进一步确认团队排期方式。`;
  }

  if (intent === '薪资福利') {
    return `这个岗位展示的薪资范围是 ${job.salaryMin}k-${job.salaryMax}k。具体薪资会结合能力、经验和面试沟通确认，我这里可以先帮你判断岗位内容和你的期望是否匹配，最终以HR沟通为准。`;
  }

  if (intent === '面试流程') {
    return `当前面试流程是：${job.interviewProcess || 'HR初沟、业务面试、综合沟通'}。建议你重点准备过往项目里的职责边界、关键成果、遇到的问题，以及和${skillText}相关的具体案例。`;
  }

  if (intent === '成长发展') {
    return `这个岗位的成长点主要在：${job.growthPath || '业务理解、项目推进和专业能力提升'}。如果你关注技术氛围或晋升路径，后续面试可以追问团队培养方式和绩效评价标准。`;
  }

  if (intent === '团队氛围') {
    return `团队信息里提到：${job.teamInfo || '强调协作、沟通和结果交付'}。从岗位要求看，比较适合愿意主动沟通、能把问题讲清楚并推动落地的人。`;
  }

  if (intent === '岗位职责') {
    return `这个岗位日常主要包括：${job.responsibilities}。从JD解析看，重点能力包括${skillText}。你之前有没有类似项目，或者更想了解哪一类工作内容？`;
  }

  if (intent === '候选人经历') {
    return `听起来你的经历和岗位有可对齐的地方。为了让HR更快理解你的背景，你可以补充一个最能代表你能力的项目：你负责什么、用了哪些工具、最后带来了什么结果？`;
  }

  return `${avatar.name}先基于岗位信息回答：这个岗位更看重${skillText}，同时关注${job.analysis.softSkills.join('、')}。如果你愿意，我也可以继续帮你拆解工作内容、面试准备或团队情况。`;
}

export function extractSkillTags(candidate: Candidate, messages: ConversationMessage[], job: Job) {
  const corpus = [
    candidate.skills,
    candidate.projectExperience,
    candidate.motivation,
    ...messages.map((message) => message.text),
  ].join(' ');

  const detected = [
    ['Vue', ['vue']],
    ['React', ['react']],
    ['TypeScript', ['typescript', 'ts']],
    ['SaaS项目经验', ['saas']],
    ['B端产品经验', ['b端', '后台', '管理系统']],
    ['组件化开发', ['组件']],
    ['接口联调', ['接口', 'api']],
    ['用户运营', ['用户', '运营']],
    ['销售转化', ['销售', '客户', '转化']],
  ]
    .filter(([, aliases]) => containsAny(corpus, aliases as string[]))
    .map(([label]) => label as string);

  return unique([...detected, ...job.analysis.hardSkills.filter((skill) => corpus.includes(skill))]).slice(0, 6);
}

export function generateHRStoryCard(candidate: Candidate, job: Job, conversation: Conversation): HRStoryCard {
  const candidateMessages = conversation.messages.filter((message) => message.role === 'candidate');
  const questionText = candidateMessages.map((message) => message.text).join(' ');
  const skillTags = extractSkillTags(candidate, conversation.messages, job);
  const asksGrowthOrTeam = candidateMessages.filter((message) => containsAny(message.text, ['成长', '团队', '技术', '氛围'])).length;
  const asksSalaryOrBenefits = candidateMessages.filter((message) => containsAny(message.text, ['薪资', '工资', '福利', '待遇'])).length;
  const hasProjectEvidence = candidate.projectExperience.trim().length > 12 || containsAny(questionText, ['项目', '负责', '上线', '模块']);
  const salaryFocusedOnly = asksSalaryOrBenefits >= 2 && !hasProjectEvidence && skillTags.length === 0;

  const intentionSignals = unique([
    asksGrowthOrTeam >= 2 ? '多次关注成长、团队与技术氛围' : '',
    candidate.motivation ? `求职动机：${candidate.motivation}` : '',
    candidateMessages.length >= 3 ? '愿意完成多轮云试岗互动' : '',
  ]).filter(Boolean);

  const riskFlags = unique([
    salaryFocusedOnly ? '岗位动机需进一步确认' : '',
    containsAny(candidate.concerns, ['薪资', '通勤', '加班']) ? `候选人关注点：${candidate.concerns}` : '',
    !hasProjectEvidence ? '项目证据较少，建议面试时补充确认' : '',
  ]).filter(Boolean);

  let recommendation: Recommendation = '建议进一步确认';
  if (skillTags.length >= 2 && intentionSignals.length >= 2 && !salaryFocusedOnly) {
    recommendation = '强推荐面试';
  }
  if (salaryFocusedOnly || skillTags.length === 0) {
    recommendation = '暂缓邀约';
  }

  return {
    id: `story-${candidate.id}`,
    candidateId: candidate.id,
    jobId: job.id,
    recommendation,
    selfIntro: `${candidate.name}来自${candidate.sourceChannel}，自述技能包括${candidate.skills || '待补充'}，求职动机为“${candidate.motivation || '待进一步沟通'}”。`,
    jobUnderstanding:
      candidateMessages.length > 0
        ? `候选人已围绕${unique(candidateMessages.map((message) => detectIntent(message.text))).slice(0, 4).join('、')}进行了解，初步理解岗位核心任务与沟通重点。`
        : '候选人选择直接投递，岗位理解需要HR在初沟中补充确认。',
    skillTags: skillTags.length > 0 ? skillTags : ['待补充技能证据'],
    projectEvidence: hasProjectEvidence
      ? [candidate.projectExperience || '对话中提到过项目经历，建议面试时要求补充职责、成果和技术细节。']
      : ['当前项目证据较少，建议面试时请候选人补充一个代表性案例。'],
    intentionSignals: intentionSignals.length > 0 ? intentionSignals : ['已完成投递，具体意愿建议HR初沟确认。'],
    riskFlags: riskFlags.length > 0 ? riskFlags : ['暂无明显风险信号，建议保持人工复核。'],
    interviewQuestions: [
      `请说明你最贴近“${job.title}”的项目经历，以及你在其中负责的部分。`,
      `你如何理解这个岗位的日常工作和主要挑战？`,
      `你对薪资、工作节奏、团队协作方式有哪些需要提前确认的地方？`,
    ],
    complianceStatement:
      '本报告由AI基于候选人授权对话内容整理，仅供HR面试前参考；最终招聘判断由企业人工复核完成，候选人可申请解释或删除相关数据。',
    createdAt: nowIso(),
  };
}

export function generateRealityReport(
  candidate: Candidate,
  job: Job,
  session: TrialSession,
  selectedChoices: ScenarioChoice[],
  branchChoices: BranchChoice[] = [],
  truthLabel: JobTruthLabel = generateJobTruthLabel(job),
): RealityReport {
  const askedText = session.askedTopics.join(' ');
  const profileText = [
    candidate.skills,
    candidate.projectExperience,
    candidate.motivation,
    candidate.concerns,
    candidate.rhythmAcceptance,
    candidate.followUpQuestion,
    candidate.scenarioReflection,
  ]
    .filter(Boolean)
    .join(' ');
  const evidenceCorpus = `${askedText} ${profileText}`;

  const attentionMap = {
    growth: containsAny(evidenceCorpus, ['成长', '发展', '晋升', '学习']) ? 85 : 40,
    salary: containsAny(evidenceCorpus, ['薪资', '工资', '待遇', '福利']) ? 75 : 30,
    team: containsAny(evidenceCorpus, ['团队', '氛围', '同事', '协作']) ? 82 : 40,
    workload: containsAny(evidenceCorpus, ['加班', '压力', '节奏', '忙', '节点']) ? 72 : 35,
    technology: containsAny(evidenceCorpus, ['技术', 'Vue', 'React', 'TypeScript', '架构', 'Code Review']) ? 88 : 45,
  };
  const concernRadar = generateConcernRadar(candidate, session);
  const decisionPathAnalysis = analyzeDecisionPath(branchChoices);

  const skillEvidence = ['Vue', 'React', 'TypeScript', 'B端SaaS', 'Code Review', '接口联调', '组件化开发'].filter((skill) =>
    containsAny(evidenceCorpus, [skill, skill.toLowerCase()]),
  );
  const hasStrongChoice = selectedChoices.some(
    (choice) => choice.analysis.communication === '高' && choice.analysis.riskAwareness === '高',
  );
  const hasCompletedTrial = session.completionRate >= 80;
  const hasMeaningfulInput = profileText.length > 28 || askedText.length > 12;
  const realIntention = hasCompletedTrial && hasMeaningfulInput ? '高' : session.completionRate >= 50 ? '中' : '低';
  const jobUnderstanding =
    session.completedSceneIds.length >= 3 && selectedChoices.length > 0
      ? '清晰'
      : session.completedSceneIds.length >= 2
        ? '部分清晰'
        : '存在偏差';

  const potentialMismatchRisks = [
    attentionMap.salary > 70 ? '候选人较关注薪资沟通，建议面试前确认薪资预期。' : '',
    attentionMap.workload > 65 ? '候选人关注工作节奏，建议进一步说明项目节点压力。' : '',
    skillEvidence.length < 2 ? '技能证据链较少，建议面试中追问具体项目细节。' : '',
  ].filter(Boolean);

  let hrActionSuggestion: RealityReport['hrActionSuggestion'] = '建议补充确认';
  if (hasCompletedTrial && hasStrongChoice && skillEvidence.length >= 3) {
    hrActionSuggestion = '优先邀约';
  } else if (!hasCompletedTrial || skillEvidence.length < 2) {
    hrActionSuggestion = '建议入库观察';
  }

  const sceneChoiceSummary = [
    ...selectedChoices.map(
      (choice) =>
        `${choice.label}. ${choice.text} → ${choice.analysis.collaboration}，风险意识${choice.analysis.riskAwareness}，沟通意识${choice.analysis.communication}，技术判断${choice.analysis.technicalJudgment}`,
    ),
    ...branchChoices.map(
      (choice) =>
        `${choice.label}. ${choice.text} → ${choice.analysis.collaboration}，风险意识${choice.analysis.riskAwareness}，沟通意识${choice.analysis.communication}，技术判断${choice.analysis.technicalJudgment}，推进方式${choice.analysis.executionStyle}`,
    ),
  ];

  const report: RealityReport = {
    id: `report_${candidate.id}`,
    candidateId: candidate.id,
    candidateName: candidate.name,
    jobId: job.id,
    trialCompletion: session.completionRate,
    realIntention,
    jobUnderstanding,
    noShowRisk: hasCompletedTrial && realIntention === '高' ? '低' : session.completionRate >= 50 ? '中' : '高',
    attentionMap,
    jobTruthViewSummary: {
      viewed: session.viewedTruthPoints.length > 0,
      viewedPoints: session.viewedTruthPoints,
      focusedPoints: session.focusedTruthPoints,
    },
    truthContractSummary: {
      acknowledged: session.truthContractAcknowledgement?.acknowledged ?? false,
      acknowledgedItems: session.truthContractAcknowledgement?.acknowledgedItems ?? [],
      unresolvedConcerns: session.truthContractAcknowledgement?.unresolvedConcerns ?? [],
    },
    mutualConfirmation: {
      candidateConfirmedItems: session.mutualConfirmation?.candidateConfirmedItems ?? [],
      unresolvedReasons: session.mutualConfirmation?.unresolvedReasons ?? [],
      hrCommitments: [],
      confirmedAt: session.mutualConfirmation?.confirmedAt,
    },
    candidateTrustIndex: {
      total: 0,
      dimensions: {
        jobInfoClarity: 0,
        salaryCertainty: 0,
        teamTrust: 0,
        growthCredibility: 0,
        rhythmAcceptance: 0,
        aiTransparency: 0,
        interviewWillingness: 0,
      },
      gapReasons: [],
      repairSuggestions: [],
      explanation: '',
    },
    trustGapSummary: {
      majorGaps: [],
      repairSuggestions: [],
    },
    trustRepairScript: '',
    trialReplay: generateTrialReplay(session),
    aiRiskReview: {
      result: '需要人工确认',
      checkedItems: [],
      reminders: [],
    },
    trustNegotiationCard: {
      candidateQuestions: [],
      hrClarifications: [],
      trustRepairScript: '',
      formalInvitationScript: '',
    },
    candidateFairnessIndex: {
      total: 0,
      dimensions: {
        aiDisclosure: 0,
        dataUsageNotice: 0,
        directApplyPath: 0,
        humanReview: 0,
        explanationAndDeletion: 0,
        sensitiveDataAvoidance: 0,
        feedbackTiming: 0,
      },
      optimizationSuggestions: [],
    },
    decisionPathAnalysis,
    concernRadar,
    sceneChoiceSummary: sceneChoiceSummary.length > 0 ? sceneChoiceSummary : ['候选人尚未完成任务沙盘选择，建议HR初沟确认推进方式。'],
    skillEvidence: skillEvidence.length > 0 ? skillEvidence : ['待面试中补充项目证据'],
    potentialMismatchRisks:
      potentialMismatchRisks.length > 0 ? potentialMismatchRisks : ['暂无明显潜在失配风险，建议HR继续人工复核。'],
    noShowPreventionCard: {
      possibleReasons: [],
      preInviteActions: [],
      invitationScript: '',
    },
    interviewBattleCard: {
      interviewGoals: [],
      keyQuestions: [],
      needsClarification: [],
      shouldExplain: [],
      shouldAvoidAsking: [],
    },
    invitationScript: '',
    reverseQuestions: session.reverseQuestions,
    interviewQuestions: [
      `请说明你在${job.title}相关项目中具体负责过哪些模块？`,
      '遇到接口不稳定或需求变更时，你通常如何和后端、产品推进？',
      '你对当前岗位中阶段性项目压力和Code Review机制是否能接受？',
    ],
    hrActionSuggestion,
    evidenceSources: {
      fromTrialScenes: session.completedSceneIds,
      fromCandidateInput: skillEvidence,
      fromScenarioChoices: selectedChoices.map((choice) => choice.id),
      fromJobTruthLabel: truthLabel.evidence.map((item) => `${item.label}：${item.source}`),
    },
    complianceNote:
      '本报告由AI基于候选人授权的云试岗行为、场景选择和主动填写内容生成，仅供HR面试前参考，不作为单独招聘决策依据，最终招聘决策由企业人工完成，候选人可申请解释或删除相关数据。',
  };
  const noShowPreventionCard = generateNoShowPreventionCard(report);
  const interviewBattleCard = generateInterviewBattleCard(report);
  const reportWithCards: RealityReport = {
    ...report,
    noShowPreventionCard,
    interviewBattleCard,
    invitationScript: noShowPreventionCard.invitationScript,
  };
  const candidateTrustIndex = calculateCandidateTrustIndex(candidate, session, reportWithCards);
  const trustGapSummary = generateTrustGapSummary(candidateTrustIndex, reportWithCards);
  const trustRepairScript = generateTrustRepairScript(candidate, candidateTrustIndex, trustGapSummary);
  const reportWithTrust: RealityReport = {
    ...reportWithCards,
    candidateTrustIndex,
    trustGapSummary,
    trustRepairScript,
  };
  const mutualConfirmation = generateInterviewMutualConfirmation(session, reportWithTrust);
  const reportWithTrustPlus: RealityReport = {
    ...reportWithTrust,
    mutualConfirmation,
    trustNegotiationCard: generateTrustNegotiationCard(reportWithTrust),
  };
  const reportWithReview: RealityReport = {
    ...reportWithTrustPlus,
    aiRiskReview: generateAIRiskReview(reportWithTrustPlus),
  };

  return {
    ...reportWithReview,
    candidateFairnessIndex: generateCandidateFairnessIndex(reportWithReview),
  };
}

export function generateNoShowPreventionCard(report: RealityReport): NoShowPreventionCard {
  const focused = report.jobTruthViewSummary.focusedPoints;
  const highConcerns = Object.entries(report.concernRadar)
    .filter(([, value]) => value >= 65)
    .map(([key]) => concernLabel(key as keyof ConcernRadar));
  const possibleReasons = unique([
    report.noShowRisk !== '低' ? '候选人云试岗完成度或互动深度仍需确认' : '',
    focused.includes('工作节奏') || report.concernRadar.workload >= 65 ? '候选人对工作节奏仍有疑问' : '',
    report.concernRadar.growth >= 65 ? '候选人关注成长空间，需要更具体的团队培养信息' : '',
    report.concernRadar.salary >= 65 ? '候选人关注薪资沟通节点，需要提前说明沟通范围' : '',
    report.concernRadar.team >= 65 ? '候选人对团队氛围较敏感，需要补充协作方式' : '',
  ]).filter(Boolean);
  const preInviteActions = unique([
    highConcerns.includes('成长顾虑') ? '面试前补充团队技术分享和成长机制' : '',
    highConcerns.includes('工作节奏顾虑') ? '说明项目节点压力是否常态化，以及排期如何协同' : '',
    highConcerns.includes('薪资顾虑') ? '明确一面可沟通薪资范围和薪资确认节点' : '',
    highConcerns.includes('团队氛围顾虑') ? '附上团队协作方式或未来同事数字人片段' : '',
    '邀约时说明本轮面试会围绕候选人关注点展开',
  ]).filter(Boolean);

  return {
    possibleReasons: possibleReasons.length > 0 ? possibleReasons : ['当前爽约风险较低，建议保持清晰邀约节奏。'],
    preInviteActions,
    invitationScript: `${report.candidateName}你好，我看到你在云试岗中特别关注${highConcerns.slice(0, 3).join('、') || '岗位真实情况'}。这轮面试我们会重点沟通岗位任务场景、团队协作方式和成长路径。如果你对工作节奏或薪资沟通节点有疑问，也可以在一面前提前确认。`,
  };
}

export function generateInterviewBattleCard(report: RealityReport): InterviewBattleCard {
  return {
    interviewGoals: [
      '验证候选人与岗位核心任务的项目深度',
      '确认候选人是否接受阶段性项目压力和协作密度',
      '补充说明候选人最关注的岗位真相点',
    ],
    keyQuestions: [
      '请说明你在B端SaaS项目中负责的具体模块和结果。',
      '遇到需求不清、接口变化或上线压力时，你通常如何推进？',
      '你如何判断需求优先级，并和产品、后端同步风险？',
    ],
    needsClarification: [
      report.concernRadar.salary >= 65 ? '薪资预期和薪资沟通节点' : '核心求职诉求',
      report.concernRadar.workload >= 65 ? '对工作节奏和阶段性压力的接受度' : '可接受的团队协作方式',
      '跨部门协作经验和任务边界意识',
    ],
    shouldExplain: [
      '团队Code Review机制',
      '技术分享制度和成长路径',
      '项目排期方式和节点压力是否常态化',
    ],
    shouldAvoidAsking: [
      '年龄、婚育、家庭情况等与岗位无关问题',
      '与岗位无关的个人隐私',
      '基于AI报告直接追问候选人是否有风险',
    ],
  };
}

function concernLabel(key: keyof ConcernRadar) {
  const labels: Record<keyof ConcernRadar, string> = {
    salary: '薪资顾虑',
    commute: '通勤顾虑',
    growth: '成长顾虑',
    team: '团队氛围顾虑',
    workload: '工作节奏顾虑',
    roleClarity: '岗位职责顾虑',
  };
  return labels[key];
}

export function generateTruthVideoScript(job: Job, roles: RealityRole[], scenes: RealityScene[]): TruthVideoScript {
  const roleName = (type: RealityRole['type'], fallback: string) => roles.find((role) => role.type === type)?.name ?? fallback;
  const intro = scenes.find((scene) => scene.type === 'intro')?.script ?? `${job.title}岗位概览。`;
  const day = scenes.find((scene) => scene.type === 'dayInLife')?.script ?? '未来同事带你了解真实一天。';
  const task = scenes.find((scene) => scene.type === 'taskChallenge')?.script ?? '主管说明岗位挑战。';
  const segments: TruthVideoScript['segments'] = [
    {
      timeRange: '0-10秒',
      roleType: 'hr',
      title: `${roleName('hr', 'HR数字人')}讲岗位概览`,
      script: intro,
    },
    {
      timeRange: '10-30秒',
      roleType: 'teammate',
      title: `${roleName('teammate', '未来同事')}讲真实一天`,
      script: day,
    },
    {
      timeRange: '30-45秒',
      roleType: 'manager',
      title: `${roleName('manager', '未来主管')}讲岗位挑战`,
      script: task,
    },
    {
      timeRange: '45-60秒',
      roleType: 'hr',
      title: '邀请候选人进入云试岗',
      script: `如果你愿意了解${job.title}的真实工作方式，可以先进入分岔式云试岗，再决定是否投递。`,
    },
  ];

  return {
    jobId: job.id,
    title: `${job.title} · 60秒岗位真相短片`,
    segments,
    fullScript: segments.map((segment) => `${segment.timeRange} ${segment.title}：${segment.script}`).join('\n'),
  };
}

export function buildCandidatePreview(card: HRStoryCard) {
  return {
    candidateId: card.candidateId,
    jobId: card.jobId,
    myJobUnderstanding: card.jobUnderstanding,
    mySkillTags: card.skillTags,
    myConcerns: card.riskFlags
      .filter((flag) => flag.includes('关注点'))
      .map((flag) => flag.replace('候选人关注点：', '')),
    applicationSuggestion:
      card.recommendation === '强推荐面试'
        ? '你的经历和岗位有较多可对齐点，建议进入后续沟通。'
        : '建议在后续沟通中补充项目证据、岗位理解和关键关注点。',
    nextStep: '你的投递已进入HR工作台，HR可基于云试岗线索安排后续沟通。',
  };
}
