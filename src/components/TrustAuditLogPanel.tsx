import { ShieldCheck } from 'lucide-react';
import { Badge } from './Badge';
import { Panel } from './Panel';
import type { TrustAuditEvent } from '../types';

export function TrustAuditLogPanel({ events, completenessRate }: { events: TrustAuditEvent[]; completenessRate: number }) {
  return (
    <Panel eyebrow="Trust Governance" title="招聘信任审计日志"
      subtitle="岗位真相、候选人行为、AI建议和HR操作的可追溯治理链路"
      badge={<Badge tone={completenessRate >= 80 ? 'green' : 'amber'}><ShieldCheck size={13} />完整率 {completenessRate}%</Badge>}>
      <div className="audit-timeline">
        {events.map((e) => (
          <article key={e.id} className="audit-item">
            <div className="audit-item-time">{fmt(e.occurredAt)}</div>
            <div className="audit-item-body">
              <strong>{e.title}<span style={{ marginLeft: 'var(--space-2)' }}><Badge tone={e.evidenceLevel === '充分' ? 'green' : 'amber'} dot>{e.evidenceLevel}</Badge></span></strong>
              <p>{e.description}</p>
              <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-muted)' }}>{actorLabel(e.actor)}</span>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}
function actorLabel(a: TrustAuditEvent['actor']) { return { system: '系统记录', candidate: '候选人行为', ai: 'AI辅助生成', hr: 'HR操作' }[a]; }
function fmt(v: string) { const d = new Date(v); return Number.isNaN(d.getTime()) ? v : d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }); }
