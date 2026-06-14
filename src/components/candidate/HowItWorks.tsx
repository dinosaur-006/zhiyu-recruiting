import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, FileText, ArrowRight, Sparkles } from 'lucide-react';

interface Step {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  number: string;
  title: string;
  subtitle: string;
  detail: string;
  color: string;
  bgColor: string;
}

const STEPS: Step[] = [
  {
    icon: Search,
    number: '01',
    title: '探索岗位',
    subtitle: '发现与你匹配的机会',
    detail: '浏览开放岗位，通过互动式重力沙盘表达你最看重的维度。系统会根据你的偏好智能排序展示内容。',
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  {
    icon: Play,
    number: '02',
    title: '实境体验',
    subtitle: '在真实场景中展示能力',
    detail: '进入AI驱动的沉浸式岗位实境，与数字人角色对话，解决真实工作场景中的挑战。不是测试，而是双向探索。',
    color: '#6366F1',
    bgColor: '#EEF2FF',
  },
  {
    icon: FileText,
    number: '03',
    title: '获得洞察',
    subtitle: '让HR看到简历之外的能力',
    detail: '系统生成专属能力画像报告，展示你的核心能力特征和成长潜力。HR基于此做出更有依据的面试决策。',
    color: '#D97706',
    bgColor: '#FFFBEB',
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const particles = useMemo(() => Array.from({ length: 12 }).map(() => ({
    size: 4 + Math.random() * 8,
    baseOpacity: 0.15 + Math.random() * 0.2,
    x1: Math.random() * 300 - 150, x2: Math.random() * 300 - 150,
    y1: Math.random() * 300 - 150, y2: Math.random() * 300 - 150,
  })), []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 8s of inactivity
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const ActiveIcon = STEPS[activeStep].icon;

  return (
    <section style={{ padding: 'var(--cr-space-4xl) 0', maxWidth: 'var(--cr-content-xl)', margin: '0 auto', width: '100%' }}>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: 'var(--cr-space-3xl)' }}
      >
        <span className="cr-eyebrow" style={{ textAlign: 'center' }}>全新体验流程</span>
        <h2 style={{
          fontFamily: 'var(--cr-font-display)',
          fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: 700,
          color: 'var(--cr-ink)',
          letterSpacing: '-0.02em',
          margin: '8px 0 12px',
        }}>
          不只是投递，而是被真正看见
        </h2>
        <p style={{ fontSize: 15, color: 'var(--cr-ink-dim)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          三步完成从「陌生简历」到「立体画像」的转变
        </p>
      </motion.div>

      {/* Main display */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 'var(--cr-space-3xl)', alignItems: 'center',
      }}>
        {/* Left: Animated illustration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            position: 'relative',
            height: 380,
            borderRadius: 'var(--cr-radius-xl)',
            background: STEPS[activeStep].bgColor,
            border: `1px solid ${STEPS[activeStep].color}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Ambient background elements */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(circle at 50% 50%, ${STEPS[activeStep].color}11 0%, transparent 70%)`,
          }} />

          {/* Floating particles — stable positions using useMemo */}
          {particles.map((p, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: p.size, height: p.size,
                borderRadius: '50%',
                background: STEPS[activeStep].color,
                opacity: p.baseOpacity,
              }}
              animate={{
                x: [p.x1, p.x2, p.x1],
                y: [p.y1, p.y2, p.y1],
                scale: [1, 1.5, 1],
                opacity: [p.baseOpacity, p.baseOpacity * 1.8, p.baseOpacity],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Central animated icon */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.6, opacity: 0, rotate: 10 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{
                position: 'relative', zIndex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 16,
              }}
            >
              {/* Outer pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  width: 160, height: 160, borderRadius: '50%',
                  border: `2px solid ${STEPS[activeStep].color}44`,
                }}
              />

              {/* Icon container */}
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: `linear-gradient(135deg, ${STEPS[activeStep].color}, ${STEPS[activeStep].color}cc)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 12px 40px ${STEPS[activeStep].color}33`,
                position: 'relative', zIndex: 1,
              }}>
                <ActiveIcon size={44} strokeWidth={1.5} style={{ color: '#fff' }} />
              </div>

              {/* Step number */}
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  fontFamily: 'var(--cr-font-mono)',
                  fontSize: 13, fontWeight: 700,
                  color: STEPS[activeStep].color,
                  letterSpacing: '0.06em',
                }}
              >
                步骤 {STEPS[activeStep].number}
              </motion.span>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div style={{
            position: 'absolute', bottom: 20,
            display: 'flex', gap: 8,
          }}>
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => handleStepClick(i)}
                style={{
                  width: i === activeStep ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: 'none',
                  background: i === activeStep ? STEPS[i].color : `${STEPS[i].color}33`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                aria-label={`切换到步骤 ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Right: Step details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {STEPS.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i === activeStep;

            return (
              <motion.button
                key={i}
                onClick={() => handleStepClick(i)}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                  padding: 'var(--cr-space-lg) var(--cr-space-xl)',
                  borderRadius: 'var(--cr-radius-lg)',
                  border: isActive ? `2px solid ${step.color}` : '1px solid var(--cr-border-light)',
                  background: isActive ? step.bgColor : 'var(--cr-surface)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--cr-font-sans)',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--cr-radius-md)',
                  background: isActive ? step.color : 'var(--cr-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                }}>
                  <StepIcon size={20} strokeWidth={1.5} style={{ color: isActive ? '#fff' : 'var(--cr-muted)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'baseline', gap: 8,
                    marginBottom: 4,
                  }}>
                    <span style={{
                      fontFamily: 'var(--cr-font-mono)',
                      fontSize: 11, fontWeight: 700,
                      color: step.color,
                    }}>
                      {step.number}
                    </span>
                    <span style={{
                      fontSize: 16, fontWeight: 600,
                      color: isActive ? 'var(--cr-ink)' : 'var(--cr-ink-soft)',
                      fontFamily: 'var(--cr-font-display)',
                    }}>
                      {step.title}
                    </span>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          padding: '2px 8px', borderRadius: 'var(--cr-radius-full)',
                          background: step.color, color: '#fff',
                          fontSize: 10, fontWeight: 600,
                        }}
                      >
                        当前
                      </motion.span>
                    )}
                  </div>
                  <AnimatePresence mode="wait">
                    {isActive ? (
                      <motion.p
                        key="detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{
                          fontSize: 14, color: 'var(--cr-ink-soft)',
                          lineHeight: 1.7, margin: 0,
                          overflow: 'hidden',
                        }}
                      >
                        {step.detail}
                      </motion.p>
                    ) : (
                      <motion.p
                        key="subtitle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          fontSize: 13, color: 'var(--cr-muted)',
                          margin: 0,
                        }}
                      >
                        {step.subtitle}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
