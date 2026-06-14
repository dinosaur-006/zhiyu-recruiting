import { motion } from 'framer-motion';
import { TrendingUp, Target, Award, Star } from 'lucide-react';
import type { Job } from '../../types';

interface Milestone { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; period: string; title: string; skills: string[]; highlight?: string; }

const TECH_PATH: Milestone[] = [
  { icon: Target, period: '0-6个月', title: '融入与上手', skills: ['代码库熟悉', '团队流程', '独立完成需求'], highlight: '实境体验加速融入' },
  { icon: TrendingUp, period: '6-12个月', title: '独立贡献', skills: ['负责核心模块', '架构讨论', 'Code Review'] },
  { icon: Award, period: '1-2年', title: '领域深耕', skills: ['技术方案设计', '跨团队协作', '新人指导'] },
  { icon: Star, period: '2-3年', title: '技术引领', skills: ['架构决策', '团队规划', '行业影响力'], highlight: '技术/管理双路径可选' },
];

const SALES_PATH: Milestone[] = [
  { icon: Target, period: '0-3个月', title: '熟悉业务', skills: ['产品知识', 'CRM系统', '跟进中小客户'], highlight: '前3月不设硬性指标' },
  { icon: TrendingUp, period: '3-6个月', title: '独立开拓', skills: ['跟进KA客户', '完成首次签约', '流程优化'] },
  { icon: Award, period: '6-12个月', title: '业绩贡献', skills: ['季度指标达成', '客户关系维护', '新人带教'] },
  { icon: Star, period: '1-3年', title: '团队领导', skills: ['销售策略', '团队管理', '资源整合'], highlight: '可晋升区域总监' },
];

const DESIGN_PATH: Milestone[] = [
  { icon: Target, period: '0-3个月', title: '融入体系', skills: ['设计系统', '产品理解', '协作流程'] },
  { icon: TrendingUp, period: '3-6个月', title: '独立交付', skills: ['主导功能设计', '用户研究', '设计评审'] },
  { icon: Award, period: '1-2年', title: '设计影响力', skills: ['设计规范制定', '跨项目支持', '设计文化'] },
  { icon: Star, period: '2-4年', title: '设计领导力', skills: ['品牌策略', '团队建设', '行业分享'], highlight: '可晋升设计总监' },
];

const FULLSTACK_PATH: Milestone[] = [
  { icon: Target, period: '0-6个月', title: '全栈融入', skills: ['业务理解', '技术栈熟悉', '独立交付需求'], highlight: '前3个月侧重优势端深耕' },
  { icon: TrendingUp, period: '6-12个月', title: '端到端交付', skills: ['独立负责模块', 'API与数据库设计', '性能优化'] },
  { icon: Award, period: '1-2年', title: '架构参与', skills: ['系统方案设计', '跨端技术决策', '新人指导'] },
  { icon: Star, period: '2-4年', title: '技术引领', skills: ['架构决策', '技术规划', '团队建设'], highlight: '可晋升全栈架构师或Tech Lead' },
];

interface GrowthCompassProps { job?: Job; }

export function GrowthCompass({ job }: GrowthCompassProps) {
  const isSales = job?.department?.includes('销售') || job?.title?.includes('销售');
  const isDesign = job?.department?.includes('设计') || job?.title?.includes('设计');
  const isFullstack = job?.title?.includes('全栈');
  const milestones = isSales ? SALES_PATH : isDesign ? DESIGN_PATH : isFullstack ? FULLSTACK_PATH : TECH_PATH;
  const title = isSales ? '销售成长路径' : isDesign ? '设计成长路径' : isFullstack ? '全栈成长路径' : '技术成长路径';
  const colors = ['#059669', '#6366F1', '#D97706', '#2563EB'];

  return (
    <section className="cr-section-block">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="cr-section-title">
        <span className="cr-eyebrow" style={{ textAlign: 'center' }}>成长路径</span>
        <h2>{title}</h2>
        <p>基于团队实际发展路径的参考展望</p>
      </motion.div>

      {/* Horizontal timeline — 4 columns + connecting line */}
      <div style={{ position: 'relative' }}>
        {/* Connecting line */}
        <div style={{ position: 'absolute', top: 32, left: '12%', right: '12%', height: 2, background: 'linear-gradient(90deg, var(--cr-accent), var(--cr-border), var(--cr-accent))', zIndex: 0 }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--cr-space-lg)', position: 'relative', zIndex: 1 }}>
          {milestones.map((m, i) => {
            const Icon = m.icon;
            const color = colors[i];
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ textAlign: 'center' }}>
                {/* Timeline dot */}
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: color, border: '3px solid var(--cr-surface)', margin: '0 auto 16px', boxShadow: `0 0 0 4px ${color}22`, position: 'relative', zIndex: 2 }} />

                {/* Card */}
                <div className="cr-card" style={{ padding: 'var(--cr-space-lg)', borderTop: `3px solid ${color}`, textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--cr-radius-sm)', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <Icon size={18} strokeWidth={1.5} style={{ color }} />
                  </div>
                  <div style={{ fontFamily: 'var(--cr-font-mono)', fontSize: 'var(--cr-text-xs)', fontWeight: 700, color, letterSpacing: '0.04em', marginBottom: 4 }}>{m.period}</div>
                  <div style={{ fontFamily: 'var(--cr-font-display)', fontSize: 'var(--cr-text-md)', fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 8 }}>{m.title}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                    {m.skills.map((s) => <span key={s} style={{ padding: '3px 8px', borderRadius: 'var(--cr-radius-full)', background: 'var(--cr-subtle)', fontSize: 11, color: 'var(--cr-ink-dim)', whiteSpace: 'nowrap' }}>{s}</span>)}
                  </div>
                  {m.highlight && (
                    <div style={{ marginTop: 10, padding: '6px 10px', borderRadius: 'var(--cr-radius-sm)', background: `${color}08`, fontSize: 11, color, fontWeight: 500, lineHeight: 1.4 }}>{m.highlight}</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
