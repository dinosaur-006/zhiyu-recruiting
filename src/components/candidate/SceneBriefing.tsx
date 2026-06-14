import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import type { Job } from '../../types';

interface SceneBriefingProps {
  job: Job;
  onComplete: () => void;
}

/**
 * Replaces IntelArchive — presents job information in a clean,
 * scannable format with progressive disclosure sections.
 */
export function SceneBriefing({ job, onComplete }: SceneBriefingProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    responsibilities: true,
    requirements: false,
    teamInfo: false,
    growthPath: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    { key: 'responsibilities', label: '岗位职责', content: job.responsibilities },
    { key: 'requirements', label: '任职要求', content: job.requirements },
    { key: 'teamInfo', label: '团队介绍', content: job.teamInfo },
    { key: 'growthPath', label: '成长路径', content: job.growthPath },
  ].filter((s) => s.content);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <span className="cr-eyebrow">岗位情报</span>
        <p style={{ fontSize: 14, color: 'var(--cr-ink-dim)', lineHeight: 1.6, margin: 0 }}>
          在进入实境体验之前，先了解岗位的基本信息。点击展开你感兴趣的部分。
        </p>
      </div>

      {sections.map((section, i) => (
        <motion.div
          key={section.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          className="cr-card"
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <button
            onClick={() => toggleSection(section.key)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 'var(--cr-space-lg) var(--cr-space-xl)',
              border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: 'var(--cr-font-sans)', fontSize: 15, fontWeight: 600,
              color: expandedSections[section.key] ? 'var(--cr-accent)' : 'var(--cr-ink)',
              transition: 'color 0.2s ease',
            }}
          >
            <span>{section.label}</span>
            {expandedSections[section.key]
              ? <ChevronUp size={18} strokeWidth={1.5} style={{ color: 'var(--cr-muted)' }} />
              : <ChevronDown size={18} strokeWidth={1.5} style={{ color: 'var(--cr-muted)' }} />
            }
          </button>
          <AnimatePresence initial={false}>
            {expandedSections[section.key] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  padding: '0 var(--cr-space-xl) var(--cr-space-lg)',
                  fontSize: 14,
                  color: 'var(--cr-ink-soft)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}>
                  {section.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: sections.length * 0.1 + 0.1, duration: 0.3 }}
        style={{ textAlign: 'center', paddingTop: 8 }}
      >
        <button className="cr-btn-primary" onClick={onComplete}>
          <CheckCircle size={16} />
          我已了解，继续体验
        </button>
      </motion.div>
    </div>
  );
}
