const request = require('supertest');
let app;

// Mocked database query function and pool
const mockQuery = jest.fn();
const mockPool = { query: mockQuery };

// Set up the test environment before each test
beforeEach(() => {
    jest.resetModules();
    app = require('../app');
    app.set('pool', mockPool);
    app.get('registerRoutes')(app); 
    mockQuery.mockReset();
  });
  

describe('Post Routes', () => {
  //Test for validation failure
  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/DB/posts/add').send({
      content: 'Missing club_id and author_id'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required field/);
  });

  //Test successful post insertion
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

  //Test DB error on inser
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

  //Test successful deletion
  it('should delete a post successfully', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(null, { affectedRows: 1 });
    });

    const res = await request(app).delete('/DB/posts/delete/5');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Post deleted/);
  });

  //Test deletion when no post is found
  it('should return 404 if post to delete not found', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(null, { affectedRows: 0 });
    });

    const res = await request(app).delete('/DB/posts/delete/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Post not found/);
  });

  //Test DB error on deletion
  it('should return 500 if delete query fails', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      cb(new Error('Delete failed'));
    });

    const res = await request(app).delete('/DB/posts/delete/1');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/);
  });
});

describe('PUT /DB/posts/update/:post_id', () => {
  //Test successful update
  it('should update a post and return 200', async () => {
    mockQuery.mockImplementation((sql, vals, cb) => cb(null, { affectedRows: 1 }));

    const res = await request(app)
      .put('/DB/posts/update/1')
      .send({ content: 'Updated post content' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/updated/i);
  });

  //Test update with missing content
  it('should return 400 if content is missing', async () => {
    const res = await request(app)
      .put('/DB/posts/update/1')
      .send({}); // no content

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/missing/i);
  });

  //Test update when no post matches
  it('should return 404 if post not found', async () => {
    mockQuery.mockImplementation((sql, vals, cb) => cb(null, { affectedRows: 0 }));

    const res = await request(app)
      .put('/DB/posts/update/999')
      .send({ content: 'Anything' });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  //Test DB error during update
  it('should return 500 if the DB fails', async () => {
    mockQuery.mockImplementation((sql, vals, cb) => cb(new Error('Simulated DB error')));

    const res = await request(app)
      .put('/DB/posts/update/1')
      .send({ content: 'Test' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/failed to update/i);
  });
});
