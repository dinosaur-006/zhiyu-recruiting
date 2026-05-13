import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { useDemoState } from '../../store/demoStore';

export function Dashboard() {
  const { jobs, candidates, metrics, realityReports } = useDemoState();
  const latestCandidates = candidates.slice(0, 4);
  const completionRate = metrics.chatStarts ? Math.round((metrics.chatCompletions / metrics.chatStarts) * 100) : 0;
  const showRate = metrics.interviewInvites ? Math.round((metrics.attendedInterviews / metrics.interviewInvites) * 100) : 0;

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">HR工作台</span>
          <h1>岗位实境舱运营工作台</h1>
          <p>聚焦云试岗完成度、真实意愿、岗位理解和报告回流，帮助HR减少无效面试。</p>
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
                  <Badge tone="purple">{report?.hrActionSuggestion ?? 'HR行动建议'}</Badge>
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
              ['进入对话', metrics.chatStarts],
              ['完成对话', metrics.chatCompletions],
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
    </main>
  );
}
