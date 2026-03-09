import React, { useState, useEffect } from 'react';
import './App.css';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('created_desc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async ({ name, description, due_date }) => {
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, due_date }),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const result = await response.json();
      setData((prev) => [result, ...prev]);
      setError(null);
    } catch (err) {
      setError('Error adding task: ' + err.message);
      console.error('Error adding task:', err);
    }
  };

  const handleEditTask = async (itemId, changes) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updated = await response.json();
      setData((prev) => prev.map((item) => (item.id === itemId ? updated : item)));
      setError(null);
    } catch (err) {
      setError('Error updating task: ' + err.message);
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (itemId) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setData((prev) => prev.filter((item) => item.id !== itemId));
      setError(null);
    } catch (err) {
      setError('Error deleting task: ' + err.message);
      console.error('Error deleting task:', err);
    }
  };

  const handleAddSubTask = async (parentId, name) => {
    try {
      const response = await fetch(`/api/items/${parentId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to add sub-task');
      }

      const newSubTask = await response.json();
      setData((prev) =>
        prev.map((item) =>
          item.id === parentId
            ? { ...item, sub_tasks: [...(item.sub_tasks || []), newSubTask] }
            : item
        )
      );
      setError(null);
    } catch (err) {
      setError('Error adding sub-task: ' + err.message);
      console.error('Error adding sub-task:', err);
    }
  };

  const handleUpdateSubTask = async (parentId, subTaskId, changes) => {
    try {
      const response = await fetch(`/api/items/${parentId}/subtasks/${subTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });

      if (!response.ok) {
        throw new Error('Failed to update sub-task');
      }

      const updated = await response.json();
      setData((prev) =>
        prev.map((item) =>
          item.id === parentId
            ? {
                ...item,
                sub_tasks: item.sub_tasks.map((st) =>
                  st.id === subTaskId ? updated : st
                ),
              }
            : item
        )
      );
      setError(null);
    } catch (err) {
      setError('Error updating sub-task: ' + err.message);
      console.error('Error updating sub-task:', err);
    }
  };

  const handleDeleteSubTask = async (parentId, subTaskId) => {
    try {
      const response = await fetch(`/api/items/${parentId}/subtasks/${subTaskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete sub-task');
      }

      setData((prev) =>
        prev.map((item) =>
          item.id === parentId
            ? { ...item, sub_tasks: item.sub_tasks.filter((st) => st.id !== subTaskId) }
            : item
        )
      );
      setError(null);
    } catch (err) {
      setError('Error deleting sub-task: ' + err.message);
      console.error('Error deleting sub-task:', err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>To Do App</h1>
        <p>Keep track of your tasks</p>
      </header>

      <main>
        <section className="add-item-section">
          <h2>Add New Task</h2>
          <TaskForm onSubmit={handleAddTask} />
        </section>

        <section className="items-section">
          <h2>Tasks</h2>
          {loading && <p>Loading data...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && (
            <TaskList
              items={data}
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onAddSubTask={handleAddSubTask}
              onUpdateSubTask={handleUpdateSubTask}
              onDeleteSubTask={handleDeleteSubTask}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;