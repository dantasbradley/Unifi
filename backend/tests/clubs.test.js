const request = require('supertest');

// Setup app and mock DB pool
let app;
const mockQuery = jest.fn();
const mockPool = { query: mockQuery };

// Reinitialize app and mock before each test
beforeEach(() => {
    jest.resetModules();
    mockQuery.mockReset();
  
    app = require('../app');
    app.set('pool', mockPool);
  
    require('../routes/club.routes')(app);
  });
  

describe('Club Routes', () => {
  // Test for missing required fields
  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/DB/clubs/add').send({
      name: 'Chess Club',
      location: 'Library',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/admin_id/);
  });

  // Successful club + admin creation
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

  // DB error when inserting into clubs
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

  // DB error when inserting admin after club insert
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

  // Successful deletion using dynamic route
  it('should delete a club_admin using dynamic delete route', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      expect(query).toMatch(/DELETE FROM/);
      expect(params).toEqual(['club_admins', 'pfpPath', 'some_fake_path', 'club_id', '123']);
      cb(null, { affectedRows: 1 });
    });

    const res = await request(app).delete('/DB/club_admins/delete/pfpPath=some_fake_path/club_id=123');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Successfully deleted/);
  });

  // No rows affected by delete
  it('should return 404 if no club_admin rows were deleted', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => cb(null, { affectedRows: 0 }));

    const res = await request(app).delete('/DB/club_admins/delete/pfpPath=not_found/club_id=999');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/No records found to delete/);
  });

  // DB error during deletion
  it('should return 500 if DB deletion errors', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => cb(new Error('DB error')));

    const res = await request(app).delete('/DB/club_admins/delete/pfpPath=some_path/club_id=1');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Failed to delete/);
  });

  // Successful attribute update
  it('should update a club name using generic attribute update route', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => {
      expect(query).toMatch(/UPDATE/);
      expect(params).toEqual(['clubs', 'name', 'Updated Club Name', 101]);
      cb(null, { affectedRows: 1 });
    });

    const res = await request(app)
      .post('/DB/clubs/update/attribute')
      .send({ id: 101, attribute: 'name', value: 'Updated Club Name' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/updated successfully/);
  });

  // Update target not found
  it('should return 404 if club to update not found', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => cb(null, { affectedRows: 0 }));

    const res = await request(app)
      .post('/DB/clubs/update/attribute')
      .send({ id: 999, attribute: 'location', value: 'New Building' });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/No record found/);
  });

  // DB error during update
  it('should return 500 on DB update error', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) => cb(new Error('Update failed')));

    const res = await request(app)
      .post('/DB/clubs/update/attribute')
      .send({ id: 101, attribute: 'location', value: 'New Spot' });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Failed to update/);
  });

});
