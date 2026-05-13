import type { ConcernRadar } from '../types';

interface ConcernRadarPanelProps {
  radar: ConcernRadar;
  title?: string;
}

const labels: Record<keyof ConcernRadar, string> = {
  salary: '薪资顾虑',
  commute: '通勤顾虑',
  growth: '成长顾虑',
  team: '团队氛围顾虑',
  workload: '工作节奏顾虑',
  roleClarity: '岗位职责顾虑',
};

export function ConcernRadarPanel({ radar, title = '候选人顾虑雷达' }: ConcernRadarPanelProps) {
  return (
    <section className="story-block concern-radar">
      <h3>{title}</h3>
      <div className="attention-map">
        {Object.entries(radar).map(([key, value]) => (
          <div key={key} className="attention-row">
            <span>{labels[key as keyof ConcernRadar]}</span>
            <div><i style={{ width: `${value}%` }} /></div>
            <strong>{value}%</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
