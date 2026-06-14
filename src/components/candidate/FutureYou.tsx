import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Briefcase, GraduationCap, TrendingUp } from 'lucide-react';

interface CareerStage {
  id: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  timeframe: string;
  skills: string[];
  salaryRange: string;
  description: string;
  color: string;
}

const STAGES: CareerStage[] = [
  {
    id: 'current',
    icon: Briefcase,
    title: '当前岗位',
    timeframe: '现在',
    skills: ['React', 'TypeScript', '系统设计基础'],
    salaryRange: '25k-35k',
    description: '入职后快速融入团队，通过实境体验中展现的能力加速适应过程。',
    color: '#059669',
  },
  {
    id: 'senior',
    icon: TrendingUp,
    title: '高级工程师',
    timeframe: '1-2 年',
    skills: ['架构设计', '性能优化', '技术方案评审', '新人指导'],
    salaryRange: '35k-50k',
    description: '负责核心模块架构设计，参与跨团队技术决策，开始指导初级工程师。',
    color: '#6366F1',
  },
  {
    id: 'lead',
    icon: GraduationCap,
    title: '技术专家 / 团队Leader',
    timeframe: '2-4 年',
    skills: ['技术规划', '团队建设', '跨部门协调', '行业影响力'],
    salaryRange: '50k-70k',
    description: '两条路径可选：深耕技术成为领域专家，或转向管理带领团队。',
    color: '#D97706',
  },
  {
    id: 'architect',
    icon: Rocket,
    title: '架构师 / 技术总监',
    timeframe: '4-6 年',
    skills: ['技术战略', '组织架构设计', '技术品牌建设', '商业思维'],
    salaryRange: '70k-100k+',
    description: '影响公司技术方向，建立技术品牌，培养下一代技术骨干。',
    color: '#2563EB',
  },
];

export function FutureYou() {
  const [activeStage, setActiveStage] = useState<string>('current');
  const active = STAGES.find((s) => s.id === activeStage) ?? STAGES[0];
  const activeIndex = STAGES.findIndex((s) => s.id === activeStage);
  const ActiveIcon = active.icon;

  return (
    <section style={{ padding: 'var(--cr-space-4xl) 0', maxWidth: 'var(--cr-content-xl)', margin: '0 auto', width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: 'var(--cr-space-2xl)' }}
      >
        <span className="cr-eyebrow" style={{ textAlign: 'center' }}>未来发展</span>
        <h2 style={{
          fontFamily: 'var(--cr-font-display)',
          fontSize: 'clamp(22px, 3.5vw, 28px)',
          fontWeight: 700, color: 'var(--cr-ink)',
          letterSpacing: '-0.02em', margin: '8px 0 12px',
        }}>
          这个岗位能带你去哪里
        </h2>
        <p style={{ fontSize: 14, color: 'var(--cr-ink-dim)', maxWidth: 440, margin: '0 auto', lineHeight: 1.7 }}>
          基于真实团队发展数据绘制的职业成长路径参考
        </p>
      </motion.div>

      {/* Stage selector */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{
          display: 'flex', justifyContent: 'center', gap: 4,
          marginBottom: 'var(--cr-space-2xl)',
          background: 'var(--cr-subtle)', borderRadius: 'var(--cr-radius-full)',
          padding: 4, maxWidth: 520, margin: '0 auto var(--cr-space-2xl)',
        }}
      >
        {STAGES.map((stage, i) => (
          <button
            key={stage.id}
            onClick={() => setActiveStage(stage.id)}
            style={{
              flex: 1, padding: '10px 16px',
              borderRadius: 'var(--cr-radius-full)',
              border: 'none',
              background: activeStage === stage.id ? 'var(--cr-surface)' : 'transparent',
              color: activeStage === stage.id ? stage.color : 'var(--cr-muted)',
              fontSize: 13, fontWeight: activeStage === stage.id ? 600 : 500,
              fontFamily: 'var(--cr-font-sans)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeStage === stage.id ? 'var(--cr-shadow-sm)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {stage.title}
          </button>
        ))}
      </motion.div>

      {/* Stage detail */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 'var(--cr-space-2xl)', alignItems: 'start',
      }}>
        {/* Visual card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="cr-card-elevated"
            style={{
              borderLeft: `4px solid ${active.color}`,
            }}
          >
            {/* Progress bar */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
              {STAGES.map((s, i) => (
                <div key={s.id} style={{ flex: 1 }}>
                  <div style={{
                    height: 4, borderRadius: 2,
                    background: i <= activeIndex ? active.color : 'var(--cr-border)',
                    transition: 'background 0.3s ease',
                  }} />
                  <div style={{
                    fontSize: 10, color: i <= activeIndex ? active.color : 'var(--cr-muted)',
                    marginTop: 4, fontWeight: i === activeIndex ? 600 : 400,
                    transition: 'color 0.3s ease',
                  }}>
                    {s.timeframe}
                  </div>
                </div>
              ))}
            </div>

            {/* Icon + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <motion.div
                key={active.id + '-icon'}
                initial={{ rotate: -15, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${active.color}, ${active.color}cc)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 28px ${active.color}33`,
                }}
              >
                <ActiveIcon size={28} strokeWidth={1.5} style={{ color: '#fff' }} />
              </motion.div>
              <div>
                <h3 style={{
                  fontFamily: 'var(--cr-font-display)', fontSize: 22,
                  fontWeight: 700, color: 'var(--cr-ink)', margin: '0 0 2px',
                }}>
                  {active.title}
                </h3>
                <span style={{ fontSize: 14, color: active.color, fontWeight: 500 }}>
                  {active.timeframe}
                </span>
              </div>
            </div>

            <p style={{
              fontSize: 14, color: 'var(--cr-ink-soft)',
              lineHeight: 1.7, marginBottom: 20,
            }}>
              {active.description}
            </p>

            {/* Salary */}
            <div style={{
              padding: 'var(--cr-space-md) var(--cr-space-lg)',
              background: 'var(--cr-positive-bg)',
              borderRadius: 'var(--cr-radius-md)',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 15, fontWeight: 600, color: 'var(--cr-positive)',
              marginBottom: 16,
            }}>
              <Briefcase size={15} />
              参考薪资范围：{active.salaryRange}
            </div>

            {/* Skill tags */}
            <div>
              <span className="cr-eyebrow">核心技能</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {active.skills.map((skill) => (
                  <span key={skill} style={{
                    padding: '6px 14px', borderRadius: 'var(--cr-radius-full)',
                    background: `${active.color}12`, color: active.color,
                    fontSize: 12, fontWeight: 500,
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Right: Quick actions + growth tips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="cr-card"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 12, color: 'var(--cr-muted)', textAlign: 'center', margin: 0 }}>
                此职业路径基于真实团队发展数据绘制，供参考。
              </p>
            </div>
          </motion.div>

          {/* Growth tip */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="cr-card"
            style={{
              background: 'linear-gradient(135deg, var(--cr-accent-subtle) 0%, var(--cr-surface) 100%)',
              borderLeft: '3px solid var(--cr-accent)',
            }}
          >
            <h4 style={{
              fontFamily: 'var(--cr-font-display)', fontSize: 16,
              fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 8,
            }}>
              成长建议
            </h4>
            <p style={{
              fontSize: 13, color: 'var(--cr-ink-soft)',
              lineHeight: 1.7, margin: 0,
            }}>
              基于你的实境体验表现，{activeIndex === 0
                ? '建议先聚焦当前岗位的核心技术栈，在Code Review和技术分享中逐步建立影响力。'
                : activeIndex === 1
                ? '建议开始承担更多架构设计工作，通过技术方案评审培养系统性思维。'
                : activeIndex === 2
                ? '这个阶段需要做出关键选择：深耕技术还是走向管理。两种路径都有明确的发展空间。'
                : '需要培养商业思维和组织视角，从"怎么做"转向"做什么和为什么做"。'
              }
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
