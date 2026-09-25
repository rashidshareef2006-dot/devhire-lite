import adminApi from '@/lib/adminApi';

export interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalCandidates: number;
  totalRecruiters: number;
  activeJobs: number;
  loginsToday: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
  company: string | null;
  location: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  _count: { jobs: number; applications: number; savedJobs: number };
}

export interface AdminJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  isActive: boolean;
  createdAt: string;
  postedBy: { id: string; name: string; email: string };
  _count: { applications: number };
}

export interface AdminApplication {
  id: string;
  status: string;
  coverLetter: string | null;
  resumeUrl: string | null;
  createdAt: string;
  job: { id: string; title: string; company: string; location: string };
  candidate: { id: string; name: string; email: string };
}

interface ApiRes<T> {
  success: boolean;
  data: T;
}

export const adminService = {
  login: (username: string, password: string) =>
    adminApi
      .post<ApiRes<{ token: string; username: string; expiresIn: string }>>(
        '/admin/login',
        { username, password },
      )
      .then((r) => r.data.data),

  stats: () => adminApi.get<ApiRes<AdminStats>>('/admin/stats').then((r) => r.data.data),

  users: () => adminApi.get<ApiRes<AdminUser[]>>('/admin/users').then((r) => r.data.data),

  jobs: () => adminApi.get<ApiRes<AdminJob[]>>('/admin/jobs').then((r) => r.data.data),

  applications: () =>
    adminApi.get<ApiRes<AdminApplication[]>>('/admin/applications').then((r) => r.data.data),

  deleteUser: (id: string) => adminApi.delete(`/admin/users/${id}`),
  deleteJob: (id: string) => adminApi.delete(`/admin/jobs/${id}`),
  deleteApplication: (id: string) => adminApi.delete(`/admin/applications/${id}`),
};