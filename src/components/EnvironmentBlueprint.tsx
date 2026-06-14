import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';
import type { Job } from '../types';

interface BlueprintProps {
  job: Job;
  onComplete: () => void;
}

interface Hotspot {
  id: string;
  label: string;
  title: string;
  content: string;
  x: number; y: number; w: number; h: number;
}

function buildHotspots(job: Job): Hotspot[] {
  const analysis = job.analysis;
  const softSkillTags = analysis?.softSkills?.length
    ? `\n\n软技能要求：${analysis.softSkills.join('、')}`
    : '';
  const sellTag = analysis?.sellingPoints?.slice(0, 2).join('；') || '';
  const riskTag = analysis?.riskPoints?.slice(0, 2).join('；') || '';

  return [
    {
      id: 'desk',
      label: 'DESK',
      title: '日常工作',
      content: job.responsibilities
        ? `工作内容：${job.responsibilities}。${job.workload ? `工作节奏：${job.workload}` : ''}${softSkillTags}`
        : '暂无详细日常描述。',
      x: 60, y: 90, w: 130, h: 90,
    },
    {
      id: 'meeting',
      label: 'MEETING ROOM',
      title: '团队协作',
      content: [
        job.teamInfo ? `协作方式：${job.teamInfo}` : '',
        job.challenges ? `主要挑战：${job.challenges}` : '',
        riskTag ? `风险提示：${riskTag}` : '',
      ].filter(Boolean).join('。'),
      x: 260, y: 40, w: 150, h: 100,
    },
    {
      id: 'whiteboard',
      label: 'WHITEBOARD',
      title: '成长路径',
      content: [
        job.growthPath ? `成长机制：${job.growthPath}` : '',
        sellTag ? `亮点：${sellTag}` : '',
        '建议面试中进一步确认培养机制和晋升节奏。',
      ].filter(Boolean).join('。'),
      x: 460, y: 50, w: 120, h: 90,
    },
    {
      id: 'coffee',
      label: 'COFFEE CORNER',
      title: '团队文化',
      content: [
        job.teamInfo ? `文化线索：${job.teamInfo.slice(0, 80)}` : '',
        job.interviewProcess ? `面试流程：${job.interviewProcess}` : '',
        analysis?.faq?.length ? `常见疑问：${analysis.faq.slice(0, 2).join(' / ')}` : '',
        '茶水间往往藏着最真实的团队氛围。',
      ].filter(Boolean).join('。'),
      x: 370, y: 180, w: 130, h: 80,
    },
  ];
}

export function EnvironmentBlueprint({ job, onComplete }: BlueprintProps) {
  const hotspots = buildHotspots(job);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const handleScan = (id: string) => {
    if (!unlockedIds.includes(id)) {
      const next = [...unlockedIds, id];
      setUnlockedIds(next);
      setScanProgress(Math.round((next.length / hotspots.length) * 100));
      if (next.length === hotspots.length) {
        setTimeout(onComplete, 1200);
      }
    }
    setActiveHotspot(id);
  };

  const allScanned = unlockedIds.length === hotspots.length;
  const activeInfo = hotspots.find((h) => h.id === activeHotspot);

  return (
    <div style={{ width: '100%', maxWidth: 680, margin: '0 auto', fontFamily: 'inherit', userSelect: 'none' }}>
      {/* 扫描头部 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12, padding: '8px 0',
        borderBottom: '1px solid rgba(201,169,110,0.2)',
      }}>
        <div style={{
          fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.08em', color: 'var(--color-accent)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--color-accent)',
            animation: 'pulseGlow 1.5s ease infinite',
            display: 'inline-block',
          }} />
          [ 远程扫描 // FLOOR_3_R&amp;D ]
        </div>
        <div style={{
          fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#718096',
        }}>
          SCAN: {scanProgress}%
        </div>
      </div>

      {/* SVG 蓝图 */}
      <div style={{
        position: 'relative',
        width: '100%', aspectRatio: '2/1',
        background: '#0B0D11',
        border: '1px solid #1E222A',
        overflow: 'hidden',
      }}>
        <svg
          viewBox="0 0 640 300"
          style={{ width: '100%', height: '100%' }}
        >
          {/* 蓝图底色 */}
          <rect x="0" y="0" width="640" height="300" fill="#0B0D11" />

          {/* 走廊 */}
          <line x1="200" y1="0" x2="200" y2="300" stroke="#1E222A" strokeWidth="3" strokeDasharray="8 4" />
          <line x1="440" y1="0" x2="440" y2="300" stroke="#1E222A" strokeWidth="3" strokeDasharray="8 4" />

          {/* 热点房间 */}
          {hotspots.map((hs) => {
            const isUnlocked = unlockedIds.includes(hs.id);
            const isActive = activeHotspot === hs.id;
            const strokeColor = isActive ? 'var(--color-accent)' : isUnlocked ? '#27C93F' : '#2D3748';

            return (
              <g key={hs.id} onClick={() => handleScan(hs.id)} style={{ cursor: 'pointer' }}>
                {/* 房间框 */}
                <rect
                  x={hs.x} y={hs.y} width={hs.w} height={hs.h}
                  fill={isUnlocked ? 'rgba(39,201,63,0.03)' : 'transparent'}
                  stroke={strokeColor}
                  strokeWidth={isActive ? 2 : 1}
                  strokeDasharray={isUnlocked ? 'none' : '4 4'}
                  className={!isUnlocked ? 'blueprint-scanline' : ''}
                  style={{ transition: 'stroke 0.4s, stroke-dasharray 0.4s' }}
                />
                {/* 标签 */}
                <text
                  x={hs.x + hs.w / 2}
                  y={hs.y + hs.h / 2 + 4}
                  textAnchor="middle"
                  fill={isActive ? 'var(--color-accent)' : isUnlocked ? '#5BAA80' : '#4A5568'}
                  fontSize="9"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="700"
                  letterSpacing="0.06em"
                >
                  {isUnlocked ? `[已解锁] ${hs.label}` : `[未解锁] ${hs.label}`}
                </text>
              </g>
            );
          })}

          {/* 十字准星扫描标记 */}
          {activeHotspot && (() => {
            const hs = hotspots.find((h) => h.id === activeHotspot)!;
            return (
              <g>
                <line x1={hs.x - 10} y1={hs.y + hs.h / 2} x2={hs.x} y2={hs.y + hs.h / 2}
                  stroke="var(--color-accent)" strokeWidth="1" opacity="0.6" />
                <line x1={hs.x + hs.w} y1={hs.y + hs.h / 2} x2={hs.x + hs.w + 10} y2={hs.y + hs.h / 2}
                  stroke="var(--color-accent)" strokeWidth="1" opacity="0.6" />
                <circle cx={hs.x} cy={hs.y} r="12" fill="none" stroke="var(--color-accent)" strokeWidth="1" opacity="0.4" />
              </g>
            );
          })()}
        </svg>
      </div>

      {/* 信息面板 */}
      <AnimatePresence mode="wait">
        {activeInfo && (
          <motion.div
            key={activeInfo.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: 12, padding: '14px 18px',
              background: '#16181D',
              border: '1px solid rgba(201,169,110,0.3)',
              borderLeft: '3px solid var(--color-accent)',
              overflow: 'hidden',
            }}
          >
            <div style={{
              fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--color-accent)', letterSpacing: '0.06em', marginBottom: 6,
            }}>
              ▸ INTEL_RETRIEVED // {activeInfo.label}
            </div>
            <div style={{
              fontSize: 12, color: '#8899AA', lineHeight: 1.7,
            }}>
              <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{activeInfo.title}：</span>
              {activeInfo.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onComplete}
          disabled={!allScanned}
          style={{
            padding: '10px 28px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            background: 'transparent',
            border: allScanned ? '1px solid var(--color-accent)' : '1px solid transparent',
            color: allScanned ? 'var(--color-accent)' : 'transparent',
            boxShadow: allScanned ? '0 0 15px rgba(201,169,110,0.3)' : 'none',
            cursor: allScanned ? 'pointer' : 'default',
            opacity: allScanned ? 1 : 0,
            transition: 'opacity 0.5s, background-color 0.5s, border-color 0.5s, color 0.5s',
          }}
          onMouseEnter={(e) => {
            if (allScanned) { e.currentTarget.style.background = 'var(--color-accent)'; e.currentTarget.style.color = '#16181D'; }
          }}
          onMouseLeave={(e) => {
            if (allScanned) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-accent)'; }
          }}
        >
          [ 确认扫描，进入战术指挥台 ]
        </button>
      </div>
    </div>
  );
}
