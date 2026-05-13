import { Badge } from './Badge';
import type { TrustLoopNode } from '../types';

const statusTone: Record<TrustLoopNode['status'], 'green' | 'amber' | 'blue'> = {
  已完成: 'green',
  有缺口: 'amber',
  需HR补充: 'blue',
};

export function TrustLoopGraphPanel({ nodes }: { nodes: TrustLoopNode[] }) {
  return (
    <section className="story-block trust-loop-panel" id="trust-loop">
      <div className="pro-card-head">
        <div>
          <span className="eyebrow">Trust Intelligence</span>
          <h3>招聘信任闭环图谱</h3>
          <p>把岗位真相、候选人确认、云试岗选择、信任修复和人工复核串成一条可解释链路。</p>
        </div>
      </div>
      <div className="trust-loop-grid">
        {nodes.map((node, index) => (
          <a key={node.id} className="trust-loop-node" href={`#${node.anchor}`}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <strong>{node.title}</strong>
              <p>{node.summary}</p>
            </div>
            <Badge tone={statusTone[node.status]}>{node.status}</Badge>
          </a>
        ))}
      </div>
    </section>
  );
}
