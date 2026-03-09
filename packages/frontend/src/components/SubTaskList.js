import React, { useState } from 'react';
import SubTaskItem from './SubTaskItem';

function SubTaskList({ subTasks, parentId, onAdd, onUpdate, onDelete, onPromptParentComplete }) {
  const [newSubTaskName, setNewSubTaskName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newSubTaskName.trim()) return;
    onAdd(parentId, newSubTaskName.trim());
    setNewSubTaskName('');
    setShowAddForm(false);
  };

  const handleUpdate = (pid, subId, changes) => {
    onUpdate(pid, subId, changes);

    if (changes.completed) {
      const remaining = subTasks.filter(
        (st) => st.id !== subId && !st.completed
      );
      if (remaining.length === 0 && onPromptParentComplete) {
        onPromptParentComplete(parentId);
      }
    }
  };

  return (
    <div className="sub-task-list">
      {subTasks.length > 0 && (
        <ul>
          {subTasks.map((st) => (
            <SubTaskItem
              key={st.id}
              subTask={st}
              parentId={parentId}
              onUpdate={handleUpdate}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}

      {showAddForm ? (
        <form className="sub-task-add-form" onSubmit={handleAdd}>
          <input
            type="text"
            value={newSubTaskName}
            onChange={(e) => setNewSubTaskName(e.target.value)}
            placeholder="Sub-task name"
            required
            autoFocus
          />
          <button type="submit">Add</button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setShowAddForm(false);
              setNewSubTaskName('');
            }}
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          className="add-subtask-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add sub-task
        </button>
      )}
    </div>
  );
}

export default SubTaskList;
