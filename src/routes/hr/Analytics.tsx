import { StatCard } from '../../components/StatCard';
import { useDemoState } from '../../store/demoStore';

export function Analytics() {
  const { metrics } = useDemoState();
  const chatEntry = metrics.visits ? Math.round((metrics.chatStarts / metrics.visits) * 100) : 0;
  const completion = metrics.chatStarts ? Math.round((metrics.chatCompletions / metrics.chatStarts) * 100) : 0;
  const applyRate = metrics.chatCompletions ? Math.round((metrics.applications / metrics.chatCompletions) * 100) : 0;
  const inviteRate = metrics.applications ? Math.round((metrics.interviewInvites / metrics.applications) * 100) : 0;

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">数据看板</span>
          <h1>招聘效率试点指标</h1>
          <p>用漏斗指标表达AI前置沟通对招聘效率的影响。</p>
        </div>
      </div>

      <section className="stat-grid">
        <StatCard label="岗位访问量" value={metrics.visits} hint="打开岗位页人数" />
        <StatCard label="对话进入率" value={`${chatEntry}%`} hint="进入对话 / 访问量" />
        <StatCard label="快聊完成率" value={`${completion}%`} hint="完成对话 / 进入对话" />
        <StatCard label="对话后投递率" value={`${applyRate}%`} hint="投递 / 完成对话" />
        <StatCard label="面试邀约率" value={`${inviteRate}%`} hint="邀约 / 投递" />
        <StatCard label="高意愿候选人" value={metrics.highIntentCandidates} hint="强推荐面试候选人" />
      </section>

      <section className="panel">
        <h2>试点目标</h2>
        <div className="goal-grid">
          <div><strong>HR初筛时间</strong><span>降低30%-40%</span></div>
          <div><strong>无效面试</strong><span>降低20%-30%</span></div>
          <div><strong>候选人到面率</strong><span>提升15%-25%</span></div>
          <div><strong>HR故事卡采纳率</strong><span>超过60%</span></div>
        </div>
      </section>
    </main>
  );
}
