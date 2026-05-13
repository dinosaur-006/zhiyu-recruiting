import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BranchScenarioPanel } from '../../components/BranchScenarioPanel';
import { Badge } from '../../components/Badge';
import { ComplianceNotice } from '../../components/ComplianceNotice';
import {
  askReverseQuestion,
  completeRealityScene,
  recordAskedTopic,
  selectBranchChoice,
  startTrialSession,
  useDemoState,
} from '../../store/demoStore';
import type { BranchChoice, RealityRoleType, RealityScene, ReverseQuestion, ReverseQuestionType } from '../../types';

const sceneOrder: Record<RealityScene['type'], number> = {
  intro: 0,
  dayInLife: 1,
  taskChallenge: 2,
};

const roleNames: Record<RealityRoleType, string> = {
  hr: 'HR数字人',
  teammate: '未来同事数字人',
  manager: '未来主管数字人',
};

const reverseQuestionTypes: ReverseQuestionType[] = ['工作节奏', '薪资福利', '团队氛围', '成长空间', '岗位挑战', '面试流程'];

export function Chat() {
  const { jobId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const state = useDemoState();
  const job = state.jobs.find((item) => item.id === jobId);
  const scenes = useMemo(
    () =>
      state.realityScenes
        .filter((scene) => scene.jobId === jobId)
        .sort((a, b) => sceneOrder[a.type] - sceneOrder[b.type]),
    [jobId, state.realityScenes],
  );
  const roles = state.realityRoles.filter((role) => role.jobId === jobId);
  const branchScenarios = useMemo(
    () => state.branchScenarios.filter((scenario) => scenario.jobId === jobId).sort((a, b) => a.round - b.round),
    [jobId, state.branchScenarios],
  );
  const urlSessionId = searchParams.get('sessionId') ?? undefined;
  const [sessionId, setSessionId] = useState(urlSessionId);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [branchRoundIndex, setBranchRoundIndex] = useState(0);
  const [localBranchChoiceIds, setLocalBranchChoiceIds] = useState<string[]>([]);
  const [reverseAnswer, setReverseAnswer] = useState<ReverseQuestion | null>(null);
  const session = state.trialSessions.find((item) => item.id === sessionId);

  useEffect(() => {
    if (!job || sessionId || scenes.length === 0) return;
    const trial = startTrialSession(job.id);
    setSessionId(trial.id);
    setSearchParams({ sessionId: trial.id }, { replace: true });
  }, [job, scenes.length, sessionId, setSearchParams]);

  useEffect(() => {
    if (session?.branchChoiceIds.length && localBranchChoiceIds.length === 0) {
      setLocalBranchChoiceIds(session.branchChoiceIds);
      setBranchRoundIndex(Math.min(session.branchChoiceIds.length, Math.max(0, branchScenarios.length - 1)));
    }
  }, [branchScenarios.length, localBranchChoiceIds.length, session]);

  if (!job || scenes.length === 0) {
    return (
      <main className="mobile-page">
        <section className="mobile-card">岗位实境舱暂不可用，请先由HR生成岗位实境舱。</section>
      </main>
    );
  }

  const currentScene = scenes[Math.min(sceneIndex, scenes.length - 1)];
  const role = roles.find((item) => item.type === currentScene.roleType);
  const currentBranchScenario = branchScenarios[Math.min(branchRoundIndex, Math.max(0, branchScenarios.length - 1))];
  const selectedBranchChoiceId = currentBranchScenario?.choices.find((choice) => localBranchChoiceIds.includes(choice.id))?.id;
  const branchComplete = localBranchChoiceIds.length >= branchScenarios.length && branchScenarios.length > 0;
  const progress = Math.round(((sceneIndex + 1) / scenes.length) * 100);

  const recordAction = (action: string) => {
    if (!sessionId) return;
    if (action === '直接投递') {
      navigate(`/candidate/profile/${job.id}?direct=1&sessionId=${sessionId}`);
      return;
    }
    recordAskedTopic(sessionId, action);
  };

  const goNextScene = () => {
    if (!sessionId) return;
    completeRealityScene(sessionId, currentScene.id);
    setSceneIndex((current) => Math.min(current + 1, scenes.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const chooseBranch = (choice: BranchChoice) => {
    if (!sessionId) return;
    const nextIds = Array.from(new Set([...localBranchChoiceIds, choice.id]));
    setLocalBranchChoiceIds(nextIds);
    selectBranchChoice(sessionId, choice.id);
    recordAskedTopic(sessionId, `分岔任务选择：${choice.label}. ${choice.text}`);
    if (nextIds.length >= branchScenarios.length) {
      completeRealityScene(sessionId, currentScene.id);
    } else {
      setBranchRoundIndex((current) => Math.min(current + 1, branchScenarios.length - 1));
    }
  };

  const askTruthQuestion = (type: ReverseQuestionType) => {
    if (!sessionId) return;
    const answer = askReverseQuestion(sessionId, type);
    if (answer) setReverseAnswer(answer);
  };

  const goProfile = () => {
    navigate(`/candidate/profile/${job.id}?sessionId=${sessionId ?? ''}`);
  };

  return (
    <main className="chat-page trial-page">
      <section className="chat-header">
        <Link to={`/candidate/job/${job.id}`}>返回岗位</Link>
        <div>
          <strong>岗位实境舱</strong>
          <span>
            第 {sceneIndex + 1} 幕 / {scenes.length} · {job.title}
          </span>
        </div>
        <Link to={`/candidate/profile/${job.id}?direct=1${sessionId ? `&sessionId=${sessionId}` : ''}`}>
          直接投递
        </Link>
      </section>

      <ComplianceNotice compact />

      <section className="trial-stage">
        <div className="trial-progress">
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="avatar-stage">
          <div className="digital-human" aria-hidden="true">
            <div className="digital-human-core">{role?.name.slice(0, 1) ?? '遇'}</div>
          </div>
          <div>
            <Badge tone="purple">{roleNames[currentScene.roleType]}</Badge>
            <h1>{role?.name ?? '小遇'}｜{role?.title ?? currentScene.title}</h1>
            <p>{role?.responsibility ?? '还原岗位真实工作场景'}</p>
            {role?.videoUrl ? <span className="video-placeholder">Mock Video · {role.videoUrl}</span> : null}
          </div>
        </div>

        <article className="scene-script">
          <span className="eyebrow">{currentScene.title}</span>
          <p>{currentScene.script}</p>
        </article>

        {currentScene.type !== 'taskChallenge' ? (
          <>
            <div className="scene-actions">
              {currentScene.candidateActions.map((action) => (
                <button key={action} className="ghost-button" onClick={() => recordAction(action)}>
                  {action}
                </button>
              ))}
            </div>
            <button className="primary-button full" onClick={goNextScene} disabled={!sessionId}>
              {currentScene.type === 'intro' ? '进入第二幕：未来同事带你过一天' : '进入第三幕：真实任务场景'}
            </button>
          </>
        ) : (
          <>
            <div className="branch-path">
              {branchScenarios.map((scenario, index) => (
                <span key={scenario.id} className={index <= branchRoundIndex ? 'active' : ''}>
                  第{scenario.round}轮
                </span>
              ))}
            </div>

            {currentBranchScenario ? (
              <BranchScenarioPanel
                scenario={currentBranchScenario}
                selectedChoiceId={selectedBranchChoiceId}
                onSelect={chooseBranch}
              />
            ) : null}

            <section className="reverse-room">
              <span className="eyebrow">数字人反向问答室</span>
              <h2>我想问一个真实问题</h2>
              <div className="scene-actions">
                {reverseQuestionTypes.map((type) => (
                  <button className="ghost-button" type="button" key={type} onClick={() => askTruthQuestion(type)}>
                    {type}
                  </button>
                ))}
              </div>
              {reverseAnswer ? (
                <div className="suggestion-card">
                  <strong>{reverseAnswer.question}</strong>
                  <p>{reverseAnswer.answer}</p>
                </div>
              ) : null}
            </section>

            {branchComplete ? (
              <section className="scenario-feedback">
                <span className="eyebrow">任务沙盘已完成</span>
                <h2>你的分岔选择路径已记录</h2>
                <p>系统会把三轮选择、真实问题和补充资料整理成云试岗报告，供HR面试前人工参考。</p>
                <button className="primary-button full" onClick={goProfile}>
                  补充云试岗资料
                </button>
              </section>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
