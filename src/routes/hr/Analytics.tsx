import { StatCard } from '../../components/StatCard';
import { useDemoState } from '../../store/demoStore';

export function Analytics() {
  const { metrics } = useDemoState();
  const trialStarts = metrics.trialStarts ?? metrics.chatStarts;
  const trialCompletions = metrics.trialCompletions ?? metrics.chatCompletions;
  const chatEntry = metrics.visits ? Math.round((trialStarts / metrics.visits) * 100) : 0;
  const completion = trialStarts ? Math.round((trialCompletions / trialStarts) * 100) : 0;
  const applyRate = trialCompletions ? Math.round((metrics.applications / trialCompletions) * 100) : 0;
  const inviteRate = metrics.applications ? Math.round((metrics.interviewInvites / metrics.applications) * 100) : 0;
  const truthViewRate = metrics.visits ? Math.round(((metrics.truthLabelViews ?? 0) / metrics.visits) * 100) : 0;
  const branchCompletionRate = trialStarts ? Math.round(((metrics.branchTrialCompletions ?? 0) / trialStarts) * 100) : 0;

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Reality Pro 价值看板</span>
          <h1>AI岗位真相舱试点指标</h1>
          <p>用AI辅助估算展示岗位真相标签、分岔云试岗和邀约转化作战卡对招聘效率的改善空间。</p>
        </div>
      </div>

      <section className="stat-grid">
        <StatCard label="岗位实境舱访问量" value={metrics.visits} hint="打开岗位实境舱人数" />
        <StatCard label="云试岗开始率" value={`${chatEntry}%`} hint="开始云试岗 / 访问量" />
        <StatCard label="云试岗完成率" value={`${completion}%`} hint="完成人数 / 开始人数" />
        <StatCard label="云试岗后投递率" value={`${applyRate}%`} hint="投递 / 完成云试岗" />
        <StatCard label="面试邀约率" value={`${inviteRate}%`} hint="邀约 / 投递" />
        <StatCard label="高意愿候选人" value={metrics.highIntentCandidates} hint="AI辅助识别" />
        <StatCard label="岗位理解偏差" value={metrics.misunderstandingCandidates ?? 0} hint="需补充说明人数" />
        <StatCard label="预计减少无效面试" value={metrics.savedInterviewEstimate ?? 0} hint="AI辅助估算" />
        <StatCard label="预计节省HR沟通" value={`${metrics.savedHrHoursEstimate ?? 0}h`} hint="试点目标" />
        <StatCard label="人才库沉淀" value={metrics.talentPoolAdds ?? 0} hint="可后续跟进" />
        <StatCard label="岗位真相标签查看率" value={`${truthViewRate}%`} hint="AI辅助估算" />
        <StatCard label="分岔云试岗完成率" value={`${branchCompletionRate}%`} hint="完成三轮沙盘 / 开始人数" />
        <StatCard label="高顾虑候选人数" value={metrics.highConcernCandidates ?? 0} hint="需邀约前补充说明" />
        <StatCard label="邀约前建议覆盖数" value={metrics.preInviteSuggestionCoverage ?? 0} hint="AI辅助建议" />
        <StatCard label="AI邀约话术生成数" value={metrics.invitationScriptsGenerated ?? 0} hint="试点目标" />
        <StatCard label="面试作战卡生成数" value={metrics.battleCardsGenerated ?? 0} hint="试点目标" />
        <StatCard label="平均岗位信任指数" value={`${metrics.averageTrustIndex ?? 0}/100`} hint="AI辅助估算" />
        <StatCard label="高信任候选人占比" value={`${metrics.highTrustCandidateRatio ?? 0}%`} hint="试点目标" />
        <StatCard label="真相合约确认数" value={metrics.truthContractAcknowledgements ?? 0} hint="知情确认" />
        <StatCard label="AI风险复核通过数" value={metrics.aiRiskReviewPasses ?? 0} hint="面试前参考" />
        <StatCard label="双向确认完成数" value={metrics.mutualConfirmations ?? 0} hint="试点目标" />
        <StatCard label="高确认候选人占比" value={`${metrics.highConfirmationCandidateRatio ?? 0}%`} hint="AI辅助估算" />
        <StatCard label="候选人体验公平指数" value={`${metrics.candidateFairnessIndex ?? 0}/100`} hint="改善招聘环境" />
      </section>

      <section className="panel">
        <h2>云试岗试点目标</h2>
        <div className="goal-grid">
          <div><strong>HR初筛时间</strong><span>降低30%-40%</span></div>
          <div><strong>无效面试</strong><span>降低20%-30%</span></div>
          <div><strong>岗位误解</strong><span>提前识别</span></div>
          <div><strong>报告采纳率</strong><span>超过60%</span></div>
        </div>
      </section>

      <section className="panel">
        <h2>低信任原因 Top3</h2>
        <div className="goal-grid">
          {(metrics.lowTrustReasonTop3 ?? ['薪资沟通节点', '工作节奏', '成长路径']).map((reason) => (
            <div key={reason}>
              <strong>{reason}</strong>
              <span>邀约前建议补充说明</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>未确认原因 Top3</h2>
        <div className="goal-grid">
          {(metrics.unconfirmedReasonTop3 ?? ['薪资沟通节点', '工作节奏', '面试反馈时效']).map((reason) => (
            <div key={reason}>
              <strong>{reason}</strong>
              <span>双向确认前建议澄清</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
