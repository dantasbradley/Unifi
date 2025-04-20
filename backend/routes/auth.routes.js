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
