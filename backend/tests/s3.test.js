// Import Supertest
const request = require('supertest');
// Import the Express app instance
const app = require('../app');
// Register the S3-related routes to the app for testing
require('../routes/s3.routes')(app);

// Mock AWS SDK S3 client and commands
jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn(() => ({})),
    PutObjectCommand: jest.fn(),
    GetObjectCommand: jest.fn(),
    HeadObjectCommand: jest.fn(),
  };
});

// Mock AWS SDK's getSignedUrl function for generating signed URLs
jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: jest.fn().mockImplementation(() => Promise.resolve('https://signed.mock.url'))
  };
});

describe('S3 Routes', () => {
  ///Generating a signed URL for uploading a file
  it('should return a signed upload URL', async () => {
    const res = await request(app).get('/S3/get/upload-signed-url?filePath=test-upload.jpg');

    //successful response with a signed URL is returned
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('url');
    expect(res.body.url).toContain('https://');
  });

  //Generating a signed URL for viewing an existing image file
  it('should return a signed view URL for an existing file', async () => {
    const { HeadObjectCommand } = require('@aws-sdk/client-s3');
    
    // Mock S3 `send` method to simulate that the file exists
    const headSpy = jest.fn(() => Promise.resolve()); 
    require('../app').get('s3').send = headSpy;

    const res = await request(app).get('/S3/get/image?filePath=exists.jpg&defaultPath=default.jpg');
    expect(res.statusCode).toBe(200);
    expect(res.body.url).toContain('https://');
  });

  //Falling back to a default file path if the requested file does not exist
  it('should fallback to default path if file does not exist', async () => {
    const { HeadObjectCommand } = require('@aws-sdk/client-s3');
    // Mock S3 `send` method to simulate file not found
    const s3Mock = {
      send: jest.fn((cmd) => {
        if (cmd instanceof HeadObjectCommand) {
          const err = new Error('NotFound');
          err.name = 'NotFound';
          return Promise.reject(err); // Simulate not found
        }
      }),
    };
    // Replace the app's S3 client with this mock
    app.set('s3', s3Mock);

    const res = await request(app).get('/S3/get/image?filePath=notfound.jpg&defaultPath=default.jpg');

    // Assert fallback worked and returned a valid signed URL
    expect(res.statusCode).toBe(200);
    expect(res.body.url).toContain('https://');
  });
});
