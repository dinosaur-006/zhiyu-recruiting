import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { submitCandidateApplication, useDemoState } from '../../store/demoStore';
import type { CandidateProfileInput } from '../../types';

const initialProfile: CandidateProfileInput = {
  name: '陈同学',
  phone: '13900000000',
  email: 'chen@example.com',
  sourceChannel: '岗位实境舱链接',
  skills: 'Vue、React、TypeScript、B端SaaS',
  projectExperience: '参与过B端后台项目，负责复杂筛选、组件封装、接口联调和Code Review。',
  motivation: '希望加入技术氛围更强、成长路径更清晰的团队。',
  concerns: '成长空间、薪资沟通节点、项目节奏',
  rhythmAcceptance: '可以接受阶段性项目压力，希望提前了解排期机制。',
  followUpQuestion: '想进一步确认团队Code Review机制和新人上手节奏。',
  scenarioReflection: '真实任务场景里，我会先和后端约定Mock字段，同时找产品确认优先级，避免等待接口导致整体延期。',
};

export function Profile() {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const state = useDemoState();
  const job = state.jobs.find((item) => item.id === jobId);
  const draftId = searchParams.get('draftId') ?? undefined;
  const sessionId = searchParams.get('sessionId') ?? undefined;
  const isDirect = searchParams.get('direct') === '1';
  const [form, setForm] = useState<CandidateProfileInput>(initialProfile);

  if (!job) {
    return (
      <main className="mobile-page">
        <section className="mobile-card">岗位不存在。</section>
      </main>
    );
  }

  const update = (field: keyof CandidateProfileInput, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const candidate = submitCandidateApplication(job.id, form, draftId, sessionId);
    navigate(`/candidate/story/${candidate.id}`);
  };

  return (
    <main className="mobile-page">
      <section className="mobile-card">
        <span className="eyebrow">{isDirect ? '直接投递' : '补充云试岗资料'}</span>
        <h1>{isDirect ? '提交你的投递资料' : '让HR更准确理解你的云试岗表现'}</h1>
        <p>
          这些内容会和你的主动提问、场景选择一起生成云试岗报告，供HR面试前人工参考。你也可以在后续沟通中申请解释或删除相关数据。
        </p>
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
        <TextArea
          label="你是否愿意接受该岗位的工作节奏？"
          value={form.rhythmAcceptance ?? ''}
          onChange={(value) => update('rhythmAcceptance', value)}
        />
        <TextArea
          label="你最想进一步确认的问题是什么？"
          value={form.followUpQuestion ?? ''}
          onChange={(value) => update('followUpQuestion', value)}
        />
        <TextArea
          label="对刚才真实任务场景的补充说明"
          value={form.scenarioReflection ?? ''}
          onChange={(value) => update('scenarioReflection', value)}
        />
        <button className="primary-button full" type="submit">
          提交并生成云试岗报告
        </button>
      </form>

      <div className="mobile-actions">
        <Link className="ghost-button full" to={`/candidate/job/${job.id}`}>
          返回岗位实境舱入口
        </Link>
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
