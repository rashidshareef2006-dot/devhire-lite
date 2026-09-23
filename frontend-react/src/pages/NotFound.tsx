import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl mb-4">🔍</p>
        <h1 className="text-4xl font-bold text-indeed-ink">404</h1>
        <p className="text-slate-600 mt-3">Page not found</p>
        <Link to="/" className="inline-block mt-8 btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  );
}