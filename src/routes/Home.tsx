import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown, Sparkles, Briefcase, MapPin, Banknote, Shield, Zap, Smile, Search, Flame, TrendingUp, Clock } from 'lucide-react';
import { useDemoState } from '../store/demoStore';
import { CandidateRightsPanel } from '../components/CandidateRightsPanel';
import { HowItWorks } from '../components/candidate/HowItWorks';
import { ContextPanel } from '../components/candidate/ContextPanel';
import { SkillsQuiz } from '../components/candidate/SkillsQuiz';
import type { Job } from '../types';

const CATEGORIES = ['全部', '前端', '后端', '全栈', 'AI/数据', '管理'] as const;
type Category = typeof CATEGORIES[number];

export function Home() {
  const navigate = useNavigate();
  const state = useDemoState();
  const jobs = state.jobs;
  const { realityReports, metrics } = state;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('全部');
  const [showQuiz, setShowQuiz] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Filter jobs based on search + category
  const filteredJobs = useMemo(() => {
    let result = jobs;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((j) =>
        j.title.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) ||
        j.analysis?.hardSkills?.some((s: string) => s.toLowerCase().includes(q)) ||
        j.analysis?.sellingPoints?.some((s: string) => s.toLowerCase().includes(q))
      );
    }
    if (activeCategory !== '全部') {
      result = result.filter((j) => {
        const cat = activeCategory;
        if (cat === '前端') return j.title.includes('前端') || j.analysis?.hardSkills?.some((s: string) => s.includes('React') || s.includes('Vue') || s.includes('TypeScript'));
        if (cat === '后端') return j.title.includes('后端') || j.analysis?.hardSkills?.some((s: string) => s.includes('Go') || s.includes('Java') || s.includes('Python'));
        if (cat === '全栈') return j.title.includes('全栈');
        if (cat === 'AI/数据') return j.analysis?.hardSkills?.some((s: string) => s.includes('AI') || s.includes('ML') || s.includes('Python') || s.includes('数据'));
        if (cat === '管理') return j.title.includes('管理') || j.title.includes('Lead') || j.title.includes('经理');
        return true;
      });
    }
    return result;
  }, [jobs, searchQuery, activeCategory]);

  const scrollToJobs = () => {
    document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Trust metrics derived from actual store data
  const candidateFairness = metrics?.candidateFairnessIndex ?? 88;
  const reviewPassRate = metrics?.aiRiskReviewPasses && realityReports?.length
    ? Math.round((metrics.aiRiskReviewPasses / realityReports.length) * 100)
    : 100;
  const avgTrialCompletions = metrics?.trialCompletions ?? 76;

  // Match score based on actual job data completeness and selling points
  const getMatchScore = (job: Job): number | null => {
    const skills = job.analysis?.hardSkills?.length ?? 0;
    const selling = job.analysis?.sellingPoints?.length ?? 0;
    const risks = job.analysis?.riskPoints?.length ?? 0;
    if (!skills) return null;
    // Higher score for well-documented jobs with clear requirements and growth paths
    const base = 60 + Math.min(30, skills * 5);
    const bonus = selling * 3;
    const penalty = risks * 2;
    return Math.min(95, Math.max(50, base + bonus - penalty));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* ═══ HERO — "The Living Resume" atmospheric editorial hero ═══ */}
      <section style={{
        position: 'relative', width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(80px, 16vh, 140px) 32px clamp(48px, 8vh, 80px)',
        overflow: 'hidden',
        minHeight: 'clamp(560px, 90vh, 780px)',
        background: 'linear-gradient(180deg, var(--cr-base) 0%, var(--cr-subtle-warm) 50%, var(--cr-base) 100%)',
      }}>
        {/* ── Layer 1: Animated gradient orbs ── */}
        {/* Warm amber orb — top right */}
        <div className="cr-hero-orb" style={{
          width: 'clamp(300px, 50vw, 700px)', height: 'clamp(300px, 50vw, 700px)',
          top: '-15%', right: '-10%',
          background: 'radial-gradient(circle, rgba(217,119,6,0.18) 0%, rgba(217,119,6,0.06) 40%, transparent 70%)',
          animation: 'crOrbFloat1 18s ease-in-out infinite',
        }} />
        {/* Sage green orb — bottom left */}
        <div className="cr-hero-orb" style={{
          width: 'clamp(250px, 40vw, 560px)', height: 'clamp(250px, 40vw, 560px)',
          bottom: '-20%', left: '-8%',
          background: 'radial-gradient(circle, rgba(5,150,105,0.15) 0%, rgba(5,150,105,0.05) 40%, transparent 70%)',
          animation: 'crOrbFloat2 22s ease-in-out infinite',
        }} />
        {/* Soft indigo orb — center-left */}
        <div className="cr-hero-orb" style={{
          width: 'clamp(200px, 35vw, 480px)', height: 'clamp(200px, 35vw, 480px)',
          top: '35%', left: '25%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.03) 40%, transparent 70%)',
          animation: 'crOrbFloat3 20s ease-in-out infinite',
        }} />

        {/* ── Layer 2: Dot grid texture ── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(var(--cr-border) 0.5px, transparent 0.5px)',
          backgroundSize: '28px 28px',
          opacity: 0.35,
          maskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 30%, transparent 70%)',
        }} />

        {/* ── Layer 3: Floating particles ── */}
        {[
          { x: '72%', y: '28%', size: 3, color: 'var(--cr-accent)', dur: 5, delay: 0 },
          { x: '22%', y: '62%', size: 2, color: 'var(--cr-accent)', dur: 7, delay: 1.2 },
          { x: '82%', y: '55%', size: 4, color: 'var(--cr-warning)', dur: 6, delay: 2.5 },
          { x: '15%', y: '25%', size: 2, color: 'var(--cr-secondary)', dur: 8, delay: 0.8 },
          { x: '65%', y: '72%', size: 3, color: 'var(--cr-accent)', dur: 5.5, delay: 3.2 },
          { x: '40%', y: '15%', size: 2, color: 'var(--cr-warning)', dur: 6.5, delay: 1.8 },
          { x: '55%', y: '80%', size: 4, color: 'var(--cr-secondary)', dur: 7.5, delay: 4 },
          { x: '90%', y: '40%', size: 2, color: 'var(--cr-accent)', dur: 5.8, delay: 2.2 },
        ].map((p, i) => (
          <div key={i} className="cr-hero-particle" style={{
            left: p.x, top: p.y, width: p.size, height: p.size,
            background: p.color,
            animation: `crParticleDrift ${p.dur}s ${p.delay}s ease-in-out infinite`,
          }} />
        ))}

        {/* ── Layer 4: Center content ── */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 720, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* AI badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '5px 16px', borderRadius: 'var(--cr-radius-full)',
              background: 'var(--cr-accent-subtle)',
              border: '1px solid rgba(5,150,105,0.18)',
              color: 'var(--cr-accent)', fontSize: 12, fontWeight: 600,
              fontFamily: 'var(--cr-font-sans)',
              letterSpacing: '0.02em',
              marginBottom: 'clamp(24px, 4vh, 36px)',
            }}
          >
            <Sparkles size={13} />
            AI 驱动的沉浸式岗位体验
          </motion.div>

          {/* ── Pulse ring visualization ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: 'relative',
              width: 'clamp(80px, 12vw, 140px)',
              height: 'clamp(80px, 12vw, 140px)',
              marginBottom: 'clamp(20px, 3vh, 32px)',
            }}
          >
            {/* Radiating pulse rings */}
            <div className="cr-hero-pulse-ring" style={{ animationName: 'crPulseRing1', animationDelay: '0s' }} />
            <div className="cr-hero-pulse-ring" style={{ animationName: 'crPulseRing2', animationDelay: '0.8s' }} />
            <div className="cr-hero-pulse-ring" style={{ animationName: 'crPulseRing3', animationDelay: '1.6s' }} />
            {/* Center dot */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 'clamp(16px, 2.5vw, 24px)',
                height: 'clamp(16px, 2.5vw, 24px)',
                borderRadius: '50%',
                background: 'radial-gradient(circle, var(--cr-accent) 0%, rgba(5,150,105,0.6) 60%, transparent 100%)',
                boxShadow: '0 0 32px var(--cr-accent-glow), 0 0 64px rgba(5,150,105,0.15)',
              }} />
            </div>
          </motion.div>

          {/* ── Massive editorial headline ── */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              fontFamily: 'var(--cr-font-display)',
              fontSize: 'clamp(40px, 8.5vw, 88px)',
              fontWeight: 700,
              color: 'var(--cr-ink)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              margin: '0 0 12px',
            }}
          >
            展示真实的你
          </motion.h1>

          {/* Sub headline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              fontFamily: 'var(--cr-font-display)',
              fontSize: 'clamp(18px, 3vw, 28px)',
              fontWeight: 400,
              color: 'var(--cr-ink-dim)',
              letterSpacing: '-0.01em',
              margin: '0 0 clamp(28px, 4vh, 40px)',
            }}
          >
            而不只是一份简历
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            style={{
              fontSize: 'clamp(14px, 1.6vw, 17px)',
              color: 'var(--cr-ink-soft)',
              lineHeight: 1.75,
              margin: '0 auto clamp(28px, 4vh, 36px)',
              maxWidth: 520,
            }}
          >
            进入 AI 构建的岗位实境，在真实工作场景中展示你的思考方式和技术判断。
            HR 看到的不再是关键词匹配，而是一个立体的你。
          </motion.p>

          {/* ── CTAs ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'clamp(32px, 5vh, 48px)' }}
          >
            <button
              className="cr-btn-primary cr-btn-lg"
              onClick={scrollToJobs}
              style={{
                fontSize: 'clamp(15px, 1.8vw, 17px)',
                padding: 'clamp(14px, 2vw, 18px) clamp(28px, 4vw, 40px)',
                boxShadow: '0 4px 24px rgba(5,150,105,0.3), 0 0 60px rgba(5,150,105,0.1)',
              }}
            >
              浏览开放岗位 <ArrowDown size={18} />
            </button>
            <button
              className="cr-btn-secondary cr-btn-lg"
              onClick={() => { setShowQuiz(true); setTimeout(() => document.getElementById('quiz-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              style={{
                fontSize: 'clamp(15px, 1.8vw, 17px)',
                padding: 'clamp(14px, 2vw, 18px) clamp(28px, 4vw, 40px)',
              }}
            >
              快速匹配适合我的岗位 <Sparkles size={18} />
            </button>
          </motion.div>

          {/* ── Trust metrics strip ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 'clamp(20px, 5vw, 48px)',
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: `${reviewPassRate}%`, label: 'AI风险复核通过', icon: Shield, color: 'var(--cr-accent)' },
              { value: `${avgTrialCompletions}+`, label: '累计体验完成', icon: Zap, color: 'var(--cr-secondary)' },
              { value: `${candidateFairness}%`, label: '候选人公平指数', icon: Smile, color: 'var(--cr-warning)' },
            ].map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px',
                borderRadius: 'var(--cr-radius-md)',
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--cr-border-light)',
              }}>
                <m.icon size={15} strokeWidth={1.5} style={{ color: m.color, flexShrink: 0 }} />
                <span className="cr-hero-metric-value" style={{ color: m.color }}>{m.value}</span>
                <span className="cr-hero-metric-label">{m.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Scroll indicator ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="cr-scroll-indicator"
          style={{
            position: 'absolute', bottom: 'clamp(16px, 2.5vh, 28px)', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            cursor: 'pointer', zIndex: 2,
          }}
          onClick={scrollToJobs}
        >
          <span style={{ fontSize: 10, color: 'var(--cr-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>探索</span>
          <ArrowDown size={14} style={{ color: 'var(--cr-muted)', opacity: 0.6 }} />
        </motion.div>
      </section>

      {/* ═══ How It Works ═══ */}
      <HowItWorks />

      {/* ═══ Skills Quiz (conditional) ═══ */}
      <div id="quiz-section" style={{ width: '100%' }}>
        {showQuiz ? (
          <div className="cr-section-alt" style={{ width: '100%' }}>
            <SkillsQuiz onComplete={(answers) => {
              if (answers.skill === 'frontend') setActiveCategory('前端');
              else if (answers.skill === 'backend') setActiveCategory('后端');
              else if (answers.skill === 'fullstack') setActiveCategory('全栈');
              else if (answers.skill === 'management') setActiveCategory('管理');
              setTimeout(() => document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' }), 300);
            }} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--cr-space-2xl) 0', maxWidth: 500, margin: '0 auto' }}>
            <p style={{ fontSize: 14, color: 'var(--cr-muted)', margin: 0 }}>
              不确定哪个岗位适合你？
              <button
                onClick={() => { setShowQuiz(true); setTimeout(() => document.getElementById('quiz-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                style={{ background: 'none', border: 'none', color: 'var(--cr-accent)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--cr-font-sans)', fontSize: 14, marginLeft: 4, textDecoration: 'underline' }}
              >
                花30秒做个快速匹配 →
              </button>
            </p>
          </div>
        )}
      </div>

      {/* ═══ Job List + Context Sidebar ═══ */}
      <div id="jobs-section" style={{ width: '100%', maxWidth: 'var(--cr-content-xxl)', margin: '0 auto', padding: 'var(--cr-space-3xl) var(--cr-page-padding) var(--cr-space-5xl)' }}>
        <div className="cr-two-panel">
          <div style={{ minWidth: 0 }}>
            {/* Header + Search + Filters */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <span className="cr-eyebrow">开放岗位 · {filteredJobs.length} 个</span>
                  {searchQuery && (
                    <span style={{ fontSize: 12, color: 'var(--cr-muted)', marginLeft: 8 }}>
                      搜索 "{searchQuery}" 的结果
                    </span>
                  )}
                </div>
              </div>

              {/* Search bar */}
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--cr-muted)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索岗位名称、技能或关键词..."
                  className="cr-input"
                  style={{ paddingLeft: 42 }}
                />
              </div>

              {/* Category filter pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '6px 16px', borderRadius: 'var(--cr-radius-full)',
                      border: activeCategory === cat ? '1.5px solid var(--cr-accent)' : '1px solid var(--cr-border)',
                      background: activeCategory === cat ? 'var(--cr-accent-subtle)' : 'var(--cr-surface)',
                      color: activeCategory === cat ? 'var(--cr-accent)' : 'var(--cr-ink-dim)',
                      fontSize: 13, fontWeight: activeCategory === cat ? 600 : 400,
                      fontFamily: 'var(--cr-font-sans)', cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat}
                    {cat === '前端' && ' 🔵'}
                    {cat === '后端' && ' 🟢'}
                    {cat === 'AI/数据' && ' 🟣'}
                  </button>
                ))}
              </div>
            </div>

            {/* Job cards grid */}
            {filteredJobs.length === 0 ? (
              <div className="cr-empty-state">
                <Search size={36} strokeWidth={1} style={{ color: 'var(--cr-muted)', opacity: 0.5 }} />
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--cr-ink)' }}>没有匹配的岗位</h3>
                <p style={{ fontSize: 13, color: 'var(--cr-muted)' }}>试试调整搜索词或筛选条件</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {filteredJobs.map((job, i) => {
                  const matchScore = getMatchScore(job);
                  const isHot = job.analysis?.sellingPoints && job.analysis.sellingPoints.length >= 3;
                  const isNew = i === 0;

                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20, scale: 0.97 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: '-30px' }}
                      transition={{ delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="cr-card"
                      style={{
                        cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14,
                        padding: 'var(--cr-space-xl) var(--cr-space-2xl)',
                        position: 'relative', overflow: 'visible',
                      }}
                      onClick={() => navigate(`/candidate/job/${job.id}`)}
                    >
                      {/* Badge ribbon */}
                      {(isHot || isNew) && (
                        <div style={{
                          position: 'absolute', top: 0, right: 20,
                          padding: '3px 12px', borderRadius: '0 0 var(--cr-radius-sm) var(--cr-radius-sm)',
                          background: isNew ? 'var(--cr-accent)' : 'var(--cr-warning)',
                          color: '#fff', fontSize: 11, fontWeight: 700,
                          fontFamily: 'var(--cr-font-mono)', letterSpacing: '0.04em',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          {isNew ? <Sparkles size={10} /> : <Flame size={10} />}
                          {isNew ? 'NEW' : 'HOT'}
                        </div>
                      )}

                      {/* Header: title + match score */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--cr-ink)', fontFamily: 'var(--cr-font-display)', margin: 0, lineHeight: 1.3 }}>
                          {job.title}
                        </h3>
                        {matchScore && (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '4px 10px', borderRadius: 'var(--cr-radius-full)',
                            background: matchScore >= 80 ? 'var(--cr-positive-bg)' : 'var(--cr-accent-subtle)',
                            flexShrink: 0,
                          }} title="基于岗位信息完整度和技能匹配度的综合评分">
                            <TrendingUp size={12} style={{ color: matchScore >= 80 ? 'var(--cr-positive)' : 'var(--cr-accent)' }} />
                            <span style={{
                              fontSize: 11, fontWeight: 500,
                              color: 'var(--cr-muted)',
                            }}>匹配</span>
                            <span style={{
                              fontSize: 13, fontWeight: 700,
                              color: matchScore >= 80 ? 'var(--cr-positive)' : 'var(--cr-accent)',
                              fontFamily: 'var(--cr-font-mono)',
                            }}>
                              {matchScore}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Meta row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--cr-ink-dim)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={13} strokeWidth={1.5} />{job.department}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} strokeWidth={1.5} />{job.location}</span>
                      </div>

                      {/* Salary + badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '5px 14px', borderRadius: 'var(--cr-radius-full)',
                          background: 'var(--cr-positive-bg)', color: 'var(--cr-positive)',
                          fontSize: 15, fontWeight: 700, fontFamily: 'var(--cr-font-display)',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          <Banknote size={14} strokeWidth={1.5} />
                          {job.salaryMin}k - {job.salaryMax}k
                        </span>
                        <span className="cr-badge cr-badge-neutral">{job.experience}</span>
                        <span className="cr-badge cr-badge-neutral">{job.education}</span>
                      </div>

                      {/* Skill tags */}
                      {job.analysis?.hardSkills && job.analysis.hardSkills.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {job.analysis.hardSkills.slice(0, 4).map((skill: string) => (
                            <span key={skill} style={{
                              padding: '3px 8px', borderRadius: 'var(--cr-radius-full)',
                              background: 'var(--cr-subtle)', color: 'var(--cr-ink-dim)',
                              fontSize: 11, fontWeight: 500,
                            }}>
                              {skill}
                            </span>
                          ))}
                          {job.analysis.hardSkills.length > 4 && (
                            <span style={{ fontSize: 11, color: 'var(--cr-muted)', padding: '3px 4px' }}>
                              +{job.analysis.hardSkills.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Selling point */}
                      {job.analysis?.sellingPoints?.[0] && (
                        <p style={{ fontSize: 13, color: 'var(--cr-ink-soft)', lineHeight: 1.5, margin: 0, flex: 1 }}>
                          💡 {job.analysis.sellingPoints[0]}
                        </p>
                      )}

                      {/* CTA */}
                      <button
                        className="cr-btn-primary"
                        onClick={(e) => { e.stopPropagation(); navigate(`/candidate/job/${job.id}`); }}
                        style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
                      >
                        了解详情 <ArrowRight size={16} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <aside><ContextPanel type="home" /></aside>
        </div>
      </div>

      {/* ═══ Trust & Transparency ═══ */}
      <div className="cr-section-alt" style={{ width: '100%' }}>
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ maxWidth: 800, width: '100%', margin: '0 auto', padding: 'var(--cr-space-3xl) var(--cr-space-xl)' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 'var(--cr-space-2xl)' }}>
            <span className="cr-eyebrow" style={{ textAlign: 'center' }}>信任与透明</span>
            <h2 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 22, fontWeight: 700, color: 'var(--cr-ink)', margin: '8px 0 12px' }}>为什么候选人信任我们</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--cr-space-lg)' }}>
            {[
              { icon: Shield, title: `AI辅助 · ${reviewPassRate}%复核通过`, desc: '所有招聘决定由真人复核。AI提供分析建议，最终决策权永远在HR手中。', color: '#059669' },
              { icon: Zap, title: `${avgTrialCompletions}+ 人已完成体验`, desc: '累计完成体验数据。一次完整的实境体验流程简洁，支持随时暂停和恢复。', color: '#6366F1' },
              { icon: Smile, title: `${candidateFairness}% 候选人公平指数`, desc: '平台持续监控招聘公平性指标，确保每位候选人获得公正的评估和机会。', color: '#D97706' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
                className="cr-card" style={{ textAlign: 'center', borderTop: `3px solid ${item.color}` }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <item.icon size={22} strokeWidth={1.5} style={{ color: item.color }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--cr-ink)', fontFamily: 'var(--cr-font-display)', marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: 'var(--cr-ink-dim)', lineHeight: 1.6 }}>{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══ Footer ═══ */}
      <div style={{ padding: 'var(--cr-space-3xl) var(--cr-space-xl)', display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--cr-muted)', flexWrap: 'wrap' }}>
        <span style={{ cursor: 'pointer', color: 'var(--cr-ink-dim)' }} onClick={() => navigate('/hr')}>企业端</span>
        <span style={{ color: 'var(--cr-border-strong)' }}>·</span>
        <span style={{ color: 'var(--cr-ink-dim)', cursor: 'not-allowed', opacity: 0.6 }} title="即将上线">关于我们</span>
        <span style={{ color: 'var(--cr-border-strong)' }}>·</span>
        <span style={{ cursor: 'pointer', color: 'var(--cr-ink-dim)' }} onClick={() => setShowPrivacy(true)}>隐私政策</span>
        <span style={{ color: 'var(--cr-border-strong)' }}>·</span>
        <span style={{ fontSize: 11, fontFamily: 'var(--cr-font-mono)', color: 'var(--cr-muted)' }}>智遇 · 让招聘回归能力本身</span>
      </div>
      {showPrivacy && (
        <div className="cr-modal-backdrop" onClick={() => setShowPrivacy(false)}>
          <div className="cr-modal cr-modal-wide" onClick={(e) => e.stopPropagation()}>
            <CandidateRightsPanel onClose={() => setShowPrivacy(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
