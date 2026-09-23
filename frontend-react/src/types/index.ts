export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Hybrid' | 'Remote';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  salary: string;
  salaryNum: number;
  tags: string[];
  description: string[];
  requirements: string[];
  posted: string;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: 'pending' | 'review' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}