const request = require('supertest');
const app = require('../app');

// Ensure routes are registered before tests run (if using dynamic route registration)
beforeAll(() => {
  const registerRoutes = app.get('registerRoutes');
  if (registerRoutes) {
    registerRoutes(app);
  }
});

// Import AWS SDK 
const AWS = require('aws-sdk');

// Mock the AWS Cognito Identity Service Provider and its methods
jest.mock('aws-sdk', () => {
  const mockListUsers = jest.fn();
  const mockAdminUpdateUserAttributes = jest.fn();

  const CognitoIdentityServiceProvider = jest.fn(() => ({
    listUsers: mockListUsers,
    adminUpdateUserAttributes: mockAdminUpdateUserAttributes,
  }));

  return {
    CognitoIdentityServiceProvider,
    mockListUsers,
    mockAdminUpdateUserAttributes,
  };
});

// Group tests related to Cognito endpoints
describe('Cognito Attribute Endpoints', () => {
  const testSub = 'fake-sub-1234';
  const testAttr = 'custom:role';
  const testVal = 'admin';
  const testUsername = 'user@example.com';

  beforeEach(() => {
    AWS.mockListUsers.mockReset();
    AWS.mockAdminUpdateUserAttributes.mockReset();
  });

  // test GET /cognito/get/attribute
  describe('GET /cognito/get/attribute', () => {
    it('should return the requested attribute value', async () => {
       // Simulate a successful Cognito user lookup
      AWS.mockListUsers.mockReturnValueOnce({
        promise: () =>
          Promise.resolve({
            Users: [
              {
                Username: testUsername,
                Attributes: [
                  { Name: testAttr, Value: testVal },
                ],
              },
            ],
          }),
      });

       // Make the request and validate the returned value
      const res = await request(app)
        .get('/cognito/get/attribute')
        .query({ sub: testSub, attributeName: testAttr });

      expect(res.statusCode).toBe(200);
      expect(res.body[testAttr]).toBe(testVal);
    });

    it('should return 400 for missing parameters', async () => {
       // Omit required query param (attributeName)
      const res = await request(app)
        .get('/cognito/get/attribute')
        .query({ sub: testSub }); // Missing attributeName

      expect(res.statusCode).toBe(400);
    });

    it('should return 500 for Cognito errors', async () => {
      // Simulate Cognito throwing an error
      AWS.mockListUsers.mockReturnValueOnce({
        promise: () => Promise.reject(new Error('Boom')),
      });

      const res = await request(app)
        .get('/cognito/get/attribute')
        .query({ sub: testSub, attributeName: testAttr });

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toMatch(/Failed to retrieve/);
    });
  });

  // Test POST /cognito/update/attribute
  describe('POST /cognito/update/attribute', () => {
    it('should update the specified attribute', async () => {
      // Mock getting user by sub
      AWS.mockListUsers.mockReturnValueOnce({
        promise: () =>
          Promise.resolve({
            Users: [
              {
                Username: testUsername,
                Attributes: [],
              },
            ],
          }),
      });
      
      // Mock successful update
      AWS.mockAdminUpdateUserAttributes.mockReturnValueOnce({
        promise: () => Promise.resolve(),
      });

      const res = await request(app)
        .post('/cognito/update/attribute')
        .send({
          sub: testSub,
          attributeName: testAttr,
          value: testVal,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(`${testAttr} updated successfully`);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/cognito/update/attribute')
        .send({ sub: testSub }); // Missing required fields

      expect(res.statusCode).toBe(400);
    });

    it('should return 500 for Cognito update failure', async () => {
      // Mock user retrieval success
      AWS.mockListUsers.mockReturnValueOnce({
        promise: () =>
          Promise.resolve({
            Users: [{ Username: testUsername, Attributes: [] }],
          }),
      });
      
       // Simulate update failure
      AWS.mockAdminUpdateUserAttributes.mockReturnValueOnce({
        promise: () => Promise.reject(new Error('Update failed')),
      });

      const res = await request(app)
        .post('/cognito/update/attribute')
        .send({
          sub: testSub,
          attributeName: testAttr,
          value: testVal,
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.message).toMatch(/Failed to update/);
    });
  });
});
