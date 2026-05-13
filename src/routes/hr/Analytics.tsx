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
          <span className="eyebrow">Governance Metrics</span>
          <h1>招聘信任治理看板</h1>
          <p>所有指标均为AI辅助估算和试点目标，用于观察岗位真相、信任修复和治理链路对招聘转化的改善空间。</p>
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
        <StatCard label="承诺一致性待补充" value={metrics.commitmentConsistencyIssues ?? 0} hint="需HR补充说明" />
        <StatCard label="证据充分AI建议" value={metrics.evidenceSupportedAdviceCount ?? 0} hint="AI辅助估算" />
        <StatCard label="需人工确认建议" value={metrics.humanConfirmationAdviceCount ?? 0} hint="面试前参考" />
        <StatCard label="待处理信任修复任务" value={metrics.pendingTrustRepairTasks ?? 0} hint="治理待办" />
        <StatCard label="已处理信任修复任务" value={metrics.handledTrustRepairTasks ?? 0} hint="试点目标" />
        <StatCard label="高沉默风险候选人" value={metrics.highSilenceRiskCandidates ?? 0} hint="邀约前建议澄清" />
        <StatCard label="审计日志完整率" value={`${metrics.auditCompletenessRate ?? 0}%`} hint="AI辅助估算" />
      </section>

      <InsightSection
        title="低信任原因Top3"
        items={metrics.lowTrustReasonTop3 ?? ['薪资沟通节点', '工作节奏', '成长路径']}
        hint="邀约前建议补充说明"
      />
      <InsightSection
        title="未确认原因Top3"
        items={metrics.unconfirmedReasonTop3 ?? ['薪资沟通节点', '工作节奏', '面试反馈时效']}
        hint="双向确认前建议澄清"
      />
      <InsightSection
        title="候选人退出原因Top3"
        items={metrics.candidateExitReasonTop3 ?? ['薪资信息不明确', '岗位节奏不适合', '成长路径不清晰']}
        hint="建议优化岗位真相表达"
      />
    </main>
  );
}

function InsightSection({ title, items, hint }: { title: string; items: string[]; hint: string }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <div className="goal-grid">
        {items.map((item) => (
          <div key={item}>
            <strong>{item}</strong>
            <span>{hint}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
