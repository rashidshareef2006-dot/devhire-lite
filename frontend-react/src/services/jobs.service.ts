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

/** Build FormData from input + optional image */
function toFormData(input: Partial<CreateJobInput>, image?: File): FormData {
  const form = new FormData();
  Object.entries(input).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      form.append(k, String(v));
    }
  });
  if (image) form.append('image', image);
  return form;
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

  async create(input: CreateJobInput, image?: File): Promise<Job> {
    // If no image → plain JSON (faster + backward compatible)
    if (!image) {
      const { data } = await api.post<ApiListResponse<Job>>('/jobs', input);
      return data.data;
    }
    // With image → multipart/form-data
    const form = toFormData(input, image);
    const { data } = await api.post<ApiListResponse<Job>>('/jobs', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async update(id: string, input: Partial<CreateJobInput>, image?: File): Promise<Job> {
    if (!image) {
      const { data } = await api.put<ApiListResponse<Job>>(`/jobs/${id}`, input);
      return data.data;
    }
    const form = toFormData(input, image);
    const { data } = await api.put<ApiListResponse<Job>>(`/jobs/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/jobs/${id}`);
  },

  async apply(id: string, coverLetter?: string): Promise<void> {
    await api.post(`/jobs/${id}/apply`, { coverLetter });
  },

  async stats(): Promise<PublicStats> {
    const { data } = await api.get<ApiListResponse<PublicStats>>('/jobs/stats');
    return data.data;
  },

  deleteJob: (id: string) => api.delete(`/jobs/${id}`).then((r) => r.data),
};