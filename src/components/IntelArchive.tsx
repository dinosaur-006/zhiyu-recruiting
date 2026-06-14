import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Job } from '../types';

interface IntelArchiveProps {
  job: Job;
  onComplete: () => void;
}

/** 从 Job 数据构建标签配置，融入 Job.analysis 的 AI 解析结果 */
function buildTabs(job: Job) {
  const analysis = job.analysis;
  const skillTags = analysis?.hardSkills?.length
    ? `\n\n[核心技能] ${analysis.hardSkills.join('、')}`
    : '';
  const sellPoints = analysis?.sellingPoints?.length
    ? `\n\n[岗位亮点] ${analysis.sellingPoints.slice(0, 3).join('；')}`
    : '';
  const riskNotes = analysis?.riskPoints?.length
    ? `\n\n[风险提示] ${analysis.riskPoints.slice(0, 2).join('；')}`
    : '';
  const faqItems = analysis?.faq?.length
    ? `\n\n[常见问题] ${analysis.faq.slice(0, 3).join(' / ')}`
    : '';

  return [
    {
      id: 'resp',
      label: '岗位职责',
      content: (job.responsibilities || '暂无详细职责描述。') + skillTags,
    },
    {
      id: 'process',
      label: '面试流程',
      content: (job.interviewProcess || 'HR初筛 → 业务面试 → 综合沟通。') + faqItems,
    },
    {
      id: 'salary',
      label: '薪资范围',
      content: `${job.salaryMin}k - ${job.salaryMax}k，具体以HR沟通为准。` + sellPoints,
    },
    {
      id: 'team',
      label: '团队情报',
      content: (job.teamInfo || '暂无详细团队情报。') + riskNotes,
    },
  ];
}

export function IntelArchive({ job, onComplete }: IntelArchiveProps) {
  const tabs = buildTabs(job);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleUnlock = (id: string) => {
    if (!unlockedIds.includes(id)) {
      const next = [...unlockedIds, id];
      setUnlockedIds(next);
      if (next.length === tabs.length) {
        setTimeout(onComplete, 1500);
      }
    }
    setActiveTab(id);
  };

  const allUnlocked = unlockedIds.length === tabs.length;

  return (
    <div style={{ width: '100%', maxWidth: 640, margin: '0 auto', fontFamily: 'inherit', userSelect: 'none' }}>
      {/* 机密档案纸区 */}
      <div style={{
        position: 'relative',
        background: 'var(--color-base)',
        border: '1px solid rgba(201,169,110,0.3)',
        padding: '24px 28px',
        boxShadow: '0 0 30px rgba(201,169,110,0.05)',
        overflow: 'hidden',
      }}>
        {/* 纸张纹理 */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #fff 1px, #fff 2px)',
        }} />

        {/* 档案头 */}
        <div style={{
          borderBottom: '2px solid rgba(201,169,110,0.5)',
          paddingBottom: 8, marginBottom: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <div style={{ color: '#E2E8F0', letterSpacing: '0.06em', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
            <span style={{ color: '#E53E3E', fontWeight: 700, marginRight: 8 }}>[机密]</span>
            阿尔法级权限
          </div>
          <div style={{ color: '#718096', fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }}>
            DOSSIER #{job.id.slice(0, 8).toUpperCase()}
          </div>
        </div>

        {/* 情报内容区 */}
        <div style={{ minHeight: 100 }}>
          <AnimatePresence mode="wait">
            {activeTab ? (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                style={{ color: '#A0AEC0', lineHeight: 1.7, fontSize: 13 }}
              >
                <span style={{ color: 'var(--color-accent)', marginRight: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                  ▸ {tabs.find((t) => t.id === activeTab)?.label}:
                </span>
                <span className="redacted-text">
                  {tabs.find((t) => t.id === activeTab)?.content}
                </span>
              </motion.div>
            ) : (
              <div style={{
                color: '#718096', fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                display: 'flex', height: 100, alignItems: 'center', justifyContent: 'center',
                fontStyle: 'italic', opacity: 0.5,
              }}>
                等待解密指令...
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 解密标签面板 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 14 }}>
        {tabs.map((tab) => {
          const isUnlocked = unlockedIds.includes(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => handleUnlock(tab.id)}
              style={{
                position: 'relative', padding: '10px 6px',
                border: `1px solid ${isUnlocked ? 'rgba(201,169,110,0.5)' : '#2D3748'}`,
                background: isUnlocked ? 'rgba(201,169,110,0.1)' : '#0F1115',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background-color 0.3s, border-color 0.3s, color 0.3s, opacity 0.3s',
              }}
              onMouseEnter={(e) => {
                if (!isUnlocked) e.currentTarget.style.borderColor = '#4A5568';
              }}
              onMouseLeave={(e) => {
                if (!isUnlocked) e.currentTarget.style.borderColor = '#2D3748';
              }}
            >
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                color: isUnlocked ? 'var(--color-accent)' : '#718096',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {tab.label}
              </span>
              <span style={{
                fontSize: 8, fontFamily: "'JetBrains Mono', monospace",
                color: isUnlocked ? 'var(--color-positive)' : '#E53E3E',
              }}>
                {isUnlocked ? '[ 已解密 ]' : '[ 加密 ]'}
              </span>
              {!isUnlocked && (
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 5, height: 5, borderRadius: '50%',
                  background: '#E53E3E', animation: 'pulseGlow 1.5s ease infinite',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onComplete}
          disabled={!allUnlocked}
          style={{
            padding: '10px 28px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            background: 'transparent',
            border: allUnlocked ? '1px solid var(--color-accent)' : '1px solid transparent',
            color: allUnlocked ? 'var(--color-accent)' : 'transparent',
            boxShadow: allUnlocked ? '0 0 15px rgba(201,169,110,0.3)' : 'none',
            cursor: allUnlocked ? 'pointer' : 'default',
            opacity: allUnlocked ? 1 : 0,
            transition: 'opacity 0.5s, background-color 0.5s, border-color 0.5s, color 0.5s',
          }}
          onMouseEnter={(e) => {
            if (allUnlocked) { e.currentTarget.style.background = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-base)'; }
          }}
          onMouseLeave={(e) => {
            if (allUnlocked) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-accent)'; }
          }}
        >
          [ 确认档案，切入现场蓝图 ]
        </button>
      </div>
    </div>
  );
}
