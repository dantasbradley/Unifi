const request = require('supertest');
const app = require('../app');
require('../routes/s3.routes')(app);


jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn(() => ({})),
    PutObjectCommand: jest.fn(),
    GetObjectCommand: jest.fn(),
    HeadObjectCommand: jest.fn(),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: jest.fn().mockImplementation(() => Promise.resolve('https://signed.mock.url'))
  };
});

describe('S3 Routes', () => {
  it('should return a signed upload URL', async () => {
    const res = await request(app).get('/S3/get/upload-signed-url?filePath=test-upload.jpg');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('url');
    expect(res.body.url).toContain('https://');
  });

  it('should return a signed view URL for an existing file', async () => {
    const { HeadObjectCommand } = require('@aws-sdk/client-s3');
    const headSpy = jest.fn(() => Promise.resolve()); // Simulate "file exists"
    require('../app').get('s3').send = headSpy;

    const res = await request(app).get('/S3/get/image?filePath=exists.jpg&defaultPath=default.jpg');
    expect(res.statusCode).toBe(200);
    expect(res.body.url).toContain('https://');
  });

  it('should fallback to default path if file does not exist', async () => {
    const { HeadObjectCommand } = require('@aws-sdk/client-s3');
    const s3Mock = {
      send: jest.fn((cmd) => {
        if (cmd instanceof HeadObjectCommand) {
          const err = new Error('NotFound');
          err.name = 'NotFound';
          return Promise.reject(err); // Simulate not found
        }
      }),
    };
    app.set('s3', s3Mock);

    const res = await request(app).get('/S3/get/image?filePath=notfound.jpg&defaultPath=default.jpg');
    expect(res.statusCode).toBe(200);
    expect(res.body.url).toContain('https://');
  });
});
