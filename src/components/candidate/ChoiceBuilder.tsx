import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import type { BranchChoice } from '../../types';

interface ChoiceBuilderProps {
  options: BranchChoice[];
  onExecute: (cards: BranchChoice[]) => void;
}

/**
 * Replaces TacticalCrucible — a card-based choice builder
 * with drag-to-select interaction and clear visual feedback.
 */
export function ChoiceBuilder({ options, onExecute }: ChoiceBuilderProps) {
  const [selectedCards, setSelectedCards] = useState<BranchChoice[]>([]);
  const builderRef = useRef<HTMLDivElement>(null);

  const toggleCard = (option: BranchChoice) => {
    setSelectedCards((prev) => {
      const exists = prev.find((c) => c.id === option.id);
      if (exists) return prev.filter((c) => c.id !== option.id);
      if (prev.length >= 3) return prev; // Max 3 cards
      return [...prev, option];
    });
  };

  const availableOptions = options.filter((opt) => !selectedCards.find((c) => c.id === opt.id));
  const hasCards = selectedCards.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ marginBottom: 4 }}>
        <span className="cr-eyebrow">构建你的选择</span>
        <p style={{ fontSize: 14, color: 'var(--cr-ink-dim)', lineHeight: 1.6, margin: 0 }}>
          从下方方案中选出你认为最合适的应对方式（最多3个），拖入构建区。
        </p>
      </div>

      {/* Builder zone */}
      <div
        ref={builderRef}
        style={{
          minHeight: 100,
          borderRadius: 'var(--cr-radius-lg)',
          border: `2px dashed ${hasCards ? 'var(--cr-accent)' : 'var(--cr-border)'}`,
          background: hasCards ? 'var(--cr-accent-subtle)' : 'var(--cr-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          flexWrap: 'wrap', padding: 20,
          transition: 'all 0.3s ease',
        }}
      >
        <AnimatePresence mode="popLayout">
          {selectedCards.length === 0 ? (
            <motion.p
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: 14, color: 'var(--cr-muted)', margin: 0 }}
            >
              点击下方方案卡片添加到此处
            </motion.p>
          ) : (
            selectedCards.map((card) => (
              <motion.div
                key={card.id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{
                  padding: '12px 16px', borderRadius: 'var(--cr-radius-md)',
                  background: 'var(--cr-surface)', border: '1px solid var(--cr-accent)',
                  fontSize: 14, fontWeight: 500, color: 'var(--cr-ink)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer', boxShadow: 'var(--cr-shadow-sm)',
                  position: 'relative',
                }}
                onClick={() => toggleCard(card)}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--cr-accent)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {selectedCards.indexOf(card) + 1}
                </span>
                {card.label}
                <X size={14} strokeWidth={1.5} style={{ color: 'var(--cr-muted)', marginLeft: 4 }} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Available options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--cr-muted)', fontWeight: 500 }}>
          可选方案 · {availableOptions.length} 个
        </span>
        {availableOptions.map((option, i) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            onClick={() => toggleCard(option)}
            className="cr-card"
            style={{
              width: '100%', textAlign: 'left', cursor: 'pointer',
              fontFamily: 'var(--cr-font-sans)', fontSize: 14,
              color: 'var(--cr-ink)', padding: 'var(--cr-space-lg) var(--cr-space-xl)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--cr-accent)';
              e.currentTarget.style.background = 'var(--cr-accent-subtle)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--cr-border)';
              e.currentTarget.style.background = 'var(--cr-surface)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--cr-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, color: 'var(--cr-muted)',
                flexShrink: 0, marginTop: 1,
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{option.label}</div>
                <div style={{ fontSize: 13, color: 'var(--cr-ink-dim)', lineHeight: 1.5 }}>{option.text}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Execute button */}
      {hasCards && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', paddingTop: 8 }}
        >
          <button
            className="cr-btn-primary"
            onClick={() => {
              onExecute(selectedCards);
              setSelectedCards([]);
            }}
          >
            <Zap size={16} />
            提交选择方案
          </button>
        </motion.div>
      )}
    </div>
  );
}
