import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { addJob } from '../../store/demoStore';
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

  const update = (field: keyof JobInput, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const job = addJob(form);
    setCreatedJob(job);
  };

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">新建职位</span>
          <h1>填写JD并生成AI解析</h1>
          <p>系统会自动提取岗位技能、卖点、风险点和候选人常见问题。</p>
        </div>
        {createdJob ? (
          <button className="primary-button" onClick={() => navigate(`/hr/avatar/${createdJob.id}`)}>
            下一步：配置数字人
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
          <button className="primary-button full" type="submit">
            AI解析并保存岗位
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
              <Link className="ghost-button full" to={`/hr/avatar/${createdJob.id}`}>配置数字人</Link>
            </>
          ) : (
            <>
              <h2>等待AI解析</h2>
              <p>保存岗位后，这里会展示技能、卖点、风险点和候选人FAQ。</p>
              <div className="suggestion-card">建议补充具体工作节奏、面试流程和岗位挑战，候选人对这些信息最敏感。</div>
            </>
          )}
        </aside>
      </div>
    </main>
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
