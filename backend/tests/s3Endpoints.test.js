
// Mocked function for simulating S3 client's send method
const mockSend = jest.fn();
// Mocked function for simulating generation of signed URLs
const mockGetSignedUrl = jest.fn();

// Mock AWS SDK S3 module
jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...actual, // Spread the actual exports to keep real command classes
    S3Client: jest.fn(() => ({ send: mockSend })), // Mock S3 client to use our mock send function
    GetObjectCommand: actual.GetObjectCommand,
    HeadObjectCommand: actual.HeadObjectCommand,
  };
});

// Mock the S3 request presigner module to simulate signed URL generation
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl
}));

// Import supertest to test HTTP requests to the app
const request = require('supertest');
const app = require('../app');
// Register the S3 routes explicitly for test execution
app.get('registerRoutes')(app);



describe('S3 Endpoints', () => {
  // Reset mocks before each test to ensure clean state
  beforeEach(() => {
    mockSend.mockReset();
    mockGetSignedUrl.mockReset();
  });

  //Generate a signed URL for uploading a file
  it('should return a signed URL for upload', async () => {
    mockGetSignedUrl.mockResolvedValueOnce('https://mock-upload-url.com');

    const res = await request(app)
      .get('/S3/get/upload-signed-url')
      .query({ filePath: 'test/path.jpg' });

    expect(res.statusCode).toBe(200);
    expect(res.body.url).toBe('https://mock-upload-url.com');
  });

  // Generate a signed URL for an existing image
  it('should return a signed URL for existing image', async () => {
    mockSend.mockResolvedValueOnce({}); // Simulate HeadObject success
    mockGetSignedUrl.mockResolvedValueOnce('https://mock-image-url.com');

    const res = await request(app)
      .get('/S3/get/image')
      .query({ filePath: 'existing.jpg', defaultPath: 'fallback.jpg' });

    expect(res.statusCode).toBe(200);
    expect(res.body.url).toBe('https://mock-image-url.com');
  });

  //Fallback to defaultPath if main image is missing
  it('should fallback to defaultPath if image doesn’t exist', async () => {
    const notFoundError = new Error('NotFound');
    notFoundError.name = 'NotFound';
    mockSend.mockRejectedValueOnce(notFoundError); // HeadObject fails for main path
    mockGetSignedUrl.mockResolvedValueOnce('https://fallback-url.com');

    const res = await request(app)
      .get('/S3/get/image')
      .query({ filePath: 'missing.jpg', defaultPath: 'fallback.jpg' });

    expect(res.statusCode).toBe(200);
    expect(res.body.url).toBe('https://fallback-url.com');
  });

  //Return 500 if S3 fails and no fallback is provided
  it('should return 500 if S3 fails and no fallback', async () => {
    mockSend.mockRejectedValueOnce(new Error('Boom'));

    const res = await request(app)
      .get('/S3/get/image')
      .query({ filePath: 'critical.jpg' }); // no defaultPath provided

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/accessing S3/i);
  });

  //Return 500 if generating upload signed URL fails
  it('should return 500 on upload signed URL error', async () => {
    mockGetSignedUrl.mockRejectedValueOnce(new Error('Upload error'));

    const res = await request(app)
      .get('/S3/get/upload-signed-url')
      .query({ filePath: 'badpath.jpg' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/creating signed URL/i);
  });
});
