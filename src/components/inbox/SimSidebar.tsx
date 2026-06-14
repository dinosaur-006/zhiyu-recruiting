import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Lock, Users, Inbox, Send, FileText, Search, Wifi, WifiOff, Pause, Play, X, Clock } from 'lucide-react';
import { useWorkdaySimStore } from '../../store/workdaySimStore';
import type { SimulationScenario, SimulationSender } from '../../types';

interface SimSidebarProps {
  scenario: SimulationScenario;
  selectedMessageId: string | null;
  onToggleSidebar?: () => void;
}

type PresenceStatus = 'online' | 'away' | 'offline';

export function SimSidebar({ scenario, selectedMessageId, onToggleSidebar }: SimSidebarProps) {
  const store = useWorkdaySimStore();
  const [presenceMap] = useState<Record<string, PresenceStatus>>(() => {
    const map: Record<string, PresenceStatus> = {};
    const seen = new Set<string>();
    scenario.messageScript.forEach((m) => {
      const key = m.sender.name;
      if (!seen.has(key)) {
        seen.add(key);
        const r = Math.random();
        map[key] = r > 0.3 ? 'online' : r > 0.15 ? 'away' : 'offline';
      }
    });
    return map;
  });

  // Deduplicate senders from scenario for DM list
  const dmList = useMemo(() => {
    const seen = new Set<string>();
    const list: SimulationSender[] = [];
    scenario.messageScript.forEach((m) => {
      if (!seen.has(m.sender.name)) {
        seen.add(m.sender.name);
        list.push(m.sender);
      }
    });
    return list;
  }, [scenario]);

  const isSales = scenario.title?.includes('销售') || scenario.description?.includes('销售');
  const channels = isSales
    ? ['销售战报', '客户动态', '竞品情报', '团队公告']
    : ['项目进展', '技术讨论', '客户沟通', '团队公告'];

  const unreadCount = store.messages.filter((m) => !store.readMessageIds.has(m.id) && !m.handled).length;
  const elapsedMin = Math.floor(store.elapsedMs / 60000);
  const elapsedSec = Math.floor((store.elapsedMs % 60000) / 1000);
  const progress = scenario.maxDurationMs > 0 ? Math.min(1, store.elapsedMs / scenario.maxDurationMs) : 0;
  const handledCount = Object.keys(store.actionByMessageId).length;

  const presenceColor = (s: PresenceStatus) =>
    s === 'online' ? 'var(--sim-online)' : s === 'away' ? 'var(--sim-away)' : 'var(--sim-offline)';
  const presenceLabel = (s: PresenceStatus) =>
    s === 'online' ? '在线' : s === 'away' ? '离开' : '离线';

  return (
    <div className="sim-sidebar">
      {/* Header */}
      <div className="sim-sidebar-header">
        <div style={{ width: 22, height: 22, borderRadius: 'var(--sim-radius-sm)', background: 'var(--sim-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
          🏢
        </div>
        敏行AI · 工作台
      </div>

      {/* Search placeholder */}
      <div className="sim-search-bar">
        <Search size={12} />
        搜索消息...
        <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.4 }}>⌘K</span>
      </div>

      {/* Navigation */}
      <div className="sim-sidebar-section">导航</div>
      <div className="sim-sidebar-item sim-sidebar-item--active" style={{ display: 'flex', alignItems: 'center' }}>
        <Inbox size={14} />
        <span>收件箱</span>
        {unreadCount > 0 && <span className="sim-sidebar-badge">{unreadCount}</span>}
      </div>
      <div className="sim-sidebar-item">
        <Send size={14} /> 已发送
      </div>
      <div className="sim-sidebar-item">
        <FileText size={14} /> 草稿
      </div>

      {/* Channels */}
      <div className="sim-sidebar-section">频道</div>
      {channels.map((ch, i) => (
        <div key={ch} className={`sim-sidebar-item ${i === 0 ? 'sim-sidebar-item--active' : ''}`}>
          {i === 0 ? <Hash size={14} /> : <Lock size={14} />}
          <span>{ch}</span>
          {i === 0 && <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.35 }}>12</span>}
        </div>
      ))}

      {/* Direct Messages */}
      <div className="sim-sidebar-section">私信</div>
      {dmList.map((sender) => {
        const presence = presenceMap[sender.name] ?? 'offline';
        return (
          <div key={sender.name} className="sim-sidebar-item" style={{ opacity: 1 }}>
            <div style={{ position: 'relative', width: 20, height: 20, flexShrink: 0 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: getSenderColor(sender.role),
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700,
              }}>
                {sender.avatarInitials.slice(0, 1)}
              </div>
              <span className="sim-presence" style={{ background: presenceColor(presence) }} title={presenceLabel(presence)} />
            </div>
            <span>{sender.name}</span>
            {sender.department && <span style={{ fontSize: 10, opacity: 0.4, marginLeft: 4 }}>· {sender.department}</span>}
          </div>
        );
      })}

      {/* Footer — integrated HUD */}
      <div className="sim-sidebar-footer">
        {/* Connection status */}
        <div className="sim-sidebar-footer-row" style={{ opacity: 0.7 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {store.connectionState === 'connected' ? <Wifi size={10} style={{ color: 'var(--sim-online)' }} /> : store.connectionState === 'error' ? <WifiOff size={10} style={{ color: '#EF4444' }} /> : <Wifi size={10} />}
            {store.connectionState === 'connected' ? '已连接' : store.connectionState === 'connecting' ? '连接中...' : store.connectionState === 'error' ? '连接断开' : '未连接'}
          </span>
          <span style={{ fontFamily: 'var(--sim-font-mono)', fontSize: 11 }}>
            {String(elapsedMin).padStart(2, '0')}:{String(elapsedSec).padStart(2, '0')}
          </span>
        </div>

        {/* Progress bar */}
        <div className="sim-progress-bar">
          <div className="sim-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>

        {/* Stats row */}
        <div className="sim-sidebar-footer-row" style={{ marginTop: 4 }}>
          <span>已处理 {handledCount}/{store.messages.length}</span>
          {store.isPaused && <span style={{ color: '#F59E0B', fontWeight: 600 }}>已暂停</span>}
        </div>

        {/* Ghost nudge */}
        <AnimatePresence>
          {store.ghostNudgeMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginTop: 4, padding: '4px 6px', borderRadius: 'var(--sim-radius-sm)', background: 'rgba(245,158,11,0.15)', fontSize: 10, color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span>💡 {store.ghostNudgeMessage}</span>
              <button onClick={store.dismissGhostNudge} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F59E0B', padding: '0 2px' }}><X size={10} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control buttons */}
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          <button
            onClick={() => store.setPaused(!store.isPaused)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '5px 8px', borderRadius: 'var(--sim-radius-sm)', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--sim-ink-inverse)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--sim-font)', opacity: 0.6 }}
          >
            {store.isPaused ? <Play size={11} /> : <Pause size={11} />}
            {store.isPaused ? '继续' : '暂停'}
          </button>
          <button
            onClick={() => { if (confirm('确定要结束模拟并查看分析报告吗？')) { store.completeSession(); } }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px 8px', borderRadius: 'var(--sim-radius-sm)', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--sim-ink-inverse)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--sim-font)', opacity: 0.6 }}
          >
            结束模拟
          </button>
        </div>
      </div>
    </div>
  );
}

function getSenderColor(role: string): string {
  const map: Record<string, string> = {
    direct_manager: '#059669', teammate: '#6366F1', client: '#D97706',
    cross_team: '#2563EB', system_bot: '#94A3B8', junior: '#7C3AED', executive: '#DC2626',
  };
  return map[role] ?? '#94A3B8';
}
