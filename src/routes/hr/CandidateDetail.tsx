import { Link, useParams } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { RealityReportPanel } from '../../components/RealityReportPanel';
import { addCandidateToTalentPool, inviteCandidate, useDemoState } from '../../store/demoStore';

export function CandidateDetail() {
  const { candidateId } = useParams();
  const state = useDemoState();
  const candidate = state.candidates.find((item) => item.id === candidateId);
  const job = state.jobs.find((item) => item.id === candidate?.jobId);
  const report = state.realityReports.find((item) => item.candidateId === candidateId);
  const scenes = state.realityScenes.filter((scene) => scene.jobId === candidate?.jobId);

  if (!candidate || !job || !report) {
    return (
      <main className="page">
        <div className="panel">未找到候选人云试岗报告。</div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">云试岗报告详情</span>
          <h1>AI云试岗报告 · {candidate.name}</h1>
          <p>{job.title} · {candidate.sourceChannel} · {candidate.email}</p>
        </div>
        <div className="header-actions">
          <Badge tone={candidate.status === '已邀约' ? 'green' : 'purple'}>{candidate.status}</Badge>
          <button className="primary-button" onClick={() => inviteCandidate(candidate.id)}>
            发出邀约
          </button>
          <button className="ghost-button" onClick={() => addCandidateToTalentPool(candidate.id)}>
            加入人才库
          </button>
          <button className="ghost-button">
            记录反馈
          </button>
          <Link className="ghost-button" to="/hr/candidates">返回列表</Link>
        </div>
      </div>

      <RealityReportPanel report={report} scenes={scenes} />
    </main>
  );
}
