const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const AWS = require('aws-sdk');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
let server;

app.use(express.json());
app.use(cors());

// AWS Cognito config
const cognito = new AWS.CognitoIdentityServiceProvider({
    region: process.env.COGNITO_REGION || 'us-east-1',
});

const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID || 'eoesr0bfd0n7i9l8t0vttgjff';

// MySQL RDS connection setup
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'database-1.cgvequuca8td.us-east-1.rds.amazonaws.com',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || 'UnifiMaster21',
    database: process.env.DB_NAME || 'test',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ✅ LOGIN Route with AWS Cognito
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

    // ✅ Initiate Authentication
    cognito.initiateAuth(params, (err, data) => {
        if (err) {
            console.error('❌ Cognito login error:', err);
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // ✅ Check if AuthenticationResult exists before accessing it
        if (!data.AuthenticationResult) {
            console.error('Cognito did not return AuthenticationResult:', data);
            return res.status(500).json({ message: 'Failed to authenticate. Please try again later.' });
        }

	console.log('Login successful for user:', email);

        // ✅ Return the tokens
        res.json({
            message: 'Login successful!',
            accessToken: data.AuthenticationResult.AccessToken,
            idToken: data.AuthenticationResult.IdToken,
            refreshToken: data.AuthenticationResult.RefreshToken,
        });
    });
});

app.post('/signup_cognito', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    // ✅ Validate inputs
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const params = {
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
            { Name: "email", Value: email },
            { Name: "name", Value: firstName + " " + lastName },
        ]
    };

    try {
        const response = await cognito.signUp(params).promise();
        res.json({ message: "Signup successful! Please confirm your email.", userSub: response.UserSub });
    } catch (error) {
        console.error("❌ Cognito signup error:", error);
        res.status(500).json({ message: error.message || "Failed to register user." });
    }
});

app.post('/verification', async (req, res) => {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
        return res.status(400).json({ message: "Email and verification code are required." });
    }

    const params = {
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: verificationCode,
    };

    try {
        await cognito.confirmSignUp(params).promise();
        res.json({ message: "Verification successful! You can now log in." });
    } catch (error) {
        console.error("❌ Cognito verification error:", error);
        res.status(500).json({ message: error.message || "Verification failed." });
    }
});

app.post('/verify', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    const params = {
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
    };

    try {
        await cognito.forgotPassword(params).promise();
        res.json({ message: "Verification code sent! Check your email." });
    } catch (error) {
        console.error("❌ Cognito forgot password error:", error);
        res.status(500).json({ message: error.message || "Failed to send verification code." });
    }
});

app.post('/reset_password', async (req, res) => {
    const { email, verificationCode, newPassword } = req.body;

    if (!email || !verificationCode || !newPassword) {
        return res.status(400).json({ message: "Email, verification code, and new password are required." });
    }

    const params = {
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: verificationCode,
        Password: newPassword,
    };

    try {
        await cognito.confirmForgotPassword(params).promise();
        res.json({ message: "Password reset successful! You can now log in with your new password." });
    } catch (error) {
        console.error("❌ Cognito reset password error:", error);
        res.status(500).json({ message: error.message || "Failed to reset password." });
    }
});



// Test DB connection route
app.get('/api/db-test', (req, res) => {
    pool.query('SELECT NOW() AS currentTime', (err, results) => {
        if (err) {
            console.error('Error querying RDS:', err);
            return res.status(500).json({ error: 'Database connection failed' });
        }
        res.json({ message: 'Connected to RDS successfully!', time: results[0].currentTime });
    });
});

// Simple hello route
app.get('/', (req, res) => {
    res.send('Hello, World from AWS EC2!');
});

// Sample data route
app.get('/api/data', (req, res) => {
    console.log('Frontend has successfully connected to the backend.');
    res.json({ message: 'This is sample data from AWS EC2' });
});

// Shutdown route
app.get('/shutdown', (req, res) => {
    res.send('Shutting down server...');
    if (server) {
        server.close(() => {
            console.log('Server has been shut down via /shutdown endpoint.');
            process.exit(0);
        });
    } else {
        console.log('No active server to shut down.');
        process.exit(1);
    }
});

// Start the server
server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});

// shutdown
const shutdownHandler = (signal) => {
    console.log(`Received ${signal}. Closing server...`);
    if (server) {
        server.close(() => {
            console.log('Server has been shut down. Releasing port.');
            process.exit(0);
        });
    } else {
        console.log('No active server to shut down.');
        process.exit(1);
    }
};

process.on('SIGINT', shutdownHandler);
process.on('SIGTERM', shutdownHandler);