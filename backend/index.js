const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const AWS = require('aws-sdk');
require('dotenv').config();
const bcrypt = require("bcryptjs");

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
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    // Query database for user
    pool.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Database error." });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const user = results[0];

        // ✅ Compare hashed password with input password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        res.json({ message: "Login successful!", userId: user.id });
    });
});

app.post("/signup_cognito", async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "All fields are required." });
    }

    // ✅ Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    pool.query("INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)", 
    [email, hashedPassword, firstName, lastName], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error." });
        res.json({ message: "User registered successfully!" });
    });
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
