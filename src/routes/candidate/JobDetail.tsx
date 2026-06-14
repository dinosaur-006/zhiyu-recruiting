import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, FileText, MapPin, Clock } from 'lucide-react';
import { GravitySandbox } from '../../components/GravitySandbox';
import { TeamConstellation } from '../../components/candidate/TeamConstellation';
import { GrowthCompass } from '../../components/candidate/GrowthCompass';
import { BenefitsCalculator } from '../../components/candidate/BenefitsCalculator';
import { useDemoState } from '../../store/demoStore';

function SectionHeading({ title }: { title: string }) {
  return <h2 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 'var(--cr-text-2xl)', fontWeight: 700, color: 'var(--cr-ink)', marginBottom: 'var(--cr-space-lg)', letterSpacing: '-0.015em' }}>{title}</h2>;
}

export function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const state = useDemoState();
  const job = state.jobs.find((item) => item.id === jobId);
  const truthLabel = state.jobTruthLabels.find((item) => item.jobId === jobId);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowStickyCTA(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!job) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cr-base)' }}>
        <div className="cr-empty-state"><FileText size={48} strokeWidth={1} style={{ color: 'var(--cr-muted)', opacity: 0.5 }} /><h3 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 20, fontWeight: 600 }}>岗位不存在或已下架</h3></div>
      </main>
    );
  }

  const responsibilities = (job.responsibilities ?? '').split(/[，,]/).filter(Boolean);

  return (
    <div style={{ background: 'var(--cr-base)', minHeight: '100vh' }}>
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 0 56px', background: 'linear-gradient(180deg, var(--cr-subtle-warm) 0%, var(--cr-base) 100%)', borderBottom: '1px solid var(--cr-border-light)' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 500, height: 500, background: 'radial-gradient(circle at 70% 30%, var(--cr-accent-subtle) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 'var(--cr-content-lg)', margin: '0 auto', padding: '0 var(--cr-page-padding)', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
            <span style={{ fontFamily: 'var(--cr-font-sans)', fontSize: 'var(--cr-text-xs)', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--cr-accent)', background: 'var(--cr-accent-subtle)', border: '1px solid var(--cr-accent)', padding: '4px 12px', display: 'inline-block', borderRadius: 'var(--cr-radius-sm)' }}>星河云智科技 · {job.department}</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontFamily: 'var(--cr-font-display)', fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 700, color: 'var(--cr-ink)', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 700, marginBottom: 16 }}>{job.title}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ fontSize: 'var(--cr-text-md)', color: 'var(--cr-ink-soft)', lineHeight: 1.7, maxWidth: 520, marginBottom: 24 }}>
            {job.analysis?.summary || `我们正在寻找一位能定义下一代产品体验的核心成员。你将直接与团队协作，推动产品从概念到落地。`}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
            <span style={{ fontSize: 'var(--cr-text-xl)', fontWeight: 700, color: '#fff', fontFamily: 'var(--cr-font-display)', background: 'var(--cr-positive)', padding: '8px 20px', borderRadius: 'var(--cr-radius-full)' }}>{job.salaryMin}k – {job.salaryMax}k</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--cr-text-base)', color: 'var(--cr-ink-soft)' }}><MapPin size={14} style={{ color: 'var(--cr-accent)' }} />{job.location}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--cr-text-base)', color: 'var(--cr-ink-soft)' }}><Clock size={14} style={{ color: 'var(--cr-accent)' }} />{job.experience}</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="cr-btn-primary cr-btn-lg" onClick={() => navigate(`/candidate/inbox/${job.id}`)} style={{ fontSize: 'var(--cr-text-md)', padding: '14px 32px' }}><Sparkles size={18} />开始实境体验</button>
            <button className="cr-btn-ghost" onClick={() => navigate(`/candidate/profile/${job.id}?direct=1`)} style={{ fontSize: 'var(--cr-text-sm)' }}>跳过体验，直接投递 →</button>
          </motion.div>
        </div>
      </section>

      {/* JOB DETAILS */}
      <div style={{ maxWidth: 'var(--cr-content-lg)', margin: '0 auto', padding: 'var(--cr-space-2xl) var(--cr-page-padding) var(--cr-space-3xl)' }}>
        <SectionHeading title="这个岗位做什么" />
        <div className="cr-card" style={{ padding: 0, overflow: 'hidden' }}>
          {responsibilities.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 'var(--cr-space-lg) var(--cr-space-xl)', borderBottom: i < responsibilities.length - 1 ? '1px solid var(--cr-border-light)' : 'none', background: i === 0 ? 'var(--cr-accent-subtle)' : 'var(--cr-surface)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--cr-radius-sm)', background: i === 0 ? 'var(--cr-accent)' : 'var(--cr-subtle)', color: i === 0 ? '#fff' : 'var(--cr-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--cr-text-sm)', fontWeight: 700, fontFamily: 'var(--cr-font-display)', flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</div>
              <span style={{ fontSize: 'var(--cr-text-base)', color: 'var(--cr-ink-soft)', lineHeight: 'var(--cr-leading-normal)', paddingTop: 4 }}>{r.trim()}</span>
            </div>
          ))}
        </div>

        {job.challenges && (
          <div style={{ marginTop: 'var(--cr-space-lg)', padding: 'var(--cr-space-lg) var(--cr-space-xl)', borderRadius: 'var(--cr-radius-lg)', background: 'var(--cr-warning-bg)', border: '1px solid var(--cr-warning)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ fontSize: 'var(--cr-text-lg)', flexShrink: 0 }}>💬</div>
            <div>
              <div style={{ fontSize: 'var(--cr-text-sm)', fontWeight: 700, color: 'var(--cr-warning)', marginBottom: 6 }}>坦率地说</div>
              <p style={{ fontSize: 'var(--cr-text-base)', color: 'var(--cr-ink-soft)', lineHeight: 'var(--cr-leading-normal)', margin: 0 }}>{job.challenges}</p>
            </div>
          </div>
        )}

        <div style={{ marginTop: 'var(--cr-space-2xl)' }}>
          <SectionHeading title="需要什么能力" />
          <div className="cr-card" style={{ padding: 'var(--cr-space-xl)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: job.analysis?.hardSkills ? 14 : 0 }}>
              {(job.requirements ?? '').split(/[，,]/).filter(Boolean).map((req, i) => (
                <span key={i} style={{ padding: '8px 16px', borderRadius: 'var(--cr-radius-full)', background: 'var(--cr-subtle)', fontSize: 'var(--cr-text-base)', color: 'var(--cr-ink-soft)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--cr-accent)', flexShrink: 0 }} />{req.trim()}
                </span>
              ))}
            </div>
            {job.analysis?.hardSkills && (
              <div style={{ borderTop: '1px solid var(--cr-border-light)', paddingTop: 14 }}>
                <div style={{ fontSize: 'var(--cr-text-xs)', color: 'var(--cr-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>核心技术能力</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{job.analysis.hardSkills.map((s: string) => <span key={s} className="cr-badge cr-badge-blue" style={{ fontSize: 'var(--cr-text-xs)' }}>{s}</span>)}</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 'var(--cr-space-2xl)' }}>
          <SectionHeading title="团队与成长" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cr-space-lg)' }}>
            <div className="cr-card" style={{ padding: 'var(--cr-space-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--cr-radius-sm)', background: 'var(--cr-accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--cr-text-md)' }}>👥</div>
                <div style={{ fontSize: 'var(--cr-text-base)', fontWeight: 600, color: 'var(--cr-ink)' }}>团队概况</div>
              </div>
              <p style={{ fontSize: 'var(--cr-text-base)', color: 'var(--cr-ink-soft)', lineHeight: 'var(--cr-leading-normal)', margin: 0 }}>{job.teamInfo}</p>
            </div>
            <div className="cr-card" style={{ padding: 'var(--cr-space-xl)', borderLeft: '4px solid var(--cr-accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--cr-radius-sm)', background: 'var(--cr-accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--cr-text-md)' }}>📈</div>
                <div style={{ fontSize: 'var(--cr-text-base)', fontWeight: 600, color: 'var(--cr-ink)' }}>成长路径</div>
              </div>
              <p style={{ fontSize: 'var(--cr-text-base)', color: 'var(--cr-ink-soft)', lineHeight: 'var(--cr-leading-normal)', margin: 0 }}>{job.growthPath}</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'var(--cr-space-2xl)' }}>
          <SectionHeading title="福利与流程" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cr-space-lg)' }}>
            <div className="cr-card" style={{ padding: 'var(--cr-space-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--cr-radius-sm)', background: 'var(--cr-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--cr-text-md)' }}>📋</div>
                <div style={{ fontSize: 'var(--cr-text-base)', fontWeight: 600, color: 'var(--cr-ink)' }}>面试流程</div>
              </div>
              <p style={{ fontSize: 'var(--cr-text-sm)', color: 'var(--cr-ink-soft)', lineHeight: 'var(--cr-leading-normal)', margin: 0 }}>{job.interviewProcess}</p>
            </div>
            <div className="cr-card" style={{ padding: 'var(--cr-space-xl)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--cr-radius-sm)', background: 'var(--cr-warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--cr-text-md)' }}>⏱️</div>
                <div style={{ fontSize: 'var(--cr-text-base)', fontWeight: 600, color: 'var(--cr-ink)' }}>工作节奏</div>
              </div>
              <p style={{ fontSize: 'var(--cr-text-sm)', color: 'var(--cr-ink-soft)', lineHeight: 'var(--cr-leading-normal)', margin: 0 }}>{job.workload || '详见岗位描述'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH SECTIONS */}
      <div style={{ borderTop: '1px solid var(--cr-border-light)' }}>
        <div className="cr-section-alt" style={{ padding: 'var(--cr-space-3xl) 0' }}>
          <GravitySandbox job={job} truthLabel={truthLabel} onStartTrial={() => navigate(`/candidate/inbox/${job.id}`)} onDirectApply={() => navigate(`/candidate/profile/${job.id}?direct=1`)} />
        </div>
        <div className="cr-section-alt"><TeamConstellation job={job} /></div>
        <GrowthCompass job={job} />
        <div className="cr-section-alt"><BenefitsCalculator monthlyBase={job.salaryMin ? (job.salaryMin + job.salaryMax) / 2 : undefined} /></div>

        <section style={{ padding: 'var(--cr-space-3xl) 0', maxWidth: 'var(--cr-content-lg)', margin: '0 auto', width: '100%', paddingLeft: 'var(--cr-page-padding)', paddingRight: 'var(--cr-page-padding)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--cr-space-xl)' }}>
            <span className="cr-eyebrow" style={{ textAlign: 'center' }}>招聘流程</span>
            <h2 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 'var(--cr-text-3xl)', fontWeight: 700, color: 'var(--cr-ink)', margin: '8px 0' }}>从这里到 offer</h2>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 0, flexWrap: 'wrap', maxWidth: 800, margin: '0 auto' }}>
            {[{ step: '01', title: '实境体验', desc: '展示真实能力', color: '#059669' }, { step: '02', title: 'HR 审阅', desc: '人工复核报告', color: '#6366F1' }, { step: '03', title: '初步沟通', desc: '电话了解情况', color: '#D97706' }, { step: '04', title: '深度面试', desc: '技术/业务交流', color: '#2563EB' }, { step: '05', title: 'Offer', desc: '薪资沟通与发放', color: '#059669' }].map((s, i) => (
              <div key={i} style={{ flex: '1 1 120px', maxWidth: 160, textAlign: 'center', position: 'relative', padding: '0 10px' }}>
                {i < 4 && <div style={{ position: 'absolute', top: 18, right: -6, width: 12, height: 2, background: 'var(--cr-border)' }} />}
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', position: 'relative', zIndex: 1, color: '#fff', fontSize: 'var(--cr-text-xs)', fontWeight: 700, fontFamily: 'var(--cr-font-display)' }}>{s.step}</div>
                <div style={{ fontSize: 'var(--cr-text-sm)', fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 'var(--cr-text-xs)', color: 'var(--cr-ink-dim)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showStickyCTA && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'sticky', bottom: 0, zIndex: 40, background: 'var(--cr-surface-float)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--cr-border-light)', padding: 'var(--cr-space-lg)', display: 'flex', justifyContent: 'center' }}>
          <button className="cr-btn-primary cr-btn-lg" onClick={() => navigate(`/candidate/inbox/${job.id}`)} style={{ fontSize: 'var(--cr-text-md)' }}><Sparkles size={18} />开始实境体验</button>
        </motion.div>
      )}
    </div>
  );
}
