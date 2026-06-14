import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, LabelList, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Shield, Activity, Users, Briefcase, CheckCircle2 } from 'lucide-react';
import { useDemoState } from '../../store/demoStore';

/* ================================================================
   Color tokens (HR Dark Editorial palette — warm gold accents)
   ================================================================ */
const C = {
  accent:    '#C9A96E',
  positive:  '#5BAA80',
  warning:   '#D4A84B',
  negative:  '#D4696B',
  info:      '#6B9BB8',
  muted:     '#8B8F9A',
  ink:       '#E8E9EC',
  border:    '#2E3138',
  subtle:    '#262930',
  surface:   '#1E2128',
  accentLight: '#5A4F3A',
  accentFade:  '#3A3328',
};

/* ================================================================
   Helpers
   ================================================================ */
const pct = (part: number, total: number) => total > 0 ? Math.round((part / total) * 100) : 0;
const fmtPct = (v: number) => `${v}%`;

function KpiCard({ label, value, icon: Icon, trend, hint }: {
  label: string; value: string | number; icon: typeof TrendingUp;
  trend?: 'up' | 'down' | 'neutral'; hint?: string;
}) {
  return (
    <div className="kpi-card card-lift">
      <div className="kpi-icon"><Icon size={18} strokeWidth={1.5} /></div>
      <div className="kpi-body">
        <span className="kpi-label">{label}</span>
        <strong className="kpi-value">{value}</strong>
        {trend ? (
          <span className={`kpi-trend ${trend}`}>
            {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : null}
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* ================================================================
   Section 2: Funnel chart (custom shape labels)
   ================================================================ */
function FunnelSection({ metrics }: { metrics: ReturnType<typeof useDemoState>['metrics'] }) {
  const trialStarts = metrics.trialStarts ?? metrics.chatStarts;
  const trialCompletions = metrics.trialCompletions ?? metrics.chatCompletions;

  const stages = [
    { name: '访问', value: metrics.visits, fill: C.accentFade },
    { name: '开始云试岗', value: trialStarts, fill: C.accentLight },
    { name: '完成云试岗', value: trialCompletions, fill: C.accent },
    { name: '投递', value: metrics.applications, fill: C.info },
    { name: '邀约', value: metrics.interviewInvites, fill: C.positive },
    { name: '到面', value: metrics.attendedInterviews, fill: C.accent },
    { name: '入职', value: metrics.hires, fill: C.accent },
  ];

  const rates: string[] = [];
  for (let i = 1; i < stages.length; i++) {
    rates.push(`${pct(stages[i].value, stages[i - 1].value)}%`);
  }

  return (
    <section className="panel chart-panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">Recruitment Funnel</span>
          <h2>招聘转化漏斗</h2>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={stages} margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
          barSize={36}>
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: C.muted }} axisLine={{ stroke: C.border }} tickLine={false} />
          <YAxis hide />
          <Tooltip cursor={{ fill: C.subtle }} contentStyle={{ border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {stages.map((s, i) => <Cell key={i} fill={s.fill} />)}
            <LabelList dataKey="value" position="top" style={{ fontSize: 13, fontWeight: 600, fill: C.ink }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Conversion rate strip */}
      <div className="funnel-rates">
        {stages.slice(0, -1).map((s, i) => (
          <div key={i} className="funnel-rate-chip">
            <span>{s.name} → {stages[i + 1].name}</span>
            <strong>{rates[i]}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================================================================
   Section 3: Trust Radar + Governance KPIs
   ================================================================ */
function TrustGovernanceSection({ metrics }: { metrics: ReturnType<typeof useDemoState>['metrics'] }) {
  const trialStarts = metrics.trialStarts ?? metrics.chatStarts;
  const trialCompletions = metrics.trialCompletions ?? metrics.chatCompletions;
  const totalTasks = (metrics.pendingTrustRepairTasks ?? 0) + (metrics.handledTrustRepairTasks ?? 0);

  const radarData = [
    { dim: '岗位真相查看率', value: pct(metrics.truthLabelViews ?? 0, metrics.visits), full: 100 },
    { dim: '真相合约确认率', value: pct(metrics.truthContractAcknowledgements ?? 0, metrics.applications), full: 100 },
    { dim: '云试岗完成率', value: pct(trialCompletions, trialStarts), full: 100 },
    { dim: '信任修复处理率', value: pct(metrics.handledTrustRepairTasks ?? 0, totalTasks), full: 100 },
    { dim: 'AI复核通过率', value: pct(metrics.aiRiskReviewPasses ?? 0, metrics.applications), full: 100 },
    { dim: '候选人公平指数', value: metrics.candidateFairnessIndex ?? 0, full: 100 },
    { dim: '审计完整率', value: metrics.auditCompletenessRate ?? 0, full: 100 },
  ];

  return (
    <section className="panel chart-panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">Trust Health</span>
          <h2>信任治理健康度</h2>
        </div>
      </div>
      <div className="trust-governance-grid">
        <div className="radar-wrap">
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: C.muted }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke={C.accent} fill={C.accent} fillOpacity={0.18} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="governance-tiles">
          <GovernanceTile icon={Shield} label="待修复任务" value={metrics.pendingTrustRepairTasks ?? 0} color={C.warning} />
          <GovernanceTile icon={Activity} label="高沉默风险" value={metrics.highSilenceRiskCandidates ?? 0} color={C.negative} />
          <GovernanceTile icon={CheckCircle2} label="审计完整率" value={`${metrics.auditCompletenessRate ?? 0}%`} color={C.positive} />
          <GovernanceTile icon={Target} label="AI复核通过" value={metrics.aiRiskReviewPasses ?? 0} color={C.info} />
        </div>
      </div>
    </section>
  );
}

function GovernanceTile({ icon: Icon, label, value, color }: { icon: typeof Shield; label: string; value: string | number; color: string }) {
  return (
    <div className="governance-tile">
      <div className="gov-icon" style={{ background: `${color}14`, color }}><Icon size={18} strokeWidth={1.5} /></div>
      <div>
        <span>{label}</span>
        <strong style={{ color }}>{value}</strong>
      </div>
    </div>
  );
}

/* ================================================================
   Section 4: Conversion Rate Gauges
   ================================================================ */
function ConversionGauges({ metrics }: { metrics: ReturnType<typeof useDemoState>['metrics'] }) {
  const trialStarts = metrics.trialStarts ?? metrics.chatStarts;
  const trialCompletions = metrics.trialCompletions ?? metrics.chatCompletions;

  const gauges = [
    { label: '云试岗开始率', value: pct(trialStarts, metrics.visits), hint: `${trialStarts} / ${metrics.visits}` },
    { label: '云试岗完成率', value: pct(trialCompletions, trialStarts), hint: `${trialCompletions} / ${trialStarts}` },
    { label: '投递转化率', value: pct(metrics.applications, trialCompletions), hint: `${metrics.applications} / ${trialCompletions}` },
    { label: '邀约转化率', value: pct(metrics.interviewInvites, metrics.applications), hint: `${metrics.interviewInvites} / ${metrics.applications}` },
  ];

  return (
    <section className="panel chart-panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">Conversion Rates</span>
          <h2>关键转化率</h2>
        </div>
      </div>
      <div className="gauge-grid">
        {gauges.map((g) => (
          <GaugeCard key={g.label} {...g} />
        ))}
      </div>
    </section>
  );
}

function GaugeCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  const pctValue = Math.min(100, Math.max(0, value));
  const color = pctValue >= 70 ? C.positive : pctValue >= 40 ? C.warning : C.negative;
  const pieData = [
    { name: 'value', value: pctValue },
    { name: 'rest', value: 100 - pctValue },
  ];

  return (
    <div className="gauge-card">
      <div className="gauge-chart">
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie data={pieData} dataKey="value" innerRadius={38} outerRadius={52}
              startAngle={180} endAngle={0} cy="90%" stroke="none">
              <Cell fill={color} />
              <Cell fill={C.subtle} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="gauge-center">
          <strong style={{ color }}>{fmtPct(pctValue)}</strong>
        </div>
      </div>
      <span className="gauge-label">{label}</span>
      <span className="gauge-hint">{hint}</span>
    </div>
  );
}

/* ================================================================
   Section 5: Top 3 Insights
   ================================================================ */
function Top3Insights({
  metrics,
  realityReports,
  trialSessions,
}: {
  metrics: ReturnType<typeof useDemoState>['metrics'];
  realityReports: import('../../types').RealityReport[];
  trialSessions: import('../../types').TrialSession[];
}) {
  // Count actual occurrences of each reason from the real data
  function countInReports(reasons: string[], field: 'gapReasons' | 'unresolvedReasons'): Map<string, number> {
    const counts = new Map<string, number>();
    reasons.forEach((r) => counts.set(r, 0));
    realityReports.forEach((report) => {
      const entries: string[] =
        field === 'gapReasons'
          ? report.candidateTrustIndex.gapReasons
          : report.mutualConfirmation.unresolvedReasons;
      entries.forEach((entry) => {
        if (counts.has(entry)) counts.set(entry, (counts.get(entry) ?? 0) + 1);
      });
    });
    return counts;
  }

  function countExitReasons(reasons: string[]): Map<string, number> {
    const counts = new Map<string, number>();
    reasons.forEach((r) => counts.set(r, 0));
    trialSessions.forEach((session) => {
      if (session.exitReason && counts.has(session.exitReason)) {
        counts.set(session.exitReason, (counts.get(session.exitReason) ?? 0) + 1);
      }
    });
    return counts;
  }

  const lowTrustCounts = countInReports(metrics.lowTrustReasonTop3 ?? [], 'gapReasons');
  const unconfirmedCounts = countInReports(metrics.unconfirmedReasonTop3 ?? [], 'unresolvedReasons');
  const exitCounts = countExitReasons(metrics.candidateExitReasonTop3 ?? []);

  function makeItems(reasonNames: string[], counts: Map<string, number>, fallbackValues: number[]) {
    if (reasonNames.length === 0) return [];
    return reasonNames.map((name, i) => ({
      name,
      value: Math.max(1, counts.get(name) ?? fallbackValues[i] ?? 1),
    }));
  }

  const fallbackLow = [12, 8, 5];
  const fallbackUnconfirmed = [10, 7, 4];
  const fallbackExit = [9, 6, 3];

  const panels = [
    {
      title: '低信任原因 Top 3',
      items: makeItems(metrics.lowTrustReasonTop3 ?? [], lowTrustCounts, fallbackLow),
      color: C.warning,
      advice: '邀约前优先补充说明这些方面',
    },
    {
      title: '未确认原因 Top 3',
      items: makeItems(metrics.unconfirmedReasonTop3 ?? [], unconfirmedCounts, fallbackUnconfirmed),
      color: C.info,
      advice: '双向确认前建议先澄清这些疑问',
    },
    {
      title: '退出原因 Top 3',
      items: makeItems(metrics.candidateExitReasonTop3 ?? [], exitCounts, fallbackExit),
      color: C.negative,
      advice: '优化岗位真相表达以减少中途退出',
    },
  ];

  const maxInsightValue = Math.max(...panels.flatMap(p => p.items.map(it => it.value)), 1);

  return (
    <section className="panel chart-panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">Key Insights</span>
          <h2>关键洞察 Top 3</h2>
        </div>
      </div>
      <div className="insight-triple">
        {panels.map((p) => (
          <div key={p.title} className="insight-panel">
            <h3>{p.title}</h3>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={p.items} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                <XAxis type="number" hide domain={[0, Math.max(maxInsightValue + 5, 35)]} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: C.ink }} width={110} axisLine={false} tickLine={false} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {p.items.map((_, i) => <Cell key={i} fill={p.color} fillOpacity={0.85 - i * 0.15} />)}
                  <LabelList dataKey="value" position="right" style={{ fontSize: 12, fontWeight: 600, fill: p.color }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="insight-advice">{p.advice}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================================================================
   Section 6: AI Governance Summary
   ================================================================ */
function AIGovernanceSummary({ metrics }: { metrics: ReturnType<typeof useDemoState>['metrics'] }) {
  const evidence = metrics.evidenceSupportedAdviceCount ?? 0;
  const needsReview = metrics.humanConfirmationAdviceCount ?? 0;
  const total = evidence + needsReview;
  const evidencePct = total > 0 ? Math.round((evidence / total) * 100) : 0;
  const totalTasks = (metrics.pendingTrustRepairTasks ?? 0) + (metrics.handledTrustRepairTasks ?? 0);
  const repairRate = totalTasks > 0 ? Math.round(((metrics.handledTrustRepairTasks ?? 0) / totalTasks) * 100) : 0;

  const stackedData = [{ name: 'AI建议', evidence, needsReview }];

  return (
    <section className="panel chart-panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">AI Governance</span>
          <h2>AI治理摘要</h2>
        </div>
      </div>
      <div className="ai-governance-grid">
        {/* Stacked bar */}
        <div className="gov-stacked">
          <span className="gov-subtitle">AI建议证据质量</span>
          <ResponsiveContainer width="100%" height={60}>
            <BarChart data={stackedData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis type="number" hide domain={[0, Math.max(total, 1)]} />
              <YAxis type="category" dataKey="name" hide />
              <Bar dataKey="evidence" stackId="a" fill={C.positive} radius={[4, 0, 0, 4]} barSize={28} name="证据充分" />
              <Bar dataKey="needsReview" stackId="a" fill={C.warning} radius={[0, 4, 4, 0]} barSize={28} name="需人工确认" />
              <Tooltip cursor={false} />
            </BarChart>
          </ResponsiveContainer>
          <div className="stacked-legend">
            <span><i style={{ background: C.positive }} />证据充分 {evidence}条 ({evidencePct}%)</span>
            <span><i style={{ background: C.warning }} />需人工确认 {needsReview}条</span>
          </div>
        </div>

        {/* Repair task progress */}
        <div className="gov-metric-tile">
          <span>信任修复任务处理率</span>
          <strong>{repairRate}%</strong>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${repairRate}%`, background: C.positive }} />
          </div>
          <small>{metrics.handledTrustRepairTasks ?? 0} / {totalTasks} 已处理</small>
        </div>

        {/* Fairness */}
        <div className="gov-metric-tile">
          <span>候选人公平指数</span>
          <strong>{metrics.candidateFairnessIndex ?? 0}<em>/100</em></strong>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${metrics.candidateFairnessIndex ?? 0}%`, background: C.accent }} />
          </div>
          <small>7维度权益保障评估</small>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   MAIN ANALYTICS PAGE
   ================================================================ */
export function Analytics() {
  const { metrics, realityReports, trialSessions } = useDemoState();
  const trialStarts = metrics.trialStarts ?? metrics.chatStarts;
  const showRate = metrics.interviewInvites ? Math.round((metrics.attendedInterviews / metrics.interviewInvites) * 100) : 0;
  const trustHealth = metrics.recruitingTrustHealth;

  return (
    <main className="page analytics-dashboard">
      <div className="page-header">
        <div>
          <span className="eyebrow">Governance Metrics</span>
          <h1>招聘信任治理看板</h1>
          <p>基于真实行为数据的深度洞察。所有指标均为AI辅助估算，用于观察信任治理链路对招聘转化的改善空间。</p>
        </div>
      </div>

      {/* ======== SECTION 1: Executive KPI Strip ======== */}
      <div className="animate-in stagger-0">
        <section className="kpi-strip">
          <KpiCard label="招聘信任健康度" value={`${trustHealth?.total ?? 0}/100`} icon={Shield}
            trend={trustHealth && trustHealth.total >= 70 ? 'up' : trustHealth && trustHealth.total >= 40 ? 'neutral' : 'down'}
            hint="7因子加权" />
          <KpiCard label="总访问量" value={metrics.visits} icon={Users} trend="up" hint="岗位实境舱打开" />
          <KpiCard label="投递数" value={metrics.applications} icon={Briefcase}
            trend={metrics.applications >= 10 ? 'up' : 'neutral'} hint={`${pct(metrics.applications, trialStarts)}% 转化`} />
          <KpiCard label="邀约数" value={metrics.interviewInvites} icon={Target}
            trend={metrics.interviewInvites >= 5 ? 'up' : 'neutral'} hint={`${showRate}% 到面率`} />
          <KpiCard label="入职数" value={metrics.hires} icon={CheckCircle2}
            trend={metrics.hires > 0 ? 'up' : 'neutral'} hint={`${metrics.hires}人`} />
          <KpiCard label="AI复核通过" value={metrics.aiRiskReviewPasses ?? 0} icon={Activity}
            trend="up" hint={`${pct(metrics.aiRiskReviewPasses ?? 0, metrics.applications)}% 通过率`} />
        </section>
      </div>

      {/* ======== SECTION 2+3: Asymmetrical 2-Column Grid ======== */}
      <div className="analytics-two-col animate-in stagger-1">
        {/* LEFT (1.5fr): Funnel + Conversion Rates */}
        <div className="analytics-left-col">
          <FunnelSection metrics={metrics} />
          <ConversionGauges metrics={metrics} />
        </div>
        {/* RIGHT (1fr): Trust Radar + Governance Tiles */}
        <TrustGovernanceSection metrics={metrics} />
      </div>

      {/* ======== SECTION 4: Top 3 Insights (full-width) ======== */}
      <div className="animate-in stagger-2">
        <Top3Insights metrics={metrics} realityReports={realityReports} trialSessions={trialSessions} />
      </div>

      {/* ======== SECTION 5: AI Governance Summary (full-width) ======== */}
      <div className="animate-in stagger-3">
        <AIGovernanceSummary metrics={metrics} />
      </div>
    </main>
  );
}
