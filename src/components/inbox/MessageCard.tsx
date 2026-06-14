import { motion } from 'framer-motion';
import { Clock, Paperclip } from 'lucide-react';
import type { SimulationMessage } from '../../types';
import { SenderAvatar } from './SenderAvatar';
import { UrgencyBadge } from './UrgencyBadge';
import { ActionBar } from './ActionBar';

interface MessageCardProps {
  message: SimulationMessage;
  isSelected: boolean;
  isNew: boolean;
  showInlineActions?: boolean;
  onSelect: (id: string) => void;
  onAction: (type: import('../../types').SimulationActionType, payload?: { content?: string; quickReplyTemplateId?: string; delegateTarget?: string; deferReason?: string }) => void;
}

function getRelativeTime(iso: string | undefined): string {
  if (!iso) return '即将到达';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 10000) return '刚刚';
  if (diff < 60000) return `${Math.floor(diff / 1000)}秒前`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function hasMention(content: string): boolean {
  return /@你|@候选人|@我/.test(content);
}

export function MessageCard({ message, isSelected, isNew, showInlineActions = true, onSelect, onAction }: MessageCardProps) {
  const timeLabel = getRelativeTime(message.actualArrivalIso);
  const isMention = hasMention(message.content);

  // Determine CSS class based on state
  let cardClass = 'sim-msg-card';
  if (isNew && !message.handled) cardClass += ' sim-msg-card--unread';
  if (isSelected) cardClass += ' sim-msg-card--selected';
  if (isMention) cardClass += ' sim-msg-card--mention';
  if (message.handled) cardClass += ' sim-msg-card--handled';

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`${message.sender.name}: ${message.subject}${message.handled ? ' (已处理)' : ''}${isNew ? ' (新消息)' : ''}`}
      aria-expanded={isSelected}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(message.id); } }}
      initial={isNew ? { opacity: 0, x: 20, scale: 0.97 } : false}
      animate={isNew ? { opacity: 1, x: 0, scale: 1 } : { opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      onClick={() => onSelect(message.id)}
      className={cardClass}
      style={{
        cursor: 'pointer',
        marginBottom: 6,
        boxShadow: isNew && !message.handled ? '0 0 0 1px var(--sim-accent)' : undefined,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <SenderAvatar initials={message.sender.avatarInitials} role={message.sender.role} size={32} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 'var(--sim-text-base)', fontWeight: 600, color: 'var(--sim-ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {message.sender.name}
              {message.sender.department && (
                <span style={{ fontSize: 'var(--sim-text-xs)', fontWeight: 400, color: 'var(--sim-ink-dim)' }}>· {message.sender.department}</span>
              )}
              {isMention && (
                <span style={{ fontSize: 10, fontWeight: 600, color: '#D97706', background: '#FFFBEB', padding: '1px 6px', borderRadius: 'var(--cr-radius-full)' }}>@你</span>
              )}
            </div>
            <div style={{ fontSize: 10, color: 'var(--sim-ink-dim)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
              <Clock size={9} /> {timeLabel}
            </div>
          </div>
        </div>
        <UrgencyBadge tier={message.urgency} size="sm" />
      </div>

      {/* Subject + Preview */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 'var(--sim-text-md)', fontWeight: 600, color: 'var(--sim-ink)', marginBottom: 3 }}>{message.subject}</div>
        <p style={{ fontSize: 'var(--sim-text-base)', color: 'var(--sim-ink-soft)', lineHeight: 1.6, margin: 0 }}>
          {isSelected ? message.content : message.content.slice(0, 80) + (message.content.length > 80 ? '...' : '')}
        </p>
      </div>

      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
          {message.attachments.map((att, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 'var(--cr-radius-full)', background: 'var(--sim-bg)', fontSize: 10, color: 'var(--sim-ink-dim)' }}>
              <Paperclip size={9} /> {att.label}
            </span>
          ))}
        </div>
      )}

      {/* Handled indicator */}
      {message.handled && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E' }} />
          <span style={{ fontSize: 10, color: '#16A34A', fontWeight: 500 }}>已处理</span>
        </div>
      )}

      {/* Emoji reaction bar (hover, non-functional visual) */}
      <div style={{ display: 'flex', gap: 6, marginTop: 8, opacity: 0.35, fontSize: 14, pointerEvents: 'none', userSelect: 'none' }}>
        <span>👍</span><span>👏</span><span>✅</span><span>🔥</span><span>💯</span>
      </div>

      {/* Inline action bar — only when selected, not handled, and no detail panel visible */}
      {isSelected && !message.handled && showInlineActions && (
        <ActionBar message={message} onAction={onAction} />
      )}
    </motion.div>
  );
}
