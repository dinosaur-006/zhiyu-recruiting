import { motion } from 'framer-motion';
import { ArrowRight, Coffee, Users, Code, MessageCircle, Calendar } from 'lucide-react';
import type { Job } from '../../types';

interface DayInLifePreviewProps {
  job: Job;
  onComplete: () => void;
}

/**
 * Replaces EnvironmentBlueprint — shows a warm day-in-the-life preview
 * instead of a military-style "environment blueprint".
 */
export function DayInLifePreview({ job, onComplete }: DayInLifePreviewProps) {
  const moments = [
    { icon: Coffee, time: '09:30', text: '早会后和团队成员同步昨日进展，确认今天的优先级' },
    { icon: Code, time: '10:00', text: `开始${job.title}的核心工作，处理需求和代码` },
    { icon: MessageCircle, time: '14:00', text: '与产品和设计同学讨论方案，对齐需求细节' },
    { icon: Users, time: '16:00', text: '参与团队Code Review或技术分享' },
    { icon: Calendar, time: '17:30', text: '回顾今日产出，规划明天的工作重点' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <span className="cr-eyebrow">一日预览</span>
        <p style={{ fontSize: 14, color: 'var(--cr-ink-dim)', lineHeight: 1.6, margin: 0 }}>
          以下是{job.title}岗位的一个典型工作日。这不是固定的日程，而是让你感受工作节奏和日常氛围。
        </p>
      </div>

      <div style={{ position: 'relative', paddingLeft: 28 }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute', left: 13, top: 20, bottom: 20,
          width: 2, background: 'linear-gradient(to bottom, var(--cr-accent), var(--cr-border))',
          borderRadius: 1,
        }} />

        {moments.map((moment, i) => {
          const Icon = moment.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12, duration: 0.35 }}
              style={{
                position: 'relative', marginBottom: i < moments.length - 1 ? 20 : 0,
                display: 'flex', gap: 14, alignItems: 'flex-start',
              }}
            >
              {/* Timeline dot */}
              <div style={{
                position: 'absolute', left: -21, top: 4,
                width: 10, height: 10, borderRadius: '50%',
                background: i === 0 ? 'var(--cr-accent)' : 'var(--cr-border)',
                border: `2px solid ${i === 0 ? 'var(--cr-accent-subtle)' : 'var(--cr-surface)'}`,
                boxShadow: i === 0 ? '0 0 0 4px var(--cr-accent-glow)' : 'none',
                zIndex: 1,
              }} />

              <div style={{
                width: 36, height: 36, borderRadius: 'var(--cr-radius-sm)',
                background: 'var(--cr-subtle)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={16} strokeWidth={1.5} style={{ color: 'var(--cr-ink-dim)' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--cr-muted)', marginBottom: 2, fontFamily: 'var(--cr-font-mono)' }}>
                  {moment.time}
                </div>
                <div style={{ fontSize: 14, color: 'var(--cr-ink-soft)', lineHeight: 1.6 }}>
                  {moment.text}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        style={{ textAlign: 'center', paddingTop: 8 }}
      >
        <button className="cr-btn-primary" onClick={onComplete}>
          听起来不错，进入下一步 <ArrowRight size={16} />
        </button>
      </motion.div>
    </div>
  );
}
