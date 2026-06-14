import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Banknote, Monitor, Users, Clock, Target, Lock, FileText, CheckCircle, AlertTriangle, Lightbulb, Search, MessageCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { useDemoState } from '../../store/demoStore';
import { useChatStore, type Message } from '../../store/chatStore';
import { buildCompetencyContext, COMPETENCY_MAP } from '../../mock/ai';
import { FutureYou } from '../../components/candidate/FutureYou';
import { ContextPanel } from '../../components/candidate/ContextPanel';
import type { Candidate, Job, JobTruthLabel, RealityReport } from '../../types';

interface PreferenceRow {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  preference: string;
  realityLabel: string;
  realityValue: string;
  matchLevel: 'match' | 'warning';
}

function derivePreferenceComparison(candidate: Candidate, job: Job | undefined, truthLabel: JobTruthLabel | undefined): PreferenceRow[] {
  const rows: PreferenceRow[] = [];
  const allText = [candidate.concerns ?? '', candidate.motivation ?? '', candidate.rhythmAcceptance ?? '', candidate.followUpQuestion ?? ''].join(' ');
  const has = (keywords: string[]) => keywords.some((k) => allText.includes(k));
  if (has(['成长', '发展', '晋升', '学习', '培养'])) { const gs = truthLabel?.growthSpeed; rows.push({ icon: Sprout, preference: '你重视成长', realityLabel: '岗位成长速度', realityValue: gs ?? '—', matchLevel: gs === '高' ? 'match' : 'warning' }); }
  if (has(['薪资', '工资', '待遇', '福利'])) { const range = job ? `${job.salaryMin}k-${job.salaryMax}k` : '—'; rows.push({ icon: Banknote, preference: '你重视薪资', realityLabel: '薪资范围', realityValue: range, matchLevel: 'warning' }); }
  if (has(['技术', '技术栈', '架构', 'Code Review'])) { rows.push({ icon: Monitor, preference: '你重视技术', realityLabel: '岗位技术挑战', realityValue: truthLabel?.uncertainty === '高' ? '复杂多变' : '稳定可预期', matchLevel: 'match' }); }
  if (has(['团队', '氛围', '协作', '同事'])) { const cd = truthLabel?.collaborationDensity; rows.push({ icon: Users, preference: '你重视团队', realityLabel: '协作密度', realityValue: cd ?? '—', matchLevel: cd === '高' ? 'match' : 'warning' }); }
  if (has(['节奏', '加班', '压力', '节点', '排期'])) { const wp = truthLabel?.workPace; rows.push({ icon: Clock, preference: '你重视工作节奏', realityLabel: '工作节奏', realityValue: wp ?? '—', matchLevel: wp === '高' || wp === '中高' ? 'warning' : 'match' }); }
  if (has(['自主', 'owner', '负责', '推进'])) { const au = truthLabel?.autonomy; rows.push({ icon: Target, preference: '你重视自主性', realityLabel: '岗位自主度', realityValue: au ?? '—', matchLevel: au === '高' || au === '中' ? 'match' : 'warning' }); }
  if (has(['稳定', '不确定', '变化'])) { const un = truthLabel?.uncertainty; rows.push({ icon: Lock, preference: '你重视稳定性', realityLabel: '需求不确定度', realityValue: un ?? '—', matchLevel: un === '低' ? 'match' : 'warning' }); }
  if (rows.length === 0 && candidate.concerns) rows.push({ icon: FileText, preference: `你关注：${candidate.concerns}`, realityLabel: '岗位实际情况', realityValue: '建议面试深入了解', matchLevel: 'warning' });
  return rows;
}

const EVIDENCE_KEYWORDS: Record<string, string[]> = { 'evidence-mock-first': ['Mock', 'mock', '先行', '接口', '约定', '推进', '后端', '字段', '联调'] };
function findEvidenceQuote(evidenceId: string, chatHistory: Message[]): string | null {
  const keywords = EVIDENCE_KEYWORDS[evidenceId];
  if (!keywords || keywords.length === 0) return null;
  const match = chatHistory.filter((m) => m.role === 'user').find((m) => keywords.some((kw) => m.content.includes(kw)));
  return match?.content ?? null;
}

function buildReport(candidate: Candidate | undefined, job: Job | undefined, report: RealityReport | undefined, competencyRows: Array<{ choiceLabel?: string; choiceText?: string; competencyLabel: string } | null>) {
  const name = candidate?.name || '候选人';
  const jobTitle = job?.title || '该岗位';

  // Derive tags from attentionMap and competency data
  const tags: string[] = [];
  if (report?.attentionMap) {
    if (report.attentionMap.growth > 50) tags.push('成长导向型');
    if (report.attentionMap.salary > 50) tags.push('务实型');
    if (report.attentionMap.technology > 50) tags.push('技术驱动型');
    if (report.attentionMap.team > 50) tags.push('团队协作型');
  }
  if (tags.length === 0) tags.push('主动推进型', '结果导向');

  // Build highlights from competency rows and report data
  const validRows = competencyRows.filter((r): r is NonNullable<typeof r> => r !== null);
  const highlights = validRows.slice(0, 2).map((row, i) => ({
    id: `h${i + 1}`,
    category: i === 0 ? '本岗位相关' as const : '跨岗位通用' as const,
    title: row.choiceLabel || row.competencyLabel,
    desc: row.choiceText
      ? `你在"${row.choiceLabel}"的选择中展现了${row.competencyLabel}的特质。这种决策风格反映了你在实际工作场景中的思维模式和行为偏好。`
      : `在${jobTitle}的真实工作场景中，你展现了${row.competencyLabel}的能力特征。这来自于你在模拟中的行为选择和分析。`,
    evidenceId: null,
  }));
  if (highlights.length < 2) {
    highlights.push({
      id: 'h-generic', category: '发展型' as const,
      title: `${jobTitle}核心能力匹配`,
      desc: `基于你在实境体验中展现的决策模式和问题处理方式，你与${jobTitle}岗位的核心能力要求有一定匹配度。后续可以通过面试进一步深入展示你的专业深度。`,
      evidenceId: null,
    });
  }

  // Build interview manual from report insight data
  const interviewManual = {
    suggestedDeepDiveQuestions: report?.interviewQuestions?.length
      ? report.interviewQuestions.slice(0, 3)
      : [`在${jobTitle}的工作中，你最关注哪些方面？`, '请分享一次你在工作中克服困难的经历。', '你对未来职业发展的规划是怎样的？'],
    topicsCandidateAvoided: report?.candidateTrustIndex?.lowTrustDimensions?.length
      ? report.candidateTrustIndex.lowTrustDimensions.map((d: string) => `${d}相关话题`)
      : ['具体技术细节', '长期职业规划', '团队管理经验'],
    strengthsToVerify: highlights.map((h) => h.title).slice(0, 3),
    weaknessesToProbe: report?.decisionPathAnalysis?.ambiguityAreas?.length
      ? report.decisionPathAnalysis.ambiguityAreas.slice(0, 3)
      : ['多任务并行下的优先级管理', '对岗位节奏的适应度', '长期发展规划的清晰度'],
  };

  return { candidateName: name, tags, highlights, interviewManual };
}

export function StoryPreview() {
  const { candidateId } = useParams();
  const state = useDemoState();
  const candidate = state.candidates.find((i) => i.id === candidateId);
  const job = state.jobs.find((i) => i.id === candidate?.jobId);
  const truthLabel = state.jobTruthLabels.find((i) => i.jobId === candidate?.jobId);
  const [activeEvidenceId, setActiveEvidenceId] = useState<string | null>(null);
  const [activeWhatIfId, setActiveWhatIfId] = useState<string | null>(null);
  const [whatIfInput, setWhatIfInput] = useState('');
  const [documentRevealed, setDocumentRevealed] = useState(false);

  const chatHistory = useChatStore((s) => s.chatHistory);
  const whatIfAnalysis = useChatStore((s) => s.whatIfAnalysis);
  const isWhatIfStreaming = useChatStore((s) => s.isWhatIfStreaming);
  const simulateWhatIf = useChatStore((s) => s.simulateWhatIf);

  const comparisonRows = useMemo(() => candidate ? derivePreferenceComparison(candidate, job, truthLabel) : [], [candidate, job, truthLabel]);
  const competencyRows = useMemo(() => {
    if (!candidate) return [];
    const session = state.trialSessions.find((s) => s.candidateId === candidate.id || s.jobId === candidate.jobId);
    if (!session) return [];
    const choiceIds = session.branchChoiceIds.length > 0 ? session.branchChoiceIds : session.selectedChoiceIds;
    const scenarios = state.branchScenarios.filter((bs) => bs.jobId === candidate.jobId);
    return choiceIds.map((cid) => {
      const mapping = COMPETENCY_MAP[cid]; if (!mapping) return null;
      const scenario = scenarios.find((bs) => bs.choices.some((ch) => ch.id === cid));
      const choice = scenario?.choices.find((ch) => ch.id === cid);
      return { id: cid, round: scenario?.round, title: scenario?.title, choiceLabel: choice?.label, choiceText: choice?.text, ...mapping };
    }).filter((r): r is NonNullable<typeof r> => r !== null);
  }, [candidate, state.trialSessions, state.branchScenarios]);

  const report = useMemo(() => {
    const realityReport = candidate ? state.realityReports.find((r) => r.candidateId === candidate.id) : undefined;
    return buildReport(candidate, job, realityReport, competencyRows);
  }, [candidate, job, state.realityReports, competencyRows]);

  useEffect(() => { const t = setTimeout(() => setDocumentRevealed(true), 400); return () => clearTimeout(t); }, []);
  useEffect(() => { return () => { setActiveEvidenceId(null); setActiveWhatIfId(null); }; }, []);

  if (!candidate) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cr-base)' }}>
        <div className="cr-empty-state"><h3 style={{ fontSize: 20, fontWeight: 600 }}>报告未找到</h3></div>
      </main>
    );
  }

  return (
    <div style={{ background: 'var(--cr-base)', minHeight: '100vh' }}>
      {/* ═══ DOSSIER HEADER ═══ */}
      <motion.header
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
        style={{
          background: 'var(--cr-ink)', color: '#fff',
          padding: 'var(--cr-space-3xl) var(--cr-page-padding) var(--cr-space-2xl)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Background pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 'var(--cr-content-xxl)', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Top classification strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, fontFamily: 'var(--cr-font-sans)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', opacity: 0.6 }}>
            <span>档案编号：ZHIYU-RPT-{candidate.id.slice(0, 8).toUpperCase()}</span>
            <span>机密 · HR 审阅专用</span>
          </div>

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={documentRevealed ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2, duration: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <ShieldCheck size={28} style={{ color: 'var(--cr-accent)' }} />
              <h1 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                实境体验能力画像
              </h1>
            </div>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 600 }}>
              基于 {candidate?.name ?? report.candidateName} 在岗位实境体验中的行为数据，由 AI 系统自动生成。
              本报告仅供 HR 面试前人工参考，不构成招聘建议。
            </p>
          </motion.div>

          {/* Seal stamps */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={documentRevealed ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.5, type: 'spring' }}
            style={{
              position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%) rotate(-12deg)',
              border: '3px solid rgba(255,255,255,0.3)', borderRadius: '50%',
              width: 100, height: 100, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--cr-font-mono)',
              fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
              pointerEvents: 'none', userSelect: 'none',
            }}
          >
            <div>AI</div>
            <div>GENERATED</div>
            <div style={{ fontSize: 7, marginTop: 2 }}>● VERIFIED ●</div>
          </motion.div>
        </div>
      </motion.header>

      {/* ═══ DOCUMENT BODY ═══ */}
      <div style={{ maxWidth: 'var(--cr-content-xxl)', margin: '0 auto', padding: '0 var(--cr-page-padding)' }}>
        <div className="cr-two-panel" style={{ paddingTop: 'var(--cr-space-3xl)' }}>
          <article style={{ minWidth: 0 }}>
            {/* Key metrics */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 'var(--cr-space-3xl)' }}
            >
              {[
                { label: '核心能力', value: `${report.highlights.length}`, sub: '项高光特征', color: '#059669' },
                { label: '胜任力映射', value: `${competencyRows.length}`, sub: '个能力维度', color: '#6366F1' },
                { label: '匹配度', value: `${comparisonRows.filter(r => r.matchLevel === 'match').length}/${comparisonRows.length}`, sub: '项偏好吻合', color: '#D97706' },
                { label: '面试准备', value: `${report.interviewManual.suggestedDeepDiveQuestions.length}`, sub: '条追问建议', color: '#2563EB' },
              ].map((m, i) => (
                <div key={i} style={{ textAlign: 'center', padding: 'var(--cr-space-lg)', background: 'var(--cr-surface)', borderRadius: 'var(--cr-radius-md)', border: `1px solid ${m.color}22`, borderTop: `3px solid ${m.color}` }}>
                  <div style={{ fontFamily: 'var(--cr-font-display)', fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cr-ink)', marginTop: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--cr-muted)' }}>{m.sub}</div>
                </div>
              ))}
            </motion.div>

            {/* Stamped section divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: 'var(--cr-space-3xl) 0 var(--cr-space-xl)' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--cr-ink)', opacity: 0.15 }} />
              <span style={{ fontFamily: 'var(--cr-font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--cr-ink)', opacity: 0.4, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                行为切片分析
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--cr-ink)', opacity: 0.15 }} />
            </div>

            {/* Highlights with typewriter reveal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 'var(--cr-space-3xl)' }}>
              {report.highlights.map((h, hi) => (
                <motion.div key={h.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: hi * 0.12 }}
                  style={{ position: 'relative', paddingLeft: 28, borderLeft: '3px solid var(--cr-accent)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--cr-font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--cr-accent)', letterSpacing: '0.08em' }}>
                      OBSERVATION-{String(hi + 1).padStart(2, '0')}
                    </span>
                    <span className="cr-badge cr-badge-blue">{h.category}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 20, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 10 }}>{h.title}</h3>
                  <p style={{ fontSize: 15, color: 'var(--cr-ink-soft)', lineHeight: 1.8 }}>{h.desc}</p>

                  {h.evidenceId && (
                    <>
                      <button onClick={() => setActiveEvidenceId(activeEvidenceId === h.evidenceId ? null : h.evidenceId!)}
                        style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'var(--cr-accent-subtle)', color: 'var(--cr-accent)', fontSize: 11, fontWeight: 600, borderRadius: 'var(--cr-radius-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--cr-font-mono)', letterSpacing: '0.04em' }}>
                        [ 查看对话证据 ]
                      </button>
                      {activeEvidenceId === h.evidenceId && (() => {
                        const quote = findEvidenceQuote(h.evidenceId!, chatHistory);
                        return (
                          <motion.blockquote initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            style={{ margin: '12px 0 0', padding: '14px 18px', background: 'var(--cr-subtle-warm)', borderLeft: '3px solid var(--cr-accent)', borderRadius: '0 var(--cr-radius-sm) var(--cr-radius-sm) 0' }}>
                            <p style={{ fontSize: 13, color: 'var(--cr-ink-dim)', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>{quote ? `"${quote}"` : '暂无可关联的对话记录。'}</p>
                          </motion.blockquote>
                        );
                      })()}
                    </>
                  )}

                  {h.category.includes('发展型') && (
                    <div style={{ marginTop: 14 }}>
                      <button onClick={() => setActiveWhatIfId(activeWhatIfId === h.id ? null : h.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'var(--cr-warning-bg)', color: 'var(--cr-warning)', fontSize: 11, fontWeight: 600, borderRadius: 'var(--cr-radius-sm)', border: '1px solid var(--cr-warning)', cursor: 'pointer', fontFamily: 'var(--cr-font-mono)', letterSpacing: '0.04em' }}>
                        [ 平行推演 ]
                      </button>
                      {activeWhatIfId === h.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 12, padding: 'var(--cr-space-lg)', background: 'var(--cr-subtle)', borderRadius: 'var(--cr-radius-md)', border: '1px solid var(--cr-border)', overflow: 'hidden' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cr-ink)' }}>平行宇宙推演</span>
                          <p style={{ fontSize: 13, color: 'var(--cr-ink-dim)', lineHeight: 1.6, margin: '4px 0 12px' }}>如果你做了不同的选择，可能会怎样？</p>
                          <textarea value={whatIfInput} onChange={(e) => setWhatIfInput(e.target.value)} placeholder="写下你当时的另一个选择..." rows={3} disabled={isWhatIfStreaming} className="cr-textarea" />
                          <button onClick={() => { if (!whatIfInput.trim() || isWhatIfStreaming) return; simulateWhatIf({ highlightId: h.id, highlightTitle: h.title, highlightDesc: h.desc }, whatIfInput.trim()); }} disabled={isWhatIfStreaming || !whatIfInput.trim()} className="cr-btn-primary" style={{ marginTop: 10, fontSize: 13, padding: '8px 20px' }}>
                            {isWhatIfStreaming ? 'AI 推演中...' : '开始推演'}
                          </button>
                          {(whatIfAnalysis || isWhatIfStreaming) && (
                            <div style={{ marginTop: 14, padding: '14px 16px', background: 'var(--cr-surface)', borderRadius: 'var(--cr-radius-md)', border: '1px dashed var(--cr-accent)' }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--cr-accent)' }}>AI 推演结果</span>
                              <p style={{ fontSize: 13, color: 'var(--cr-ink-soft)', lineHeight: 1.7, margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{whatIfAnalysis || (isWhatIfStreaming ? '...' : '')}</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Two-column: Competency + Preference */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cr-space-xl)', marginBottom: 'var(--cr-space-3xl)' }}>
              {competencyRows.length > 0 && (
                <section>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--cr-ink)', opacity: 0.1 }} />
                    <span style={{ fontFamily: 'var(--cr-font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--cr-muted)', whiteSpace: 'nowrap' }}>能力映射</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--cr-ink)', opacity: 0.1 }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {competencyRows.map((row) => (
                      <div key={row.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 'var(--cr-space-lg)', borderRadius: 'var(--cr-radius-md)', background: 'var(--cr-surface)', border: '1px solid var(--cr-border-light)', borderLeftWidth: 4, borderLeftColor: row.level >= 4 ? 'var(--cr-positive)' : row.level >= 3 ? 'var(--cr-accent)' : 'var(--cr-warning)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 'var(--cr-radius-sm)', background: row.level >= 4 ? 'var(--cr-positive-bg)' : row.level >= 3 ? 'var(--cr-accent-subtle)' : 'var(--cr-warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: row.level >= 4 ? 'var(--cr-positive)' : row.level >= 3 ? 'var(--cr-accent)' : 'var(--cr-warning)', flexShrink: 0 }}>L{row.level}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 2 }}>{row.competency}</div>
                          <p style={{ fontSize: 12, color: 'var(--cr-ink-dim)', lineHeight: 1.5, margin: 0 }}>{row.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {comparisonRows.length > 0 && (
                <section>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--cr-ink)', opacity: 0.1 }} />
                    <span style={{ fontFamily: 'var(--cr-font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--cr-muted)', whiteSpace: 'nowrap' }}>偏好匹配</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--cr-ink)', opacity: 0.1 }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {comparisonRows.map((row, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 'var(--cr-radius-md)', background: row.matchLevel === 'match' ? 'var(--cr-positive-bg)' : 'var(--cr-warning-bg)', border: `1px solid ${row.matchLevel === 'match' ? 'var(--cr-positive)' : 'var(--cr-warning)'}`, borderLeftWidth: 4, fontSize: 13 }}>
                        <row.icon size={16} strokeWidth={1.5} style={{ color: row.matchLevel === 'match' ? 'var(--cr-positive)' : 'var(--cr-warning)', flexShrink: 0 }} />
                        <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, color: 'var(--cr-ink)' }}>{row.preference}</span>
                          <span style={{ color: 'var(--cr-muted)', fontSize: 11 }}>→</span>
                          <span style={{ color: 'var(--cr-ink-soft)' }}>{row.realityValue}</span>
                        </div>
                        <span style={{ flexShrink: 0, padding: '2px 10px', borderRadius: 'var(--cr-radius-full)', fontSize: 11, fontWeight: 600, background: row.matchLevel === 'match' ? 'var(--cr-positive)' : 'var(--cr-warning)', color: '#fff' }}>{row.matchLevel === 'match' ? '匹配' : '确认'}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Interview manual */}
            {report.interviewManual && (
              <section style={{ marginBottom: 'var(--cr-space-3xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--cr-ink)', opacity: 0.1 }} />
                  <span style={{ fontFamily: 'var(--cr-font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--cr-muted)', whiteSpace: 'nowrap' }}>面试准备手册</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--cr-ink)', opacity: 0.1 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cr-space-lg)' }}>
                  <div className="cr-card" style={{ borderLeft: '3px solid var(--cr-accent)' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Lightbulb size={14} style={{ color: 'var(--cr-accent)' }} />建议准备的追问</h3>
                    <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {report.interviewManual.suggestedDeepDiveQuestions.map((q, i) => <li key={i} style={{ fontSize: 13, color: 'var(--cr-ink-soft)', lineHeight: 1.6 }}>{q}</li>)}
                    </ul>
                  </div>
                  <div className="cr-card" style={{ borderLeft: '3px solid var(--cr-warning)' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Search size={14} style={{ color: 'var(--cr-warning)' }} />未覆盖的维度</h3>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {report.interviewManual.topicsCandidateAvoided.map((t, i) => <span key={i} className="cr-badge cr-badge-amber">{t}</span>)}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Future You */}
            <FutureYou />

            {/* Next Steps */}
            <section style={{ marginBottom: 'var(--cr-space-2xl)' }}>
              <div className="cr-card" style={{ background: 'linear-gradient(135deg, var(--cr-accent-subtle) 0%, var(--cr-surface) 100%)', border: '1px solid var(--cr-accent)', borderLeft: '4px solid var(--cr-accent)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 12 }}>📋 接下来你可以</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    '仔细阅读报告中的能力分析，准备2-3个能展示优势的真实案例',
                    '练习"面试追问手册"中建议的深度追问问题',
                    '关注"未覆盖的维度"，思考如何向HR展示这些方面的能力',
                    '确认投递后，HR会在1-3个工作日内审阅你的报告',
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--cr-ink-soft)', lineHeight: 1.6 }}>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--cr-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer: classification + CTA */}
            <div style={{ marginTop: 'var(--cr-space-2xl)', paddingTop: 'var(--cr-space-2xl)', borderTop: '2px solid var(--cr-ink)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ fontFamily: 'var(--cr-font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--cr-muted)' }}>
                文档生成时间：{new Date().toISOString().slice(0, 10)} · AI 生成 · HR 人工复核后生效
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link to={`/candidate/success/${candidateId}`} className="cr-btn-primary" style={{ fontSize: 13 }}>确认并投递</Link>
              </div>
            </div>
          </article>

          <aside><ContextPanel type="story" data={{ candidateName: candidate?.name }} /></aside>
        </div>
      </div>
    </div>
  );
}
