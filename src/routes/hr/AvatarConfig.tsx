import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { updateAvatar, useDemoState } from '../../store/demoStore';

const focusOptions = ['岗位职责', '团队氛围', '成长路径', '面试流程', '工作节奏', '薪资沟通节点'];

export function AvatarConfigPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const state = useDemoState();
  const job = state.jobs.find((item) => item.id === jobId);
  const avatar = state.avatars.find((item) => item.jobId === jobId);
  const [form, setForm] = useState(() => avatar);
  const forbiddenText = useMemo(() => form?.forbiddenTopics.join('、') ?? '', [form]);

  if (!job || !form) {
    return (
      <main className="page">
        <div className="panel">未找到岗位或数字人配置。</div>
      </main>
    );
  }

  const toggleFocus = (topic: string) => {
    setForm((current) =>
      current
        ? {
            ...current,
            focusTopics: current.focusTopics.includes(topic)
              ? current.focusTopics.filter((item) => item !== topic)
              : [...current.focusTopics, topic],
          }
        : current,
    );
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    updateAvatar(job.id, form);
    navigate(`/hr/share/${job.id}`);
  };

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">数字人配置</span>
          <h1>{job.title} · 岗位体验官</h1>
          <p>配置数字人形象、语气、重点介绍内容和话题边界。</p>
        </div>
        <Link className="ghost-button" to="/hr/jobs">
          返回职位
        </Link>
      </div>

      <div className="editor-grid">
        <form className="panel form-panel" onSubmit={submit}>
          <label>
            数字人名称
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label>
            数字人身份
            <input value={form.identity} onChange={(event) => setForm({ ...form, identity: event.target.value })} />
          </label>
          <label>
            对话语气
            <select value={form.style} onChange={(event) => setForm({ ...form, style: event.target.value as typeof form.style })}>
              <option>专业且友好</option>
              <option>严谨专业</option>
              <option>轻松友好</option>
            </select>
          </label>
          <label>
            对话模式
            <select value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value as typeof form.duration })}>
              <option>3分钟快聊</option>
              <option>8分钟标准聊</option>
              <option>15分钟深聊</option>
            </select>
          </label>
          <div className="field-block">
            <span>重点介绍</span>
            <div className="toggle-grid">
              {focusOptions.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  className={form.focusTopics.includes(topic) ? 'toggle-chip active' : 'toggle-chip'}
                  onClick={() => toggleFocus(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
          <label>
            禁止话题
            <textarea
              rows={3}
              value={forbiddenText}
              onChange={(event) => setForm({ ...form, forbiddenTopics: event.target.value.split(/[、,，]/).filter(Boolean) })}
            />
          </label>
          <label>
            开场白
            <textarea rows={4} value={form.openingScript} onChange={(event) => setForm({ ...form, openingScript: event.target.value })} />
          </label>
          <button className="primary-button full" type="submit">
            保存并生成体验链接
          </button>
        </form>

        <aside className="panel avatar-preview">
          <div className="avatar-orb">AI</div>
          <span className="eyebrow">数字人预览</span>
          <h2>{form.name}</h2>
          <p>{form.identity} · {form.style} · {form.duration}</p>
          <div className="chat-preview">
            <p>{form.openingScript}</p>
          </div>
          <div className="tag-row">
            {form.focusTopics.map((topic) => (
              <Badge key={topic} tone="purple">
                {topic}
              </Badge>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
