import { Badge } from './Badge';
import type { TrustGapDiagnosisItem } from '../types';

const typeTone: Record<TrustGapDiagnosisItem['type'], 'blue' | 'purple' | 'amber' | 'green'> = {
  信息缺口: 'blue',
  情绪缺口: 'purple',
  证据缺口: 'amber',
  承诺缺口: 'green',
};

export function TrustGapDiagnosisPanel({ items }: { items: TrustGapDiagnosisItem[] }) {
  return (
    <section className="story-block trust-diagnosis-panel" id="trust-gap-diagnosis">
      <div className="pro-card-head">
        <div>
          <span className="eyebrow">Gap Diagnosis</span>
          <h3>信任缺口诊断器</h3>
          <p>从顾虑雷达、合约疑问、反向提问和双向确认中识别邀约前最该修复的阻碍。</p>
        </div>
      </div>
      <div className="diagnosis-list">
        {items.map((item) => (
          <article key={`${item.type}-${item.trigger}`} className="diagnosis-card">
            <div className="diagnosis-title">
              <Badge tone={typeTone[item.type]}>{item.type}</Badge>
              <strong>{item.impact}</strong>
            </div>
            <p><b>触发依据：</b>{item.trigger}</p>
            <p><b>HR修复动作：</b>{item.repairAction}</p>
            <p className="diagnosis-script">{item.repairScript}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
