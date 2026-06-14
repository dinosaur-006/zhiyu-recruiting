import { Target, Search, HelpCircle, MessageSquare, AlertTriangle } from 'lucide-react';
import { Panel } from './Panel';
import type { InterviewBattleCard } from '../types';

const ICONS: Record<string, React.ReactNode> = { '本次面试目标': <Target size={14} />, '重点追问': <Search size={14} />, '需要澄清': <HelpCircle size={14} />, '需要补充介绍': <MessageSquare size={14} />, '不建议问的问题': <AlertTriangle size={14} /> };

export function InterviewBattleCardPanel({ card }: { card: InterviewBattleCard }) {
  return (
    <Panel eyebrow="Interview Battle Card" title="HR面试作战卡" tint="navy">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <BS icon={ICONS['本次面试目标']} title="本次面试目标" items={card.interviewGoals} />
        <BS icon={ICONS['重点追问']} title="重点追问" items={card.keyQuestions} ordered />
        <BS icon={ICONS['需要澄清']} title="需要澄清" items={card.needsClarification} />
        <BS icon={ICONS['需要补充介绍']} title="需要补充介绍" items={card.shouldExplain} />
        <div style={{ background: 'var(--color-negative-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(220,38,38,0.15)' }}>
          <BS icon={ICONS['不建议问的问题']} title="不建议问的问题" items={card.shouldAvoidAsking} />
        </div>
      </div>
    </Panel>
  );
}
function BS({ icon, title, items, ordered }: { icon: React.ReactNode; title: string; items: string[]; ordered?: boolean }) {
  return (
    <div className="battle-card-section">
      <div className="battle-card-icon" style={{ background: 'var(--color-secondary-subtle)', color: 'var(--color-secondary)' }}>{icon}</div>
      <div style={{ flex: 1 }}><h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 var(--space-2)' }}>{title}</h4>
        {ordered ? <ol style={{ padding: '0 0 0 18px', margin: 'var(--space-1) 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-ink-soft)', lineHeight: 'var(--leading-body)' }}>{items.map((i) => <li key={i}>{i}</li>)}</ol>
                 : <ul className="clean-list">{items.map((i) => <li key={i}>{i}</li>)}</ul>}
      </div>
    </div>
  );
}
