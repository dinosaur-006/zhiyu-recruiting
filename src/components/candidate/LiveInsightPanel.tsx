import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Brain, MessageSquare, Target, Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface InsightEntry {
  id: string;
  type: 'observation' | 'analysis' | 'question' | 'transparency';
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  text: string;
  time: string;
  color: string;
}

/**
 * LiveInsightPanel — Transparent AI observation log.
 * Shows candidates what the AI is observing in real-time during the trial.
 * Designed to BUILD trust by making AI operations visible, not creepy.
 *
 * In production, this would be fed by server-sent events from the AI backend.
 * For now, it simulates with demo entries based on user actions.
 */
export function LiveInsightPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [entries, setEntries] = useState<InsightEntry[]>([]);
  const [hasNewEntry, setHasNewEntry] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Track whether entries have been seeded to avoid StrictMode double-mount
  const seeded = useRef(false);

  // Simulate AI observations on mount
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;

    const ts = Date.now();
    const demoEntries: InsightEntry[] = [
      {
        id: `t-${ts}`, type: 'transparency',
        icon: Shield,
        text: 'AI 已启动。本次对话内容仅用于生成能力画像，不会分析你的外貌、情绪或声音特征。',
        time: '刚刚',
        color: '#2563EB',
      },
      {
        id: `o-${ts}`, type: 'observation',
        icon: Eye,
        text: '正在观察：你在岗位情报中关注了哪些信息板块',
        time: '10秒前',
        color: '#059669',
      },
    ];

    // Stagger entry reveals
    demoEntries.forEach((entry, i) => {
      setTimeout(() => {
        setEntries((prev) => [...prev, entry]);
        setHasNewEntry(true);
        setTimeout(() => setHasNewEntry(false), 2000);
      }, i * 800);
    });

    // Add more entries over time to simulate real-time activity
    const timers: NodeJS.Timeout[] = [];
    const laterEntries: InsightEntry[] = [
      {
        id: `a-${ts}`, type: 'analysis',
        icon: Brain,
        text: '已记录：你对"成长路径"板块表现出了较高的关注',
        time: '30秒前',
        color: '#6366F1',
      },
      {
        id: `q-${ts}`, type: 'question',
        icon: MessageSquare,
        text: '已记录：你提出了一个关于工作节奏的问题',
        time: '1分钟前',
        color: '#D97706',
      },
      {
        id: `t2-${ts}`, type: 'transparency',
        icon: Shield,
        text: '提醒：你的所有回答都会被HR人工复核。AI不会独立做出招聘决定。',
        time: '2分钟前',
        color: '#2563EB',
      },
      {
        id: `o2-${ts}`, type: 'observation',
        icon: Target,
        text: '已记录：你在场景选择中展现了协作优先的倾向',
        time: '3分钟前',
        color: '#059669',
      },
    ];

    laterEntries.forEach((entry, i) => {
      const t = setTimeout(() => {
        setEntries((prev) => [...prev, entry]);
        setHasNewEntry(true);
        setTimeout(() => setHasNewEntry(false), 2000);
      }, 3000 + i * 2000);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  // Auto-scroll to latest
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [entries.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="cr-card"
      style={{
        padding: 0,
        overflow: 'hidden',
        borderLeft: '3px solid var(--cr-info)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--cr-space-lg) var(--cr-space-xl)',
          border: 'none', background: 'var(--cr-info-bg)',
          cursor: 'pointer', fontFamily: 'var(--cr-font-sans)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            animate={hasNewEntry ? { scale: [1, 1.2, 1] } : {}}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: hasNewEntry ? 'var(--cr-info)' : 'var(--cr-border)',
              boxShadow: hasNewEntry ? '0 0 8px var(--cr-info)' : 'none',
            }}
          />
          <span style={{
            fontSize: 13, fontWeight: 600, color: 'var(--cr-info)',
          }}>
            AI 正在学习什么
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, color: 'var(--cr-muted)',
            fontFamily: 'var(--cr-font-mono)',
          }}>
            {entries.length} 条记录
          </span>
          {isExpanded
            ? <ChevronUp size={16} strokeWidth={1.5} style={{ color: 'var(--cr-muted)' }} />
            : <ChevronDown size={16} strokeWidth={1.5} style={{ color: 'var(--cr-muted)' }} />
          }
        </div>
      </button>

      {/* Entry list */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            ref={listRef}
            style={{
              maxHeight: 280,
              overflowY: 'auto',
              padding: 'var(--cr-space-md) 0',
            }}
          >
            {entries.length === 0 ? (
              <div style={{
                padding: 'var(--cr-space-2xl)', textAlign: 'center',
                color: 'var(--cr-muted)', fontSize: 13,
              }}>
                开始实境体验后，这里会透明展示AI的观察记录
              </div>
            ) : (
              entries.map((entry) => {
                const EntryIcon = entry.icon;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '8px var(--cr-space-xl)',
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: 'var(--cr-radius-sm)',
                      background: `${entry.color}12`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 1,
                    }}>
                      <EntryIcon size={12} strokeWidth={1.5} style={{ color: entry.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 12, color: 'var(--cr-ink-soft)',
                        lineHeight: 1.5, margin: 0,
                      }}>
                        {entry.text}
                      </p>
                      <span style={{
                        fontSize: 10, color: 'var(--cr-muted)',
                        fontFamily: 'var(--cr-font-mono)',
                      }}>
                        {entry.time}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
