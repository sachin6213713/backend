import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';

describe('Auth Middleware', () => {
  it('should reject requests without token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('No token');
  });

  it('should reject invalid token', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.status).toBe(401);
  });

  it('should reject expired token', async () => {
    const expiredToken = jwt.sign({ userId: '507f1f77bcf86cd799439011' }, 'wrong_secret', {
      expiresIn: '1ms',
    });

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });

  it('should reject token with non-existent user', async () => {
    const token = jwt.sign(
      { userId: '507f1f77bcf86cd799439011' },
      process.env.JWT_SECRET || 'default_secret_change_me',
      { expiresIn: '1h' },
    );

    const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
  });
});

describe('Validation Middleware', () => {
  it('should reject invalid signup data', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: '',
      email: 'not-email',
      password: 'ab',
    });

    expect(res.status).toBe(400);
  });

  it('should reject invalid task data', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send({
      name: 'Test',
      email: 'test@test.com',
      password: 'password123',
    });
    const token = signupRes.body.data.token;

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '' });

    expect(res.status).toBe(400);
  });
});
