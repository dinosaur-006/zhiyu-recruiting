import type { UrgencyTier } from '../../types';
import { Flame } from 'lucide-react';

const CONFIG: Record<UrgencyTier, { label: string; color: string; bg: string; icon?: boolean }> = {
  critical: { label: '紧急', color: '#DC2626', bg: '#FEF2F2', icon: true },
  high: { label: '重要', color: '#D97706', bg: '#FFFBEB' },
  medium: { label: '普通', color: '#2563EB', bg: '#EFF6FF' },
  low: { label: '信息', color: '#94A3B8', bg: '#F8FAFC' },
};

interface UrgencyBadgeProps { tier: UrgencyTier; size?: 'sm' | 'md'; }

export function UrgencyBadge({ tier, size = 'md' }: UrgencyBadgeProps) {
  const c = CONFIG[tier];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: size === 'sm' ? '2px 8px' : '3px 10px',
      borderRadius: 'var(--cr-radius-full)', fontSize: size === 'sm' ? 10 : 11,
      fontWeight: 600, color: c.color, background: c.bg,
      border: `1px solid ${c.color}22`, whiteSpace: 'nowrap',
      animation: tier === 'critical' ? 'crPulse 2s ease-in-out infinite' : 'none',
    }}>
      {c.icon && <Flame size={size === 'sm' ? 10 : 12} />}
      {c.label}
    </span>
  );
}
