import React, { useMemo } from 'react';
import TaskItem from './TaskItem';
import SortControl from './SortControl';

function sortItems(items, sortOrder) {
  const sorted = [...items];
  switch (sortOrder) {
    case 'created_asc':
      return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    case 'created_desc':
      return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    case 'due_asc':
      return sorted.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      });
    case 'due_desc':
      return sorted.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(b.due_date) - new Date(a.due_date);
      });
    case 'name_asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name_desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return sorted;
  }
}

function TaskList({
  items,
  sortOrder,
  onSortChange,
  onEdit,
  onDelete,
  onAddSubTask,
  onUpdateSubTask,
  onDeleteSubTask,
}) {
  const sortedItems = useMemo(() => sortItems(items, sortOrder), [items, sortOrder]);

  if (sortedItems.length === 0) {
    return (
      <div className="task-list-empty">
        <SortControl sortOrder={sortOrder} onSortChange={onSortChange} />
        <p>No tasks yet. Add one above!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <SortControl sortOrder={sortOrder} onSortChange={onSortChange} />
      <ul>
        {sortedItems.map((item) => (
          <TaskItem
            key={item.id}
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddSubTask={onAddSubTask}
            onUpdateSubTask={onUpdateSubTask}
            onDeleteSubTask={onDeleteSubTask}
          />
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
