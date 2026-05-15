import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { seedRealityDemoCase, useDemoState } from '../store/demoStore';

const chainSteps = ['岗位真相', '云试岗', '信任缺口', '修复任务', 'AI治理'];

const pillars = [
  {
    title: '岗位真相',
    kicker: 'Job Truth',
    copy: '把工作节奏、协作密度、压力来源、适合与不适合人群提前讲清楚。',
  },
  {
    title: '云试岗',
    kicker: 'Reality Trial',
    copy: '候选人在真实任务沙盘中做选择，HR看到的是行为证据而不是黑箱评分。',
  },
  {
    title: 'AI治理',
    kicker: 'AI Governance',
    copy: '每条建议带证据来源，风险复核和审计日志守住人工决策边界。',
  },
];

export function Home() {
  const state = useDemoState();
  const primaryJob = state.jobs[0];

  const seedDemo = () => {
    seedRealityDemoCase();
    window.location.href = '/hr/candidates';
  };

  return (
    <main className="home-page editorial-cover">
      <section className="editorial-hero">
        <div className="editorial-copy">
          <div className="brand-lockup">
            <div className="logo-mark">职</div>
            <div>
              <strong>职遇 Reality Pro</strong>
              <span>AI岗位真相舱</span>
            </div>
          </div>

          <Badge tone="blue">AI招聘信任治理系统</Badge>
          <h1>让招聘从互相包装，变成提前看清。</h1>
          <p>
            一个可解释、可追踪、可修复的 AI 招聘信任治理系统。它不替HR做最终决定，
            而是把岗位真相、候选人选择、信任缺口和下一步动作整理成清楚的决策简报。
          </p>

          <div className="home-actions">
            <Link className="primary-button" to="/hr">
              进入HR后台
            </Link>
            <Link className="ghost-button" to={`/candidate/job/${primaryJob.id}`}>
              体验候选人云试岗
            </Link>
            <button className="ghost-button" onClick={seedDemo}>
              一键生成演示案例
            </button>
          </div>
        </div>

        <aside className="trust-chain-card" aria-label="信任链路预览">
          <span className="eyebrow">Trust Chain Preview</span>
          <h2>从岗位真相到HR动作</h2>
          <p>不是让AI筛掉谁，而是先修复候选人和岗位之间的信息不信任。</p>
          <div className="trust-chain-rail">
            {chainSteps.map((step, index) => (
              <div key={step} className="trust-chain-step">
                <b>{String(index + 1).padStart(2, '0')}</b>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <div className="chain-summary">
            <strong>主动作</strong>
            <span>先发送信任修复话术，再推进正式邀约。</span>
          </div>
        </aside>
      </section>

      <section className="editorial-pillars">
        {pillars.map((pillar) => (
          <article key={pillar.title}>
            <span>{pillar.kicker}</span>
            <h2>{pillar.title}</h2>
            <p>{pillar.copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
