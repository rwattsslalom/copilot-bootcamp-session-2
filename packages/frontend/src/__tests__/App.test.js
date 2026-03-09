import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const MOCK_ITEMS = [
  {
    id: 1,
    name: 'Test Item 1',
    description: null,
    due_date: null,
    completed: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    sub_tasks: [],
  },
  {
    id: 2,
    name: 'Test Item 2',
    description: 'A description',
    due_date: '2026-12-31',
    completed: 0,
    created_at: '2026-01-02T00:00:00.000Z',
    sub_tasks: [],
  },
];

// Mock server to intercept API requests
const server = setupServer(
  rest.get('/api/items', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(MOCK_ITEMS));
  }),

  rest.post('/api/items', (req, res, ctx) => {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: 'Item name is required' }));
    }

    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        name,
        description: req.body.description || null,
        due_date: req.body.due_date || null,
        completed: 0,
        created_at: new Date().toISOString(),
        sub_tasks: [],
      })
    );
  }),

  rest.delete('/api/items/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: 'Item deleted successfully', id: parseInt(req.params.id) })
    );
  }),

  rest.put('/api/items/:id', (req, res, ctx) => {
    const base = MOCK_ITEMS.find((i) => i.id === parseInt(req.params.id)) || MOCK_ITEMS[0];
    return res(ctx.status(200), ctx.json({ ...base, ...req.body, sub_tasks: [] }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('To Do App')).toBeInTheDocument();
    expect(screen.getByText('Keep track of your tasks')).toBeInTheDocument();
  });

  test('loads and displays items', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText('Loading data...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });
  });

  test('displays due date when present', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Due: 2026-12-31')).toBeInTheDocument();
    });
  });

  test('displays description when present', async () => {
    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('A description')).toBeInTheDocument();
    });
  });

  test('adds a new item', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Task name');
    await user.type(input, 'New Task');
    await user.click(screen.getByRole('button', { name: 'Add Task' }));

    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  test('deletes an item', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });

    // Sorted newest-first by default; Test Item 2 (id:2) renders first
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Test Item 2')).not.toBeInTheDocument();
    });
  });

  test('shows error message on fetch failure', async () => {
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    await act(async () => {
      render(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/)).toBeInTheDocument();
    });
  });
});