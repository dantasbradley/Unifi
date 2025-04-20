const mockSend = jest.fn();
const mockGetSignedUrl = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...actual,
    S3Client: jest.fn(() => ({ send: mockSend })),
    GetObjectCommand: actual.GetObjectCommand,
    HeadObjectCommand: actual.HeadObjectCommand,
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl
}));

const request = require('supertest');
const app = require('../app');
app.get('registerRoutes')(app);



describe('🔹 S3 Endpoints', () => {
  beforeEach(() => {
    mockSend.mockReset();
    mockGetSignedUrl.mockReset();
  });

  it('should return a signed URL for upload', async () => {
    mockGetSignedUrl.mockResolvedValueOnce('https://mock-upload-url.com');

    const res = await request(app)
      .get('/S3/get/upload-signed-url')
      .query({ filePath: 'test/path.jpg' });

    expect(res.statusCode).toBe(200);
    expect(res.body.url).toBe('https://mock-upload-url.com');
  });

  it('should return a signed URL for existing image', async () => {
    mockSend.mockResolvedValueOnce({}); // Simulate HeadObject success
    mockGetSignedUrl.mockResolvedValueOnce('https://mock-image-url.com');

    const res = await request(app)
      .get('/S3/get/image')
      .query({ filePath: 'existing.jpg', defaultPath: 'fallback.jpg' });

    expect(res.statusCode).toBe(200);
    expect(res.body.url).toBe('https://mock-image-url.com');
  });

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

  it('should return 500 if S3 fails and no fallback', async () => {
    mockSend.mockRejectedValueOnce(new Error('Boom'));

    const res = await request(app)
      .get('/S3/get/image')
      .query({ filePath: 'critical.jpg' }); // no defaultPath provided

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/accessing S3/i);
  });

  it('should return 500 on upload signed URL error', async () => {
    mockGetSignedUrl.mockRejectedValueOnce(new Error('Upload error'));

    const res = await request(app)
      .get('/S3/get/upload-signed-url')
      .query({ filePath: 'badpath.jpg' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/creating signed URL/i);
  });
});
