import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { TrustRepairTaskPanel } from '../../components/TrustRepairTaskPanel';
import { useDemoState } from '../../store/demoStore';

export function Dashboard() {
  const { jobs, candidates, metrics, realityReports, trustRepairTasks } = useDemoState();
  const latestCandidates = candidates.slice(0, 4);
  const completionRate = metrics.chatStarts ? Math.round((metrics.chatCompletions / metrics.chatStarts) * 100) : 0;
  const showRate = metrics.interviewInvites ? Math.round((metrics.attendedInterviews / metrics.interviewInvites) * 100) : 0;
  const trustHealth = metrics.recruitingTrustHealth;

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">HR工作台</span>
          <h1>招聘信任治理工作台</h1>
          <p>把云试岗报告、沉默风险和信任修复任务收拢到同一个运营界面，帮助HR先修复顾虑再邀约。</p>
        </div>
        <Link className="primary-button" to="/hr/jobs/new">
          新建职位
        </Link>
      </div>

      <section className="stat-grid">
        <StatCard label="发布职位" value={jobs.length} hint="当前演示企业" />
        <StatCard label="云试岗完成率" value={`${completionRate}%`} hint="完成云试岗 / 开始人数" trend="+12%" />
        <StatCard label="云试岗报告" value={realityReports.length} hint="AI辅助整理" />
        <StatCard label="到面率" value={`${showRate}%`} hint="实际到面 / 邀约人数" trend="+20%" />
        <StatCard label="待修复任务" value={metrics.pendingTrustRepairTasks ?? 0} hint="信任治理待办" />
        <StatCard label="高沉默风险" value={metrics.highSilenceRiskCandidates ?? 0} hint="邀约前建议澄清" />
        <StatCard label="审计完整率" value={`${metrics.auditCompletenessRate ?? 0}%`} hint="AI辅助估算" />
        <StatCard label="已处理任务" value={metrics.handledTrustRepairTasks ?? 0} hint="试点目标" />
        <StatCard label="招聘信任健康度" value={`${trustHealth?.total ?? 0}/100`} hint="AI辅助估算" />
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-head">
            <h2>待处理候选人</h2>
            <Link to="/hr/candidates">查看全部</Link>
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
                    沉默风险 {report?.silenceRisk.level ?? '待确认'}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>招聘漏斗</h2>
            <Link to="/hr/analytics">数据看板</Link>
          </div>
          <div className="funnel">
            {[
              ['岗位访问', metrics.visits],
              ['进入云试岗', metrics.chatStarts],
              ['完成云试岗', metrics.chatCompletions],
              ['提交投递', metrics.applications],
              ['面试邀约', metrics.interviewInvites],
            ].map(([label, value], index) => (
              <div key={label} className="funnel-row" style={{ width: `${100 - index * 10}%` }}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel dashboard-task-panel">
        <TrustRepairTaskPanel tasks={trustRepairTasks} compact />
      </section>

      {trustHealth ? (
        <section className="panel trust-health-panel">
          <div className="panel-head">
            <h2>招聘信任健康度</h2>
            <Badge tone={trustHealth.total >= 80 ? 'green' : trustHealth.total >= 65 ? 'blue' : 'amber'}>{trustHealth.total}/100</Badge>
          </div>
          <div className="health-grid">
            <div>
              <strong>强项</strong>
              {trustHealth.strengths.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div>
              <strong>待优化</strong>
              {trustHealth.improvementItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
