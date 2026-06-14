import type { ReactNode } from 'react';

interface BadgeProps {
  children?: ReactNode;
  tone?: 'blue' | 'purple' | 'green' | 'amber' | 'gray' | 'red';
  dot?: boolean;
  dotOnly?: boolean;
}

const DOT_TONE_CLASS: Record<string, string> = {
  green: 'dot-green',
  amber: 'dot-amber',
  red: 'dot-red',
  blue: 'dot-accent',
  purple: 'dot-accent',
  gray: 'dot-accent',
};

export function Badge({ children, tone = 'gray', dot = false, dotOnly = false }: BadgeProps) {
  const hasText = children != null && children !== '';
  const showDot = dot || dotOnly;
  const classNames = [
    dotOnly && !hasText ? '' : 'badge',
    dotOnly && !hasText ? '' : `badge-${tone}`,
    showDot ? 'badge-dot' : '',
    showDot ? DOT_TONE_CLASS[tone] ?? 'dot-accent' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames} style={{ fontSize: 'var(--text-base)' }}>
      {!dotOnly || hasText ? children : null}
    </span>
  );
}
