const request = require('supertest');
const app = require('../app');

jest.mock('aws-sdk', () => {
  const mockCognito = {
    initiateAuth: jest.fn((params, callback) => {
      if (params.AuthParameters.USERNAME === 'fail@test.com') {
        return callback({ message: 'Invalid email or password' });
      }
      return callback(null, {
        AuthenticationResult: {
          AccessToken: 'mockAccessToken',
          IdToken: 'mockIdToken',
          RefreshToken: 'mockRefreshToken'
        }
      });
    }),
    signUp: jest.fn().mockReturnValue({
      promise: () => Promise.resolve({ UserSub: 'mock-sub-id' })
    }),
    confirmSignUp: jest.fn().mockReturnValue({
      promise: () => Promise.resolve()
    }),
    forgotPassword: jest.fn().mockReturnValue({
      promise: () => Promise.resolve()
    }),
    confirmForgotPassword: jest.fn().mockReturnValue({
      promise: () => Promise.resolve()
    }),
  };

  return {
    CognitoIdentityServiceProvider: jest.fn(() => mockCognito),
  };
});

describe('Auth Routes', () => {
  it('should return 400 if missing email or password on login', async () => {
    const res = await request(app).post('/login').send({});
    expect(res.statusCode).toBe(400);
  });

  it('should return 401 for invalid login', async () => {
    const res = await request(app).post('/login').send({
      email: 'fail@test.com',
      password: 'wrong'
    });
    expect(res.statusCode).toBe(401);
  });

  it('should return tokens on successful login', async () => {
    const res = await request(app).post('/login').send({
      email: 'success@test.com',
      password: 'validpass'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('idToken');
  });

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

  it('should fail signup if missing fields', async () => {
    const res = await request(app).post('/signup_cognito').send({
      email: 'incomplete@test.com',
      password: '123'
    });
    expect(res.statusCode).toBe(400);
  });

  it('should verify successfully', async () => {
    const res = await request(app).post('/verification').send({
      email: 'verify@test.com',
      verificationCode: '123456'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Verification successful/i);
  });

  it('should initiate forgot password flow', async () => {
    const res = await request(app).post('/verify').send({
      email: 'forgot@test.com'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Verification code sent/i);
  });

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
