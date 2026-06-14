import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { AIAdviceEvidenceTag, AIAdviceRelianceNotice } from '../types';
import { Badge } from './Badge';

export function AIAdviceReliancePanel({ notice, evidenceTags = [] }: { notice: AIAdviceRelianceNotice; evidenceTags?: AIAdviceEvidenceTag[] }) {
  return (
    <section className="story-block reliance-panel" id="ai-advice-reliance">
      <div className="pro-card-head">
        <div>
          <span className="eyebrow">Human Oversight</span>
          <h3>AI建议证据标签</h3>
          <p>优先参考有行为证据的建议；证据不足的内容只进入面试前人工确认。</p>
        </div>
      </div>
      <div className="report-summary-grid compact">
        <div className="summary-cell">
          <span>有行为证据</span>
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
            <article key={tag.id} className={tag.status === '有行为证据' ? 'advice-evidence-card supported card-lift badge-dot badge-dot-green' : 'advice-evidence-card needs-review card-lift badge-dot badge-dot-amber'}>
              <div>
                <strong>
                  {tag.status === '有行为证据' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                  {tag.advice}
                </strong>
                <span>{tag.reason}</span>
              </div>
              <Badge dot tone={tag.status === '有行为证据' ? 'green' : 'amber'}>{tag.status}</Badge>
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
  if (evidence.includes('合约') || evidence.includes('双向确认')) return '来自双向确认';
  if (evidence.includes('云试岗') || evidence.includes('路径')) return '来自路径回放';
  if (evidence.includes('资料') || evidence.includes('项目')) return '来自资料补充';
  return '来自行为证据';
}
