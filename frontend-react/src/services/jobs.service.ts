import api from '@/lib/api';
import type { Job } from '@/types';

interface ApiListResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface JobFilters {
  q?: string;
  category?: string;
  location?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface CreateJobInput {
  title: string;
  company: string;
  location: string;
  type: Job['type'];
  category: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  description: string;
  requirements: string;
}

export interface PublicStats {
  totalJobs: number;
  totalUsers: number;
  totalApplications: number;
  totalCompanies: number;
}

export const jobsService = {
  async list(
    filters: JobFilters = {},
  ): Promise<{ jobs: Job[]; pagination: ApiListResponse<Job[]>['pagination'] }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) params.append(k, String(v));
    });
    const qs = params.toString();
    const { data } = await api.get<ApiListResponse<Job[]>>(`/jobs${qs ? `?${qs}` : ''}`);
    return { jobs: data.data, pagination: data.pagination };
  },

  async get(id: string): Promise<Job> {
    const { data } = await api.get<ApiListResponse<Job>>(`/jobs/${id}`);
    return data.data;
  },

  async create(input: CreateJobInput): Promise<Job> {
    const { data } = await api.post<ApiListResponse<Job>>('/jobs', input);
    return data.data;
  },

  async update(id: string, input: Partial<CreateJobInput>): Promise<Job> {
    const { data } = await api.put<ApiListResponse<Job>>(`/jobs/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/jobs/${id}`);
  },

  async apply(id: string, coverLetter?: string): Promise<void> {
    await api.post(`/jobs/${id}/apply`, { coverLetter });
  },

  // 👇 NEW — homepage stats
  async stats(): Promise<PublicStats> {
    const { data } = await api.get<ApiListResponse<PublicStats>>('/jobs/stats');
    return data.data;
  },

  deleteJob: (id: string) =>
  api.delete(`/jobs/${id}`).then((r) => r.data),
};