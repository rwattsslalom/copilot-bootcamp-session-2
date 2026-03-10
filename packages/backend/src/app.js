const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    due_date TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sub_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert some initial data
const initialItems = [
  { name: 'Buy groceries', description: 'Milk, eggs, bread', due_date: null },
  { name: 'Schedule dentist', description: null, due_date: null },
  { name: 'Read a book', description: null, due_date: null },
];
const insertStmt = db.prepare(
  'INSERT INTO items (name, description, due_date) VALUES (?, ?, ?)'
);

initialItems.forEach(item => {
  insertStmt.run(item.name, item.description, item.due_date);
});

console.log('In-memory database initialized with sample data');

// ── Helpers ──────────────────────────────────────────────────────────────────

function getItemWithSubTasks(id) {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!item) return null;
  item.sub_tasks = db
    .prepare('SELECT * FROM sub_tasks WHERE parent_id = ? ORDER BY created_at ASC')
    .all(id);
  return item;
}

// ── Health check ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// ── Reset (E2E testing only) ──────────────────────────────────────────────────

app.post('/api/reset', (req, res) => {
  try {
    db.exec('DELETE FROM items');
    res.status(200).json({ message: 'Database reset' });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// ── Items ─────────────────────────────────────────────────────────────────────

app.get('/api/items', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM items ORDER BY created_at DESC').all();
    const itemsWithSubTasks = items.map(item => {
      item.sub_tasks = db
        .prepare('SELECT * FROM sub_tasks WHERE parent_id = ? ORDER BY created_at ASC')
        .all(item.id);
      return item;
    });
    res.json(itemsWithSubTasks);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', (req, res) => {
  try {
    const { name, description, due_date } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const result = db
      .prepare('INSERT INTO items (name, description, due_date) VALUES (?, ?, ?)')
      .run(name.trim(), description || null, due_date || null);

    const newItem = getItemWithSubTasks(result.lastInsertRowid);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

app.put('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const { name, description, due_date, completed } = req.body;

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({ error: 'Item name cannot be empty' });
    }

    const updatedName = name !== undefined ? name.trim() : existingItem.name;
    const updatedDescription =
      description !== undefined ? description || null : existingItem.description;
    const updatedDueDate =
      due_date !== undefined ? due_date || null : existingItem.due_date;
    const updatedCompleted =
      completed !== undefined ? (completed ? 1 : 0) : existingItem.completed;

    db.prepare(
      'UPDATE items SET name = ?, description = ?, due_date = ?, completed = ? WHERE id = ?'
    ).run(updatedName, updatedDescription, updatedDueDate, updatedCompleted, id);

    res.json(getItemWithSubTasks(id));
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);

    if (result.changes > 0) {
      res.json({ message: 'Item deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// ── Sub-tasks ─────────────────────────────────────────────────────────────────

app.post('/api/items/:id/subtasks', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const parentItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!parentItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Sub-task name is required' });
    }

    const result = db
      .prepare('INSERT INTO sub_tasks (parent_id, name) VALUES (?, ?)')
      .run(parseInt(id), name.trim());

    const newSubTask = db
      .prepare('SELECT * FROM sub_tasks WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json(newSubTask);
  } catch (error) {
    console.error('Error creating sub-task:', error);
    res.status(500).json({ error: 'Failed to create sub-task' });
  }
});

app.put('/api/items/:id/subtasks/:subId', (req, res) => {
  try {
    const { id, subId } = req.params;

    if (!id || isNaN(parseInt(id)) || !subId || isNaN(parseInt(subId))) {
      return res.status(400).json({ error: 'Valid item ID and sub-task ID are required' });
    }

    const subTask = db
      .prepare('SELECT * FROM sub_tasks WHERE id = ? AND parent_id = ?')
      .get(subId, id);
    if (!subTask) {
      return res.status(404).json({ error: 'Sub-task not found' });
    }

    const { name, completed } = req.body;

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({ error: 'Sub-task name cannot be empty' });
    }

    const updatedName = name !== undefined ? name.trim() : subTask.name;
    const updatedCompleted =
      completed !== undefined ? (completed ? 1 : 0) : subTask.completed;

    db.prepare('UPDATE sub_tasks SET name = ?, completed = ? WHERE id = ?').run(
      updatedName,
      updatedCompleted,
      subId
    );

    const updated = db.prepare('SELECT * FROM sub_tasks WHERE id = ?').get(subId);
    res.json(updated);
  } catch (error) {
    console.error('Error updating sub-task:', error);
    res.status(500).json({ error: 'Failed to update sub-task' });
  }
});

app.delete('/api/items/:id/subtasks/:subId', (req, res) => {
  try {
    const { id, subId } = req.params;

    if (!id || isNaN(parseInt(id)) || !subId || isNaN(parseInt(subId))) {
      return res.status(400).json({ error: 'Valid item ID and sub-task ID are required' });
    }

    const subTask = db
      .prepare('SELECT * FROM sub_tasks WHERE id = ? AND parent_id = ?')
      .get(subId, id);
    if (!subTask) {
      return res.status(404).json({ error: 'Sub-task not found' });
    }

    db.prepare('DELETE FROM sub_tasks WHERE id = ?').run(subId);
    res.json({ message: 'Sub-task deleted successfully', id: parseInt(subId) });
  } catch (error) {
    console.error('Error deleting sub-task:', error);
    res.status(500).json({ error: 'Failed to delete sub-task' });
  }
});

module.exports = { app, db };