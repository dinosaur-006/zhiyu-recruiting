import { Shield, AlertTriangle } from 'lucide-react';
import { Badge } from './Badge';
import { Panel } from './Panel';
import type { AIRiskReview } from '../types';

export function AIRiskReviewPanel({ review }: { review: AIRiskReview }) {
  const ok = review.result === '复核通过';
  return (
    <Panel eyebrow="AI Risk Reviewer" title="AI风险复核官" tint={ok ? 'green' : 'amber'}
      badge={<Badge tone={ok ? 'green' : 'amber'}>{ok ? <Shield size={13} /> : <AlertTriangle size={13} />}{review.result}</Badge>}>
      <div className="panel-two-col" style={{ marginTop: 0 }}>
        <div><strong>已检查</strong><ul className="clean-list" style={{ marginTop: 'var(--space-2)' }}>{review.checkedItems.map((i) => <li key={i}>{i}</li>)}</ul></div>
        <div><strong>复核提醒</strong><ul className="clean-list" style={{ marginTop: 'var(--space-2)' }}>{review.reminders.map((i) => <li key={i}>{i}</li>)}</ul></div>
      </div>
    </Panel>
  );
}
