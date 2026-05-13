import { Badge } from './Badge';
import type { JobTruthLabel } from '../types';

interface JobTruthLabelPanelProps {
  label: JobTruthLabel;
  compact?: boolean;
  onFocusPoint?: (point: string) => void;
}

const scaleRows: Array<{ key: keyof Pick<JobTruthLabel, 'workPace' | 'collaborationDensity' | 'uncertainty' | 'autonomy' | 'growthSpeed' | 'communicationCost'>; label: string }> = [
  { key: 'workPace', label: '工作节奏' },
  { key: 'collaborationDensity', label: '协作密度' },
  { key: 'uncertainty', label: '不确定性' },
  { key: 'autonomy', label: '自主空间' },
  { key: 'growthSpeed', label: '成长速度' },
  { key: 'communicationCost', label: '沟通成本' },
];

export function JobTruthLabelPanel({ label, compact = false, onFocusPoint }: JobTruthLabelPanelProps) {
  const focus = (point: string) => {
    onFocusPoint?.(point);
  };

  return (
    <section className={compact ? 'truth-label compact' : 'truth-label'}>
      <div className="truth-label-head">
        <div>
          <span className="eyebrow">Job Truth Label</span>
          <h2>岗位真相标签</h2>
        </div>
        <Badge tone="amber">投递前先看岗位真相</Badge>
      </div>

      <div className="truth-nutrition">
        {scaleRows.map((row) => (
          <button key={row.key} type="button" onClick={() => focus(row.label)}>
            <span>{row.label}</span>
            <strong>{label[row.key]}</strong>
          </button>
        ))}
        <button type="button" className="wide" onClick={() => focus('加班波动')}>
          <span>加班波动</span>
          <strong>{label.overtimeVolatility}</strong>
        </button>
      </div>

      <TruthList title="压力来源" items={label.pressureSources} tone="amber" onFocusPoint={focus} />
      <TruthList title="适合人群" items={label.suitableFor} tone="green" onFocusPoint={focus} />
      <TruthList title="不太适合" items={label.notSuitableFor} tone="gray" onFocusPoint={focus} />

      <div className="truth-evidence-grid">
        <h3>可信来源</h3>
        {label.evidence.map((item) => (
          <article key={`${item.label}-${item.source}`} className="truth-evidence-item">
            <div>
              <strong>{item.label}</strong>
              <span>{item.value}</span>
            </div>
            <p>来源：{item.source}</p>
            <small>证据：{item.evidenceText}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function TruthList({
  title,
  items,
  tone,
  onFocusPoint,
}: {
  title: string;
  items: string[];
  tone: 'green' | 'amber' | 'gray';
  onFocusPoint: (point: string) => void;
}) {
  return (
    <div className="truth-list">
      <h3>{title}</h3>
      <div className="tag-row">
        {items.map((item) => (
          <button key={item} type="button" onClick={() => onFocusPoint(title)}>
            <Badge tone={tone}>{item}</Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
