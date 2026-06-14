import { motion } from 'framer-motion';

interface ChoiceCardProps {
  id: string;
  label: string;
  text: string;
  selected?: boolean;
  onSelect: (id: string) => void;
  index: number;
}

export function ChoiceCard({ id, label, text, selected = false, onSelect, index }: ChoiceCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      onClick={() => onSelect(id)}
      className={`cr-card${selected ? ' cr-card-accent' : ''}`}
      style={{
        width: '100%',
        textAlign: 'left',
        fontFamily: 'var(--cr-font-sans)',
        cursor: 'pointer',
        padding: 'var(--cr-space-xl)',
        borderColor: selected ? 'var(--cr-accent)' : 'var(--cr-border)',
        background: selected ? 'var(--cr-accent-subtle)' : 'var(--cr-surface)',
        transition: 'all 0.2s ease',
      }}
      aria-pressed={selected}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--cr-space-md)' }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: `2px solid ${selected ? 'var(--cr-accent)' : 'var(--cr-border)'}`,
          background: selected ? 'var(--cr-accent)' : 'transparent',
          color: selected ? '#fff' : 'var(--cr-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0,
          transition: 'all 0.2s ease',
        }}>
          {String.fromCharCode(65 + index)}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 13, color: 'var(--cr-ink-dim)', lineHeight: 1.6 }}>{text}</div>
        </div>
      </div>
    </motion.button>
  );
}
