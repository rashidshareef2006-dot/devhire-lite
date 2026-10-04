// ═══════════════════════════════════════════════════════════
//  DevHire Lite — Shared TypeScript Types
// ═══════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
//  USER
// ─────────────────────────────────────────────
export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  company?: string | null;
  phone?: string | null;
  headline?: string | null;
  skills?: string[];
  website?: string | null;
  linkedin?: string | null;
  github?: string | null;
  resumeUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

// ─────────────────────────────────────────────
//  JOB
// ─────────────────────────────────────────────
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type WorkMode = 'ONSITE' | 'REMOTE' | 'HYBRID';
export type SalaryPeriod = 'YEARLY' | 'MONTHLY' | 'HOURLY';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  category: string;
  imageUrl?: string | null;    // ⬅️ NEW
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: string;
  description: string;
  requirements: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  postedById: string;

  postedBy?: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
  _count?: { applications: number };
}

// ─────────────────────────────────────────────
//  APPLICATION
// ─────────────────────────────────────────────
export type ApplicationStatus =
  | 'APPLIED'
  | 'IN_REVIEW'
  | 'INTERVIEW'
  | 'OFFERED'
  | 'REJECTED';

export interface Application {
  id: string;
  status: ApplicationStatus;
  coverLetter?: string | null;
  resumeUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  jobId: string;
  candidateId: string;

  // Relations
  candidate?: Pick<User, 'id' | 'name' | 'email' | 'avatar' | 'headline'>;
  job?: Job;
}

// ─────────────────────────────────────────────
//  SAVED JOB
// ─────────────────────────────────────────────
export interface SavedJob {
  id: string;
  createdAt: string;
  userId: string;
  jobId: string;
  job?: Job;
}

// ─────────────────────────────────────────────
//  MESSAGE / CHAT
// ─────────────────────────────────────────────
export interface Message {
  id: string;
  content: string;
  read: boolean;
  createdAt: string;
  senderId: string;
  receiverId: string;

  // Optional joins
  sender?: Pick<User, 'id' | 'name' | 'avatar'>;
  receiver?: Pick<User, 'id' | 'name' | 'avatar'>;
}

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  headline?: string | null;
  online?: boolean;
}

export interface Conversation {
  user: ChatUser;
  lastMessage: string;      // 👈 Message → string
  unreadCount: number;
  online?: boolean;         // 👈 YE ADD KARO
}

// ─────────────────────────────────────────────
//  ABOUT / PORTFOLIO
// ─────────────────────────────────────────────
export interface SocialLink {
  label: string;      // "GitHub", "LinkedIn", "Portfolio"
  url: string;
  icon?: string;
}

export interface AboutProject {
  title: string;
  description: string;
  techStack?: string[];
  liveUrl?: string;
  repoUrl?: string;
}

export interface AboutProfile {
  id: string;
  name: string;
  title: string;
  photoUrl?: string | null;
  location: string;
  email: string;
  bio: string;
  skills: string[];
  projects: AboutProject[];
  socialLinks: SocialLink[];
  education: string;
  educationUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
//  ADMIN STATS
// ─────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  usersByRole: Record<UserRole, number>;
}

// ─────────────────────────────────────────────
//  API RESPONSE WRAPPER (agar backend wrap karta hai)
// ─────────────────────────────────────────────
export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, string[]>;
  };
}