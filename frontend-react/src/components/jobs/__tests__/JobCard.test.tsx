import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { JobCard } from '../JobCard';
import type { Job } from '@/types';

const mockJob: Job = {
  id: 'job-1',
  title: 'Senior React Developer',
  company: 'TechCorp',
  location: 'Bangalore, India',
  type: 'FULL_TIME',              // 👈 enum value
  category: 'Frontend',
  description: 'Build amazing UIs',   // 👈 string, array nahi
  requirements: 'React, TypeScript', // 👈 string, array nahi
  currency: 'INR',
  salaryMin: 800000,
  salaryMax: 1500000,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  postedById: 'user-1',
};

describe('JobCard', () => {
  it('renders job title and company', () => {
    const { getByText } = renderWithProviders(<JobCard job={mockJob} />);
    expect(getByText('Senior React Developer')).toBeInTheDocument();
    expect(getByText(/TechCorp/)).toBeInTheDocument();
  });
});