import { Link, useParams } from 'react-router-dom';
import { StoryCardPanel } from '../../components/StoryCardPanel';
import { useDemoState } from '../../store/demoStore';

export function StoryPreview() {
  const { candidateId } = useParams();
  const state = useDemoState();
  const candidate = state.candidates.find((item) => item.id === candidateId);
  const card = state.storyCards.find((item) => item.candidateId === candidateId);
  const job = state.jobs.find((item) => item.id === candidate?.jobId);

  if (!candidate || !card || !job) {
    return <main className="mobile-page"><section className="mobile-card">暂未生成故事卡。</section></main>;
  }

  return (
    <main className="mobile-page">
      <section className="mobile-card">
        <span className="eyebrow">故事卡预览</span>
        <h1>{candidate.name}，你的投递摘要已生成</h1>
        <p>{job.title} · {job.location}</p>
      </section>
      <StoryCardPanel card={card} mode="candidate" />
      <div className="mobile-actions">
        <Link className="primary-button full" to={`/candidate/success/${candidate.id}`}>确认投递</Link>
      </div>
    </main>
  );
}
