const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const multerS3 = require('multer-s3');
const multer = require('multer');

// const s3 = new AWS.S3();

const { S3, S3Client, ListObjectsCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl: getSignedUrlAws } = require('@aws-sdk/s3-request-presigner');
const s3Client = new S3({});
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

const cognito = new AWS.CognitoIdentityServiceProvider({
    region: process.env.COGNITO_REGION || 'us-east-1',
});

// const { CognitoIdentityServiceProvider } = require('@aws-sdk/client-cognito-identity-provider');
// const cognito = new CognitoIdentityServiceProvider({ region: process.env.COGNITO_REGION || 'us-east-1' });



require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
let server;

app.use(express.json());
app.use(cors());

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

// Configure multer-s3 to use the AWS SDK v3 S3 client
const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.S3_BUCKET_NAME || 'bucket-unify',
        key: function (req, file, cb) {
            const fullPath = `user_profile_pics/${file.originalname}`;
            cb(null, fullPath);
        }
    })
});

app.post('/upload', upload.single('image'), (req, res) => {
    console.log('/upload');
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    res.json({ message: 'File uploaded successfully!', fileUrl: req.file.location });
});

async function generateSignedUrl(key, bucket, res) {
    console.log('generateSignedUrl ', signedUrl);
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
    });

    try {
        const signedUrl = await getSignedUrlAws(s3, command, { expiresIn: 60 });
        console.log('Generated signed URL: ', signedUrl);
        res.json({ url: signedUrl });
    } catch (err) {
        console.error('Error generating signed URL: ', err);
        res.status(500).json({ error: 'Error generating URL', details: err });
    }
}

app.get('/get-user-image', async (req, res) => {
    console.log('/get-user-image');
    const fileName = req.query.filename;
    console.log('filename: ', fileName);
    const bucketName = process.env.S3_BUCKET_NAME || 'bucket-unify';
    const filePath = `user_profile_pics/${fileName}`;
    const defaultPath = `user_profile_pics/default`;
    console.log('bucketName: ', bucketName);
    console.log('filepath: ', filePath);
    console.log('defaultPath: ', defaultPath);

    try {
        console.log('Try.');
        const headParams = {
            Bucket: bucketName,
            Key: filePath
        };
        console.log('HeadObject...');
        await s3.send(new HeadObjectCommand(headParams));
        console.log('File found in S3, generating URL...');
        generateSignedUrl(filePath, bucketName, res);
        console.log('Generated URL...');
    } catch (headErr) {
        console.error('Error checking object: ', headErr);
        console.log('Catch.');
        if (headErr.name === 'NotFound') {
            console.log('File not found, using default path...');
            generateSignedUrl(defaultPath, bucketName, res);
        } else {
            console.log('else .. ');
            res.status(500).json({ error: 'Error accessing S3', details: headErr });
        }
        console.log('Catch ended...');
    }
});


// Test route to check S3 bucket connectivity
// app.get('/test-s3', (req, res) => {
//     s3.listObjects({ Bucket: 'bucket-unify' }, function(err, data) {
//       if (err) {
//         console.log(err, err.stack); // an error occurred
//         res.status(500).send('Error accessing S3: ' + err.message);
//       } else {
//         console.log(data); // successful response
//         res.send('S3 Bucket Contents: ' + JSON.stringify(data));
//       }
//     });
//   });

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

    // Decode the idToken to get the sub
    const decoded = jwt.decode(data.AuthenticationResult.IdToken);

    // Get the sub (Cognito user identifier)
    const _cognitoSub = decoded.sub;

    console.log('cognito sub:', _cognitoSub);
        
        // ✅ Return the tokens
        res.json({
            message: 'Login successful!',
            accessToken: data.AuthenticationResult.AccessToken,
            idToken: data.AuthenticationResult.IdToken,
            refreshToken: data.AuthenticationResult.RefreshToken,
            cognitoSub: _cognitoSub,
        });
    });
});

app.post('/get-user-name', async (req, res) => {
	console.log('calling function: /get-user-name');
    const { sub } = req.body;
	console.log('cognito sub1:', sub);

    if (!sub) {
        return res.status(400).json({ message: "Cognito sub is required." });
    }

    console.log('cognito sub2:', sub);

    try {
        // List users in the user pool and filter by sub
        const params = {
            UserPoolId: process.env.USER_POOL_ID || 'us-east-1_UeljCiAIL',
            Filter: `sub = "${sub}"`,
            Limit: 1
        };

        const data = await cognito.listUsers(params).promise();
	console.log('data: ', data);
        if (!data.Users || data.Users.length === 0) {
		console.log('no users found with that sub');
            return res.status(404).json({ message: "User not found." });
        }

        // Extract name from attributes
        const nameAttribute = data.Users[0].Attributes.find(attr => attr.Name === "name");
        const name = nameAttribute ? nameAttribute.Value : "Unknown Name";

        console.log('User:', name);
        res.json({ name });

    } catch (error) {
        console.error("❌ Error retrieving user:", error);
        res.status(500).json({ message: "Failed to retrieve user details." });
    }
});

app.post('/get-email', async (req, res) => {
	console.log('calling function: /get-email');
    const { sub } = req.body;
	console.log('cognito sub1:', sub);

    if (!sub) {
        return res.status(400).json({ message: "Cognito sub is required." });
    }

    console.log('cognito sub2:', sub);

    try {
        // List users in the user pool and filter by sub
        const params = {
            UserPoolId: process.env.USER_POOL_ID || 'us-east-1_UeljCiAIL',
            Filter: `sub = "${sub}"`,
            Limit: 1
        };

        const data = await cognito.listUsers(params).promise();
	console.log('data: ', data);
        if (!data.Users || data.Users.length === 0) {
		console.log('no users found with that sub');
            return res.status(404).json({ message: "User not found." });
        }

        // Extract name from attributes
        const emailAttribute = data.Users[0].Attributes.find(attr => attr.Name === "email");
        const email = emailAttribute ? emailAttribute.Value : "Unknown Email";

        console.log('User:', email);
        res.json({ email });

    } catch (error) {
        console.error("❌ Error retrieving user:", error);
        res.status(500).json({ message: "Failed to retrieve user details." });
    }
});

app.post('/change-user-name', async (req, res) => {
	console.log('calling function: /change-user-name');
    const { sub, newName } = req.body;
    console.log('cognito sub:', sub);

    if (!sub || !newName) {
        return res.status(400).json({ message: "Cognito sub and new name are required." });
    }

    try {
        // List users in the user pool and filter by sub
        const params = {
            UserPoolId: process.env.USER_POOL_ID || 'us-east-1_UeljCiAIL',
            Filter: `sub = "${sub}"`,
            Limit: 1
        };

        const data = await cognito.listUsers(params).promise();
        console.log('data: ', data);
        if (!data.Users || data.Users.length === 0) {
            console.log('no users found with that sub');
            return res.status(404).json({ message: "User not found." });
        }

        // User found, proceed to update name
        const user = data.Users[0];
        const updateParams = {
            UserPoolId: process.env.USER_POOL_ID || 'us-east-1_UeljCiAIL',
            Username: user.Username,
            UserAttributes: [
                {
                    Name: 'name',
                    Value: newName
                }
            ]
        };

        const updateData = await cognito.adminUpdateUserAttributes(updateParams).promise();
        console.log('Update success:', updateData);
        res.json({ message: "User name updated successfully." });

    } catch (error) {
        console.error("❌ Error updating user name:", error);
        res.status(500).json({ message: "Failed to update user name." });
    }
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
