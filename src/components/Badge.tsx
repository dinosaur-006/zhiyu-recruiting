import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  tone?: 'blue' | 'purple' | 'green' | 'amber' | 'gray' | 'red';
}

export function Badge({ children, tone = 'gray' }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
