import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { useAuthStore } from '@/store/useAuthStore';

const navItems = [
  { to: '/jobs',      label: 'Find Job',  exact: false },
  { to: '/messages',  label: 'Messages',  exact: false },
  { to: '/dashboard', label: 'Dashboard', exact: false },
  { to: '/about',     label: 'About',     exact: false },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen]     = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { toast }  = useToast();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate   = useNavigate();

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast('Logged out successfully', 'success');
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const getAvatarSrc = () => {
    if (!user?.avatar) return null;
    return user.avatar.startsWith('http')
      ? user.avatar
      : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${user.avatar}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#171819] text-white shadow-[0_1px_0_rgba(255,255,255,0.06)]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">

          {/* ── Logo ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[#79d2f2] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#001f28] text-lg">work</span>
              </div>
              <span className="text-white font-semibold text-[18px] leading-6 tracking-tight hidden sm:block">
                DevHire<span className="text-[#79d2f2]">Lite</span>
              </span>
            </Link>

            {/* ── Desktop nav ────────────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'text-[14px] font-semibold leading-[18px] tracking-[0.01em] transition-colors relative',
                      isActive
                        ? 'text-[#79d2f2] after:content-[\'\'] after:absolute after:bottom-[-22px] after:left-0 after:right-0 after:h-[2px] after:bg-[#79d2f2]'
                        : 'text-white/70 hover:text-white',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {isAuthenticated && (user?.role === 'RECRUITER' || user?.role === 'ADMIN') ? (
                <NavLink
                  to="/post-job"
                  className={({ isActive }) =>
                    cn(
                      'text-[14px] font-semibold leading-[18px] tracking-[0.01em] transition-colors relative',
                      isActive
                        ? 'text-[#79d2f2] after:content-[\'\'] after:absolute after:bottom-[-22px] after:left-0 after:right-0 after:h-[2px] after:bg-[#79d2f2]'
                        : 'text-white/70 hover:text-white',
                    )
                  }
                >
                  Hiring
                </NavLink>
              ) : null}
            </nav>
          </div>

          {/* ── Right side ───────────────────────────────────────── */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Notification bell */}
            {isAuthenticated && (
              <button
                type="button"
                aria-label="Notifications"
                className="relative p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a]" />
              </button>
            )}

            {isAuthenticated && user ? (
              /* ── User avatar / dropdown ──────────────────────── */
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 pl-1 rounded-full hover:bg-white/10 transition-colors pr-2 py-1"
                >
                  <div className="p-[1.5px] rounded-full ring-2 ring-[#79d2f2]/40">
                    <div className="w-7 h-7 rounded-full bg-[#252629] flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                      {getAvatarSrc() ? (
                        <img src={getAvatarSrc()!} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#79d2f2]">{user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[13px] font-medium text-white/90 hidden sm:block max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <span className="material-symbols-outlined text-sm text-white/50">expand_more</span>
                </button>

                {isUserMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-[0_16px_36px_rgba(23,24,25,0.12)] border border-[#d9dce1] overflow-hidden animate-fade-up z-50"
                  >
                    <div className="px-4 py-3 border-b border-[#d9dce1]">
                      <p className="text-[13px] font-semibold text-[#181c21] truncate">{user.name}</p>
                      <p className="text-[12px] text-[#75777a] truncate">{user.email}</p>
                    </div>
                    {[
                      { to: '/profile',   icon: 'person',          label: 'My Profile' },
                      { to: '/dashboard', icon: 'dashboard',       label: 'Dashboard' },
                      { to: '/messages',  icon: 'chat_bubble',     label: 'Messages' },
                      { to: '/saved',     icon: 'bookmark',        label: 'Saved Jobs' },
                      { to: '/about',     icon: 'info',            label: 'About' },
                    ].map(({ to, icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#181c21] hover:bg-[#f0f4fc] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-[#75777a]">{icon}</span>
                        {label}
                      </Link>
                    ))}
                    <div className="border-t border-[#d9dce1]">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-[#ba1a1a] hover:bg-[#ffdad6]/30 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Auth buttons ──────────────────────────────────── */
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-[13px] font-semibold text-white/80 hover:text-white border border-white/20 rounded-lg hover:border-white/40 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-[13px] font-semibold bg-[#79d2f2] text-[#001f28] rounded-lg hover:bg-[#b7eaff] transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* ── Mobile hamburger ─────────────────────────────── */}
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ──────────────────────────────────────── */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#1E2024] border-t border-white/10 animate-fade-up">
          <nav className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors',
                    isActive
                      ? 'bg-[#79d2f2]/10 text-[#79d2f2]'
                      : 'text-white/70 hover:text-white hover:bg-white/10',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="pt-3 border-t border-white/10 space-y-1">
              {isAuthenticated && user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    My Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#ba1a1a] hover:bg-white/10 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold border border-white/20 text-white/80 hover:border-white/40 hover:text-white transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold bg-[#79d2f2] text-[#001f28] hover:bg-[#b7eaff] transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}