import { Calendar, Clock, DollarSign, TrendingUp, Users, Target } from 'lucide-react';
import type { ReverseQuestionType } from '../../types';

const ICON_MAP: Record<ReverseQuestionType, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  '工作节奏': Clock,
  '薪资福利': DollarSign,
  '团队氛围': Users,
  '成长空间': TrendingUp,
  '岗位挑战': Target,
  '面试流程': Calendar,
};

interface QuestionChipProps {
  type: ReverseQuestionType;
  onClick: (type: ReverseQuestionType) => void;
}

export function QuestionChip({ type, onClick }: QuestionChipProps) {
  const Icon = ICON_MAP[type];

  return (
    <button
      onClick={() => onClick(type)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--cr-space-sm)',
        padding: '10px 18px',
        borderRadius: 'var(--cr-radius-full)',
        border: '1.5px solid var(--cr-border)',
        background: 'var(--cr-surface)',
        color: 'var(--cr-ink-soft)',
        fontSize: 14,
        fontWeight: 500,
        fontFamily: 'var(--cr-font-sans)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--cr-accent)';
        e.currentTarget.style.color = 'var(--cr-accent)';
        e.currentTarget.style.background = 'var(--cr-accent-subtle)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--cr-border)';
        e.currentTarget.style.color = 'var(--cr-ink-soft)';
        e.currentTarget.style.background = 'var(--cr-surface)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {Icon && <Icon size={15} strokeWidth={1.5} />}
      {type}
    </button>
  );
}
