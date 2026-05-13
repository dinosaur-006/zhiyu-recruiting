import { Link, Outlet } from 'react-router-dom';

export function CandidateLayout() {
  return (
    <div className="candidate-shell">
      <header className="candidate-top">
        <Link to="/" className="candidate-brand">
          <span>职</span>
          职遇岗位预体验
        </Link>
        <Link to="/hr" className="mini-link">HR端</Link>
      </header>
      <Outlet />
    </div>
  );
}
