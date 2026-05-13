import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { submitCandidateApplication, useDemoState } from '../../store/demoStore';
import type { CandidateProfileInput } from '../../types';

const initialProfile: CandidateProfileInput = {
  name: '陈同学',
  phone: '13900000000',
  email: 'chen@example.com',
  sourceChannel: '岗位体验链接',
  skills: 'Vue、React、TypeScript',
  projectExperience: '参与过B端后台项目，负责页面开发、组件封装和接口联调。',
  motivation: '希望加入技术氛围更强、成长路径更清晰的团队。',
  concerns: '成长空间、薪资沟通节点',
};

export function Profile() {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const state = useDemoState();
  const job = state.jobs.find((item) => item.id === jobId);
  const draftId = searchParams.get('draftId') ?? undefined;
  const isDirect = searchParams.get('direct') === '1';
  const [form, setForm] = useState<CandidateProfileInput>(initialProfile);

  if (!job) {
    return <main className="mobile-page"><section className="mobile-card">岗位不存在。</section></main>;
  }

  const update = (field: keyof CandidateProfileInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const candidate = submitCandidateApplication(job.id, form, draftId);
    navigate(`/candidate/story/${candidate.id}`);
  };

  return (
    <main className="mobile-page">
      <section className="mobile-card">
        <span className="eyebrow">{isDirect ? '直接投递' : '信息补充'}</span>
        <h1>补充你的投递信息</h1>
        <p>这些信息会和对话记录一起生成故事卡，帮助HR更快理解你的背景。</p>
      </section>

      <form className="mobile-card form-panel" onSubmit={submit}>
        <Field label="姓名" value={form.name} onChange={(value) => update('name', value)} />
        <Field label="手机号" value={form.phone} onChange={(value) => update('phone', value)} />
        <Field label="邮箱" value={form.email} onChange={(value) => update('email', value)} />
        <Field label="来源渠道" value={form.sourceChannel} onChange={(value) => update('sourceChannel', value)} />
        <TextArea label="技能标签" value={form.skills} onChange={(value) => update('skills', value)} />
        <TextArea label="项目经历" value={form.projectExperience} onChange={(value) => update('projectExperience', value)} />
        <TextArea label="求职动机" value={form.motivation} onChange={(value) => update('motivation', value)} />
        <TextArea label="关注点" value={form.concerns} onChange={(value) => update('concerns', value)} />
        <button className="primary-button full" type="submit">提交并生成故事卡</button>
      </form>

      <div className="mobile-actions">
        <Link className="ghost-button full" to={`/candidate/job/${job.id}`}>返回岗位页</Link>
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
      <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
