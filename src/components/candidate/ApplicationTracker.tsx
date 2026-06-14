import { motion } from 'framer-motion';
import { FileText, Eye, MessageCircle, Calendar, Award, Clock, CheckCircle2 } from 'lucide-react';

interface Stage {
  id: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  description: string;
  status: 'done' | 'current' | 'pending';
  timeframe: string;
}

const STAGES: Stage[] = [
  { id: 'submit', icon: FileText, label: '投递成功', description: '你的能力报告已提交', status: 'done', timeframe: '刚刚' },
  { id: 'review', icon: Eye, label: 'HR审阅中', description: 'HR正在查看你的报告', status: 'current', timeframe: '1-2个工作日' },
  { id: 'contact', icon: MessageCircle, label: '初步沟通', description: 'HR将通过电话与你联系', status: 'pending', timeframe: '2-3个工作日' },
  { id: 'interview', icon: Calendar, label: '面试安排', description: '约定面试时间和形式', status: 'pending', timeframe: '3-5个工作日' },
  { id: 'offer', icon: Award, label: 'Offer', description: '薪资沟通与offer发放', status: 'pending', timeframe: '1-2周' },
];

export function ApplicationTracker() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="cr-card" style={{ marginBottom: 'var(--cr-space-lg)' }}>
      <span className="cr-eyebrow">申请状态追踪</span>
      <h3 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 18, fontWeight: 600, color: 'var(--cr-ink)', margin: '4px 0 16px' }}>
        你的申请进度
      </h3>

      <div style={{ position: 'relative', paddingLeft: 28 }}>
        {/* Vertical timeline line */}
        <div style={{ position: 'absolute', left: 15, top: 18, bottom: 18, width: 2, background: 'var(--cr-border)', zIndex: 0 }} />

        {STAGES.map((stage, i) => {
          const StageIcon = stage.icon;
          const isDone = stage.status === 'done';
          const isCurrent = stage.status === 'current';
          const isPending = stage.status === 'pending';

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              style={{
                position: 'relative', zIndex: 1,
                display: 'flex', alignItems: 'flex-start', gap: 12,
                paddingBottom: i < STAGES.length - 1 ? 20 : 0,
                opacity: isPending ? 0.5 : 1,
              }}
            >
              {/* Timeline dot */}
              <div style={{
                position: 'absolute', left: -17, top: 4,
                width: isCurrent ? 14 : 10, height: isCurrent ? 14 : 10, borderRadius: '50%',
                background: isDone ? 'var(--cr-positive)' : isCurrent ? 'var(--cr-accent)' : 'var(--cr-border)',
                border: isCurrent ? '3px solid var(--cr-accent-subtle)' : '2px solid var(--cr-surface)',
                boxShadow: isCurrent ? '0 0 0 5px var(--cr-accent-glow)' : 'none',
                transition: 'all 0.3s ease', zIndex: 1,
              }} />

              <StageIcon size={18} strokeWidth={1.5} style={{
                color: isDone ? 'var(--cr-positive)' : isCurrent ? 'var(--cr-accent)' : 'var(--cr-muted)',
                flexShrink: 0, marginTop: 1,
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{
                    fontSize: 14, fontWeight: 600,
                    color: isDone ? 'var(--cr-positive)' : isCurrent ? 'var(--cr-ink)' : 'var(--cr-muted)',
                  }}>
                    {stage.label}
                  </span>
                  {isCurrent && (
                    <span style={{ padding: '1px 8px', borderRadius: 'var(--cr-radius-full)', background: 'var(--cr-accent)', color: '#fff', fontSize: 10, fontWeight: 600, animation: 'crPulse 1.5s ease infinite' }}>
                      进行中
                    </span>
                  )}
                  {isDone && <CheckCircle2 size={14} style={{ color: 'var(--cr-positive)' }} />}
                </div>
                <p style={{ fontSize: 12, color: 'var(--cr-ink-dim)', lineHeight: 1.5, margin: 0 }}>{stage.description}</p>
                <span style={{ fontSize: 11, color: 'var(--cr-muted)', fontFamily: 'var(--cr-font-mono)' }}>
                  <Clock size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  {stage.timeframe}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
