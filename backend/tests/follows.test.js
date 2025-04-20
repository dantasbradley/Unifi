const request = require('supertest');
let app;

const mockQuery = jest.fn();
const mockPool = { query: mockQuery };

beforeEach(() => {
  jest.resetModules();
  app = require('../app');
  app.set('pool', mockPool);
  require('../routes/follows.routes')(app);
  mockQuery.mockReset();
});

describe('Follow Routes', () => {
  it('should return 400 if required fields are missing on follow', async () => {
    const res = await request(app).post('/DB/follows/add').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required fields/);
  });

  it('should return 201 on successful follow', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(null, { insertId: 1 });
    });

    const res = await request(app).post('/DB/follows/add').send({
      follower_id: 1,
      followee_id: 2
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/Follow added/);
    expect(res.body.id).toBe(1);
  });

  it('should return 500 on DB error during follow', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(new Error('DB error'));
    });

    const res = await request(app).post('/DB/follows/add').send({
      follower_id: 1,
      followee_id: 2
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/);
  });

  it('should return 200 on successful unfollow', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(null, { affectedRows: 1 });
    });

    const res = await request(app).delete('/DB/follows/delete').send({
      follower_id: 1,
      followee_id: 2
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Unfollowed successfully/);
  });

  it('should return 404 if follow relationship not found on unfollow', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(null, { affectedRows: 0 });
    });

    const res = await request(app).delete('/DB/follows/delete').send({
      follower_id: 1,
      followee_id: 2
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Follow relationship not found/);
  });

  it('should return 500 on DB error during unfollow', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(new Error('DB error'));
    });

    const res = await request(app).delete('/DB/follows/delete').send({
      follower_id: 1,
      followee_id: 2
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/);
  });
});
