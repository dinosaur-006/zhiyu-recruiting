import { Panel } from './Panel';
import type { ConcernRadar } from '../types';

const LABELS: Record<keyof ConcernRadar, string> = {
  salary: '薪资顾虑', commute: '通勤顾虑', growth: '成长顾虑',
  team: '团队氛围顾虑', workload: '工作节奏顾虑', roleClarity: '岗位职责顾虑',
};

export function ConcernRadarPanel({ radar, title = '候选人顾虑雷达' }: { radar: ConcernRadar; title?: string }) {
  return (
    <Panel eyebrow="Concern Radar" title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {Object.entries(radar).map(([k, v]) => {
          const color = v < 40 ? 'var(--color-positive)' : v <= 70 ? 'var(--color-warning)' : 'var(--color-negative)';
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-soft)', width: 100, flexShrink: 0, textAlign: 'right' }}>{LABELS[k as keyof ConcernRadar]}</span>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--color-border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4, background: color, width: `${v}%`, transition: 'width 0.6s' }} />
              </div>
              <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color, fontWeight: 600, width: 36 }}>{v}%</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
