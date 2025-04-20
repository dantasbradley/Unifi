const request = require('supertest');
let app;

const mockQuery = jest.fn();
const mockPool = { query: mockQuery };

beforeEach(() => {
  jest.resetModules();
  app = require('../app');
  app.set('pool', mockPool);
  require('../routes/likes.routes')(app);
  mockQuery.mockReset();
});

describe('Like Routes', () => {
  it('should return 400 if required fields are missing when adding like', async () => {
    const res = await request(app).post('/DB/likes/add').send({
      user_id: 1
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required field/);
  });

  it('should add a like successfully', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(null, {});
    });

    const res = await request(app).post('/DB/likes/add').send({
      user_id: 1,
      post_id: 2
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/Like added/);
  });

  it('should return 500 if add query fails', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(new Error('Insert failed'));
    });

    const res = await request(app).post('/DB/likes/add').send({
      user_id: 1,
      post_id: 2
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/);
  });

  it('should delete a like successfully', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(null, { affectedRows: 1 });
    });

    const res = await request(app).delete('/DB/likes/delete').send({
      user_id: 1,
      post_id: 2
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Like removed/);
  });

  it('should return 404 if like not found', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(null, { affectedRows: 0 });
    });

    const res = await request(app).delete('/DB/likes/delete').send({
      user_id: 1,
      post_id: 2
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Like not found/);
  });

  it('should return 500 if delete query fails', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(new Error('Delete failed'));
    });

    const res = await request(app).delete('/DB/likes/delete').send({
      user_id: 1,
      post_id: 2
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/);
  });
});
