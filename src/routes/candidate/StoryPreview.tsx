import { Link, useParams } from 'react-router-dom';
import { RealityReportPanel } from '../../components/RealityReportPanel';
import { StoryCardPanel } from '../../components/StoryCardPanel';
import { useDemoState } from '../../store/demoStore';

export function StoryPreview() {
  const { candidateId } = useParams();
  const state = useDemoState();
  const candidate = state.candidates.find((item) => item.id === candidateId);
  const report = state.realityReports.find((item) => item.candidateId === candidateId);
  const card = state.storyCards.find((item) => item.candidateId === candidateId);
  const job = state.jobs.find((item) => item.id === candidate?.jobId);

  if (!candidate || !job || (!report && !card)) {
    return (
      <main className="mobile-page">
        <section className="mobile-card">暂未生成云试岗报告。</section>
      </main>
    );
  }

  return (
    <main className="mobile-page">
      <section className="mobile-card">
        <span className="eyebrow">云试岗报告预览</span>
        <h1>{candidate.name}，你的岗位实境舱摘要已生成</h1>
        <p>{job.title} · {job.location}</p>
      </section>
      {report ? <RealityReportPanel report={report} mode="candidate" /> : <StoryCardPanel card={card!} mode="candidate" />}
      <div className="mobile-actions">
        <Link className="primary-button full" to={`/candidate/success/${candidate.id}`}>
          确认投递
        </Link>
      </div>
    </main>
  );
}
