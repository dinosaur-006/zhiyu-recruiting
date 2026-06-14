import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2, Send, Sparkles, ArrowLeft } from 'lucide-react';
import { submitCandidateApplicationWithAi, useDemoState } from '../../store/demoStore';
import { useReportGeneration } from '../../store/useReportGeneration';
import { useChatStore } from '../../store/chatStore';
import { ExtractedProfileCard } from '../../components/ExtractedProfileCard';
import { CapabilityMirror } from '../../components/candidate/CapabilityMirror';
import { ContextPanel } from '../../components/candidate/ContextPanel';
import type { CandidateProfileInput } from '../../types';

const initialProfile: CandidateProfileInput = {
  name: '张明远',
  phone: '138****6789',
  email: 'zhangmingyuan@example.com',
  sourceChannel: '岗位实境舱链接',
  skills: 'React、TypeScript、Node.js、微前端、性能优化、组件库建设',
  projectExperience: '主导过某SaaS平台从0到1的前端架构设计，搭建了基于Qiankun的微前端体系，将首屏加载时间从4.2s优化到1.1s。负责过20+人的前端团队技术规划。',
  motivation: '当前团队技术栈老化，希望找到一个技术氛围浓厚、重视工程化的团队，能持续做有技术深度的事。',
  concerns: '技术成长天花板、薪资结构透明度、跨部门协作效率',
  rhythmAcceptance: '可以接受Sprint末期的集中冲刺，但希望日常节奏可控，不太接受长期996或突发性通宵。',
  followUpQuestion: '想了解团队目前的技术债务情况和未来6个月的技术规划优先级。',
  scenarioReflection: '面对线上故障，我会优先止损恢复服务，同时并行收集日志和监控数据。根因分析需要冷静期，不应在压力下草率下结论。',
};

interface FieldConfig {
  key: keyof CandidateProfileInput;
  question: string;
  type: 'input' | 'textarea';
}

const fields: FieldConfig[] = [
  { key: 'name', question: '先告诉我，你的姓名是？', type: 'input' },
  { key: 'phone', question: '你的手机号是？', type: 'input' },
  { key: 'email', question: '你的邮箱是？', type: 'input' },
  { key: 'skills', question: '你有哪些技能标签？可以多写几个，让我全面了解你。', type: 'textarea' },
  { key: 'projectExperience', question: '能简单介绍一下你的项目经验吗？挑一两个印象最深的说说。', type: 'textarea' },
  { key: 'motivation', question: '你的求职动机是什么？为什么想换工作或者加入新团队？', type: 'textarea' },
  { key: 'concerns', question: '找工作的时候，你最关注哪些方面？比如成长空间、薪资、团队氛围。', type: 'textarea' },
  { key: 'scenarioReflection', question: '最后，在刚才的模拟中，有没有哪个选择你觉得特别能代表你的工作风格？简单说说。', type: 'textarea' },
];

interface ChatMessage {
  type: 'them' | 'me';
  content: string;
}

export function Profile() {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const state = useDemoState();
  const job = state.jobs.find((item) => item.id === jobId);
  const draftId = searchParams.get('draftId') ?? undefined;
  const sessionId = searchParams.get('sessionId') ?? undefined;
  const isDirect = searchParams.get('direct') === '1';

  const { isGenerating, progressText, startGeneration } = useReportGeneration();

  const [form, setForm] = useState<CandidateProfileInput>(initialProfile);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiNotice, setAiNotice] = useState('');
  const [showReassurance, setShowReassurance] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // AI profile extraction
  const [extractedProfile, setExtractedProfile] = useState<unknown>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const shouldExtract = Boolean(sessionId && !isDirect);

  useEffect(() => {
    if (!shouldExtract || extractedProfile || isExtracting) return;
    const extract = async () => {
      setIsExtracting(true);
      setExtractError(null);
      try {
        const { chatHistory, branchChoices: bc, reverseAnswers: ra } = useChatStore.getState();
        const res = await fetch('/api/ai/extract-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatHistory: chatHistory.filter((m) => m.role !== 'system'),
            branchChoices: bc.map((c) => c.text),
            reverseQuestions: ra.map((a) => ({ type: a.type, question: a.question, answer: a.answer })),
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: '萃取请求失败' }));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
        const { data } = await res.json();
        setExtractedProfile(data);
      } catch (err) {
        console.warn('[extract-profile] 萃取失败，降级为手动填表:', err);
        setExtractError(err instanceof Error ? err.message : '萃取服务不可用');
      } finally {
        setIsExtracting(false);
      }
    };
    extract();
  }, [shouldExtract, extractedProfile, isExtracting]);

  const handleExtractedConfirm = useCallback(async (edits: Array<{ key: string; value: string; original: string }>) => {
    if (isGenerating) return;
    setAiNotice('');
    const ep = extractedProfile as Record<string, unknown> | null;
    const skills = ep?.skills as Array<{ name: string }> | undefined;
    const rawSkills = (ep?.selfReportedProfile as Record<string, unknown> | undefined)?.rawSkills as string[] | undefined;
    const editedSkills = (skills ?? []).map((s, i) => {
      const edit = edits.find((e) => e.key === `skills-${i}`);
      return edit ? { ...s, name: edit.value } : s;
    });

    const profile: CandidateProfileInput = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      sourceChannel: '岗位实境舱链接（AI萃取）',
      skills: editedSkills.map((s) => s.name).join('、') || rawSkills?.join('、') || form.skills,
      projectExperience: form.projectExperience,
      motivation: form.motivation,
      concerns: ((ep?.concerns as Array<{ concern: string }>) ?? []).map((c) => c.concern).join('、') || form.concerns,
      rhythmAcceptance: form.rhythmAcceptance,
      followUpQuestion: form.followUpQuestion,
      scenarioReflection: form.scenarioReflection,
    };

    try {
      const trialRes = await fetch('/api/ai/submit-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job!.id, candidateId: 'temp', sessionData: profile }),
      });
      const { taskId } = await trialRes.json();
      startGeneration('temp', { jobId: job!.id, candidateId: 'temp', sessionData: profile, taskId });
      submitCandidateApplicationWithAi(job!.id, profile, draftId, sessionId)
        .then((result) => { if (result.ai.fallback) setAiNotice('真实 AI 暂时不可用，已切换为演示模式。'); })
        .catch(() => { setAiNotice('真实 AI 暂时不可用，已切换为演示模式。'); });
    } catch {
      setAiNotice('提交失败，请检查网络后重试。');
    }
  }, [extractedProfile, form, isGenerating, job, draftId, sessionId, startGeneration]);

  // Initialize chat
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ type: 'them', content: fields[0].question }]);
      setCurrentInput(form[fields[0].key] || '');
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!job) {
    return (
      <main className="cr-page-sm" style={{ textAlign: 'center', paddingTop: 'var(--cr-space-5xl)' }}>
        <div className="cr-empty-state">
          <h3 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 20, fontWeight: 600 }}>岗位不存在</h3>
        </div>
      </main>
    );
  }

  const update = (field: keyof CandidateProfileInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const allFieldsComplete = currentFieldIndex >= fields.length;

  const handleFieldSubmit = () => {
    const field = fields[currentFieldIndex];
    const value = currentInput.trim();
    if (!value) return;
    update(field.key, value);
    const nextIndex = currentFieldIndex + 1;
    setMessages((prev) => {
      const next: ChatMessage[] = [...prev, { type: 'me', content: value }];
      if (nextIndex < fields.length) {
        next.push({ type: 'them', content: fields[nextIndex].question });
      }
      return next;
    });
    if (nextIndex < fields.length) {
      setCurrentInput(form[fields[nextIndex].key] || '');
    }
    setCurrentFieldIndex(nextIndex);
    setShowReassurance(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const field = fields[currentFieldIndex];
    if (!field) return;
    if ((field.type === 'textarea' && e.key === 'Enter' && !e.shiftKey) || (field.type === 'input' && e.key === 'Enter')) {
      e.preventDefault();
      handleFieldSubmit();
    }
  };

  const submit = async () => {
    if (isGenerating) return;
    setAiNotice('');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const trialRes = await fetch('/api/ai/submit-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, candidateId: 'temp', sessionData: form }),
        signal: controller.signal,
      });
      const { taskId } = await trialRes.json();
      startGeneration('temp', { jobId: job.id, candidateId: 'temp', sessionData: form, taskId });
      submitCandidateApplicationWithAi(job.id, form, draftId, sessionId)
        .then((result) => { if (result.ai.fallback) setAiNotice('真实 AI 暂时不可用，已切换为演示模式。'); })
        .catch(() => { setAiNotice('真实 AI 暂时不可用，已切换为演示模式。'); });
    } catch {
      setAiNotice('提交失败，请检查网络后重试。如持续失败，可直接联系HR投递。');
    } finally {
      clearTimeout(timeout);
    }
  };

  return (
    <main style={{ maxWidth: 'var(--cr-content-xxl)', margin: '0 auto', padding: 'var(--cr-space-3xl) var(--cr-page-padding) var(--cr-space-5xl)', animation: 'crFadeIn 0.5s ease both' }}>
      <div className="cr-two-panel">
        <div style={{ minWidth: 0 }}>
      {/* Header */}
      <section className="cr-card" style={{ marginBottom: 'var(--cr-space-xl)' }}>
        <span className="cr-eyebrow">{isDirect ? '直接投递' : '补充资料'}</span>
        <h1 style={{
          fontFamily: 'var(--cr-font-display)', fontSize: 24, fontWeight: 600,
          color: 'var(--cr-ink)', marginBottom: 8,
        }}>
          {isDirect ? '提交你的投递资料' : '完善你的能力画像'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--cr-ink-dim)', lineHeight: 1.7, margin: 0 }}>
          {sessionId
            ? '你已完成工作日模拟，AI已生成分析报告。以下信息将补充到你的完整能力画像中，供HR面试前人工参考。'
            : '这些内容会和你的实境体验表现一起生成能力报告，供HR面试前人工参考。你也可以在后续沟通中申请查看或删除相关数据。'}
        </p>
        {sessionId && (
          <div style={{ marginTop: 12, padding: 'var(--cr-space-md) var(--cr-space-lg)', borderRadius: 'var(--cr-radius-md)', background: 'var(--cr-accent-subtle)', border: '1px solid var(--cr-accent)', fontSize: 13, color: 'var(--cr-accent)', display: 'flex', alignItems: 'center', gap: 8 }}>
            ✅ 工作日模拟已完成 · AI 能力分析已生成
          </div>
        )}
      </section>

      {/* AI Extraction loading */}
      {shouldExtract && isExtracting && (
        <div className="cr-card" style={{ textAlign: 'center', padding: 'var(--cr-space-3xl)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--cr-accent) 0%, #34D399 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            animation: 'crPulse 2s ease infinite',
          }}>
            <Sparkles size={28} style={{ color: '#fff' }} />
          </div>
          <h3 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 18, fontWeight: 700, color: 'var(--cr-ink)', marginBottom: 8 }}>
            正在分析你的实境表现
          </h3>
          <p style={{ fontSize: 14, color: 'var(--cr-ink-dim)', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
            系统正在读取你在实境体验中的对话记录和决策路径，自动提取你的技能锚点和行为特征。这通常需要 5-10 秒。
          </p>
          <div className="cr-loading-spinner" style={{ margin: '20px auto 0' }} />
        </div>
      )}

      {/* AI Extraction failure */}
      {shouldExtract && extractError && !isExtracting && !extractedProfile && (
        <div style={{
          padding: 'var(--cr-space-lg)',
          background: 'var(--cr-warning-bg)', borderRadius: 'var(--cr-radius-md)',
          border: '1px solid var(--cr-warning)', marginBottom: 'var(--cr-space-xl)',
        }}>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--cr-ink-soft)', lineHeight: 1.6 }}>
            AI 分析暂时不可用（{extractError}），已切换为手动填表模式。你可以直接填写以下信息完成投递。
          </p>
        </div>
      )}

      {/* ExtractedProfile card */}
      {shouldExtract && extractedProfile && !isExtracting && (
        <div style={{ marginBottom: 'var(--cr-space-xl)', animation: 'crFadeInUp 0.5s ease both' }}>
          <ExtractedProfileCard
            profile={extractedProfile as any}
            onConfirm={handleExtractedConfirm}
            isConfirming={isGenerating}
          />
          {aiNotice && (
            <div style={{
              marginTop: 12, padding: 'var(--cr-space-md) var(--cr-space-lg)',
              background: 'var(--cr-info-bg)', borderRadius: 'var(--cr-radius-md)',
              fontSize: 13, color: 'var(--cr-ink-soft)',
            }}>
              {aiNotice}
            </div>
          )}
        </div>
      )}

      {/* Manual form (direct apply or extraction fallback) */}
      {(!shouldExtract || (extractError && !extractedProfile && !isExtracting)) && (
        <>
          {/* Context badge */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--cr-space-xl)' }}>
            <span className={`cr-badge ${isDirect ? 'cr-badge-green' : 'cr-badge-blue'}`}>
              {isDirect ? '直接投递' : '实境体验补充'}
            </span>
          </div>

          {/* Chat-style form */}
          <div className="cr-card" style={{ padding: 'var(--cr-space-xl)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((msg, i) => (
                <div key={i} className={`cr-msg-row ${msg.type === 'them' ? 'them' : 'me'}`}>
                  {msg.type === 'them' && (
                    <div className="cr-msg-avatar them">遇</div>
                  )}
                  <div className="cr-msg-bubble">
                    <p style={{ margin: 0 }}>{msg.content}</p>
                  </div>
                </div>
              ))}

              {/* Current field input */}
              {!allFieldsComplete && fields[currentFieldIndex] && (
                <div style={{ paddingLeft: 52 }}>
                  {fields[currentFieldIndex].type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="输入你的回答…"
                      maxLength={500}
                      onKeyDown={handleKeyDown}
                      className="cr-textarea"
                      autoFocus
                    />
                  ) : (
                    <input
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="输入你的回答…"
                      onKeyDown={handleKeyDown}
                      className="cr-input"
                      autoFocus
                    />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    {currentFieldIndex > 0 ? (
                      <button className="cr-btn-ghost" style={{ fontSize: 13 }} onClick={() => {
                        const prevIdx = currentFieldIndex - 1;
                        setCurrentFieldIndex(prevIdx);
                        setCurrentInput(form[fields[prevIdx].key] || '');
                        setMessages((p) => p.slice(0, -2));
                      }}>← 返回修改</button>
                    ) : <span />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--cr-muted)' }}>{currentFieldIndex + 1}/{fields.length}</span>
                      <button className="cr-btn-primary" style={{ padding: '8px 20px', fontSize: 14 }} onClick={handleFieldSubmit} disabled={!currentInput.trim()}><Send size={14} />发送</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Reassurance */}
              {!allFieldsComplete && !showReassurance && (
                <div style={{ paddingLeft: 52 }}>
                  <button
                    className="cr-btn-ghost"
                    onClick={() => setShowReassurance(true)}
                  >
                    我需要更多时间
                  </button>
                </div>
              )}
              {showReassurance && (
                <div style={{ paddingLeft: 52 }}>
                  <div style={{
                    padding: 'var(--cr-space-md) var(--cr-space-lg)',
                    background: 'var(--cr-subtle-warm)', borderRadius: 'var(--cr-radius-md)',
                    fontSize: 13, color: 'var(--cr-ink-dim)',
                  }}>
                    没关系，慢慢来。你的进度会被保存，随时可以继续。
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Final submit */}
            {allFieldsComplete && (
              <div style={{ textAlign: 'center', paddingTop: 16 }}>
                {aiNotice && (
                  <div style={{
                    marginBottom: 16, padding: 'var(--cr-space-md)',
                    background: 'var(--cr-info-bg)', borderRadius: 'var(--cr-radius-md)',
                    fontSize: 13, color: 'var(--cr-ink-soft)',
                  }}>
                    {aiNotice}
                  </div>
                )}
                <button
                  className="cr-btn-primary cr-btn-lg"
                  onClick={submit}
                  disabled={isGenerating}
                  style={{ width: '100%' }}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'crSpin 1s linear infinite' }} />
                      {progressText || '正在生成报告...'}
                    </>
                  ) : (
                    '提交并生成能力报告'
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Capability Mirror — skills comparison radar */}
      <CapabilityMirror />

      {/* Back link */}
      <div style={{ marginTop: 'var(--cr-space-xl)', textAlign: 'center' }}>
        <Link
          to={`/candidate/job/${job.id}`}
          className="cr-btn-ghost"
          style={{ fontSize: 14 }}
        >
          <ArrowLeft size={14} />
          返回岗位详情
        </Link>
      </div>
        </div>
        <aside><ContextPanel type="profile" /></aside>
      </div>
    </main>
  );
}
