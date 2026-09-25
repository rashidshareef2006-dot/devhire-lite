import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  Briefcase,
  FileText,
  BarChart3,
  LogOut,
  Trash2,
  TrendingUp,
  UserCheck,
  Mail,
  Clock,
  MapPin,
} from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import {
  adminService,
  type AdminStats,
  type AdminUser,
  type AdminJob,
  type AdminApplication,
} from '@/services/admin.service';

type Tab = 'overview' | 'users' | 'jobs' | 'applications';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { username, logout } = useAdminStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: Tab;
    id: string;
    label: string;
  } | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, j, a] = await Promise.all([
        adminService.stats(),
        adminService.users(),
        adminService.jobs(),
        adminService.applications(),
      ]);
      setStats(s);
      setUsers(u);
      setJobs(j);
      setApplications(a);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'users') await adminService.deleteUser(deleteTarget.id);
      if (deleteTarget.type === 'jobs') await adminService.deleteJob(deleteTarget.id);
      if (deleteTarget.type === 'applications')
        await adminService.deleteApplication(deleteTarget.id);
      setDeleteTarget(null);
      await loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
  ];

  const formatDate = (iso: string | null) => {
    if (!iso) return 'Never';
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Top bar */}
      <header className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Admin Panel</p>
              <p className="text-xs text-slate-400">DevHire Lite</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden sm:inline">
              👤 <span className="text-slate-200 font-medium">{username}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-1.5 rounded-2xl bg-slate-900/50 border border-slate-800 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-32" />
            ))}
          </div>
        ) : (
          <>
            {/* ═══ OVERVIEW ═══ */}
            {tab === 'overview' && stats && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={Users}
                    label="Total Users"
                    value={stats.totalUsers}
                    sub={`${stats.totalCandidates} candidates · ${stats.totalRecruiters} recruiters`}
                    color="from-blue-500 to-cyan-500"
                  />
                  <StatCard
                    icon={Briefcase}
                    label="Total Jobs"
                    value={stats.totalJobs}
                    sub={`${stats.activeJobs} active`}
                    color="from-purple-500 to-pink-500"
                  />
                  <StatCard
                    icon={FileText}
                    label="Applications"
                    value={stats.totalApplications}
                    sub="all time"
                    color="from-orange-500 to-red-500"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Logins Today"
                    value={stats.loginsToday}
                    sub="last 24 hours"
                    color="from-green-500 to-emerald-500"
                  />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-blue-400" />
                      Recent Users
                    </h3>
                    <div className="space-y-3">
                      {users.slice(0, 4).map((u) => (
                        <div key={u.id} className="flex items-center gap-3 text-sm">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium truncate">{u.name}</p>
                            <p className="text-slate-400 text-xs truncate">{u.email}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-300">
                            {u.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-purple-400" />
                      Recent Jobs
                    </h3>
                    <div className="space-y-3">
                      {jobs.slice(0, 4).map((j) => (
                        <div key={j.id} className="flex items-center gap-3 text-sm">
                          <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium truncate">{j.title}</p>
                            <p className="text-slate-400 text-xs truncate">
                              {j.company} · {j._count.applications} apps
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══ USERS ═══ */}
            {tab === 'users' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <DataTable
                  headers={['Name', 'Email', 'Role', 'Last Login', 'Joined', 'Actions']}
                  rows={users.map((u) => [
                    <div key="n" className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{u.name}</span>
                    </div>,
                    <span key="e" className="text-slate-300 text-sm">
                      {u.email}
                    </span>,
                    <span
                      key="r"
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        u.role === 'RECRUITER'
                          ? 'bg-purple-500/20 text-purple-300'
                          : u.role === 'ADMIN'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {u.role}
                    </span>,
                    <span key="l" className="text-slate-400 text-xs">
                      {formatDate(u.lastLoginAt)}
                    </span>,
                    <span key="j" className="text-slate-400 text-xs">
                      {formatDate(u.createdAt)}
                    </span>,
                    <button
                      key="d"
                      onClick={() =>
                        setDeleteTarget({ type: 'users', id: u.id, label: u.email })
                      }
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>,
                  ])}
                />
              </motion.div>
            )}

            {/* ═══ JOBS ═══ */}
            {tab === 'jobs' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <DataTable
                  headers={['Title', 'Company', 'Posted By', 'Applications', 'Posted', 'Actions']}
                  rows={jobs.map((j) => [
                    <span key="t" className="text-white font-medium">
                      {j.title}
                    </span>,
                    <span key="c" className="text-slate-300 text-sm">
                      {j.company}
                    </span>,
                    <div key="p" className="text-sm">
                      <p className="text-white">{j.postedBy.name}</p>
                      <p className="text-xs text-slate-400">{j.postedBy.email}</p>
                    </div>,
                    <span
                      key="a"
                      className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs font-medium"
                    >
                      {j._count.applications}
                    </span>,
                    <span key="d" className="text-slate-400 text-xs">
                      {formatDate(j.createdAt)}
                    </span>,
                    <button
                      key="del"
                      onClick={() =>
                        setDeleteTarget({ type: 'jobs', id: j.id, label: j.title })
                      }
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>,
                  ])}
                />
              </motion.div>
            )}

            {/* ═══ APPLICATIONS ═══ */}
            {tab === 'applications' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {applications.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No applications yet</p>
                  </div>
                ) : (
                  <DataTable
                    headers={['Candidate', 'Email', 'Applied To', 'Status', 'Date', 'Actions']}
                    rows={applications.map((a) => [
                      <span key="n" className="text-white font-medium">
                        {a.candidate.name}
                      </span>,
                      <span key="e" className="text-slate-300 text-sm flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {a.candidate.email}
                      </span>,
                      <div key="j" className="text-sm">
                        <p className="text-white">{a.job.title}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {a.job.company} · {a.job.location}
                        </p>
                      </div>,
                      <span
                        key="s"
                        className="px-2 py-1 rounded-md bg-green-500/20 text-green-300 text-xs font-medium"
                      >
                        {a.status}
                      </span>,
                      <span key="d" className="text-slate-400 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(a.createdAt)}
                      </span>,
                      <button
                        key="del"
                        onClick={() =>
                          setDeleteTarget({
                            type: 'applications',
                            id: a.id,
                            label: `${a.candidate.name} → ${a.job.title}`,
                          })
                        }
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>,
                    ])}
                  />
                )}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Confirm Delete</h3>
            <p className="text-slate-400 text-sm text-center mb-6">
              Are you sure you want to permanently delete{' '}
              <span className="text-white font-medium">{deleteTarget.label}</span>? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ─── Sub components ───

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  sub: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition"
    >
      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
      <p className="text-xs text-slate-500 mt-2">{sub}</p>
    </motion.div>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              {headers.map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="text-center py-12 text-slate-500">
                  No records
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition"
                >
                  {row.map((cell, j) => (
                    <td key={j} className="px-5 py-4">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}