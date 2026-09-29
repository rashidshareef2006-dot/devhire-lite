import api from '@/lib/api';
import adminApi from '@/lib/adminApi';
import type { AboutProfile } from '@/types';

interface ApiRes<T> {
  success: boolean;
  data: T;
}

export const aboutService = {
  get: () => api.get<ApiRes<AboutProfile>>('/about').then((r) => r.data.data),

  update: (data: Partial<AboutProfile>) =>
    adminApi.put<ApiRes<AboutProfile>>('/admin/about', data).then((r) => r.data.data),
};