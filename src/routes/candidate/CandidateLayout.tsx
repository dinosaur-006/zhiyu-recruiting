import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const pageTransitionFast = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function CandidateLayout() {
  const location = useLocation();
  const isChat = location.pathname.includes('/chat/');
  const isSuccess = location.pathname.includes('/success/');

  // Chat and Success have their own immersive backgrounds, no topbar needed
  const hideTopbar = isChat || isSuccess;

  return (
    <div className="cr-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!hideTopbar && <CandidateTopBar />}
      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            {...(hideTopbar ? pageTransitionFast : pageTransition)}
            transition={{ duration: hideTopbar ? 0.15 : 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function CandidateTopBar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Determine context for the back/close link
  const isHome = location.pathname === '/candidate' || location.pathname === '/candidate/';
  const isProfile = location.pathname.includes('/profile/');
  const isJobDetail = location.pathname.includes('/job/');
  const isStory = location.pathname.includes('/story/');

  return (
    <header
      className="cr-topbar"
      style={{
        boxShadow: scrolled ? '0 1px 3px rgba(30, 41, 59, 0.06)' : 'none',
        borderBottomColor: scrolled ? 'var(--cr-border)' : 'var(--cr-border-light)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
    >
      <Link to="/" className="cr-topbar-brand" aria-label="回到首页">
        <div className="cr-topbar-logo">遇</div>
        智遇
      </Link>

      <div className="cr-topbar-actions">
        {!isHome && (
          <Link
            to={isProfile || isStory ? '/candidate' : '/candidate'}
            className="cr-topbar-link"
            style={{ fontSize: 13 }}
          >
            ← 返回岗位列表
          </Link>
        )}
        {isJobDetail && (
          <span style={{ fontSize: 12, color: 'var(--cr-muted)', fontFamily: 'var(--cr-font-mono)' }}>
            v3.0
          </span>
        )}
      </div>
    </header>
  );
}
