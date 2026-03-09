import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SortControl from '../components/SortControl';

describe('SortControl', () => {
  test('renders the sort dropdown', () => {
    render(<SortControl sortOrder="created_desc" onSortChange={() => {}} />);
    expect(screen.getByLabelText('Sort by:')).toBeInTheDocument();
  });

  test('reflects the current sort order as selected option', () => {
    render(<SortControl sortOrder="name_asc" onSortChange={() => {}} />);
    const select = screen.getByRole('combobox');
    expect(select.value).toBe('name_asc');
  });

  test('calls onSortChange when a new option is selected', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<SortControl sortOrder="created_desc" onSortChange={handleChange} />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'name_asc');

    expect(handleChange).toHaveBeenCalledWith('name_asc');
  });

  test('renders all sort options', () => {
    render(<SortControl sortOrder="created_desc" onSortChange={() => {}} />);
    expect(screen.getByRole('option', { name: 'Newest first' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Oldest first' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Due date (soonest)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Due date (latest)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Title A–Z' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Title Z–A' })).toBeInTheDocument();
  });
});
