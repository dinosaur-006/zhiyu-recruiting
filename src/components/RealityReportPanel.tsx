import { Badge } from './Badge';
import { AIAdviceReliancePanel } from './AIAdviceReliancePanel';
import { AIRiskReviewPanel } from './AIRiskReviewPanel';
import { CandidateFairnessIndexPanel } from './CandidateFairnessIndexPanel';
import { CandidateTrustIndexPanel } from './CandidateTrustIndexPanel';
import { CommitmentConsistencyPanel } from './CommitmentConsistencyPanel';
import { ConcernRadarPanel } from './ConcernRadarPanel';
import { InterviewBattleCardPanel } from './InterviewBattleCardPanel';
import { MutualConfirmationPanel } from './MutualConfirmationPanel';
import { NoShowPreventionCardPanel } from './NoShowPreventionCardPanel';
import { SilenceRiskPanel } from './SilenceRiskPanel';
import { TrialReplayPanel } from './TrialReplayPanel';
import { TrustAuditLogPanel } from './TrustAuditLogPanel';
import { TrustGapDiagnosisPanel } from './TrustGapDiagnosisPanel';
import { TrustLoopGraphPanel } from './TrustLoopGraphPanel';
import { TrustNegotiationCardPanel } from './TrustNegotiationCardPanel';
import { TrustRepairTaskPanel } from './TrustRepairTaskPanel';
import type { RealityReport, RealityScene } from '../types';

interface RealityReportPanelProps {
  report: RealityReport;
  scenes?: RealityScene[];
  mode?: 'hr' | 'candidate';
}

const attentionLabels: Record<keyof RealityReport['attentionMap'], string> = {
  growth: '技术成长',
  salary: '薪资福利',
  team: '团队氛围',
  workload: '工作节奏',
  technology: '技术挑战',
};

export function RealityReportPanel({ report, scenes = [], mode = 'hr' }: RealityReportPanelProps) {
  if (mode === 'candidate') {
    return (
      <section className="story-panel reality-report candidate-report-preview">
        <div className="story-hero">
          <div>
            <span className="eyebrow">云试岗报告预览</span>
            <h2>你的岗位实境舱摘要</h2>
          </div>
          <Badge tone="blue">完成度 {report.trialCompletion}%</Badge>
        </div>
        <StoryBlock title="我关注的岗位信息" content={topAttention(report).join('、') || '岗位职责、团队协作、成长路径'} />
        <StoryTags title="我看过的岗位真相点" items={report.jobTruthViewSummary.viewedPoints} tone="blue" />
        <StoryTags title="我确认过的岗位真相合约" items={report.truthContractSummary.acknowledgedItems.slice(0, 5)} tone="blue" />
        <StoryBlock title="我的分岔选择路径摘要" content={report.decisionPathAnalysis.summary} />
        <MutualConfirmationPanel confirmation={report.mutualConfirmation} mode="candidate" />
        <StoryTags title="我的技能标签" items={report.skillEvidence} tone="blue" />
        <StoryTags title="我的场景选择" items={report.sceneChoiceSummary} tone="purple" />
        <StoryBlock title="下一步提示" content="你的云试岗记录已同步到HR工作台。后续沟通中，可以重点补充项目证据和你对真实任务场景的处理思路。" />
      </section>
    );
  }

  return (
    <section className="story-panel reality-report decision-brief">
      <div className="decision-brief-title">
        <div>
          <span className="eyebrow">Decision Brief</span>
          <h2>AI云试岗报告 · 招聘信任决策简报</h2>
          <p>先看是否值得继续推进，再看证据来源、HR动作和AI治理边界。</p>
        </div>
        <Badge tone={report.hrActionSuggestion === '优先邀约' ? 'green' : report.hrActionSuggestion === '建议入库观察' ? 'amber' : 'blue'}>
          HR行动建议：{report.hrActionSuggestion}
        </Badge>
      </div>

      <ReportExecutiveSummary report={report} />
      <AlphaReportCore report={report} />
      <TrustLoopGraphPanel nodes={report.trustLoopGraph} />

      <details className="brief-details">
        <summary>查看完整路径回放、风险复核与审计日志</summary>
      <section className="brief-section candidate-state-section">
        <BriefSectionHeader eyebrow="Candidate State" title="候选人状态" copy="用信任指数、沉默风险和顾虑雷达先判断是否需要先修复信任缺口。" />
        <div className="brief-two-column">
          <CandidateTrustIndexPanel trustIndex={report.candidateTrustIndex} />
          <SilenceRiskPanel risk={report.silenceRisk} />
        </div>
        <div className="brief-two-column">
          <ConcernRadarPanel radar={report.concernRadar} />
          <TrustGapDiagnosisPanel items={report.trustGapDiagnosis} />
        </div>
      </section>

      <section className="brief-section evidence-section">
        <BriefSectionHeader eyebrow="Evidence Sources" title="证据来源" copy="把AI建议靠近行为证据，降低黑箱感，也方便HR面试前人工确认。" />
        <div className="brief-two-column">
          <TrialReplayPanel events={report.trialReplay} />
          <AIAdviceReliancePanel notice={report.aiAdviceRelianceNotice} evidenceTags={report.adviceEvidenceTags} />
        </div>
        <div className="brief-two-column">
          <TrialScenesCard report={report} scenes={scenes} />
          <DecisionPathCard report={report} />
        </div>
        <div className="brief-two-column">
          <JobTruthSummaryCard report={report} />
          <TruthContractSummaryCard report={report} />
        </div>
        <div className="brief-two-column">
          <StoryTags title="技能证据链" items={report.skillEvidence} tone="blue" />
          <StoryTags title="候选人真实提问" items={report.reverseQuestions.map((item) => `${item.type}：${item.answer}`)} tone="blue" />
        </div>
      </section>

      <section className="brief-section hr-action-zone" id="trust-repair">
        <BriefSectionHeader eyebrow="HR Actions" title="HR动作" copy="先处理信任修复任务，再决定是否推进正式邀约。所有建议仅供面试前参考。" />
        <TrustRepairTaskPanel tasks={report.trustRepairTasks} />
        <div className="brief-two-column">
          <CopyableScript title="信任修复话术" content={report.trustRepairScript} />
          <CopyableScript title="正式邀约话术" content={report.invitationScript} />
        </div>
        <TrustNegotiationCardPanel card={report.trustNegotiationCard} />
        <div id="mutual-confirmation">
          <MutualConfirmationPanel confirmation={report.mutualConfirmation} />
        </div>
        <div className="brief-two-column">
          <NoShowPreventionCardPanel card={report.noShowPreventionCard} />
          <InterviewBattleCardPanel card={report.interviewBattleCard} />
        </div>
      </section>

      <section className="brief-section governance-section">
        <BriefSectionHeader eyebrow="AI Governance" title="AI治理" copy="报告保留风险复核、审计日志、证据标签和人工复核边界。" />
        <div className="brief-two-column">
          <AIRiskReviewPanel review={report.aiRiskReview} />
          <CommitmentConsistencyPanel check={report.commitmentConsistencyCheck} />
        </div>
        <div className="brief-two-column">
          <TrustAuditLogPanel events={report.trustAuditLog} completenessRate={report.auditCompletenessRate} />
          <CandidateFairnessIndexPanel fairness={report.candidateFairnessIndex} />
        </div>
        {report.candidateExitReason ? <StoryBlock title="候选人退出或中断原因" content={report.candidateExitReason} /> : null}
        <div id="ai-risk-review" className="story-compliance">
          {report.complianceNote}
        </div>
      </section>
      </details>
    </section>
  );
}

function AlphaReportCore({ report }: { report: RealityReport }) {
  const concernItems = topAttention(report).slice(0, 3);
  const evidenceItems = report.adviceEvidenceTags.slice(0, 3);
  const taskItems = report.trustRepairTasks.slice(0, 3);

  return (
    <section className="brief-section alpha-report-core">
      <BriefSectionHeader eyebrow="Alpha Report" title="结论 + 证据 + 动作" copy="首屏只保留HR推进候选人前最需要看的信息。" />
      <div className="brief-two-column">
        <StoryTags title="主要顾虑" items={concernItems.length ? concernItems : ['工作节奏', '薪资沟通节点']} tone="amber" />
        <StoryTags
          title="关键证据"
          items={evidenceItems.length ? evidenceItems.map((item) => `${item.status}：${item.evidence[0] || item.reason}`) : ['需人工确认：当前证据不足']}
          tone="blue"
        />
      </div>
      <div className="brief-two-column">
        <StoryTags title="下一步修复任务" items={taskItems.map((task) => `${task.title}：${task.suggestedAction}`)} tone="green" />
        <CopyableScript title="邀约话术" content={report.invitationScript} />
      </div>
    </section>
  );
}

function ReportExecutiveSummary({ report }: { report: RealityReport }) {
  const pendingTask = report.trustRepairTasks.find((task) => !task.handledAt);
  const primaryGap =
    report.trustGapDiagnosis[0]?.trigger ||
    report.candidateTrustIndex.gapReasons[0] ||
    report.trustGapSummary.majorGaps[0] ||
    '当前没有明显信任缺口，保持清晰沟通节奏。';
  const trustStatus =
    report.candidateTrustIndex.total >= 80 ? '高信任' : report.candidateTrustIndex.total >= 65 ? '中高信任' : '需先修复信任';
  const action = pendingTask?.suggestedAction || report.trustGapSummary.repairSuggestions[0] || '按报告建议完成人工复核后推进邀约。';

  const cells = [
    {
      label: '候选人信任状态',
      value: trustStatus,
      detail: `信任指数 ${report.candidateTrustIndex.total}/100，用于衡量岗位信息是否足以支撑继续面试。`,
      tone: report.candidateTrustIndex.total >= 80 ? 'green' : report.candidateTrustIndex.total >= 65 ? 'blue' : 'amber',
    },
    {
      label: '沉默风险',
      value: report.silenceRisk.level,
      detail: report.silenceRisk.possibleReasons[0] || '当前未发现明显沉默信号。',
      tone: report.silenceRisk.level === '高' ? 'red' : report.silenceRisk.level === '中' ? 'amber' : 'green',
    },
    {
      label: '主要信任缺口',
      value: report.trustGapDiagnosis[0]?.type || '暂无明显缺口',
      detail: primaryGap,
      tone: report.trustGapDiagnosis.length > 0 ? 'amber' : 'green',
    },
    {
      label: 'HR建议动作',
      value: pendingTask ? '先修复再邀约' : '可进入人工复核',
      detail: action,
      tone: pendingTask ? 'purple' : 'blue',
    },
    {
      label: 'AI风险复核',
      value: report.aiRiskReview.result,
      detail: report.aiRiskReview.reminders[0] || '报告仅供面试前参考，最终决策由人工完成。',
      tone: report.aiRiskReview.result === '复核通过' ? 'green' : 'amber',
    },
    {
      label: '审计日志完整率',
      value: `${report.auditCompletenessRate}%`,
      detail: report.auditCompletenessRate >= 80 ? '关键行为与AI建议具备较完整留痕。' : '建议HR补充关键治理事件确认。',
      tone: report.auditCompletenessRate >= 80 ? 'green' : report.auditCompletenessRate >= 60 ? 'blue' : 'amber',
    },
  ] as const;

  return (
    <section className="executive-summary report-hero-summary" id="report-executive-summary">
      <div className="executive-head">
        <div>
          <span className="eyebrow">Report Hero</span>
          <h3>一屏结论</h3>
        </div>
        <Badge tone={report.hrActionSuggestion === '优先邀约' ? 'green' : 'blue'}>{report.hrActionSuggestion}</Badge>
      </div>
      <div className="executive-grid">
        {cells.map((cell) => (
          <article key={cell.label} className="executive-cell">
            <span>{cell.label}</span>
            <div>
              <strong>{cell.value}</strong>
              <Badge tone={cell.tone}>{cell.tone === 'green' ? '已完成' : cell.tone === 'amber' ? '有缺口' : '面试前参考'}</Badge>
            </div>
            <p>{cell.detail}</p>
          </article>
        ))}
      </div>
      <div className="primary-recommendation">
        <span>主要建议</span>
        <strong>{action}</strong>
      </div>
    </section>
  );
}

function BriefSectionHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="brief-section-head">
      <span className="eyebrow">{eyebrow}</span>
      <h3>{title}</h3>
      <p>{copy}</p>
    </div>
  );
}

function TrialScenesCard({ report, scenes }: { report: RealityReport; scenes: RealityScene[] }) {
  return (
    <div className="story-block" id="trial-scenes">
      <h3>云试岗轨迹</h3>
      <div className="timeline-list">
        {scenes.map((scene) => (
          <div key={scene.id} className={report.evidenceSources.fromTrialScenes.includes(scene.id) ? 'timeline-item done' : 'timeline-item'}>
            <span>{report.evidenceSources.fromTrialScenes.includes(scene.id) ? '已完成' : '待确认'}</span>
            <strong>{scene.title}</strong>
            <p>{scene.keySignals.join('、')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function JobTruthSummaryCard({ report }: { report: RealityReport }) {
  return (
    <div className="story-block" id="job-truth-summary">
      <h3>岗位真相查看摘要</h3>
      <div className="report-summary-grid compact">
        <SummaryCell label="已查看标签" value={report.jobTruthViewSummary.viewed ? '是' : '待确认'} />
        <SummaryCell label="查看真相点" value={`${report.jobTruthViewSummary.viewedPoints.length}项`} />
        <SummaryCell label="重点关注" value={report.jobTruthViewSummary.focusedPoints.slice(0, 2).join('、') || '待确认'} />
      </div>
    </div>
  );
}

function TruthContractSummaryCard({ report }: { report: RealityReport }) {
  return (
    <div className="story-block" id="truth-contract-summary">
      <h3>岗位真相合约确认</h3>
      <div className="report-summary-grid compact">
        <SummaryCell label="确认状态" value={report.truthContractSummary.acknowledged ? '已确认' : '待确认'} />
        <SummaryCell label="确认项目" value={`${report.truthContractSummary.acknowledgedItems.length}项`} />
        <SummaryCell label="未解决疑问" value={report.truthContractSummary.unresolvedConcerns.join('、') || '暂无'} />
      </div>
    </div>
  );
}

function DecisionPathCard({ report }: { report: RealityReport }) {
  return (
    <div className="story-block" id="decision-path">
      <h3>分岔决策路径</h3>
      <p>{report.decisionPathAnalysis.summary}</p>
      <div className="report-summary-grid compact">
        <SummaryCell label="协作倾向" value={report.decisionPathAnalysis.collaboration} />
        <SummaryCell label="风险意识" value={report.decisionPathAnalysis.riskAwareness} />
        <SummaryCell label="沟通意识" value={report.decisionPathAnalysis.communication} />
      </div>
      <p className="story-list">推进方式：{report.decisionPathAnalysis.executionStyle}</p>
    </div>
  );
}

function CopyableScript({ title, content }: { title: string; content: string }) {
  const copy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(content);
    }
  };

  return (
    <div className="story-block invitation-script">
      <div className="copy-script-head">
        <h3>{title}</h3>
        <button className="ghost-button" type="button" onClick={copy}>
          复制话术
        </button>
      </div>
      <p>{content}</p>
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-cell">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StoryBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="story-block">
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
}

function StoryTags({ title, items, tone }: { title: string; items: string[]; tone: 'blue' | 'purple' | 'amber' | 'green' }) {
  return (
    <div className="story-block">
      <h3>{title}</h3>
      <div className="tag-row">
        {items.map((item) => (
          <Badge key={item} tone={tone}>
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function topAttention(report: RealityReport) {
  return Object.entries(report.attentionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => attentionLabels[key as keyof RealityReport['attentionMap']]);
}
