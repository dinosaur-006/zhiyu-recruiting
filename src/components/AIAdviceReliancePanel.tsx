import type { AIAdviceEvidenceTag, AIAdviceRelianceNotice } from '../types';

export function AIAdviceReliancePanel({ notice, evidenceTags = [] }: { notice: AIAdviceRelianceNotice; evidenceTags?: AIAdviceEvidenceTag[] }) {
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
      {evidenceTags.length > 0 ? (
        <div className="advice-evidence-list">
          {evidenceTags.map((tag) => (
            <article key={tag.id} className={tag.status === '有行为证据' ? 'advice-evidence-card supported' : 'advice-evidence-card needs-review'}>
              <div>
                <strong>{tag.advice}</strong>
                <span>{tag.reason}</span>
              </div>
              <b>{tag.status}</b>
              {tag.evidence.length > 0 ? (
                <ul>
                  {tag.evidence.map((item) => (
                    <li key={item}>
                      <strong>{formatEvidenceSource(item)}</strong>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function formatEvidenceSource(evidence: string) {
  if (evidence.includes('反向问答')) return '来自反向问答';
  if (evidence.includes('分岔') || evidence.includes('沙盘')) return '来自分岔选择';
  if (evidence.includes('真相')) return '来自真相点关注';
  if (evidence.includes('顾虑雷达')) return '来自顾虑雷达';
  if (evidence.includes('合约')) return '来自双向确认';
  if (evidence.includes('云试岗') || evidence.includes('路径')) return '来自路径回放';
  return '来自行为证据';
}
