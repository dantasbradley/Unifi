// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const mysql = require('mysql2');
const { S3, S3Client } = require('@aws-sdk/client-s3');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// AWS Services
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.COGNITO_REGION || 'us-east-1',
});
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Attach services to app for easy mocking/testing
app.set('cognito', cognito);
app.set('s3', s3);
app.set('pool', pool);

// Route imports
// require('./routes/auth.routes')(app);
// require('./routes/s3.routes')(app);
// require('./routes/club.routes')(app);
// require('./routes/event.routes')(app);
// require('./routes/post.routes')(app);
// require('./routes/like.routes')(app);
// require('./routes/utility.routes')(app);
// require('./routes/follow.routes')(app);
// require('./routes/notification.routes')(app);

// Graceful Shutdown Route
app.get('/shutdown', (req, res) => {
  res.send('Shutting down server...');
  if (app.server) {
    app.server.close(() => {
      console.log('Server shutdown complete');
      process.exit(0);
    });
  } else {
    process.exit(1);
  }
});

module.exports = app;

if (process.env.NODE_ENV !== 'test') {
    require('./routes/auth.routes')(app);
    require('./routes/s3.routes')(app);
    require('./routes/club.routes')(app);
    // ...other routes
  }
  
