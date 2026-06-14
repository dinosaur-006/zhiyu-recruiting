import { Footprints } from 'lucide-react';
import { Panel } from './Panel';
import type { TrialReplayEvent } from '../types';

export function TrialReplayPanel({ events }: { events: TrialReplayEvent[] }) {
  return (
    <Panel eyebrow="Evidence Replay" title="云试岗路径回放" subtitle="候选人看过什么、选择过什么、主动问过什么">
      <div className="replay-timeline">
        {events.map((e) => (
          <div key={e.id} className="replay-item">
            <div className="replay-item-time"><Footprints size={13} /> {e.timeLabel}</div>
            <div className="replay-item-label">{e.label}</div>
            <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-muted)' }}>{e.type}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
