import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Target, Play } from 'lucide-react';
import type { SimulationScenario } from '../../types';

interface SimulationBriefingProps {
  scenario: SimulationScenario;
  jobTitle: string;
  onStart: () => void;
}

export function SimulationBriefing({ scenario, jobTitle, onStart }: SimulationBriefingProps) {
  const handleStart = () => onStart();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="cr-card-elevated"
      style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center' }}
    >
      <span className="cr-eyebrow" style={{ textAlign: 'center' }}>工作日模拟</span>
      <h2 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 'var(--cr-text-2xl)', fontWeight: 700, color: 'var(--cr-ink)', margin: '4px 0 8px' }}>
        {scenario.title}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--cr-ink-dim)', lineHeight: 1.7, marginBottom: 24 }}>
        {scenario.description}
      </p>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: 'var(--cr-space-md)', background: 'var(--cr-subtle-warm)', borderRadius: 'var(--cr-radius-md)' }}>
          <Clock size={20} style={{ color: 'var(--cr-accent)', marginBottom: 6 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cr-ink)' }}>约 {scenario.estimatedDurationMinutes} 分钟</div>
        </div>
        <div style={{ padding: 'var(--cr-space-md)', background: 'var(--cr-subtle-warm)', borderRadius: 'var(--cr-radius-md)' }}>
          <Users size={20} style={{ color: '#6366F1', marginBottom: 6 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cr-ink)' }}>{scenario.messageScript.length} 条消息</div>
        </div>
        <div style={{ padding: 'var(--cr-space-md)', background: 'var(--cr-subtle-warm)', borderRadius: 'var(--cr-radius-md)' }}>
          <Target size={20} style={{ color: '#D97706', marginBottom: 6 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cr-ink)' }}>{jobTitle}</div>
        </div>
      </div>

      {/* Manager persona */}
      <div style={{ padding: 'var(--cr-space-lg)', background: 'var(--cr-accent-subtle)', borderRadius: 'var(--cr-radius-md)', marginBottom: 20, textAlign: 'left' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cr-accent)', marginBottom: 4 }}>你的上级</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--cr-ink)' }}>{scenario.managerPersona.name} · {scenario.managerPersona.title}</div>
        <p style={{ fontSize: 13, color: 'var(--cr-ink-dim)', lineHeight: 1.6, margin: '4px 0 0' }}>{scenario.managerPersona.description}</p>
      </div>

      {/* Team context */}
      <p style={{ fontSize: 13, color: 'var(--cr-muted)', lineHeight: 1.6, marginBottom: 24 }}>{scenario.teamContext}</p>

      {/* Start button */}
      <button className="cr-btn-primary cr-btn-lg" onClick={handleStart}><Play size={18} />开始工作日</button>
    </motion.div>
  );
}
