import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import type { BranchChoice } from '../types';

interface TacticalCrucibleProps {
  options: BranchChoice[];
  onExecute: (cards: BranchChoice[]) => void;
}

export function TacticalCrucible({ options, onExecute }: TacticalCrucibleProps) {
  const [crucibleCards, setCrucibleCards] = useState<BranchChoice[]>([]);
  const crucibleRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (_: unknown, info: { point: { x: number; y: number } }, option: BranchChoice) => {
    if (!crucibleRef.current) return;
    const rect = crucibleRef.current.getBoundingClientRect();
    const hit =
      info.point.x >= rect.left && info.point.x <= rect.right &&
      info.point.y >= rect.top && info.point.y <= rect.bottom;

    if (hit && crucibleCards.length < 3 && !crucibleCards.find((c) => c.id === option.id)) {
      setCrucibleCards([...crucibleCards, option]);
    }
  };

  const removeCard = (id: string) => {
    setCrucibleCards(crucibleCards.filter((c) => c.id !== id));
  };

  const handleExecute = () => {
    if (crucibleCards.length === 0) return;
    onExecute(crucibleCards);
    setCrucibleCards([]);
  };

  const arsenalCards = options.filter((opt) => !crucibleCards.find((c) => c.id === opt.id));
  const hasCards = crucibleCards.length > 0;

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid var(--color-border)', paddingTop: 16, userSelect: 'none' }}>
      {/* ═══ 战术构建区 ═══ */}
      <div
        ref={crucibleRef}
        style={{
          position: 'relative', width: '100%', minHeight: 120,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap',
          padding: 16,
          border: `1px dashed ${hasCards ? 'var(--color-accent)' : '#3D4550'}`,
          background: hasCards
            ? 'var(--color-accent-subtle)'
            : '#0B0D11',
          boxShadow: hasCards ? 'inset 0 0 30px rgba(201,169,110,0.08)' : 'none',
          transition: 'background 0.5s, border-color 0.5s, box-shadow 0.5s',
        }}
      >
        {/* 点阵背景 */}
        <div
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.15,
            backgroundImage: 'radial-gradient(circle, var(--color-accent) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {!hasCards && (
          <span style={{
            fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
            color: '#718096', letterSpacing: '0.08em',
            animation: 'pulseGlow 2s ease infinite',
          }}>
            [ 战术构建区 ] // 拖拽策略卡至此进行构筑 (MAX:3)
          </span>
        )}

        <AnimatePresence>
          {crucibleCards.map((card, idx) => (
            <motion.div
              key={`c-${card.id}`}
              className="crucible-card"
              initial={{ opacity: 0, scale: 0.8, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -16 }}
              onClick={() => removeCard(card.id)}
              style={{
                position: 'relative', zIndex: 10, width: 140, padding: '10px 12px',
                background: '#16181D', border: '1px solid var(--color-accent)',
                boxShadow: '0 0 15px rgba(201,169,110,0.2)',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ fontSize: 9, color: 'var(--color-accent)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
                槽位_{idx + 1} {idx === 0 ? '[主策略]' : '[辅助]'}
              </div>
              <div style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 500, lineHeight: 1.4 }}>
                {card.label}. {card.text.slice(0, 20)}{card.text.length > 20 ? '…' : ''}
              </div>
              {/* 删除按钮 */}
              <div style={{
                position: 'absolute', top: -8, right: -8,
                width: 20, height: 20, borderRadius: '50%',
                background: '#E53E3E', color: '#fff',
                fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.15s',
              }}
                className="crucible-remove-btn"
              >
                ×
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ═══ STATUS + EXECUTE ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 16 }}>
        <span style={{
          fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.06em', color: hasCards ? 'var(--color-accent)' : '#A0AEC0',
        }}>
          {hasCards
            ? `▸ 策略已锁定 // ${crucibleCards.length} 张策略卡`
            : '▸ 等待装填...'}
        </span>
        <button
          onClick={handleExecute}
          disabled={!hasCards}
          style={{
            padding: '8px 20px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.08em', fontWeight: 600,
            background: 'transparent',
            border: hasCards ? '1px solid var(--color-accent)' : '1px solid #4A5568',
            color: hasCards ? 'var(--color-accent)' : '#4A5568',
            boxShadow: hasCards ? '0 0 15px rgba(201,169,110,0.3)' : 'none',
            cursor: hasCards ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={(e) => {
            if (hasCards) { e.currentTarget.style.background = 'var(--color-accent)'; e.currentTarget.style.color = '#16181D'; }
          }}
          onMouseLeave={(e) => {
            if (hasCards) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-accent)'; }
          }}
        >
          [ 执行方案 ]
        </button>
      </div>

      {/* ═══ ARSENAL ═══ */}
      <div style={{
        fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.08em', color: '#718096',
        borderBottom: '1px solid var(--color-border)', paddingBottom: 6, marginBottom: 12,
        textTransform: 'uppercase',
      }}>
        ════════════ 策略卡组（手牌区） ════════════
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {arsenalCards.map((option) => (
          <motion.div
            key={`arsenal-${option.id}`}
            drag
            dragSnapToOrigin
            dragElastic={0.1}
            onDragStart={() => useChatStore.getState().stopGhostTimer()}
            onDragEnd={(e, info) => handleDragEnd(e, info, option)}
            whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
            style={{
              width: 140, padding: '10px 12px',
              background: '#0F1115', border: '1px solid #4A5568',
              cursor: 'grab', fontFamily: 'inherit',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#718096'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#4A5568'; }}
          >
            <div style={{ fontSize: 9, color: '#A0AEC0', fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
              {option.analysis.executionStyle || 'TACTIC'}
            </div>
            <div style={{ fontSize: 12, color: '#718096', fontWeight: 500, lineHeight: 1.4 }}>
              {option.label}. {option.text}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 4, fontStyle: 'italic', lineHeight: 1.4 }}>
              展示：{option.analysis.collaboration} · 风险{option.analysis.riskAwareness}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
