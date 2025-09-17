// src/components/dashboard/__tests__/Dashboard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { vi } from 'vitest';

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { username: 'testuser' },
    logout: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: { id: 1, title: 'Test Task', description: 'Desc', status: 'todo', created_at: '', updated_at: '' } })),
    put: vi.fn(() => Promise.resolve({ data: { id: 1, title: 'Updated Task', description: 'Desc', status: 'completed', created_at: '', updated_at: '' } })),
    delete: vi.fn(() => Promise.resolve({})),
  },
}));

describe('Dashboard', () => {
  it('renders user greeting', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Welcome back, testuser/i)).toBeInTheDocument();
  });

  it('renders "Create Task" button when no tasks', async () => {
    render(<Dashboard />);
    const createBtn = await screen.findByRole('button', { name: /Create Task/i });
    expect(createBtn).toBeInTheDocument();
  });

  it('opens task dialog when clicking "New Task"', async () => {
    render(<Dashboard />);
    const newTaskBtn = screen.getByRole('button', { name: /New Task/i });
    fireEvent.click(newTaskBtn);

    // Dialog content should appear
    await waitFor(() => {
      expect(screen.getByText(/Add a new task to your list. Fill in the details below./i)).toBeInTheDocument();
    });
  });

  it('create a task', async() => {
    render(<Dashboard/>);
    // click on new task
    const newTaskBtn = screen.getByRole('button', { name: /New Task/i });
    fireEvent.click(newTaskBtn);
    await waitFor(() => {
      screen.getByText(/Add a new task to your list. Fill in the details below./i);
    });
    
    //Title
    fireEvent.change(screen.getByLabelText(/Title/i), {target: {value: 'test task'}});
    //Description
    fireEvent.change(screen.getByLabelText(/Description/i), {target: {value: 'test task description'}});
    //Status

    //Due Date

    //Create task
    const createTaskBtn = screen.getByRole('button', { name: /Create Task/i });
    fireEvent.click(createTaskBtn);
    await waitFor(() => {
    expect(screen.getByText(/Welcome back, testuser!/i)).toBeInTheDocument();
    });
  });

});
