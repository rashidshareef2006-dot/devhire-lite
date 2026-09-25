import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '../Input';

describe('Input', () => {
  it('renders label and input', () => {
    render(<Input label="Email" name="email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input label="Email" name="email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('shows hint when no error', () => {
    render(<Input label="Password" name="password" hint="Min 6 chars" />);
    expect(screen.getByText('Min 6 chars')).toBeInTheDocument();
  });

  it('hides hint when error exists', () => {
    render(
      <Input
        label="Password"
        name="password"
        hint="Min 6 chars"
        error="Too short"
      />,
    );
    expect(screen.queryByText('Min 6 chars')).not.toBeInTheDocument();
    expect(screen.getByText('Too short')).toBeInTheDocument();
  });

  it('marks aria-invalid when error', () => {
    render(<Input label="Email" name="email" error="Required" />);
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows required asterisk', () => {
    render(<Input label="Name" name="name" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});