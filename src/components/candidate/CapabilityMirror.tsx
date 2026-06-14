import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Edit3, Info } from 'lucide-react';

interface SkillDimension {
  key: string;
  label: string;
  selfScore: number;  // 0-100
  aiScore: number;     // 0-100
  description: string;
}

const DEFAULT_DIMENSIONS: SkillDimension[] = [
  { key: 'frontend', label: '前端开发', selfScore: 70, aiScore: 75, description: 'React、TypeScript、组件架构能力' },
  { key: 'architecture', label: '系统设计', selfScore: 50, aiScore: 55, description: '架构思维、技术选型、可扩展性设计' },
  { key: 'collaboration', label: '协作沟通', selfScore: 80, aiScore: 72, description: '跨部门沟通、文档表达、技术方案阐述' },
  { key: 'problemSolving', label: '问题解决', selfScore: 75, aiScore: 82, description: '复杂问题拆解、边界情况处理、调试能力' },
  { key: 'leadership', label: '技术领导力', selfScore: 40, aiScore: 45, description: 'Code Review、技术分享、团队影响力' },
  { key: 'learning', label: '学习成长', selfScore: 85, aiScore: 80, description: '新技术学习速度、知识迁移、自我驱动' },
];

const ANGLE_STEP = (2 * Math.PI) / DEFAULT_DIMENSIONS.length;
const RADIUS = 130;
const CX = 170;
const CY = 170;

function getPoint(angle: number, value: number, maxRadius: number = RADIUS): { x: number; y: number } {
  const r = (value / 100) * maxRadius;
  return {
    x: CX + r * Math.cos(angle - Math.PI / 2),
    y: CY + r * Math.sin(angle - Math.PI / 2),
  };
}

function generatePath(dimensions: SkillDimension[], scoreKey: 'selfScore' | 'aiScore'): string {
  if (dimensions.length === 0) return '';
  const points = dimensions.map((d, i) => {
    const angle = i * ANGLE_STEP;
    const pt = getPoint(angle, d[scoreKey]);
    return `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
  });
  return points.join(' ') + ' Z';
}

export function CapabilityMirror() {
  const [dimensions, setDimensions] = useState<SkillDimension[]>(DEFAULT_DIMENSIONS);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [activeDimension, setActiveDimension] = useState<string | null>(null);

  const handleSelfScoreChange = (key: string, delta: number) => {
    setDimensions((prev) =>
      prev.map((d) =>
        d.key === key
          ? { ...d, selfScore: Math.max(0, Math.min(100, d.selfScore + delta)) }
          : d,
      ),
    );
  };

  const selfPath = generatePath(dimensions, 'selfScore');
  const aiPath = generatePath(dimensions, 'aiScore');

  // Grid rings
  const gridRings = [0.25, 0.5, 0.75, 1.0];

  return (
    <section style={{ padding: 'var(--cr-space-4xl) 0', maxWidth: 'var(--cr-content-xl)', margin: '0 auto', width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: 'var(--cr-space-2xl)' }}
      >
        <span className="cr-eyebrow" style={{ textAlign: 'center' }}>能力镜像</span>
        <h2 style={{
          fontFamily: 'var(--cr-font-display)',
          fontSize: 'clamp(22px, 3.5vw, 28px)',
          fontWeight: 700, color: 'var(--cr-ink)',
          letterSpacing: '-0.02em', margin: '8px 0 12px',
        }}>
          你的能力画像
        </h2>
        <p style={{ fontSize: 14, color: 'var(--cr-ink-dim)', maxWidth: 440, margin: '0 auto', lineHeight: 1.7 }}>
          对比自我评估与AI从实境体验中提取的能力维度。
          拖动滑块调整自我认知，AI会自动更新匹配分析。
        </p>
      </motion.div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 'var(--cr-space-2xl)', alignItems: 'center',
      }}>
        {/* Radar chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="cr-card"
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <svg viewBox="0 0 340 340" style={{ width: '100%', maxWidth: 400 }}>
            {/* Grid rings */}
            {gridRings.map((ring, ri) => (
              <polygon
                key={`ring-${ri}`}
                points={DEFAULT_DIMENSIONS.map((_, i) => {
                  const pt = getPoint(i * ANGLE_STEP, ring * 100);
                  return `${pt.x},${pt.y}`;
                }).join(' ')}
                fill="none"
                stroke="var(--cr-border)"
                strokeWidth={ri === 3 ? 1.5 : 0.5}
                opacity={0.5}
              />
            ))}

            {/* Axis lines */}
            {DEFAULT_DIMENSIONS.map((_, i) => {
              const pt = getPoint(i * ANGLE_STEP, 100);
              return (
                <line
                  key={`axis-${i}`}
                  x1={CX} y1={CY} x2={pt.x} y2={pt.y}
                  stroke="var(--cr-border)"
                  strokeWidth={0.5}
                  opacity={0.4}
                />
              );
            })}

            {/* AI Score area */}
            <motion.path
              d={aiPath}
              fill="var(--cr-accent-subtle)"
              stroke="var(--cr-accent)"
              strokeWidth={2}
              strokeLinejoin="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />

            {/* Self Score area */}
            <motion.path
              d={selfPath}
              fill="rgba(99, 102, 241, 0.15)"
              stroke="#6366F1"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeDasharray="6 3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />

            {/* Data points + labels */}
            {dimensions.map((d, i) => {
              const angle = i * ANGLE_STEP;
              const aiPt = getPoint(angle, d.aiScore);
              const selfPt = getPoint(angle, d.selfScore);
              const labelPt = getPoint(angle, 115, RADIUS);

              return (
                <g key={d.key}>
                  {/* AI point */}
                  <motion.circle
                    cx={aiPt.x} cy={aiPt.y} r={4}
                    fill="var(--cr-accent)"
                    stroke="#fff"
                    strokeWidth={2}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  />
                  {/* Self point */}
                  <motion.circle
                    cx={selfPt.x} cy={selfPt.y} r={4}
                    fill="#6366F1"
                    stroke="#fff"
                    strokeWidth={2}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 + i * 0.1 }}
                  />
                  {/* Label */}
                  <text
                    x={labelPt.x} y={labelPt.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: 11, fontWeight: 600,
                      fill: 'var(--cr-ink-soft)',
                      fontFamily: 'var(--cr-font-sans)',
                    }}
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div style={{
            position: 'absolute', bottom: 20, right: 24,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <div style={{ width: 20, height: 2, background: 'var(--cr-accent)' }} />
              <span style={{ color: 'var(--cr-ink-soft)' }}>AI 评估</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <div style={{ width: 20, height: 2, background: '#6366F1', borderStyle: 'dashed' }} />
              <span style={{ color: 'var(--cr-ink-soft)' }}>自我评估</span>
            </div>
          </div>
        </motion.div>

        {/* Dimension detail list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="cr-eyebrow">维度详情 · 点击调整</span>
          {dimensions.map((d, i) => {
            const gap = d.aiScore - d.selfScore;
            const isEditing = editingKey === d.key;

            return (
              <motion.div
                key={d.key}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="cr-card"
                style={{
                  padding: 'var(--cr-space-lg)',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${activeDimension === d.key ? 'var(--cr-accent)' : 'transparent'}`,
                }}
                onClick={() => setActiveDimension(activeDimension === d.key ? null : d.key)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--cr-ink)' }}>
                    {d.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Self score control */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelfScoreChange(d.key, -5); }}
                        style={{
                          width: 22, height: 22, borderRadius: 'var(--cr-radius-sm)',
                          border: '1px solid var(--cr-border)', background: 'var(--cr-surface)',
                          cursor: 'pointer', fontSize: 12, color: 'var(--cr-muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        −
                      </button>
                      <span style={{
                        fontFamily: 'var(--cr-font-mono)', fontSize: 13, fontWeight: 700,
                        color: '#6366F1', minWidth: 28, textAlign: 'center',
                      }}>
                        {d.selfScore}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelfScoreChange(d.key, 5); }}
                        style={{
                          width: 22, height: 22, borderRadius: 'var(--cr-radius-sm)',
                          border: '1px solid var(--cr-border)', background: 'var(--cr-surface)',
                          cursor: 'pointer', fontSize: 12, color: 'var(--cr-muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* AI score */}
                    <span style={{
                      fontFamily: 'var(--cr-font-mono)', fontSize: 13, fontWeight: 700,
                      color: 'var(--cr-accent)', minWidth: 28, textAlign: 'center',
                    }}>
                      {d.aiScore}
                    </span>

                    {/* Gap indicator */}
                    {Math.abs(gap) >= 5 && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 6px',
                        borderRadius: 'var(--cr-radius-full)',
                        background: gap > 0 ? 'var(--cr-accent-subtle)' : '#EEF2FF',
                        color: gap > 0 ? 'var(--cr-accent)' : '#6366F1',
                      }}>
                        {gap > 0 ? `AI +${gap}` : `你 +${Math.abs(gap)}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#6366F1', width: 32, fontWeight: 500 }}>自评</span>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--cr-border)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${d.selfScore}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        style={{ height: '100%', borderRadius: 2, background: '#6366F1' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: 'var(--cr-accent)', width: 32, fontWeight: 500 }}>AI</span>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--cr-border)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${d.aiScore}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
                        style={{ height: '100%', borderRadius: 2, background: 'var(--cr-accent)' }}
                      />
                    </div>
                  </div>
                </div>

                {activeDimension === d.key && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    style={{
                      fontSize: 12, color: 'var(--cr-ink-dim)',
                      lineHeight: 1.5, margin: '8px 0 0',
                      overflow: 'hidden',
                    }}
                  >
                    {d.description}
                  </motion.p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
