// ─── User ───
export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  company?: string | null;
  createdAt: string;
  updatedAt?: string;
}

// ─── Job (matches backend Prisma model exactly) ───
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  category: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  description: string;
  requirements: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  postedById: string;
  postedBy?: {
    id: string;
    name: string;
    email?: string;
    company?: string | null;
  };
  _count?: { applications: number };
}

// ─── Application ───
export type ApplicationStatus =
  | 'APPLIED'
  | 'IN_REVIEW'
  | 'INTERVIEW'
  | 'OFFERED'
  | 'REJECTED';

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  coverLetter?: string | null;
  resumeUrl?: string | null;
  job?: Job;
  candidate?: User;
  createdAt: string;
  updatedAt: string;
}

// ─── SavedJob ───
export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  job?: Job;
  createdAt: string;
}
// ─── Message ───
export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  read: boolean;
  createdAt: string;
  sender?: Pick<User, 'id' | 'name' | 'email'>;
  receiver?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface Conversation {
  user: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  online: boolean;
}

export type ChatUser = Pick<User, 'id' | 'name' | 'email' | 'role'>;