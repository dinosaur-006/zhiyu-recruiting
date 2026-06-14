import { useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Briefcase, Users, BarChart3, Settings, Shield, Eye } from 'lucide-react';
import { useDemoState } from '../../store/demoStore';

const navItems = [
  { to: '/hr', label: '工作台', icon: LayoutDashboard, end: true },
  { to: '/hr/jobs', label: '职位管理', icon: Briefcase },
  { to: '/hr/candidates', label: '候选人', icon: Users },
  { to: '/hr/analytics', label: '数据看板', icon: BarChart3 },
  { to: '/hr/settings', label: '设置', icon: Settings },
];

export function HrLayout() {
  const state = useDemoState();

  useEffect(() => {
    // Lucid Organic — :root is default
  }, []);

  return (
    <div className="hr-shell">
      <aside className="hr-sidebar">
        <div className="brand-lockup small">
          <div className="logo-mark">
            <Sparkles size={18} strokeWidth={1.5} />
          </div>
          <div>
            <strong>职遇</strong>
            <span>HR Console</span>
          </div>
        </div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCandidates = item.label === '候选人';
            return (
              <NavLink key={item.to} to={item.to} end={item.end}>
                <Icon size={18} strokeWidth={1.5} />
                {item.label}
                {isCandidates && (
                  <span className="nav-count-badge">{state.candidates.length}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="hr-main">
        <header className="hr-topbar">
          <div>
            <span className="eyebrow">演示企业</span>
            <strong>{state.company.name}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to={`/candidate/job/${state.jobs[0]?.id}`} className="mini-link" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Eye size={13} strokeWidth={1.5} />
              预览候选人端
            </Link>
            <div className="topbar-pill badge-dot dot-green">
              <Shield size={12} strokeWidth={1.5} />
              AI辅助分析 人工复核
            </div>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
