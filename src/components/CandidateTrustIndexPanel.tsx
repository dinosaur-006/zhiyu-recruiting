import { Badge } from './Badge';
import type { CandidateTrustIndex } from '../types';

const dimensionLabels: Record<keyof CandidateTrustIndex['dimensions'], string> = {
  jobInfoClarity: '岗位信息清晰度',
  salaryCertainty: '薪资沟通确定性',
  teamTrust: '团队信任感',
  growthCredibility: '成长路径可信度',
  rhythmAcceptance: '工作节奏接受度',
  aiTransparency: 'AI流程透明度',
  interviewWillingness: '面试投入意愿',
};

export function CandidateTrustIndexPanel({ trustIndex }: { trustIndex: CandidateTrustIndex }) {
  return (
    <div className="story-block trust-index-panel">
      <div className="trust-index-hero">
        <div>
          <span className="eyebrow">Candidate Trust Index</span>
          <h3>候选人信任指数</h3>
          <p>{trustIndex.explanation}</p>
        </div>
        <div className="trust-score">
          <strong>{trustIndex.total}</strong>
          <span>/100</span>
        </div>
      </div>

      <div className="attention-map">
        {Object.entries(trustIndex.dimensions).map(([key, value]) => (
          <div key={key} className="attention-row">
            <span>{dimensionLabels[key as keyof CandidateTrustIndex['dimensions']]}</span>
            <div>
              <i style={{ width: `${value}%` }} />
            </div>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="trust-gap-row">
        <div>
          <strong>当前信任缺口</strong>
          <div className="tag-row">
            {trustIndex.gapReasons.map((item) => (
              <Badge key={item} tone="amber">
                {item}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <strong>邀约前修复建议</strong>
          <ul className="story-list">
            {trustIndex.repairSuggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
