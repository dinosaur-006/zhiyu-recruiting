import { motion } from 'framer-motion';
import type { QuickReplyTemplate } from '../../types';

const TONE_COLORS: Record<string, string> = { assertive: '#059669', collaborative: '#6366F1', neutral: '#64748B', deferring: '#D97706' };

interface QuickReplyChipProps {
  templates: QuickReplyTemplate[];
  onSelect: (t: QuickReplyTemplate) => void;
  disabled?: boolean;
}

export function QuickReplyChip({ templates, onSelect, disabled }: QuickReplyChipProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {templates.map((t, i) => (
        <motion.button
          key={t.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          disabled={disabled}
          onClick={() => onSelect(t)}
          style={{
            padding: '7px 14px', borderRadius: 'var(--cr-radius-full)',
            border: `1.5px solid ${TONE_COLORS[t.tone]}33`,
            background: 'var(--cr-surface)', color: TONE_COLORS[t.tone],
            fontSize: 12, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--cr-font-sans)', opacity: disabled ? 0.5 : 1,
            transition: 'box-shadow 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 2px 8px ${TONE_COLORS[t.tone]}22`; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
        >
          {t.label}
        </motion.button>
      ))}
    </div>
  );
}
