import type { AIAdviceRelianceNotice } from '../types';

export function AIAdviceReliancePanel({ notice }: { notice: AIAdviceRelianceNotice }) {
  return (
    <section className="story-block reliance-panel" id="ai-advice-reliance">
      <div className="pro-card-head">
        <div>
          <span className="eyebrow">Human Oversight</span>
          <h3>AI建议依赖度提醒</h3>
          <p>主动提示HR优先参考有证据来源的建议，对证据不足项进行人工确认。</p>
        </div>
      </div>
      <div className="report-summary-grid compact">
        <div className="summary-cell">
          <span>证据充分建议</span>
          <strong>{notice.evidenceSupportedCount}类</strong>
        </div>
        <div className="summary-cell">
          <span>需人工确认</span>
          <strong>{notice.needsHumanConfirmationCount}类</strong>
        </div>
        <div className="summary-cell">
          <span>最终边界</span>
          <strong>人工完成</strong>
        </div>
      </div>
      <ul className="clean-list">
        {notice.reminders.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
