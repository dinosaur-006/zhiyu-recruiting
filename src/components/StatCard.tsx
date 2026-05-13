interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: string;
}

export function StatCard({ label, value, hint, trend }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">
        <span>{hint}</span>
        {trend ? <strong>{trend}</strong> : null}
      </div>
    </article>
  );
}
