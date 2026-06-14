import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '../store/chatStore';
import type { Job, JobTruthLabel } from '../types';

const MAP_NODES = [
  { id: 'tech', label: '技术栈', icon: '💻' },
  { id: 'team', label: '团队氛围', icon: '👥' },
  { id: 'pace', label: '工作节奏', icon: '⏱️' },
  { id: 'growth', label: '成长路径', icon: '📈' },
  { id: 'interview', label: '面试流程', icon: '📅' },
  { id: 'salary', label: '薪资福利', icon: '💰' },
  { id: 'challenge', label: '岗位挑战', icon: '⚔️' },
];

export function JobExplorationMap({ job, onStartTrial, onDirectApply }: { job: Job; truthLabel?: JobTruthLabel; onStartTrial: () => void; onDirectApply: () => void }) {
  const { exploreNodeId, setExploreNodeId, streamAiResponse, isAiTyping } = useChatStore();

  useEffect(() => { setExploreNodeId(null); }, []);

  const ORBIT_RADIUS = 220;

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: 'var(--color-base)' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(61,79,71,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', zIndex: 30 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>职遇 Reality</span>
        <button onClick={onDirectApply} aria-label={`直接投递${job.title}岗位`} style={{ fontSize: 13, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>直接投递</button>
      </div>

      {/* Map stage */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: -40 }}>
        {/* SVG connection lines */}
        <svg style={{ position: 'absolute', width: ORBIT_RADIUS * 2 + 120, height: ORBIT_RADIUS * 2 + 120, pointerEvents: 'none', zIndex: 1 }}>
          {MAP_NODES.map((_, i) => {
            const angle = (i / MAP_NODES.length) * Math.PI * 2;
            return (
              <line key={i}
                x1="50%" y1="50%"
                x2={`${50 + Math.cos(angle) * 48}%`}
                y2={`${50 + Math.sin(angle) * 48}%`}
                stroke="var(--color-border)"
                strokeWidth={1}
                opacity={0.3}
              />
            );
          })}
        </svg>

        {/* Center node */}
        <motion.div
          tabIndex={0}
          role="button"
          aria-label={`查看${job.title}岗位详情`}
          style={{
            position: 'absolute', zIndex: 20,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            width: 112, height: 112,
            background: 'var(--color-accent)', color: '#fff',
            borderRadius: '50%', cursor: 'pointer',
            boxShadow: '0 0 0 12px rgba(61,79,71,0.06), 0 8px 32px rgba(0,0,0,0.12)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'tween', duration: 0.4, ease: 'easeOut' }}
          whileHover={{ scale: 1.06 }}
          onClick={() => { setExploreNodeId('core'); if (!isAiTyping) streamAiResponse({ role: 'hr', jobTitle: job.title, nodeId: 'core', jobDepartment: job.department, salaryRange: `${job.salaryMin}k-${job.salaryMax}k`, jobResponsibilities: job.responsibilities }); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExploreNodeId('core'); } }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{job.title.slice(0, 8)}</span>
          <span style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{job.salaryMin}k-{job.salaryMax}k</span>
        </motion.div>

        {/* Satellite nodes */}
        {MAP_NODES.map((node, i) => {
          const angle = (i / MAP_NODES.length) * Math.PI * 2;
          const tx = Math.cos(angle) * ORBIT_RADIUS;
          const ty = Math.sin(angle) * ORBIT_RADIUS;
          const isActive = exploreNodeId === node.id;
          const isDimmed = exploreNodeId !== null && !isActive;

          return (
            <motion.div
              key={node.id}
              tabIndex={0}
              role="button"
              aria-label={`探索${node.label}`}
              style={{
                position: 'absolute', zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              animate={{ x: tx, y: ty, scale: 1, opacity: isDimmed ? 0.25 : 1 }}
              transition={{ type: 'tween', duration: 0.35, ease: 'easeOut', delay: 0.1 + i * 0.05 }}
              whileHover={{ scale: 1.12, opacity: 1 }}
              onClick={() => { setExploreNodeId(node.id); if (!isAiTyping) streamAiResponse({ role: 'hr', jobTitle: job.title, nodeId: node.id, nodeLabel: node.label, jobDepartment: job.department, jobResponsibilities: job.responsibilities, jobChallenges: job.challenges, jobTeamInfo: job.teamInfo }); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExploreNodeId(node.id); } }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? 'var(--color-accent)' : 'var(--color-surface)',
                border: isActive ? 'none' : '2px solid var(--color-border)',
                boxShadow: isActive ? '0 4px 20px rgba(61,79,71,0.2)' : '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
              }}>
                <span style={{ fontSize: 24 }} aria-hidden="true">{node.icon}</span>
              </div>
              <span style={{
                marginTop: 8, fontSize: 13, fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--color-accent)' : 'var(--color-ink-soft)',
                transition: 'color 0.2s, font-weight 0.2s',
              }}>
                {node.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Action bar */}
      <div style={{ position: 'absolute', bottom: 32, display: 'flex', gap: 12, zIndex: 30 }}>
        <button onClick={onDirectApply} aria-label={`直接投递${job.title}岗位`} style={{ padding: '10px 24px', borderRadius: 9999, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-ink-soft)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>直接投递</button>
        <button onClick={onStartTrial} aria-label="进入云试岗体验" style={{ padding: '10px 24px', borderRadius: 9999, border: 'none', background: 'var(--color-accent)', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>进入云试岗</button>
      </div>
    </div>
  );
}
