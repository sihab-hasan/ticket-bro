'use strict';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Set env before importing app
process.env.JWT_ACCESS_SECRET = 'test-access-secret-32-chars-minimum!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32-chars-minimum!';
process.env.EMAIL_VERIFICATION_SECRET = 'test-email-verify-secret';
process.env.PASSWORD_RESET_SECRET = 'test-password-reset-secret';
process.env.NODE_ENV = 'test';

const app = require('../../../src/app');
const User = require('../../../src/infrastructure/database/models/User');
const RefreshToken = require('../../../src/infrastructure/database/models/RefreshToken');

// Mock email service
jest.mock('../../../src/infrastructure/mail/emailService', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
  sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true }),
  sendPasswordChangedEmail: jest.fn().mockResolvedValue({ success: true }),
  sendOTPEmail: jest.fn().mockResolvedValue({ success: true }),
  sendLoginAlertEmail: jest.fn().mockResolvedValue({ success: true }),
}));

let mongod;
const BASE = '/api/v1/auth';

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

afterEach(async () => {
  jest.clearAllMocks();
  await User.deleteMany({});
  await RefreshToken.deleteMany({});
});

const validUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'Test@1234',
  confirmPassword: 'Test@1234',
};

describe('Auth Controller Integration Tests', () => {
  // ── POST /register ────────────────────────────────────────────────────────
  describe('POST /register', () => {
    it('should register user and return 201 with tokens', async () => {
      const res = await request(app).post(`${BASE}/register`).send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });

    it('should return 400 if required fields missing', async () => {
      const res = await request(app).post(`${BASE}/register`).send({ email: 'test@test.com' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 409 if email already registered', async () => {
      await request(app).post(`${BASE}/register`).send(validUser);
      const res = await request(app).post(`${BASE}/register`).send(validUser);
      expect(res.status).toBe(409);
    });

    it('should return 400 if passwords dont match', async () => {
      const res = await request(app)
        .post(`${BASE}/register`)
        .send({ ...validUser, confirmPassword: 'Different@1234' });
      expect(res.status).toBe(400);
    });
  });

  // ── POST /login ───────────────────────────────────────────────────────────
  describe('POST /login', () => {
    beforeEach(async () => {
      await request(app).post(`${BASE}/register`).send(validUser);
    });

    it('should login successfully', async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });

    it('should return 401 with wrong password', async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: validUser.email, password: 'WrongPass@1' });
      expect(res.status).toBe(401);
    });

    it('should return 400 with invalid email format', async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: 'notanemail', password: validUser.password });
      expect(res.status).toBe(400);
    });
  });

  // ── GET /me ───────────────────────────────────────────────────────────────
  describe('GET /me', () => {
    it('should return user profile with valid token', async () => {
      const registerRes = await request(app).post(`${BASE}/register`).send(validUser);
      const token = registerRes.body.data.tokens.accessToken;

      const res = await request(app)
        .get(`${BASE}/me`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(validUser.email);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get(`${BASE}/me`);
      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get(`${BASE}/me`)
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });

  // ── POST /refresh-token ───────────────────────────────────────────────────
  describe('POST /refresh-token', () => {
    it('should return new token pair', async () => {
      const registerRes = await request(app).post(`${BASE}/register`).send(validUser);
      const refreshToken = registerRes.body.data.tokens.refreshToken;

      const res = await request(app)
        .post(`${BASE}/refresh-token`)
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should return 401 with invalid refresh token', async () => {
      const res = await request(app)
        .post(`${BASE}/refresh-token`)
        .send({ refreshToken: 'invalid-token' });
      expect(res.status).toBe(401);
    });
  });

  // ── POST /logout ──────────────────────────────────────────────────────────
  describe('POST /logout', () => {
    it('should logout successfully', async () => {
      const registerRes = await request(app).post(`${BASE}/register`).send(validUser);
      const { accessToken, refreshToken } = registerRes.body.data.tokens;

      const res = await request(app)
        .post(`${BASE}/logout`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(res.status).toBe(200);
    });
  });

  // ── POST /forgot-password ─────────────────────────────────────────────────
  describe('POST /forgot-password', () => {
    it('should return generic message for any email', async () => {
      const res = await request(app)
        .post(`${BASE}/forgot-password`)
        .send({ email: 'anyone@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('If an account');
    });
  });

  // ── Health Check ──────────────────────────────────────────────────────────
  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
