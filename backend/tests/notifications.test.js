const request = require('supertest');
let app;

// Create mock database query function and mock pool object
const mockQuery = jest.fn();
const mockPool = { query: mockQuery };

// Reset modules and set up app and mock pool before each test
beforeEach(() => {
  jest.resetModules();
  app = require('../app');
  app.set('pool', mockPool);
  require('../routes/notifications.routes')(app);
  mockQuery.mockReset();
});

describe('Notification Routes', () => {
  // return 400 when required fields are missing
  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/DB/notifications/add').send({
      message: 'Missing recipient_id and type',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required field/);
  });

  // should insert a notification successfully and return 201
  it('should return 201 on successful notification insert', async () => {
    mockQuery.mockImplementationOnce((q, p, cb) => cb(null, { insertId: 999 }));

    const res = await request(app).post('/DB/notifications/add').send({
      recipient_id: 1,
      type: 'info',
      message: 'New message received',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/Notification created/);
    expect(res.body.id).toBe(999);
  });

  //return 500 when a DB error occurs during insert
  it('should return 500 on DB error during insert', async () => {
    mockQuery.mockImplementationOnce((q, p, cb) => cb(new Error('DB error')));

    const res = await request(app).post('/DB/notifications/add').send({
      recipient_id: 1,
      type: 'info',
      message: 'This should fail',
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/);
  });

  //successfully delete a notification
  it('should delete a notification successfully', async () => {
    mockQuery.mockImplementationOnce((q, p, cb) => cb(null, { affectedRows: 1 }));

    const res = await request(app).delete('/DB/notifications/delete/5');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Notification deleted/);
  });

  //return 404 if notification is not found for deletion
  it('should return 404 if notification to delete not found', async () => {
    mockQuery.mockImplementationOnce((q, p, cb) => cb(null, { affectedRows: 0 }));

    const res = await request(app).delete('/DB/notifications/delete/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Notification not found/);
  });

  //return 500 if DB delete query fails
  it('should return 500 if delete query fails', async () => {
    mockQuery.mockImplementationOnce((q, p, cb) => cb(new Error('Delete failed')));

    const res = await request(app).delete('/DB/notifications/delete/1');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/);
  });
});
