import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { useDemoState } from '../../store/demoStore';

function trustDotTone(score: number): 'green' | 'amber' | 'red' {
  if (score >= 80) return 'green';
  if (score >= 60) return 'amber';
  return 'red';
}

function silenceTone(signals: number): 'green' | 'amber' | 'red' {
  if (signals >= 3) return 'red';
  if (signals >= 2) return 'amber';
  return 'green';
}

function progressBarHue(pct: number): string {
  if (pct >= 80) return 'var(--color-positive)';
  if (pct >= 50) return 'var(--color-accent)';
  return 'var(--color-warning)';
}

function ringColor(tone: 'green' | 'amber' | 'red'): string {
  if (tone === 'green') return 'var(--color-positive)';
  if (tone === 'amber') return 'var(--color-warning)';
  return 'var(--color-negative)';
}

export function Candidates() {
  const { candidates, jobs, realityReports } = useDemoState();
  const [filter, setFilter] = useState('全部');

  const filtered = filter === '全部' ? candidates : candidates.filter((c) => {
    if (filter === '已投递') return c.status === '已投递';
    if (filter === '已邀约') return c.status === '已邀约';
    if (filter === '已入库') return c.status === '已入库';
    return true;
  });

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">云试岗候选人队列</span>
          <h1>按真实意愿、信任状态和治理任务处理候选人</h1>
          <p>查看云试岗完成度、信任指数、沉默风险和HR行动建议，优先处理需要先澄清再邀约的人。</p>
        </div>
      </div>

      <div
        className="filter-row"
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
          flexWrap: 'wrap',
        }}
      >
        {['全部', '已投递', '已邀约', '已入库'].map((f) => (
          <button key={f} className={`toggle-chip${filter === f ? ' selected' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="暂无候选人"
          description="分享岗位链接给候选人，他们完成沙盘推演或直接投递后，就会出现在这里。你可以查看他们的云试岗报告和 AI 萃取的能力画像。"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((candidate) => {
            const job = jobs.find((item) => item.id === candidate.jobId);
            const report = realityReports.find((item) => item.candidateId === candidate.id);
            const silenceSignals = report?.silenceRisk.possibleReasons.length ?? 0;
            const trustTotal = report?.candidateTrustIndex.total ?? null;
            const tone = trustTotal !== null ? trustDotTone(trustTotal) : 'amber';

            return (
              <div
                key={candidate.id}
                className="panel card-lift"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-3) var(--space-4)',
                }}
              >
                {/* Avatar circle — 36px, first char of name */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'var(--color-accent)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {candidate.name.charAt(0)}
                </div>

                {/* Name + email */}
                <div style={{ minWidth: 0, flex: '0 0 150px' }}>
                  <strong
                    style={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {candidate.name}
                  </strong>
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-muted)',
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {candidate.email}
                  </span>
                </div>

                {/* Trust score — small metric-ring 48px */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background:
                      trustTotal !== null
                        ? `conic-gradient(${ringColor(tone)} ${trustTotal * 3.6}deg, var(--color-subtle) 0deg)`
                        : 'var(--color-subtle)',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 5,
                      borderRadius: '50%',
                      background: 'var(--color-surface)',
                    }}
                  />
                  <span
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {trustTotal !== null ? trustTotal : '—'}
                  </span>
                </div>

                {/* Completion — inline progress bar */}
                <div style={{ flex: 1, minWidth: 100 }}>
                  {report ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${report.trialCompletion}%`,
                            background: progressBarHue(report.trialCompletion),
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          minWidth: '2.6rem',
                          textAlign: 'right',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {report.trialCompletion}%
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                      待确认
                    </span>
                  )}
                </div>

                {/* Key badges: status, silence risk, HR action */}
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Badge tone={candidate.status === '已邀约' ? 'green' : 'purple'}>
                    {candidate.status}
                  </Badge>
                  <Badge tone={silenceTone(silenceSignals)}>
                    {report?.silenceRisk.level ?? '待确认'}
                  </Badge>
                  <Badge
                    tone={
                      report?.hrActionSuggestion === '优先邀约'
                        ? 'green'
                        : report?.hrActionSuggestion === '建议入库观察'
                          ? 'amber'
                          : 'purple'
                    }
                  >
                    {report?.hrActionSuggestion ?? 'HR行动建议'}
                  </Badge>
                </div>

                {/* Action link */}
                <Link
                  to={`/hr/candidates/${candidate.id}`}
                  style={{ flexShrink: 0, fontSize: 'var(--text-sm)' }}
                >
                  查看报告
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
