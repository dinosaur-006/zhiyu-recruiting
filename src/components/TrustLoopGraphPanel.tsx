import { Badge } from './Badge';
import type { TrustLoopNode } from '../types';

const statusTone: Record<TrustLoopNode['status'], 'green' | 'amber' | 'blue'> = {
  已完成: 'green',
  有缺口: 'amber',
  需HR补充: 'blue',
};

export function TrustLoopGraphPanel({ nodes }: { nodes: TrustLoopNode[] }) {
  const navigationNodes = normalizeTrustLoopNodes(nodes);

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
        {navigationNodes.map((node, index) => (
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

function normalizeTrustLoopNodes(nodes: TrustLoopNode[]) {
  const order = ['truth', 'contract', 'branch', 'concern', 'repair', 'mutual', 'review'];
  const titleById: Record<string, string> = {
    truth: '岗位真相公开',
    contract: '知情确认',
    branch: '云试岗',
    concern: '顾虑暴露',
    repair: '信任修复',
    mutual: '双向确认',
    review: '人工复核',
  };
  const anchorById: Record<string, string> = {
    truth: 'job-truth-summary',
    contract: 'truth-contract-summary',
    branch: 'decision-path',
    concern: 'concern-radar',
    repair: 'trust-repair-tasks',
    mutual: 'mutual-confirmation',
    review: 'ai-risk-review',
  };
  const gapNode = nodes.find((node) => node.id === 'gap');

  return order
    .map((id) => nodes.find((node) => node.id === id))
    .filter((node): node is TrustLoopNode => Boolean(node))
    .map((node) => ({
      ...node,
      title: titleById[node.id] ?? node.title,
      anchor: anchorById[node.id] ?? node.anchor,
      summary: node.id === 'repair' && gapNode ? `${gapNode.summary}；${node.summary}` : node.summary,
    }));
}
