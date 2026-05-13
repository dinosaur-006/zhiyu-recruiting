import { Badge } from './Badge';
import type { SilenceRisk } from '../types';

export function SilenceRiskPanel({ risk }: { risk: SilenceRisk }) {
  return (
    <section className="story-block governance-panel" id="silence-risk">
      <div className="pro-card-head">
        <div>
          <span className="eyebrow">Ghosting Prevention</span>
          <h3>候选人沉默风险识别</h3>
          <p>该模块只用于邀约沟通辅助，不评价候选人能力。</p>
        </div>
        <Badge tone={risk.level === '高' ? 'red' : risk.level === '中' ? 'amber' : 'green'}>沉默风险：{risk.level}</Badge>
      </div>
      <div className="governance-grid">
        <div>
          <strong>可能沉默原因</strong>
          <ul className="clean-list">
            {risk.possibleReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>建议HR动作</strong>
          <ul className="clean-list">
            {risk.suggestedActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="invitation-script compact-script">
        <strong>沉默唤醒话术</strong>
        <p>{risk.wakeUpScript}</p>
      </div>
    </section>
  );
}
