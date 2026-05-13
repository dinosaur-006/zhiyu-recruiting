import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { useDemoState } from '../store/demoStore';

export function Home() {
  const state = useDemoState();
  const primaryJob = state.jobs[0];

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="brand-lockup">
          <div className="logo-mark">职</div>
          <div>
            <strong>职遇</strong>
            <span>AI数字人招聘前置筛选与双向匹配系统</span>
          </div>
        </div>
        <div className="hero-copy">
          <Badge tone="blue">MVP 1.0 演示系统</Badge>
          <h1>让HR少做重复沟通，让候选人先聊再投</h1>
          <p>
            用岗位数字人完成投递前说明、意愿确认和能力线索采集，再把对话转化为HR可用的候选人故事卡。
          </p>
        </div>
        <div className="home-actions">
          <Link className="primary-button" to="/hr">
            进入HR后台
          </Link>
          <Link className="ghost-button" to={`/candidate/job/${primaryJob.id}`}>
            进入候选人体验
          </Link>
        </div>
      </section>

      <section className="home-grid">
        <article>
          <span>01</span>
          <h3>发布岗位</h3>
          <p>HR填写JD，Mock AI生成岗位关键词、FAQ、卖点和风险点。</p>
        </article>
        <article>
          <span>02</span>
          <h3>先聊再投</h3>
          <p>候选人可选择数字人预体验，也可保留直接投递路径。</p>
        </article>
        <article>
          <span>03</span>
          <h3>故事卡回流</h3>
          <p>HR看到岗位理解、技能标签、意愿信号、风险提示和建议追问。</p>
        </article>
      </section>
    </main>
  );
}
