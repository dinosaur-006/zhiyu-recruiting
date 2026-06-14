import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { DigitalHumanCard } from '../../components/candidate/DigitalHumanCard';
import { SceneBriefing } from '../../components/candidate/SceneBriefing';
import { DayInLifePreview } from '../../components/candidate/DayInLifePreview';
import { ChoiceBuilder } from '../../components/candidate/ChoiceBuilder';
import { QuestionChip } from '../../components/candidate/QuestionChip';
import { SceneProgress } from '../../components/candidate/SceneProgress';
import { LiveInsightPanel } from '../../components/candidate/LiveInsightPanel';
import { computeSituationalContext } from '../../utils/situationalContext';
import { speak, stop as stopSpeech } from '../../utils/speechEngine';
import {
  askReverseQuestion, completeRealityScene, recordAskedTopic, recordCandidateExitReason,
  addCandidateActivity, selectBranchChoice, startTrialSession, useDemoState,
} from '../../store/demoStore';
import type { BranchChoice, CandidateExitReason, RealityScene, ReverseQuestionType } from '../../types';

const sceneOrder: Record<RealityScene['type'], number> = { intro: 0, dayInLife: 1, taskChallenge: 2 };

const RT: ReverseQuestionType[] = ['工作节奏', '薪资福利', '团队氛围', '成长空间', '岗位挑战', '面试流程'];
const EXIT_REASONS: CandidateExitReason[] = [
  '岗位节奏不适合', '薪资信息不明确', '成长路径不清晰',
  '工作内容不符合预期', 'AI流程让我不放心', '暂时没有时间', '其他',
];

const SCENE_LABELS = ['了解岗位', '一日预览', '构建选择'];
const SCENE_EMOJI = ['📋', '🌤️', '🎯'];

export function Chat() {
  const [showSceneIntro, setShowSceneIntro] = useState(true);
  const { jobId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const state = useDemoState();
  const job = state.jobs.find((i) => i.id === jobId);
  const scenes = useMemo(
    () => state.realityScenes.filter((s) => s.jobId === jobId).sort((a, b) => sceneOrder[a.type] - sceneOrder[b.type]),
    [jobId, state.realityScenes],
  );
  const roles = state.realityRoles.filter((r) => r.jobId === jobId);
  const branchScenarios = useMemo(
    () => state.branchScenarios.filter((s) => s.jobId === jobId).sort((a, b) => a.round - b.round),
    [jobId, state.branchScenarios],
  );
  const urlSid = searchParams.get('sessionId') ?? undefined;
  const [sessionId, setSessionId] = useState(urlSid);
  const [showExit, setShowExit] = useState(false);
  const [exitMessage, setExitMessage] = useState<string | null>(null);
  const [recoveryChecked, setRecoveryChecked] = useState(false);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);
  const [recoveredData, setRecoveredData] = useState<{ sessionId: string; sceneIndex: number } | null>(null);
  const session = state.trialSessions.find((i) => i.id === sessionId);
  const {
    sceneScriptContent, isGeneratingSceneScript, generateSceneScript,
    resetWithJob, isAiTyping, activeStreamContent,
    sceneIndex, branchRound, branchChoices, reverseAnswers,
    setSceneIndex, setBranchRound, addBranchChoice, addReverseAnswer,
    setTimePressure, startGhostTimer, stopGhostTimer,
  } = useChatStore();

  // Cinematic scene intro — 1s overlay on scene change
  useEffect(() => { setShowSceneIntro(true); const t = setTimeout(() => setShowSceneIntro(false), 400); return () => clearTimeout(t); }, [sceneIndex]);

  const lastJobContextRef = useRef<unknown>(null);
  const [overrideInput, setOverrideInput] = useState('');

  const handleOverrideSubmit = () => {
    const trimmed = overrideInput.trim();
    if (!trimmed) return;
    const { abortStream, addUserMessage, streamAiResponse } = useChatStore.getState();
    abortStream();
    addUserMessage(trimmed);
    const ctx = lastJobContextRef.current;
    streamAiResponse(withSitContext({ ...(ctx as Record<string, unknown> || {}), overrideInput: trimmed }));
    setOverrideInput('');
  };

  // Auto-start trial session
  useEffect(() => {
    if (!job || sessionId || scenes.length === 0 || !recoveryChecked) return;
    const t = startTrialSession(job.id);
    setSessionId(t.id);
    setSearchParams({ sessionId: t.id }, { replace: true });
  }, [job, scenes.length, sessionId, recoveryChecked, setSearchParams]);

  // Restore branch state from session
  useEffect(() => {
    if (session?.branchChoiceIds.length && branchChoices.length === 0) {
      session.branchChoiceIds.forEach((id) => {
        const bc = branchScenarios.flatMap((bs) => bs.choices).find((c) => c.id === id);
        if (bc) addBranchChoice({ id: bc.id, label: bc.label, text: bc.text });
      });
      setBranchRound(Math.min(session.branchChoiceIds.length, Math.max(0, branchScenarios.length - 1)));
    }
  }, [branchScenarios.length, branchChoices.length, session]);

  // AI-generate dynamic scene script on scene change
  useEffect(() => {
    if (!job || scenes.length === 0) return;
    const scene = scenes[Math.min(sceneIndex, scenes.length - 1)];
    if (!scene) return;
    generateSceneScript(withSitContext({
      role: scene.roleType,
      jobTitle: job.title,
      sceneType: scene.type,
      sceneTitle: scene.title,
      jobDepartment: job.department,
      jobResponsibilities: job.responsibilities,
      jobChallenges: job.challenges,
      jobTeamInfo: job.teamInfo,
    }) as Record<string, unknown>);
  }, [sceneIndex, job?.id]);

  // Reset chat history on mount
  useEffect(() => {
    if (!job) return;
    resetWithJob(job.title);
  }, [job?.id]);

  // Check for saved session
  useEffect(() => {
    const check = async () => {
      const { loadSession } = useChatStore.getState();
      const saved = await loadSession();
      if (saved?.sessionId) {
        setRecoveredData(saved);
        setShowRecoveryBanner(true);
      }
      setRecoveryChecked(true);
    };
    check();
  }, []);

  // Speech on AI completion
  const lastIsAiTyping = useRef(isAiTyping);
  useEffect(() => {
    const wasTyping = lastIsAiTyping.current;
    lastIsAiTyping.current = isAiTyping;
    if (wasTyping && !isAiTyping) {
      const { activeStreamContent: lastContent } = useChatStore.getState();
      if (lastContent && role) {
        speak(lastContent, currentScene.roleType, sitCtx?.timePressure ?? 'none');
      }
    }
  }, [isAiTyping]);

  // Persist session
  useEffect(() => {
    if (!sessionId) return;
    useChatStore.getState().saveSession(sessionId, sceneIndex);
  }, [sessionId, sceneIndex]);

  // Prefetch submit
  const branchComplete = branchChoices.length >= branchScenarios.length && branchScenarios.length > 0;
  useEffect(() => {
    if (!branchComplete || !job) return;
    const { prefetchTaskId } = useChatStore.getState();
    if (prefetchTaskId) return;
    fetch('/api/ai/submit-trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, candidateId: 'prefetch', sessionData: {} }),
    }).then((res) => res.json()).then((data) => {
      if (data.taskId) useChatStore.getState().setPrefetchTaskId(data.taskId);
    }).catch(() => {});
  }, [branchComplete, job]);

  if (!job || !scenes || scenes.length === 0) {
    return (
      <main style={{ padding: 'var(--cr-space-5xl) var(--cr-space-xl)', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cr-base)' }}>
        <div className="cr-empty-state">
          <h3 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 20, fontWeight: 600, color: 'var(--cr-ink)' }}>
            体验内容准备中
          </h3>
          <p style={{ fontSize: 14, color: 'var(--cr-ink-dim)' }}>
            HR正在配置实境体验内容，请稍后再来。
          </p>
        </div>
      </main>
    );
  }

  const currentScene = scenes[Math.min(sceneIndex, scenes.length - 1)];
  if (!currentScene) {
    return (
      <main style={{ padding: 'var(--cr-space-5xl) var(--cr-space-xl)', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cr-base)' }}>
        <div className="cr-empty-state">
          <h3 style={{ fontSize: 20, fontWeight: 600 }}>场景加载中...</h3>
        </div>
      </main>
    );
  }
  const role = roles.find((r) => r.type === currentScene.roleType);
  const truthLabel = state.jobTruthLabels.find((l) => l.jobId === jobId);

  // Situational context
  const withSitContext = (base: Record<string, unknown>) => {
    if (!role || !job) return base;
    const sit = computeSituationalContext(currentScene, role, job, branchChoices.length >= 3 ? branchChoices : undefined);
    return { ...base, situationalContext: sit };
  };
  const sitCtx = role && job ? computeSituationalContext(currentScene, role, job, branchChoices.length >= 3 ? branchChoices : undefined) : null;

  // Sync time pressure
  useEffect(() => {
    setTimePressure(sitCtx?.timePressure ?? 'none');
  }, [sitCtx?.timePressure, setTimePressure]);

  const currentBranch = branchScenarios[Math.min(branchRound, Math.max(0, branchScenarios.length - 1))];
  const selectedBranchId = currentBranch?.choices.find((c) => branchChoices.some((bc) => bc.id === c.id))?.id;
  const lastReverseAnswer = reverseAnswers.length > 0 ? reverseAnswers[reverseAnswers.length - 1] : null;

  const goNext = () => {
    if (!sessionId) return;
    completeRealityScene(sessionId, currentScene.id);
    addCandidateActivity('匿名候选人', `完成事件：${currentScene.title}`);
    setSceneIndex(Math.min(sceneIndex + 1, scenes.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const chooseBranch = (c: BranchChoice) => {
    if (!sessionId) return;
    stopGhostTimer();
    addBranchChoice({ id: c.id, label: c.label, text: c.text });
    selectBranchChoice(sessionId, c.id);
    recordAskedTopic(sessionId, `分岔选择：${c.label}`);
    const newCount = branchChoices.length + 1;
    if (newCount >= branchScenarios.length) {
      completeRealityScene(sessionId, currentScene.id);
      addCandidateActivity('匿名候选人', `完成全部分岔任务：${currentBranch?.title ?? ''}`);
      if (newCount === branchScenarios.length) {
        // Still update round to reflect completion
        setBranchRound(Math.min(branchRound + 1, branchScenarios.length - 1));
      }
    } else {
      setBranchRound(Math.min(branchRound + 1, branchScenarios.length - 1));
    }
    const { addUserMessage, streamAiResponse, isAiTyping: typing } = useChatStore.getState();
    if (!typing) {
      const ctx = withSitContext({ role: currentScene.roleType, jobTitle: job.title, sceneTitle: currentScene.title, candidateChoice: c.text });
      lastJobContextRef.current = ctx;
      addUserMessage(`我选择：${c.text}`);
      streamAiResponse(ctx);
    }
  };

  const askQ = (t: ReverseQuestionType) => {
    if (!sessionId) return;
    stopGhostTimer();
    const a = askReverseQuestion(sessionId, t);
    if (a) {
      addReverseAnswer({ type: t, question: a.question, answer: a.answer });
      const { addUserMessage, streamAiResponse, isAiTyping: typing } = useChatStore.getState();
      if (!typing) {
        const ctx = withSitContext({ role: currentScene.roleType, jobTitle: job.title, truthLabel, questionType: t, questionAnswer: a.answer });
        lastJobContextRef.current = ctx;
        addUserMessage(`我想了解：${t}`);
        streamAiResponse(ctx);
      }
    }
  };

  const handleExitReason = (r: CandidateExitReason) => {
    if (sessionId) {
      recordCandidateExitReason(sessionId, r);
      addCandidateActivity('匿名候选人', `提前终止体验：${r}`);
    }
    const minutes = session?.startedAt
      ? Math.max(1, Math.round((Date.now() - new Date(session.startedAt).getTime()) / 60000))
      : '—';
    setExitMessage(`你探索了 ${minutes} 分钟，因「${r}」主动终止。系统已保存你的探索轨迹，你可以随时继续。`);
  };

  const handleTacticalExecute = (cards: BranchChoice[]) => {
    stopGhostTimer();
    cards.forEach((c) => {
      addBranchChoice({ id: c.id, label: c.label, text: c.text });
      selectBranchChoice(sessionId!, c.id);
      recordAskedTopic(sessionId!, `策略卡：${c.label}`);
    });
    const strategyString = cards.map((c) => c.label).join(' + ');
    const { addUserMessage, streamAiResponse, isAiTyping: typing } = useChatStore.getState();
    if (!typing) {
      const ctx = withSitContext({ role: currentScene.roleType, jobTitle: job!.title, sceneTitle: currentScene.title, mode: 'strategy-execution', strategyString });
      lastJobContextRef.current = ctx;
      addUserMessage(`构筑方案：${strategyString}`);
      streamAiResponse(ctx);
    }
  };

  const handleContinueSession = () => {
    if (!recoveredData) return;
    setSessionId(recoveredData.sessionId);
    setSceneIndex(recoveredData.sceneIndex);
    setSearchParams({ sessionId: recoveredData.sessionId }, { replace: true });
    setShowRecoveryBanner(false);
    setRecoveredData(null);
  };

  const handleRestartSession = async () => {
    await useChatStore.getState().clearSession();
    setShowRecoveryBanner(false);
    setRecoveredData(null);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--cr-base)',
      backgroundImage: 'radial-gradient(circle, var(--cr-border-light) 0.5px, transparent 0.5px)',
      backgroundSize: '24px 24px',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 var(--cr-space-xl)',
        height: 'var(--cr-topbar-h)',
        background: 'var(--cr-surface-float)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--cr-border-light)',
      }}>
        <Link
          to={`/candidate/job/${job.id}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: 'var(--cr-ink-dim)', textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          返回
        </Link>
        <SceneProgress current={sceneIndex} total={3} labels={SCENE_LABELS} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => setShowExit(true)}
            style={{
              fontSize: 12, color: 'var(--cr-muted)', background: 'none',
              border: 'none', cursor: 'pointer', fontFamily: 'var(--cr-font-sans)',
              fontWeight: 500,
            }}
          >
            暂停体验
          </button>
        </div>
      </header>

      {/* Cinematic scene intro overlay */}
      {showSceneIntro && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 45,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'var(--cr-base)', pointerEvents: 'none',
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ fontSize: 56, marginBottom: 12 }}>{SCENE_EMOJI[Math.min(sceneIndex, 2)]}</div>
            <h2 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 28, fontWeight: 700, color: 'var(--cr-ink)', marginBottom: 8 }}>
              {SCENE_LABELS[Math.min(sceneIndex, 2)]}
            </h2>
            <p style={{ fontSize: 15, color: 'var(--cr-ink-dim)' }}>
              {sceneIndex === 0 ? '先来了解一下这个岗位的基本信息' : sceneIndex === 1 ? '感受一下在这个岗位上的日常节奏' : '展示你在真实工作场景中的思考和选择'}
            </p>
          </motion.div>
        </motion.div>
      )}

      <main style={{
        flex: 1, padding: 'var(--cr-space-xl) var(--cr-space-xl) var(--cr-space-3xl)',
        maxWidth: 'var(--cr-content-lg)', margin: '0 auto', width: '100%',
      }}>
        {/* Session recovery */}
        {showRecoveryBanner && recoveredData && (
          <div style={{
            padding: '12px 18px', borderRadius: 'var(--cr-radius-md)',
            background: 'var(--cr-accent-subtle)', border: '1px solid var(--cr-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, fontSize: 13, marginBottom: 20,
          }}>
            <span style={{ color: 'var(--cr-ink)', fontWeight: 500 }}>检测到未完成的体验记录</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleContinueSession} className="cr-btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}>
                继续
              </button>
              <button onClick={handleRestartSession} className="cr-btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>
                重新开始
              </button>
            </div>
          </div>
        )}

        {/* Two-panel: Main content + Insight sidebar */}
        <div className="cr-two-panel">
          {/* Left: Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
            {/* Digital Human Card */}
            {role && (
              <DigitalHumanCard
                role={currentScene.roleType}
                isStreaming={isGeneratingSceneScript && !sceneScriptContent}
              >
                {isGeneratingSceneScript && !sceneScriptContent ? (
                  <p style={{ fontSize: 14, color: 'var(--cr-ink-dim)', margin: '8px 0 0', lineHeight: 1.6 }}>
                    AI 正在为你准备场景描述...
                  </p>
                ) : sceneScriptContent ? (
                  <p style={{ fontSize: 14, color: 'var(--cr-ink-soft)', margin: '8px 0 0', lineHeight: 1.7 }}>
                    {sceneScriptContent}
                  </p>
                ) : (
                  <p style={{ fontSize: 14, color: 'var(--cr-ink-soft)', margin: '8px 0 0', lineHeight: 1.7 }}>
                    {currentScene.script}
                  </p>
                )}
              </DigitalHumanCard>
            )}

            {/* AI Streaming Bubble */}
            {isAiTyping && (
              <div className="cr-card" style={{
                borderLeft: '3px solid var(--cr-accent)',
                animation: 'crFadeIn 0.25s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cr-accent)', animation: 'crPulse 1.5s infinite' }} />
                  <span style={{ fontSize: 12, color: 'var(--cr-accent)', fontWeight: 600 }}>AI 正在回复</span>
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--cr-ink-soft)', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {activeStreamContent || ''}
                  <span style={{ display: 'inline-block', width: 2, height: 16, background: 'var(--cr-accent)', marginLeft: 2, verticalAlign: 'text-bottom', animation: 'crPulse 1s step-end infinite' }} />
                </p>
                <div style={{ marginTop: 14, position: 'relative' }}>
                  <input type="text" value={overrideInput} onChange={(e) => setOverrideInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleOverrideSubmit(); }} placeholder="打断并回应..." className="cr-input" style={{ paddingRight: 48 }} />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--cr-muted)', pointerEvents: 'none' }}>Enter ↵</span>
                </div>
              </div>
            )}

            {/* Scene content — three-way split */}
            {currentScene.type === 'intro' ? (
              <SceneBriefing job={job} onComplete={goNext} />
            ) : currentScene.type === 'dayInLife' ? (
              <DayInLifePreview job={job} onComplete={goNext} />
            ) : (
              <>
                {/* Branch round indicators */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  {branchScenarios.map((bs, i) => (
                    <span key={bs.id} style={{ padding: '6px 16px', borderRadius: 'var(--cr-radius-full)', fontSize: 13, fontWeight: 500, background: i <= branchRound ? 'var(--cr-accent)' : 'var(--cr-subtle)', color: i <= branchRound ? '#fff' : 'var(--cr-muted)', transition: 'all 0.3s ease' }}>第 {bs.round} 轮</span>
                  ))}
                </div>

                {currentBranch && <ChoiceBuilder options={currentBranch.choices} onExecute={handleTacticalExecute} />}

                {currentBranch && selectedBranchId && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                    {(() => {
                      const sc = currentBranch.choices.find((c) => c.id === selectedBranchId);
                      if (!sc) return null;
                      return (<><AnalysisCell label="协作方式" value={sc.analysis.collaboration} /><AnalysisCell label="风险意识" value={sc.analysis.riskAwareness} /><AnalysisCell label="沟通意识" value={sc.analysis.communication} /><AnalysisCell label="技术判断" value={sc.analysis.technicalJudgment} /></>);
                    })()}
                  </div>
                )}

                <div className="cr-card" style={{ background: 'var(--cr-subtle-warm)' }}>
                  <span className="cr-eyebrow">反向提问</span>
                  <h3 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 17, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 16 }}>我还想问一个真实问题</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {RT.map((t) => (<QuestionChip key={t} type={t} onClick={askQ} />))}
                  </div>
                  {lastReverseAnswer && (
                    <div style={{ marginTop: 16, padding: 'var(--cr-space-lg)', background: 'var(--cr-surface)', borderRadius: 'var(--cr-radius-md)', border: '1px solid var(--cr-border)' }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 6 }}>{lastReverseAnswer.question}</div>
                      <p style={{ fontSize: 14, color: 'var(--cr-ink-dim)', lineHeight: 1.7, margin: 0 }}>{lastReverseAnswer.answer}</p>
                    </div>
                  )}
                </div>


                {branchComplete && (
                  <div style={{ textAlign: 'center', padding: 'var(--cr-space-3xl)', background: 'var(--cr-positive-bg)', borderRadius: 'var(--cr-radius-xl)', border: '1px solid var(--cr-positive)', animation: 'crScaleIn 0.5s ease both' }}>
                    <CheckCircle size={48} strokeWidth={1.5} style={{ color: 'var(--cr-positive)', marginBottom: 16 }} />
                    <h3 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 22, fontWeight: 600, color: 'var(--cr-ink)', marginBottom: 8 }}>实境体验已完成</h3>
                    <p style={{ fontSize: 15, color: 'var(--cr-ink-dim)', lineHeight: 1.7, maxWidth: 400, margin: '0 auto 20px' }}>系统会把你的选择和提问整理成能力画像报告，供HR面试前人工参考。</p>
                    <button className="cr-btn-primary cr-btn-lg" onClick={() => navigate(`/candidate/profile/${job.id}?sessionId=${sessionId ?? ''}`)}>补充我的资料</button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Sticky insight sidebar */}
          <aside className="cr-side-panel">
            <LiveInsightPanel />

            {/* Session summary card */}
            <div className="cr-card" style={{ padding: 'var(--cr-space-lg)' }}>
              <span className="cr-eyebrow">体验进度</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--cr-muted)' }}>当前步骤</span>
                  <span style={{ fontWeight: 600, color: 'var(--cr-ink)' }}>{sceneIndex + 1} / 3</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--cr-muted)' }}>完成轮次</span>
                  <span style={{ fontWeight: 600, color: 'var(--cr-ink)' }}>{branchChoices.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--cr-muted)' }}>提问次数</span>
                  <span style={{ fontWeight: 600, color: 'var(--cr-ink)' }}>{reverseAnswers.length}</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--cr-border)', overflow: 'hidden', marginTop: 4 }}>
                  <div style={{ height: '100%', borderRadius: 2, background: 'var(--cr-accent)', width: `${Math.round(((sceneIndex + 1) / 3) * 100)}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            </div>

            {/* Quick tip */}
            <div className="cr-card" style={{
              padding: 'var(--cr-space-lg)',
              background: 'linear-gradient(135deg, var(--cr-accent-subtle) 0%, var(--cr-surface) 100%)',
              borderLeft: '3px solid var(--cr-accent)',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--cr-accent)' }}>提示</span>
              <p style={{ fontSize: 12, color: 'var(--cr-ink-soft)', lineHeight: 1.6, margin: '4px 0 0' }}>
                你可以随时向AI提问关于岗位的任何问题。AI的回答会记录在报告中，供HR参考。
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Exit modal */}
      {showExit && (
        <div className="cr-modal-backdrop" onClick={() => { setShowExit(false); setExitMessage(null); }}>
          <div className="cr-modal" onClick={(e) => e.stopPropagation()}>
            <span className="cr-eyebrow">暂停体验</span>
            {!exitMessage ? (
              <>
                <h3 style={{
                  fontFamily: 'var(--cr-font-display)', fontSize: 22, fontWeight: 600,
                  color: 'var(--cr-ink)', margin: '4px 0 8px',
                }}>
                  你暂时想离开，是因为？
                </h3>
                <p style={{ fontSize: 14, color: 'var(--cr-ink-dim)', marginBottom: 20, lineHeight: 1.6 }}>
                  这个选择只用于帮助企业优化岗位表达，不评价你的能力。
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                  {EXIT_REASONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleExitReason(r)}
                      style={{
                        padding: '10px 14px', borderRadius: 'var(--cr-radius-md)',
                        border: '1px solid var(--cr-border)', background: 'var(--cr-surface)',
                        color: 'var(--cr-ink-soft)', fontSize: 13, cursor: 'pointer',
                        fontFamily: 'var(--cr-font-sans)', textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--cr-accent)';
                        e.currentTarget.style.background = 'var(--cr-accent-subtle)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--cr-border)';
                        e.currentTarget.style.background = 'var(--cr-surface)';
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <button className="cr-btn-secondary" style={{ width: '100%' }} onClick={() => setShowExit(false)}>
                  返回体验
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 15, color: 'var(--cr-ink-soft)', lineHeight: 1.7, margin: '12px 0 20px' }}>
                  {exitMessage}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="cr-btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => { setShowExit(false); setExitMessage(null); }}
                  >
                    返回体验
                  </button>
                  <button
                    className="cr-btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/candidate/profile/${job.id}?sessionId=${sessionId ?? ''}`)}
                  >
                    提交资料并投递
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: '12px 16px', background: 'var(--cr-subtle)',
      borderRadius: 'var(--cr-radius-md)', display: 'flex',
      flexDirection: 'column', gap: 2,
    }}>
      <span style={{ fontSize: 11, color: 'var(--cr-muted)' }}>{label}</span>
      <strong style={{ fontSize: 14, fontWeight: 600, color: 'var(--cr-ink)' }}>{value}</strong>
    </div>
  );
}
