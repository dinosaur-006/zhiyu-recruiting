import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Clock, Users, Target, MessageSquare, Zap, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { useDemoState } from '../../store/demoStore';
import { generateWorkdaySimScenario } from '../../mock/workdaySimMock';

const urgencyBadge: Record<string, 'red'|'amber'|'blue'|'green'> = { critical:'red', high:'amber', medium:'blue', low:'green' };
const urgencyLabel: Record<string, string> = { critical:'紧急', high:'重要', medium:'普通', low:'信息' };

export function AvatarConfigPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const state = useDemoState();
  const job = state.jobs.find((i) => i.id === jobId);
  const scenario = useMemo(() => job ? generateWorkdaySimScenario(job) : null, [job]);

  if (!job || !scenario) {
    return <main className="page"><div className="panel" style={{ textAlign:'center', padding:'var(--space-20)' }}><h2>未找到岗位模拟场景</h2></div></main>;
  }

  // Dedupe message senders
  const senders = useMemo(() => {
    const seen = new Set<string>();
    return scenario.messageScript.filter((m) => { if (seen.has(m.sender.name)) return false; seen.add(m.sender.name); return true; }).map((m) => m.sender);
  }, [scenario]);

  const compLabels: Record<string, string> = {
    prioritization:'优先级判断', communication:'沟通质量', stakeholder_management:'利益相关方管理',
    emotional_regulation:'情绪稳定性', task_management:'任务管理', task_switching:'多任务切换',
  };

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">工作日模拟场景配置</span>
          <h1>{job.title} · {scenario.title}</h1>
          <p>{scenario.description}</p>
        </div>
        <div className="header-actions">
          <Link className="ghost-button" to={`/candidate/inbox/${job.id}`}>预览模拟体验</Link>
          <button className="primary-button" onClick={() => navigate(`/hr/share/${job.id}`)}>生成分享入口</button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))', gap:'var(--space-4)', marginBottom:'var(--space-6)' }}>
        <div className="panel" style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'var(--text-3xl)', fontWeight:700, color:'var(--color-accent)' }}>{scenario.messageScript.length}</div>
          <div style={{ fontSize:'var(--text-xs)', color:'var(--color-muted)', marginTop:4 }}>条模拟消息</div>
        </div>
        <div className="panel" style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'var(--text-3xl)', fontWeight:700, color:'var(--color-accent)' }}>{scenario.estimatedDurationMinutes}min</div>
          <div style={{ fontSize:'var(--text-xs)', color:'var(--color-muted)', marginTop:4 }}>预计体验时长</div>
        </div>
        <div className="panel" style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'var(--text-3xl)', fontWeight:700, color:'var(--color-accent)' }}>{senders.length}</div>
          <div style={{ fontSize:'var(--text-xs)', color:'var(--color-muted)', marginTop:4 }}>发件人角色</div>
        </div>
        <div className="panel" style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'var(--text-3xl)', fontWeight:700, color:'var(--color-accent)' }}>{scenario.roleCalibration.jobFamily === 'engineering' ? '技术' : scenario.roleCalibration.jobFamily === 'sales' ? '销售' : '综合'}</div>
          <div style={{ fontSize:'var(--text-xs)', color:'var(--color-muted)', marginTop:4 }}>岗位族</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-6)' }}>
        {/* Left: Sender personas */}
        <section className="panel">
          <span className="eyebrow">发件人角色</span>
          <h3>模拟中的消息发送者</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-3)', marginTop:'var(--space-4)' }}>
            {senders.map((s) => (
              <div key={s.name} style={{ display:'flex', alignItems:'center', gap:'var(--space-4)', padding:'var(--space-3) var(--space-4)', background:'var(--color-subtle)', borderRadius:'var(--radius-md)' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:s.role === 'direct_manager' ? 'var(--color-accent)' : s.role === 'teammate' ? '#6366F1' : s.role === 'client' ? '#D97706' : s.role === 'cross_team' ? '#2563EB' : s.role === 'executive' ? '#DC2626' : s.role === 'junior' ? '#7C3AED' : '#94A3B8', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:16, fontWeight:700, flexShrink:0 }}>{s.avatarInitials}</div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:'var(--text-sm)' }}>{s.name}<span style={{ fontSize:'var(--text-xs)', color:'var(--color-muted)', marginLeft:6 }}>{s.department || ''}</span></div>
                  <div style={{ fontSize:'var(--text-xs)', color:'var(--color-muted)' }}>{s.role === 'direct_manager' ? '直属主管' : s.role === 'teammate' ? '同级同事' : s.role === 'client' ? '客户' : s.role === 'cross_team' ? '跨部门' : s.role === 'executive' ? '高管' : s.role === 'junior' ? '新人' : '系统'}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Manager + Team context */}
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-6)' }}>
          <section className="panel">
            <span className="eyebrow">Manager Persona</span>
            <h3>{scenario.managerPersona.name} · {scenario.managerPersona.title}</h3>
            <p style={{ fontSize:'var(--text-sm)', color:'var(--color-ink-soft)', lineHeight:1.7, marginTop:'var(--space-2)' }}>
              <strong>风格：</strong>{scenario.managerPersona.style === 'demanding' ? '结果导向型' : scenario.managerPersona.style === 'supportive' ? '支持型' : scenario.managerPersona.style === 'hands_on' ? '亲力亲为型' : '放养型'}<br />
              {scenario.managerPersona.description}
            </p>
          </section>
          <section className="panel">
            <span className="eyebrow">Team Context</span>
            <h3>团队背景</h3>
            <p style={{ fontSize:'var(--text-sm)', color:'var(--color-ink-soft)', lineHeight:1.7, marginTop:'var(--space-2)' }}>{scenario.teamContext}</p>
          </section>
          <section className="panel">
            <span className="eyebrow">Assessment Targets</span>
            <h3>评估能力维度</h3>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:'var(--space-3)' }}>
              {scenario.targetCompetencies.map((c) => <Badge key={c} tone="blue">{compLabels[c] || c}</Badge>)}
            </div>
          </section>
        </div>
      </div>

      {/* Message timeline */}
      <section className="panel" style={{ marginTop:'var(--space-6)' }}>
        <span className="eyebrow">Message Script</span>
        <h3>消息时间线（{scenario.messageScript.length} 条）</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-2)', marginTop:'var(--space-4)' }}>
          {scenario.messageScript.map((msg, i) => (
            <div key={msg.id} style={{ display:'flex', gap:'var(--space-4)', padding:'var(--space-3) var(--space-4)', background:'var(--color-subtle)', borderRadius:'var(--radius-sm)', alignItems:'flex-start' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'var(--text-xs)', color:'var(--color-muted)', minWidth:36, paddingTop:2 }}>{msg.scheduledArrivalSeconds}s</div>
              <Badge tone={urgencyBadge[msg.urgency] || 'green'}>{urgencyLabel[msg.urgency] || msg.urgency}</Badge>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:'var(--text-sm)' }}>{msg.sender.name}：{msg.subject}</div>
                <div style={{ fontSize:'var(--text-xs)', color:'var(--color-muted)', marginTop:2, lineHeight:1.4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{msg.content.slice(0, 120)}</div>
              </div>
              <Badge tone="blue" dot>{msg.expectedResponseType}</Badge>
            </div>
          ))}
        </div>
        {/* Ambient events */}
        {(scenario.ambientEvents?.length ?? 0) > 0 && (
          <div style={{ marginTop:'var(--space-6)' }}>
            <span className="eyebrow">Ambient Events</span>
            {scenario.ambientEvents!.map((e, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'var(--space-4)', padding:'var(--space-2) var(--space-4)', marginTop:'var(--space-2)', background:'var(--color-info-bg)', borderRadius:'var(--radius-sm)', fontSize:'var(--text-xs)' }}>
                <Clock size={12} style={{ color:'var(--color-info)' }} />
                <span style={{ fontFamily:'var(--font-mono)', color:'var(--color-info)', fontWeight:600 }}>{e.scheduledArrivalSeconds}s</span>
                <span style={{ color:'var(--color-ink-soft)' }}>{e.content}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
