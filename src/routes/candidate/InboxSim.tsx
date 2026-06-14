import { useEffect, useMemo, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, X } from 'lucide-react';
import { useWorkdaySimStore } from '../../store/workdaySimStore';
import { useDemoState, saveInboxSimResult } from '../../store/demoStore';
import { generateWorkdaySimScenario } from '../../mock/workdaySimMock';
import { SimSidebar } from '../../components/inbox/SimSidebar';
import { DetailPanel } from '../../components/inbox/DetailPanel';
import { MessageCard } from '../../components/inbox/MessageCard';
import type { SimulationActionType } from '../../types';

export function InboxSim() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const state = useDemoState();
  const job = state.jobs.find((j) => j.id === jobId);
  const store = useWorkdaySimStore();

  const scenario = useMemo(() => (job ? generateWorkdaySimScenario(job) : null), [job]);

  // Init session on mount
  useEffect(() => {
    if (!job || !scenario) return;
    const sessionId = `sim-${Date.now()}`;
    store.initSession({ sessionId, jobId: job.id, candidateId: 'candidate-temp', scenario });
    return () => { store.reset(); };
  }, [job, scenario]);

  const handleAction = (messageId: string, actionType: SimulationActionType, payload?: Record<string, string | undefined>) => {
    useWorkdaySimStore.getState().performAction(messageId, actionType, payload as any);
  };

  const handleStart = () => {
    useWorkdaySimStore.setState({ showBriefing: false });
    useWorkdaySimStore.getState().connect();
    useWorkdaySimStore.getState().startTimer();
    useWorkdaySimStore.getState().resetGhostTimer();
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't intercept when typing in an input/textarea
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const store = useWorkdaySimStore.getState();
    const sel = store.selectedMessageId;
    const msg = sel ? store.messages.find((m) => m.id === sel) : null;

    switch (e.key.toLowerCase()) {
      case 'r':
        // Open reply: if no detail panel, open it; reply requires text input
        if (!sel) break;
        if (!store.selectedMessageId) { store.setSelectedMessage(sel); }
        break;
      case 'd':
        // Quick defer: works even without detail panel
        if (!sel || !msg || msg.handled) break;
        store.performAction(sel, 'defer', { deferReason: '快速标记稍后' });
        break;
      case 'f':
        // Open delegate: needs detail panel for target selection
        if (!sel) break;
        if (!store.selectedMessageId) { store.setSelectedMessage(sel); }
        break;
      case 'i':
        // Quick ignore: for low/medium urgency, direct; for high/critical, skip (needs UI confirm)
        if (!sel || !msg || msg.handled) break;
        if (msg.urgency === 'critical' || msg.urgency === 'high') {
          // Critical/high messages need explicit confirmation via UI
          store.setSelectedMessage(sel);
          break;
        }
        store.performAction(sel, 'ignore');
        break;
      case 'escape':
        store.setSelectedMessage(null);
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!job || !scenario) {
    return (
      <main style={{ padding: 'var(--cr-space-5xl)', textAlign: 'center', background: 'var(--cr-base)', minHeight: '100vh' }}>
        <div className="cr-empty-state"><h3>模拟内容准备中</h3></div>
      </main>
    );
  }

  // Count unique senders for channel header
  const memberCount = useMemo(() => {
    const seen = new Set<string>();
    scenario.messageScript.forEach((m) => seen.add(m.sender.name));
    return seen.size;
  }, [scenario]);

  const isSales = scenario.title?.includes('销售') || scenario.description?.includes('销售');
  const channelName = isSales ? '销售战报' : '项目进展';

  const selectedMessage = store.messages.find((m) => m.id === store.selectedMessageId) ?? null;

  // Notification toast for new messages while detail panel is open
  const [toast, setToast] = useState<{ messageId: string; senderName: string; subject: string } | null>(null);
  const prevMsgCountRef = useMemo(() => store.messages.length, []);

  useEffect(() => {
    if (store.messages.length > prevMsgCountRef.current && store.selectedMessageId) {
      const latest = store.messages[store.messages.length - 1];
      if (latest && latest.id !== store.selectedMessageId) {
        setToast({ messageId: latest.id, senderName: latest.sender.name, subject: latest.subject });
        setTimeout(() => setToast(null), 4000);
      }
    }
    // Track via ref to avoid stale closure
  }, [store.messages.length, store.selectedMessageId]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cr-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Briefing phase — warm frame */}
      {store.showBriefing ? (
        <BriefingView scenario={scenario} jobTitle={job.title} onStart={handleStart} />
      ) : store.showSummary ? (
        /* Summary phase — warm frame */
        <div style={{ maxWidth: 'var(--cr-content-lg)', margin: '0 auto', padding: 'var(--cr-space-3xl) var(--cr-page-padding)', width: '100%' }}>
          <SimulationSummaryView result={store.result} session={store.session!} onExit={() => {
            navigate(`/candidate/profile/${job.id}?simId=${store.session?.id ?? ''}`);
            try { if (store.result) saveInboxSimResult(job.id, store.result); } catch {}
          }} />
        </div>
      ) : (
        /* Active simulation — cool interior */
        <div className="sim-shell">
          <SimSidebar
            scenario={scenario}
            selectedMessageId={store.selectedMessageId}
          />

          <div className="sim-main">
            {/* Channel header */}
            <div className="sim-channel-header">
              <Hash size={16} style={{ color: 'var(--sim-ink-dim)', flexShrink: 0 }} />
              <span className="sim-channel-name">{channelName}</span>
              <span className="sim-channel-meta">· {memberCount} 名成员</span>
            </div>

            {/* Search placeholder */}
            <div className="sim-search-bar" style={{ margin: '10px 12px' }}>
              🔍 搜索消息...
              <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.35 }}>⌘K</span>
            </div>

            {/* Message feed */}
            <div className="sim-feed" style={{ padding: '0 var(--cr-space-lg) var(--cr-space-lg)' }}>
              {store.messages.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ textAlign: 'center', padding: 'var(--cr-space-5xl) var(--cr-space-xl)' }}>
                  <div className="cr-loading-spinner" style={{ margin: '0 auto 16px' }} />
                  <p style={{ fontSize: 'var(--sim-text-md)', fontWeight: 600, color: 'var(--sim-ink)' }}>等待消息到达...</p>
                  <p style={{ fontSize: 'var(--sim-text-xs)', color: 'var(--sim-ink-dim)', marginTop: 4 }}>模拟正在准备你的工作日消息流</p>
                  <p style={{ fontSize: 10, color: 'var(--sim-ink-dim)', marginTop: 6, fontFamily: 'var(--sim-font-mono)' }}>
                    第一条消息将在几秒后到达 · 你可以回复、稍后、转发或忽略每条消息
                  </p>
                </motion.div>
              )}

              {/* Active (unhandled, not deferred) messages */}
              {store.messages.filter((m) => !m.handled && !store.deferredMessageIds.has(m.id)).map((msg) => (
                <MessageCard
                  key={msg.id}
                  message={msg}
                  isSelected={store.selectedMessageId === msg.id}
                  isNew={!store.readMessageIds.has(msg.id)}
                  showInlineActions={!selectedMessage}
                  onSelect={(id) => {
                    store.markRead(id);
                    store.setSelectedMessage(store.selectedMessageId === id ? null : id);
                  }}
                  onAction={(type, payload) => handleAction(msg.id, type, payload)}
                />
              ))}

              {/* Deferred section */}
              {store.messages.filter((m) => store.deferredMessageIds.has(m.id) && !m.handled).length > 0 && (
                <>
                  <div className="sim-msg-group-divider" style={{ marginTop: 18 }}>
                    稍后处理 · {store.messages.filter((m) => store.deferredMessageIds.has(m.id) && !m.handled).length} 条
                  </div>
                  {store.messages.filter((m) => store.deferredMessageIds.has(m.id) && !m.handled).map((msg) => (
                    <MessageCard
                      key={msg.id}
                      message={msg}
                      isSelected={store.selectedMessageId === msg.id}
                      isNew={false}
                      showInlineActions={!selectedMessage}
                      onSelect={(id) => {
                        store.markRead(id);
                        store.setSelectedMessage(store.selectedMessageId === id ? null : id);
                      }}
                      onAction={(type, payload) => handleAction(msg.id, type, payload)}
                    />
                  ))}
                </>
              )}

              {/* Handled section */}
              {store.messages.filter((m) => m.handled).length > 0 && (
                <>
                  <div className="sim-msg-group-divider" style={{ marginTop: 18 }}>
                    已处理 · {store.messages.filter((m) => m.handled).length} 条
                  </div>
                  {store.messages.filter((m) => m.handled).map((msg) => (
                    <MessageCard
                      key={msg.id}
                      message={msg}
                      isSelected={store.selectedMessageId === msg.id}
                      isNew={false}
                      showInlineActions={!selectedMessage}
                      onSelect={(id) => {
                        store.markRead(id);
                        store.setSelectedMessage(store.selectedMessageId === id ? null : id);
                      }}
                      onAction={(type, payload) => handleAction(msg.id, type, payload)}
                    />
                  ))}
                </>
              )}

              {store.messages.length > 0 && store.scenario && store.messages.length >= store.scenario.messageScript.length && store.messages.every((m) => m.handled) && !store.showSummary && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  style={{ textAlign: 'center', padding: 'var(--cr-space-xl)', background: '#F0FDF4', borderRadius: 'var(--sim-radius-lg)', border: '1px solid #22C55E', marginTop: 12 }}>
                  <p style={{ fontSize: 'var(--sim-text-md)', fontWeight: 600, color: '#16A34A' }}>所有消息已处理 ✓</p>
                  <p style={{ fontSize: 'var(--sim-text-xs)', color: 'var(--sim-ink-dim)', marginTop: 2 }}>正在生成你的能力分析...</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Notification toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                className="sim-toast"
                onClick={() => {
                  store.markRead(toast.messageId);
                  store.setSelectedMessage(toast.messageId);
                  setToast(null);
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--sim-text-xs)', fontWeight: 600, color: 'var(--sim-ink)', marginBottom: 2 }}>
                    ⚡ {toast.senderName} · 新消息
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--sim-ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {toast.subject}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setToast(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sim-ink-dim)', padding: 2 }}>
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Detail panel (slides in on desktop, overlay on mobile) */}
          {selectedMessage && (
            <DetailPanel message={selectedMessage} onAction={handleAction} onClose={() => store.setSelectedMessage(null)} />
          )}
        </div>
      )}
    </div>
  );
}

/* ── Briefing (warm frame, kept from original) ── */
import { SimulationBriefing } from '../../components/inbox/SimulationBriefing';
function BriefingView({ scenario, jobTitle, onStart }: { scenario: import('../../types').SimulationScenario; jobTitle: string; onStart: () => void }) {
  return <SimulationBriefing scenario={scenario} jobTitle={jobTitle} onStart={onStart} />;
}

/* ── Summary (warm frame) ── */
function SimulationSummaryView({ result, session, onExit }: { result: import('../../types').SimulationResult | null; session: import('../../types').SimulationSession; onExit: () => void }) {
  if (!result) {
    return (
      <div className="cr-loading-state">
        <div className="cr-loading-spinner" />
        <h3 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 18, fontWeight: 600 }}>正在分析你的工作日表现</h3>
        <p style={{ fontSize: 14, color: 'var(--cr-ink-dim)', maxWidth: 360, textAlign: 'center' }}>
          AI 正在从优先级判断、沟通质量、利益相关方管理、情绪稳定性和任务管理五个维度深度分析你的表现。
        </p>
      </div>
    );
  }

  const toneLabel = (t: string) => t === 'assertive' ? '果断直接' : t === 'collaborative' ? '协作友好' : t === 'deferring' ? '委婉谨慎' : t === 'avoidant' ? '回避倾向' : '中性平稳';
  const urgencyLabel = (u: string) => u === 'critical' ? '紧急' : u === 'high' ? '重要' : u === 'medium' ? '普通' : '信息';
  const colors = ['#059669', '#6366F1', '#D97706', '#2563EB', '#7C3AED'];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="cr-card-elevated" style={{ textAlign: 'center' }}>
        <span className="cr-eyebrow" style={{ textAlign: 'center' }}>工作日模拟分析报告</span>
        <h2 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 'var(--cr-text-2xl)', fontWeight: 700, color: 'var(--cr-ink)', margin: '4px 0 12px' }}>
          你的工作日表现分析
        </h2>
        <p style={{ fontSize: 15, color: 'var(--cr-ink-dim)', lineHeight: 1.8, marginBottom: 0 }}>
          {result.narrativeSummary || '基于你在模拟中的消息处理模式生成的分析报告。'}
        </p>
      </div>

      {/* Competency Scores */}
      <div className="cr-card">
        <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 16 }}>🎯 能力维度分析</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {result.competencyScores.map((comp, i) => (
            <div key={comp.competency} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 'var(--cr-space-lg)', borderRadius: 'var(--cr-radius-md)', background: 'var(--cr-subtle-warm)', borderLeft: `4px solid ${colors[i % colors.length]}` }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56, flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--cr-font-display)', fontSize: 28, fontWeight: 700, color: colors[i % colors.length] }}>{comp.score}</div>
                <span style={{ fontSize: 10, color: 'var(--cr-muted)' }}>分</span>
                <span style={{ marginTop: 4, padding: '2px 8px', borderRadius: 'var(--cr-radius-full)', fontSize: 10, fontWeight: 600, background: comp.interpretation === '强' ? 'var(--cr-positive-bg)' : comp.interpretation === '中' ? 'var(--cr-warning-bg)' : 'var(--cr-negative-bg)', color: comp.interpretation === '强' ? 'var(--cr-positive)' : comp.interpretation === '中' ? 'var(--cr-warning)' : 'var(--cr-negative)' }}>{comp.interpretation}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 4 }}>
                  {{ prioritization: '优先级判断', communication: '沟通质量', stakeholder_management: '利益相关方管理', emotional_regulation: '情绪稳定性', task_management: '任务管理' }[comp.competency] ?? comp.competency}
                </div>
                <p style={{ fontSize: 13, color: 'var(--cr-ink-soft)', lineHeight: 1.7, margin: 0 }}>{comp.narrative || '基于消息处理模式的分析'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two column: Action Dist + Response Time */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cr-space-lg)' }}>
        <div className="cr-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 14 }}>📊 操作分布</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[{ label: '回复', count: result.actionDistribution.reply, color: '#059669', desc: '直接回复消息' }, { label: '稍后', count: result.actionDistribution.defer, color: '#D97706', desc: '标记为稍后处理' }, { label: '转发', count: result.actionDistribution.delegate, color: '#6366F1', desc: '转交给其他同事' }, { label: '忽略', count: result.actionDistribution.ignore, color: '#94A3B8', desc: '不处理该消息' }].map((a) => (
              <div key={a.label} style={{ padding: 'var(--cr-space-lg)', background: `${a.color}08`, borderRadius: 'var(--cr-radius-md)', border: `1px solid ${a.color}22`, textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: a.color, fontFamily: 'var(--cr-font-display)' }}>{a.count}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cr-ink)', marginTop: 2 }}>{a.label}</div>
                <div style={{ fontSize: 10, color: 'var(--cr-muted)', marginTop: 2 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="cr-card">
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 14 }}>⏱️ 响应时间</h3>
          {result.responsePatterns.length > 0 ? result.responsePatterns.map((p) => (
            <div key={p.urgencyTier} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--cr-ink)', width: 42 }}>{urgencyLabel(p.urgencyTier)}</span>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--cr-border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: p.urgencyTier === 'critical' ? '#DC2626' : p.urgencyTier === 'high' ? '#D97706' : 'var(--cr-accent)', width: `${Math.min(100, Math.max(5, p.count > 0 ? (p.averageResponseMs / 120000) * 100 : 0))}%`, transition: 'width 0.8s ease' }} />
              </div>
              <span style={{ fontFamily: 'var(--cr-font-mono)', fontSize: 11, color: 'var(--cr-muted)', minWidth: 60, textAlign: 'right' }}>
                {p.count > 0 ? `${Math.round(p.averageResponseMs / 1000)}s` : '—'}
              </span>
            </div>
          )) : <p style={{ fontSize: 13, color: 'var(--cr-muted)' }}>无响应数据</p>}
          {result.prioritizationScore > 0 && (
            <div style={{ marginTop: 12, padding: 'var(--cr-space-md)', borderRadius: 'var(--cr-radius-md)', background: 'var(--cr-accent-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--cr-muted)' }}>优先级评分</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--cr-accent)', fontFamily: 'var(--cr-font-display)' }}>{result.prioritizationScore} / 100</div>
            </div>
          )}
          {result.missedCriticalMessages.length > 0 && (
            <div style={{ marginTop: 12, padding: 'var(--cr-space-md)', borderRadius: 'var(--cr-radius-md)', background: 'var(--cr-negative-bg)', border: '1px solid var(--cr-negative)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--cr-negative)', marginBottom: 4 }}>⚠️ 未处理的高紧急消息</div>
            </div>
          )}
        </div>
      </div>

      {/* Communication Style */}
      <div className="cr-card">
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 14 }}>💬 沟通风格画像</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: '主导语气', value: toneLabel(result.communicationStyle.dominantTone), color: '#059669' },
            { label: '升级意识', value: result.communicationStyle.escalationAwareness === '高' ? '高 · 及时升级' : result.communicationStyle.escalationAwareness === '中' ? '中 · 适度升级' : '低 · 倾向独立解决', color: '#6366F1' },
            { label: '边界设定', value: result.communicationStyle.boundarySetting === '高' ? '高 · 善于说不' : result.communicationStyle.boundarySetting === '中' ? '中 · 适度拒绝' : '低 · 倾向接受', color: '#D97706' },
            { label: '跨团队协作', value: result.communicationStyle.crossTeamCollaboration === '高' ? '高 · 主动拉通' : result.communicationStyle.crossTeamCollaboration === '中' ? '中 · 按需协作' : '低 · 独立完成', color: '#2563EB' },
          ].map((s) => (
            <div key={s.label} style={{ padding: 'var(--cr-space-md)', borderRadius: 'var(--cr-radius-md)', background: `${s.color}08`, border: `1px solid ${s.color}22`, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--cr-muted)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths + Improvements */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cr-space-lg)' }}>
        {result.strengths.length > 0 && (
          <div className="cr-card" style={{ borderLeft: '4px solid var(--cr-positive)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 12 }}>✅ 表现突出的方面</h3>
            <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.strengths.map((s, i) => <li key={i} style={{ fontSize: 13, color: 'var(--cr-ink-soft)', lineHeight: 1.7 }}>{s}</li>)}
            </ul>
          </div>
        )}
        {result.improvementAreas.length > 0 && (
          <div className="cr-card" style={{ borderLeft: '4px solid var(--cr-warning)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 12 }}>🌱 可进一步提升</h3>
            <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.improvementAreas.map((s, i) => <li key={i} style={{ fontSize: 13, color: 'var(--cr-ink-soft)', lineHeight: 1.7 }}>{s}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* AI meta */}
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--cr-muted)', fontFamily: 'var(--cr-font-mono)' }}>
        {result.aiMeta?.source === 'deepseek' ? '深度分析由 AI 生成 · HR 人工复核后生效' : '基础分析（本地计算）· 完整AI分析将在服务可用后补充'}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="cr-btn-secondary" onClick={() => window.history.back()}>返回体验</button>
        <button className="cr-btn-primary" onClick={() => {
          if (confirm('确认提交模拟结果并跳转到简历投递页面吗？\n\n你的模拟表现分析已经生成，可以在投递简历后继续查看。')) {
            onExit();
          }
        }}>继续投递简历</button>
      </div>
    </motion.div>
  );
}
