import { Badge } from './Badge';
import { AIRiskReviewPanel } from './AIRiskReviewPanel';
import { CandidateTrustIndexPanel } from './CandidateTrustIndexPanel';
import { ConcernRadarPanel } from './ConcernRadarPanel';
import { InterviewBattleCardPanel } from './InterviewBattleCardPanel';
import { NoShowPreventionCardPanel } from './NoShowPreventionCardPanel';
import { TrialReplayPanel } from './TrialReplayPanel';
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
      <section className="story-panel reality-report">
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
        <StoryTags title="我的技能标签" items={report.skillEvidence} tone="blue" />
        <StoryTags title="我的场景选择" items={report.sceneChoiceSummary} tone="purple" />
        <StoryBlock title="下一步建议" content="你的云试岗记录已同步到HR工作台。后续沟通中，可以重点补充项目证据和你对真实任务场景的处理思路。" />
      </section>
    );
  }

  return (
    <section className="story-panel reality-report">
      <div className="story-hero">
        <div>
          <span className="eyebrow">AI云试岗报告</span>
          <h2>岗位实境舱证据链</h2>
        </div>
        <Badge tone={report.hrActionSuggestion === '优先邀约' ? 'green' : report.hrActionSuggestion === '建议入库观察' ? 'amber' : 'blue'}>
          HR行动建议：{report.hrActionSuggestion}
        </Badge>
      </div>

      <div className="report-summary-grid">
        <SummaryCell label="云试岗完成度" value={`${report.trialCompletion}%`} />
        <SummaryCell label="信任指数" value={`${report.candidateTrustIndex.total}/100`} />
        <SummaryCell label="真实意愿" value={report.realIntention} />
        <SummaryCell label="岗位理解" value={report.jobUnderstanding} />
        <SummaryCell label="爽约风险" value={report.noShowRisk} />
      </div>

      <CandidateTrustIndexPanel trustIndex={report.candidateTrustIndex} />

      <div className="story-block">
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

      <TrialReplayPanel events={report.trialReplay} />

      <div className="story-block">
        <h3>岗位真相查看摘要</h3>
        <div className="report-summary-grid compact">
          <SummaryCell label="已查看标签" value={report.jobTruthViewSummary.viewed ? '是' : '待确认'} />
          <SummaryCell label="查看真相点" value={`${report.jobTruthViewSummary.viewedPoints.length}项`} />
          <SummaryCell label="重点关注" value={report.jobTruthViewSummary.focusedPoints.slice(0, 2).join('、') || '待确认'} />
        </div>
      </div>

      <div className="story-block">
        <h3>岗位真相合约确认情况</h3>
        <div className="report-summary-grid compact">
          <SummaryCell label="确认状态" value={report.truthContractSummary.acknowledged ? '已确认' : '待确认'} />
          <SummaryCell label="确认项目" value={`${report.truthContractSummary.acknowledgedItems.length}项`} />
          <SummaryCell label="未解决疑问" value={report.truthContractSummary.unresolvedConcerns.join('、') || '暂无'} />
        </div>
      </div>

      <div className="story-block">
        <h3>关注点地图</h3>
        <div className="attention-map">
          {Object.entries(report.attentionMap).map(([key, value]) => (
            <div key={key} className="attention-row">
              <span>{attentionLabels[key as keyof RealityReport['attentionMap']]}</span>
              <div><i style={{ width: `${value}%` }} /></div>
              <strong>{value}%</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="story-block">
        <h3>分岔决策路径</h3>
        <p>{report.decisionPathAnalysis.summary}</p>
        <div className="report-summary-grid compact">
          <SummaryCell label="协作倾向" value={report.decisionPathAnalysis.collaboration} />
          <SummaryCell label="风险意识" value={report.decisionPathAnalysis.riskAwareness} />
          <SummaryCell label="沟通意识" value={report.decisionPathAnalysis.communication} />
        </div>
        <p className="story-list">推进方式：{report.decisionPathAnalysis.executionStyle}</p>
      </div>

      <ConcernRadarPanel radar={report.concernRadar} />
      <StoryTags title="场景选择记录" items={report.sceneChoiceSummary} tone="purple" />
      <StoryTags title="技能证据链" items={report.skillEvidence} tone="blue" />
      <StoryTags title="潜在失配风险" items={report.potentialMismatchRisks} tone="amber" />
      <StoryTags title="候选人真实提问" items={report.reverseQuestions.map((item) => `${item.type}：${item.answer}`)} tone="blue" />
      <StoryTags title="信任缺口" items={report.trustGapSummary.majorGaps} tone="amber" />
      <StoryList title="邀约前信任修复建议" items={report.trustGapSummary.repairSuggestions} />
      <CopyableScript title="信任修复话术" content={report.trustRepairScript} />
      <CopyableScript title="正式邀约话术" content={report.invitationScript} />
      <StoryList title="建议面试追问" items={report.interviewQuestions} />
      <NoShowPreventionCardPanel card={report.noShowPreventionCard} />
      <InterviewBattleCardPanel card={report.interviewBattleCard} />
      <AIRiskReviewPanel review={report.aiRiskReview} />
      <div className="story-compliance">{report.complianceNote}</div>
    </section>
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

function StoryTags({ title, items, tone }: { title: string; items: string[]; tone: 'blue' | 'purple' | 'amber' }) {
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

function StoryList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="story-block">
      <h3>{title}</h3>
      <ol className="story-list ordered">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </div>
  );
}

function topAttention(report: RealityReport) {
  return Object.entries(report.attentionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => attentionLabels[key as keyof RealityReport['attentionMap']]);
}
