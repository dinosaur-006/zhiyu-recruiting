import type { SimulationSenderRole } from '../../types';

const ROLE_COLORS: Record<SimulationSenderRole, string> = {
  direct_manager: '#059669', teammate: '#6366F1', client: '#D97706',
  cross_team: '#2563EB', system_bot: '#94A3B8', junior: '#7C3AED', executive: '#DC2626',
};

interface SenderAvatarProps {
  initials: string;
  role: SimulationSenderRole;
  size?: number;
  presence?: 'online' | 'away' | 'offline';
}

export function SenderAvatar({ initials, role, size = 40, presence }: SenderAvatarProps) {
  const color = ROLE_COLORS[role] ?? '#94A3B8';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.4, fontWeight: 700, fontFamily: 'var(--sim-font)',
        userSelect: 'none',
      }}>
        {initials.slice(0, 2)}
      </div>
      {presence && (
        <span className="sim-presence" style={{
          background: presence === 'online' ? 'var(--sim-online)' : presence === 'away' ? 'var(--sim-away)' : 'var(--sim-offline)',
        }} />
      )}
    </div>
  );
}
