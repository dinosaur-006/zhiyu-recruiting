import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { ComplianceNotice } from '../../components/ComplianceNotice';
import { JobTruthLabelPanel } from '../../components/JobTruthLabelPanel';
import { recordTruthPoint, startTrialSession, useDemoState } from '../../store/demoStore';

export function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [showConsent, setShowConsent] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const state = useDemoState();
  const job = state.jobs.find((item) => item.id === jobId);
  const truthLabel = state.jobTruthLabels.find((item) => item.jobId === jobId);
  const company = state.company;

  if (!job) {
    return <main className="mobile-page"><section className="mobile-card">岗位不存在或已下架。</section></main>;
  }

  const startTrial = () => {
    const session = sessionId ? state.trialSessions.find((item) => item.id === sessionId) : undefined;
    const nextSession = session ?? startTrialSession(job.id);
    navigate(`/candidate/chat/${job.id}?sessionId=${nextSession.id}`);
  };

  const focusTruthPoint = (point: string) => {
    const session = sessionId ? state.trialSessions.find((item) => item.id === sessionId) : undefined;
    const nextSession = session ?? startTrialSession(job.id);
    setSessionId(nextSession.id);
    recordTruthPoint(nextSession.id, point, true);
  };

  return (
    <main className="mobile-page">
      <section className="job-hero-card">
        <div className="company-line">
          <span>{company.name}</span>
          <Badge tone="blue">岗位实境舱</Badge>
        </div>
        <h1>{job.title}｜岗位实境舱</h1>
        <p>{job.department} · {job.location} · {job.salaryMin}k-{job.salaryMax}k</p>
        <div className="tag-row">
          {job.analysis.hardSkills.slice(0, 4).map((skill) => (
            <Badge key={skill} tone="purple">{skill}</Badge>
          ))}
        </div>
      </section>

      <ComplianceNotice />

      {truthLabel ? (
        <section className="mobile-card truth-card-wrap">
          <JobTruthLabelPanel label={truthLabel} onFocusPoint={focusTruthPoint} />
        </section>
      ) : null}

      <section className="mobile-card">
        <h2>先云试岗，再投递</h2>
        <p>和岗位数字人一起体验真实工作场景，再决定是否投递。</p>
        <div className="reality-role-strip">
          <div><strong>HR数字人</strong><span>岗位概览与流程</span></div>
          <div><strong>未来同事</strong><span>真实一天与协作</span></div>
          <div><strong>未来主管</strong><span>真实任务挑战</span></div>
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
        <button className="primary-button" onClick={() => setShowConsent(true)}>
          开始云试岗
        </button>
        <Link className="ghost-button" to={`/candidate/profile/${job.id}?direct=1${sessionId ? `&sessionId=${sessionId}` : ''}`}>
          直接投递简历
        </Link>
      </div>

      {showConsent ? (
        <div className="modal-backdrop">
          <section className="consent-modal">
            <span className="eyebrow">开始前请确认</span>
            <h2>AI身份披露</h2>
            <p>
              你即将进入由AI数字人生成的岗位实境舱。数字人不是HR本人，也不代表真人正在与你实时沟通。
              系统不会基于本次体验自动做出招聘决定，不分析你的外貌、表情、声音情绪。
              系统只会基于你的主动提问、场景选择和填写资料生成云试岗报告，供HR人工参考。
            </p>
            <div className="mobile-actions">
              <button className="primary-button" onClick={startTrial}>同意并开始云试岗</button>
              <Link className="ghost-button" to={`/candidate/profile/${job.id}?direct=1${sessionId ? `&sessionId=${sessionId}` : ''}`}>直接投递简历</Link>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
