import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { useDemoState, overrideScore as saveOverride } from '../../store/demoStore';
import type { RealityReport, TrustRepairTask } from '../../types';
import styles from './Dashboard.module.css';

function buildRadarData(reports: RealityReport[]) {
  if (reports.length === 0) {
    return [
      { subject: '关注成长', A: 0, fullMark: 100 },
      { subject: '关注薪资', A: 0, fullMark: 100 },
      { subject: '关注团队', A: 0, fullMark: 100 },
      { subject: '关注节奏', A: 0, fullMark: 100 },
      { subject: '关注技术', A: 0, fullMark: 100 },
    ];
  }
  // Aggregate attentionMap from all reports
  const totals = { growth: 0, salary: 0, team: 0, workload: 0, technology: 0 };
  reports.forEach((r) => {
    if (r.attentionMap) {
      totals.growth += r.attentionMap.growth || 0;
      totals.salary += r.attentionMap.salary || 0;
      totals.team += r.attentionMap.team || 0;
      totals.workload += r.attentionMap.workload || 0;
      totals.technology += r.attentionMap.technology || 0;
    }
  });
  const count = reports.length;
  const labelMap: Record<string, string> = {
    growth: '关注成长', salary: '关注薪资', team: '关注团队',
    workload: '关注节奏', technology: '关注技术',
  };
  return Object.entries(totals).map(([key, total]) => ({
    subject: labelMap[key] || key,
    A: Math.round(total / count),
    fullMark: 100,
  }));
}

function buildHeatmapData(jobs: Array<{ department: string; title: string }>, reports: RealityReport[]) {
  const dimLabels = ['薪资福利', '技术栈', '团队氛围', '工作节奏', '成长路径'];
  const dimCounts: Record<string, number> = {};
  dimLabels.forEach((d) => { dimCounts[d] = 0; });

  // Count jobs by department as proxy for dimension interest
  jobs.forEach((j) => {
    if (j.title?.includes('前端') || j.title?.includes('后端') || j.title?.includes('全栈')) dimCounts['技术栈']++;
    if (j.department?.includes('销售')) { dimCounts['薪资福利']++; dimCounts['团队氛围']++; }
    if (j.department?.includes('研发')) dimCounts['工作节奏']++;
    if (j.department?.includes('产品')) dimCounts['成长路径']++;
  });

  // Add report-based adjustments from attentionMap
  reports.forEach((r) => {
    if (r.attentionMap) {
      if (r.attentionMap.salary > 30) dimCounts['薪资福利']++;
      if (r.attentionMap.technology > 30) dimCounts['技术栈']++;
      if (r.attentionMap.team > 30) dimCounts['团队氛围']++;
      if (r.attentionMap.workload > 30) dimCounts['工作节奏']++;
      if (r.attentionMap.growth > 30) dimCounts['成长路径']++;
    }
  });

  const max = Math.max(...Object.values(dimCounts), 1);
  return dimLabels.map((label) => ({
    node: label,
    clicks: dimCounts[label],
    pct: Math.round((dimCounts[label] / max) * 100),
  }));
}

const DIMENSIONS: Array<{ key: string; label: string }> = [
  { key: 'truthLabelViewRate', label: '岗位真相查看率' },
  { key: 'truthContractAcknowledgementRate', label: '真相合约确认率' },
  { key: 'trialCompletionRate', label: '云试岗完成率' },
  { key: 'trustRepairTaskHandledRate', label: '信任修复任务处理率' },
  { key: 'aiRiskReviewPassRate', label: 'AI风险复核通过率' },
  { key: 'candidateFairnessIndex', label: '候选人公平指数' },
  { key: 'auditCompletenessRate', label: '审计完整率' },
];

export function Dashboard() {
  const { jobs, candidates, metrics, realityReports, trustRepairTasks, latestCandidateActivity, scoreOverrides } = useDemoState();
  const trustHealth = metrics.recruitingTrustHealth;
  const completionRate = metrics.chatStarts ? Math.round((metrics.chatCompletions / metrics.chatStarts) * 100) : 0;
  const pendingTasks = metrics.pendingTrustRepairTasks ?? 0;
  const priorityActions = buildPriorityActions(realityReports, trustRepairTasks).slice(0, 3);

  // Compute current AI scores for each dimension (mirrors normalizeDemoState logic)
  const totalTrustTasks = (metrics.pendingTrustRepairTasks ?? 0) + (metrics.handledTrustRepairTasks ?? 0);
  const truthLabelViewRate = metrics.visits > 0 ? Math.round(((metrics.truthLabelViews ?? 0) / metrics.visits) * 100) : 0;
  const truthContractAcknowledgementRate = metrics.applications > 0 ? Math.round(((metrics.truthContractAcknowledgements ?? 0) / metrics.applications) * 100) : 0;
  const trialCompletionRate = (metrics.trialStarts ?? 0) > 0 ? Math.round(((metrics.trialCompletions ?? 0) / Math.max(1, metrics.trialStarts ?? 0)) * 100) : 0;
  const trustRepairTaskHandledRate = totalTrustTasks > 0 ? Math.round(((metrics.handledTrustRepairTasks ?? 0) / totalTrustTasks) * 100) : 0;
  const aiRiskReviewPassRate = realityReports.length > 0 ? Math.round(((metrics.aiRiskReviewPasses ?? 0) / realityReports.length) * 100) : 0;
  const dimScores: Record<string, number> = {
    truthLabelViewRate,
    truthContractAcknowledgementRate,
    trialCompletionRate,
    trustRepairTaskHandledRate,
    aiRiskReviewPassRate,
    candidateFairnessIndex: metrics.candidateFairnessIndex ?? 0,
    auditCompletenessRate: metrics.auditCompletenessRate ?? 0,
  };

  // Local state for inline HR override edits
  const [editHrScores, setEditHrScores] = useState<Record<string, string>>({});
  const [editAnnotations, setEditAnnotations] = useState<Record<string, string>>({});

  function getOverride(dimKey: string) {
    return scoreOverrides.find((o) => o.dimension === dimKey);
  }

  function handleOverrideApply(dimKey: string) {
    const hrScore = Number(editHrScores[dimKey]);
    const annotation = editAnnotations[dimKey] ?? '';
    if (!isNaN(hrScore)) {
      saveOverride(dimKey, hrScore, annotation);
    }
  }

  return (
    <div className={styles.hrWorkspace}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            沙盘观测站
            {trustHealth && (
              <span className={styles.goldAccent}> · 信任健康度 {trustHealth.total}</span>
            )}
          </h1>
          <p className={styles.subtitle}>
            实时汇总云试岗评测数据与候选人探索行为。AI辅助分析，人工复核决策。
          </p>
        </div>
        <button className={styles.exportBtn}>导出观测报告</button>
      </header>

      {/* KPI Strip */}
      <div className={styles.gridTop}>
        <div className={styles.card}>
          <span className={styles.cardHeader}>发布岗位数</span>
          <div className={styles.kpiValue} style={{ color: 'var(--color-ink)' }}>
            {jobs.length}<span style={{ fontSize: '1.25rem', color: 'var(--color-muted)' }}> 个</span>
          </div>
        </div>
        <div className={styles.card}>
          <span className={styles.cardHeader}>待处理信任修复</span>
          <div className={styles.kpiValue} style={{ color: pendingTasks > 0 ? 'var(--color-warning)' : 'var(--color-positive)' }}>
            {pendingTasks}<span style={{ fontSize: '1.25rem', color: 'var(--color-muted)' }}> 项</span>
          </div>
        </div>
        <div className={styles.card}>
          <span className={styles.cardHeader}>云试岗完成率</span>
          <div className={styles.kpiValue} style={{ color: 'var(--color-ink)' }}>
            {completionRate}<span style={{ fontSize: '1.25rem', color: 'var(--color-muted)' }}>%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Action Brief + Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left: Priority Actions */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>今日优先行动</div>
          {priorityActions.length === 0 ? (
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>暂无高优先级信任修复任务。</p>
          ) : (
            priorityActions.map((item, i) => (
              <Link key={i} to={`/hr/candidates/${item.candidateId}`} className={styles.actionRow}>
                <span className={styles.actionRank}>{i + 1}</span>
                <div className={styles.actionBody}>
                  <strong>{item.title}</strong>
                  <p>{item.trigger}</p>
                  <em>{item.action}</em>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Right: Radar */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>沙盘行为特征云图</div>
          <div style={{ flex: 1, minHeight: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={buildRadarData(realityReports)}>
                <PolarGrid stroke="#2D3748" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} />
                <Radar name="候选人均值" dataKey="A" stroke="#C9A96E" fill="#C9A96E" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Manual HR Score Override */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>观测者覆写 · AI信任健康分手动干预</div>
          <p className={styles.overrideHint}>
            AI自动计算各维度得分；HR可根据实际情况覆盖分值并备注原因，用于审计追溯。
          </p>
          <div className={styles.overrideGrid}>
            {DIMENSIONS.map((dim) => {
              const aiScore = dimScores[dim.key];
              const override = getOverride(dim.key);
              const displayScore = override ? override.hrScore : aiScore;
              const hrInputValue = editHrScores[dim.key] ?? (override ? String(override.hrScore) : '');
              const annValue = editAnnotations[dim.key] ?? (override ? override.annotation : '');
              const hasOverride = !!override;
              return (
                <div key={dim.key} className={styles.overrideRow}>
                  <div className={styles.overrideDimLabel}>{dim.label}</div>
                  <div className={`${styles.overrideScore} ${hasOverride ? styles.overrideScoreEdited : ''}`}>
                    {displayScore}
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="HR校准分"
                    className={styles.overrideInput}
                    value={hrInputValue}
                    onChange={(e) => setEditHrScores((prev) => ({ ...prev, [dim.key]: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="备注原因..."
                    className={styles.overrideAnnotation}
                    value={annValue}
                    onChange={(e) => setEditAnnotations((prev) => ({ ...prev, [dim.key]: e.target.value }))}
                  />
                  <button
                    className={styles.overrideApplyBtn}
                    onClick={() => handleOverrideApply(dim.key)}
                    disabled={!editHrScores[dim.key] && !editAnnotations[dim.key]}
                  >
                    应用
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Latest Candidate Activity */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>候选人实时动态</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {latestCandidateActivity.slice(0, 3).length === 0 ? (
              <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', margin: 0 }}>暂无候选人动态，开始云试岗后这里会出现实时行为记录。</p>
            ) : (
              latestCandidateActivity.slice(0, 3).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < Math.min(latestCandidateActivity.length, 3) - 1 ? '1px solid #2D3748' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-positive)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--color-ink)' }}>{item.candidateName}</strong>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginLeft: 8 }}>{item.action}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                    {new Date(item.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Heatmap + Candidate Queue */}
      <div className={styles.gridMain}>
        {/* Heatmap */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>星系图探索热力分布</div>
          <div style={{ flex: 1 }}>
            {buildHeatmapData(jobs, realityReports).map((item, i) => (
              <div key={i} className={styles.heatBarContainer}>
                <div className={styles.heatLabel}>{item.node}</div>
                <div className={styles.heatTrack}>
                  <div className={styles.heatFill} style={{ width: `${item.pct}%`, opacity: 1 - i * 0.15 }} />
                </div>
                <div className={styles.heatValue}>{item.clicks}</div>
              </div>
            ))}
            <div className={styles.insightCard}>
              <p>
                <span className={styles.goldAccent}>AI洞察：</span>
                近期候选人对「薪资福利」和「技术栈」的点击率极高，建议在对外JD中前置这两部分信息以提升转化率。
              </p>
            </div>
          </div>
        </div>

        {/* Candidate Queue */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>候选人队列</div>
          <div style={{ flex: 1 }}>
            {candidates.slice(0, 5).map((c) => {
              const r = realityReports.find((x) => x.candidateId === c.id);
              const trustTotal = r?.candidateTrustIndex.total ?? 0;
              return (
                <Link key={c.id} to={`/hr/candidates/${c.id}`} className={styles.candidateRow}>
                  <div className={styles.candidateAvatar}>{c.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--color-ink)' }}>{c.name}</strong>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', display: 'block' }}>{c.sourceChannel}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: 2, background: trustTotal >= 75 ? 'var(--color-positive-bg)' : trustTotal >= 50 ? 'var(--color-warning-bg)' : 'var(--color-negative-bg)', color: trustTotal >= 75 ? 'var(--color-positive)' : trustTotal >= 50 ? 'var(--color-warning)' : 'var(--color-negative)' }}>{c.status}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 600, color: trustTotal >= 75 ? 'var(--color-positive)' : trustTotal >= 50 ? 'var(--color-warning)' : 'var(--color-negative)' }}>{trustTotal}</span>
                  </div>
                </Link>
              );
            })}
            <Link to="/hr/candidates" style={{ display: 'block', textAlign: 'center', padding: '0.75rem', color: 'var(--color-accent)', fontSize: '0.875rem', textDecoration: 'none', marginTop: '0.5rem' }}>
              查看全部候选人
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildPriorityActions(reports: RealityReport[], tasks: TrustRepairTask[]) {
  const items: Array<{ candidateId: string; candidateName: string; title: string; trigger: string; action: string; status: string; priority: number }> = [];

  reports.forEach((report) => {
    if (report.silenceRisk.level === '高' || report.silenceRisk.possibleReasons.length >= 3) {
      items.push({ candidateId: report.candidateId, candidateName: report.candidateName, title: `处理 ${report.candidateName} 的沉默风险`, trigger: report.silenceRisk.possibleReasons[0] || '候选人存在沟通信号不足', action: report.silenceRisk.suggestedActions[0] || report.silenceRisk.wakeUpScript, status: '高沉默风险', priority: 1 });
    }
    if (report.commitmentConsistencyCheck.riskLevel !== '低' && report.commitmentConsistencyCheck.findings.length > 0) {
      items.push({ candidateId: report.candidateId, candidateName: report.candidateName, title: `补齐 ${report.candidateName} 的岗位承诺缺口`, trigger: report.commitmentConsistencyCheck.findings[0], action: report.commitmentConsistencyCheck.suggestions[0] || '补充岗位承诺一致性说明', status: '需HR补充', priority: 3 });
    }
    const weakAdvice = report.adviceEvidenceTags.find((t) => t.status === '需人工确认');
    if (weakAdvice) {
      items.push({ candidateId: report.candidateId, candidateName: report.candidateName, title: `确认 ${report.candidateName} 的证据不足建议`, trigger: weakAdvice.reason, action: weakAdvice.advice, status: '需人工确认', priority: 4 });
    }
  });

  tasks.filter((t) => !t.handledAt).forEach((t) => {
    items.push({ candidateId: t.candidateId, candidateName: t.candidateName, title: t.title, trigger: t.trigger, action: t.suggestedAction, status: '待处理', priority: 2 });
  });

  return items.sort((a, b) => a.priority - b.priority);
}
