import { Link } from 'react-router-dom';
import { Briefcase, Plus, Settings, Share2 } from 'lucide-react';
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
          <Plus size={16} strokeWidth={1.5} /> 新建职位
        </Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="暂无职位" description="发布第一个岗位，生成AI岗位真相舱" />
      ) : (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: 20,
          }}
        >
          {jobs.map((job) => {
            const candidateCount = candidates.filter((c) => c.jobId === job.id).length;
            const maxSalary = Math.max(...jobs.map((j) => j.salaryMax), 1);
            const salaryTrackLeft = (job.salaryMin / maxSalary) * 100;
            const salaryTrackWidth = ((job.salaryMax - job.salaryMin) / maxSalary) * 100;
            const skills = job.analysis.hardSkills.slice(0, 3);

            return (
              <div
                key={job.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = '';
                }}
              >
                {/* Header: title + department + location */}
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 'var(--text-lg)',
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: 'var(--color-fg)',
                    }}
                  >
                    {job.title}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                      {job.department}
                    </span>
                    <span style={{ color: 'var(--color-border)', fontSize: 'var(--text-sm)' }}>·</span>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                      {job.location}
                    </span>
                  </div>
                </div>

                {/* Salary range bar */}
                <div className="salary-range">
                  <span className="salary-range-label">{job.salaryMin}k</span>
                  <div className="salary-range-track">
                    <div
                      className="salary-range-fill"
                      style={{
                        left: `${salaryTrackLeft}%`,
                        width: `${salaryTrackWidth}%`,
                      }}
                    />
                  </div>
                  <span className="salary-range-label">{job.salaryMax}k</span>
                </div>

                {/* Skill tags */}
                {skills.length > 0 && (
                  <div className="tag-row">
                    {skills.map((skill) => (
                      <Badge key={skill} tone="blue">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Footer: candidate count + action links */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto',
                    paddingTop: 12,
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  <Badge tone="gray">{candidateCount} 候选人</Badge>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <Link
                      to={`/hr/avatar/${job.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-muted)',
                        textDecoration: 'none',
                      }}
                    >
                      <Settings size={14} strokeWidth={1.5} />
                      配置实境舱
                    </Link>
                    <Link
                      to={`/hr/share/${job.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-muted)',
                        textDecoration: 'none',
                      }}
                    >
                      <Share2 size={14} strokeWidth={1.5} />
                      分享
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
