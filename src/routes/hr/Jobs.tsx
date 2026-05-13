import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { useDemoState } from '../../store/demoStore';

export function Jobs() {
  const { jobs, candidates } = useDemoState();

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">岗位实境舱管理</span>
          <h1>岗位与云试岗入口</h1>
          <p>每个岗位都可以生成独立的实境舱链接，并沉淀候选人云试岗报告。</p>
        </div>
        <Link className="primary-button" to="/hr/jobs/new">
          新建职位
        </Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState title="还没有职位" description="创建第一个岗位后，系统会自动生成AI解析结果和数字人配置建议。" />
      ) : (
        <section className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>职位</th>
                <th>部门</th>
                <th>薪资</th>
                <th>候选人</th>
                <th>AI解析</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <strong>{job.title}</strong>
                    <span>{job.location}</span>
                  </td>
                  <td>{job.department}</td>
                  <td>{job.salaryMin}k-{job.salaryMax}k</td>
                  <td>{candidates.filter((candidate) => candidate.jobId === job.id).length}</td>
                  <td>
                    <div className="tag-row">
                      {job.analysis.hardSkills.slice(0, 3).map((skill) => (
                        <Badge key={skill} tone="blue">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="row-actions">
                    <Link to={`/hr/avatar/${job.id}`}>配置实境舱</Link>
                      <Link to={`/hr/share/${job.id}`}>分享</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
