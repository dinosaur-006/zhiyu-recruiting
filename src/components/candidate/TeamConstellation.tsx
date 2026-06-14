import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Code, Palette, Zap, MessageCircle, TrendingUp, Target, Briefcase } from 'lucide-react';
import type { Job } from '../../types';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  note: string;
  color: string;
  x: number;
  y: number;
}

const TECH_TEAM: TeamMember[] = [
  { id: 'tm1', name: '张工', role: '技术负责人', expertise: ['系统架构', '技术选型', 'Code Review'], note: '注重代码质量和团队成长，每周有固定的技术分享时间。', color: '#059669', x: 48, y: 8 },
  { id: 'tm2', name: '李设计', role: '产品设计师', expertise: ['交互设计', '用户研究', '设计系统'], note: '从用户视角出发做设计，欢迎任何人参与设计讨论。', color: '#6366F1', x: 82, y: 22 },
  { id: 'tm3', name: '王同学', role: '高级前端', expertise: ['React', 'TypeScript', '性能优化'], note: '你的同级伙伴，擅长组件封装和前端工程化。', color: '#D97706', x: 62, y: 45 },
  { id: 'tm4', name: '赵经理', role: '部门主管', expertise: ['团队管理', '项目规划', '跨部门协调'], note: '关注每个人的成长路径，定期1v1沟通职业发展。', color: '#2563EB', x: 30, y: 35 },
  { id: 'tm5', name: '陈运营', role: '产品运营', expertise: ['数据分析', '用户增长', 'A/B测试'], note: '用数据驱动决策，经常和前端配合做埋点和实验。', color: '#7C3AED', x: 15, y: 16 },
];

const SALES_TEAM: TeamMember[] = [
  { id: 's1', name: '刘总监', role: '销售总监', expertise: ['团队管理', '大客户策略', '业绩考核'], note: '结果导向但重视过程。季度末亲自陪团队冲单，赢了一起庆祝，输了一起复盘。', color: '#059669', x: 50, y: 10 },
  { id: 's2', name: '陈经理', role: '华东区客户经理', expertise: ['金融行业', '关系维护', '合同谈判'], note: '你的直接上级。在华东区深耕5年，手上有一批稳定的KA客户关系。', color: '#D97706', x: 80, y: 25 },
  { id: 's3', name: '赵售前', role: '售前工程师', expertise: ['方案设计', 'POC演示', '技术答疑'], note: '技术出身转售前，能跟客户CTO深度对话。销售最可靠的搭档。', color: '#6366F1', x: 65, y: 50 },
  { id: 's4', name: '吴市场', role: '市场专员', expertise: ['行业分析', '竞品调研', '活动策划'], note: '负责华东区的市场活动和行业会议。有她在，客户拜访总有新鲜话题。', color: '#2563EB', x: 25, y: 35 },
  { id: 's5', name: '周副总', role: 'VP销售', expertise: ['战略规划', '高层对接', '资源协调'], note: '公司元老，在行业里有深厚的人脉。关键时刻能调动公司最高层资源。', color: '#7C3AED', x: 15, y: 15 },
];

const DESIGN_TEAM: TeamMember[] = [
  { id: 'd1', name: '林总监', role: '设计总监', expertise: ['设计策略', '团队建设', '品牌体验'], note: '相信好的设计需要深度理解业务。鼓励设计师参与产品决策而不仅仅是执行。', color: '#059669', x: 50, y: 8 },
  { id: 'd2', name: '周UI', role: 'UI设计师', expertise: ['视觉设计', '组件规范', '动效设计'], note: '对像素有强迫症。维护着公司级设计系统，前端最爱跟她合作。', color: '#6366F1', x: 80, y: 25 },
  { id: 'd3', name: '郑研究', role: 'UX研究员', expertise: ['用户访谈', '可用性测试', '数据分析'], note: '人类学背景，擅长从用户行为中发现深层需求。会拉着你做用户测试。', color: '#D97706', x: 60, y: 48 },
  { id: 'd4', name: '孙品牌', role: '品牌设计师', expertise: ['品牌视觉', '营销物料', '插画'], note: '负责公司品牌调性。偶尔帮产品团队画插画和图标，风格温暖有辨识度。', color: '#2563EB', x: 25, y: 32 },
  { id: 'd5', name: '钱产品', role: '产品总监', expertise: ['产品规划', '需求优先级', '跨团队协调'], note: '设计团队最密切的合作伙伴。推崇Design-Driven开发流程。', color: '#7C3AED', x: 18, y: 12 },
];

const FULLSTACK_TEAM: TeamMember[] = [
  { id: 'fs1', name: '周哲', role: '技术负责人', expertise: ['系统架构', '全栈技术', '技术决策'], note: '推崇全栈思维，鼓励每位工程师理解端到端的技术链路。每周组织跨端技术分享，是团队的技术精神领袖。', color: '#059669', x: 48, y: 8 },
  { id: 'fs2', name: '林悦', role: '前端负责人', expertise: ['React', '微前端', '性能优化'], note: '前端出身但对后端有深度理解。主张前端工程师应该了解数据库原理，这样设计API时才能真正站在全链路视角。', color: '#6366F1', x: 80, y: 22 },
  { id: 'fs3', name: '陈刚', role: '后端负责人', expertise: ['Go/Node.js', '分布式系统', '数据库设计'], note: '对API设计和数据建模有强迫症级别的追求，写出来的接口文档被前端团队称为业界良心。', color: '#D97706', x: 62, y: 48 },
  { id: 'fs4', name: '王磊', role: '高级全栈', expertise: ['TypeScript全栈', 'GraphQL', 'AWS'], note: '你的同级伙伴。从Express到Next.js到K8s部署都能搞定，是团队的活技术百科，乐于帮助同事解决跨栈问题。', color: '#2563EB', x: 28, y: 32 },
  { id: 'fs5', name: '赵敏', role: 'DevOps工程师', expertise: ['CI/CD', 'Kubernetes', '监控告警'], note: '让开发可以专注写代码的人。自动化了一切能自动化的东西，包括新人的开发环境搭建（15分钟从零到可开发状态）。', color: '#7C3AED', x: 16, y: 14 },
];

interface TeamConstellationProps {
  job?: Job;
}

export function TeamConstellation({ job }: TeamConstellationProps) {
  const [activeMember, setActiveMember] = useState<string | null>(null);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  const isSales = job?.department?.includes('销售') || job?.title?.includes('销售');
  const isDesign = job?.department?.includes('设计') || job?.title?.includes('设计');
  const isFullstack = job?.title?.includes('全栈');
  const members = isSales ? SALES_TEAM : isDesign ? DESIGN_TEAM : isFullstack ? FULLSTACK_TEAM : TECH_TEAM;
  const teamLabel = isSales ? '华东销售团队' : isDesign ? '设计团队' : isFullstack ? '全栈团队' : '研发团队';

  const active = members.find((m) => m.id === (hoveredMember ?? activeMember));

  return (
    <section className="cr-section-block">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="cr-section-title">
        <span className="cr-eyebrow" style={{ textAlign: 'center' }}>你将与谁共事</span>
        <h2>了解你的未来团队 — {teamLabel}</h2>
        <p>悬停或点击团队成员，查看他们的角色和想对你说的话</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--cr-space-2xl)', alignItems: 'center' }}>
        <div style={{ position: 'relative', height: 400, borderRadius: 'var(--cr-radius-xl)', background: 'var(--cr-subtle-warm)', border: '1px solid var(--cr-border-light)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--cr-border) 0.5px, transparent 0.5px)', backgroundSize: '20px 20px', opacity: 0.5, pointerEvents: 'none' }} />
          {members.map((member, i) => (
            <motion.button key={member.id} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.1, type: 'spring', stiffness: 200, damping: 18 }}
              onMouseEnter={() => setHoveredMember(member.id)} onMouseLeave={() => setHoveredMember(null)}
              onClick={() => setActiveMember(activeMember === member.id ? null : member.id)}
              style={{ position: 'absolute', left: `${member.x}%`, top: `${member.y}%`, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'var(--cr-font-sans)', zIndex: activeMember === member.id || hoveredMember === member.id ? 10 : 1 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, ${member.color}, ${member.color}dd)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700, fontFamily: 'var(--cr-font-display)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>{member.name[0]}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--cr-ink)', marginTop: 2 }}>{member.name}</span>
              <span style={{ fontSize: 10, color: 'var(--cr-muted)' }}>{member.role}</span>
            </motion.button>
          ))}
        </div>

        <div style={{ minHeight: 300 }}>
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div key={active.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="cr-card-elevated" style={{ borderLeft: `4px solid ${active.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${active.color}, ${active.color}dd)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 700, fontFamily: 'var(--cr-font-display)', flexShrink: 0 }}>{active.name[0]}</div>
                  <div><h3 className="cr-h3" style={{ margin: '0 0 2px', fontSize: 'var(--cr-text-xl)' }}>{active.name}</h3><span style={{ fontSize: 14, color: active.color, fontWeight: 500 }}>{active.role}</span></div>
                </div>
                <div style={{ marginBottom: 16 }}><span className="cr-eyebrow">擅长领域</span><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>{active.expertise.map((exp) => <span key={exp} style={{ padding: '4px 12px', borderRadius: 'var(--cr-radius-full)', background: `${active.color}15`, color: active.color, fontSize: 12, fontWeight: 500 }}>{exp}</span>)}</div></div>
                <div style={{ padding: 'var(--cr-space-lg)', background: 'var(--cr-subtle-warm)', borderRadius: 'var(--cr-radius-md)', borderLeft: `3px solid ${active.color}` }}><MessageCircle size={14} style={{ color: active.color, marginBottom: 6 }} /><p style={{ fontSize: 14, color: 'var(--cr-ink-soft)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>"{active.note}"</p></div>
              </motion.div>
            ) : (
              <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cr-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, textAlign: 'center', background: 'var(--cr-subtle-warm)' }}>
                <Users size={40} strokeWidth={1} style={{ color: 'var(--cr-muted)', opacity: 0.5 }} /><p style={{ fontSize: 14, color: 'var(--cr-muted)', marginTop: 12 }}>点击左侧团队成员<br />查看详细信息</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
