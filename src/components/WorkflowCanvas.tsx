import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

/* ── available node types ────────────────────────────────────────────── */
const SIDEBAR_NODES = [
  { id: '意图提取', icon: '🔍', color: '#3d4f47' },
  { id: '雷达计算', icon: '📡', color: '#5a7d6a' },
  { id: '证据组装', icon: '🧩', color: '#789080' },
  { id: '面试手册', icon: '📋', color: '#3d4f47' },
  { id: '自定义Prompt', icon: '⚡', color: '#5a7d6a' },
];

/* ── types ───────────────────────────────────────────────────────────── */
interface CanvasNode {
  id: string;            // unique instance id
  type: string;          // sidebar node type
  x: number;
  y: number;
  w?: number;
  h?: number;
}

interface Connection {
  fromId: string;
  toId: string;
}

/* ── helpers ─────────────────────────────────────────────────────────── */
let nextId = 0;
function uid() {
  return `cn_${nextId++}`;
}

const NODE_W = 140;
const NODE_H = 56;
const PORT_R = 6;

/** Anchor points for input/output circles */
function outputPort(node: CanvasNode) {
  return { x: node.x + (node.w ?? NODE_W), y: node.y + (node.h ?? NODE_H) / 2 };
}
function inputPort(node: CanvasNode) {
  return { x: node.x, y: node.y + (node.h ?? NODE_H) / 2 };
}

/* ── component ───────────────────────────────────────────────────────── */
export function WorkflowCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingFrom, setPendingFrom] = useState<string | null>(null); // waiting for "to" click

  /* ── drop from sidebar ─────────────────────────────────────────────── */
  const handleDragEnd = useCallback(
    (_: any, info: any, sidebarNodeId: string) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = info.point.x - rect.left - NODE_W / 2;
      const y = info.point.y - rect.top - NODE_H / 2;
      const node: CanvasNode = {
        id: uid(),
        type: sidebarNodeId,
        x: Math.max(0, Math.min(x, rect.width - NODE_W)),
        y: Math.max(0, Math.min(y, rect.height - NODE_H)),
        w: NODE_W,
        h: NODE_H,
      };
      setCanvasNodes((prev) => [...prev, node]);
    },
    [],
  );

  /* ── reposition existing canvas node ───────────────────────────────── */
  const handleNodeReposition = useCallback(
    (_: any, info: any, nodeId: string) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = info.point.x - rect.left - NODE_W / 2;
      const y = info.point.y - rect.top - NODE_H / 2;
      setCanvasNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? { ...n, x: Math.max(0, Math.min(x, rect.width - NODE_W)), y: Math.max(0, Math.min(y, rect.height - NODE_H)) }
            : n,
        ),
      );
    },
    [],
  );

  /* ── port click → connection logic ─────────────────────────────────── */
  const handleOutputClick = useCallback((nodeId: string) => {
    setPendingFrom(nodeId);
  }, []);

  const handleInputClick = useCallback(
    (nodeId: string) => {
      if (!pendingFrom || pendingFrom === nodeId) {
        setPendingFrom(null);
        return;
      }
      // prevent duplicate
      setConnections((prev) => {
        const dup = prev.find((c) => c.fromId === pendingFrom && c.toId === nodeId);
        if (dup) return prev;
        return [...prev, { fromId: pendingFrom, toId: nodeId }];
      });
      setPendingFrom(null);
    },
    [pendingFrom],
  );

  /* ── save ──────────────────────────────────────────────────────────── */
  const handleSave = useCallback(() => {
    const config = {
      nodes: canvasNodes.map((n) => ({ id: n.id, type: n.type, x: n.x, y: n.y })),
      edges: connections.map((c) => ({ from: c.fromId, to: c.toId })),
      // resolve type names for readability
      pipeline: connections.map((c) => {
        const from = canvasNodes.find((n) => n.id === c.fromId);
        const to = canvasNodes.find((n) => n.id === c.toId);
        return `${from?.type ?? c.fromId} → ${to?.type ?? c.toId}`;
      }),
    };
    console.log('[WorkflowCanvas] 保存工作流:', config);
    // TODO: demoStore.setWorkflowConfig(config)
  }, [canvasNodes, connections]);

  /* ── render ────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', background: 'var(--color-base)', fontFamily: 'var(--font-sans, inherit)' }}>
      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
      <div
        style={{
          width: 200,
          minWidth: 200,
          borderRight: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 14px',
          gap: 12,
          zIndex: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 4, fontFamily: 'var(--font-display)' }}>
          AI 节点
        </div>

        {SIDEBAR_NODES.map((sn) => (
          <motion.div
            key={sn.id}
            drag
            dragMomentum={false}
            dragElastic={0.05}
            onDragEnd={(e, info) => handleDragEnd(e, info, sn.id)}
            whileHover={{ scale: 1.03 }}
            whileDrag={{ scale: 1.08, boxShadow: '0 8px 28px rgba(61,79,71,0.22)', cursor: 'grabbing' }}
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              background: 'var(--color-base)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'grab',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-ink)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
              userSelect: 'none',
            }}
          >
            <span style={{ fontSize: 16 }}>{sn.icon}</span>
            <span>{sn.id}</span>
          </motion.div>
        ))}

        {/* Save button at bottom of sidebar */}
        <div style={{ flex: 1 }} />
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '10px 0',
            borderRadius: 10,
            border: 'none',
            background: 'var(--color-accent)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          保存工作流
        </button>
      </div>

      {/* ── MAIN CANVAS ───────────────────────────────────────────────── */}
      <div
        ref={canvasRef}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--color-base)',
        }}
        onClick={() => setPendingFrom(null)} // deselect pending on blank click
      >
        {/* ── empty state hint ──────────────────────────────────────── */}
        {canvasNodes.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'var(--color-muted)',
              fontSize: 13,
              textAlign: 'center',
              pointerEvents: 'none',
              opacity: 0.5,
            }}
          >
            从左侧拖拽 AI 节点到这里
          </div>
        )}

        {/* ── SVG overlay for connection lines ──────────────────────── */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          {/* pending connection line */}
          {pendingFrom && (() => {
            const fromNode = canvasNodes.find((n) => n.id === pendingFrom);
            if (!fromNode) return null;
            const op = outputPort(fromNode);
            return (
              <line
                x1={op.x}
                y1={op.y}
                x2={op.x + 60}
                y2={op.y}
                stroke="var(--color-accent)"
                strokeWidth={2}
                strokeDasharray="6 3"
                opacity={0.6}
              />
            );
          })()}
          {/* established connections */}
          {connections.map((conn, idx) => {
            const fromNode = canvasNodes.find((n) => n.id === conn.fromId);
            const toNode = canvasNodes.find((n) => n.id === conn.toId);
            if (!fromNode || !toNode) return null;
            const op = outputPort(fromNode);
            const ip = inputPort(toNode);
            // use a simple cubic bezier for a gentle curve
            const dx = Math.abs(op.x - ip.x) * 0.5;
            const d = `M ${op.x} ${op.y} C ${op.x + dx} ${op.y}, ${ip.x - dx} ${ip.y}, ${ip.x} ${ip.y}`;
            return (
              <path
                key={`conn-${idx}`}
                d={d}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={2}
                opacity={0.45}
              />
            );
          })}
        </svg>

        {/* ── Canvas nodes ──────────────────────────────────────────── */}
        {canvasNodes.map((node) => {
          const sidebarDef = SIDEBAR_NODES.find((s) => s.id === node.type);
          const isPendingFrom = pendingFrom === node.id;

          return (
            <motion.div
              key={node.id}
              drag
              dragMomentum={false}
              dragElastic={0.1}
              onDrag={(e, info) => handleNodeReposition(e, info, node.id)}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                width: node.w,
                height: node.h,
                borderRadius: 10,
                background: 'var(--color-surface)',
                border: isPendingFrom
                  ? '2px solid var(--color-accent)'
                  : '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'grab',
                zIndex: 10,
                boxShadow: isPendingFrom
                  ? '0 4px 16px rgba(61,79,71,0.18)'
                  : '0 2px 6px rgba(0,0,0,0.04)',
                userSelect: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              whileHover={{ scale: 1.04 }}
              whileDrag={{ scale: 1.08, cursor: 'grabbing', boxShadow: '0 8px 28px rgba(61,79,71,0.2)' }}
            >
              {/* input port (left edge) */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleInputClick(node.id);
                }}
                style={{
                  position: 'absolute',
                  left: -PORT_R,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: PORT_R * 2,
                  height: PORT_R * 2,
                  borderRadius: '50%',
                  background: pendingFrom ? 'var(--color-accent)' : 'var(--color-border)',
                  border: '2px solid var(--color-base)',
                  cursor: pendingFrom ? 'crosshair' : 'pointer',
                  zIndex: 20,
                  pointerEvents: 'auto',
                  transition: 'background 0.15s',
                }}
              />

              {/* label */}
              <span style={{ fontSize: 16 }}>{sidebarDef?.icon ?? '📦'}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)' }}>{node.type}</span>

              {/* output port (right edge) */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleOutputClick(node.id);
                }}
                style={{
                  position: 'absolute',
                  right: -PORT_R,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: PORT_R * 2,
                  height: PORT_R * 2,
                  borderRadius: '50%',
                  background: isPendingFrom ? 'var(--color-accent)' : 'var(--color-border)',
                  border: '2px solid var(--color-base)',
                  cursor: 'pointer',
                  zIndex: 20,
                  pointerEvents: 'auto',
                  transition: 'background 0.15s',
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
