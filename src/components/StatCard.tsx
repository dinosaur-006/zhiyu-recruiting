import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: string;
  icon?: LucideIcon;
}

export function StatCard({ label, value, hint, trend, icon: Icon }: StatCardProps) {
  const trendClass = trend
    ? trend.startsWith('+')
      ? 'kpi-trend up'
      : trend.startsWith('-')
        ? 'kpi-trend down'
        : 'kpi-trend neutral'
    : '';

  return (
    <article className="stat-card">
      {Icon ? (
        <div className="stat-icon-box">
          <Icon size={16} />
        </div>
      ) : null}
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">
        <span>{hint}</span>
        {trend ? <strong className={trendClass}>{trend}</strong> : null}
      </div>
    </article>
  );
}
