import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/contexts/ThemeContext';

const navItems = [
  { to: '/jobs',      label: 'Find Jobs', icon: 'search',      exact: false },
  { to: '/messages',  label: 'Messages',  icon: 'chat_bubble', exact: false },
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard',   exact: false },
  { to: '/about',     label: 'About',     icon: 'info',        exact: false },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen]         = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { toast }  = useToast();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
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

  const isRecruiter = isAuthenticated && (user?.role === 'RECRUITER' || user?.role === 'ADMIN');

  return (
    <header className="sticky top-0 z-40 w-full nav-shell shadow-[0_1px_0_rgba(255,255,255,0.06)]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="h-16 flex items-center gap-3">

          {/* ── Logo ───────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shadow-[0_0_0_3px_rgba(249,115,22,0.15)]">
              <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                work
              </span>
            </div>
            <span className="text-white font-bold text-[18px] leading-6 tracking-tight hidden sm:block">
              DevHire<span className="text-brand">Lite</span>
            </span>
          </Link>

          {/* ── Nav pills (Gotwo style) ────────────────────── */}
          <nav className="hidden md:flex items-center gap-1 ml-2" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold leading-none transition-all',
                    isActive
                      ? 'bg-brand text-white shadow-[0_4px_12px_rgba(249,115,22,0.35)]'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </NavLink>
            ))}
            {isRecruiter && (
              <NavLink
                to="/post-job"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold leading-none transition-all',
                    isActive
                      ? 'bg-brand text-white shadow-[0_4px_12px_rgba(249,115,22,0.35)]'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span className="hidden lg:inline">Post Job</span>
              </NavLink>
            )}
          </nav>

          {/* ── Location pill (center, Gotwo style) ────────── */}
          <button
            type="button"
            className="hidden xl:flex items-center gap-2 ml-3 px-3 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[12.5px] text-white/90 transition-colors max-w-[200px]"
          >
            <span className="material-symbols-outlined text-[18px] text-brand">location_on</span>
            <span className="truncate">Bangalore, India</span>
            <span className="material-symbols-outlined text-[16px] text-white/40">expand_more</span>
          </button>

          {/* ── Right cluster ──────────────────────────────── */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">

            {/* Theme toggle */}
            <button
              type="button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              onClick={toggleTheme}
              className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Notification bell */}
            {isAuthenticated && (
              <button
                type="button"
                aria-label="Notifications"
                className="relative p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger ring-2 ring-nav" />
              </button>
            )}

            {isAuthenticated && user ? (
              /* ── User avatar / dropdown ─────────────────── */
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 pl-1 rounded-full hover:bg-white/10 transition-colors pr-2 py-1"
                >
                  <div className="p-[1.5px] rounded-full ring-2 ring-brand/50">
                    <div className="w-7 h-7 rounded-full bg-nav-elev flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                      {getAvatarSrc() ? (
                        <img src={getAvatarSrc()!} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-brand">{user.name.charAt(0).toUpperCase()}</span>
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
                    className="absolute right-0 mt-3 w-56 bg-surface rounded-2xl shadow-[0_16px_36px_rgba(23,24,25,0.18)] border border-line overflow-hidden animate-fade-up z-50"
                  >
                    <div className="px-4 py-3 border-b border-line">
                      <p className="text-[13px] font-semibold text-ink truncate">{user.name}</p>
                      <p className="text-[12px] text-ink-mute truncate">{user.email}</p>
                    </div>
                    {[
                      { to: '/profile',   icon: 'person',      label: 'My Profile' },
                      { to: '/dashboard', icon: 'dashboard',   label: 'Dashboard' },
                      { to: '/messages',  icon: 'chat_bubble', label: 'Messages' },
                      { to: '/saved',     icon: 'bookmark',    label: 'Saved Jobs' },
                      { to: '/about',     icon: 'info',        label: 'About' },
                    ].map(({ to, icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-ink hover:bg-soft transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-ink-mute">{icon}</span>
                        {label}
                      </Link>
                    ))}
                    <div className="border-t border-line">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-danger hover:bg-danger-soft transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Auth buttons ───────────────────────────── */
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-[13px] font-semibold text-white/80 hover:text-white border border-white/20 rounded-full hover:border-white/40 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-[13px] font-semibold bg-brand text-white rounded-full hover:bg-brand-hover transition-colors shadow-[0_4px_12px_rgba(249,115,22,0.35)]"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* ── Mobile hamburger ─────────────────────────── */}
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────── */}
      {isMenuOpen && (
        <div className="md:hidden bg-nav-elev border-t border-white/10 animate-fade-up">
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
                      ? 'bg-brand/15 text-brand'
                      : 'text-white/70 hover:text-white hover:bg-white/10',
                  )
                }
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}

            {/* Mobile theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>

            <div className="pt-3 border-t border-white/10 space-y-1">
              {isAuthenticated && user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    My Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-medium text-danger hover:bg-white/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
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
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold bg-brand text-white hover:bg-brand-hover transition-colors"
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