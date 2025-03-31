const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const multerS3 = require('multer-s3');
const multer = require('multer');
const bodyParser = require('body-parser');

// const s3 = new AWS.S3();

const { S3, S3Client, ListObjectsCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3');
const { getSignedUrl: getSignedUrlAws } = require('@aws-sdk/s3-request-presigner');
const s3Client = new S3({});
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

const cognito = new AWS.CognitoIdentityServiceProvider({
    region: process.env.COGNITO_REGION || 'us-east-1',
});

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
let server;

app.use(express.json());
app.use(cors());
// Set a higher limit if you expect large payloads
app.use(bodyParser.json({ limit: '50mb' }));
// If you're also expecting large URL encoded data:
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID || 'eoesr0bfd0n7i9l8t0vttgjff';

//Cognito authentication FUNCTIONS
// Function to login a user
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
// Function to signup a user
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
// Function to verify a user
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
// Function to verify a user
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
// Function to reset a user's password
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

//S3 FUNCTIONS
async function generateUploadSignedUrl(key, bucket) {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: 'image/jpeg',  // Adjust as needed
    });

    return await getSignedUrlAws(s3, command, { expiresIn: 300 }); // 5 mins expiry
}
// Function to generate PUT signed URL
app.get('/S3/get/upload-signed-url', async (req, res) => {
    const { filePath } = req.query;
    console.log('=== /S3/get/upload-signed-url =input= filePath: ', filePath);
    const bucketName = process.env.S3_BUCKET_NAME || 'bucket-unify';

    try {
        const signedUrl = await generateUploadSignedUrl(filePath, bucketName);
        console.log('=== /S3/get/upload-signed-url =output= signedUrl: ...');
        res.json({ url: signedUrl});
    } catch (err) {
        console.error("Error creating signed URL:", err);
        res.status(500).json({ error: 'Error creating signed URL' });
    }
});
async function generateSignedUrl(key, bucket, res) {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
    });
    try {
        const signedUrl = await getSignedUrlAws(s3, command, { expiresIn: 60 });
        console.log('=== /S3/get/image =output= success');
        res.json({ url: signedUrl });
    } catch (err) {
        console.error('Error generating signed URL: ', err);
        res.status(500).json({ error: 'Error generating URL', details: err });
    }
}
// Function to generate GET signed URL
app.get('/S3/get/image', async (req, res) => {
    const { filePath, defaultPath } = req.query;
    console.log('=== /S3/get/image =input= filePath: ', filePath, ', defaultPath: ', defaultPath);
    const bucketName = process.env.S3_BUCKET_NAME || 'bucket-unify';
    // const filePath = req.query.filepath;
    // const defaultPath = `user_profile_pics/default`;

    try {
        const headParams = {
            Bucket: bucketName,
            Key: filePath
        };
        await s3.send(new HeadObjectCommand(headParams));
        console.log(filePath, 'found in S3, generating URL...');
        generateSignedUrl(filePath, bucketName, res);
    } catch (headErr) {
        // console.error('Catch Error checking object: ', headErr);
        if (headErr.name === 'NotFound') {
            console.log(filePath, 'not found in S3, using default path: ', defaultPath);
            generateSignedUrl(defaultPath, bucketName, res);
        } else {
            console.log('Error accessing S3');
            res.status(500).json({ error: 'Error accessing S3', details: headErr });
        }
    }
});

//Cognito user FUNCTIONS
// Function to get user name
app.post('/get-user-name', async (req, res) => {
	console.log('calling function: /get-user-name');
    const { sub } = req.body;
	console.log('cognito sub1:', sub);

    if (!sub) {
        return res.status(400).json({ message: "Cognito sub is required." });
    }

    // console.log('cognito sub2:', sub);

    try {
        // List users in the user pool and filter by sub
        const params = {
            UserPoolId: process.env.USER_POOL_ID || 'us-east-1_UeljCiAIL',
            Filter: `sub = "${sub}"`,
            Limit: 1
        };

        const data = await cognito.listUsers(params).promise();
	// console.log('data: ', data);
        if (!data.Users || data.Users.length === 0) {
		console.log('no users found with that sub');
            return res.status(404).json({ message: "User not found." });
        }

        // Extract name from attributes
        const nameAttribute = data.Users[0].Attributes.find(attr => attr.Name === "name");
        const name = nameAttribute ? nameAttribute.Value : "Unknown Name";

        console.log('Name found:', name);
        res.json({ name });

    } catch (error) {
        console.error("❌ Error retrieving user:", error);
        res.status(500).json({ message: "Failed to retrieve user details." });
    }
});
// Function to get user email
app.post('/get-email', async (req, res) => {
	console.log('calling function: /get-email');
    const { sub } = req.body;
	console.log('cognito sub1:', sub);

    if (!sub) {
        return res.status(400).json({ message: "Cognito sub is required." });
    }

    // console.log('cognito sub2:', sub);

    try {
        // List users in the user pool and filter by sub
        const params = {
            UserPoolId: process.env.USER_POOL_ID || 'us-east-1_UeljCiAIL',
            Filter: `sub = "${sub}"`,
            Limit: 1
        };

        const data = await cognito.listUsers(params).promise();
	// console.log('data: ', data);
        if (!data.Users || data.Users.length === 0) {
		console.log('no users found with that sub');
            return res.status(404).json({ message: "User not found." });
        }

        // Extract name from attributes
        const emailAttribute = data.Users[0].Attributes.find(attr => attr.Name === "email");
        const email = emailAttribute ? emailAttribute.Value : "Unknown Email";

        console.log('Email found:', email);
        res.json({ email });

    } catch (error) {
        console.error("❌ Error retrieving user:", error);
        res.status(500).json({ message: "Failed to retrieve user details." });
    }
});
// Function to get user clubs following list
app.post('/get-clubs-following', async (req, res) => {
    console.log('calling function: /get-clubs-following');
    const { sub } = req.body;

    if (!sub) {
        return res.status(400).json({ message: "Cognito sub is required." });
    }

    try {
        const params = {
            UserPoolId: process.env.USER_POOL_ID ||'us-east-1_UeljCiAIL',
            Filter: `sub = "${sub}"`,
            Limit: 1
        };

        const data = await cognito.listUsers(params).promise();
        if (!data.Users || data.Users.length === 0) {
            console.log('no users found with that sub');
            return res.status(404).json({ message: "User not found." });
        }

        const clubsAttribute = data.Users[0].Attributes.find(attr => attr.Name === "custom:clubs_following");
        const clubs = clubsAttribute ? clubsAttribute.Value : "No Clubs";
        console.log('Clubs found:', clubs);
        res.json({ clubs });
    } catch (error) {
        console.error("Error retrieving user:", error);
        res.status(500).json({ message: "Failed to retrieve user details." });
    }
});
// Function to update user clubs following list
app.post('/modify-following-clubs', async (req, res) => {
    console.log('calling function: /modify-following-clubs');
    const { sub, clubs } = req.body;

    if (!sub) {
        return res.status(400).json({ message: "Cognito sub is required." });
    }
    if (clubs === undefined) {
        return res.status(400).json({ message: "Clubs data is required." });
    }

    try {
        const params = {
            UserPoolId: process.env.USER_POOL_ID || 'us-east-1_UeljCiAIL',
            Filter: `sub = "${sub}"`,
            Limit: 1
        };

        const data = await cognito.listUsers(params).promise();
        if (!data.Users || data.Users.length === 0) {
            console.log('No users found with that sub');
            return res.status(404).json({ message: "User not found." });
        }

        const username = data.Users[0].Username;
        const updateParams = {
            UserPoolId: process.env.USER_POOL_ID || 'us-east-1_UeljCiAIL',
            Username: username,
            UserAttributes: [
                {
                    Name: 'custom:clubs_following',
                    Value: clubs
                }
            ]
        };

        const updateResult = await cognito.adminUpdateUserAttributes(updateParams).promise();
        console.log('Update result:', updateResult);
        res.json({ message: "Clubs updated successfully." });
    } catch (error) {
        console.error("Error updating clubs in Cognito:", error);
        res.status(500).json({ message: "Failed to update clubs.", details: error });
    }
});
// Function to update user name
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



// Helper function to get user details by sub
async function getUserBySub(sub) {
    const params = {
        UserPoolId: USER_POOL_ID,
        Filter: `sub = "${sub}"`,
        Limit: 1
    };

    const data = await cognito.listUsers(params).promise();
    if (!data.Users || data.Users.length === 0) {
        throw new Error("User not found.");
    }

    return data.Users[0];  // Return user object
}
// Helper function to update user attribute
async function updateUserAttribute(username, attributeName, value) {
    const updateParams = {
        UserPoolId: USER_POOL_ID,
        Username: username,
        UserAttributes: [
            {
                Name: attributeName,
                Value: value
            }
        ]
    };

    await cognito.adminUpdateUserAttributes(updateParams).promise();
}
// Function to get a specific user attribute
app.post('/cognito/get/attribute', async (req, res) => {
    const { sub, attributeName } = req.body;
    console.log('=== /cognito/get/attribute =input= sub: ', sub, ', attributeName: ', attributeName, ', value: ', value);

    if (!sub || !attributeName) {
        return res.status(400).json({ message: "Cognito sub and attribute name are required." });
    }

    try {
        const user = await getUserBySub(sub);
        const attribute = user.Attributes.find(attr => attr.Name === attributeName);
        const value = attribute ? attribute.Value : "Attribute not found";

        console.log(`${attributeName} found:`, value);
        console.log('=== /cognito/get/attribute =output= sub: ', sub, ', attributeName: ', attributeName, ', value: ', value);
        res.json({ [attributeName]: value });

    } catch (error) {
        console.error("Error retrieving user attribute:", error);
        res.status(500).json({ message: "Failed to retrieve user attribute." });
    }
});

// Function to update a specific user attribute
app.post('/cognito/update/attribute', async (req, res) => {
    const { sub, attributeName, value } = req.body;
    console.log('=== /cognito/update/attribute =input= sub: ', sub, ', attributeName: ', attributeName, ', value: ', value);

    if (!sub || !attributeName || value === undefined) {
        return res.status(400).json({ message: "Cognito sub, attribute name, and value are required." });
    }

    try {
        const user = await getUserBySub(sub);
        await updateUserAttribute(user.Username, attributeName, value);

        console.log(`Updated ${attributeName} successfully`);
        console.log('=== /cognito/update/attribute =output= success');
        res.json({ message: `${attributeName} updated successfully.` });

    } catch (error) {
        console.error("Error updating user attribute:", error);
        res.status(500).json({ message: "Failed to update user attribute." });
    }
});





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
//DATABASE FUNCTIONS
// Function to get all clubs
app.get('/DB/clubs/get', (req, res) => {
    console.log('=== /DB/clubs/get =input=');
    pool.query('SELECT * FROM clubs', (err, results) => {
        if (err) {
            console.error('Error fetching clubs:', err);
            return res.status(500).json({ message: 'Failed to retrieve clubs' });
        }
        console.log('=== /DB/clubs/get =output= success');
        res.json(results); // Send the retrieved clubs as a JSON response
    });
});
// Function to get a specific attribute of a club, given club ID
app.get('/DB/clubs/get/attribute', (req, res) => {
    const { club_id, attribute } = req.query;
    console.log('=== /DB/clubs/get/attribute =input= club_id: ', club_id, ', attribute: ', attribute);

    // Check if both club_id and attribute are provided
    if (!club_id || !attribute) {
        return res.status(400).json({ message: 'Both club_id and attribute are required.' });
    }

    // Construct the SQL query to fetch the specific attribute for the given club_id
    const query = `SELECT ${attribute} FROM clubs WHERE id = ?`;

    pool.query(query, [club_id], (err, results) => {
        if (err) {
            console.error('Error fetching club attribute:', err);
            return res.status(500).json({ message: 'Failed to retrieve club attribute' });
        }

        // Check if any result was found
        if (results.length === 0) {
            return res.status(404).json({ message: 'No club found with the provided ID' });
        }
        console.log('=== /DB/clubs/get/attribute =output= attribute: ', attribute, ', value: ', results[0][attribute]);
        // Return the requested attribute from the result
        res.json({ [attribute]: results[0][attribute] }); 
    });
});
// Function to add a club
app.post('/DB/clubs/add', (req, res) => {
    const { name, location } = req.body;
    console.log('=== /DB/clubs/add =input= name: ', name, ', location: ', location);

    if (!name || !location) {
        console.log('Both name and location are required');
        return res.status(400).json({ message: 'Club name and location are required.' });
    }

    const query = 'INSERT INTO test.clubs (name, location) VALUES (?, ?)';

    pool.query(query, [name, location], (error, results) => {
        if (error) {
            console.error('Error inserting club:', error);
            return res.status(500).json({ message: 'Database error', error });
        }
        console.log('=== /DB/clubs/add =output= name: ', name, ', location: ', location);
        res.status(201).json({ 
            message: 'Club added successfully', 
            id: results.insertId 
        });
    });
});
// Function to update a specific attribute of a club, given club ID
app.post('/DB/clubs/update/attribute', (req, res) => {
    const { club_id, attribute, value } = req.body;
    console.log('=== /DB/clubs/update/attribute =input= club_id: ', club_id, ', attribute: ', attribute, ', value: ', value);

    // Validate that all required fields are provided
    if (!club_id || !attribute || value === undefined) {
        return res.status(400).json({ message: 'club_id, attribute, and value are required.' });
    }

    // Construct the SQL query to update the specific attribute for the given club_id
    const query = `UPDATE clubs SET ${attribute} = ? WHERE id = ?`;

    pool.query(query, [value, club_id], (err, results) => {
        if (err) {
            console.error('Error updating club attribute:', err);
            return res.status(500).json({ message: 'Failed to update club attribute' });
        }

        // Check if any rows were affected (i.e., update was successful)
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'No club found with the provided ID' });
        }
        console.log('=== /DB/clubs/update/attribute =output= attribute: ', attribute, ', value: ', value);
        res.json({ message: 'Club attribute updated successfully' });
    });
});


// // Test DB connection route
// app.get('/api/db-test', (req, res) => {
//     pool.query('SELECT NOW() AS currentTime', (err, results) => {
//         if (err) {
//             console.error('Error querying RDS:', err);
//             return res.status(500).json({ error: 'Database connection failed' });
//         }
//         res.json({ message: 'Connected to RDS successfully!', time: results[0].currentTime });
//     });
// });

// // Simple hello route
// app.get('/', (req, res) => {
//     res.send('Hello, World from AWS EC2!');
// });

// // Sample data route
// app.get('/api/data', (req, res) => {
//     console.log('Frontend has successfully connected to the backend.');
//     res.json({ message: 'This is sample data from AWS EC2' });
// });

//Other FUNCTIONS
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

// Shutdown the server
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
