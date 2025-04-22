// Import supertest to simulate HTTP requests
const request = require('supertest');

// Import the Express app
const app = require('../app');

// Attach the auth routes to the app for testing
require('../routes/auth.routes')(app);

// Mock the AWS Cognito SDK
jest.mock('aws-sdk', () => {
  const mockCognito = {
    initiateAuth: jest.fn((params, callback) => {
      if (params.AuthParameters.USERNAME === 'fail@test.com') {
        return callback({ message: 'Invalid email or password' });
      }
      // Simulate login success
      return callback(null, {
        AuthenticationResult: {
          AccessToken: 'mockAccessToken',
          IdToken: 'mockIdToken',
          RefreshToken: 'mockRefreshToken'
        }
      });
    }),
    // Mock sign-up behavior
    signUp: jest.fn().mockReturnValue({
      promise: () => Promise.resolve({ UserSub: 'mock-sub-id' })
    }),
    // Mock verification of sign-up
    confirmSignUp: jest.fn().mockReturnValue({
      promise: () => Promise.resolve()
    }),
    // Mock initiation of password reset
    forgotPassword: jest.fn().mockReturnValue({
      promise: () => Promise.resolve()
    }),
    // Mock confirmation of new password
    confirmForgotPassword: jest.fn().mockReturnValue({
      promise: () => Promise.resolve()
    }),
  };

  // Return the mocked Cognito service
  return {
    CognitoIdentityServiceProvider: jest.fn(() => mockCognito),
  };
});

describe('Auth Routes', () => {

  // Test: login fails if email/password is missing
  it('should return 400 if missing email or password on login', async () => {
    const res = await request(app).post('/login').send({});
    expect(res.statusCode).toBe(400);
  });

  // Test: login fails if credentials are invalid
  it('should return 401 for invalid login', async () => {
    const res = await request(app).post('/login').send({
      email: 'fail@test.com',
      password: 'wrong'
    });
    expect(res.statusCode).toBe(401);
  });

  // Test: login succeeds with valid credentials
  it('should return tokens on successful login', async () => {
    const res = await request(app).post('/login').send({
      email: 'success@test.com',
      password: 'validpass'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('idToken');
  });

  // Test: successful sign-up returns userSub
  it('should sign up successfully', async () => {
    const res = await request(app).post('/signup_cognito').send({
      email: 'newuser@test.com',
      password: 'NewPassword123!',
      firstName: 'John',
      lastName: 'Doe'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Signup successful/i);
    expect(res.body).toHaveProperty('userSub');
  });

  // Test: signup fails if required fields are missing
  it('should fail signup if missing fields', async () => {
    const res = await request(app).post('/signup_cognito').send({
      email: 'incomplete@test.com',
      password: '123'
    });
    expect(res.statusCode).toBe(400);
  });

  // Test: successful email verification
  it('should verify successfully', async () => {
    const res = await request(app).post('/verification').send({
      email: 'verify@test.com',
      verificationCode: '123456'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Verification successful/i);
  });


  // Test: forgot password initiation
  it('should initiate forgot password flow', async () => {
    const res = await request(app).post('/verify').send({
      email: 'forgot@test.com'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Verification code sent/i);
  });

  // Test: successful password reset
  it('should reset password successfully', async () => {
    const res = await request(app).post('/reset_password').send({
      email: 'reset@test.com',
      verificationCode: '123456',
      newPassword: 'NewPass123!'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Password reset successful/i);
  });
});
