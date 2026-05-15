import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { TrustRepairTaskPanel } from '../../components/TrustRepairTaskPanel';
import { useDemoState } from '../../store/demoStore';
import type { RealityReport, TrustRepairTask } from '../../types';

export function Dashboard() {
  const { jobs, candidates, metrics, realityReports, trustRepairTasks } = useDemoState();
  const latestCandidates = candidates.slice(0, 4);
  const completionRate = metrics.chatStarts ? Math.round((metrics.chatCompletions / metrics.chatStarts) * 100) : 0;
  const showRate = metrics.interviewInvites ? Math.round((metrics.attendedInterviews / metrics.interviewInvites) * 100) : 0;
  const trustHealth = metrics.recruitingTrustHealth;
  const priorityActions = buildPriorityActions(realityReports, trustRepairTasks).slice(0, 3);
  const leadAction = priorityActions[0];

  return (
    <main className="page decision-desk">
      <section className="decision-hero">
        <div className="decision-score">
          <span>招聘信任健康度</span>
          <strong>{trustHealth?.total ?? 0}</strong>
          <small>/100 · AI辅助估算</small>
        </div>
        <div className="decision-lead">
          <span className="eyebrow">Today’s Priority</span>
          <h1>{leadAction?.title ?? '今日暂无高优先级信任修复任务'}</h1>
          <p>{leadAction?.action ?? '保持清晰沟通节奏，继续查看候选人报告并完成人工复核。'}</p>
          <div className="header-actions">
            {leadAction ? (
              <Link className="primary-button" to={`/hr/candidates/${leadAction.candidateId}`}>
                查看候选人报告
              </Link>
            ) : null}
            <Link className="ghost-button" to="/hr/jobs/new">
              新建岗位真相舱
            </Link>
          </div>
        </div>
      </section>

      <section className="metadata-strip editorial-metadata">
        <MetaItem label="发布岗位" value={jobs.length} />
        <MetaItem label="云试岗完成率" value={`${completionRate}%`} />
        <MetaItem label="到面率" value={`${showRate}%`} />
        <MetaItem label="待修复任务" value={metrics.pendingTrustRepairTasks ?? 0} />
        <MetaItem label="高沉默风险" value={metrics.highSilenceRiskCandidates ?? 0} />
        <MetaItem label="审计完整率" value={`${metrics.auditCompletenessRate ?? 0}%`} />
      </section>

      <section className="decision-grid">
        <article className="panel action-brief">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Action Brief</span>
              <h2>今日 HR 该做什么</h2>
            </div>
            <Badge tone="blue">Top {priorityActions.length}</Badge>
          </div>
          <div className="action-brief-list">
            {priorityActions.map((item, index) => (
              <Link key={`${item.candidateName}-${item.title}-${index}`} to={`/hr/candidates/${item.candidateId}`} className="action-brief-row">
                <b>{index + 1}</b>
                <div>
                  <span>{item.candidateName} · {item.status}</span>
                  <strong>{item.title}</strong>
                  <p>{item.trigger}</p>
                  <em>{item.action}</em>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <aside className="decision-side">
          <article className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">Trust Notes</span>
                <h2>治理摘要</h2>
              </div>
            </div>
            <div className="health-grid compact-health">
              <div>
                <strong>强项</strong>
                {(trustHealth?.strengths ?? ['AI风险复核完整']).slice(0, 3).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <div>
                <strong>待优化</strong>
                {(trustHealth?.improvementItems ?? ['优先处理信任修复任务']).slice(0, 3).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </article>

          <article className="panel candidate-brief-list">
            <div className="panel-head">
              <div>
                <span className="eyebrow">Candidate Queue</span>
                <h2>候选人队列</h2>
              </div>
              <Link to="/hr/candidates">全部</Link>
            </div>
            <div className="candidate-list compact-list">
              {latestCandidates.map((candidate) => {
                const report = realityReports.find((item) => item.candidateId === candidate.id);
                return (
                  <Link key={candidate.id} to={`/hr/candidates/${candidate.id}`} className="list-row">
                    <div>
                      <strong>{candidate.name}</strong>
                      <span>{candidate.sourceChannel}</span>
                    </div>
                    <Badge tone={candidate.status === '已邀约' ? 'green' : 'blue'}>{candidate.status}</Badge>
                    <Badge tone={(report?.silenceRisk.possibleReasons.length ?? 0) >= 3 ? 'red' : 'purple'}>
                      沉默 {report?.silenceRisk.level ?? '待确认'}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </article>
        </aside>
      </section>

      <section className="panel dashboard-task-panel">
        <TrustRepairTaskPanel tasks={trustRepairTasks} compact />
      </section>
    </main>
  );
}

function MetaItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metadata-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function buildPriorityActions(reports: RealityReport[], tasks: TrustRepairTask[]) {
  const items: Array<{
    candidateId: string;
    candidateName: string;
    title: string;
    trigger: string;
    action: string;
    status: string;
    priority: number;
  }> = [];

  reports.forEach((report) => {
    if (report.silenceRisk.level === '高' || report.silenceRisk.possibleReasons.length >= 3) {
      items.push({
        candidateId: report.candidateId,
        candidateName: report.candidateName,
        title: `先处理 ${report.candidateName} 的沉默风险`,
        trigger: report.silenceRisk.possibleReasons[0] || '候选人存在继续沟通信号不足。',
        action: report.silenceRisk.suggestedActions[0] || report.silenceRisk.wakeUpScript,
        status: '高沉默风险',
        priority: 1,
      });
    }

    if (report.commitmentConsistencyCheck.riskLevel !== '低' && report.commitmentConsistencyCheck.findings.length > 0) {
      items.push({
        candidateId: report.candidateId,
        candidateName: report.candidateName,
        title: `补齐 ${report.candidateName} 看到的岗位承诺缺口`,
        trigger: report.commitmentConsistencyCheck.findings[0],
        action: report.commitmentConsistencyCheck.suggestions[0] || '补充岗位承诺一致性说明。',
        status: '需HR补充',
        priority: 3,
      });
    }

    const weakAdvice = report.adviceEvidenceTags.find((tag) => tag.status === '需人工确认');
    if (weakAdvice) {
      items.push({
        candidateId: report.candidateId,
        candidateName: report.candidateName,
        title: `人工确认 ${report.candidateName} 的证据不足建议`,
        trigger: weakAdvice.reason,
        action: weakAdvice.advice,
        status: '需人工确认',
        priority: 4,
      });
    }
  });

  tasks
    .filter((task) => !task.handledAt)
    .forEach((task) => {
      items.push({
        candidateId: task.candidateId,
        candidateName: task.candidateName,
        title: task.title,
        trigger: task.trigger,
        action: task.suggestedAction,
        status: '待处理',
        priority: 2,
      });
    });

  return items.sort((a, b) => a.priority - b.priority);
}
