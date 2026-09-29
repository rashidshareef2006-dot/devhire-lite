import api from '@/lib/api';
import type { User } from '@/types';

export const usersService = {
  getProfile: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/profile');
    return data;
  },

  updateProfile: async (patch: Partial<User>): Promise<User> => {
    const { data } = await api.put<User>('/users/profile', patch);
    return data;
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const form = new FormData();
    form.append('avatar', file);
    const { data } = await api.post<User>('/users/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};