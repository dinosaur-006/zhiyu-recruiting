import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from './Badge';
import type { InterviewMutualConfirmation } from '../types';

interface MutualConfirmationPanelProps {
  confirmation: InterviewMutualConfirmation;
  mode?: 'candidate' | 'hr';
}

export function MutualConfirmationPanel({ confirmation, mode = 'hr' }: MutualConfirmationPanelProps) {
  const confirmedEnough = confirmation.candidateConfirmedItems.length >= 3;
  const accentClass = confirmedEnough ? 'panel-accent accent-green' : 'panel-accent accent-amber';
  return (
    <div className={`story-block mutual-panel ${accentClass}`}>
      <div className="risk-review-head">
        <div>
          <span className="eyebrow">Mutual Confirmation</span>
          <h3>面试前双向确认单</h3>
          <p>{mode === 'candidate' ? '确认你已了解关键岗位信息，再进入后续面试沟通。' : '让HR看到候选人是否在知情状态下继续投入面试。'}</p>
        </div>
        <Badge tone={confirmedEnough ? 'green' : 'amber'}>
          {confirmedEnough ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          {confirmedEnough ? '确认充分' : '需补充确认'}
        </Badge>
      </div>
      <div className="risk-review-grid">
        <div>
          <strong>候选人已确认</strong>
          <ul className="story-list">
            {confirmation.candidateConfirmedItems.map((item) => (
              <li key={item}><CheckCircle2 size={12} /> {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>{mode === 'candidate' ? '企业面试承诺' : 'HR面试承诺'}</strong>
          <ul className="story-list">
            {confirmation.hrCommitments.map((item) => (
              <li key={item}><CheckCircle2 size={12} /> {item}</li>
            ))}
          </ul>
        </div>
      </div>
      {confirmation.unresolvedReasons.length > 0 ? (
        <div className="tag-row">
          {confirmation.unresolvedReasons.map((item) => (
            <Badge key={item} tone="amber">
              <AlertTriangle size={12} />仍需确认：{item}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
