import { useState } from 'react';
import { Badge } from '@/components/common/Badge';

type Tab = 'candidate' | 'recruiter';

export function Dashboard() {
  const [tab, setTab] = useState<Tab>('candidate');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indeed-ink">Dashboard</h1>
        <p className="text-slate-600 mt-1">Here's what's happening with your applications</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setTab('candidate')}
          className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition ${
            tab === 'candidate'
              ? 'border-indeed-blue text-indeed-blue'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Candidate View
        </button>
        <button
          onClick={() => setTab('recruiter')}
          className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 transition ${
            tab === 'recruiter'
              ? 'border-indeed-blue text-indeed-blue'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Recruiter View
        </button>
      </div>

      {tab === 'candidate' ? <CandidateView /> : <RecruiterView />}
    </div>
  );
}

function CandidateView() {
  const stats = [
    { label: 'Applications', value: '12', color: 'text-indeed-ink' },
    { label: 'Shortlisted', value: '3', color: 'text-green-600' },
    { label: 'In Review', value: '5', color: 'text-amber-600' },
    { label: 'Rejected', value: '4', color: 'text-slate-400' },
  ];

  const apps = [
    { job: 'Frontend Developer', company: 'TechNova', applied: '2 days ago', status: 'shortlisted' as const },
    { job: 'Backend Engineer', company: 'DataFlow', applied: '5 days ago', status: 'review' as const },
    { job: 'UI Engineer', company: 'PixelCraft', applied: '1 week ago', status: 'rejected' as const },
  ];

  const statusVariant = {
    shortlisted: 'success',
    review: 'warning',
    rejected: 'default',
    pending: 'info',
    hired: 'success',
  } as const;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-5 rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-indeed-ink">Recent Applications</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-6 py-3 font-medium">Job</th>
              <th className="px-6 py-3 font-medium">Company</th>
              <th className="px-6 py-3 font-medium">Applied</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {apps.map((a) => (
              <tr key={a.job}>
                <td className="px-6 py-4 font-medium">{a.job}</td>
                <td className="px-6 py-4 text-slate-600">{a.company}</td>
                <td className="px-6 py-4 text-slate-600">{a.applied}</td>
                <td className="px-6 py-4">
                  <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function RecruiterView() {
  const jobs = [
    { title: 'Frontend Developer', posted: '2 days ago', apps: 14 },
    { title: 'Backend Engineer', posted: '5 days ago', apps: 24 },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500">Posted Jobs</p>
          <p className="text-2xl font-bold text-indeed-ink mt-1">4</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500">Applications</p>
          <p className="text-2xl font-bold text-indeed-blue mt-1">38</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500">Shortlisted</p>
          <p className="text-2xl font-bold text-green-600 mt-1">7</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-500">Closed</p>
          <p className="text-2xl font-bold text-slate-400 mt-1">1</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-5">
        <h2 className="font-semibold text-indeed-ink text-lg">Your Job Posts</h2>
        <button className="btn-primary text-sm">+ Post New Job</button>
      </div>

      <div className="grid gap-4">
        {jobs.map((j) => (
          <div
            key={j.title}
            className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-start gap-4"
          >
            <div>
              <h3 className="font-semibold text-indeed-ink">{j.title}</h3>
              <p className="text-sm text-slate-600 mt-1">
                Posted {j.posted} · {j.apps} applications
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50">
                Edit
              </button>
              <button className="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}