import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, GitBranch, X, Flag, Users, Target } from 'lucide-react';
import { useChatStore, type TimelineNode } from '../store/chatStore';

/** 侧轨宽度 */
const RAIL_W = 56;

export function MultiverseTimeline() {
  const [isOpen, setIsOpen] = useState(false);
  const { nodes, currentNodeId, checkout, getAncestorPath, sceneIndex } = useChatStore();

  const path = getAncestorPath();
  const totalNodes = Object.keys(nodes).length;

  if (path.length === 0) return null;

  const handleCheckout = (nodeId: string) => {
    checkout(nodeId);
    setIsOpen(false);
  };

  const sceneLabel = ['岗位初见', '一日体验', '任务挑战'][Math.min(sceneIndex, 2)] ?? `第${sceneIndex + 1}幕`;

  // 当前活跃分支的节点 ID 集合，用于迷你轨高亮
  const activePathIds = new Set(path.map((n) => n.id));
  // 按时间排序所有节点（用于迷你轨的纵向排列）
  const orderedNodes = Object.values(nodes).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          🔲 常驻侧轨 — 始终占据左侧 56px，解决空白问题
          ══════════════════════════════════════════════════════════ */}
      <div
        onClick={() => setIsOpen(true)}
        title="时空时间线 — 每个圆点代表一次对话节点。金色=当前位置。点击展开完整历史，可跳回任意节点。"
        style={{
          width: RAIL_W,
          flexShrink: 0,
          background: 'var(--color-base)',
          borderRight: '1px solid #1A1D24',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s',
          zIndex: 10,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#0F1115'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-base)'; }}
      >
        {/* 顶部标签 */}
        <div style={{
          padding: '14px 0 8px',
          fontSize: 10,
          fontWeight: 700,
          color: '#4A5568',
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.1em',
          flexShrink: 0,
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          时间
          <br />
          线
        </div>

        {/* 迷你节点轨 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: '8px 0',
          overflow: 'hidden',
          width: '100%',
        }}>
          {orderedNodes.map((node) => {
            const onPath = activePathIds.has(node.id);
            const isCurrent = node.id === currentNodeId;
            const snap = node.snapshot;
            // 颜色
            const dotColor = isCurrent
              ? '#C9A96E'
              : onPath
                ? '#718096'
                : '#2D333B';
            const dotSize = isCurrent ? 8 : onPath ? 5 : 3;
            const dotGlow = isCurrent ? '0 0 8px rgba(201,169,110,0.7)' : 'none';

            return (
              <div
                key={node.id}
                title={`${node.message?.role === 'user' ? '你' : 'AI'} · 第${snap.sceneIndex + 1}幕 · br:${snap.branchRound}`}
                style={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: '50%',
                  background: dotColor,
                  boxShadow: dotGlow,
                  flexShrink: 0,
                  transition: 'background-color 0.3s, border-color 0.3s, opacity 0.3s, box-shadow 0.3s, transform 0.3s',
                  opacity: onPath ? 1 : 0.3,
                }}
              />
            );
          })}
        </div>

        {/* 底部信息 */}
        <div style={{
          padding: '12px 0 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: 14, fontWeight: 700, color: '#C9A96E',
            fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
          }}>
            {totalNodes}
          </span>
          <span style={{ fontSize: 8, color: '#4A5568', fontFamily: "'JetBrains Mono', monospace" }}>
            NODES
          </span>
          <span style={{
            fontSize: 9, color: '#718096', fontWeight: 600,
            writingMode: 'vertical-rl', textOrientation: 'mixed',
            marginTop: 4,
          }}>
            {sceneLabel}
          </span>
        </div>

        {/* Hover 展开提示 — 用 CSS class 控制 hover 显隐 */}
        <div
          className="rail-hint"
          style={{
            position: 'absolute', left: '100%', top: '50%',
            transform: 'translateY(-50%)', marginLeft: 4,
            pointerEvents: 'none',
            background: 'rgba(11,13,17,0.92)',
            border: '1px solid rgba(201,169,110,0.3)',
            borderRadius: '0 6px 6px 0',
            padding: '5px 8px',
            fontSize: 9, fontWeight: 600, color: '#C9A96E',
            fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: 'nowrap',
          }}
        >
          ← 展开
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          📂 展开面板 Overlay — 盖在内容区上方
          ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 50,
                background: 'rgba(0,0,0,0.35)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
            />

            <motion.div
              initial={{ x: -(RAIL_W + 320) }}
              animate={{ x: 0 }}
              exit={{ x: -(RAIL_W + 320) }}
              transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                left: RAIL_W,
                top: 0,
                bottom: 0,
                width: 320,
                zIndex: 51,
                background: 'var(--color-base)',
                borderRight: '1px solid rgba(201,169,110,0.25)',
                boxShadow: '12px 0 40px rgba(0,0,0,0.8)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '18px 20px',
                borderBottom: '1px solid #1E222A',
                background: 'linear-gradient(180deg, #0F1115 0%, #0B0D11 100%)',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={14} style={{ color: '#C9A96E' }} />
                    <h3 style={{ color: '#E2E8F0', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, margin: 0 }}>
                      推演时间线
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label="关闭"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #2D3748', borderRadius: 6, color: '#718096', cursor: 'pointer', padding: 4, display: 'flex', transition: 'background-color 0.15s, color 0.15s, border-color 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#E2E8F0'; e.currentTarget.style.borderColor = '#4A5568'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#718096'; e.currentTarget.style.borderColor = '#2D3748'; }}
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>
                <p style={{ fontSize: 11, color: '#718096', margin: '0 0 10px', lineHeight: 1.5 }}>
                  点击历史节点即可回滚沙盘至该时刻的快照
                </p>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[{ label: '节点', value: totalNodes }, { label: '分支点', value: Object.values(nodes).filter((n) => n.childrenIds.length > 1).length }, { label: '当前', value: sceneLabel }].map((s) => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 10, color: '#4A5568', fontFamily: "'JetBrains Mono', monospace" }}>{s.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#C9A96E', fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div style={{ flex: 1, overflowY: 'auto', position: 'relative', padding: '4px 0 32px' }} className="timeline-scrollbar">
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
                  <defs>
                    <linearGradient id="tl-panel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.9" />
                      <stop offset="60%" stopColor="#C9A96E" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#4A5568" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  <line x1="44" y1="12" x2="44" y2="100%" stroke="url(#tl-panel)" strokeWidth="2" />
                </svg>
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 14px' }}>
                  {path.map((node, i) => (
                    <NodeCard
                      key={node.id}
                      node={node}
                      isCurrent={node.id === currentNodeId}
                      isFirst={i === 0}
                      isLast={i === path.length - 1}
                      onCheckout={handleCheckout}
                    />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '10px 20px', borderTop: '1px solid #1E222A', background: '#0F1115', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <GitBranch size={11} style={{ color: '#10B981' }} />
                <span style={{ fontSize: 10, color: '#718096', lineHeight: 1.4 }}>橙色虚线 = 历史分岔点 · 跳回并选择不同路径创建平行时间线</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
const SCENE_ICON: Record<number, React.ComponentType<{ size?: number }>> = { 0: Flag, 1: Users, 2: Target };

function NodeCard({
  node, isCurrent, isFirst, isLast, onCheckout,
}: {
  node: TimelineNode;
  isCurrent: boolean;
  isFirst: boolean;
  isLast: boolean;
  onCheckout: (id: string) => void;
}) {
  const isUser = node.message?.role === 'user';
  const branchCount = node.childrenIds?.length ?? 0;
  const hasBranches = branchCount > 1;
  const [hovered, setHovered] = useState(false);
  const snap = node.snapshot;

  const roleLabel = isUser ? '你的选择' : 'AI 回应';
  const roleColor = isUser ? '#63B3ED' : '#C9A96E';

  const preview = node.message?.content
    ? node.message.content.replace(/\n/g, ' ').slice(0, 40) + (node.message.content.length > 40 ? '…' : '')
    : '沙盘初始化';

  const fmtTime = (iso: string) => {
    try { const d = new Date(iso); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; } catch { return '--:--'; }
  };

  return (
    <div
      onClick={() => !isCurrent && onCheckout(node.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', paddingLeft: 40,
        cursor: isCurrent ? 'default' : 'pointer', userSelect: 'none',
        paddingTop: isFirst ? 4 : 0, paddingBottom: isLast ? 4 : 0,
      }}
    >
      {/* 锚点 */}
      <div style={{
        position: 'absolute', left: 35, top: 12,
        width: isCurrent ? 14 : 9, height: isCurrent ? 14 : 9,
        borderRadius: '50%', marginLeft: isCurrent ? -7 : -4.5, marginTop: isCurrent ? -7 : -4.5,
        border: `2px solid ${isCurrent ? '#C9A96E' : hovered ? '#C9A96E' : '#3D4550'}`,
        background: isCurrent ? '#C9A96E' : hovered ? 'rgba(201,169,110,0.25)' : (isFirst ? 'rgba(201,169,110,0.15)' : 'var(--color-base)'),
        boxShadow: isCurrent ? '0 0 14px rgba(201,169,110,0.6)' : 'none',
        transition: 'background-color 0.3s, border-color 0.3s, opacity 0.3s, box-shadow 0.3s, transform 0.3s', zIndex: 1,
      }} />

      {/* 分岔 */}
      {hasBranches && (
        <svg style={{ position: 'absolute', left: 40, top: 10, width: 24, height: 24, pointerEvents: 'none', zIndex: 0 }}>
          <path d="M 0 5 C 6 14, 14 16, 24 18" fill="none" stroke="#ED8936" strokeWidth="1.5" strokeDasharray="3 3" opacity={0.7} />
        </svg>
      )}

      {/* 卡片 */}
      <div style={{
        padding: '9px 13px', borderRadius: 9,
        border: '1px solid',
        borderColor: isCurrent ? 'rgba(201,169,110,0.4)' : hovered ? '#4A5568' : '#1E222A',
        background: isCurrent ? 'linear-gradient(135deg, rgba(201,169,110,0.10) 0%, rgba(201,169,110,0.02) 100%)' : hovered ? 'rgba(30,34,42,0.8)' : 'rgba(15,17,21,0.5)',
        transition: 'background-color 0.3s, border-color 0.3s, opacity 0.3s, box-shadow 0.3s, transform 0.3s', opacity: node.abandoned ? 0.35 : 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", padding: '2px 7px', borderRadius: 4, background: isUser ? 'rgba(99,179,237,0.15)' : 'rgba(201,169,110,0.12)', color: roleColor }}>{roleLabel}</span>
          <span style={{ fontSize: 9, color: '#4A5568', fontFamily: "'JetBrains Mono', monospace" }}>{(() => { const Icon = SCENE_ICON[Math.min(snap.sceneIndex, 2)] ?? Target; return <Icon size={11} />; })()} 第{snap.sceneIndex + 1}幕</span>
          {hasBranches && (
            <span style={{ fontSize: 9, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", padding: '2px 7px', borderRadius: 4, background: 'rgba(237,137,54,0.12)', color: '#10B981', border: '1px solid rgba(237,137,54,0.2)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <GitBranch size={9} />{branchCount}
            </span>
          )}
          {isCurrent && <span style={{ fontSize: 8, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", padding: '2px 6px', borderRadius: 4, background: '#C9A96E', color: 'var(--color-base)', marginLeft: 'auto' }}>NOW</span>}
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.5, color: isCurrent ? '#E2E8F0' : '#8899AA', fontWeight: isCurrent ? 600 : 400, wordBreak: 'break-word' }}>{preview}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#4A5568' }}>
          <span>{fmtTime(node.createdAt)}</span>
          <span>br{snap.branchRound}·ch{snap.branchChoices.length}</span>
        </div>
      </div>

      <AnimatePresence>
        {!isCurrent && hovered && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            style={{ position: 'absolute', left: '50%', top: '50%', zIndex: 3, transform: 'translate(-50%, -50%)', pointerEvents: 'none', background: 'rgba(11,13,17,0.95)', border: '1px solid #C9A96E', borderRadius: 9999, padding: '5px 14px', fontSize: 11, fontWeight: 600, color: '#C9A96E', boxShadow: '0 0 16px rgba(0,0,0,0.7)', whiteSpace: 'nowrap' }}>
            点击跳回此节点
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
