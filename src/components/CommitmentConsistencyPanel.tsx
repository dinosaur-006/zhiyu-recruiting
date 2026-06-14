import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from './Badge';
import { Panel } from './Panel';
import type { CommitmentConsistencyCheck } from '../types';

const TONES: Record<string, 'green'|'amber'|'red'> = { 低: 'green', 中: 'amber', 高: 'red' };
const ICONS: Record<string, React.ReactNode> = { 高: <AlertTriangle size={13} />, 中: <AlertCircle size={13} />, 低: <CheckCircle2 size={13} /> };

export function CommitmentConsistencyPanel({ check }: { check: CommitmentConsistencyCheck }) {
  return (
    <Panel eyebrow="Consistency Check" title="岗位承诺一致性检测"
      subtitle="检查JD、岗位真相标签、合约、数字人脚本和面试流程之间的表达差异"
      tint={check.riskLevel === '高' ? 'red' : 'amber'}
      badge={<Badge tone={TONES[check.riskLevel]}>{ICONS[check.riskLevel]}一致性风险：{check.riskLevel}</Badge>}>
      <div className="panel-two-col" style={{ marginTop: 0 }}>
        <div><strong>发现的问题</strong><ul className="clean-list">{check.findings.map((i) => <li key={i}>{i}</li>)}</ul></div>
        <div><strong>建议补充或修正</strong><ul className="clean-list">{check.suggestions.map((i) => <li key={i}>{i}</li>)}</ul></div>
      </div>
    </Panel>
  );
}
