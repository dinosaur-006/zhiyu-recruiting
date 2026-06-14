import { motion } from 'framer-motion';
import { Clock, Shield, TrendingUp, Lightbulb, MapPin, Users, ArrowRight } from 'lucide-react';
import { useDemoState } from '../../store/demoStore';

export type ContextType = 'home' | 'job' | 'chat' | 'profile' | 'story' | 'success';

interface ContextPanelProps {
  type: ContextType;
  /** Extra data passed from the page */
  data?: Record<string, unknown>;
}

export function ContextPanel({ type, data }: ContextPanelProps) {
  switch (type) {
    case 'home':
      return <HomeContext />;
    case 'job':
      return <JobContext data={data} />;
    case 'chat':
      return <ChatContext data={data} />;
    case 'profile':
      return <ProfileContext />;
    case 'story':
      return <StoryContext data={data} />;
    case 'success':
      return <SuccessContext />;
    default:
      return null;
  }
}

function HomeContext() {
  return (
    <div className="cr-side-panel">
      <TipCard icon={Lightbulb} color="var(--cr-accent)" title="为什么选择实境体验？">
        传统简历只能展示你做过什么。实境体验让HR看到你是怎么思考的——这是面试中最难展现、也最有价值的部分。
      </TipCard>
      <TipCard icon={Shield} color="var(--cr-info)" title="你的数据是安全的">
        所有体验数据仅用于本次岗位评估。你可以随时申请查看、解释或删除你的数据。AI不会独立做出招聘决定。
      </TipCard>
    </div>
  );
}

function JobContext({ data }: { data?: Record<string, unknown> }) {
  const job = data as { department?: string; location?: string; experience?: string; salaryMin?: number; salaryMax?: number } | undefined;
  return (
    <div className="cr-side-panel">
      {job && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="cr-card" style={{ padding: 'var(--cr-space-lg)' }}>
          <span className="cr-eyebrow">岗位速览</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, fontSize: 13 }}>
            {job.department && <Row icon={Users} label="部门" value={job.department} />}
            {job.location && <Row icon={MapPin} label="地点" value={job.location} />}
            {job.experience && <Row icon={Clock} label="经验" value={job.experience} />}
            {job.salaryMin && <Row icon={TrendingUp} label="薪资" value={`${job.salaryMin}k-${(job.salaryMax ?? job.salaryMin)}k`} color="var(--cr-positive)" />}
          </div>
        </motion.div>
      )}
      <QuickStats />
      <TipCard icon={Lightbulb} color="var(--cr-accent)" title="拖拽互动">
        将你最看重的维度节点拖向圆心。越靠近中心，系统越会在体验中优先展示相关信息。
      </TipCard>
    </div>
  );
}

function ChatContext({ data }: { data?: Record<string, unknown> }) {
  const d = data as { sceneIndex?: number; branchCount?: number; questionCount?: number } | undefined;
  return (
    <div className="cr-side-panel">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cr-card" style={{ padding: 'var(--cr-space-lg)' }}>
        <span className="cr-eyebrow">体验进度</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <Row icon={Clock} label="当前步骤" value={`${(d?.sceneIndex ?? 0) + 1} / 3`} />
          <Row icon={TrendingUp} label="完成轮次" value={`${d?.branchCount ?? 0}`} />
          <Row icon={Lightbulb} label="提问次数" value={`${d?.questionCount ?? 0}`} />
          <div style={{ height: 4, borderRadius: 2, background: 'var(--cr-border)', overflow: 'hidden', marginTop: 4 }}>
            <div style={{ height: '100%', borderRadius: 2, background: 'var(--cr-accent)', width: `${Math.round((((d?.sceneIndex ?? 0) + 1) / 3) * 100)}%`, transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </motion.div>
      <TipCard icon={Shield} color="var(--cr-info)" title="提示">
        你可以随时向AI提问关于岗位的任何问题。AI的回答会记录在报告中，供HR参考。这不是测试，而是双向探索。
      </TipCard>
      <TipCard icon={Lightbulb} color="var(--cr-accent)" title="AI如何工作？">
        AI会观察你在场景中的选择、提问和表达方式，提取出可迁移的职场胜任力特征。整个过程透明可追溯。
      </TipCard>
    </div>
  );
}

function ProfileContext() {
  return (
    <div className="cr-side-panel">
      <QuickStats />
      <TipCard icon={Lightbulb} color="var(--cr-accent)" title="填写建议">
        越详细的回答能让AI生成越精准的能力画像。你可以像和朋友聊天一样自然表达，不需要刻意使用专业术语。
      </TipCard>
      <TipCard icon={Shield} color="var(--cr-info)" title="数据控制权在你手中">
        提交后，你仍然可以申请修改或删除任何信息。所有数据都在HR人工复核后才会被使用。
      </TipCard>
    </div>
  );
}

function StoryContext({ data }: { data?: Record<string, unknown> }) {
  const d = data as { candidateName?: string } | undefined;
  return (
    <div className="cr-side-panel">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cr-card" style={{ padding: 'var(--cr-space-lg)' }}>
        <span className="cr-eyebrow">报告概要</span>
        <div style={{ fontSize: 14, color: 'var(--cr-ink-soft)', lineHeight: 1.6, marginTop: 8 }}>
          这是{d?.candidateName ?? '你'}的专属能力画像。HR将基于这份报告了解你在简历之外的能力维度。
        </div>
      </motion.div>
      <TipCard icon={TrendingUp} color="var(--cr-accent)" title="下一步">
        确认投递后，HR会在1-3个工作日内审阅报告。期间你可以继续浏览其他岗位或准备面试。
      </TipCard>
    </div>
  );
}

function SuccessContext() {
  return (
    <div className="cr-side-panel">
      <TipCard icon={Clock} color="var(--cr-accent)" title="时间线">
        HR通常会在1-3个工作日内完成报告审阅。如果一周内没有收到回复，你可以通过平台发送提醒消息。
      </TipCard>
    </div>
  );
}

/* ── Shared sub-components ── */

function QuickStats() {
  const state = useDemoState();
  const { metrics, realityReports } = state;
  const fairness = metrics?.candidateFairnessIndex ?? 88;
  const reviewPassRate = metrics?.aiRiskReviewPasses && realityReports?.length
    ? Math.round((metrics.aiRiskReviewPasses / realityReports.length) * 100) : 100;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="cr-card" style={{ padding: 'var(--cr-space-lg)' }}>
      <span className="cr-eyebrow">平台数据</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        <StatRow icon={Shield} label="AI辅助 · HR决策" value={`${reviewPassRate}%复核`} color="var(--cr-accent)" />
        <StatRow icon={Clock} label="平均体验时长" value="8 分钟" color="var(--cr-info)" />
        <StatRow icon={TrendingUp} label="候选人公平指数" value={`${fairness}%`} color="var(--cr-positive)" />
      </div>
    </motion.div>
  );
}

function StatRow({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--cr-muted)' }}>
        <Icon size={13} strokeWidth={1.5} style={{ color }} />
        {label}
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color, fontFamily: 'var(--cr-font-mono)' }}>{value}</span>
    </div>
  );
}

function Row({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--cr-muted)' }}>
        <Icon size={13} strokeWidth={1.5} />
        {label}
      </div>
      <span style={{ fontWeight: 600, color: color ?? 'var(--cr-ink)', fontFamily: color ? 'var(--cr-font-mono)' : undefined }}>{value}</span>
    </div>
  );
}

function TipCard({ icon: Icon, color, title, children }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; color: string; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="cr-card"
      style={{
        padding: 'var(--cr-space-lg)',
        background: `linear-gradient(135deg, ${color}08 0%, var(--cr-surface) 100%)`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Icon size={15} strokeWidth={1.5} style={{ color }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cr-ink)' }}>{title}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--cr-ink-dim)', lineHeight: 1.6 }}>{children}</div>
    </motion.div>
  );
}
