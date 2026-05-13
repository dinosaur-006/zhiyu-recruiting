import { NavLink, Outlet } from 'react-router-dom';
import { useDemoState } from '../../store/demoStore';

const navItems = [
  { to: '/hr', label: '工作台', end: true },
  { to: '/hr/jobs', label: '职位管理' },
  { to: '/hr/candidates', label: '候选人' },
  { to: '/hr/analytics', label: '数据看板' },
  { to: '/hr/settings', label: '设置' },
];

export function HrLayout() {
  const state = useDemoState();

  return (
    <div className="hr-shell">
      <aside className="hr-sidebar">
        <div className="brand-lockup small">
          <div className="logo-mark">职</div>
          <div>
            <strong>职遇</strong>
            <span>HR Console</span>
          </div>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="hr-main">
        <header className="hr-topbar">
          <div>
            <span className="eyebrow">演示企业</span>
            <strong>{state.company.name}</strong>
          </div>
          <div className="topbar-pill">AI辅助分析 · 人工复核</div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
