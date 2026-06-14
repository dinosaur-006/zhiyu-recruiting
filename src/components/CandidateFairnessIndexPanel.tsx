import { Panel } from './Panel';
import type { CandidateFairnessIndex } from '../types';

const LABELS: Record<keyof CandidateFairnessIndex['dimensions'], string> = {
  aiDisclosure: 'AI身份披露', dataUsageNotice: '数据用途说明', directApplyPath: '直接投递通道',
  humanReview: '人工复核声明', explanationAndDeletion: '解释/删除说明',
  sensitiveDataAvoidance: '避免敏感信息采集', feedbackTiming: '面试反馈时效说明',
};

export function CandidateFairnessIndexPanel({ fairness }: { fairness: CandidateFairnessIndex }) {
  return (
    <Panel eyebrow="Candidate Fairness Index" title="候选人体验公平指数" subtitle="衡量招聘流程透明度和候选人权益保障" tint="green">
      <div className="fairness-grid">
        {Object.entries(fairness.dimensions).map(([k, v]) => (
          <div key={k} className="fairness-item">
            <div className="fairness-item-label">{LABELS[k as keyof CandidateFairnessIndex['dimensions']]}</div>
            <div className="fairness-item-value">{v}</div>
          </div>
        ))}
      </div>
      {fairness.optimizationSuggestions.length > 0 && (
        <ul className="clean-list" style={{ marginTop: 'var(--space-4)' }}>{fairness.optimizationSuggestions.map((i) => <li key={i}>{i}</li>)}</ul>
      )}
    </Panel>
  );
}
