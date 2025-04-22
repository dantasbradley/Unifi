const request = require('supertest');

let app;
const mockQuery = jest.fn();
const mockPool = { query: mockQuery };

beforeEach(() => {
    jest.resetModules();
    mockQuery.mockReset();
  
    app = require('../app');
    app.set('pool', mockPool);
  
    require('../routes/club.routes')(app);
  });
  

describe('Club Routes', () => {
  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/DB/clubs/add').send({
      name: 'Chess Club',
      location: 'Library',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/admin_id/);
  });

  it('should return 201 and club ID on successful insert', async () => {
    mockQuery.mockImplementation((query, params, cb) => {
      if (query.includes('INSERT INTO test.clubs')) {
        return cb(null, { insertId: 123 });
      } else if (query.includes('INSERT INTO test.club_admins')) {
        return cb(null, {});
      } else {
        return cb(new Error('Unknown query'));
      }
    });

    const res = await request(app).post('/DB/clubs/add').send({
      name: 'Chess Club',
      location: 'Library',
      admin_id: 42,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/Club and admin added successfully/);
    expect(res.body.id).toBe(123);
  });

  it('should return 500 if club insert fails', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) =>
      cb(new Error('Club insert failed'))
    );

    const res = await request(app).post('/DB/clubs/add').send({
      name: 'Drama Club',
      location: 'Auditorium',
      admin_id: 1,
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/);
  });

  it('should return 500 if admin insert fails after club insert', async () => {
    mockQuery
      .mockImplementationOnce((query, params, cb) =>
        cb(null, { insertId: 555 })
      ) // club insert
      .mockImplementationOnce((query, params, cb) =>
        cb(new Error('Admin insert failed'))
      ); // admin insert

    const res = await request(app).post('/DB/clubs/add').send({
      name: 'Science Club',
      location: 'Lab',
      admin_id: 2,
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Error adding admin to club/);
  });

  it('should delete a club successfully', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) =>
      cb(null, { affectedRows: 1 })
    );

    const res = await request(app).delete('/DB/clubs/delete/123');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Club deleted successfully/i);
    expect(res.body.club_id).toBe('123');
  });

  it('should return 404 if club to delete is not found', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) =>
      cb(null, { affectedRows: 0 })
    );

    const res = await request(app).delete('/DB/clubs/delete/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/No club found/i);
  });

  it('should return 500 if DB error occurs during delete', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) =>
      cb(new Error('DB failure'))
    );

    const res = await request(app).delete('/DB/clubs/delete/123');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/i);
  });

});
