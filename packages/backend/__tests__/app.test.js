const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createItem = async (fields = {}) => {
  const body = { name: 'Temp Item', ...fields };
  const response = await request(app)
    .post('/api/items')
    .send(body)
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check if items have the expected structure
      const item = response.body[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('created_at');
      expect(item).toHaveProperty('description');
      expect(item).toHaveProperty('due_date');
      expect(item).toHaveProperty('completed');
      expect(item).toHaveProperty('sub_tasks');
      expect(Array.isArray(item.sub_tasks)).toBe(true);
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item with name only', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Test Item' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Item');
      expect(response.body).toHaveProperty('created_at');
      expect(response.body.description).toBeNull();
      expect(response.body.due_date).toBeNull();
      expect(response.body.completed).toBe(0);
      expect(Array.isArray(response.body.sub_tasks)).toBe(true);
    });

    it('should create a new item with description and due_date', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Task with details', description: 'Some notes', due_date: '2026-12-31' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Task with details');
      expect(response.body.description).toBe('Some notes');
      expect(response.body.due_date).toBe('2026-12-31');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 if name is empty', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update the name of an existing item', async () => {
      const item = await createItem({ name: 'Original Name' });
      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
    });

    it('should update due_date and description', async () => {
      const item = await createItem({ name: 'Task to update' });
      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ description: 'New desc', due_date: '2026-06-01' });

      expect(response.status).toBe(200);
      expect(response.body.description).toBe('New desc');
      expect(response.body.due_date).toBe('2026-06-01');
    });

    it('should mark an item as completed', async () => {
      const item = await createItem({ name: 'To be completed' });
      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ completed: true });

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(1);
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app).put('/api/items/999999').send({ name: 'x' });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).put('/api/items/abc').send({ name: 'x' });
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      const item = await createItem({ name: 'Item To Be Deleted' });

      const deleteResponse = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Item deleted successfully', id: item.id });

      const deleteAgain = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app).delete('/api/items/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/items/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid item ID is required');
    });
  });

  describe('Sub-task endpoints', () => {
    describe('POST /api/items/:id/subtasks', () => {
      it('should create a sub-task under an existing item', async () => {
        const item = await createItem({ name: 'Parent Task' });
        const response = await request(app)
          .post(`/api/items/${item.id}/subtasks`)
          .send({ name: 'Child task' });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('Child task');
        expect(response.body.parent_id).toBe(item.id);
        expect(response.body.completed).toBe(0);
      });

      it('should return 400 if sub-task name is missing', async () => {
        const item = await createItem({ name: 'Parent Task' });
        const response = await request(app)
          .post(`/api/items/${item.id}/subtasks`)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Sub-task name is required');
      });

      it('should return 404 if parent item does not exist', async () => {
        const response = await request(app)
          .post('/api/items/999999/subtasks')
          .send({ name: 'Orphan' });

        expect(response.status).toBe(404);
      });
    });

    describe('PUT /api/items/:id/subtasks/:subId', () => {
      it('should update a sub-task name', async () => {
        const item = await createItem({ name: 'Parent Task' });
        const stRes = await request(app)
          .post(`/api/items/${item.id}/subtasks`)
          .send({ name: 'Sub original' });
        const subTask = stRes.body;

        const response = await request(app)
          .put(`/api/items/${item.id}/subtasks/${subTask.id}`)
          .send({ name: 'Sub updated' });

        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Sub updated');
      });

      it('should mark a sub-task as completed', async () => {
        const item = await createItem({ name: 'Parent Task' });
        const stRes = await request(app)
          .post(`/api/items/${item.id}/subtasks`)
          .send({ name: 'Sub task' });
        const subTask = stRes.body;

        const response = await request(app)
          .put(`/api/items/${item.id}/subtasks/${subTask.id}`)
          .send({ completed: true });

        expect(response.status).toBe(200);
        expect(response.body.completed).toBe(1);
      });

      it('should return 404 if sub-task does not exist', async () => {
        const item = await createItem({ name: 'Parent Task' });
        const response = await request(app)
          .put(`/api/items/${item.id}/subtasks/999999`)
          .send({ name: 'x' });

        expect(response.status).toBe(404);
      });
    });

    describe('DELETE /api/items/:id/subtasks/:subId', () => {
      it('should delete a sub-task', async () => {
        const item = await createItem({ name: 'Parent Task' });
        const stRes = await request(app)
          .post(`/api/items/${item.id}/subtasks`)
          .send({ name: 'Sub to delete' });
        const subTask = stRes.body;

        const response = await request(app).delete(
          `/api/items/${item.id}/subtasks/${subTask.id}`
        );

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Sub-task deleted successfully');

        const again = await request(app).delete(
          `/api/items/${item.id}/subtasks/${subTask.id}`
        );
        expect(again.status).toBe(404);
      });
    });
  });
});

describe('API Endpoints', () => {
  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check if items have the expected structure
      const item = response.body[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('created_at');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = { name: 'Test Item' };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body).toHaveProperty('created_at');
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 if name is empty', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      const item = await createItem('Item To Be Deleted');

      const deleteResponse = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Item deleted successfully', id: item.id });

      const deleteAgain = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app).delete('/api/items/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/items/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid item ID is required');
    });
  });
});