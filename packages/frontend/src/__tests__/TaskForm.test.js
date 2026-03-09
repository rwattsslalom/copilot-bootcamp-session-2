import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../components/TaskForm';

describe('TaskForm', () => {
  test('renders with empty fields by default', () => {
    render(<TaskForm onSubmit={() => {}} />);
    expect(screen.getByPlaceholderText('Task name')).toHaveValue('');
    expect(screen.getByPlaceholderText('Description (optional)')).toHaveValue('');
  });

  test('renders with initialValues pre-filled', () => {
    const initial = { name: 'Go jogging', description: 'Morning run', due_date: '2026-06-01' };
    render(<TaskForm onSubmit={() => {}} initialValues={initial} />);
    expect(screen.getByPlaceholderText('Task name')).toHaveValue('Go jogging');
    expect(screen.getByPlaceholderText('Description (optional)')).toHaveValue('Morning run');
    expect(screen.getByTitle('Due date (optional)')).toHaveValue('2026-06-01');
  });

  test('uses custom submit label', () => {
    render(<TaskForm onSubmit={() => {}} submitLabel="Save Changes" />);
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  test('calls onSubmit with form values when submitted', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();

    render(<TaskForm onSubmit={handleSubmit} />);

    await user.type(screen.getByPlaceholderText('Task name'), 'Buy milk');
    await user.type(screen.getByPlaceholderText('Description (optional)'), 'Full fat');
    await user.click(screen.getByRole('button', { name: 'Add Task' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Buy milk',
      description: 'Full fat',
      due_date: null,
    });
  });

  test('does not submit when name is empty', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();

    render(<TaskForm onSubmit={handleSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Add Task' }));

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  test('shows cancel button and calls onCancel when clicked', async () => {
    const user = userEvent.setup();
    const handleCancel = jest.fn();

    render(<TaskForm onSubmit={() => {}} onCancel={handleCancel} />);

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    expect(cancelBtn).toBeInTheDocument();
    await user.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalled();
  });

  test('does not show cancel button when onCancel is not provided', () => {
    render(<TaskForm onSubmit={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });
});
