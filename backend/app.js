require('dotenv').config();
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

// AWS Services
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.COGNITO_REGION || 'us-east-1',
});
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

// MySQL Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

app.set('cognito', cognito);
app.set('s3', s3);
app.set('pool', pool);

// Routes — wrap these so you can skip them in test if needed
const registerRoutes = (appInstance) => {
  require('./routes/auth.routes')(appInstance);
  require('./routes/s3.routes')(appInstance);
  require('./routes/club.routes')(appInstance);
  require('./routes/event.routes')(appInstance);
  require('./routes/posts.routes')(appInstance); // this one too
};

if (process.env.NODE_ENV !== 'test') {
  registerRoutes(app);
}

app.set('registerRoutes', registerRoutes); // <-- so tests can call it

// Shutdown
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
