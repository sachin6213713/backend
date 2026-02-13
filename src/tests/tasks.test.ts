import request from 'supertest';
import app from '../app';

let token: string;
let taskId: string;

const createUserAndGetToken = async () => {
  const res = await request(app).post('/api/auth/signup').send({
    name: 'Task User',
    email: 'taskuser@example.com',
    password: 'password123',
  });
  return res.body.data.token;
};

describe('Task Routes', () => {
  beforeEach(async () => {
    token = await createUserAndGetToken();
  });

  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Task', description: 'A test task' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Task');
      expect(res.body.data.status).toBe('pending');
      taskId = res.body.data._id;
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No title' });

      expect(res.status).toBe(400);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).post('/api/tasks').send({ title: 'No auth' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    it('should get all tasks for user', async () => {
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task 1' });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task 2' });

      const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('should not return tasks from other users', async () => {
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'User1 Task' });

      const res2 = await request(app).post('/api/auth/signup').send({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123',
      });
      const otherToken = res2.body.data.token;

      const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Original' });

      const id = createRes.body.data._id;

      const res = await request(app)
        .put(`/api/tasks/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated', status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated');
      expect(res.body.data.status).toBe('completed');
    });

    it('should return 403 for non-owner', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Owner Task' });

      const id = createRes.body.data._id;

      const res2 = await request(app).post('/api/auth/signup').send({
        name: 'Hacker',
        email: 'hacker@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .put(`/api/tasks/${id}`)
        .set('Authorization', `Bearer ${res2.body.data.token}`)
        .send({ title: 'Hacked' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'To Delete' });

      const id = createRes.body.data._id;

      const res = await request(app)
        .delete(`/api/tasks/${id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Task deleted successfully');
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .delete('/api/tasks/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
