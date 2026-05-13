import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { useDemoState } from '../../store/demoStore';

export function Candidates() {
  const { candidates, jobs, realityReports } = useDemoState();

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">云试岗候选人队列</span>
          <h1>按真实意愿、信任状态和治理任务处理候选人</h1>
          <p>查看云试岗完成度、信任指数、沉默风险和HR行动建议，优先处理需要先澄清再邀约的人。</p>
        </div>
      </div>

      {candidates.length === 0 ? (
        <EmptyState title="暂无候选人" description="候选人完成云试岗或直接投递后，会出现在这里。" />
      ) : (
        <section className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>候选人</th>
                <th>岗位</th>
                <th>来源</th>
                <th>云试岗完成度</th>
                <th>信任指数</th>
                <th>真实意愿</th>
                <th>岗位理解</th>
                <th>爽约风险</th>
                <th>沉默风险</th>
                <th>技能证据</th>
                <th>HR行动建议</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => {
                const job = jobs.find((item) => item.id === candidate.jobId);
                const report = realityReports.find((item) => item.candidateId === candidate.id);
                const silenceSignals = report?.silenceRisk.possibleReasons.length ?? 0;
                return (
                  <tr key={candidate.id}>
                    <td>
                      <strong>{candidate.name}</strong>
                      <span>{candidate.phone}</span>
                    </td>
                    <td>{job?.title ?? '未知岗位'}</td>
                    <td>{candidate.sourceChannel}</td>
                    <td>{report ? `${report.trialCompletion}%` : '待确认'}</td>
                    <td>{report ? `${report.candidateTrustIndex.total}/100` : '待确认'}</td>
                    <td>
                      <Badge tone={report?.realIntention === '高' ? 'green' : report?.realIntention === '低' ? 'amber' : 'blue'}>
                        {report?.realIntention ?? '待确认'}
                      </Badge>
                    </td>
                    <td>
                      <Badge tone="blue">{report?.jobUnderstanding ?? '待确认'}</Badge>
                    </td>
                    <td>
                      <Badge tone={report?.noShowRisk === '低' ? 'green' : report?.noShowRisk === '高' ? 'amber' : 'blue'}>
                        {report?.noShowRisk ?? '待确认'}
                      </Badge>
                    </td>
                    <td>
                      <Badge tone={silenceSignals >= 3 ? 'red' : silenceSignals >= 2 ? 'amber' : 'green'}>
                        {report?.silenceRisk.level ?? '待确认'}
                      </Badge>
                    </td>
                    <td>{report?.skillEvidence.slice(0, 2).join('、') ?? '待补充'}</td>
                    <td>
                      <Badge tone={report?.hrActionSuggestion === '优先邀约' ? 'green' : report?.hrActionSuggestion === '建议入库观察' ? 'amber' : 'purple'}>
                        {report?.hrActionSuggestion ?? 'HR行动建议'}
                      </Badge>
                    </td>
                    <td>
                      <Badge tone={candidate.status === '已邀约' ? 'green' : 'purple'}>{candidate.status}</Badge>
                    </td>
                    <td>
                      <Link to={`/hr/candidates/${candidate.id}`}>查看云试岗报告</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
