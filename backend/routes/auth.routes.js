const jwt = require('jsonwebtoken');

module.exports = (app) => {
  const cognito = app.get('cognito');
  const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID || 'dummy-client-id';

  app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    cognito.initiateAuth(params, (err, data) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const decoded = jwt.decode(data.AuthenticationResult.IdToken);
      const sub = decoded?.sub || 'mock-sub';

      res.json({
        message: 'Login successful!',
        accessToken: data.AuthenticationResult.AccessToken,
        idToken: data.AuthenticationResult.IdToken,
        refreshToken: data.AuthenticationResult.RefreshToken,
        cognitoSub: sub,
      });
    });
  });
};

module.exports = (app) => {
    const cognito = app.get('cognito');
    const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID || 'dummy-client-id';
  
    const jwt = require('jsonwebtoken');
  
    app.post('/login', (req, res) => {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }
  
      const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: COGNITO_CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      };
  
      cognito.initiateAuth(params, (err, data) => {
        if (err) return res.status(401).json({ message: 'Invalid email or password.' });
  
        const decoded = jwt.decode(data.AuthenticationResult.IdToken);
        const sub = decoded?.sub || 'mock-sub';
  
        res.json({
          message: 'Login successful!',
          accessToken: data.AuthenticationResult.AccessToken,
          idToken: data.AuthenticationResult.IdToken,
          refreshToken: data.AuthenticationResult.RefreshToken,
          cognitoSub: sub,
        });
      });
    });
  
    app.post('/signup_cognito', async (req, res) => {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'All fields are required.' });
      }
  
      const params = {
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'name', Value: `${firstName} ${lastName}` },
        ]
      };
  
      try {
        const response = await cognito.signUp(params).promise();
        res.json({ message: 'Signup successful! Please confirm your email.', userSub: response.UserSub });
      } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to register user.' });
      }
    });
  
    app.post('/verification', async (req, res) => {
      const { email, verificationCode } = req.body;
  
      if (!email || !verificationCode) {
        return res.status(400).json({ message: 'Email and verification code are required.' });
      }
  
      const params = {
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: verificationCode,
      };
  
      try {
        await cognito.confirmSignUp(params).promise();
        res.json({ message: 'Verification successful! You can now log in.' });
      } catch (error) {
        res.status(500).json({ message: error.message || 'Verification failed.' });
      }
    });
  
    app.post('/verify', async (req, res) => {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
      }
  
      const params = {
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
      };
  
      try {
        await cognito.forgotPassword(params).promise();
        res.json({ message: 'Verification code sent! Check your email.' });
      } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to send verification code.' });
      }
    });
  
    app.post('/reset_password', async (req, res) => {
      const { email, verificationCode, newPassword } = req.body;
  
      if (!email || !verificationCode || !newPassword) {
        return res.status(400).json({ message: 'Email, verification code, and new password are required.' });
      }
  
      const params = {
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: verificationCode,
        Password: newPassword,
      };
  
      try {
        await cognito.confirmForgotPassword(params).promise();
        res.json({ message: 'Password reset successful! You can now log in with your new password.' });
      } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to reset password.' });
      }
    });
  };
  