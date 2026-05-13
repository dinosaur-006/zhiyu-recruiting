import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { useDemoState } from '../../store/demoStore';

export function Candidates() {
  const { candidates, jobs, storyCards, conversations } = useDemoState();

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">候选人列表</span>
          <h1>故事卡驱动的预筛选</h1>
          <p>按意愿、岗位理解、技能线索和风险提示优先处理候选人。</p>
        </div>
      </div>

      {candidates.length === 0 ? (
        <EmptyState title="暂无候选人" description="候选人完成岗位预体验或直接投递后，会出现在这里。" />
      ) : (
        <section className="panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>候选人</th>
                <th>岗位</th>
                <th>来源</th>
                <th>对话时长</th>
                <th>AI辅助建议</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => {
                const job = jobs.find((item) => item.id === candidate.jobId);
                const card = storyCards.find((item) => item.candidateId === candidate.id);
                const conversation = conversations.find((item) => item.id === candidate.conversationId);
                return (
                  <tr key={candidate.id}>
                    <td>
                      <strong>{candidate.name}</strong>
                      <span>{candidate.phone}</span>
                    </td>
                    <td>{job?.title ?? '未知岗位'}</td>
                    <td>{candidate.sourceChannel}</td>
                    <td>{conversation ? `${Math.round(conversation.durationSeconds / 60)}分钟` : '待确认'}</td>
                    <td>
                      <Badge tone={card?.recommendation === '强推荐面试' ? 'green' : card?.recommendation === '暂缓邀约' ? 'amber' : 'blue'}>
                        {card?.recommendation ?? 'AI辅助建议'}
                      </Badge>
                    </td>
                    <td>
                      <Badge tone={candidate.status === '已邀约' ? 'green' : 'purple'}>{candidate.status}</Badge>
                    </td>
                    <td>
                      <Link to={`/hr/candidates/${candidate.id}`}>查看故事卡</Link>
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
