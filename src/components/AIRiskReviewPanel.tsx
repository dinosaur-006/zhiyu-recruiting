import { Badge } from './Badge';
import type { AIRiskReview } from '../types';

export function AIRiskReviewPanel({ review }: { review: AIRiskReview }) {
  return (
    <div className="story-block risk-review-panel">
      <div className="risk-review-head">
        <div>
          <span className="eyebrow">AI Risk Reviewer</span>
          <h3>AI风险复核官</h3>
        </div>
        <Badge tone={review.result === '复核通过' ? 'green' : 'amber'}>{review.result}</Badge>
      </div>
      <div className="risk-review-grid">
        <div>
          <strong>已检查</strong>
          <ul className="story-list">
            {review.checkedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>复核提醒</strong>
          <ul className="story-list">
            {review.reminders.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
