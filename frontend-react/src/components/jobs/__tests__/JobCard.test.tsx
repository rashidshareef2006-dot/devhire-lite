import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { JobCard } from '../JobCard';
import type { Job } from '@/types';

const mockJob: Job = {
  id: '1',
  title: 'Frontend Developer',
  company: 'TechNova',
  location: 'Remote',
  type: 'Full-time',
  salary: '₹8–12 LPA',
  salaryNum: 10,
  tags: ['React', 'TypeScript'],
  description: ['Job description'],
  requirements: ['Requirement 1'],
  posted: '2d ago',
  createdAt: new Date().toISOString(),
};

describe('JobCard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders job details', () => {
    renderWithProviders(<JobCard job={mockJob} />);

    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText(/technova/i)).toBeInTheDocument();
    expect(screen.getByText(/₹8–12 LPA/)).toBeInTheDocument();
  });

  it('renders all tags', () => {
    renderWithProviders(<JobCard job={mockJob} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('has a link to job detail page', () => {
    renderWithProviders(<JobCard job={mockJob} />);
    const link = screen.getByRole('link', { name: /view details/i });
    expect(link).toHaveAttribute('href', '/jobs/1');
  });

  it('toggles save on heart click', async () => {
    renderWithProviders(<JobCard job={mockJob} />);

    const heart = screen.getByRole('button', { name: /save job/i });
    expect(heart).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(heart);
    expect(heart).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(heart);
    expect(heart).toHaveAttribute('aria-pressed', 'false');
  });
});