import { Link, useParams } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { StoryCardPanel } from '../../components/StoryCardPanel';
import { inviteCandidate, useDemoState } from '../../store/demoStore';

export function CandidateDetail() {
  const { candidateId } = useParams();
  const state = useDemoState();
  const candidate = state.candidates.find((item) => item.id === candidateId);
  const job = state.jobs.find((item) => item.id === candidate?.jobId);
  const card = state.storyCards.find((item) => item.candidateId === candidateId);

  if (!candidate || !job || !card) {
    return (
      <main className="page">
        <div className="panel">未找到候选人故事卡。</div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">故事卡详情</span>
          <h1>{candidate.name} · {job.title}</h1>
          <p>{candidate.sourceChannel} · {candidate.email}</p>
        </div>
        <div className="header-actions">
          <Badge tone={candidate.status === '已邀约' ? 'green' : 'purple'}>{candidate.status}</Badge>
          <button className="primary-button" onClick={() => inviteCandidate(candidate.id)}>
            发出邀约
          </button>
          <Link className="ghost-button" to="/hr/candidates">返回列表</Link>
        </div>
      </div>

      <StoryCardPanel card={card} />
    </main>
  );
}
