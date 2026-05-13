import { Link, useParams } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { useDemoState } from '../../store/demoStore';

export function Share() {
  const { jobId } = useParams();
  const { jobs } = useDemoState();
  const job = jobs.find((item) => item.id === jobId);
  const link = `${window.location.origin}/candidate/job/${jobId}`;

  if (!job) {
    return (
      <main className="page">
        <div className="panel">未找到职位。</div>
      </main>
    );
  }

  const copy = async () => {
    await navigator.clipboard?.writeText(link);
  };

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">体验入口</span>
          <h1>{job.title} 分享页</h1>
          <p>把链接或二维码发给候选人，候选人可先聊再投，也可直接投递。</p>
        </div>
        <Link className="primary-button" to={`/candidate/job/${job.id}`}>
          打开候选人页
        </Link>
      </div>

      <section className="share-grid">
        <article className="panel">
          <h2>岗位体验链接</h2>
          <div className="copy-box">
            <code>{link}</code>
            <button className="ghost-button" onClick={copy}>复制链接</button>
          </div>
          <div className="share-copy">
            <Badge tone="blue">分享文案</Badge>
            <p>花3分钟先了解岗位真实情况，再决定是否投递。你可以随时退出，也可以直接投递简历。</p>
          </div>
        </article>
        <article className="panel qr-panel">
          <div className="qr-code">
            <span>职遇</span>
            <i />
            <i />
            <i />
          </div>
          <p>二维码占位 · 演示时可直接打开右侧链接</p>
        </article>
      </section>
    </main>
  );
}
