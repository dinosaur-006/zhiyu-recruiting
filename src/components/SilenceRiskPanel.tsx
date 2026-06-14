import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from './Badge';
import { Panel } from './Panel';
import type { SilenceRisk } from '../types';

const ICONS: Record<string, React.ReactNode> = { 高: <AlertTriangle size={13} />, 中: <AlertCircle size={13} />, 低: <CheckCircle2 size={13} /> };
const TINTS: Record<string, 'red'|'amber'|'green'> = { 高: 'red', 中: 'amber', 低: 'green' };

export function SilenceRiskPanel({ risk }: { risk: SilenceRisk }) {
  return (
    <Panel eyebrow="Ghosting Prevention" title="候选人沉默风险识别"
      subtitle="该模块只用于邀约沟通辅助，不评价候选人能力" tint={TINTS[risk.level]}
      badge={<Badge tone={risk.level === '高' ? 'red' : risk.level === '中' ? 'amber' : 'green'}>{ICONS[risk.level]}沉默风险：{risk.level}</Badge>}>
      <div className="panel-two-col">
        <div><strong>可能沉默原因</strong><ul className="clean-list">{risk.possibleReasons.map((r) => <li key={r}>{r}</li>)}</ul></div>
        <div><strong>建议HR动作</strong><ul className="clean-list">{risk.suggestedActions.map((a) => <li key={a}>{a}</li>)}</ul></div>
      </div>
      <div className="compact-script">
        <div className="copy-script-head"><strong>沉默唤醒话术</strong></div>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-ink-soft)', lineHeight: 'var(--leading-relaxed)' }}>{risk.wakeUpScript}</p>
      </div>
    </Panel>
  );
}
