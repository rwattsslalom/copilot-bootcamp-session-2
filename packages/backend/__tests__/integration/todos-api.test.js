const request = require('supertest');
const { app, db } = require('../../src/app');

afterAll(() => {
  if (db) {
    db.close();
  }
});

beforeEach(() => {
  db.exec('DELETE FROM sub_tasks');
  db.exec('DELETE FROM items');
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const createItem = async (fields = {}) => {
  const response = await request(app)
    .post('/api/items')
    .send({ name: 'Test Task', ...fields })
    .set('Accept', 'application/json');
  expect(response.status).toBe(201);
  return response.body;
};

const createSubTask = async (parentId, name = 'Sub task') => {
  const response = await request(app)
    .post(`/api/items/${parentId}/subtasks`)
    .send({ name })
    .set('Accept', 'application/json');
  expect(response.status).toBe(201);
  return response.body;
};

// ── Full task lifecycle ───────────────────────────────────────────────────────

describe('Todos API – integration', () => {
  describe('Full item lifecycle', () => {
    it('creates, retrieves, edits, and deletes a task', async () => {
      // Create
      const created = await createItem({
        name: 'Buy groceries',
        description: 'Milk and eggs',
        due_date: '2026-12-01',
      });
      expect(created.name).toBe('Buy groceries');
      expect(created.description).toBe('Milk and eggs');
      expect(created.due_date).toBe('2026-12-01');
      expect(created.completed).toBe(0);

      // Appears in list
      const listRes = await request(app).get('/api/items');
      expect(listRes.status).toBe(200);
      const found = listRes.body.find((i) => i.id === created.id);
      expect(found).toBeDefined();

      // Edit name and due date
      const editRes = await request(app)
        .put(`/api/items/${created.id}`)
        .send({ name: 'Buy groceries (updated)', due_date: '2026-12-15' });
      expect(editRes.status).toBe(200);
      expect(editRes.body.name).toBe('Buy groceries (updated)');
      expect(editRes.body.due_date).toBe('2026-12-15');

      // Mark complete
      const completeRes = await request(app)
        .put(`/api/items/${created.id}`)
        .send({ completed: true });
      expect(completeRes.status).toBe(200);
      expect(completeRes.body.completed).toBe(1);

      // Delete
      const deleteRes = await request(app).delete(`/api/items/${created.id}`);
      expect(deleteRes.status).toBe(200);

      // Confirm gone
      const listAfter = await request(app).get('/api/items');
      const afterDelete = listAfter.body.find((i) => i.id === created.id);
      expect(afterDelete).toBeUndefined();
    });
  });

  describe('Full sub-task lifecycle', () => {
    it('creates, updates, and deletes sub-tasks under a parent task', async () => {
      const parent = await createItem({ name: 'Parent task' });

      // Create two sub-tasks
      const sub1 = await createSubTask(parent.id, 'Step 1');
      const sub2 = await createSubTask(parent.id, 'Step 2');
      expect(sub1.parent_id).toBe(parent.id);
      expect(sub2.parent_id).toBe(parent.id);

      // GET includes sub-tasks
      const listRes = await request(app).get('/api/items');
      const fetched = listRes.body.find((i) => i.id === parent.id);
      expect(fetched.sub_tasks).toHaveLength(2);

      // Mark sub1 complete
      const doneRes = await request(app)
        .put(`/api/items/${parent.id}/subtasks/${sub1.id}`)
        .send({ completed: true });
      expect(doneRes.status).toBe(200);
      expect(doneRes.body.completed).toBe(1);

      // Edit sub2's name
      const editRes = await request(app)
        .put(`/api/items/${parent.id}/subtasks/${sub2.id}`)
        .send({ name: 'Step 2 (revised)' });
      expect(editRes.status).toBe(200);
      expect(editRes.body.name).toBe('Step 2 (revised)');

      // Delete sub1
      const delRes = await request(app).delete(
        `/api/items/${parent.id}/subtasks/${sub1.id}`
      );
      expect(delRes.status).toBe(200);

      // Only sub2 remains
      const listAfter = await request(app).get('/api/items');
      const parentAfter = listAfter.body.find((i) => i.id === parent.id);
      expect(parentAfter.sub_tasks).toHaveLength(1);
      expect(parentAfter.sub_tasks[0].id).toBe(sub2.id);
    });
  });

  describe('Deleting a parent removes its sub-tasks', () => {
    it('sub-tasks are gone after parent is deleted', async () => {
      const parent = await createItem({ name: 'Parent with children' });
      const sub = await createSubTask(parent.id, 'Child');

      await request(app).delete(`/api/items/${parent.id}`);

      // Sub-task no longer accessible
      const res = await request(app).delete(
        `/api/items/${parent.id}/subtasks/${sub.id}`
      );
      expect(res.status).toBe(404);
    });
  });

  describe('Sorting', () => {
    it('GET /api/items returns items in an array with created_at present on each', async () => {
      await createItem({ name: 'First task' });
      await createItem({ name: 'Second task' });

      const res = await request(app).get('/api/items');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      res.body.forEach((item) => {
        expect(item).toHaveProperty('created_at');
      });
    });
  });
});
