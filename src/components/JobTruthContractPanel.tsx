import { Shield, CheckCircle2 } from 'lucide-react';
import { Badge } from './Badge';
import type { JobTruthContract } from '../types';

interface JobTruthContractPanelProps {
  contract: JobTruthContract;
  onAcknowledge: () => void;
  onConcern: () => void;
  onStart: () => void;
  acknowledged?: boolean;
  unresolvedConcerns?: string[];
}

export function JobTruthContractPanel({
  contract,
  onAcknowledge,
  onConcern,
  onStart,
  acknowledged,
  unresolvedConcerns = [],
}: JobTruthContractPanelProps) {
  return (
    <section className="truth-contract-panel">
      <div className="truth-contract-head">
        <div>
          <span className="eyebrow">Job Truth Contract</span>
          <h2>岗位真相合约</h2>
          <p>企业先公开岗位边界，候选人知情后再决定是否继续投入云试岗。</p>
        </div>
        <Badge tone={acknowledged ? 'green' : 'blue'}>
          {acknowledged ? <CheckCircle2 size={14} /> : <Shield size={14} />}
          {acknowledged ? '已确认' : '待确认'}
        </Badge>
      </div>

      <div className="contract-grid">
        {contract.commitments.map((item) => (
          <div key={item.id} className={`contract-item ${item.category} card-lift`}>
            <Shield size={20} />
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {unresolvedConcerns.length > 0 ? (
        <div className="contract-concerns">
          <strong>仍有疑问</strong>
          <div className="tag-row">
            {unresolvedConcerns.map((item) => (
              <Badge key={item} tone="amber">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      <div className="contract-boundary">
        <p>{contract.aiDecisionBoundary}</p>
        <p>{contract.dataUsageNotice}</p>
      </div>

      <div className="contract-actions">
        <button className="primary-button" type="button" onClick={onAcknowledge}>
          我已了解
        </button>
        <button className="ghost-button" type="button" onClick={onConcern}>
          我仍有疑问
        </button>
        <button className="ghost-button" type="button" onClick={onStart}>
          进入云试岗
        </button>
      </div>
    </section>
  );
}
