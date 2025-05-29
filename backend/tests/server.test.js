const request = require('supertest');
const app = require('../server');

describe('Server API Tests', () => {
  it('should respond to root endpoint', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  it('should return 404 for non-existent routes', async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.statusCode).toBe(404);
  });

}); 

