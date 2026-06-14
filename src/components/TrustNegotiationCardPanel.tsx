import { MessageCircle } from 'lucide-react';
import { Badge } from './Badge';
import { Panel } from './Panel';
import type { TrustNegotiationCard } from '../types';

export function TrustNegotiationCardPanel({ card }: { card: TrustNegotiationCard }) {
  return (
    <Panel eyebrow="Trust Negotiation" title="邀约前信任谈判舱"
      subtitle="先澄清候选人最关心的问题，再进入正式邀约"
      badge={<Badge tone="blue"><MessageCircle size={13} />HR辅助建议</Badge>}>
      <div className="panel-two-col" style={{ marginTop: 0 }}>
        <div>
          <strong>候选人最想确认</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>{card.candidateQuestions.map((q) => <Badge key={q} tone="amber">{q}</Badge>)}</div>
        </div>
        <div><strong>HR应先澄清</strong><ul className="clean-list">{card.hrClarifications.map((i) => <li key={i}>{i}</li>)}</ul></div>
      </div>
      <ScriptBox title="信任修复话术" content={card.trustRepairScript} />
      <ScriptBox title="正式邀约话术" content={card.formalInvitationScript} />
    </Panel>
  );
}
function ScriptBox({ title, content }: { title: string; content: string }) {
  return (
    <div className="compact-script">
      <div className="copy-script-head"><strong>{title}</strong><button className="cr-btn-ghost" style={{ fontSize: 'var(--text-2xs)', padding: '2px var(--space-3)' }} onClick={() => navigator.clipboard?.writeText(content)}>复制</button></div>
      <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-ink-soft)', lineHeight: 'var(--leading-relaxed)' }}>{content}</p>
    </div>
  );
}
