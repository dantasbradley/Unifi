const request = require('supertest');
let app;

// Mock the query method for the MySQL connection
const mockQuery = jest.fn();
const mockPool = { query: mockQuery };

// Reset modules and re-initialize the app and mocked pool before each test
beforeEach(() => {
  jest.resetModules();
  app = require('../app');
  app.set('pool', mockPool);
  require('../routes/likes.routes')(app);
  mockQuery.mockReset();
});

describe('Like Routes', () => {
  // Test missing required fields when adding a like
  it('should return 400 if required fields are missing when adding like', async () => {
    const res = await request(app).post('/DB/likes/add').send({
      user_id: 1 // post_id is missing
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required field/);
  });

  // Test successful like insertion
  it('should add a like successfully', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(null, {}); // Simulate successful insertion
    });

    const res = await request(app).post('/DB/likes/add').send({
      user_id: 1,
      post_id: 2
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/Like added/);
  });

  // Test error case when DB insertion fails
  it('should return 500 if add query fails', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(new Error('Insert failed')); // Simulate DB error
    });

    const res = await request(app).post('/DB/likes/add').send({
      user_id: 1,
      post_id: 2
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/);
  });

  // Test successful like deletion
  it('should delete a like successfully', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(null, { affectedRows: 1 }); // Simulate successful deletion
    });

    const res = await request(app).delete('/DB/likes/delete').send({
      user_id: 1,
      post_id: 2
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Like removed/);
  });

   // Test case where no matching like is found to delete
  it('should return 404 if like not found', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(null, { affectedRows: 0 }); // Simulate no row affected
    });

    const res = await request(app).delete('/DB/likes/delete').send({
      user_id: 1,
      post_id: 2
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Like not found/);
  });

  // Test error case when DB deletion fails
  it('should return 500 if delete query fails', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(new Error('Delete failed')); // Simulate DB error
    });

    const res = await request(app).delete('/DB/likes/delete').send({
      user_id: 1,
      post_id: 2
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/);
  });
});
