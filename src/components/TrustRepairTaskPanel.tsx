import { CheckCircle2, AlertTriangle, MessageSquare, FileSearch, Shield } from 'lucide-react';
import { markTrustRepairTaskHandled } from '../store/demoStore';
import type { TrustRepairTask } from '../types';
import { Badge } from './Badge';
import { Panel } from './Panel';

const META: Record<string, { icon: typeof AlertTriangle; color: string; label: string }> = {
  '信任缺口': { icon: AlertTriangle, color: 'var(--color-negative)', label: '信任缺口' },
  '沉默风险': { icon: MessageSquare,  color: 'var(--color-warning)', label: '沉默风险' },
  '承诺一致性': { icon: FileSearch,     color: 'var(--color-secondary)', label: '承诺一致性' },
  'AI风险复核': { icon: Shield,         color: 'var(--color-positive)', label: 'AI风险复核' },
};

function badgeTone(s: string): 'red'|'amber'|'blue' { if (s === '信任缺口') return 'red'; if (s === '沉默风险') return 'amber'; return 'blue'; }

export function TrustRepairTaskPanel({ tasks, compact = false }: { tasks: TrustRepairTask[]; compact?: boolean }) {
  const pending = tasks.filter((t) => !t.handledAt);
  const visible = compact ? pending.slice(0, 4) : tasks;
  return (
    <Panel eyebrow="Trust Repair Tasks" title="HR信任修复任务台" subtitle="把信任缺口、沉默风险和承诺一致性问题转成可处理任务"
      badge={<Badge tone={pending.length > 0 ? 'amber' : 'green'}>{pending.length}项待处理</Badge>}>
      {visible.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-muted)', background: 'var(--color-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <CheckCircle2 size={28} strokeWidth={1.5} style={{ color: 'var(--color-positive)' }} /><p style={{ fontSize: 'var(--text-sm)', margin: 0 }}>当前没有待处理信任修复任务</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {visible.map((task) => {
            const m = META[task.source] ?? META['信任缺口'];
            const Icon = m.icon;
            return (
              <article key={task.id} className="repair-task-card card-lift" style={{ borderLeft: `4px solid ${m.color}`, opacity: task.handledAt ? 0.55 : 1 }}>
                <div className="repair-source-icon" style={{ background: `${m.color}18` }}><Icon size={20} style={{ color: m.color }} /></div>
                <div className="repair-task-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <span className="repair-task-title">{task.title}</span>
                    <Badge tone={task.handledAt ? 'green' : badgeTone(task.source)}>{task.handledAt ? '已处理' : '待处理'}</Badge>
                  </div>
                  <p className="repair-task-trigger">{task.trigger}</p>
                  <div className="repair-task-meta">
                    <span style={{ display: 'inline-flex', fontWeight: 500, padding: '2px var(--space-2)', borderRadius: 'var(--radius-full)', color: m.color, background: `${m.color}18` }}>{m.label}</span>
                    <span>{task.candidateName}</span>
                    {task.estimatedImpact.length > 0 && <span>· 预计影响：{task.estimatedImpact[0]}</span>}
                  </div>
                  <div className="repair-task-action" style={{ borderLeft: `3px solid ${m.color}` }}>{task.suggestedAction}</div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {task.handledAt
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-positive)', fontWeight: 500 }}><CheckCircle2 size={14} />已处理</span>
                    : <button className="cr-btn-primary" style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-4)' }} onClick={() => markTrustRepairTaskHandled(task.id)}>标记已处理</button>
                  }
                </div>
              </article>
            );
          })}
          {compact && pending.length > 4 && (
            <div style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-muted)', padding: 'var(--space-3) 0' }}>
              +{pending.length - 4} 项更多待处理任务
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
