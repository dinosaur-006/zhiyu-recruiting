import { Badge } from './Badge';
import type { TrustAuditEvent } from '../types';

export function TrustAuditLogPanel({
  events,
  completenessRate,
}: {
  events: TrustAuditEvent[];
  completenessRate: number;
}) {
  return (
    <section className="story-block governance-panel" id="trust-audit-log">
      <div className="pro-card-head">
        <div>
          <span className="eyebrow">Trust Governance</span>
          <h3>招聘信任审计日志</h3>
          <p>把岗位真相、候选人行为、AI建议和HR操作串成可追溯的治理链路。</p>
        </div>
        <Badge tone={completenessRate >= 80 ? 'green' : 'amber'}>完整率 {completenessRate}%</Badge>
      </div>
      <div className="audit-timeline">
        {events.map((event) => (
          <article key={event.id} className="audit-item">
            <time>{formatTime(event.occurredAt)}</time>
            <div>
              <div className="audit-title">
                <strong>{event.title}</strong>
                <Badge tone={event.evidenceLevel === '充分' ? 'green' : 'amber'}>{event.evidenceLevel}</Badge>
              </div>
              <p>{event.description}</p>
              <span>{actorLabel(event.actor)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function actorLabel(actor: TrustAuditEvent['actor']) {
  const labels: Record<TrustAuditEvent['actor'], string> = {
    system: '系统记录',
    candidate: '候选人行为',
    ai: 'AI辅助生成',
    hr: 'HR操作',
  };
  return labels[actor];
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}
