import type { CandidateFairnessIndex } from '../types';

const fairnessLabels: Record<keyof CandidateFairnessIndex['dimensions'], string> = {
  aiDisclosure: 'AI身份披露',
  dataUsageNotice: '数据用途说明',
  directApplyPath: '直接投递通道',
  humanReview: '人工复核声明',
  explanationAndDeletion: '解释/删除说明',
  sensitiveDataAvoidance: '避免敏感信息采集',
  feedbackTiming: '面试反馈时效说明',
};

export function CandidateFairnessIndexPanel({ fairness }: { fairness: CandidateFairnessIndex }) {
  return (
    <div className="story-block fairness-panel">
      <div className="trust-index-hero">
        <div>
          <span className="eyebrow">Candidate Fairness Index</span>
          <h3>候选人体验公平指数</h3>
          <p>衡量招聘流程是否透明、有人工复核、保留直接投递和候选人权益说明。</p>
        </div>
        <div className="trust-score fairness-score">
          <strong>{fairness.total}</strong>
          <span>/100</span>
        </div>
      </div>
      <div className="attention-map">
        {Object.entries(fairness.dimensions).map(([key, value]) => (
          <div key={key} className="attention-row">
            <span>{fairnessLabels[key as keyof CandidateFairnessIndex['dimensions']]}</span>
            <div>
              <i style={{ width: `${value}%` }} />
            </div>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <ul className="story-list">
        {fairness.optimizationSuggestions.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
