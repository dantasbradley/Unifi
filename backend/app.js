require('dotenv').config();

// Import required dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const mysql = require('mysql2');
const { S3Client } = require('@aws-sdk/client-s3');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Initialize AWS Cognito service for user authentication
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.COGNITO_REGION || 'us-east-1',
});
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

// Set up MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Store AWS and DB clients in app context for global access
app.set('cognito', cognito);
app.set('s3', s3);
app.set('pool', pool);

// register application routes
const registerRoutes = (appInstance) => {
  require('./routes/auth.routes')(appInstance);
  require('./routes/s3.routes')(appInstance);
  require('./routes/club.routes')(appInstance);
  require('./routes/event.routes')(appInstance);
  require('./routes/posts.routes')(appInstance);
  require('./routes/likes.routes')(appInstance);
  require('./routes/follows.routes')(appInstance);
  require('./routes/notifications.routes')(app);
  require('./routes/cognito.routes')(appInstance);
  require('./routes/s3endpoints.routes')(appInstance);
};

// Register routes unless running in test environment
if (process.env.NODE_ENV !== 'test') {
  registerRoutes(app);
}

// Expose route registration function and app instance
app.set('registerRoutes', registerRoutes);
module.exports = app;
