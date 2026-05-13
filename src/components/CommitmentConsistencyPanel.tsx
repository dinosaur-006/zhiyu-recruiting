import { Badge } from './Badge';
import type { CommitmentConsistencyCheck } from '../types';

const riskTone: Record<CommitmentConsistencyCheck['riskLevel'], 'green' | 'amber' | 'red'> = {
  低: 'green',
  中: 'amber',
  高: 'red',
};

export function CommitmentConsistencyPanel({ check }: { check: CommitmentConsistencyCheck }) {
  return (
    <section className="story-block consistency-panel" id="commitment-consistency">
      <div className="pro-card-head">
        <div>
          <span className="eyebrow">Consistency Check</span>
          <h3>岗位承诺一致性检测</h3>
          <p>检查JD、岗位真相标签、岗位真相合约、数字人脚本和面试流程之间是否存在候选人可能误解的表达差异。</p>
        </div>
        <Badge tone={riskTone[check.riskLevel]}>一致性风险：{check.riskLevel}</Badge>
      </div>
      <div className="consistency-grid">
        <div>
          <h4>发现的问题</h4>
          <ul className="clean-list">
            {check.findings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>建议补充或修正</h4>
          <ul className="clean-list">
            {check.suggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
