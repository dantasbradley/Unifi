const request = require('supertest');
const app = require('../app');

jest.mock('aws-sdk', () => {
  const CognitoIdentityServiceProvider = {
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
    })
  };
  return {
    CognitoIdentityServiceProvider: jest.fn(() => CognitoIdentityServiceProvider)
  };
});

describe('Auth Routes', () => {
  it('should return 400 if missing email or password', async () => {
    const res = await request(app).post('/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Email and password are required.');
  });

  it('should return 401 for invalid credentials', async () => {
    const res = await request(app).post('/login').send({
      email: 'fail@test.com',
      password: 'wrong'
    });
    expect(res.statusCode).toBe(401);
  });

  it('should return tokens on successful login', async () => {
    const res = await request(app).post('/login').send({
      email: 'test@test.com',
      password: 'validpassword'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('idToken');
    expect(res.body).toHaveProperty('refreshToken');
  });
});
