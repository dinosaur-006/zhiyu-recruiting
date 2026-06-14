import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

interface ResponseComposerProps {
  messageId: string;
  onSend: (text: string) => void;
  onCancel: () => void;
  placeholder?: string;
  maxLength?: number;
}

export function ResponseComposer({ messageId: _mid, onSend, onCancel, placeholder = '输入你的回复...', maxLength = 500 }: ResponseComposerProps) {
  const [text, setText] = useState('');
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const remaining = maxLength - text.length;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sendState !== 'idle') return;
    setSendState('sending');
    // Simulate network send delay
    setTimeout(() => {
      setSendState('sent');
      setTimeout(() => {
        onSend(trimmed);
        setText('');
        setSendState('idle');
      }, 400);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === 'Escape') onCancel();
  };

  const btnLabel = sendState === 'sending' ? '发送中...' : sendState === 'sent' ? '✓ 已发送' : '发送';
  const btnDisabled = sendState !== 'idle' || !text.trim();

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      style={{ overflow: 'hidden' }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={3}
        autoFocus
        disabled={sendState !== 'idle'}
        style={{
          width: '100%', padding: '10px 14px', resize: 'none',
          border: '1px solid var(--sim-border)', borderRadius: 'var(--sim-radius-md)',
          background: 'var(--sim-surface)', color: 'var(--sim-ink)',
          fontFamily: 'var(--sim-font)', fontSize: 'var(--sim-text-base)', lineHeight: 1.6,
          outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.15s',
          opacity: sendState !== 'idle' ? 0.6 : 1,
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--sim-accent)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--sim-border)'; }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: remaining < 50 ? '#EF4444' : 'var(--sim-ink-dim)', fontFamily: 'var(--sim-font-mono)' }}>{remaining}</span>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--sim-ink-dim)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--sim-font)' }}>取消</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, color: 'var(--sim-ink-dim)', opacity: 0.5 }}>Ctrl+Enter 发送 · Esc 取消</span>
          <button onClick={handleSend} disabled={btnDisabled}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 18px', fontSize: 13,
              borderRadius: 'var(--sim-radius-md)', border: 'none', cursor: btnDisabled ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--sim-font)', fontWeight: 600, color: '#fff',
              background: btnDisabled ? 'var(--sim-ink-dim)' : sendState === 'sent' ? '#22C55E' : 'var(--sim-accent)',
              transition: 'all 0.15s',
            }}>
            <Send size={13} /> {btnLabel}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
