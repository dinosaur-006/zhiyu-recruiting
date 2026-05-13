import { Link, useParams } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { TruthVideoPreview } from '../../components/TruthVideoPreview';
import { useDemoState } from '../../store/demoStore';

export function Share() {
  const { jobId } = useParams();
  const { jobs, truthVideoScripts } = useDemoState();
  const job = jobs.find((item) => item.id === jobId);
  const truthVideoScript = truthVideoScripts.find((item) => item.jobId === jobId);
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
          <span className="eyebrow">岗位实境舱分享入口</span>
          <h1>岗位实境舱已生成</h1>
          <p>候选人可以先云试岗，再投递。通过HR数字人、未来同事数字人和未来主管数字人，提前了解岗位真实一天。</p>
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
            <p>这个岗位支持“先云试岗，再投递”。点击链接，和岗位数字人一起体验真实工作场景，再决定是否投递。</p>
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

      {truthVideoScript ? <TruthVideoPreview script={truthVideoScript} /> : null}
    </main>
  );
}
