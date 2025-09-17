// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import AuthPage from '@/components/auth/AuthPage';
import { MemoryRouter } from 'react-router-dom';

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue(true),
    register: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('AuthPage', () => {
  it('renders login form by default', () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    // Check Login tab is active
    const loginTab = screen.getByRole('tab', { name: /Login/i });
    expect(loginTab).toHaveAttribute('data-state', 'active');

    // Check Sign In button exists
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('register button', async () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    // Click Register tab
    fireEvent.click(screen.getByRole('tab', { name: /Register/i }));

  });

  it('login', async () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Invalid credentials/i)).not.toBeInTheDocument();
    });
  });

  // it('handles register success', async () => {
  //   render(
  //     <MemoryRouter>
  //       <AuthPage />
  //     </MemoryRouter>
  //   );

  //   // Switch tab
  //   fireEvent.click(screen.getByRole('tab', { name: /Register/i }));

  //   // Wait until "Create Account" button is rendered
  //   const createAccBtn = await screen.findByRole('button', { name: /Create Account/i });

  //   // Fill form
  //   fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'newuser' } });
  //   fireEvent.change(screen.getByTestId('reg-email'), { target: { value: 'test@example.com' } });
  //   fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'securepassword' } });

  //   // Submit
  //   fireEvent.click(createAccBtn);

  //   // Assert no error
  //   await waitFor(() => {
  //     expect(screen.queryByText(/Registration failed/i)).not.toBeInTheDocument();
  //   });
  // });



});
