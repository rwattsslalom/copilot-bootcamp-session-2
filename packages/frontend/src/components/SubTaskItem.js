import React, { useState } from 'react';

function SubTaskItem({ subTask, parentId, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(subTask.name);

  const handleToggle = () => {
    onUpdate(parentId, subTask.id, { completed: !subTask.completed });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    onUpdate(parentId, subTask.id, { name: editName.trim() });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(subTask.name);
    setIsEditing(false);
  };

  return (
    <li className={`sub-task-item${subTask.completed ? ' completed' : ''}`}>
      {isEditing ? (
        <form className="sub-task-edit-form" onSubmit={handleEditSubmit}>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <button type="submit">Save</button>
          <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <label className="sub-task-label">
            <input
              type="checkbox"
              checked={!!subTask.completed}
              onChange={handleToggle}
            />
            <span>{subTask.name}</span>
          </label>
          <div className="sub-task-actions">
            <button
              type="button"
              className="edit-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
            <button
              type="button"
              className="delete-btn"
              onClick={() => onDelete(parentId, subTask.id)}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export default SubTaskItem;
