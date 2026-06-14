import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, Coffee, Laptop, BookOpen, Heart, Plane, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface Benefit {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  value: string;
  detail: string;
  category: 'compensation' | 'wellness' | 'growth' | 'lifestyle';
}

const BENEFITS: Benefit[] = [
  { icon: Banknote, title: '年终奖金', value: '13-15薪', detail: '基于个人和团队绩效评估，大多数员工获得14薪。年度调薪窗口每年两次。', category: 'compensation' },
  { icon: Heart, title: '六险一金', value: '全额缴纳', detail: '除法定五险一金外，额外提供补充商业医疗保险，覆盖门诊和住院。', category: 'compensation' },
  { icon: BookOpen, title: '学习基金', value: '¥5,000/年', detail: '可用于购买书籍、在线课程、参加技术会议。不需要审批，凭发票报销。', category: 'growth' },
  { icon: Laptop, title: '设备补贴', value: '¥8,000/两年', detail: '入职即配MacBook Pro。每两年可申请设备升级补贴，自由选择配置。', category: 'lifestyle' },
  { icon: Coffee, title: '弹性工作', value: '核心10-16点', detail: '不打卡。核心协作时段10:00-16:00，其余时间自由安排。每周可申请2天远程。', category: 'lifestyle' },
  { icon: Clock, title: '带薪年假', value: '12天起', detail: '入职即享12天带薪年假，每满一年增加1天，上限20天。另有5天带薪病假。', category: 'wellness' },
  { icon: Plane, title: '团建旅行', value: '每年1-2次', detail: '公司级别的年度旅行+部门级别的季度团建。过往目的地包括云南、日本、泰国。', category: 'wellness' },
];

const categoryLabels: Record<string, string> = { compensation: '薪酬保障', wellness: '健康关怀', growth: '成长发展', lifestyle: '工作方式' };

interface BenefitsCalculatorProps {
  monthlyBase?: number;
}

export function BenefitsCalculator({ monthlyBase = 30000 }: BenefitsCalculatorProps) {
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null);

  return (
    <section className="cr-section-block">
      <div className="cr-section-title">
        <span className="cr-eyebrow" style={{ textAlign: 'center' }}>福利待遇</span>
        <h2>不只是薪资，更是全面回报</h2>
      </div>

      {/* Benefit cards — simple grid, no tabs, no calculator */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, maxWidth: 1000, margin: '0 auto' }}>
        {BENEFITS.map((b, i) => (
          <motion.div key={b.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.3 }}
            className="cr-card" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            onClick={() => setExpandedBenefit(expandedBenefit === b.title ? null : b.title)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <b.icon size={20} strokeWidth={1.5} style={{ color: 'var(--cr-accent)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--cr-ink)' }}>{b.title}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--cr-accent)', fontFamily: 'var(--cr-font-display)' }}>{b.value}</div>
              </div>
              {expandedBenefit === b.title ? <ChevronUp size={16} style={{ color: 'var(--cr-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--cr-muted)' }} />}
            </div>
            <AnimatePresence>
              {expandedBenefit === b.title && (
                <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ fontSize: 13, color: 'var(--cr-ink-dim)', lineHeight: 1.6, margin: '10px 0 0', overflow: 'hidden' }}>
                  {b.detail}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
