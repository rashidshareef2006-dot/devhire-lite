import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-indeed-ink text-slate-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-bold text-white text-lg">🚀 DevHire Lite</p>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Find developer jobs, faster. Hire the best talent, faster.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-3">For Candidates</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/jobs" className="hover:text-white transition">Browse Jobs</Link></li>
            <li><a href="#" className="hover:text-white transition">Companies</a></li>
            <li><a href="#" className="hover:text-white transition">Salary Guide</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-3">For Recruiters</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition">Post a Job</a></li>
            <li><a href="#" className="hover:text-white transition">Pricing</a></li>
            <li><Link to="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-3">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition">About</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy</a></li>
            <li><a href="#" className="hover:text-white transition">Contact</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        <Link
  to="/admin/login"
  className="hover:text-indeed-blue dark:hover:text-indigo-400 transition-colors cursor-pointer"
>
  © 2025 DevHire Lite. Built with ❤️
</Link>
      </div>
    </footer>
  );
}