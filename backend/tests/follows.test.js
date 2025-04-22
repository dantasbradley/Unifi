// Import supertest for simulating HTTP requests
const request = require('supertest');
let app;

// Mock the database query function and connection pool
const mockQuery = jest.fn();
const mockPool = { query: mockQuery };

// Before each test, reset modules and setup mock environment
beforeEach(() => {
  jest.resetModules();
  app = require('../app');
  app.set('pool', mockPool);
  require('../routes/follows.routes')(app);
  mockQuery.mockReset();
});

describe('Follow Routes', () => {
  //Missing fields in follow request
  it('should return 400 if required fields are missing on follow', async () => {
    const res = await request(app).post('/DB/follows/add').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required fields/);
  });

    //Successful follow creation
  it('should return 201 on successful follow', async () => {
    // Simulate DB returning insertId on successful insertion
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

  //Database error during follow
  it('should return 500 on DB error during follow', async () => {
     // Simulate DB throwing an error
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

  //Successful unfollow operation
  it('should return 200 on successful unfollow', async () => {
    // Simulate DB confirming one row deleted
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

  //Trying to unfollow a non-existent relationship
  it('should return 404 if follow relationship not found on unfollow', async () => {
     // Simulate DB showing no rows were affected
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

  //Database error during unfollow
  it('should return 500 on DB error during unfollow', async () => {
    // Simulate DB throwing an error
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
