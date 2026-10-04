import { Link } from 'react-router-dom';

const FOOTER_LINKS = {
  'For Candidates': [
    { to: '/jobs',      label: 'Browse Jobs' },
    { to: '/saved',     label: 'Saved Jobs' },
    { to: '/register',  label: 'Create Account' },
  ],
  'For Recruiters': [
    { to: '/post-job',  label: 'Post a Job' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/register',  label: 'Start Hiring' },
  ],
  'Company': [
    { to: '/about',     label: 'About' },
    { to: '/messages',  label: 'Contact' },
    { to: '/about',     label: 'Privacy' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-nav text-white/70 mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shadow-[0_0_0_3px_rgba(249,115,22,0.15)]">
                <span
                  className="material-symbols-outlined text-white text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  work
                </span>
              </div>
              <span className="text-white font-bold text-[18px] tracking-tight">
                DevHire<span className="text-brand">Lite</span>
              </span>
            </Link>
            <p className="text-[13px] leading-relaxed text-white/50">
              Find elite developer roles faster. Connect talent with the teams building the future.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-brand">
                Live Platform
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-[13px] font-semibold text-white uppercase tracking-wider mb-4">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map(({ to, label }) => (
                  <li key={to + label}>
                    <Link
                      to={to}
                      className="text-[13px] text-white/50 hover:text-brand transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            to="/admin/login"
            className="text-[12px] text-white/30 hover:text-brand transition-colors"
          >
            © 2025 DevHire Lite. All rights reserved.
          </Link>
          <span className="text-[12px] text-white/30">
            Built with precision &amp; care.
          </span>
        </div>
      </div>
    </footer>
  );
}