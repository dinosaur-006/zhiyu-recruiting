import {
  calculateRecruitingTrustHealth,
  buildDefaultAvatarConfig,
  createDefaultRealityRoles,
  answerReverseQuestion,
  generateJobTruthLabel,
  generateJobTruthContract,
  generateRealityReport,
  generateRealityScripts,
  generateTruthVideoScript,
  getBranchScenarios,
  parseJobDescription,
  generateHRStoryCard,
} from './ai';
import type { Company, DemoState, Job, JobInput, TrialSession, Candidate, CandidateStatus, Conversation, ConversationMessage, HRStoryCard, RealityReport, TrustAuditEvent, TrustRepairTask } from '../types';

export const demoCompany: Company = {
  id: 'company-zhiyu-demo',
  name: '星河云智科技',
  industry: '企业服务 / AI招聘',
  size: '100-300人',
  location: '北京',
  description: '一家服务B端客户的成长型科技公司，重视清晰沟通、真实岗位信息和高质量人才匹配。',
};

// ═══════════════════════════════════════════════════════════════
// P0: 前端架构师
// ═══════════════════════════════════════════════════════════════

const jobP0: JobInput = {
  title: '前端架构师',
  department: '研发部',
  location: '北京 海淀',
  salaryMin: 35,
  salaryMax: 55,
  education: '本科及以上',
  experience: '5年以上',
  responsibilities: '主导B端SaaS产品的前端架构设计，制定组件化规范和工程化标准，推动微前端落地，负责性能优化体系建设，指导中高级前端工程师成长，参与技术选型和架构评审。',
  requirements: '精通React/Vue生态及TypeScript，有大型B端系统架构经验，熟悉微前端、工程化、性能优化，有组件库或脚手架从0到1搭建经验，重视代码规范和单元测试覆盖率。',
  teamInfo: '团队12人，包括2名架构师、6名高级前端、4名中级前端。崇尚技术卓越，每周有技术分享和Code Review文化，代码合并必须通过CI和至少1名架构师CR。',
  growthPath: '可从架构师成长为前端技术负责人或技术总监，管理前端技术战略和团队建设。',
  interviewProcess: 'HR初筛 → 技术一面(编码) → 架构二面(系统设计) → CTO终面 → Offer',
  workload: '关键版本节点有集中冲刺，日常节奏以技术方案和Code Review为主，项目排期透明。',
  challenges: '面临老旧模块重构、微前端迁移、大仓性能瓶颈等技术难题，需要平衡业务交付与技术债务清理，推动跨团队技术共识。',
};

const jobP0Analysis = {
  ...parseJobDescription(jobP0),
  hardSkills: ['微前端架构 (Qiankun/Module Federation)', '性能极限调优', '工程化基建 (Vite/Webpack)', 'React/Vue 底层原理'],
  softSkills: ['技术布道能力', '抗压与抗干扰', '极致的细节控'],
  sellingPoints: ['千万级日活产品挑战', '绝对的技术话语权', '只看代码不看PPT'],
  riskPoints: ['历史技术债严重', '跨部门推行规范阻力大', '发版期极度高压'],
};

const jobP0Data: Job = {
  ...jobP0,
  id: 'job-fe-architect-001',
  companyId: demoCompany.id,
  status: 'published',
  createdAt: '2026-06-10T08:00:00.000Z',
  analysis: jobP0Analysis,
  situationalParams: {
    paceThreshold: 75,
    collaborationDensity: 60,
    codeHygiene: 90,
    ambiguityTolerance: 20,
    autonomyLevel: 70,
    derivedAtmosphere: '极度严谨的技术团队，Code Review 不容妥协，任何技术决策必须有清晰论据支撑。',
  },
};

// ═══════════════════════════════════════════════════════════════
// P1: 华东区大客户销售
// ═══════════════════════════════════════════════════════════════

const jobP1: JobInput = {
  title: '华东区大客户销售经理',
  department: '销售部',
  location: '上海',
  salaryMin: 25,
  salaryMax: 60,
  education: '本科及以上',
  experience: '3年以上',
  responsibilities: '负责华东区金融和制造行业大客户的开拓与维护，完成年度营收目标，协调售前和技术支持团队推进POC和签约，维护关键客户关系，参与行业解决方案的共创和迭代。',
  requirements: '有B端大客户销售经验，熟悉金融或制造行业，能独立完成百万级以上合同谈判，结果导向，抗压能力强，对技术产品有基本理解力。',
  teamInfo: '华东团队8人，狼性文化，季度末冲刺是常态。团队内部竞争激烈但有互助机制，每月有战报复盘和TOP Sales经验分享。',
  growthPath: '可从区域经理晋升为行业总监或全国销售VP，优秀者可获得公司期权激励。',
  interviewProcess: 'HR初筛 → 销售总监一面 → 模拟客户谈判二面 → VP终面 → Offer',
  workload: '季度业绩导向，末月冲刺阶段工作强度极高，日常以客户拜访和方案推进为主，出差频率约40%。',
  challenges: '市场竞争激烈，友商低价抢单频繁。客户决策链长，需要搞定多个利益方。季度数字压力大，一旦Pipeline断层就需要快速补量。',
};

const jobP1Analysis = {
  ...parseJobDescription(jobP1),
  hardSkills: ['B2B 复杂链路销售', '大客户破冰', '招投标控场', '千万级 ARR 管理'],
  softSkills: ['极强的钝感力与逆商', '利益链拆解与人性洞察', '逼单魄力'],
  sellingPoints: ['提成上不封顶', '极高的自由度', '直接与大厂 CXO 对话'],
  riskPoints: ['指标压力足以让人崩溃', '内部支持可能跟不上前线速度', '客户随时可能飞单'],
};

const jobP1Data: Job = {
  ...jobP1,
  id: 'job-sales-east-001',
  companyId: demoCompany.id,
  status: 'published',
  createdAt: '2026-06-10T08:01:00.000Z',
  analysis: jobP1Analysis,
  situationalParams: {
    paceThreshold: 95,
    collaborationDensity: 70,
    codeHygiene: 20,
    ambiguityTolerance: 85,
    autonomyLevel: 90,
    derivedAtmosphere: '狼性铁军，季度末的销售战报就是一切。扛得住数字压力，拿得下大单。',
  },
};

// ═══════════════════════════════════════════════════════════════
// P2: 资深体验设计师
// ═══════════════════════════════════════════════════════════════

const jobP2: JobInput = {
  title: '资深体验设计师',
  department: '设计部',
  location: '北京 朝阳',
  salaryMin: 28,
  salaryMax: 45,
  education: '本科及以上',
  experience: '3-5年',
  responsibilities: '负责B端SaaS产品的交互和视觉设计，主导设计系统建设与维护，进行用户研究和可用性测试，输出高保真原型和设计规范，与产品和前端紧密协作推动设计落地。',
  requirements: '精通Figma和设计系统搭建，有B端复杂后台设计经验，熟悉用户研究方法论，重视设计工程化（Design Token、组件化设计），对视觉细节有强迫症级别的追求。',
  teamInfo: '设计团队6人，氛围开放包容，推崇设计Critique文化。每周有设计评审，鼓励跨项目互相给出建设性反馈。与产品和前端坐在同一开放办公区，沟通无壁垒。',
  growthPath: '可从资深设计师成长为设计专家或设计主管，主导公司级设计语言和品牌体验。',
  interviewProcess: 'HR初筛 → 作品集评审 → 设计总监一面 → 跨部门协作二面 → Offer',
  workload: '双周迭代节奏，评审前有集中冲刺，整体节奏平稳。设计系统维护需要持续投入，但不属于紧急需求。',
  challenges: 'B端产品的功能复杂度高，需要在功能完整性和体验简洁性之间找到平衡。推动设计系统落地需要跨部门共识，有时会遇到产品和技术对设计价值的质疑。',
};

const jobP2Analysis = {
  ...parseJobDescription(jobP2),
  hardSkills: ['交互动效设计', 'Design System 构建', '用户心智建模', 'Figma/Principle 精通'],
  softSkills: ['跨学科同理心', '多方共识推进', '对美的偏执'],
  sellingPoints: ['真正决定产品最终形态', '极具包容度的创新文化', '定义下一代交互范式'],
  riskPoints: ['沟通与说服成本极高', '极易陷入细节牛角尖', '业务需求往往抽象且矛盾'],
};

const jobP2Data: Job = {
  ...jobP2,
  id: 'job-ux-designer-001',
  companyId: demoCompany.id,
  status: 'published',
  createdAt: '2026-06-10T08:02:00.000Z',
  analysis: jobP2Analysis,
  situationalParams: {
    paceThreshold: 40,
    collaborationDensity: 90,
    codeHygiene: 70,
    ambiguityTolerance: 70,
    autonomyLevel: 60,
    derivedAtmosphere: '开放包容的创意团队，设计批评是日常，视觉细节不容妥协，节奏张弛有度。',
  },
};

// ═══════════════════════════════════════════════════════════════
// P3: 前端开发工程师
// ═══════════════════════════════════════════════════════════════

const jobP3: JobInput = {
  title: '前端开发工程师',
  department: '研发部',
  location: '北京 海淀',
  salaryMin: 20,
  salaryMax: 35,
  education: '本科及以上',
  experience: '1-3年',
  responsibilities: '负责B端SaaS产品的前端功能开发，参与组件库建设和维护，与产品和后端协作完成需求迭代，编写单元测试和组件文档，参与Code Review。',
  requirements: '熟悉React或Vue生态，有TypeScript项目经验，了解前端工程化，对代码质量有追求，有B端项目经验优先。',
  teamInfo: '前端团队12人，有完善的Onboarding流程和导师制度。每周有技术分享，新人前3个月有专人带教。团队氛围轻松但专业，鼓励提问和讨论。',
  growthPath: '可从初级成长为高级前端工程师或前端架构师，团队有明确的职级体系和晋升通道。',
  interviewProcess: 'HR初筛 → 技术一面(编码) → 技术二面(系统设计) → Offer',
  workload: '双周Sprint节奏，日常有明确的Story排期。偶尔有发布日需要加班，整体Work-Life Balance良好。',
  challenges: '需要快速学习复杂的B端业务逻辑，在保证交付质量的同时持续提升技术深度。',
};

const jobP3Analysis = {
  ...parseJobDescription(jobP3),
  hardSkills: ['React/Vue', 'TypeScript', '组件化开发', '前端工程化'],
  softSkills: ['快速学习能力', '团队协作', '自驱成长'],
  sellingPoints: ['完善的导师制度', '明确的晋升通道', '技术氛围浓厚', '薪资范围透明'],
  riskPoints: ['B端业务学习曲线陡峭', '初期需要大量Onboarding时间'],
};

const jobP3Data: Job = {
  ...jobP3,
  id: 'job-fe-dev-001',
  companyId: demoCompany.id,
  status: 'published',
  createdAt: '2026-06-12T08:00:00.000Z',
  analysis: jobP3Analysis,
  situationalParams: {
    paceThreshold: 45,
    collaborationDensity: 70,
    codeHygiene: 75,
    ambiguityTolerance: 40,
    autonomyLevel: 50,
    derivedAtmosphere: '成长型技术团队，重视学习和分享，新人成长路径清晰，技术氛围浓厚但不内卷。',
  },
};

// ═══════════════════════════════════════════════════════════════
// P4: 后端开发工程师 (Go)
// ═══════════════════════════════════════════════════════════════

const jobP4: JobInput = {
  title: '后端开发工程师 (Go)',
  department: '研发部',
  location: '深圳 南山',
  salaryMin: 25,
  salaryMax: 45,
  education: '本科及以上',
  experience: '3-5年',
  responsibilities: '负责核心业务系统的后端架构设计和开发，参与微服务治理和API网关建设，优化数据库性能和查询效率，编写高质量的技术文档和设计方案。',
  requirements: '精通Go语言，熟悉微服务架构和分布式系统设计，有MySQL/Redis优化经验，了解Kubernetes和Docker，有高并发系统设计经验优先。',
  teamInfo: '后端团队15人，分为3个业务小组。技术栈以Go为主，基础设施完善。有专门的SRE团队支持，开发可以专注业务逻辑。',
  growthPath: '可从高级工程师成长为技术专家或Tech Lead，负责独立业务线的技术架构。',
  interviewProcess: 'HR初筛 → 技术一面(编码+系统设计) → 技术二面(架构) → Offer',
  workload: 'Sprint节奏稳定，On-Call轮值（平均2周一次），值班期间P0故障需要在30分钟内响应。',
  challenges: '业务复杂度高，需要同时兼顾性能、可扩展性和开发效率。分布式系统的问题排查需要扎实的基础功底。',
};

const jobP4Analysis = {
  ...parseJobDescription(jobP4),
  hardSkills: ['Go语言', '微服务架构', 'MySQL/Redis优化', '分布式系统'],
  softSkills: ['系统性思维', '故障排查能力', '技术写作'],
  sellingPoints: ['技术栈先进', '基础设施完善', 'On-Call有额外补贴', '深圳南山科技园'],
  riskPoints: ['On-Call值班压力', '高并发场景排查复杂'],
};

const jobP4Data: Job = {
  ...jobP4,
  id: 'job-go-backend-001',
  companyId: demoCompany.id,
  status: 'published',
  createdAt: '2026-06-13T08:00:00.000Z',
  analysis: jobP4Analysis,
  situationalParams: {
    paceThreshold: 55,
    collaborationDensity: 60,
    codeHygiene: 85,
    ambiguityTolerance: 30,
    autonomyLevel: 65,
    derivedAtmosphere: '技术驱动的工程团队，重视Code Review和系统设计评审，问题排查追求根因分析而非临时修复。',
  },
};

// ═══════════════════════════════════════════════════════════════
// P5: AI/数据产品经理
// ═══════════════════════════════════════════════════════════════

const jobP5: JobInput = {
  title: 'AI产品经理',
  department: '产品部',
  location: '北京 海淀',
  salaryMin: 30,
  salaryMax: 50,
  education: '本科及以上',
  experience: '3-5年',
  responsibilities: '负责公司AI产品的规划和迭代，深入理解用户需求并转化为产品方案，协调算法、工程和设计团队推进产品落地，跟踪行业AI趋势并推动产品创新。',
  requirements: '有AI/ML相关产品经验，理解大模型能力边界和应用场景，数据驱动决策能力强，有B端SaaS产品经验优先，不需要会写代码但需要能和技术团队深度对话。',
  teamInfo: '产品团队8人，与算法和工程团队紧密协作。团队文化偏向数据驱动和快速验证，鼓励产品经理深入理解技术原理。',
  growthPath: '可从产品经理成长为产品总监或AI产品线负责人。',
  interviewProcess: 'HR初筛 → 产品总监一面 → 案例分析二面 → CTO终面 → Offer',
  workload: '项目驱动，关键里程碑前有集中冲刺，日常节奏以需求评审、数据分析、用户调研为主。',
  challenges: 'AI行业变化极快，需要持续学习和判断哪些技术趋势是真实需求而非炒作。在产品体验和技术可行性之间找到平衡。',
};

const jobP5Analysis = {
  ...parseJobDescription(jobP5),
  hardSkills: ['需求分析', '数据分析', 'PRD撰写', '大模型应用'],
  softSkills: ['跨部门沟通', '技术理解力', '用户洞察', '商业思维'],
  sellingPoints: ['前AI沿领域', '直接对话CTO', '产品决策权大', '弹性工作制'],
  riskPoints: ['AI行业高度不确定', '技术验证周期长', '用户教育成本高'],
};

const jobP5Data: Job = {
  ...jobP5,
  id: 'job-ai-pm-001',
  companyId: demoCompany.id,
  status: 'published',
  createdAt: '2026-06-14T08:00:00.000Z',
  analysis: jobP5Analysis,
  situationalParams: {
    paceThreshold: 60,
    collaborationDensity: 85,
    codeHygiene: 50,
    ambiguityTolerance: 80,
    autonomyLevel: 75,
    derivedAtmosphere: '跨学科协作的产品创新团队，重视数据和用户洞察，快速试错和迭代，容错文化强。',
  },
};

// ═══════════════════════════════════════════════════════════════
// P6: 全栈开发工程师
// ═══════════════════════════════════════════════════════════════

const jobP6: JobInput = {
  title: '全栈开发工程师',
  department: '研发部',
  location: '杭州 余杭',
  salaryMin: 25,
  salaryMax: 42,
  education: '本科及以上',
  experience: '3-5年',
  responsibilities: '负责核心业务模块的前后端全链路开发，从数据库设计到UI交互全流程参与，主导中台服务的API设计和性能优化，参与微服务拆分和技术方案评审，与产品和设计团队协作完成需求迭代，维护和改进CI/CD流水线。',
  requirements: '精通React/Vue和Node.js/Go至少各一种，熟悉关系型和非关系型数据库设计与优化，有RESTful API和GraphQL设计经验，了解Docker和Kubernetes基础，具备系统设计能力和技术方案写作能力，对代码质量有追求。',
  teamInfo: '全栈团队10人，推崇T型人才发展（一专多能）。团队文化务实，重视代码可维护性和文档质量。每周有全栈技术分享，前端和后端交叉进行Code Review。新人入职有全链路Onboarding计划，覆盖从前端到部署的全部环节。',
  growthPath: '可从全栈工程师成长为全栈架构师或Tech Lead，负责独立业务线的端到端技术架构。也可选择向纯前端或纯后端深度发展，团队支持任何方向的技术成长。',
  interviewProcess: 'HR初筛 → 技术一面(编码+系统设计) → 技术二面(架构+行为面试) → Offer',
  workload: '双周Sprint节奏，每6周一次大版本发布。On-Call轮值（每月约1周），值班期间P1及以上故障需在15分钟内响应。日常加班较少，但大版本上线周有集中冲刺。',
  challenges: '需要在前后端多个技术栈之间快速切换上下文，保持对全链路的理解深度是持续的挑战。业务增长快，技术债务和新需求之间需要主动权衡和沟通。偶尔会遇到只懂前端或只懂后端的同事之间的协作摩擦，需要你充当技术翻译的角色。',
};

const jobP6Analysis = {
  ...parseJobDescription(jobP6),
  hardSkills: ['React/TypeScript 全栈', 'Node.js/Go 服务端', 'RESTful & GraphQL API设计', '数据库建模与调优', 'Docker/K8s 容器化'],
  softSkills: ['全链路系统思维', '多技术栈上下文切换', '技术翻译与沟通', '主动推动与Owner意识'],
  sellingPoints: ['端到端全链路技术视野', 'T型人才成长路径（一专多能）', '杭州余杭（生活成本低于北上深）', '每月On-Call仅1周且有额外补贴'],
  riskPoints: ['多技术栈切换有认知负荷', '全栈容易陷入广而不精', '大版本上线周冲刺强度高'],
};

const jobP6Data: Job = {
  ...jobP6,
  id: 'job-fullstack-001',
  companyId: demoCompany.id,
  status: 'published',
  createdAt: '2026-06-14T09:00:00.000Z',
  analysis: jobP6Analysis,
  situationalParams: {
    paceThreshold: 55,
    collaborationDensity: 75,
    codeHygiene: 80,
    ambiguityTolerance: 50,
    autonomyLevel: 70,
    derivedAtmosphere: '全栈工程文化，推崇端到端思维。代码质量和全链路可维护性是团队的共同语言，每个人都需要理解自己写的代码在生产环境如何运行。',
  },
};

// ═══════════════════════════════════════════════════════════════
// Helper: build full job ecosystem
// ═══════════════════════════════════════════════════════════════

function buildJobEcosystem(job: Job) {
  const avatar = buildDefaultAvatarConfig(job);
  const realityRoles = createDefaultRealityRoles(job.id);
  const realityScenes = generateRealityScripts(job);
  const jobTruthLabel = generateJobTruthLabel(job);
  const jobTruthContract = generateJobTruthContract(job, jobTruthLabel);
  const branchScenarios = getBranchScenarios(job);
  const truthVideoScript = generateTruthVideoScript(job, realityRoles, realityScenes);
  return { avatar, realityRoles, realityScenes, jobTruthLabel, jobTruthContract, branchScenarios, truthVideoScript };
}

function buildTrialAndReport(job: Job, ecosystem: ReturnType<typeof buildJobEcosystem>) {
  const { realityScenes, jobTruthLabel, branchScenarios } = ecosystem;
  const branchChoices = branchScenarios.map((sc) => sc.choices[1]);

  const trialSession: TrialSession = {
    id: `trial-${job.id}`,
    jobId: job.id,
    candidateId: `candidate-${job.id}`,
    currentSceneId: realityScenes[2].id,
    completedSceneIds: realityScenes.map((s) => s.id),
    askedTopics: ['岗位职责', '团队氛围', '成长空间', '工作节奏'],
    selectedChoiceIds: branchScenarios[0].choices.map((c) => c.id),
    branchChoiceIds: branchChoices.map((c) => c.id),
    viewedTruthPoints: ['工作节奏', '协作密度', '成长速度'],
    focusedTruthPoints: ['工作节奏'],
    reverseQuestions: [answerReverseQuestion(job, jobTruthLabel, '成长空间')],
    truthContractAcknowledgement: {
      acknowledged: true,
      acknowledgedItems: ['工作节奏说明', '成长路径说明', 'AI辅助边界'],
      unresolvedConcerns: ['薪资沟通节点'],
      acknowledgedAt: new Date().toISOString(),
    },
    mutualConfirmation: {
      candidateConfirmedItems: ['我已了解岗位节奏', '我已了解面试流程', '我仍愿意继续面试'],
      unresolvedReasons: [],
      hrCommitments: ['本轮面试会重点沟通候选人关心的问题', '不会仅凭AI报告做最终决定'],
    },
    trialEvents: [
      { id: `ev-${job.id}-1`, type: 'truth_label_viewed', label: '进入岗位真相舱', occurredAt: new Date().toISOString() },
      { id: `ev-${job.id}-2`, type: 'scene_completed', label: '完成第一幕', occurredAt: new Date().toISOString() },
      { id: `ev-${job.id}-3`, type: 'scene_completed', label: '完成第二幕', occurredAt: new Date().toISOString() },
      { id: `ev-${job.id}-4`, type: 'branch_choice_selected', label: '完成分岔任务', occurredAt: new Date().toISOString() },
    ],
    directApply: false,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    completionRate: 100,
  };

  const report = generateRealityReport(
    {
      id: `candidate-${job.id}`, jobId: job.id, conversationId: `conv-${job.id}`,
      name: '匿名候选人', phone: '', email: '',
      sourceChannel: '岗位实境舱链接', skills: '',
      projectExperience: '', motivation: '', concerns: '',
      rhythmAcceptance: '', followUpQuestion: '', scenarioReflection: '',
      status: '已投递', submittedAt: new Date().toISOString(),
    },
    job, trialSession,
    [] as any[],
    branchChoices,
    jobTruthLabel,
  );

  return { trialSession, report, branchChoices };
}

// ═══════════════════════════════════════════════════════════════
// Seed Candidates — 预置已经历完整面试流程的真实候选人
// ═══════════════════════════════════════════════════════════════

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function buildSeedCandidates(
  jobs: Job[],
  ecosystems: ReturnType<typeof buildJobEcosystem>[],
  existingReports: ReturnType<typeof buildTrialAndReport>['report'][],
) {
  const ecoByJobId = new Map(ecosystems.map((e) => [e.jobTruthLabel.jobId, e]));
  const now = new Date();
  function daysAgo(d: number) { const t = new Date(now); t.setDate(t.getDate() - d); return t.toISOString(); }

  const seedProfiles: Array<{
    name: string; phone: string; email: string; jobIdx: number;
    status: CandidateStatus; daysAgoSubmitted: number;
    skills: string; motivation: string; concerns: string;
    projectExperience: string; rhythmAcceptance: string;
    followUpQuestion: string; scenarioReflection: string;
    sourceChannel: string;
  }> = [
    { name: '陈思远', phone: '139****2831', email: 'chensy@outlook.com', jobIdx: 0, status: '已邀约', daysAgoSubmitted: 2,
      skills: 'React, TypeScript, Vue3, Webpack, Vite, 微前端, 性能优化, Node.js',
      motivation: '希望加入一个技术驱动的团队，参与大规模系统的架构设计和技术决策。对B端SaaS领域有浓厚兴趣，认为这个方向能最大化我的技术积累。',
      concerns: '希望能明确了解团队目前的代码质量现状和技术债务规模，以及公司在技术投入上的长期规划。',
      projectExperience: '5年前端开发经验，主导过2个大型B端管理系统的前端架构重构（日活10万+），从jQuery单体迁移到React+TypeScript微前端架构。',
      rhythmAcceptance: '能接受正常的Sprint节奏和偶尔的发布日加班。如果加班有明确的原因和补偿机制，我是认可的。',
      followUpQuestion: '团队目前的技术栈迭代频率是怎样的？是否有定期的技术分享和对外交流机会？',
      scenarioReflection: '模拟中的线上故障排查场景很真实。我在处理优先级时确实需要在客户压力和问题根因分析之间做快速判断。',
      sourceChannel: 'BOSS直聘' },
    { name: '王晓芳', phone: '186****7452', email: 'wangxf@163.com', jobIdx: 0, status: '已入库', daysAgoSubmitted: 14,
      skills: 'React, Angular, TypeScript, CSS-in-JS, 组件库设计, 前端监控',
      motivation: '希望能在一个架构师能力强的团队中快速成长，目前的技术瓶颈在于缺少大规模系统的实战经验。',
      concerns: '岗位JD上写的5年以上经验要求是否可以放宽？我有4.5年经验但成长速度很快。',
      projectExperience: '4.5年前端开发，最近2年在中型互联网公司负责组件库建设和前端监控体系搭建，带过2人小团队。',
      rhythmAcceptance: '完全接受Sprint节奏。之前经历过比996更紧张的创业期。',
      followUpQuestion: '如果入职，我的第一个季度会负责哪些具体任务？',
      scenarioReflection: '模拟体验让我意识到自己在高压下的沟通还可以更简洁直接。',
      sourceChannel: '拉勾网' },
    { name: '李明远', phone: '185****9034', email: 'limy.work@gmail.com', jobIdx: 1, status: '已投递', daysAgoSubmitted: 1,
      skills: 'B2B销售, 大客户管理, CRM(Salesforce), 合同谈判, 金融行业',
      motivation: '在金融SaaS销售领域深耕6年，手上有稳定的银行和保险行业客户关系。希望加入一个有竞争力的产品团队，把客户资源转化为实际业绩。',
      concerns: '提成比例和季度指标的具体设定方式，以及老客户续约和新客户开拓的权重分配。',
      projectExperience: '6年B2B销售经验，近3年在金融SaaS领域，个人年度最高签约额1200万，维护过40+KA客户关系。',
      rhythmAcceptance: '销售岗位节奏完全接受。季度末冲指标是常态，习惯了高压环境。',
      followUpQuestion: '华东区目前最核心的3个目标客户行业是什么？Pipeline的平均转化周期多久？',
      scenarioReflection: '季度末Pipeline压力的模拟非常真实。在实际工作中确实需要在高价值客户和常规客户之间做快速优先级判断。',
      sourceChannel: '猎头推荐' },
    { name: '张雨婷', phone: '177****5612', email: 'zhangyt@foxmail.com', jobIdx: 1, status: '已邀约', daysAgoSubmitted: 5,
      skills: 'B2B销售, 客户关系管理, 招投标, 商务谈判, 制造业',
      motivation: '在制造业B2B销售3年后希望转移到更高速增长的科技行业。自驱力强，学习速度快。',
      concerns: '对科技产品销售周期和决策链的理解还在学习中，希望公司有完善的培训机制。',
      projectExperience: '3年制造业B2B销售，负责华东区中型客户，累计完成签约额超2000万。',
      rhythmAcceptance: '接受高强度的销售节奏和频繁出差（40-50%）。',
      followUpQuestion: '新人前3个月的培训和上手流程是怎样的？',
      scenarioReflection: '模拟中的跨团队协作场景让我意识到在科技公司做销售需要更强的产品理解力。',
      sourceChannel: '内推' },
    { name: '王子涵', phone: '156****3380', email: 'wangzh.design@gmail.com', jobIdx: 2, status: '已投递', daysAgoSubmitted: 0,
      skills: 'Figma, Design System, 用户研究, 交互设计, Protopie, 可用性测试',
      motivation: '希望加入一个重视设计的团队，有Design Critique文化和设计系统建设意识。曾在设计咨询公司工作，服务过多个行业客户，渴望在甲方深耕一个产品。',
      concerns: '设计师是否有参与产品决策的空间？设计系统的推进在公司内是否会遇到技术团队的阻力？',
      projectExperience: '4年体验设计经验，最近2年在设计咨询公司主导过金融、医疗、教育3个行业的设计系统搭建项目。',
      rhythmAcceptance: '设计节奏理解。评审前有冲刺，整体WLB良好。',
      followUpQuestion: '设计团队目前的Design Review频率和参与方式是什么？',
      scenarioReflection: '模糊Brief的模拟让我想起了在咨询公司的日常。在多方利益中推动设计共识确实是核心能力。',
      sourceChannel: '站酷' },
    { name: '刘浩然', phone: '133****7782', email: 'liuhr.dev@126.com', jobIdx: 3, status: '已入库', daysAgoSubmitted: 10,
      skills: 'React, Vue, TypeScript, Node.js基础, Git, CI/CD',
      motivation: '2年前端经验，希望跳到一个技术氛围更好的团队。目前在小公司做全栈但不够深入，希望在前端方向深耕。',
      concerns: '岗位是否接受2年经验的候选人？B端业务的学习曲线需要多长？',
      projectExperience: '2年前端开发，做过电商和内容管理两个B端项目的前端开发。自学能力强，GitHub年度提交600+。',
      rhythmAcceptance: '接受Sprint节奏和适量的加班。',
      followUpQuestion: '团队的Onboarding流程和导师制度是怎样的？',
      scenarioReflection: '作为初级开发者，模拟中的新人求助场景感同身受。好的导师制度对成长速度影响很大。',
      sourceChannel: 'BOSS直聘' },
    { name: '赵凯文', phone: '189****4456', email: 'zhaokaiwen@gmail.com', jobIdx: 4, status: '已邀约', daysAgoSubmitted: 3,
      skills: 'Go, Rust, 微服务, Kubernetes, MySQL, Redis, 分布式系统, gRPC',
      motivation: '在字节跳动做了4年基础设施后端，参与了大规模分布式系统建设。希望能在一个技术栈类似的成长型公司担任更重要的角色。',
      concerns: '和大厂相比，公司在技术基础设施上的投入规模如何？On-Call的频率是否合理？',
      projectExperience: '4年字节跳动后端开发经验，参与过日均10亿请求的广告投放系统架构设计和优化。Go和Rust双语言栈。',
      rhythmAcceptance: '接受On-Call轮值和合理的加班。字节的文化已经锻炼出来了。',
      followUpQuestion: '深圳团队目前的技术栈标准化程度如何？Code Review和系统设计评审的流程是什么？',
      scenarioReflection: '模拟中的线上故障排查流程和我在字节的经历非常相似。快速定位和跨团队沟通确实是后端工程师的核心能力。',
      sourceChannel: '脉脉' },
    { name: '林小雨', phone: '152****9903', email: 'linxiaoyu@pku.edu.cn', jobIdx: 4, status: '已投递', daysAgoSubmitted: 1,
      skills: 'Go, Python, 数据库, Docker, Linux, 数据结构与算法',
      motivation: '计算机硕士应届毕业，对分布式系统和数据库技术有浓厚兴趣。毕设做的是分布式KV存储的性能优化。',
      concerns: '作为应届生，公司是否有完善的培养计划？前6个月的期望是什么？',
      projectExperience: '硕士期间参与过2个开源项目（Go语言），在阿里云实习过6个月的后端开发。',
      rhythmAcceptance: '完全接受。应届生阶段希望快速成长，愿意投入更多时间学习。',
      followUpQuestion: '针对应届生，团队的期望值和技术成长路径是怎样的？',
      scenarioReflection: '模拟体验让我看到了实际工作场景的复杂性和多任务处理的挑战。',
      sourceChannel: '校园招聘' },
    { name: '黄思敏', phone: '137****6641', email: 'huangsm.prod@gmail.com', jobIdx: 5, status: '已邀约', daysAgoSubmitted: 4,
      skills: '产品规划, 需求分析, 数据分析(SQL/Python), 用户研究, PRD, 大模型应用, Agile/Scrum',
      motivation: '在腾讯做了5年产品经理，经历过从0到1和从1到100的产品阶段。对AI/大模型产品的商业化落地有强烈的探索欲，希望从大厂的成熟体系跳到一个更灵活的团队。',
      concerns: '作为AI产品经理，团队的算法能力边界在哪里？产品和算法的协作模式是怎样的？',
      projectExperience: '5年腾讯产品经验，最近2年负责一款DAU 500万的效率工具产品的规划和迭代，带领3人产品小组。',
      rhythmAcceptance: '接受项目驱动的弹性节奏。经历过多次从立项到上线的完整周期。',
      followUpQuestion: '公司目前在AI产品方向的战略定位和资源投入是怎样的？',
      scenarioReflection: '模拟中需要在技术可行性和用户体验之间做平衡的场景，和我日常的产品决策非常相似。',
      sourceChannel: '猎头推荐' },
    { name: '杨帆', phone: '181****2273', email: 'yangfan.tech@163.com', jobIdx: 6, status: '已入库', daysAgoSubmitted: 8,
      skills: 'React, Node.js, TypeScript, PostgreSQL, Docker, AWS, Next.js, GraphQL',
      motivation: '全栈开发5年，从初创公司一路做到技术合伙人。现在希望加入一个更大的团队，和更多优秀的人一起工作。不需要管理岗位，只想专注技术。',
      concerns: '全栈岗位在团队中的定位是否清晰？会不会变成救火队员什么都要做？',
      projectExperience: '5年全栈经验，独立开发和维护过一个日活2万的SaaS产品（从前端到部署），技术栈覆盖React/Node.js/PostgreSQL/AWS。',
      rhythmAcceptance: '接受Sprint节奏和On-Call。做技术合伙人时7x24小时待命过2年。',
      followUpQuestion: '全栈团队目前的前后端职责划分是怎样的？全栈工程师如何在深度和广度之间做平衡？',
      scenarioReflection: '模拟中的跨端协作场景很真实。全栈工程师确实需要在不同技术栈之间快速切换，这对认知负荷管理要求很高。',
      sourceChannel: 'GitHub' },
  ];

  const candidates: Candidate[] = [];
  const conversations: Conversation[] = [];
  const trialSessions: TrialSession[] = [];
  const realityReports: RealityReport[] = [];
  const storyCards: HRStoryCard[] = [];
  const trustAuditEvents: TrustAuditEvent[] = [];
  const trustRepairTasks: TrustRepairTask[] = [];
  const latestActivity: Array<{ candidateId: string; candidateName: string; jobTitle: string; action: string; occurredAt: string }> = [];

  let cid = 0;
  for (const p of seedProfiles) {
    cid++;
    const job = jobs[p.jobIdx];
    const eco = ecoByJobId.get(job.id)!;
    const candidateId = `seed-candidate-${String(cid).padStart(3, '0')}`;
    const conversationId = `seed-conv-${String(cid).padStart(3, '0')}`;
    const sessionId = `seed-trial-${String(cid).padStart(3, '0')}`;

    // Conversation
    const msgTexts = [
      p.sourceChannel === '直接投递' ? '我选择直接投递，后续愿意和HR进一步沟通。' : `我对${job.title}岗位很感兴趣，希望了解更多详情。`,
    ];
    const msgs: ConversationMessage[] = msgTexts.map((t, mi) => ({
      id: `seed-msg-${cid}-${mi}`, role: 'candidate' as const, text: t,
      intent: '岗位咨询', createdAt: daysAgo(p.daysAgoSubmitted + (p.status === '已邀约' ? 1 : p.status === '已入库' ? 5 : 0)),
    }));

    conversations.push({ id: conversationId, candidateId, jobId: job.id, messages: msgs, startedAt: msgs[0].createdAt, endedAt: daysAgo(p.daysAgoSubmitted), durationSeconds: 180 + Math.floor(Math.random() * 300), status: 'completed' });

    // Candidate
    candidates.push({ id: candidateId, jobId: job.id, conversationId, status: p.status, submittedAt: daysAgo(p.daysAgoSubmitted), name: p.name, phone: p.phone, email: p.email, sourceChannel: p.sourceChannel, skills: p.skills, projectExperience: p.projectExperience, motivation: p.motivation, concerns: p.concerns, rhythmAcceptance: p.rhythmAcceptance, followUpQuestion: p.followUpQuestion, scenarioReflection: p.scenarioReflection });

    // Trial Session
    const scenes = eco.realityScenes;
    const branches = eco.branchScenarios;
    const label = eco.jobTruthLabel;
    const branchChoices = branches.length > 0 ? [branches[0].choices[1]] : [];
    const session: TrialSession = {
      id: sessionId, jobId: job.id, candidateId,
      currentSceneId: scenes[scenes.length - 1]?.id ?? '',
      completedSceneIds: scenes.map((s) => s.id),
      askedTopics: ['岗位职责', '团队氛围', '成长空间', '工作节奏'],
      selectedChoiceIds: branchChoices.map((c) => c.id),
      branchChoiceIds: branchChoices.map((c) => c.id),
      viewedTruthPoints: ['工作节奏', '协作密度', '成长速度'],
      focusedTruthPoints: ['工作节奏'],
      reverseQuestions: [answerReverseQuestion(job, label, pick(['成长空间', '工作节奏', '薪资福利', '团队氛围'] as const))],
      truthContractAcknowledgement: { acknowledged: true, acknowledgedItems: ['工作节奏说明', '成长路径说明', 'AI辅助边界'], unresolvedConcerns: [p.concerns.slice(0, 8)], acknowledgedAt: daysAgo(p.daysAgoSubmitted) },
      mutualConfirmation: { candidateConfirmedItems: ['我已了解岗位节奏', '我已了解面试流程', '我仍愿意继续面试'], unresolvedReasons: [], hrCommitments: ['本轮面试会重点沟通候选人关心的问题'], confirmedAt: daysAgo(p.daysAgoSubmitted) },
      trialEvents: [
        { id: `seed-ev-${cid}-1`, type: 'truth_label_viewed', label: '进入岗位真相舱', occurredAt: daysAgo(p.daysAgoSubmitted + 2) },
        { id: `seed-ev-${cid}-2`, type: 'scene_completed', label: '完成全部场景', occurredAt: daysAgo(p.daysAgoSubmitted + 1) },
        { id: `seed-ev-${cid}-3`, type: 'branch_choice_selected', label: '完成分岔任务', occurredAt: daysAgo(p.daysAgoSubmitted + 1) },
      ],
      directApply: false,
      startedAt: daysAgo(p.daysAgoSubmitted + 2),
      completedAt: daysAgo(p.daysAgoSubmitted + 1),
      completionRate: 100,
    };
    trialSessions.push(session);

    // Reality Report
    const report = generateRealityReport(
      { id: candidateId, jobId: job.id, conversationId, name: p.name, phone: p.phone, email: p.email, sourceChannel: p.sourceChannel, skills: p.skills, projectExperience: p.projectExperience, motivation: p.motivation, concerns: p.concerns, rhythmAcceptance: p.rhythmAcceptance, followUpQuestion: p.followUpQuestion, scenarioReflection: p.scenarioReflection, status: p.status, submittedAt: daysAgo(p.daysAgoSubmitted) },
      job, session, branchChoices.map((c) => c) as any[], branchChoices.map((c) => c) as any[], label,
    );
    realityReports.push(report);

    // Story Card
    storyCards.push(generateHRStoryCard(
      { id: candidateId, jobId: job.id, conversationId, name: p.name, phone: p.phone, email: p.email, sourceChannel: p.sourceChannel, skills: p.skills, projectExperience: p.projectExperience, motivation: p.motivation, concerns: p.concerns, rhythmAcceptance: p.rhythmAcceptance, followUpQuestion: p.followUpQuestion, scenarioReflection: p.scenarioReflection, status: p.status, submittedAt: daysAgo(p.daysAgoSubmitted) },
      job,
      { id: conversationId, candidateId, jobId: job.id, messages: msgs, startedAt: msgs[0].createdAt, endedAt: daysAgo(p.daysAgoSubmitted), durationSeconds: 210, status: 'completed' },
    ));

    trustAuditEvents.push(...report.trustAuditLog);
    trustRepairTasks.push(...report.trustRepairTasks);

    // Latest activity
    const statusLabel = p.status === '已邀约' ? '被标记为邀约面试' : p.status === '已入库' ? '被移入人才库' : `投递了${job.title}`;
    latestActivity.push({ candidateId, candidateName: p.name, jobTitle: job.title, action: statusLabel, occurredAt: p.status === '已投递' ? daysAgo(p.daysAgoSubmitted) : daysAgo(p.daysAgoSubmitted - (p.status === '已邀约' ? 1 : 5)) });
  }

  // Sort latest activity by most recent first
  latestActivity.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  return { candidates, conversations, trialSessions, realityReports, storyCards, trustAuditEvents, trustRepairTasks, latestActivity };
}

// ═══════════════════════════════════════════════════════════════
// Initial State
// ═══════════════════════════════════════════════════════════════

export function createInitialState(): DemoState {
  const jobs = [jobP0Data, jobP1Data, jobP2Data, jobP3Data, jobP4Data, jobP5Data, jobP6Data];

  const ecosystems = jobs.map(buildJobEcosystem);
  const trialData = jobs.map((job, i) => buildTrialAndReport(job, ecosystems[i]));

  // Flatten arrays
  const allAvatars = ecosystems.map((e) => e.avatar);
  const allRoles = ecosystems.flatMap((e) => e.realityRoles);
  const allScenes = ecosystems.flatMap((e) => e.realityScenes);
  const allLabels = ecosystems.map((e) => e.jobTruthLabel);
  const allContracts = ecosystems.map((e) => e.jobTruthContract);
  const allBranches = ecosystems.flatMap((e) => e.branchScenarios);
  const allVideos = ecosystems.map((e) => e.truthVideoScript);
  const allSessions = trialData.map((t) => t.trialSession);
  const allReports = trialData.map((t) => t.report);

  // ═══════════════════════════════════════════════════════════════
  // Seed Candidates — 已参加面试的真实候选人数据
  // ═══════════════════════════════════════════════════════════════
  const seedCandidates = buildSeedCandidates(jobs, ecosystems, allReports);

  const recruitingTrustHealth = calculateRecruitingTrustHealth({
    truthLabelViewRate: 60,
    truthContractAcknowledgementRate: 55,
    trialCompletionRate: 42,
    trustRepairTaskHandledRate: 30,
    aiRiskReviewPassRate: 85,
    candidateFairnessIndex: 88,
    auditCompletenessRate: 72,
  });

  return {
    company: demoCompany,
    jobs,
    avatars: allAvatars,
    realityRoles: allRoles,
    realityScenes: allScenes,
    jobTruthLabels: allLabels,
    jobTruthContracts: allContracts,
    branchScenarios: allBranches,
    truthVideoScripts: allVideos,
    trustAuditEvents: [...allReports.flatMap((r) => r.trustAuditLog), ...seedCandidates.trustAuditEvents],
    trustRepairTasks: [...allReports.flatMap((r) => r.trustRepairTasks), ...seedCandidates.trustRepairTasks],
    trialSessions: [...allSessions, ...seedCandidates.trialSessions],
    realityReports: [...allReports, ...seedCandidates.realityReports],
    drafts: [],
    candidates: seedCandidates.candidates,
    conversations: seedCandidates.conversations,
    storyCards: seedCandidates.storyCards,
    latestCandidateActivity: seedCandidates.latestActivity,
    scoreOverrides: [],
    metrics: {
      visits: 1894,
      chatStarts: 876,
      chatCompletions: 523,
      applications: 218,
      highIntentCandidates: 87,
      interviewInvites: 34,
      attendedInterviews: 22,
      hires: 5,
      trialStarts: 580,
      trialCompletions: 218,
      trialDropOffs: 362,
      misunderstandingCandidates: 62,
      savedInterviewEstimate: 48,
      savedHrHoursEstimate: 42,
      talentPoolAdds: 41,
      truthLabelViews: 1050,
      branchTrialCompletions: 160,
      highConcernCandidates: 45,
      preInviteSuggestionCoverage: 128,
      invitationScriptsGenerated: 128,
      battleCardsGenerated: 128,
      averageTrustIndex: 71,
      highTrustCandidateRatio: 68,
      truthContractAcknowledgements: 95,
      aiRiskReviewPasses: 14,
      lowTrustReasonTop3: ['薪资沟通节点', '工作节奏', '成长路径'],
      mutualConfirmations: 62,
      highConfirmationCandidateRatio: 62,
      unconfirmedReasonTop3: ['薪资沟通节点', '工作节奏', '面试反馈时效'],
      candidateFairnessIndex: 88,
      commitmentConsistencyIssues: 3,
      evidenceSupportedAdviceCount: 34,
      humanConfirmationAdviceCount: 22,
      pendingTrustRepairTasks: 12,
      handledTrustRepairTasks: 28,
      highSilenceRiskCandidates: 5,
      auditCompletenessRate: 78,
      recruitingTrustHealth,
      candidateExitReasonTop3: ['薪资信息不明确', '岗位节奏不适合', '成长路径不清晰'],
    },
  };
}
