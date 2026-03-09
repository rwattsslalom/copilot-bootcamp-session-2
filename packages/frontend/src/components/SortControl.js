import React from 'react';

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Newest first' },
  { value: 'created_asc', label: 'Oldest first' },
  { value: 'due_asc', label: 'Due date (soonest)' },
  { value: 'due_desc', label: 'Due date (latest)' },
  { value: 'name_asc', label: 'Title A–Z' },
  { value: 'name_desc', label: 'Title Z–A' },
];

function SortControl({ sortOrder, onSortChange }) {
  return (
    <div className="sort-control">
      <label htmlFor="sort-select">Sort by:</label>
      <select
        id="sort-select"
        value={sortOrder}
        onChange={(e) => onSortChange(e.target.value)}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SortControl;
