import { motion } from 'framer-motion';

export type AvatarRole = 'hr' | 'teammate' | 'manager';

interface RoleConfig {
  initials: string;
  name: string;
  roleLabel: string;
  ringClass: string;
}

const ROLE_CONFIG: Record<AvatarRole, RoleConfig> = {
  hr:         { initials: '遇', name: '小遇', roleLabel: 'AI 体验引导官', ringClass: 'hr' },
  teammate:   { initials: '林', name: '林同学', roleLabel: '未来同事 · AI 模拟', ringClass: 'teammate' },
  manager:    { initials: '周', name: '周主管', roleLabel: '架构师 · AI 模拟', ringClass: 'manager' },
};

interface DigitalHumanCardProps {
  role: AvatarRole;
  isStreaming?: boolean;
  children?: React.ReactNode;
}

export function DigitalHumanCard({ role, isStreaming = false, children }: DigitalHumanCardProps) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.hr;

  return (
    <motion.div
      className="cr-avatar-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className={`cr-avatar-ring ${config.ringClass}`} style={isStreaming ? {
        animation: 'crPulse 1.5s ease-in-out infinite',
      } : undefined}>
        <span className="cr-avatar-initials">{config.initials}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="cr-avatar-info">
          <span className="cr-avatar-name">
            {config.name}
            {isStreaming && (
              <motion.span
                style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--cr-accent)', marginLeft: 8, verticalAlign: 'middle' }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
          </span>
          <span className="cr-avatar-role">{config.roleLabel}</span>
        </div>
        {children}
      </div>
    </motion.div>
  );
}
