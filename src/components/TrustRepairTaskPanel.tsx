import { markTrustRepairTaskHandled } from '../store/demoStore';
import type { TrustRepairTask } from '../types';
import { Badge } from './Badge';

export function TrustRepairTaskPanel({
  tasks,
  compact = false,
}: {
  tasks: TrustRepairTask[];
  compact?: boolean;
}) {
  const visibleTasks = compact ? tasks.filter((task) => !task.handledAt).slice(0, 4) : tasks;

  return (
    <section className={compact ? 'governance-panel compact-tasks' : 'story-block governance-panel'} id="trust-repair-tasks">
      <div className="pro-card-head">
        <div>
          <span className="eyebrow">Trust Repair Tasks</span>
          <h3>HR信任修复任务台</h3>
          <p>把信任缺口、沉默风险和承诺一致性问题转成可处理任务。</p>
        </div>
        <Badge tone="purple">{tasks.filter((task) => !task.handledAt).length}项待处理</Badge>
      </div>
      <div className="task-list">
        {visibleTasks.length === 0 ? (
          <div className="task-empty">当前没有待处理信任修复任务。</div>
        ) : (
          visibleTasks.map((task) => (
            <article key={task.id} className={task.handledAt ? 'repair-task handled' : 'repair-task'}>
              <div>
                <div className="task-title">
                  <strong>{task.title}</strong>
                  <Badge tone={task.handledAt ? 'green' : 'amber'}>{task.handledAt ? '已处理' : '待处理'}</Badge>
                </div>
                <p>{task.trigger}</p>
                <span>{task.source} · {task.candidateName}</span>
              </div>
              <div className="task-action">
                <p>{task.suggestedAction}</p>
                {!task.handledAt ? (
                  <button type="button" className="ghost-button tiny" onClick={() => markTrustRepairTaskHandled(task.id)}>
                    标记已处理
                  </button>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
