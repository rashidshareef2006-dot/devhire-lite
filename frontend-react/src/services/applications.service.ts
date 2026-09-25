import api from '@/lib/api';
import type { Application, Job } from '@/types';

interface ApiRes<T> {
  success: boolean;
  data: T;
}

export const applicationsService = {
  // Candidate: my applications
  mine: () =>
    api.get<ApiRes<Application[]>>('/applications/me').then((r) => r.data.data),

  // Recruiter: applications on my posted jobs
  received: () =>
    api.get<ApiRes<Application[]>>('/applications/received').then((r) => r.data.data),

  // Recruiter: my posted jobs
  myJobs: () =>
    api.get<ApiRes<Job[]>>('/applications/my-jobs').then((r) => r.data.data),
};