import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

// Routes where footer is hidden
const HIDE_FOOTER_ROUTES = ['/messages'];

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const hideFooter = HIDE_FOOTER_ROUTES.some(
    (r) => location.pathname === r || location.pathname.startsWith(r + '/'),
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f9ff' }}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[#79d2f2] focus:text-[#001f28] focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
}