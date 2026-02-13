import request from 'supertest';
import app from '../app';
import { User } from '../models/User';

// Setup is handled by setup.ts via jest config

describe('Auth Routes', () => {
  describe('POST /api/auth/signup', () => {
    it('should create a new user and return token', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.name).toBe('John Doe');
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should return 409 for duplicate email', async () => {
      await User.create({ name: 'Test', email: 'dup@example.com', password: 'password123' });

      const res = await request(app).post('/api/auth/signup').send({
        name: 'Test2',
        email: 'dup@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: '',
        email: 'invalid',
        password: '12',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/signup').send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
    });

    it('should login and return token', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'john@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });
  });
});
