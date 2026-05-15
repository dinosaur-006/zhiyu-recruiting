import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { CandidateRightsPanel } from '../../components/CandidateRightsPanel';
import { ComplianceNotice } from '../../components/ComplianceNotice';
import { JobTruthContractPanel } from '../../components/JobTruthContractPanel';
import { acknowledgeTruthContract, recordTruthPoint, startTrialSession, useDemoState } from '../../store/demoStore';
import type { JobTruthLabel } from '../../types';

const chapters = [
  {
    id: '01',
    title: 'HR数字人讲岗位',
    meta: '岗位概览 / 面试流程 / AI边界',
    copy: '先讲清岗位基本信息、候选人权利和面试前需要知道的规则。',
  },
  {
    id: '02',
    title: '未来同事讲一天',
    meta: '团队协作 / 工作节奏 / Code Review',
    copy: '用同事视角还原协作方式、需求变化和项目节点前的真实压力。',
  },
  {
    id: '03',
    title: '主管给任务沙盘',
    meta: '分岔选择 / 决策路径 / 推进方式',
    copy: '在真实任务场景里做选择，让HR看到你的顾虑、判断和协作方式。',
  },
];

const truthRows: Array<{ key: keyof Pick<JobTruthLabel, 'workPace' | 'collaborationDensity' | 'uncertainty' | 'autonomy' | 'growthSpeed' | 'communicationCost'>; label: string }> = [
  { key: 'workPace', label: '工作节奏' },
  { key: 'collaborationDensity', label: '协作密度' },
  { key: 'uncertainty', label: '不确定性' },
  { key: 'autonomy', label: '自主空间' },
  { key: 'growthSpeed', label: '成长速度' },
  { key: 'communicationCost', label: '沟通成本' },
];

export function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [showConsent, setShowConsent] = useState(false);
  const [showRights, setShowRights] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const state = useDemoState();
  const job = state.jobs.find((item) => item.id === jobId);
  const truthLabel = state.jobTruthLabels.find((item) => item.jobId === jobId);
  const truthContract = state.jobTruthContracts.find((item) => item.jobId === jobId);
  const session = sessionId ? state.trialSessions.find((item) => item.id === sessionId) : undefined;
  const company = state.company;

  if (!job) {
    return (
      <main className="mobile-page">
        <section className="mobile-card">岗位不存在或已下架。</section>
      </main>
    );
  }

  const ensureSession = () => {
    const nextSession = session ?? startTrialSession(job.id);
    setSessionId(nextSession.id);
    return nextSession;
  };

  const startTrial = () => {
    const nextSession = ensureSession();
    if (!nextSession.truthContractAcknowledgement.acknowledged && truthContract) {
      acknowledgeTruthContract(
        nextSession.id,
        truthContract.commitments.map((item) => item.title),
        nextSession.truthContractAcknowledgement.unresolvedConcerns,
      );
    }
    navigate(`/candidate/chat/${job.id}?sessionId=${nextSession.id}`);
  };

  const focusTruthPoint = (point: string) => {
    const nextSession = ensureSession();
    recordTruthPoint(nextSession.id, point, true);
  };

  const acknowledgeContract = (withConcern = false) => {
    if (!truthContract) return;
    const nextSession = ensureSession();
    acknowledgeTruthContract(
      nextSession.id,
      truthContract.commitments.map((item) => item.title),
      withConcern ? ['薪资沟通节点', '成长路径说明'] : [],
    );
  };

  return (
    <main className="mobile-page trusted-job-brief">
      <section className="job-brief-hero">
        <div className="company-line">
          <span>{company.name}</span>
          <Badge tone="blue">Trusted Job Brief</Badge>
        </div>
        <h1>{job.title}</h1>
        <p>先看岗位真相，再决定是否投递。你可以直接投递，也可以先进入三步云试岗。</p>
        <div className="job-meta-row">
          <span>{job.department}</span>
          <span>{job.location}</span>
          <span>{job.salaryMin}k-{job.salaryMax}k</span>
        </div>
        <div className="mobile-actions">
          <button className="primary-button" onClick={() => setShowConsent(true)}>
            开始云试岗
          </button>
          <Link className="ghost-button" to={`/candidate/profile/${job.id}?direct=1${sessionId ? `&sessionId=${sessionId}` : ''}`}>
            直接投递简历
          </Link>
        </div>
      </section>

      <ComplianceNotice />

      {truthLabel ? (
        <section className="job-brief-section truth-brief-card">
          <div className="brief-section-head">
            <span className="eyebrow">Job Truth Brief</span>
            <h2>岗位真相说明书</h2>
            <p>这些信息来自JD、团队介绍和HR配置，目的是提前说明节奏、协作和压力边界。</p>
          </div>

          <div className="truth-brief-table">
            {truthRows.map((row) => (
              <button key={row.key} type="button" className="truth-brief-row" onClick={() => focusTruthPoint(row.label)}>
                <span>{row.label}</span>
                <strong>{truthLabel[row.key]}</strong>
              </button>
            ))}
            <button type="button" className="truth-brief-row wide" onClick={() => focusTruthPoint('加班波动')}>
              <span>加班波动</span>
              <strong>{truthLabel.overtimeVolatility}</strong>
            </button>
          </div>

          <div className="fit-brief-grid">
            <article>
              <h3>适合的人</h3>
              <div className="tag-row">
                {truthLabel.suitableFor.map((item) => (
                  <Badge key={item} tone="green">
                    {item}
                  </Badge>
                ))}
              </div>
            </article>
            <article>
              <h3>不太适合的人</h3>
              <div className="tag-row">
                {truthLabel.notSuitableFor.map((item) => (
                  <Badge key={item} tone="gray">
                    {item}
                  </Badge>
                ))}
              </div>
            </article>
          </div>

          <div className="truth-source-list">
            {truthLabel.evidence.slice(0, 3).map((item) => (
              <div key={`${item.label}-${item.source}`}>
                <span>{item.label}</span>
                <p>{item.source}：{item.evidenceText}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {truthContract ? (
        <section className="job-brief-section">
          <JobTruthContractPanel
            contract={truthContract}
            acknowledged={session?.truthContractAcknowledgement.acknowledged}
            unresolvedConcerns={session?.truthContractAcknowledgement.unresolvedConcerns}
            onAcknowledge={() => acknowledgeContract(false)}
            onConcern={() => acknowledgeContract(true)}
            onStart={() => setShowConsent(true)}
          />
        </section>
      ) : null}

      <section className="job-brief-section trial-steps-card">
        <div className="brief-section-head">
          <span className="eyebrow">Reality Trial</span>
          <h2>三步云试岗</h2>
          <p>不是让AI先评价你，而是先把岗位真实一天讲清楚。</p>
        </div>
        <div className="trial-step-list">
          {chapters.map((chapter) => (
            <article key={chapter.id} className="trial-step-card">
              <b>{chapter.id}</b>
              <div>
                <span>{chapter.meta}</span>
                <h3>{chapter.title}</h3>
                <p>{chapter.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="job-brief-section rights-brief-card">
        <div className="truth-contract-head">
          <div>
            <span className="eyebrow">Candidate Rights</span>
            <h2>我的数据与权益</h2>
            <p>进入云试岗前，你可以先看清系统记录什么、不记录什么，以及HR会看到哪些内容。</p>
          </div>
          <button className="ghost-button" type="button" onClick={() => setShowRights(true)}>
            查看权益
          </button>
        </div>
      </section>

      <div className="mobile-actions sticky brief-sticky-cta">
        <button className="primary-button" onClick={() => setShowConsent(true)}>
          开始云试岗
        </button>
        <Link className="ghost-button" to={`/candidate/profile/${job.id}?direct=1${sessionId ? `&sessionId=${sessionId}` : ''}`}>
          直接投递简历
        </Link>
      </div>

      {showConsent ? (
        <div className="modal-backdrop">
          <section className="consent-modal">
            <span className="eyebrow">开始前请确认</span>
            <h2>AI身份披露</h2>
            <p>
              你即将进入由AI数字人生成的岗位实境舱。数字人不是HR本人，也不代表真人正在与你实时沟通。
              系统不会基于本次体验自动做出招聘决定，不分析你的外貌、表情、声音情绪。
              系统只会基于你的主动提问、场景选择和填写资料生成云试岗报告，供HR人工参考。
            </p>
            <div className="mobile-actions">
              <button className="primary-button" onClick={startTrial}>
                同意并开始云试岗
              </button>
              <Link className="ghost-button" to={`/candidate/profile/${job.id}?direct=1${sessionId ? `&sessionId=${sessionId}` : ''}`}>
                直接投递简历
              </Link>
            </div>
          </section>
        </div>
      ) : null}

      {showRights ? (
        <div className="modal-backdrop">
          <section className="consent-modal wide">
            <CandidateRightsPanel onClose={() => setShowRights(false)} />
          </section>
        </div>
      ) : null}
    </main>
  );
}
