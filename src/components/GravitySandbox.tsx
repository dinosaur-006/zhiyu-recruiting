import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Monitor, Clock, Users, TrendingUp, Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import type { Job, JobTruthLabel } from '../types';

interface Dimension {
  id: string; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; color: string; description: string;
}

const TECH_DIMS: Dimension[] = [
  { id: '薪资福利', label: '薪资福利', icon: DollarSign, color: '#059669', description: '薪酬水平、股权激励、福利待遇' },
  { id: '技术栈', label: '技术栈', icon: Monitor, color: '#6366F1', description: '技术选型、工具链、代码质量' },
  { id: '工作节奏', label: '工作节奏', icon: Clock, color: '#D97706', description: '加班强度、Sprint节奏、会议密度' },
  { id: '团队氛围', label: '团队氛围', icon: Users, color: '#2563EB', description: '协作文化、Code Review、技术分享' },
  { id: '成长路径', label: '成长路径', icon: TrendingUp, color: '#7C3AED', description: '晋升速度、学习机会、技术深度' },
];

const SALES_DIMS: Dimension[] = [
  { id: '薪资提成', label: '薪资提成', icon: DollarSign, color: '#059669', description: '底薪水平、提成比例、奖金机制' },
  { id: '客户资源', label: '客户资源', icon: Users, color: '#6366F1', description: '现有KA客户、行业覆盖、Pipeline质量' },
  { id: '团队支持', label: '团队支持', icon: TrendingUp, color: '#D97706', description: '售前配合、市场赋能、内部资源' },
  { id: '行业前景', label: '行业前景', icon: Monitor, color: '#2563EB', description: '市场规模、竞争格局、增长空间' },
  { id: '工作自主度', label: '工作自主度', icon: Clock, color: '#7C3AED', description: '决策权限、弹性工作、出差频率' },
];

const DESIGN_DIMS: Dimension[] = [
  { id: '创意自由', label: '创意自由', icon: TrendingUp, color: '#059669', description: '设计自主权、创新空间、设计驱动文化' },
  { id: '设计影响力', label: '设计影响力', icon: Users, color: '#6366F1', description: '对产品的实际影响、设计话语权' },
  { id: '团队协作', label: '团队协作', icon: Clock, color: '#D97706', description: '与PM和工程师的协作方式、设计评审文化' },
  { id: '成长空间', label: '成长空间', icon: Monitor, color: '#2563EB', description: '设计职级体系、学习资源、行业交流' },
  { id: '薪资福利', label: '薪资福利', icon: DollarSign, color: '#7C3AED', description: '薪酬水平、股权激励、设计工具预算' },
];

const FULLSTACK_DIMS: Dimension[] = [
  { id: '技术广度', label: '技术广度', icon: Monitor, color: '#059669', description: '前后端技术栈覆盖、系统设计、架构视野' },
  { id: '薪资福利', label: '薪资福利', icon: DollarSign, color: '#6366F1', description: '薪酬水平、股权激励、福利待遇' },
  { id: '工作节奏', label: '工作节奏', icon: Clock, color: '#D97706', description: 'Sprint节奏、On-Call频率、会议密度' },
  { id: '团队协作', label: '团队协作', icon: Users, color: '#2563EB', description: '跨端协作方式、Code Review文化' },
  { id: '成长路径', label: '成长路径', icon: TrendingUp, color: '#7C3AED', description: '技术深度vs广度发展、架构师通道' },
];

export function GravitySandbox({ job, onStartTrial, onDirectApply }: {
  job: Job; truthLabel?: JobTruthLabel; onStartTrial: () => void; onDirectApply: () => void;
}) {
  const isSales = job.department?.includes('销售') || job.title?.includes('销售');
  const isDesign = job.department?.includes('设计') || job.title?.includes('设计');
  const isFullstack = job.title?.includes('全栈');
  const DIMENSIONS = isSales ? SALES_DIMS : isDesign ? DESIGN_DIMS : isFullstack ? FULLSTACK_DIMS : TECH_DIMS;

  const [picks, setPicks] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const { setPriorityWeight } = useChatStore();

  const togglePick = (id: string) => {
    setPicks((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
    setShowResult(false);
  };

  const handleConfirm = () => {
    if (picks.length === 0) return;
    if (picks[0]) setPriorityWeight(picks[0], 70);
    if (picks[1]) setPriorityWeight(picks[1], 30);
    setShowResult(true);
  };

  const pickedDims = picks.map((id) => DIMENSIONS.find((d) => d.id === id)).filter(Boolean) as Dimension[];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--cr-space-xl) 0' }}>
      {!showResult ? (
        <>
          <div style={{ textAlign: 'center', marginBottom: 'var(--cr-space-xl)' }}>
            <span className="cr-eyebrow" style={{ textAlign: 'center' }}>个性化你的体验</span>
            <h2 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 'var(--cr-text-2xl)', fontWeight: 700, color: 'var(--cr-ink)', margin: '4px 0 8px' }}>
              选择2个你最看重的方面
            </h2>
            <p style={{ fontSize: 'var(--cr-text-sm)', color: 'var(--cr-ink-dim)', maxWidth: 400, margin: '0 auto' }}>
              {picks.length === 0 ? 'AI 会在体验中优先展示你关心的话题' : picks.length === 1 ? '再选一个，帮助 AI 更准确理解你的偏好' : `已选 ${picks.length}/2 · 点击确认查看分析`}
            </p>
          </div>

          {/* Dimension cards in a clean vertical stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'var(--cr-space-xl)' }}>
            {DIMENSIONS.map((dim) => {
              const Icon = dim.icon;
              const isPicked = picks.includes(dim.id);
              const rank = picks.indexOf(dim.id) + 1;
              return (
                <motion.button key={dim.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => togglePick(dim.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: 'var(--cr-space-lg)',
                    borderRadius: 'var(--cr-radius-lg)', border: isPicked ? `2px solid ${dim.color}` : '1px solid var(--cr-border)',
                    background: isPicked ? `${dim.color}08` : 'var(--cr-surface)', cursor: 'pointer',
                    fontFamily: 'var(--cr-font-sans)', textAlign: 'left', width: '100%',
                    transition: 'all 0.2s ease', position: 'relative',
                  }}>
                  {isPicked && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      style={{ position: 'absolute', top: -8, left: -8, width: 24, height: 24, borderRadius: '50%', background: dim.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{rank}</motion.div>
                  )}
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--cr-radius-md)', background: `${dim.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={22} strokeWidth={1.5} style={{ color: isPicked ? dim.color : 'var(--cr-muted)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--cr-text-md)', fontWeight: 600, color: isPicked ? dim.color : 'var(--cr-ink)' }}>{dim.label}</div>
                    <div style={{ fontSize: 'var(--cr-text-xs)', color: 'var(--cr-muted)', marginTop: 2 }}>{dim.description}</div>
                  </div>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${isPicked ? dim.color : 'var(--cr-border)'}`, background: isPicked ? dim.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s ease' }}>
                    {isPicked && <Check size={14} style={{ color: '#fff' }} />}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button className="cr-btn-primary cr-btn-lg" onClick={handleConfirm} disabled={picks.length === 0}>
              <Sparkles size={18} />确认选择
            </button>
          </div>
        </>
      ) : (
        /* Result view */
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--cr-space-xl)' }}>
            <span className="cr-eyebrow" style={{ textAlign: 'center' }}>你的偏好已记录</span>
            <h2 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 'var(--cr-text-2xl)', fontWeight: 700, color: 'var(--cr-ink)', margin: '4px 0 12px' }}>
              体验将重点围绕{pickedDims[0]?.label}{pickedDims[1] ? `和${pickedDims[1]?.label}` : ''}展开
            </h2>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 'var(--cr-space-xl)' }}>
            {pickedDims.map((dim, i) => {
              const Icon = dim.icon;
              return (
                <div key={dim.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 'var(--cr-radius-full)', background: `${dim.color}12`, border: `1px solid ${dim.color}33` }}>
                  <Icon size={18} strokeWidth={1.5} style={{ color: dim.color }} />
                  <span style={{ fontSize: 'var(--cr-text-base)', fontWeight: 600, color: dim.color }}>{i === 0 ? '最看重' : '其次'} · {dim.label}</span>
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: 'var(--cr-text-sm)', color: 'var(--cr-ink-dim)', textAlign: 'center', maxWidth: 440, margin: '0 auto var(--cr-space-xl)', lineHeight: 'var(--cr-leading-normal)' }}>
            在接下来的实境体验中，AI 会基于你的偏好优先展示{pickedDims[0]?.label}和{pickedDims[1]?.label}相关的工作场景和对话内容。你可以在体验中向 AI 提问关于这些方面的任何问题。
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button className="cr-btn-primary cr-btn-lg" onClick={onStartTrial}><ArrowRight size={18} />开始实境体验</button>
            <button className="cr-btn-ghost" onClick={() => setShowResult(false)}><ArrowLeft size={14} />重新选择</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
