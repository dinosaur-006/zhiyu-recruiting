import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, Clock, UserPlus, EyeOff, Check, X, Paperclip, MessageSquare } from 'lucide-react';
import type { SimulationMessage, SimulationActionType, QuickReplyTemplate } from '../../types';
import { SenderAvatar } from './SenderAvatar';
import { UrgencyBadge } from './UrgencyBadge';
import { QuickReplyChip } from './QuickReplyChip';
import { ResponseComposer } from './ResponseComposer';
import { getContextQuickReplies } from '../../mock/workdaySimMock';

interface DetailPanelProps {
  message: SimulationMessage | null;
  onAction: (messageId: string, type: SimulationActionType, payload?: { content?: string; quickReplyTemplateId?: string; delegateTarget?: string; deferReason?: string }) => void;
  onClose: () => void;
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

function getRelativeTime(iso: string | undefined): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 10000) return '刚刚';
  if (diff < 60000) return `${Math.floor(diff / 1000)}秒前`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

export function DetailPanel({ message, onAction, onClose }: DetailPanelProps) {
  const [activeAction, setActiveAction] = useState<SimulationActionType | null>(null);
  const [confirmIgnore, setConfirmIgnore] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

  if (!message) {
    return (
      <div className="sim-detail">
        <div className="sim-detail-empty">
          <MessageSquare size={32} style={{ opacity: 0.25, color: 'var(--sim-ink-dim)' }} />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--sim-ink-soft)', marginBottom: 4 }}>点击左侧消息查看详情</div>
            <div style={{ fontSize: 'var(--sim-text-xs)' }}>选择一条消息后，可以在这里查看完整内容并回复</div>
          </div>
        </div>
      </div>
    );
  }

  const templates = getContextQuickReplies(message);
  const showFeedback = (msg: string) => { setActionFeedback(msg); setTimeout(() => setActionFeedback(''), 1500); };

  const doAction = (type: SimulationActionType, payload?: Record<string, string>) => {
    onAction(message.id, type, payload as any);
    setActiveAction(null);
    setConfirmIgnore(false);
  };

  const handleQuickReply = (t: QuickReplyTemplate) => { doAction('reply', { content: t.text, quickReplyTemplateId: t.id }); showFeedback('✅ 已回复'); };
  const handleCustomReply = (text: string) => { doAction('reply', { content: text }); showFeedback('✅ 已回复'); };
  const handleDefer = (reason: string) => { doAction('defer', { deferReason: reason }); showFeedback('⏰ 已标记稍后'); };
  const handleDelegate = (target: string) => { doAction('delegate', { delegateTarget: target }); showFeedback(`📤 已转交 ${target}`); };
  const handleIgnore = () => {
    const needsConfirm = message.urgency === 'critical' || message.urgency === 'high';
    if (needsConfirm && !confirmIgnore) { setConfirmIgnore(true); setTimeout(() => setConfirmIgnore(false), 3000); return; }
    doAction('ignore');
    showFeedback(message.urgency === 'critical' ? '⚠️ 已忽略重要消息' : '已忽略');
  };

  const timeLabel = getRelativeTime(message.actualArrivalIso);

  return (
    <div className="sim-detail">
      {/* Header */}
      <div className="sim-detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <SenderAvatar initials={message.sender.avatarInitials} role={message.sender.role} size={36} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 'var(--sim-text-md)', fontWeight: 600, color: 'var(--sim-ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {message.sender.name}
              {message.sender.department && (
                <span style={{ fontSize: 'var(--sim-text-xs)', fontWeight: 400, color: 'var(--sim-ink-dim)' }}>· {message.sender.department}</span>
              )}
            </div>
            <div style={{ fontSize: 'var(--sim-text-xs)', color: 'var(--sim-ink-dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {timeLabel}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sim-ink-dim)', padding: 4, borderRadius: 'var(--sim-radius-sm)' }}>
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="sim-detail-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 'var(--sim-text-lg)', fontWeight: 600, color: 'var(--sim-ink)' }}>{message.subject}</div>
          <UrgencyBadge tier={message.urgency} size="sm" />
        </div>

        <p style={{ fontSize: 'var(--sim-text-base)', color: 'var(--sim-ink-soft)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
          {message.content}
        </p>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
            {message.attachments.map((att, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 'var(--cr-radius-full)', background: 'var(--sim-bg)', fontSize: 'var(--sim-text-xs)', color: 'var(--sim-ink-soft)' }}>
                <Paperclip size={10} /> {att.label}
              </span>
            ))}
          </div>
        )}

        {/* Handled status */}
        {message.handled && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, padding: '8px 12px', borderRadius: 'var(--sim-radius-md)', background: '#F0FDF4' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
            <span style={{ fontSize: 'var(--sim-text-xs)', color: '#16A34A', fontWeight: 500 }}>已处理</span>
          </div>
        )}

        {/* Action feedback */}
        <AnimatePresence>
          {actionFeedback && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginTop: 14, textAlign: 'center', padding: '6px 12px', borderRadius: 'var(--cr-radius-full)', background: 'var(--sim-accent-subtle)', color: 'var(--sim-accent)', fontSize: 'var(--sim-text-xs)', fontWeight: 600 }}>
              {actionFeedback}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky action bar */}
      {!message.handled && (
        <div className="sim-detail-actions" style={{ flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className={`sim-action-btn sim-action-btn--reply`}
              style={activeAction === 'reply' ? { borderColor: '#22C55E', color: '#16A34A', background: '#F0FDF4' } : {}}
              onClick={() => { setActiveAction(activeAction === 'reply' ? null : 'reply'); setConfirmIgnore(false); }}>
              <Reply size={14} /> 回复 <span style={{ fontSize: 9, opacity: 0.4, marginLeft: 2 }}>R</span>
            </button>
            <button className={`sim-action-btn sim-action-btn--defer`}
              style={activeAction === 'defer' ? { borderColor: '#F59E0B', color: '#D97706', background: '#FFFBEB' } : {}}
              onClick={() => { setActiveAction(activeAction === 'defer' ? null : 'defer'); setConfirmIgnore(false); }}>
              <Clock size={14} /> 稍后 <span style={{ fontSize: 9, opacity: 0.4, marginLeft: 2 }}>D</span>
            </button>
            <button className={`sim-action-btn sim-action-btn--delegate`}
              style={activeAction === 'delegate' ? { borderColor: '#8B5CF6', color: '#7C3AED', background: '#F5F3FF' } : {}}
              onClick={() => { setActiveAction(activeAction === 'delegate' ? null : 'delegate'); setConfirmIgnore(false); }}>
              <UserPlus size={14} /> 转发 <span style={{ fontSize: 9, opacity: 0.4, marginLeft: 2 }}>F</span>
            </button>
            <button className={`sim-action-btn sim-action-btn--ignore`}
              style={confirmIgnore ? { borderColor: '#EF4444', color: '#DC2626', background: '#FEF2F2' } : {}}
              onClick={handleIgnore}>
              <EyeOff size={14} /> {confirmIgnore ? '确认忽略？' : '忽略'}
            </button>
          </div>

          {/* Expandable sub-panels */}
          <AnimatePresence>
            {activeAction === 'reply' && (
              <motion.div key="reply" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 'var(--sim-text-xs)', color: 'var(--sim-ink-dim)', marginBottom: 6 }}>输入你的真实回复</div>
                  <ResponseComposer messageId={message.id} onSend={handleCustomReply} onCancel={() => setActiveAction(null)} placeholder="输入你的回复..." />
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--sim-border-light)' }}>
                    <div style={{ fontSize: 10, color: 'var(--sim-ink-dim)', marginBottom: 4 }}>快捷模板</div>
                    <QuickReplyChip templates={templates} onSelect={handleQuickReply} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeAction === 'defer' && (
              <motion.div key="defer" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DEFER_REASONS.map((r) => (
                    <motion.button key={r.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleDefer(r.label)}
                      style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', borderRadius: 'var(--sim-radius-md)', border: '1px solid #F59E0B', background: '#FFFBEB', color: '#D97706', fontSize: 'var(--sim-text-xs)', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sim-font)' }}>
                      <span>{r.icon}</span> {r.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeAction === 'delegate' && (
              <motion.div key="delegate" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginTop: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {TEAM_MEMBERS.map((tm) => (
                    <motion.button key={tm.name} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      onClick={() => handleDelegate(tm.name)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--sim-radius-md)', border: '1px solid var(--sim-border)', background: 'var(--sim-surface)', cursor: 'pointer', fontFamily: 'var(--sim-font)', textAlign: 'left', transition: 'all 0.12s' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: tm.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{tm.initials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 'var(--sim-text-base)', fontWeight: 600, color: 'var(--sim-ink)' }}>{tm.name}</div>
                        <div style={{ fontSize: 'var(--sim-text-xs)', color: 'var(--sim-ink-dim)' }}>{tm.role}</div>
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--sim-ink-dim)', background: 'var(--sim-bg)', padding: '2px 8px', borderRadius: 'var(--cr-radius-full)' }}>{tm.hint}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
