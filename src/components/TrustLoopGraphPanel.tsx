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
    <section className="trust-progress-panel" id="trust-loop">
      <div className="brief-section-head">
        <span className="eyebrow">Trust Chain</span>
        <h3>招聘信任链路</h3>
        <p>用一条细进度线串起岗位真相、候选人确认、云试岗证据、信任修复和人工复核。</p>
      </div>
      <div className="trust-progress-rail">
        {navigationNodes.map((node, index) => (
          <a key={node.id} className={`trust-progress-step status-${node.status}`} href={`#${node.anchor}`}>
            <i>{String(index + 1).padStart(2, '0')}</i>
            <strong>{node.title}</strong>
            <span>{node.summary}</span>
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
    truth: '岗位真相',
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
