import React, { useState, useEffect, useRef } from 'react';
import TaskForm from './TaskForm';
import SubTaskList from './SubTaskList';

function TaskItem({ item, onEdit, onDelete, onAddSubTask, onUpdateSubTask, onDeleteSubTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSubTasks, setShowSubTasks] = useState(false);
  const [promptComplete, setPromptComplete] = useState(false);

  // Auto-reveal sub-tasks panel when a new sub-task is added
  const prevSubTaskLen = useRef(item.sub_tasks ? item.sub_tasks.length : 0);
  useEffect(() => {
    const len = item.sub_tasks ? item.sub_tasks.length : 0;
    if (len > prevSubTaskLen.current) {
      setShowSubTasks(true);
    }
    prevSubTaskLen.current = len;
  }, [item.sub_tasks]);

  const handleEditSubmit = (values) => {
    onEdit(item.id, values);
    setIsEditing(false);
  };

  const handlePromptParentComplete = () => {
    setPromptComplete(true);
    setShowSubTasks(true);
  };

  const handleMarkParentComplete = () => {
    onEdit(item.id, { completed: true });
    setPromptComplete(false);
  };

  const subTaskCount = item.sub_tasks ? item.sub_tasks.length : 0;
  const completedSubTaskCount = item.sub_tasks
    ? item.sub_tasks.filter((st) => st.completed).length
    : 0;

  return (
    <li className={`task-item${item.completed ? ' completed' : ''}`}>
      {isEditing ? (
        <div className="task-edit">
          <TaskForm
            initialValues={item}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditing(false)}
            submitLabel="Save"
          />
        </div>
      ) : (
        <div className="task-content">
          <div className="task-main">
            <span className={`task-name${item.completed ? ' strikethrough' : ''}`}>
              {item.name}
            </span>
            {item.description && (
              <span className="task-description">{item.description}</span>
            )}
            {item.due_date && (
              <span className="task-due-date">Due: {item.due_date}</span>
            )}
          </div>

          <div className="task-actions">
            {subTaskCount > 0 && (
              <button
                type="button"
                className="subtasks-toggle-btn"
                onClick={() => setShowSubTasks((prev) => !prev)}
              >
                Sub-tasks ({completedSubTaskCount}/{subTaskCount}){' '}
                {showSubTasks ? '▲' : '▼'}
              </button>
            )}
            <button type="button" className="edit-btn" onClick={() => setIsEditing(true)}>
              Edit
            </button>
            <button
              type="button"
              className="delete-btn"
              onClick={() => onDelete(item.id)}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {promptComplete && (
        <div className="prompt-complete">
          All sub-tasks are done! Mark this task as complete?
          <button type="button" onClick={handleMarkParentComplete}>
            Yes, mark complete
          </button>
          <button type="button" className="cancel-btn" onClick={() => setPromptComplete(false)}>
            Not yet
          </button>
        </div>
      )}

      {(showSubTasks || subTaskCount === 0) && !isEditing && (
        <SubTaskList
          subTasks={item.sub_tasks || []}
          parentId={item.id}
          onAdd={onAddSubTask}
          onUpdate={onUpdateSubTask}
          onDelete={onDeleteSubTask}
          onPromptParentComplete={handlePromptParentComplete}
        />
      )}
    </li>
  );
}

export default TaskItem;
