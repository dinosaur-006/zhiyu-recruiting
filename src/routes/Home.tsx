import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { seedRealityDemoCase, useDemoState } from '../store/demoStore';

export function Home() {
  const state = useDemoState();
  const primaryJob = state.jobs[0];

  const seedDemo = () => {
    seedRealityDemoCase();
    window.location.href = '/hr/candidates';
  };

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="brand-lockup">
          <div className="logo-mark">职</div>
          <div>
            <strong>职遇</strong>
            <span>Reality｜AI数字人岗位实境舱</span>
          </div>
        </div>
        <div className="hero-copy">
          <Badge tone="blue">职遇 Reality 演示系统</Badge>
          <h1>让候选人在投递前，先和未来同事过一天</h1>
          <p>
            不是AI面试官，而是岗位数字分身。用HR数字人、未来同事数字人、未来主管数字人还原岗位真实一天，
            让候选人先云试岗，再投递。
          </p>
        </div>
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
      </section>

      <section className="home-grid">
        <article>
          <span>01</span>
          <h3>岗位实境舱</h3>
          <p>HR数字人、未来同事数字人、未来主管数字人共同还原岗位真实一天。</p>
        </article>
        <article>
          <span>02</span>
          <h3>云试岗</h3>
          <p>候选人通过三幕式场景了解岗位，并完成真实任务选择。</p>
        </article>
        <article>
          <span>03</span>
          <h3>云试岗报告</h3>
          <p>HR获得真实意愿、岗位理解、场景选择、风险信号和建议追问。</p>
        </article>
      </section>
    </main>
  );
}
