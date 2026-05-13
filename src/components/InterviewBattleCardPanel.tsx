import type { InterviewBattleCard } from '../types';

interface InterviewBattleCardPanelProps {
  card: InterviewBattleCard;
}

export function InterviewBattleCardPanel({ card }: InterviewBattleCardPanelProps) {
  return (
    <section className="story-block pro-card battle-card">
      <span className="eyebrow">Interview Battle Card</span>
      <h3>HR面试作战卡</h3>
      <BattleList title="本次面试目标" items={card.interviewGoals} />
      <BattleList title="重点追问" items={card.keyQuestions} ordered />
      <BattleList title="需要澄清" items={card.needsClarification} />
      <BattleList title="需要补充介绍" items={card.shouldExplain} />
      <BattleList title="不建议问的问题" items={card.shouldAvoidAsking} />
    </section>
  );
}

function BattleList({ title, items, ordered = false }: { title: string; items: string[]; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <div>
      <h4>{title}</h4>
      <Tag className={ordered ? 'story-list ordered' : 'clean-list'}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </Tag>
    </div>
  );
}
