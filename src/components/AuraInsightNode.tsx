import { motion, AnimatePresence } from 'framer-motion';

export interface InsightData {
  matchScore: number;
  tags: string[];
  insight: string;
}

interface AuraTheme {
  gradient: [string, string];
  name: string;
  label: string;
}

const AURA_THEMES: Record<string, AuraTheme> = {
  hr: {
    gradient: ['#059669', '#D1FAE5'],
    name: '小遇',
    label: '引导官',
  },
  teammate: {
    gradient: ['#6366F1', '#E0E7FF'],
    name: '林同学',
    label: '未来同事',
  },
  manager: {
    gradient: ['#D97706', '#FEF3C7'],
    name: '周主管',
    label: '架构师',
  },
};

interface AuraInsightNodeProps {
  role: 'hr' | 'teammate' | 'manager';
  message: string;
  isStreaming?: boolean;
  isUrgent?: boolean;
  insight?: InsightData | null;
  children?: React.ReactNode;
}

export function AuraInsightNode({
  role,
  message,
  isStreaming = false,
  isUrgent = false,
  insight,
  children,
}: AuraInsightNodeProps) {
  const theme = AURA_THEMES[role] ?? AURA_THEMES.hr;
  const [g1, g2] = theme.gradient;

  return (
    <div style={{
      display: 'flex', gap: 14, width: '100%',
      maxWidth: 680, fontFamily: 'inherit',
    }}>
      {/* ═══ 流体光核 ═══ */}
      <div style={{
        flexShrink: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', marginTop: 2,
      }}>
        <div style={{
          position: 'relative',
          width: 44, height: 44,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 18px ${g1}40`,
        }}>
          {/* 外层模糊光晕 */}
          <div style={{
            position: 'absolute', inset: -6, borderRadius: '50%',
            background: `conic-gradient(from 0deg, ${g1}, ${g2}, ${g1})`,
            filter: 'blur(8px)',
            opacity: isStreaming ? 0.8 : 0.4,
            animation: isUrgent ? 'spin 1.5s linear infinite' : isStreaming ? 'spin 3s linear infinite' : 'pulseGlow 3s ease infinite',
          }} />
          {/* 中层流体渐变 */}
          <div className="aura-fluid" style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: `conic-gradient(from 90deg, ${g1}, ${g2}, ${g1})`,
            animation: isUrgent ? 'spin 0.8s linear infinite' : isStreaming ? 'spin 2s linear infinite' : 'pulseGlow 4s ease infinite',
          }} />
          {/* 内核遮罩 */}
          <div style={{
            position: 'absolute', inset: 3, borderRadius: '50%',
            background: 'var(--color-base)',
            zIndex: 10,
          }} />
          {/* 内发光 */}
          <div style={{
            position: 'absolute', inset: 5, borderRadius: '50%',
            background: `conic-gradient(from 180deg, ${g2}60, ${g1}60, ${g2}60)`,
            zIndex: 20,
            animation: isUrgent ? 'spin 1.2s linear infinite reverse' : isStreaming ? 'spin 3s linear infinite reverse' : 'none',
          }} />
        </div>
      </div>

      {/* ═══ 消息 + 分析面板 ═══ */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* 发送者信息 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>
            {theme.name}
          </span>
          <span style={{ fontSize: 10, color: '#718096', fontFamily: "'JetBrains Mono', monospace" }}>
            {theme.label}
          </span>
          {isStreaming && (
            <span style={{
              fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--color-accent)', background: 'rgba(201,169,110,0.1)',
              padding: '2px 8px', borderRadius: 2,
            }}>
              AI 分析中...
            </span>
          )}
        </div>

        {/* 消息气泡 */}
        <div style={{
          background: 'rgba(28,31,38,0.8)',
          border: '1px solid var(--color-border)',
          borderRadius: '2px 12px 12px 12px',
          padding: '14px 18px',
          color: '#F8FAFC',
          fontSize: 14,
          lineHeight: 1.75,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}>
          {message}
          {children}
        </div>

        {/* ═══ 全息智算面板 ═══ */}
        <AnimatePresence>
          {insight && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                background: 'linear-gradient(135deg, rgba(45,55,72,0.3) 0%, transparent 100%)',
                border: '1px solid rgba(201,169,110,0.15)',
                borderRadius: 10,
                padding: '16px 18px',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}>
                {/* 标题 */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: 14,
                }}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="var(--color-accent)">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: 'var(--color-accent)',
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    系统潜能观测
                  </span>
                </div>

                {/* 匹配度 + 标签 */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
                }}>
                  <div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: 10, color: '#94A3B8', marginBottom: 4,
                    }}>
                      <span>战略意图匹配</span>
                      <span style={{ color: '#E2E8F0', fontFamily: "'JetBrains Mono', monospace" }}>
                        {insight.matchScore}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%', height: 4, background: '#0B0D11',
                      borderRadius: 2, overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', background: 'var(--color-accent)',
                        borderRadius: 2,
                        width: `${insight.matchScore}%`,
                        transition: 'transform 0.8s ease',
                      }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                    {insight.tags.map((tag) => (
                      <span key={tag} style={{
                        fontSize: 9, color: '#A0AEC0',
                        border: '1px solid var(--color-border)',
                        padding: '2px 8px', borderRadius: 2,
                        background: 'rgba(22,24,29,0.5)',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 一句话洞察 */}
                <div style={{
                  marginTop: 12, paddingTop: 12,
                  borderTop: '1px solid rgba(45,55,72,0.5)',
                  fontSize: 12, color: '#A0AEC0',
                  display: 'flex', gap: 8, lineHeight: 1.6,
                }}>
                  <span style={{ color: 'var(--color-positive)', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>
                    ▸
                  </span>
                  {insight.insight}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
