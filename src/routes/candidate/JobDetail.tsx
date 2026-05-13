import { Link, useParams } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { ComplianceNotice } from '../../components/ComplianceNotice';
import { useDemoState } from '../../store/demoStore';

export function JobDetail() {
  const { jobId } = useParams();
  const state = useDemoState();
  const job = state.jobs.find((item) => item.id === jobId);
  const company = state.company;

  if (!job) {
    return <main className="mobile-page"><section className="mobile-card">岗位不存在或已下架。</section></main>;
  }

  return (
    <main className="mobile-page">
      <section className="job-hero-card">
        <div className="company-line">
          <span>{company.name}</span>
          <Badge tone="blue">岗位预体验</Badge>
        </div>
        <h1>{job.title}</h1>
        <p>{job.department} · {job.location} · {job.salaryMin}k-{job.salaryMax}k</p>
        <div className="tag-row">
          {job.analysis.hardSkills.slice(0, 4).map((skill) => (
            <Badge key={skill} tone="purple">{skill}</Badge>
          ))}
        </div>
      </section>

      <ComplianceNotice />

      <section className="mobile-card">
        <h2>你可以先了解这些</h2>
        <div className="question-grid">
          {job.analysis.faq.map((question) => (
            <span key={question}>{question}</span>
          ))}
        </div>
      </section>

      <section className="mobile-card">
        <h2>岗位亮点</h2>
        <ul className="clean-list">
          {job.analysis.sellingPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <div className="mobile-actions sticky">
        <Link className="primary-button" to={`/candidate/chat/${job.id}`}>
          开始岗位预体验
        </Link>
        <Link className="ghost-button" to={`/candidate/profile/${job.id}?direct=1`}>
          直接投递简历
        </Link>
      </div>
    </main>
  );
}
