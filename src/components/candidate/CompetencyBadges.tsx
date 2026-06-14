import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Shield, Zap, Lightbulb, Heart, Target, Star, Sparkles } from 'lucide-react';

interface Badge {
  id: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  name: string;
  description: string;
  trigger: string;
  color: string;
  earned: boolean;
  earnedAt?: string;
}

const BADGE_POOL: Badge[] = [
  { id: 'first_choice', icon: Target, name: '首次决策', description: '在场景中做出了你的第一个选择', trigger: '做出第一个场景选择', color: '#059669', earned: false },
  { id: 'curious', icon: Lightbulb, name: '好奇心', description: '主动向AI提出了一个问题', trigger: '提出第一个反向问题', color: '#6366F1', earned: false },
  { id: 'strategist', icon: Zap, name: '策略家', description: '同时选择了2个以上的方案组合', trigger: '在构建区组合多个方案', color: '#D97706', earned: false },
  { id: 'collaborator', icon: Heart, name: '协作者', description: '展现了协作优先的工作风格', trigger: '选择了协作导向的方案', color: '#2563EB', earned: false },
  { id: 'explorer', icon: Star, name: '探索者', description: '完成了全部3个场景的体验', trigger: '完成全部实境体验场景', color: '#7C3AED', earned: false },
  { id: 'persistent', icon: Shield, name: '坚持者', description: '在一次体验中停留超过5分钟', trigger: '体验时长超过5分钟', color: '#059669', earned: false },
];

interface CompetencyBadgesProps {
  branchChoicesCount: number;
  reverseAnswersCount: number;
  sceneIndex: number;
}

export function CompetencyBadges({ branchChoicesCount, reverseAnswersCount, sceneIndex }: CompetencyBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>(BADGE_POOL);
  const [latestBadge, setLatestBadge] = useState<string | null>(null);

  // Check badge triggers
  useEffect(() => {
    setBadges((prev) => {
      let changed = false;
      const updated = prev.map((b) => {
        if (b.earned) return b;
        let earned = false;
        switch (b.id) {
          case 'first_choice': earned = branchChoicesCount >= 1; break;
          case 'curious': earned = reverseAnswersCount >= 1; break;
          case 'strategist': earned = branchChoicesCount >= 2; break;
          case 'collaborator': earned = branchChoicesCount >= 1; break;
          case 'explorer': earned = sceneIndex >= 2; break;
          case 'persistent': earned = branchChoicesCount >= 1 || reverseAnswersCount >= 1; break;
        }
        if (earned) { changed = true; setLatestBadge(b.id); setTimeout(() => setLatestBadge(null), 3000); }
        return earned ? { ...b, earned: true, earnedAt: new Date().toISOString() } : b;
      });
      return changed ? updated : prev;
    });
  }, [branchChoicesCount, reverseAnswersCount, sceneIndex]);

  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  return (
    <div className="cr-card" style={{ padding: 'var(--cr-space-lg)' }}>
      <span className="cr-eyebrow">能力徽章</span>
      <p style={{ fontSize: 12, color: 'var(--cr-ink-dim)', margin: '2px 0 12px' }}>
        在体验中解锁徽章，展示你的行为特质
      </p>

      {/* Earned badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: earnedBadges.length > 0 ? 12 : 0 }}>
        <AnimatePresence>
          {earnedBadges.map((badge) => {
            const BadgeIcon = badge.icon;
            const isNew = latestBadge === badge.id;
            return (
              <motion.div
                key={badge.id}
                initial={isNew ? { scale: 0, rotate: -15 } : false}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 'var(--cr-radius-full)',
                  background: `${badge.color}15`, border: `1px solid ${badge.color}33`,
                  position: 'relative',
                }}
                title={badge.description}
              >
                <BadgeIcon size={14} strokeWidth={1.5} style={{ color: badge.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: badge.color }}>{badge.name}</span>
                {isNew && (
                  <motion.span
                    initial={{ opacity: 1, y: -4 }}
                    animate={{ opacity: 0, y: -12 }}
                    transition={{ duration: 1.5 }}
                    style={{ position: 'absolute', top: -8, right: -4, fontSize: 14, pointerEvents: 'none' }}
                  >
                    <Sparkles size={14} style={{ color: '#D97706' }} />
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Locked badges preview */}
      {lockedBadges.length > 0 && (
        <div style={{ borderTop: '1px solid var(--cr-border-light)', paddingTop: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--cr-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            待解锁 · {lockedBadges.length}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {lockedBadges.map((badge) => {
              const BadgeIcon = badge.icon;
              return (
                <div key={badge.id} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 'var(--cr-radius-full)',
                  background: 'var(--cr-subtle)', opacity: 0.5,
                }} title={badge.trigger}>
                  <BadgeIcon size={12} strokeWidth={1} style={{ color: 'var(--cr-muted)' }} />
                  <span style={{ fontSize: 11, color: 'var(--cr-muted)' }}>{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
