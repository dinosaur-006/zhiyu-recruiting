import type {
  AvatarConfig,
  Candidate,
  Conversation,
  ConversationMessage,
  HRStoryCard,
  Job,
  JobAnalysis,
  JobInput,
  Recommendation,
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
    candidateMessages.length >= 3 ? '愿意完成多轮岗位预体验对话' : '',
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
    nextStep: '你的投递已进入HR工作台，HR可基于故事卡安排后续沟通。',
  };
}
