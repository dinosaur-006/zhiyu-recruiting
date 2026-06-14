import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, Clock, UserPlus, EyeOff, Check } from 'lucide-react';
import type { SimulationActionType, SimulationMessage, QuickReplyTemplate } from '../../types';
import { QuickReplyChip } from './QuickReplyChip';
import { ResponseComposer } from './ResponseComposer';
import { getContextQuickReplies } from '../../mock/workdaySimMock';

interface ActionBarProps {
  message: SimulationMessage;
  onAction: (type: SimulationActionType, payload?: { content?: string; quickReplyTemplateId?: string; delegateTarget?: string; deferReason?: string }) => void;
  disabled?: boolean;
}

const DEFER_REASONS = [
  { id: 'more_urgent', label: '手头有更紧急的事', icon: '🔥' },
  { id: 'need_info', label: '需要更多信息', icon: '📋' },
  { id: 'after_meeting', label: '等会议后再处理', icon: '📅' },
];

const TEAM_MEMBERS = [
  { name: '林悦', role: '同级 · 研发部', hint: '技术协作、代码审查', initials: '林', color: '#6366F1' },
  { name: '小赵', role: '新人 · 研发部', hint: '简单任务、数据提取', initials: '赵', color: '#7C3AED' },
  { name: '周主管', role: '上级 · 研发部', hint: '需要决策权、客户投诉', initials: '周', color: '#059669' },
];

export function ActionBar({ message, onAction, disabled }: ActionBarProps) {
  const [activeAction, setActiveAction] = useState<SimulationActionType | null>(null);
  const [delegateTarget, setDelegateTarget] = useState('');
  const [confirmIgnore, setConfirmIgnore] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

  const templates = getContextQuickReplies(message);

  const showFeedback = (msg: string) => { setActionFeedback(msg); setTimeout(() => setActionFeedback(''), 1500); };
  const doAction = (type: SimulationActionType, payload?: Record<string, string>) => {
    try { onAction(type, payload); } catch (e) { console.warn('ActionBar:', e); }
    setActiveAction(null); setConfirmIgnore(false);
  };

  const handleQuickReply = (t: QuickReplyTemplate) => { doAction('reply', { content: t.text, quickReplyTemplateId: t.id }); showFeedback('✅ 已回复'); };
  const handleCustomReply = (text: string) => { doAction('reply', { content: text }); showFeedback('✅ 已回复'); };
  const handleDefer = (reason: string) => { doAction('defer', { deferReason: reason }); showFeedback('⏰ 已标记稍后'); };
  const handleDelegate = (target: string, role: string) => { doAction('delegate', { delegateTarget: target, delegateRole: role }); showFeedback(`📤 已转交 ${target}`); };
  const needsConfirm = message.urgency === 'critical' || message.urgency === 'high';
  const handleIgnore = () => {
    if (needsConfirm && !confirmIgnore) { setConfirmIgnore(true); setTimeout(() => setConfirmIgnore(false), 3000); return; }
    doAction('ignore'); showFeedback(message.urgency === 'critical' ? '⚠️ 已忽略重要消息' : '已忽略');
  };

  const ACTIONS = [
    { type: 'reply' as SimulationActionType, icon: Reply, label: '回复', color: '#22C55E' },
    { type: 'defer' as SimulationActionType, icon: Clock, label: '稍后', color: '#D97706' },
    { type: 'delegate' as SimulationActionType, icon: UserPlus, label: '转发', color: '#6366F1' },
    { type: 'ignore' as SimulationActionType, icon: EyeOff, label: confirmIgnore ? '确认忽略？' : '忽略', color: confirmIgnore ? '#DC2626' : '#94A3B8' },
  ];

  return (
    <div style={{ borderTop: '1px solid var(--sim-border-light)', paddingTop: 10, marginTop: 8 }}>
      {actionFeedback && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '4px 10px', borderRadius: 'var(--cr-radius-full)', background: 'var(--sim-accent-subtle)', color: 'var(--sim-accent)', fontSize: 11, fontWeight: 600, marginBottom: 6 }}>
          {actionFeedback}
        </motion.div>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        {ACTIONS.map((a) => (
          <motion.button key={a.type} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={disabled}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation(); setConfirmIgnore(false);
              if (a.type === 'reply') setActiveAction(activeAction === 'reply' ? null : 'reply');
              else if (a.type === 'delegate') setActiveAction(activeAction === 'delegate' ? null : 'delegate');
              else if (a.type === 'defer') setActiveAction(activeAction === 'defer' ? null : 'defer');
              else if (a.type === 'ignore') handleIgnore();
            }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              padding: '8px 12px', borderRadius: 'var(--sim-radius-md)',
              border: activeAction === a.type ? `1.5px solid ${a.color}` : '1px solid var(--sim-border)',
              background: activeAction === a.type ? `${a.color}0A` : 'var(--sim-surface)',
              color: activeAction === a.type ? a.color : 'var(--sim-ink-soft)',
              fontSize: 'var(--sim-text-sm)', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--sim-font)', opacity: disabled ? 0.5 : 1, transition: 'all 0.12s ease',
            }}>
            <a.icon size={14} strokeWidth={1.5} />{a.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {activeAction === 'reply' && (
          <motion.div key="reply" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div style={{ marginTop: 8, marginBottom: 6, fontSize: 11, color: 'var(--sim-ink-dim)' }}>
              输入你的真实回复（AI会基于回复质量评估沟通能力）
            </div>
            <ResponseComposer messageId={message.id} onSend={handleCustomReply} onCancel={() => setActiveAction(null)} placeholder="输入你的真实回复..." />
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--sim-border-light)' }}>
              <div style={{ fontSize: 10, color: 'var(--sim-ink-dim)', marginBottom: 4 }}>快捷模板（可选）</div>
              <QuickReplyChip templates={templates} onSelect={handleQuickReply} disabled={disabled} />
            </div>
          </motion.div>
        )}

        {activeAction === 'defer' && (
          <motion.div key="defer" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginTop: 8 }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DEFER_REASONS.map((r) => (
                <motion.button key={r.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleDefer(r.label)}
                  style={{
                    flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 4,
                    padding: '8px 12px', borderRadius: 'var(--sim-radius-md)',
                    border: '1px solid #F59E0B', background: '#FFFBEB',
                    color: '#D97706', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    fontFamily: 'var(--sim-font)',
                  }}>
                  <span>{r.icon}</span> {r.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {activeAction === 'delegate' && (
          <motion.div key="delegate" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginTop: 8 }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {TEAM_MEMBERS.map((tm) => (
                <motion.button key={tm.name} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => handleDelegate(tm.name, tm.role)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderRadius: 'var(--sim-radius-md)', border: '1px solid var(--sim-border)',
                    background: delegateTarget === tm.name ? `${tm.color}0A` : 'var(--sim-surface)',
                    cursor: 'pointer', fontFamily: 'var(--sim-font)', textAlign: 'left',
                    transition: 'all 0.12s ease',
                    borderColor: delegateTarget === tm.name ? tm.color : 'var(--sim-border)',
                  }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: tm.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{tm.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sim-ink)' }}>{tm.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--sim-ink-dim)' }}>{tm.role}</div>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--sim-ink-dim)', background: 'var(--sim-bg)', padding: '2px 8px', borderRadius: 'var(--cr-radius-full)' }}>{tm.hint}</span>
                  {delegateTarget === tm.name && <Check size={14} style={{ color: tm.color }} />}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
