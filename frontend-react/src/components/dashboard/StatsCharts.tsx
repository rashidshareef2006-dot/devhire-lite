import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { MotionCard } from '../common/MotionCard';

const applicationTrend = [
  { month: 'Jul', applications: 12, interviews: 2 },
  { month: 'Aug', applications: 18, interviews: 4 },
  { month: 'Sep', applications: 24, interviews: 6 },
  { month: 'Oct', applications: 31, interviews: 8 },
  { month: 'Nov', applications: 28, interviews: 7 },
  { month: 'Dec', applications: 42, interviews: 11 },
];

const jobsByCategory = [
  { category: 'Frontend', count: 24 },
  { category: 'Backend', count: 18 },
  { category: 'Full-Stack', count: 15 },
  { category: 'DevOps', count: 9 },
  { category: 'Mobile', count: 7 },
];

const statusBreakdown = [
  { name: 'Applied', value: 42, color: '#003A9B' },
  { name: 'In Review', value: 18, color: '#2557A7' },
  { name: 'Interview', value: 8, color: '#22c55e' },
  { name: 'Rejected', value: 12, color: '#ef4444' },
];

export function StatsCharts() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <MotionCard className="p-6 lg:col-span-2" hover={false}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Application Activity
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={applicationTrend}>
            <defs>
              <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#003A9B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#003A9B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
            <Area type="monotone" dataKey="applications" stroke="#003A9B" strokeWidth={2} fill="url(#colorApps)" />
            <Area type="monotone" dataKey="interviews" stroke="#22c55e" strokeWidth={2} fillOpacity={0} />
          </AreaChart>
        </ResponsiveContainer>
      </MotionCard>

      <MotionCard className="p-6" hover={false}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Jobs by Category
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={jobsByCategory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <Bar dataKey="count" fill="#003A9B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </MotionCard>

      <MotionCard className="p-6" hover={false}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Status Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={statusBreakdown}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
            >
              {statusBreakdown.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </MotionCard>
    </div>
  );
}