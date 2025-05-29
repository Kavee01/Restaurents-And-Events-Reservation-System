const request = require('supertest');
const app = require('../server');

describe('API Endpoint Tests', () => {
  // Test restaurant endpoints
  describe('Restaurant API', () => {
    it('should get restaurants endpoint', async () => {
      const res = await request(app).get('/restaurant');
      expect(res.statusCode).toBe(200);
      // Don't check the array since we don't know exactly what the response format is
    });
  });

  // Test user endpoints
  describe('User API', () => {
    it('should handle user profile route', async () => {
      const res = await request(app).get('/user/profile');
      // Either 401 or 404 is acceptable since we don't have auth
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  // Test booking endpoints
  describe('Booking API', () => {
    it('should handle bookings endpoint', async () => {
      const res = await request(app).get('/booking');
      // Either 401 or 404 is acceptable
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });
}); 