import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { CommitmentConsistencyPanel } from '../../components/CommitmentConsistencyPanel';
import { JobTruthLabelPanel } from '../../components/JobTruthLabelPanel';
import { detectJobRealityRisk, generateCommitmentConsistencyCheck, generateJobTruthContract, generateJobTruthLabel, generateRealityScripts } from '../../mock/ai';
import { addJobWithAi } from '../../store/demoStore';
import type { Job, JobInput } from '../../types';

const initialForm: JobInput = {
  title: '前端开发工程师',
  department: '研发部',
  location: '北京 · 海淀',
  salaryMin: 20,
  salaryMax: 35,
  education: '本科',
  experience: '1-3年',
  responsibilities: '负责B端SaaS产品前端开发、组件化建设、接口联调、代码评审和前端体验优化。',
  requirements: '熟悉Vue、React、TypeScript，有B端后台或SaaS项目经验，重视代码质量和团队协作。',
  teamInfo: '团队重视技术氛围、Code Review和跨职能协作。',
  growthPath: '可从业务模块负责人逐步成长为前端方向Owner。',
  interviewProcess: 'HR初沟 - 技术一面 - 业务终面 - Offer沟通',
  workload: '整体节奏较快，关键版本节点需要集中协作。',
  challenges: '业务场景复杂，需要处理复杂表单、权限配置、数据可视化和跨部门沟通。',
};

export function JobNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState<JobInput>(initialForm);
  const [createdJob, setCreatedJob] = useState<Job | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiNotice, setAiNotice] = useState('');

  const update = (field: keyof JobInput, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (isGenerating) return;
    setIsGenerating(true);
    setAiNotice('');
    try {
      const result = await addJobWithAi(form);
      setCreatedJob(result.job);
      setAiNotice(result.ai.fallback ? '真实 AI 暂时不可用，已切换为演示模式。' : 'DeepSeek 已完成岗位真相解析。');
    } catch {
      setAiNotice('真实 AI 暂时不可用，已切换为演示模式。');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">新建职位</span>
          <h1>创建岗位并生成 AI岗位真相舱</h1>
          <p>系统会自动提取岗位技能、候选人FAQ，生成岗位真相标签，并检测岗位信息是否足够真实透明。</p>
        </div>
        {createdJob ? (
          <button className="primary-button" onClick={() => navigate(`/hr/avatar/${createdJob.id}`)}>
            下一步：配置三角色数字人
          </button>
        ) : null}
      </div>

      <div className="editor-grid">
        <form className="panel form-panel" onSubmit={submit}>
          <div className="form-grid two">
            <Field label="职位名称" value={form.title} onChange={(value) => update('title', value)} />
            <Field label="所属部门" value={form.department} onChange={(value) => update('department', value)} />
            <Field label="工作地点" value={form.location} onChange={(value) => update('location', value)} />
            <Field label="学历要求" value={form.education} onChange={(value) => update('education', value)} />
            <Field label="经验要求" value={form.experience} onChange={(value) => update('experience', value)} />
            <div className="inline-fields">
              <label>
                薪资下限(k)
                <input type="number" value={form.salaryMin} onChange={(event) => update('salaryMin', Number(event.target.value))} />
              </label>
              <label>
                薪资上限(k)
                <input type="number" value={form.salaryMax} onChange={(event) => update('salaryMax', Number(event.target.value))} />
              </label>
            </div>
          </div>
          <TextArea label="岗位职责" value={form.responsibilities} onChange={(value) => update('responsibilities', value)} />
          <TextArea label="任职要求" value={form.requirements} onChange={(value) => update('requirements', value)} />
          <TextArea label="团队氛围" value={form.teamInfo} onChange={(value) => update('teamInfo', value)} />
          <TextArea label="发展路径" value={form.growthPath} onChange={(value) => update('growthPath', value)} />
          <TextArea label="面试流程" value={form.interviewProcess} onChange={(value) => update('interviewProcess', value)} />
          <TextArea label="工作节奏" value={form.workload} onChange={(value) => update('workload', value)} />
          <TextArea label="岗位挑战" value={form.challenges} onChange={(value) => update('challenges', value)} />
          {aiNotice ? <div className="suggestion-card">{aiNotice}</div> : null}
          <button className="primary-button full" type="submit" disabled={isGenerating}>
            {isGenerating ? '正在生成岗位真相...' : '保存并生成 AI岗位真相舱'}
          </button>
        </form>

        <aside className="panel ai-side">
          <span className="eyebrow">AI建议栏</span>
          {createdJob ? (
            <>
              <h2>{createdJob.analysis.summary}</h2>
              <h3>硬技能</h3>
              <div className="tag-row">{createdJob.analysis.hardSkills.map((item) => <Badge key={item} tone="blue">{item}</Badge>)}</div>
              <h3>岗位卖点</h3>
              <div className="tag-row">{createdJob.analysis.sellingPoints.map((item) => <Badge key={item} tone="green">{item}</Badge>)}</div>
              <h3>风险提示</h3>
              <div className="tag-row">{createdJob.analysis.riskPoints.map((item) => <Badge key={item} tone="amber">{item}</Badge>)}</div>
              <h3>候选人FAQ</h3>
              <ul className="clean-list">{createdJob.analysis.faq.map((item) => <li key={item}>{item}</li>)}</ul>
              <RealityRiskBlock job={createdJob} />
              <JobTruthLabelPanel label={generateJobTruthLabel(createdJob)} compact />
              <CommitmentConsistencyPanel
                check={generateCommitmentConsistencyCheck(
                  createdJob,
                  generateJobTruthLabel(createdJob),
                  generateJobTruthContract(createdJob, generateJobTruthLabel(createdJob)),
                  generateRealityScripts(createdJob),
                )}
              />
              <Link className="ghost-button full" to={`/hr/avatar/${createdJob.id}`}>配置三角色数字人</Link>
            </>
          ) : (
            <>
              <h2>等待AI解析</h2>
              <p>保存岗位后，这里会展示技能、卖点、风险点、候选人FAQ和岗位真相检测。</p>
              <div className="suggestion-card">建议补充真实一天、项目节点压力、面试流程和跨部门协作机制。</div>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}

function RealityRiskBlock({ job }: { job: Job }) {
  const risk = detectJobRealityRisk(job);

  return (
    <div className="reality-risk-card">
      <h3>岗位真相检测</h3>
      <div className="report-summary-grid compact">
        <div className="summary-cell">
          <span>JD清晰度</span>
          <strong>{risk.clarity}</strong>
        </div>
        <div className="summary-cell">
          <span>候选人误解风险</span>
          <strong>{risk.misunderstandingRisk}</strong>
        </div>
      </div>
      <h3>缺失信息</h3>
      <ul className="clean-list">
        {(risk.missingInfo.length > 0 ? risk.missingInfo : ['暂无明显缺失信息']).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h3>AI补充建议</h3>
      <ul className="clean-list">
        {risk.suggestions.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} />
    </label>
  );
}
