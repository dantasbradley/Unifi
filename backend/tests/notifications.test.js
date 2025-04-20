const request = require('supertest');
let app;

const mockQuery = jest.fn();
const mockPool = { query: mockQuery };

beforeEach(() => {
  jest.resetModules();
  app = require('../app');
  app.set('pool', mockPool);
  require('../routes/notifications.routes')(app);
  mockQuery.mockReset();
});

describe('Notification Routes', () => {
  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/DB/notifications/add').send({
      message: 'Missing recipient_id and type',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required field/);
  });

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

  it('should delete a notification successfully', async () => {
    mockQuery.mockImplementationOnce((q, p, cb) => cb(null, { affectedRows: 1 }));

    const res = await request(app).delete('/DB/notifications/delete/5');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Notification deleted/);
  });

  it('should return 404 if notification to delete not found', async () => {
    mockQuery.mockImplementationOnce((q, p, cb) => cb(null, { affectedRows: 0 }));

    const res = await request(app).delete('/DB/notifications/delete/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Notification not found/);
  });

  it('should return 500 if delete query fails', async () => {
    mockQuery.mockImplementationOnce((q, p, cb) => cb(new Error('Delete failed')));

    const res = await request(app).delete('/DB/notifications/delete/1');
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/);
  });
});
