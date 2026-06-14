import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Video, Volume2, Wifi } from 'lucide-react';
import type { RealityRole } from '../types';

interface DigitalHumanAvatarProps {
  role: RealityRole;
  /** 当前场景类型，用于切换过渡动画 */
  sceneType: 'intro' | 'dayInLife' | 'taskChallenge';
  /** 是否正在播放场景开场视频 */
  isSceneIntro?: boolean;
  /** AI 是否正在输出文本（说话态） */
  isSpeaking?: boolean;
  /** Phase 4: 时间压力 — 驱动光环动画速度 */
  timePressure?: 'none' | 'moderate' | 'urgent';
  /** 场景切换完成回调 */
  onSceneReady?: () => void;
}

const ROLE_GRADIENTS: Record<string, [string, string]> = {
  hr: ['#1E3F66', '#3B6FB6'],
  teammate: ['#5C48A5', '#8B7AC8'],
  manager: ['#3D7A62', '#5BAA80'],
};

const ROLE_GLOW: Record<string, string> = {
  hr: 'rgba(59,111,182,0.4)',
  teammate: 'rgba(139,122,200,0.4)',
  manager: 'rgba(91,170,128,0.4)',
};

export function DigitalHumanAvatar({
  role,
  sceneType,
  isSceneIntro = false,
  isSpeaking = false,
  timePressure = 'none',
  onSceneReady,
}: DigitalHumanAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStatus, setVideoStatus] = useState<'loading' | 'playing' | 'error' | 'idle'>('idle');
  const [showVideo, setShowVideo] = useState(false);
  const [avatarKey, setAvatarKey] = useState(sceneType);

  const [gradStart, gradEnd] = ROLE_GRADIENTS[role.type] ?? ROLE_GRADIENTS.hr;
  const glowColor = ROLE_GLOW[role.type] ?? ROLE_GLOW.hr;

  // 场景切换时触发过渡
  useEffect(() => {
    if (sceneType !== avatarKey) {
      setAvatarKey(sceneType);
      setShowVideo(false);
      setVideoStatus('idle');
    }
  }, [sceneType, avatarKey]);

  // 有视频 URL 时尝试加载
  const hasVideoUrl = Boolean(role.videoUrl);

  const tryPlayVideo = useCallback(() => {
    if (!hasVideoUrl || !videoRef.current) return;
    setVideoStatus('loading');
    setShowVideo(true);
    videoRef.current.load();
  }, [hasVideoUrl]);

  const handleVideoReady = () => {
    setVideoStatus('playing');
    videoRef.current?.play().catch(() => setVideoStatus('error'));
  };

  const handleVideoError = () => {
    setVideoStatus('error');
    setShowVideo(false);
    onSceneReady?.();
  };

  const handleVideoEnded = () => {
    setShowVideo(false);
    setVideoStatus('idle');
    onSceneReady?.();
  };

  // 场景入场时尝试播视频
  useEffect(() => {
    if (isSceneIntro && hasVideoUrl) {
      const timer = setTimeout(tryPlayVideo, 300);
      return () => clearTimeout(timer);
    }
  }, [isSceneIntro, hasVideoUrl, tryPlayVideo]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* ═══ 视频层 ═══ */}
      <AnimatePresence>
        {showVideo && videoStatus !== 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            style={{
              width: '100%',
              aspectRatio: '16/10',
              maxHeight: 360,
              borderRadius: 16,
              overflow: 'hidden',
              background: '#000',
              border: '1px solid var(--color-accent)',
              boxShadow: `0 4px 32px ${glowColor}`,
              position: 'relative',
            }}
          >
            {/* 加载态 */}
            {videoStatus === 'loading' && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 12, background: 'rgba(0,0,0,0.8)',
              }}>
                <div className="digital-pulse-ring" style={{ width: 48, height: 48 }} />
                <span style={{ fontSize: 12, color: '#718096', fontFamily: "'JetBrains Mono', monospace" }}>
                  数字人连接中...
                </span>
              </div>
            )}

            <video
              ref={videoRef}
              src={role.videoUrl}
              onCanPlay={handleVideoReady}
              onError={handleVideoError}
              onEnded={handleVideoEnded}
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* 播放中指示器 */}
            {videoStatus === 'playing' && (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 9999,
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                fontSize: 10, color: 'var(--color-positive)', fontFamily: "'JetBrains Mono', monospace",
              }}>
                <Wifi size={10} />
                LIVE
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CSS 数字人降级层 ═══ */}
      <AnimatePresence mode="wait">
        {!showVideo && (
          <motion.div
            key={avatarKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '20px 24px',
              background: 'radial-gradient(ellipse at 20% 50%, var(--color-accent-subtle) 0%, transparent 70%)',
              borderRadius: 16,
            }}
          >
            {/* 数字人像 */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {/* 光晕环 */}
              <div
                className={
                  timePressure === 'urgent' ? 'avatar-halo-urgent' :
                  isSpeaking ? 'avatar-halo-speaking' : 'avatar-halo-idle'
                }
                style={{
                  position: 'absolute',
                  inset: -8,
                  borderRadius: '50%',
                  border: `2px solid ${gradEnd}`,
                  opacity: 0.3,
                }}
              />
              {/* 主体 */}
              <div
                className={
                  timePressure === 'urgent' ? 'avatar-body-urgent' :
                  isSpeaking ? 'avatar-body-speaking' : 'avatar-body-idle'
                }
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${gradStart}, ${gradEnd})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 28px ${glowColor}, 0 4px 12px rgba(0,0,0,0.3)`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* 全息扫描线 */}
                <div
                  className="avatar-scanline"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: `linear-gradient(180deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)`,
                  }}
                />
                {/* 面部占位 — 在实际项目中替换为头像图 */}
                <User size={36} strokeWidth={1.2} style={{ color: '#fff', opacity: 0.85 }} />
              </div>
            </div>

            {/* 文本信息 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* 角色标签 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                  padding: '3px 10px', borderRadius: 9999,
                  background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
                  letterSpacing: '0.06em',
                }}>
                  {role.type === 'hr' ? 'HR 引导节点' : role.type === 'teammate' ? '协作节点' : '决策节点'}
                </span>
                {isSpeaking && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 10, color: 'var(--color-positive)', fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    <span className="speaking-dot" style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: 'var(--color-positive)', display: 'inline-block',
                    }} />
                    实时对话中
                  </span>
                )}
              </div>

              <h3 style={{
                fontSize: 20, fontWeight: 700, color: 'var(--color-ink)',
                fontFamily: 'var(--font-display)', margin: '0 0 2px',
              }}>
                {role.name}
              </h3>
              <p style={{
                fontSize: 13, color: 'var(--color-muted)', margin: 0,
                lineHeight: 1.5,
              }}>
                {role.responsibility}
              </p>

              {/* 视频入口（如果有视频 URL） */}
              {hasVideoUrl && (
                <button
                  onClick={tryPlayVideo}
                  style={{
                    marginTop: 10,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 9999,
                    border: '1px solid var(--color-accent)',
                    background: 'var(--color-accent-subtle)',
                    color: 'var(--color-accent)',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'color 0.2s, background-color 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-accent-subtle)';
                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                  }}
                >
                  <Video size={13} />
                  观看数字人介绍
                </button>
              )}
            </div>

            {/* 右侧状态指示 */}
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'var(--color-accent-subtle)',
                border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Volume2 size={16} style={{ color: 'var(--color-accent)', opacity: isSpeaking ? 1 : 0.4 }} />
              </div>
              <span style={{ fontSize: 9, color: '#4A5568', fontFamily: "'JetBrains Mono', monospace" }}>
                AI
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
