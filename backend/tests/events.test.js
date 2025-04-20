const request = require('supertest');
let app;

const mockQuery = jest.fn();
const mockPool = { query: mockQuery };

beforeEach(() => {
  jest.resetModules();
  app = require('../app');
  app.set('pool', mockPool);
  require('../routes/event.routes')(app); // Ensure event route is registered
  mockQuery.mockReset();
});

describe('Event Routes', () => {
  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/DB/events/add').send({
      title: 'Hackathon',
      date: '2025-04-30',
      // missing start_time, end_time, etc.
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required field/i);
  });

  it('should return 201 on successful event insert', async () => {
    mockQuery.mockImplementation((query, params, cb) => {
      cb(null, { insertId: 789 });
    });

    const res = await request(app).post('/DB/events/add').send({
      title: 'Hackathon',
      date: '2025-04-30',
      start_time: '10:00',
      end_time: '16:00',
      location: 'Main Hall',
      description: 'Coding all day!',
      club_id: 1
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/Event added successfully/i);
    expect(res.body.id).toBe(789);
  });

  it('should return 500 on DB error', async () => {
    mockQuery.mockImplementationOnce((query, params, cb) =>
      cb(new Error('DB error'))
    );

    const res = await request(app).post('/DB/events/add').send({
      title: 'Workshop',
      date: '2025-05-10',
      start_time: '14:00',
      end_time: '17:00',
      location: 'Room 101',
      description: 'Learn stuff!',
      club_id: 2
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Database error/);
  });
});
