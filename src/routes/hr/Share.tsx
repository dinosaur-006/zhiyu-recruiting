import { Link, useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Sparkles, ExternalLink, Check, MessageSquare, Clock, Users, Zap, AlertTriangle } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { useDemoState } from '../../store/demoStore';
import { generateWorkdaySimScenario } from '../../mock/workdaySimMock';

export function Share() {
  const { jobId } = useParams();
  const { jobs } = useDemoState();
  const job = jobs.find((item) => item.id === jobId);
  const scenario = useMemo(() => job ? generateWorkdaySimScenario(job) : null, [job]);
  const link = `${window.location.origin}/candidate/inbox/${jobId}`;
  const [copied, setCopied] = useState(false);

  if (!job) {
    return <main className="page"><div className="panel" style={{ textAlign:'center', padding:'var(--space-20)' }}><h2>未找到职位</h2></div></main>;
  }

  const copy = async () => { await navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">工作日模拟分享入口</span>
          <h1>岗位实境体验已生成</h1>
          <p>候选人可以先进入工作日模拟，处理真实工作消息，再决定是否投递。AI将基于消息处理方式生成能力分析报告。</p>
        </div>
        <Link className="primary-button" to={`/candidate/inbox/${job.id}`}>
          <Sparkles size={16} /> 打开候选人体验
        </Link>
      </div>

      <section className="share-grid">
        <article className="panel">
          <h2>体验链接</h2>
          <div className="copy-box">
            <code style={{ wordBreak:'break-all' }}>{link}</code>
            <a href={link} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', color:'inherit' }}><ExternalLink size={14} /></a>
            <button className="ghost-button" onClick={copy}>{copied ? <><Check size={14} />已复制</> : '复制链接'}</button>
          </div>
          <div className="share-copy">
            <Badge tone="green" dot={true}>分享文案</Badge>
            <p>这个岗位支持&ldquo;先体验，再投递&rdquo;。点击链接进入工作日模拟，处理真实工作场景中的消息，让AI帮你生成能力分析报告，再决定是否投递。</p>
          </div>
        </article>

        <article className="panel qr-panel" style={{ display:'flex', flexDirection:'column', gap:'var(--space-4)' }}>
          <div style={{ width:180, margin:'0 auto', border:'3px solid var(--color-border)', borderRadius:28, padding:'16px 8px', background:'var(--color-surface)', boxShadow:'0 4px 24px rgba(0,0,0,0.10)' }}>
            <div style={{ width:56, height:6, margin:'0 auto 12px auto', borderRadius:999, background:'var(--color-border)' }} />
            <div style={{ background:'#1C2433', borderRadius:18, padding:'12px 10px', display:'flex', flexDirection:'column', gap:6 }}>
              {/* Simulated InboxSim sidebar header */}
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'0 4px' }}>
                <div style={{ width:14, height:14, borderRadius:3, background:'#2563EB' }} />
                <span style={{ fontSize:9, color:'#E5E7EB', fontWeight:600 }}>敏行AI · 工作台</span>
              </div>
              {/* Simulated message list */}
              <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                <div style={{ background:'#EFF6FF', borderRadius:4, padding:'6px 8px', borderLeft:'3px solid #2563EB' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}><div style={{ width:12, height:12, borderRadius:'50%', background:'#059669' }} /><span style={{ fontSize:8, fontWeight:600, color:'#1F2937' }}>周哲</span><span style={{ fontSize:7, color:'#9CA3AF' }}>刚刚</span></div>
                  <div style={{ fontSize:8, fontWeight:600, color:'#1F2937', marginTop:2 }}>Sprint 进度同步</div>
                  <div style={{ fontSize:7, color:'#4B5563', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>今天下班前把进度更新到Wiki...</div>
                </div>
                <div style={{ background:'#FFFFFF', borderRadius:4, padding:'6px 8px', border:'1px solid #F3F4F6' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}><div style={{ width:12, height:12, borderRadius:'50%', background:'#7C3AED' }} /><span style={{ fontSize:8, fontWeight:600, color:'#1F2937' }}>小赵</span><span style={{ fontSize:7, color:'#9CA3AF' }}>2分钟前</span></div>
                  <div style={{ fontSize:8, fontWeight:600, color:'#1F2937', marginTop:2 }}>新人求助</div>
                </div>
                <div style={{ background:'#FFFBEB', borderRadius:4, padding:'6px 8px', borderLeft:'3px solid #D97706' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}><div style={{ width:12, height:12, borderRadius:'50%', background:'#2563EB' }} /><span style={{ fontSize:8, fontWeight:600, color:'#1F2937' }}>陈思远</span><span style={{ fontSize:7, color:'#9CA3AF' }}>5分钟前</span></div>
                  <div style={{ fontSize:8, fontWeight:600, color:'#1F2937', marginTop:2 }}>🚨 线上告警</div>
                </div>
              </div>
              {/* Sidebar footer */}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'4px 4px 0', borderTop:'1px solid rgba(255,255,255,0.08)', marginTop:2 }}>
                <span style={{ fontSize:7, color:'#9CA3AF' }}>● 已连接</span>
                <span style={{ fontFamily:'monospace', fontSize:7, color:'#9CA3AF' }}>02:15</span>
              </div>
            </div>
            {/* phone home indicator */}
            <div style={{ width:32, height:4, margin:'12px auto 0 auto', borderRadius:999, background:'var(--color-border)' }} />
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'var(--text-xs)', fontWeight:600, color:'var(--color-ink)' }}>{job.title}</div>
            <div style={{ fontSize:'var(--text-xs)', color:'var(--color-muted)', marginTop:2 }}>
              <MessageSquare size={10} style={{ verticalAlign:'middle', marginRight:3 }} />先体验，再投递
            </div>
            <div style={{ fontSize:'var(--text-xs)', color:'var(--color-muted)', marginTop:4 }}>扫码进入工作日模拟</div>
          </div>
        </article>
      </section>

      {scenario && (
        <section className="panel" style={{ marginTop: 'var(--space-6)' }}>
          <span className="eyebrow">Simulation Preview</span>
          <h3>候选人将体验的工作日场景</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginTop: 4 }}>
            以下是候选人进入链接后将面对的真实工作消息流。AI会基于他们对每条消息的处理方式，从{scenario.targetCompetencies.length}个维度评估其工作能力。
          </p>
          {/* Scenario stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <div style={{ background: 'var(--color-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-accent)' }}>{scenario.messageScript.length}</div>
              <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 2 }}>条工作消息</div>
            </div>
            <div style={{ background: 'var(--color-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-accent)' }}>{scenario.estimatedDurationMinutes}min</div>
              <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 2 }}>预计时长</div>
            </div>
            <div style={{ background: 'var(--color-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-accent)' }}>{new Set(scenario.messageScript.map((m) => m.sender.name)).size}</div>
              <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 2 }}>位发件人</div>
            </div>
            <div style={{ background: 'var(--color-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-negative)' }}>{scenario.messageScript.filter((m) => m.urgency === 'critical' || m.urgency === 'high').length}</div>
              <div style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 2 }}>条紧急/重要消息</div>
            </div>
          </div>
          {/* Scenario summary */}
          <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-subtle)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--color-ink-soft)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--color-ink)' }}>{scenario.title}</strong> — {scenario.description.slice(0, 200)}...
          </div>
          {/* Competency tags */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
            {scenario.targetCompetencies.map((c) => {
              const labels: Record<string, string> = { prioritization:'优先级判断', communication:'沟通质量', stakeholder_management:'利益相关方管理', emotional_regulation:'情绪稳定性', task_management:'任务管理', task_switching:'多任务切换' };
              return <Badge key={c} tone="blue">{labels[c] || c}</Badge>;
            })}
          </div>
        </section>
      )}
    </main>
  );
}
