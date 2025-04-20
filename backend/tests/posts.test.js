const request = require('supertest');
let app;

const mockQuery = jest.fn();
const mockPool = { query: mockQuery };

beforeEach(() => {
    jest.resetModules();
    app = require('../app');
    app.set('pool', mockPool);
    app.get('registerRoutes')(app); 
    mockQuery.mockReset();
  });
  

describe('Post Routes', () => {
  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/DB/posts/add').send({
      content: 'Missing club_id and author_id'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required field/);
  });

  it('should return 201 on successful post insert', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(null, { insertId: 101 });
    });

    const res = await request(app).post('/DB/posts/add').send({
      content: 'Hello world',
      club_id: 1,
      author_id: 2
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/Post created/);
    expect(res.body.id).toBe(101);
  });

  it('should return 500 on DB error during insert', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(new Error('DB error'));
    });

    const res = await request(app).post('/DB/posts/add').send({
      content: 'Oops',
      club_id: 1,
      author_id: 2
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/);
  });

  it('should delete a post successfully', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(null, { affectedRows: 1 });
    });

    const res = await request(app).delete('/DB/posts/delete/5');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Post deleted/);
  });

  it('should return 404 if post to delete not found', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(null, { affectedRows: 0 });
    });

    const res = await request(app).delete('/DB/posts/delete/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Post not found/);
  });

  it('should return 500 if delete query fails', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(new Error('Delete failed'));
    });

    const res = await request(app).delete('/DB/posts/delete/1');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/);
  });
});
