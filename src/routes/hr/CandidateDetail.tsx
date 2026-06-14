import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../../components/Badge';
import { AIRiskReviewPanel } from '../../components/AIRiskReviewPanel';
import { CandidateFairnessIndexPanel } from '../../components/CandidateFairnessIndexPanel';
import { CandidateTrustIndexPanel } from '../../components/CandidateTrustIndexPanel';
import { CommitmentConsistencyPanel } from '../../components/CommitmentConsistencyPanel';
import { ConcernRadarPanel } from '../../components/ConcernRadarPanel';
import { InterviewBattleCardPanel } from '../../components/InterviewBattleCardPanel';
import { NoShowPreventionCardPanel } from '../../components/NoShowPreventionCardPanel';
import { SilenceRiskPanel } from '../../components/SilenceRiskPanel';
import { TrialReplayPanel } from '../../components/TrialReplayPanel';
import { TrustAuditLogPanel } from '../../components/TrustAuditLogPanel';
import { TrustNegotiationCardPanel } from '../../components/TrustNegotiationCardPanel';
import { TrustRepairTaskPanel } from '../../components/TrustRepairTaskPanel';
import { addCandidateToTalentPool, inviteCandidate, markReportReviewed, useDemoState } from '../../store/demoStore';
import type { BranchScenario, Job, RealityReport, ReverseQuestion } from '../../types';

const TABS = ['总览', '证据链', 'HR动作', '信任治理', '面试指南'];

export function CandidateDetail() {
  const { candidateId } = useParams();
  const state = useDemoState();
  const candidate = state.candidates.find((i) => i.id === candidateId);
  const job = state.jobs.find((i) => i.id === candidate?.jobId);
  const report = state.realityReports.find((i) => i.candidateId === candidateId);
  const scenes = state.realityScenes.filter((s) => s.jobId === candidate?.jobId);
  const branchScenarios = state.branchScenarios.filter((s) => s.jobId === candidate?.jobId);
  const session = state.trialSessions.find((s) => s.candidateId === candidateId);
  const [tab, setTab] = useState(0);

  if (!candidate || !job || !report) {
    return <main className="page"><div className="panel" style={{ textAlign: 'center', padding: 'var(--space-20)' }}><h2>未找到候选人报告</h2></div></main>;
  }

  const trust = report.candidateTrustIndex.total;
  const pending = report.trustRepairTasks.find((t) => !t.handledAt);
  const statusTone = candidate.status === '已邀约' ? 'green' : candidate.status === '已入库' ? 'purple' : 'blue';

  return (
    <main className="page" style={{ paddingBottom: 120 }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 1, minWidth: 0 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), #34D399)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-display)', flexShrink: 0 }}>{candidate.name.charAt(0)}</div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0 }}>{candidate.name}</h1>
              <p style={{ margin: 'var(--space-1) 0 0' }}>
                {job.title}<span style={{ color: 'var(--color-border-strong)', margin: '0 var(--space-2)' }}>·</span>{candidate.sourceChannel}<span style={{ color: 'var(--color-border-strong)', margin: '0 var(--space-2)' }}>·</span>{candidate.email}
                <span style={{ marginLeft: 'var(--space-2)' }}><Badge tone={statusTone}>{candidate.status}</Badge></span>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: `conic-gradient(var(--color-accent) ${trust}%, var(--color-border) 0)`, mask: 'radial-gradient(transparent 58%, #000 60%)', WebkitMask: 'radial-gradient(transparent 58%, #000 60%)' }} />
            <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-accent)' }}>{trust}</strong>
            <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>信任指数</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
          <button className="primary-button" onClick={() => inviteCandidate(candidate.id)}>发起面试邀请</button>
          <button className="ghost-button" onClick={() => addCandidateToTalentPool(candidate.id)}>加入人才库</button>
          <Link className="ghost-button" to="/hr/candidates" style={{ textDecoration: 'none' }}>← 返回列表</Link>
        </div>
      </div>

      <nav style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-6)' }}>
        {TABS.map((label, i) => (
          <button key={i} onClick={() => setTab(i)}
            style={{ padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--text-sm)', fontWeight: tab === i ? 600 : 500, color: tab === i ? 'var(--color-accent)' : 'var(--color-muted)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === i ? 'var(--color-accent)' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
            {label}
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
          {tab === 0 && <OverviewTab report={report} scenes={scenes} pending={pending} />}
          {tab === 1 && <EvidenceTab report={report} branchScenarios={branchScenarios} session={session} />}
          {tab === 2 && <ActionsTab report={report} />}
          {tab === 3 && <GovernanceTab report={report} />}
          {tab === 4 && <InterviewGuideTab report={report} job={job} />}
        </motion.div>
      </AnimatePresence>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, background: 'var(--color-surface)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--color-border)', padding: 'var(--space-3) var(--space-6)', display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
        <button className="primary-button" onClick={() => inviteCandidate(candidate.id)}>发起面试邀请</button>
        <button className="ghost-button" onClick={() => addCandidateToTalentPool(candidate.id)}>加入人才库</button>
      </div>
    </main>
  );
}

function OverviewTab({ report, scenes, pending }: { report: RealityReport; scenes: any[]; pending: any }) {
  return (
    <>
      <section className="panel">
        <span className="eyebrow">Decision Brief</span>
        <h2>一屏结论</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
          <SC label="信任状态" value={report.candidateTrustIndex.total >= 80 ? '高信任' : report.candidateTrustIndex.total >= 65 ? '中高信任' : '需修复'} detail={`信任指数 ${report.candidateTrustIndex.total}/100`} tone={report.candidateTrustIndex.total >= 80 ? 'green' : report.candidateTrustIndex.total >= 65 ? 'blue' : 'amber'} />
          <SC label="HR行动建议" value={report.hrActionSuggestion} detail={pending?.suggestedAction || '按建议完成复核'} tone={report.hrActionSuggestion === '优先邀约' ? 'green' : report.hrActionSuggestion === '建议入库观察' ? 'amber' : 'blue'} />
          <SC label="AI风险复核" value={report.aiRiskReview.result} detail={report.aiRiskReview.reminders[0] || ''} tone={report.aiRiskReview.result === '复核通过' ? 'green' : 'amber'} />
          <SC label="审计完整率" value={`${report.auditCompletenessRate}%`} detail={report.auditCompletenessRate >= 80 ? '关键行为已留痕' : '建议补充'} tone={report.auditCompletenessRate >= 80 ? 'green' : 'blue'} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-accent-subtle)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
          <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>▶ 建议</span>
          <span style={{ color: 'var(--color-ink)', fontWeight: 500 }}>{pending ? `先修复：${pending.title}` : report.trustGapSummary?.repairSuggestions?.[0] || '可进入人工复核'}</span>
        </div>
        <AiMeta report={report} />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
        <CandidateTrustIndexPanel trustIndex={report.candidateTrustIndex} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <ConcernRadarPanel radar={report.concernRadar} />
          <section className="panel">
            <span className="eyebrow">Trial Completion</span>
            <h3>云试岗完成情况</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <SC label="完成度" value={`${report.trialCompletion}%`} detail="" tone="blue" />
              <SC label="真实意向" value={report.realIntention} detail="" tone={report.realIntention === '高' ? 'green' : 'blue'} />
              <SC label="岗位理解" value={report.jobUnderstanding} detail="" tone={report.jobUnderstanding === '清晰' ? 'green' : 'amber'} />
              <SC label="爽约风险" value={report.noShowRisk} detail="" tone={report.noShowRisk === '低' ? 'green' : report.noShowRisk === '中' ? 'amber' : 'red'} />
            </div>
          </section>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
        <SilenceRiskPanel risk={report.silenceRisk} />
        <NoShowPreventionCardPanel card={report.noShowPreventionCard} />
      </div>
      {report.trustRepairTasks.filter((t: any) => !t.handledAt).length > 0 && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <TrustRepairTaskPanel tasks={report.trustRepairTasks.filter((t: any) => !t.handledAt).slice(0, 3)} compact />
        </div>
      )}
    </>
  );
}

function EvidenceTab({ report, branchScenarios, session }: { report: RealityReport; branchScenarios: BranchScenario[]; session: any }) {
  return (
    <>
      <TrialReplayPanel events={report.trialReplay} />
      <section className="panel" style={{ marginTop: 'var(--space-6)' }}>
        <span className="eyebrow">Branch Decisions</span>
        <h3>分岔任务选择</h3>
        <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>候选人在云试岗分岔场景中的每个选择，揭示其决策倾向</p>
        {report.decisionPathAnalysis?.summary && (
          <div style={{ marginTop: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-soft)', lineHeight: 'var(--leading-relaxed)' }}>{report.decisionPathAnalysis.summary}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
              <SC label="协作" value={String(report.decisionPathAnalysis.collaboration ?? '—')} detail="" tone="blue" />
              <SC label="风险意识" value={String(report.decisionPathAnalysis.riskAwareness ?? '—')} detail="" tone="blue" />
              <SC label="沟通" value={String(report.decisionPathAnalysis.communication ?? '—')} detail="" tone="blue" />
              <SC label="技术判断" value={String(report.decisionPathAnalysis.technicalJudgment ?? '—')} detail="" tone="blue" />
            </div>
          </div>
        )}
        {branchScenarios.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            {branchScenarios.map((sc: any) => {
              const picks = sc.choices.filter((c: any) => (session?.branchChoiceIds ?? []).includes(c.id));
              return (
                <div key={sc.id} style={{ background: 'var(--color-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)', border: '1px solid var(--color-border)' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', margin: '0 0 var(--space-2)', fontWeight: 600 }}>第{sc.round}轮：{sc.title}</h4>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', margin: '0 0 var(--space-4)' }}>{sc.description}</p>
                  {picks.length > 0 ? picks.map((ch: any) => (
                    <div key={ch.id} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-4)', border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-accent)', marginBottom: 'var(--space-2)' }}>
                      <strong style={{ fontSize: 'var(--text-sm)' }}>选项 {ch.label}：{ch.text}</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                        <SC label="协作" value={String(ch.analysis.collaboration ?? '—')} detail="" tone="blue" />
                        <SC label="风险" value={String(ch.analysis.riskAwareness ?? '—')} detail="" tone="blue" />
                        <SC label="沟通" value={String(ch.analysis.communication ?? '—')} detail="" tone="blue" />
                        <SC label="技术" value={String(ch.analysis.technicalJudgment ?? '—')} detail="" tone="blue" />
                      </div>
                    </div>
                  )) : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>未记录选择</p>}
                </div>
              );
            })}
          </div>
        ) : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginTop: 'var(--space-4)' }}>该岗位未配置分岔场景</p>}
      </section>
      {report.reverseQuestions.length > 0 && (
        <section className="panel" style={{ marginTop: 'var(--space-6)' }}>
          <span className="eyebrow">Candidate Questions</span>
          <h3>候选人反向提问</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            {report.reverseQuestions.map((q: any) => (
              <div key={q.id} style={{ background: 'var(--color-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <Badge tone="purple">{q.type}</Badge>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)' }}>{fmtDate(q.createdAt)}</span>
                </div>
                <p style={{ fontSize: 'var(--text-md)', fontWeight: 600, margin: '0 0 var(--space-3)', lineHeight: 'var(--leading-body)' }}>{q.question}</p>
                <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3) var(--space-4)', border: '1px solid var(--color-border)', borderLeft: '2px solid var(--color-accent)' }}>
                  <span className="eyebrow">AI 回复</span>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-soft)', lineHeight: 'var(--leading-body)', margin: 0 }}>{q.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function ActionsTab({ report }: { report: RealityReport }) {
  return (
    <>
      <TrustRepairTaskPanel tasks={report.trustRepairTasks} />
      <TrustNegotiationCardPanel card={report.trustNegotiationCard} />
      <InterviewBattleCardPanel card={report.interviewBattleCard} />
      <section className="panel" style={{ marginTop: 'var(--space-6)' }}>
        <span className="eyebrow">Invitation Script</span>
        <h3>邀约话术</h3>
        <div style={{ background: 'var(--color-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid var(--color-border)', marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-soft)', lineHeight: 'var(--leading-relaxed)', whiteSpace: 'pre-wrap' }}>{report.invitationScript || '暂无邀约话术建议。'}</div>
      </section>
    </>
  );
}

function GovernanceTab({ report }: { report: RealityReport }) {
  return (
    <>
      <TrustAuditLogPanel events={report.trustAuditLog} completenessRate={report.auditCompletenessRate} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
        <CandidateFairnessIndexPanel fairness={report.candidateFairnessIndex} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <AIRiskReviewPanel review={report.aiRiskReview} />
          <CommitmentConsistencyPanel check={report.commitmentConsistencyCheck} />
        </div>
      </div>
      <section className="panel" style={{ marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 'var(--leading-relaxed)' }}>
        {report.complianceNote || '本报告遵循AI辅助招聘合规要求。所有AI分析结果仅供参考，最终决策由HR人工完成。'}
      </section>
    </>
  );
}

function InterviewGuideTab({ report, job }: { report?: RealityReport; job?: Job }) {
  const gaps = buildGaps(report, job);
  const groups: Record<string, { label: string; color: string; items: any[] }> = {
    'must-ask': { label: '🔴 必问', color: 'var(--color-negative)', items: gaps.filter((g: any) => g.priority === 'must-ask') },
    confirm: { label: '🟠 确认', color: 'var(--color-warning)', items: gaps.filter((g: any) => g.priority === 'confirm') },
    highlight: { label: '🟢 高亮', color: 'var(--color-positive)', items: gaps.filter((g: any) => g.priority === 'highlight') },
  };
  return (
    <section className="panel">
      <span className="eyebrow">Interview Guide</span>
      <h3>面试指南</h3>
      <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>基于云试岗评分的结构化面试指引</p>
      <div style={{ display: 'flex', gap: 'var(--space-6)', margin: 'var(--space-6) 0', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-negative)' }} />必问（低于要求）</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-warning)' }} />确认（临界线）</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-positive)' }} />高亮（显著高于）</span>
      </div>
      {(['must-ask','confirm','highlight'] as const).map((key) => {
        const grp = groups[key];
        if (grp.items.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: key !== 'highlight' ? 'var(--space-6)' : 0 }}>
            <h4 style={{ color: grp.color, margin: '0 0 var(--space-3)', fontSize: 'var(--text-md)', fontWeight: 700 }}>{grp.label}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {grp.items.map((g: any) => {
                const diff = g.score - g.requirement;
                const tone: 'red'|'amber'|'green' = g.priority === 'must-ask' ? 'red' : g.priority === 'confirm' ? 'amber' : 'green';
                return (
                  <div key={g.dimension} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4) var(--space-6)', border: '1px solid var(--color-border)', borderLeft: `4px solid ${grp.color}` }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
                      <strong style={{ fontSize: 'var(--text-md)', color: 'var(--color-ink)' }}>{g.dimension}</strong>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>得分 {g.score} vs 要求 {g.requirement}<span style={{ fontWeight: 600, marginLeft: 'var(--space-2)', color: grp.color }}>({diff >= 0 ? '+' : ''}{diff})</span></span>
                      <Badge tone={tone}>{g.priority === 'must-ask' ? '必问' : g.priority === 'confirm' ? '确认' : '高亮'}</Badge>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-soft)', margin: 0, lineHeight: 'var(--leading-body)' }}>{g.question}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function SC({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: 'green'|'amber'|'blue'|'red' }) {
  const tints: Record<string, string> = { green: 'var(--color-positive-bg)', amber: 'var(--color-warning-bg)', blue: 'var(--color-accent-subtle)', red: 'var(--color-negative-bg)' };
  const borders: Record<string, string> = { green: 'var(--color-positive)', amber: 'var(--color-warning)', blue: 'var(--color-info)', red: 'var(--color-negative)' };
  return (
    <div style={{ background: tints[tone], borderRadius: 'var(--radius-sm)', padding: 'var(--space-4)', borderLeft: `3px solid ${borders[tone]}` }}>
      <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', marginBottom: 'var(--space-1)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-ink)', marginBottom: 'var(--space-1)' }}>{value}</div>
      {detail ? <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', lineHeight: 'var(--leading-body)' }}>{detail}</div> : null}
    </div>
  );
}

function AiMeta({ report }: { report: RealityReport }) {
  const m = report.aiMeta; const reviewed = report.humanReviewStatus === 'reviewed';
  return (
    <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-subtle)', borderRadius: 'var(--radius-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div><span className="eyebrow">AI Trace</span><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>AI生成来源与人工复核</div></div>
        <button className={reviewed ? 'ghost-button' : 'primary-button'} disabled={reviewed} onClick={() => markReportReviewed(report.id)} style={{ fontSize: 'var(--text-sm)' }}>{reviewed ? '✓ 已人工复核' : '确认已人工复核'}</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
        <span>来源：{m?.source === 'deepseek' ? 'DeepSeek' : '本地计算'}</span>
        {m?.model && <span>模型：{m.model}</span>}
        {typeof m?.latencyMs === 'number' && <span>耗时：{m.latencyMs}ms</span>}
      </div>
      {m?.fallback && <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', color: 'var(--color-warning)', fontWeight: 500 }}>真实AI不可用，本报告为本地计算，请HR人工确认。</div>}
    </div>
  );
}

function buildGaps(report?: RealityReport, job?: Job) {
  if (!report || !job) return [] as any[];
  const g: any[] = []; const a = report.attentionMap;
  if (a) {
    if (a.technology > 60) g.push({ dimension:'技术深度', score:a.technology, requirement:75, priority:'highlight', question:`在${job.title}岗位上，您如何看待技术选型的前瞻性和实用性之间的平衡？` });
    if (a.salary > 60) g.push({ dimension:'薪资期望', score:a.salary, requirement:70, priority:'confirm', question:`关于薪资范围${job.salaryMin}k-${job.salaryMax}k，您的期望是怎样的？` });
    if (a.team > 50) g.push({ dimension:'团队协作', score:a.team, requirement:75, priority:'confirm', question:'请描述一次您成功推动跨团队协作的经历。' });
    if (a.workload > 50) g.push({ dimension:'工作节奏', score:a.workload, requirement:70, priority:'must-ask', question:`${job.workload || '详见JD'}。您如何看待这种节奏？` });
    if (a.growth > 50) g.push({ dimension:'成长诉求', score:a.growth, requirement:70, priority:'confirm', question:`${job.growthPath || '详见JD'}。与您的规划匹配吗？` });
  }
  if (report.jobUnderstanding === '部分清晰' || report.jobUnderstanding === '存在偏差') g.push({ dimension:'岗位理解', score:report.jobUnderstanding==='部分清晰'?60:40, requirement:75, priority:'must-ask', question:'您对岗位职责还有哪些不太清楚的地方？' });
  if (g.length === 0) g.push({ dimension:'综合评估', score:80, requirement:75, priority:'confirm', question:'请描述一次您在工作中展现核心能力的具体经历。' });
  return g;
}

function fmtDate(iso: string): string { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('zh-CN', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }); }
