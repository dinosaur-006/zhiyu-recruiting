import { Phone } from 'lucide-react';
import { Panel } from './Panel';
import type { NoShowPreventionCard } from '../types';

export function NoShowPreventionCardPanel({ card }: { card: NoShowPreventionCard }) {
  return (
    <Panel eyebrow="No-show Prevention" title="爽约预防卡" tint="amber"
      badge={<button className="cr-btn-ghost" onClick={() => navigator.clipboard?.writeText(card.invitationScript)}><Phone size={13} />复制邀约话术</button>}>
      <div className="panel-two-col" style={{ marginTop: 0 }}>
        <div><strong>可能爽约原因</strong><ul className="clean-list">{card.possibleReasons.map((i) => <li key={i}>{i}</li>)}</ul></div>
        <div><strong>邀约前建议动作</strong><ul className="clean-list">{card.preInviteActions.map((i) => <li key={i}>{i}</li>)}</ul></div>
      </div>
      <div className="compact-script">
        <div className="copy-script-head"><strong>AI生成邀约话术</strong></div>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-ink-soft)', lineHeight: 'var(--leading-relaxed)' }}>{card.invitationScript}</p>
      </div>
    </Panel>
  );
}
