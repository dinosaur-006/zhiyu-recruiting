import { Link, useParams } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { useDemoState } from '../../store/demoStore';

export function Success() {
  const { candidateId } = useParams();
  const state = useDemoState();
  const candidate = state.candidates.find((item) => item.id === candidateId);
  const job = state.jobs.find((item) => item.id === candidate?.jobId);

  return (
    <main className="mobile-page success-page">
      <section className="mobile-card success-card">
        <div className="success-mark">✓</div>
        <Badge tone="green">投递成功</Badge>
        <h1>{candidate?.name ?? '候选人'}，你的云试岗记录已完成</h1>
        <p>
          {job?.title ?? '目标岗位'} 的云试岗报告已同步到HR工作台。HR会结合人工复核结果安排后续沟通。
        </p>
        <div className="success-actions">
          <Link className="primary-button full" to="/hr/candidates">
            HR查看云试岗报告
          </Link>
          <Link className="ghost-button full" to="/">
            返回演示入口
          </Link>
        </div>
      </section>
    </main>
  );
}
