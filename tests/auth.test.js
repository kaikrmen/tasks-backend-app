const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/User');
const app = require('../app');  // Cambiado a app.js
const { MONGODB_URI } = require('../config');

describe('Auth Routes', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test1@example.com',
          password: 'password123'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not register a user with an existing email', async () => {
      await new User({ email: 'test2@example.com', password: 'password123' }).save();
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test2@example.com',
          password: 'password123'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toEqual('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      await new User({ email: 'test3@example.com', password: 'password123' }).save();
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test3@example.com',
          password: 'password123'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toEqual('Invalid credentials');
    });
  });
});