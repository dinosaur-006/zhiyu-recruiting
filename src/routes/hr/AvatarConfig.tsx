import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { updateRealityRole, useDemoState } from '../../store/demoStore';
import type { RealityRole, RealityRoleType } from '../../types';

const roleLabels: Record<RealityRoleType, string> = {
  hr: 'HR数字人',
  teammate: '未来同事数字人',
  manager: '未来主管数字人',
};

export function AvatarConfigPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const state = useDemoState();
  const job = state.jobs.find((item) => item.id === jobId);
  const roles = state.realityRoles.filter((role) => role.jobId === jobId);
  const scenes = state.realityScenes.filter((scene) => scene.jobId === jobId);

  if (!job || roles.length === 0) {
    return (
      <main className="page">
        <div className="panel">未找到岗位实境舱角色配置。</div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">数字人角色配置｜岗位实境舱</span>
          <h1>{job.title} · 三角色数字分身</h1>
          <p>配置HR数字人、未来同事数字人、未来主管数字人，用三幕式体验还原岗位真实一天。</p>
        </div>
        <div className="header-actions">
          <Link className="ghost-button" to={`/candidate/job/${job.id}`}>预览实境舱</Link>
          <button className="primary-button" onClick={() => navigate(`/hr/share/${job.id}`)}>生成分享入口</button>
        </div>
      </div>

      <div className="editor-grid">
        <section className="role-card-grid">
          {roles.map((role) => (
            <RealityRoleCard key={role.id} role={role} />
          ))}
        </section>

        <aside className="panel avatar-preview">
          <span className="eyebrow">实境舱三幕预览</span>
          <h2>从看JD到云试岗</h2>
          <div className="timeline-list">
            {scenes.map((scene, index) => {
              const role = roles.find((item) => item.type === scene.roleType);
              return (
                <div className="timeline-item done" key={scene.id}>
                  <span>第{index + 1}幕 · {roleLabels[scene.roleType]}</span>
                  <strong>{scene.title}</strong>
                  <p>{role?.name}：{scene.script.slice(0, 82)}...</p>
                </div>
              );
            })}
          </div>
          <div className="suggestion-card">
            比赛版默认使用视频/头像占位；未来可接入实时数字人API，但当前演示不依赖外部服务。
          </div>
        </aside>
      </div>
    </main>
  );
}

function RealityRoleCard({ role }: { role: RealityRole }) {
  const patch = (field: keyof RealityRole, value: string) => {
    updateRealityRole(role.id, { [field]: value });
  };

  return (
    <article className="panel role-card">
      <div className="role-card-head">
        <div className="avatar-orb small">{role.type === 'hr' ? 'HR' : role.type === 'teammate' ? '同' : '管'}</div>
        <div>
          <Badge tone={role.type === 'hr' ? 'blue' : role.type === 'teammate' ? 'purple' : 'green'}>{roleLabels[role.type]}</Badge>
          <h2>{role.name}</h2>
          <p>{role.title}</p>
        </div>
      </div>
      <label>
        名称
        <input value={role.name} onChange={(event) => patch('name', event.target.value)} />
      </label>
      <label>
        身份
        <input value={role.title} onChange={(event) => patch('title', event.target.value)} />
      </label>
      <label>
        语气
        <input value={role.tone} onChange={(event) => patch('tone', event.target.value)} />
      </label>
      <label>
        负责内容
        <textarea rows={3} value={role.responsibility} onChange={(event) => patch('responsibility', event.target.value)} />
      </label>
      <label>
        头像URL
        <input value={role.avatarImage ?? ''} onChange={(event) => patch('avatarImage', event.target.value)} />
      </label>
      <label>
        视频URL
        <input value={role.videoUrl ?? ''} onChange={(event) => patch('videoUrl', event.target.value)} />
      </label>
    </article>
  );
}
