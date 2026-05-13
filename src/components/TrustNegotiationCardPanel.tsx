import { Badge } from './Badge';
import type { TrustNegotiationCard } from '../types';

export function TrustNegotiationCardPanel({ card }: { card: TrustNegotiationCard }) {
  const copy = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="story-block negotiation-panel">
      <div className="risk-review-head">
        <div>
          <span className="eyebrow">Trust Negotiation</span>
          <h3>邀约前信任谈判舱</h3>
          <p>先澄清候选人最关心的问题，再进入正式邀约。</p>
        </div>
        <Badge tone="blue">HR辅助建议</Badge>
      </div>
      <div className="risk-review-grid">
        <div>
          <strong>候选人最想确认</strong>
          <div className="tag-row">
            {card.candidateQuestions.map((item) => (
              <Badge key={item} tone="amber">
                {item}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <strong>HR应先澄清</strong>
          <ul className="story-list">
            {card.hrClarifications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <ScriptBox title="信任修复话术" content={card.trustRepairScript} onCopy={copy} />
      <ScriptBox title="正式邀约话术" content={card.formalInvitationScript} onCopy={copy} />
    </div>
  );
}

function ScriptBox({ title, content, onCopy }: { title: string; content: string; onCopy: (text: string) => void }) {
  return (
    <div className="invitation-script compact-script">
      <div className="copy-script-head">
        <strong>{title}</strong>
        <button className="ghost-button" type="button" onClick={() => onCopy(content)}>
          复制
        </button>
      </div>
      <p>{content}</p>
    </div>
  );
}
