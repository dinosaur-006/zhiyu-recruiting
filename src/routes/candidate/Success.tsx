import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleCheckBig, Star, Sparkles, MessageCircle, ThumbsUp, BookOpen, Clock, Calendar, MapPin, Coffee, Laptop, Rocket, TrendingUp, Target, ArrowRight } from 'lucide-react';
import { useDemoState } from '../../store/demoStore';
import { ApplicationTracker } from '../../components/candidate/ApplicationTracker';
import type { RealityReport, Candidate } from '../../types';

function deriveAbilityHighlights(candidate: Candidate, report: RealityReport | undefined) {
  const roleSkills: string[] = [];
  if (report?.skillEvidence?.length) roleSkills.push(...report.skillEvidence.slice(0, 2));
  if (candidate.skills && roleSkills.length < 2) { const extra = candidate.skills.split(/[,，、]/).filter(Boolean).slice(0, 2 - roleSkills.length); roleSkills.push(...extra); }
  if (roleSkills.length === 0) roleSkills.push('能快速理解岗位核心职责');
  const transferSkills: string[] = [];
  if (report?.decisionPathAnalysis) { const { collaboration, communication } = report.decisionPathAnalysis; if (collaboration) transferSkills.push(`协作能力 — ${collaboration}`); if (communication) transferSkills.push(`沟通表达 — ${communication}`); }
  if (transferSkills.length === 0) transferSkills.push('具备跨场景迁移的通用职业素养');
  const growthItems: string[] = [];
  if (report?.concernRadar) { const entries = Object.entries(report.concernRadar) as [string, number][]; const elevated = entries.filter(([, v]) => v >= 60).map(([k]) => k); if (elevated.length) growthItems.push(`建议在面试中主动澄清${elevated.slice(0, 2).join('、')}方面的期待`); }
  if (growthItems.length === 0) growthItems.push('持续积累行业视野，保持学习节奏');
  return { roleSkills, transferSkills, growthItems };
}

function deriveHighlightMoments(candidate: Candidate, report: RealityReport | undefined) {
  const moments: string[] = [];
  if (report?.trialReplay?.length) { const keyEvent = report.trialReplay.find((e) => e.type === 'branch_choice_selected' || e.type === 'scene_completed'); if (keyEvent) moments.push(`${keyEvent.timeLabel} — ${keyEvent.label}`); }
  if (moments.length === 0) moments.push(`${candidate.name}在实境体验中展现了积极主动的沟通姿态`);
  return moments.slice(0, 2);
}

export function Success() {
  const { candidateId } = useParams();
  const state = useDemoState();
  const candidate = state.candidates.find((item) => item.id === candidateId);
  const job = state.jobs.find((item) => item.id === candidate?.jobId);
  const truthLabel = state.jobTruthLabels.find((item) => item.jobId === candidate?.jobId);
  const report = state.realityReports.find((item) => item.candidateId === candidateId);
  const [respectRating, setRespectRating] = useState(() => { try { return JSON.parse(localStorage.getItem('zhiyu-feedback') || '{}').respect || 0; } catch { return 0; } });
  const [fluencyRating, setFluencyRating] = useState(() => { try { return JSON.parse(localStorage.getItem('zhiyu-feedback') || '{}').fluency || 0; } catch { return 0; } });
  const [naturalnessRating, setNaturalnessRating] = useState(() => { try { return JSON.parse(localStorage.getItem('zhiyu-feedback') || '{}').naturalness || 0; } catch { return 0; } });

  const persistRating = (key: string, value: number) => {
    const existing = JSON.parse(localStorage.getItem('zhiyu-feedback') || '{}');
    existing[key] = value;
    existing.updatedAt = new Date().toISOString();
    localStorage.setItem('zhiyu-feedback', JSON.stringify(existing));
  };
  const [launched, setLaunched] = useState(false);

  useEffect(() => { const t = setTimeout(() => setLaunched(true), 600); return () => clearTimeout(t); }, []);

  const { roleSkills, transferSkills, growthItems } = deriveAbilityHighlights(candidate ?? ({} as Candidate), report);
  const highlightMoments = deriveHighlightMoments(candidate ?? ({} as Candidate), report);
  const interviewQuestions = report?.interviewQuestions?.length ? report.interviewQuestions.slice(0, 3) : ['请分享一个你解决复杂技术问题的案例', '你如何看待团队协作中的冲突？', '未来三年你的职业发展目标是什么？'];
  const reverseQuestions = report?.reverseQuestions?.length ? report.reverseQuestions.slice(0, 3) : [
    { id: 'r1', type: '工作节奏' as const, question: '这个岗位的日常工作节奏是怎样的？', answer: '', createdAt: '' },
    { id: 'r2', type: '成长空间' as const, question: '团队对新人的培养机制是什么？', answer: '', createdAt: '' },
    { id: 'r3', type: '团队氛围' as const, question: '团队目前的协作文化是怎样的？', answer: '', createdAt: '' },
  ];
  const evalDimensions = [
    { label: '尊重度', value: respectRating, setter: setRespectRating, desc: 'AI是否尊重你的时间' },
    { label: '流畅度', value: fluencyRating, setter: setFluencyRating, desc: '交互是否顺畅' },
    { label: '自然度', value: naturalnessRating, setter: setNaturalnessRating, desc: '对话是否自然' },
  ];

  return (
    <div style={{ background: 'var(--cr-base)', minHeight: '100vh' }}>
      <Confetti />

      {/* ═══ LAUNCH HERO ═══ */}
      <motion.section
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
        style={{
          textAlign: 'center', padding: '80px var(--cr-page-padding) 60px',
          background: 'linear-gradient(180deg, var(--cr-positive-bg) 0%, var(--cr-base) 100%)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(5,150,105,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Success mark with launch animation */}
        <motion.div initial={{ scale: 0 }} animate={launched ? { scale: 1 } : {}} transition={{ type: 'spring', stiffness: 160, damping: 14 }} style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--cr-positive)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 48px rgba(5,150,105,0.3)', position: 'relative' }}>
            <div style={{ width: 86, height: 86, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircleCheckBig size={48} strokeWidth={1.5} color="var(--cr-positive)" />
            </div>
            {/* Orbit ring */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', inset: -16, borderRadius: '50%', border: '2px dashed rgba(5,150,105,0.2)', pointerEvents: 'none' }}
            />
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={launched ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3, duration: 0.5 }}
          style={{ fontFamily: 'var(--cr-font-display)', fontSize: 'var(--cr-text-4xl)', fontWeight: 700, color: 'var(--cr-ink)', letterSpacing: '-0.02em', marginBottom: 16 }}
        >
          🚀 投递成功！你的旅程开始了
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={launched ? { opacity: 1 } : {}} transition={{ delay: 0.5, duration: 0.5 }}
          style={{ fontSize: 16, color: 'var(--cr-ink-dim)', maxWidth: 500, margin: '0 auto 8px', lineHeight: 1.7 }}
        >
          {job?.title ?? '目标岗位'} 的能力报告已送达HR工作台
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={launched ? { opacity: 1 } : {}} transition={{ delay: 0.6, duration: 0.5 }}
          style={{ fontSize: 14, color: 'var(--cr-muted)', maxWidth: 500, margin: '0 auto' }}
        >
          这不是终点，而是你职业生涯下一站的起点
        </motion.p>
      </motion.section>

      {/* ═══ CONTENT ═══ */}
      <div style={{ maxWidth: 'var(--cr-content-xxl)', margin: '0 auto', padding: '0 var(--cr-page-padding) var(--cr-space-5xl)' }}>
        {/* Row 1: Highlights + Abilities */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cr-space-lg)', marginBottom: 'var(--cr-space-lg)' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="cr-card" style={{ background: 'linear-gradient(135deg, var(--cr-warning-bg) 0%, var(--cr-surface) 100%)', borderLeft: '4px solid var(--cr-warning)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={18} style={{ color: 'var(--cr-warning)' }} />高光时刻</h3>
            {highlightMoments.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < highlightMoments.length - 1 ? 10 : 0, fontSize: 14, color: 'var(--cr-ink-soft)', lineHeight: 1.65 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: 'var(--cr-warning)', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{i + 1}</span>
                <span>{m}</span>
              </div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="cr-card">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><ThumbsUp size={18} style={{ color: 'var(--cr-positive)' }} />能力亮点</h3>
            <div style={{ marginBottom: 10 }}><span className="cr-badge cr-badge-green">本岗位相关</span><ul style={{ margin: '6px 0 0', padding: '0 0 0 16px', fontSize: 13, color: 'var(--cr-ink-soft)', lineHeight: 1.6 }}>{roleSkills.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            <div style={{ marginBottom: 10 }}><span className="cr-badge cr-badge-blue">跨岗位通用</span><ul style={{ margin: '6px 0 0', padding: '0 0 0 16px', fontSize: 13, color: 'var(--cr-ink-soft)', lineHeight: 1.6 }}>{transferSkills.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            <div><span className="cr-badge cr-badge-purple">发展型</span><ul style={{ margin: '6px 0 0', padding: '0 0 0 16px', fontSize: 13, color: 'var(--cr-ink-soft)', lineHeight: 1.6 }}>{growthItems.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
          </motion.div>
        </div>

        {/* Row 2: Application Tracker + Interview Prep */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cr-space-lg)', marginBottom: 'var(--cr-space-lg)' }}>
          <ApplicationTracker />
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="cr-card">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Target size={18} style={{ color: 'var(--cr-info)' }} />准备清单</h3>
            <div style={{ marginBottom: 12 }}><span className="cr-badge cr-badge-blue">模拟面试题</span><ol style={{ margin: '6px 0 0', padding: '0 0 0 16px', fontSize: 13, color: 'var(--cr-ink-soft)', lineHeight: 1.6 }}>{interviewQuestions.map((q, i) => <li key={i} style={{ marginBottom: 2 }}>{typeof q === 'string' ? q : q}</li>)}</ol></div>
            <div><span className="cr-badge cr-badge-amber">反问HR的好问题</span><ol style={{ margin: '6px 0 0', padding: '0 0 0 16px', fontSize: 13, color: 'var(--cr-ink-soft)', lineHeight: 1.6 }}>{reverseQuestions.map((q, i) => <li key={i} style={{ marginBottom: 2 }}>{typeof q === 'string' ? q : q.question}</li>)}</ol></div>
          </motion.div>
        </div>

        {/* Row 3: Culture + Prep Kit */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cr-space-lg)', marginBottom: 'var(--cr-space-lg)' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="cr-card">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><Coffee size={18} style={{ color: 'var(--cr-warning)' }} />了解我们的日常</h3>
            <p style={{ fontSize: 12, color: 'var(--cr-muted)', marginBottom: 14 }}>等待期间，预览团队文化</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { icon: Clock, label: '工作节奏', desc: truthLabel?.workPace ?? '适中' },
                { icon: Users, label: '协作密度', desc: truthLabel?.collaborationDensity ?? '中等' },
                { icon: TrendingUp, label: '成长速度', desc: truthLabel?.growthSpeed ?? '稳定' },
                { icon: BookOpen, label: '学习基金', desc: '年度 ¥5,000' },
              ].map((item, i) => (
                <div key={i} style={{ padding: 'var(--cr-space-md)', background: 'var(--cr-subtle-warm)', borderRadius: 'var(--cr-radius-md)', textAlign: 'center' }}>
                  <item.icon size={18} strokeWidth={1.5} style={{ color: 'var(--cr-accent)', marginBottom: 6 }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--cr-ink)' }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--cr-muted)' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="cr-card">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 14 }}>体验评价</h3>
            <p style={{ fontSize: 12, color: 'var(--cr-muted)', marginBottom: 12 }}>反馈仅用于产品改进，不与档案关联</p>
            {evalDimensions.map((dim) => (
              <div key={dim.label} style={{ marginBottom: 10, padding: 'var(--cr-space-sm) var(--cr-space-md)', borderRadius: 'var(--cr-radius-md)', background: 'var(--cr-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--cr-ink)' }}>{dim.label}</span>
                  <span style={{ fontSize: 10, color: 'var(--cr-muted)' }}>{dim.desc}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => dim.setter(star)} style={{ width: 32, height: 32, borderRadius: 'var(--cr-radius-sm)', border: star <= dim.value ? '2px solid var(--cr-accent)' : '2px solid var(--cr-border)', background: star <= dim.value ? 'var(--cr-accent-subtle)' : 'var(--cr-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                      <Star size={14} fill={star <= dim.value ? 'var(--cr-accent)' : 'none'} color={star <= dim.value ? 'var(--cr-accent)' : 'var(--cr-muted)'} />
                    </button>
                  ))}
                  {dim.value > 0 && <span style={{ marginLeft: 4, fontSize: 11, fontWeight: 600, color: 'var(--cr-accent)' }}>{dim.value}/5</span>}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Browse more */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="cr-card" style={{ textAlign: 'center', marginBottom: 'var(--cr-space-lg)', background: 'linear-gradient(135deg, var(--cr-accent-subtle) 0%, var(--cr-surface) 100%)', border: '1px solid var(--cr-accent)' }}>
          <Rocket size={28} style={{ color: 'var(--cr-accent)', marginBottom: 8 }} />
          <h3 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 18, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 6 }}>探索更多机会</h3>
          <p style={{ fontSize: 13, color: 'var(--cr-ink-dim)', marginBottom: 14 }}>在等待回复的同时，继续浏览其他岗位，积累更多能力画像。</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link to="/" className="cr-btn-primary">浏览更多岗位 <ArrowRight size={16} /></Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Confetti() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; size: number; color: string; r: number; delay: number; dur: number }>>([]);
  useEffect(() => { setParticles(Array.from({ length: 50 }).map((_, i) => ({ id: i, x: (Math.random() - 0.5) * 800, size: Math.random() * 10 + 6, color: ['var(--cr-accent)', 'var(--cr-positive)', 'var(--cr-warning)', 'var(--cr-info)', '#6366F1'][Math.floor(Math.random() * 5)], r: Math.random() > 0.5 ? 50 : 4, delay: Math.random() * 0.5, dur: 3 + Math.random() * 1.5 }))); }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
      {particles.map((p) => (
        <motion.div key={p.id} initial={{ y: -40, x: 0, opacity: 1, rotate: 0, scale: 0 }} animate={{ y: '85vh', x: p.x, opacity: 0, rotate: p.r, scale: 1 }} transition={{ duration: p.dur, delay: p.delay, ease: [0.25, 0.46, 0.45, 0.94] }} style={{ position: 'absolute', top: 0, width: p.size, height: p.size, background: p.color, borderRadius: p.r === 50 ? '50%' : '3px' }} />
      ))}
    </div>
  );
}
