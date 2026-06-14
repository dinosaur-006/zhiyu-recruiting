import type { Job, RealityRole, RealityScene, SituationalContext, SceneMood, TimePressure } from '../types';

/**
 * 从场景类型 + 角色 + 岗位信息计算情景上下文，
 * 注入到 AI system prompt 中使其感知当前氛围。
 */
export function computeSituationalContext(
  scene: RealityScene,
  role: RealityRole | undefined,
  job: Job,
  branchHistory?: Array<{ id: string; label: string; text: string }>,
): SituationalContext {
  const corpus = [job.workload, job.teamInfo, job.challenges, job.responsibilities].filter(Boolean).join(' ');

  // ── sceneMood ──
  const sceneMood: SceneMood =
    scene.type === 'intro' ? 'warm_welcome' :
    scene.type === 'dayInLife' ? 'casual_chat' :
    scene.type === 'taskChallenge' ? 'tense_decision' :
    'reflective';

  // ── timePressure ──
  // 优先使用 HR Genesis Engine 的 paceThreshold 参数
  const sp = job.situationalParams;
  const timePressure: TimePressure =
    sp ? (sp.paceThreshold > 75 ? 'urgent' : sp.paceThreshold > 45 ? 'moderate' : 'none') :
    containsAny(corpus, ['生死', '紧急', '上线', '倒计时']) ? 'urgent' :
    containsAny(corpus, ['节点', '压力', '迭代', '快', '节奏较快', '集中']) ? 'moderate' :
    'none';

  // ── characterDynamics ──
  const characterDynamics =
    role?.type === 'hr' ? 'HR数字人在向候选人介绍岗位基本情况，氛围友好透明' :
    role?.type === 'teammate' ? '未来同事数字人正在分享真实的工作日常和团队协作方式' :
    role?.type === 'manager' ? '未来主管数字人正在给出真实任务场景，观察候选人的处理思路' :
    '数字人正在与候选人进行沙盘推演对话';

  // ── officeAtmosphere ──
  // 优先使用 HR Genesis Engine 的 derivedAtmosphere
  const officeAtmosphere = sp?.derivedAtmosphere
    ? sp.derivedAtmosphere
    : (() => {
        const techKeywords = containsAny(corpus, ['技术', '代码', 'Code Review', '架构']);
        const fastKeywords = containsAny(corpus, ['快', '节奏', '迭代', '上线']);
        const collabKeywords = containsAny(corpus, ['协作', '跨部门', '沟通', '联调', '评审']);
        return [
          '这是一个' + (techKeywords ? '技术氛围浓厚的' : '业务导向的') + '团队',
          fastKeywords ? '项目节奏较快，' : '节奏稳定，',
          collabKeywords ? '跨部门协作频繁，需要主动沟通' : '独立完成任务的能力很重要',
        ].join('，');
      })();

  // ── urgencyNarrative ──
  const urgencyNarrative =
    timePressure === 'urgent' ? '上线时间紧迫，团队需要快速决策。候选人的每个选择都会直接影响项目进度。' :
    timePressure === 'moderate' ? '项目处于关键节点，有一定时间压力但仍有讨论空间。' :
    '没有紧急时间压力，候选人可以从容了解岗位信息。';

  // ── personaTone ──
  const personaTone = role?.tone ?? (role?.type === 'hr' ? '专业、透明、友好' : role?.type === 'teammate' ? '自然、真实、有亲和力' : '直接、清晰、重视问题解决');

  // ── butterflyHistory ──
  let butterflyHistory: string | undefined;
  if (branchHistory && branchHistory.length > 0) {
    const summaries = branchHistory.map((c, i) =>
      `第${i + 1}轮选择：${c.label}. ${c.text}`
    );
    butterflyHistory = '候选人在前几轮分岔任务中做出了以下选择，请将这些历史决策作为当前情景的上下文：\n' + summaries.join('\n');
  }

  return {
    sceneMood,
    timePressure,
    characterDynamics,
    officeAtmosphere,
    urgencyNarrative,
    personaTone,
    butterflyHistory,
  };
}

function containsAny(text: string, words: string[]): boolean {
  return words.some((w) => text.includes(w));
}
