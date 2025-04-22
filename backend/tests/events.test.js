const request = require('supertest');
let app;

// Create mock for the database query function
const mockQuery = jest.fn();
const mockPool = { query: mockQuery };

// Setup runs before each test
beforeEach(() => {
  jest.resetModules(); 
  app = require('../app');
  app.set('pool', mockPool);
  require('../routes/event.routes')(app); 
  mockQuery.mockReset();
});


describe('Event Routes', () => {
  //Missing required fields when adding event
  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/DB/events/add').send({
      title: 'Hackathon'
      // missing description, date, location, club_id
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required field/);
  });

  //Successful event creation
  it('should return 201 on successful event insert', async () => {
    mockQuery.mockImplementation((query, params, cb) => {
      cb(null, { insertId: 777 });
    });

    const res = await request(app).post('/DB/events/add').send({
      title: 'Hackathon',
      description: 'All night coding',
      date: '2025-05-01',
      location: 'Engineering Lab',
      club_id: 1,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/Event created/);
    expect(res.body.id).toBe(777);
  });

  //Database error when adding event
  it('should return 500 on DB error', async () => {
    mockQuery.mockImplementation((q, p, cb) => cb(new Error('DB Error')));

    const res = await request(app).post('/DB/events/add').send({
      title: 'Hackathon',
      description: 'All night coding',
      date: '2025-05-01',
      location: 'Engineering Lab',
      club_id: 1,
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/);
  });

  //Successfully update an event
  it('should update event successfully', async () => {
    mockQuery.mockImplementation((q, p, cb) => cb(null, { affectedRows: 1 }));

    const res = await request(app).put('/DB/events/update/10').send({
      title: 'Updated Title',
      description: 'Updated Desc',
      date: '2025-06-01',
      location: 'Main Hall'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/updated successfully/i);
  });

  //Update non-existent event
  it('should return 404 if event to update not found', async () => {
    mockQuery.mockImplementation((q, p, cb) => cb(null, { affectedRows: 0 }));

    const res = await request(app).put('/DB/events/update/999').send({
      title: 'Title',
      description: 'Desc',
      date: '2025-06-01',
      location: 'Room 101'
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  //Successfully delete an event
  it('should delete event successfully', async () => {
    mockQuery.mockImplementation((q, p, cb) => cb(null, { affectedRows: 1 }));

    const res = await request(app).delete('/DB/events/delete/20');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  //Attempt to delete a non-existent event
  it('should return 404 if event to delete not found', async () => {
    mockQuery.mockImplementation((q, p, cb) => cb(null, { affectedRows: 0 }));

    const res = await request(app).delete('/DB/events/delete/999');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  //DB error during delete operation
  it('should return 500 if delete query fails', async () => {
    mockQuery.mockImplementation((q, p, cb) => cb(new Error('Delete error')));

    const res = await request(app).delete('/DB/events/delete/1');

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/);
  });
});
