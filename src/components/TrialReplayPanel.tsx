import type { TrialReplayEvent } from '../types';

export function TrialReplayPanel({ events }: { events: TrialReplayEvent[] }) {
  return (
    <div className="story-block replay-panel">
      <span className="eyebrow">Evidence Replay</span>
      <h3>云试岗路径回放</h3>
      <p>让HR看到AI辅助建议从哪里来：候选人看过什么、选择过什么、主动问过什么。</p>
      <div className="replay-timeline">
        {events.map((event) => (
          <div key={event.id} className="replay-item">
            <time>{event.timeLabel}</time>
            <div>
              <strong>{event.label}</strong>
              <span>{event.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
