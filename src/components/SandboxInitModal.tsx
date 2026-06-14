import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SandboxInitModalProps {
  isOpen: boolean;
  jobTitle: string;
  onStart: () => void;
}

export function SandboxInitModal({ isOpen, jobTitle, onStart }: SandboxInitModalProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isOpen) { setVisibleLines(0); setIsReady(false); return; }
    [500, 1200, 2000, 2800].forEach((delay, i) => {
      setTimeout(() => { setVisibleLines((p) => Math.max(p, i + 1)); if (i === 3) setIsReady(true); }, delay);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const logs = [
    `> System: 正在为您生成 [${jobTitle}] 专属沙盘环境...`,
    '> System: 正在注入岗位真实背景数据 (Job Truth Labels)...',
    '> System: 正在同步团队协作关系网...',
    '> System: 沙盘环境就绪。',
  ];

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}>
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ width: '100%', maxWidth: 640, background: '#0D1117', border: '1px solid #30363D', borderRadius: 14, overflow: 'hidden', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: '#161B22', borderBottom: '1px solid #30363D' }}>
            <div style={{ display: 'flex', gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }} /><div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} /><div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }} /></div>
            <div style={{ marginLeft: 16, color: '#8B949E', fontSize: 11, fontFamily: 'var(--font-sans)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>sandbox_init.sh</div>
          </div>
          <div style={{ padding: 24, minHeight: 180 }}>
            {logs.map((log, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: i < visibleLines ? 1 : 0 }} style={{ color: '#00FF41', fontSize: 13, marginBottom: 8, lineHeight: 1.7, letterSpacing: '0.02em' }}>{log}</motion.div>
            ))}
            {visibleLines > 0 && !isReady && <span style={{ display: 'inline-block', width: 8, height: 16, background: '#00FF41', animation: 'pulse 1s infinite' }} />}
          </div>
          {isReady && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 24, background: '#161B22', borderTop: '1px solid #30363D' }}>
              <p style={{ color: '#8B949E', fontSize: 12, lineHeight: 1.7, fontFamily: 'var(--font-sans)', marginBottom: 20 }}>提示：这不是一场考试。你可以随时表达质疑、中断推演或提出异见。你的每一次操作都会影响沙盘的最终走向。</p>
              <button onClick={onStart} style={{ width: '100%', padding: '12px 24px', background: '#238636', color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, borderRadius: 10, border: '1px solid #3fb950', cursor: 'pointer', boxShadow: '0 0 15px rgba(35,134,54,0.4)' }}>[ 启动推演 ]</button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
