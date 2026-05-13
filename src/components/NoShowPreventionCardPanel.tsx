import type { NoShowPreventionCard } from '../types';

interface NoShowPreventionCardPanelProps {
  card: NoShowPreventionCard;
}

export function NoShowPreventionCardPanel({ card }: NoShowPreventionCardPanelProps) {
  const copy = async () => {
    await navigator.clipboard?.writeText(card.invitationScript);
  };

  return (
    <section className="story-block pro-card no-show-card">
      <div className="pro-card-head">
        <div>
          <span className="eyebrow">No-show Prevention</span>
          <h3>爽约预防卡</h3>
        </div>
        <button className="ghost-button" type="button" onClick={copy}>
          复制邀约话术
        </button>
      </div>
      <List title="可能爽约原因" items={card.possibleReasons} />
      <List title="邀约前建议动作" items={card.preInviteActions} />
      <div className="invitation-script">
        <strong>AI生成邀约话术</strong>
        <p>{card.invitationScript}</p>
      </div>
    </section>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4>{title}</h4>
      <ul className="clean-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
