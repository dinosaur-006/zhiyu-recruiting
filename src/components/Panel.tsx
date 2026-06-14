import type { ReactNode } from 'react';

type PanelTint = 'green' | 'amber' | 'red' | 'blue' | 'navy';
const TINTS: Record<PanelTint, string> = { green: 'tint-green', amber: 'tint-amber', red: 'tint-red', blue: 'tint-blue', navy: 'tint-navy' };

interface PanelProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  badge?: ReactNode;
  tint?: PanelTint;
}

export function Panel({ eyebrow, title, subtitle, children, badge, tint }: PanelProps) {
  const cls = ['panel'];
  if (tint) cls.push('panel-tinted', TINTS[tint]);
  return (
    <section className={cls.join(' ')}>
      <div className="pro-card-head">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {badge}
      </div>
      {children}
    </section>
  );
}
