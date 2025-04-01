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



//Cognito user FUNCTIONS
// Helper function to get user details by sub
async function getUserBySub(sub) {
    const params = {
        UserPoolId: process.env.USER_POOL_ID || 'us-east-1_UeljCiAIL',
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
        UserPoolId: process.env.USER_POOL_ID || 'us-east-1_UeljCiAIL',
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
app.get('/cognito/get/attribute', async (req, res) => {
    const { sub, attributeName } = req.query;
    console.log('=== /cognito/get/attribute =input= sub: ', sub, ', attributeName: ', attributeName);

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
// Function to add an event
app.post('/DB/events/add', (req, res) => {
    const { title, date, time, location, description, club_id} = req.body;
    console.log('=== /DB/clubs/add =input= title: ', title, ', date: ', date, ', time: ', time, ', location: ', location, ', description: ', description, ', club_id: ', club_id);

    if (!title || !date || !time || !location || !description || !club_id) {
        console.log('All fields are required');
        return res.status(400).json({ message: 'All fields are required.' });
    }
    const query = 'INSERT INTO test.events (title, date, time, location, description, club_id) VALUES (?, ?, ?, ?, ?, ?)';
    pool.query(query, [title, date, time, location, description, club_id], (error, results) => {
        if (error) {
            console.error('Error inserting event:', error);
            return res.status(500).json({ message: 'Database error', error });
        }
        console.log('=== /DB/clubs/add =output= title: ', title, ', date: ', date, ', time: ', time, ', location: ', location, ', description: ', description, ', club_id: ', club_id);
        res.status(201).json({ 
            message: 'Event added successfully', 
            id: results.insertId 
        });
    });
});
// Function to add a post
app.post('/DB/posts/add', (req, res) => {
    const { title, content, filePath, club_id } = req.body;
    console.log('=== /DB/clubs/add =input= title: ', title, ', content: ', content, ', filePath: ', filePath, ', club_id: ', club_id);
    if (!title || !content || !filePath || !club_id) {
        console.log('All fields are required');
        return res.status(400).json({ message: 'All fields are required.' });
    }
    const query = 'INSERT INTO test.posts (title, content, filePath, club_id) VALUES (?, ?, ?, ?)';
    pool.query(query, [title, content, filePath, club_id], (error, results) => {
        if (error) {
            console.error('Error inserting post:', error);
            return res.status(500).json({ message: 'Database error', error });
        }
        console.log('=== /DB/clubs/add =output= title: ', title, ', content: ', content, ', filePath: ', filePath, ', club_id: ', club_id);
        res.status(201).json({ 
            message: 'Post added successfully', 
            id: results.insertId 
        });
    });
});
// Function to add a club admin
app.post('/DB/club_admins/add', (req, res) => {
    const { admin_id, club_id } = req.body;
    console.log('=== /DB/clubs/add =input= admin_id: ', admin_id, ', club_id: ', club_id);
    if (!admin_id || !club_id) {
        console.log('Both admin_id and club_id are required');
        return res.status(400).json({ message: 'Admin ID and Club ID are required.' });
    }
    const query = 'INSERT INTO test.club_admins (admin_id, club_id) VALUES (?, ?)';
    pool.query(query, [admin_id, club_id], (error, results) => {
        if (error) {
            console.error('Error inserting club admin:', error);
            return res.status(500).json({ message: 'Database error', error });
        }
        console.log('=== /DB/clubs/add =output= admin_id: ', admin_id, ', club_id: ', club_id);
        res.status(201).json({ 
            message: 'Club admin added successfully', 
            id: results.insertId 
        });
    });
});


// // Function to get all clubs
// app.get('/DB/clubs/get', (req, res) => {
//     console.log('=== /DB/clubs/get =input=');
//     pool.query('SELECT * FROM clubs', (err, results) => {
//         if (err) {
//             console.error('Error fetching clubs:', err);
//             return res.status(500).json({ message: 'Failed to retrieve clubs' });
//         }
//         console.log('=== /DB/clubs/get =output= success');
//         res.json(results); // Send the retrieved clubs as a JSON response
//     });
// });
// // Function to get a specific attribute of a club, given club ID
// app.get('/DB/clubs/get/attribute', (req, res) => {
//     const { club_id, attribute } = req.query;
//     console.log('=== /DB/clubs/get/attribute =input= club_id: ', club_id, ', attribute: ', attribute);

//     // Check if both club_id and attribute are provided
//     if (!club_id || !attribute) {
//         return res.status(400).json({ message: 'Both club_id and attribute are required.' });
//     }

//     // Construct the SQL query to fetch the specific attribute for the given club_id
//     const query = `SELECT ${attribute} FROM clubs WHERE id = ?`;

//     pool.query(query, [club_id], (err, results) => {
//         if (err) {
//             console.error('Error fetching club attribute:', err);
//             return res.status(500).json({ message: 'Failed to retrieve club attribute' });
//         }

//         // Check if any result was found
//         if (results.length === 0) {
//             return res.status(404).json({ message: 'No club found with the provided ID' });
//         }
//         console.log('=== /DB/clubs/get/attribute =output= attribute: ', attribute, ', value: ', results[0][attribute]);
//         // Return the requested attribute from the result
//         res.json({ [attribute]: results[0][attribute] }); 
//     });
// });
// // Function to update a specific attribute of a club, given club ID
// app.post('/DB/clubs/update/attribute', (req, res) => {
//     const { club_id, attribute, value } = req.body;
//     console.log('=== /DB/clubs/update/attribute =input= club_id: ', club_id, ', attribute: ', attribute, ', value: ', value);

//     // Validate that all required fields are provided
//     if (!club_id || !attribute || value === undefined) {
//         return res.status(400).json({ message: 'club_id, attribute, and value are required.' });
//     }

//     // Construct the SQL query to update the specific attribute for the given club_id
//     const query = `UPDATE clubs SET ${attribute} = ? WHERE id = ?`;

//     pool.query(query, [value, club_id], (err, results) => {
//         if (err) {
//             console.error('Error updating club attribute:', err);
//             return res.status(500).json({ message: 'Failed to update club attribute' });
//         }

//         // Check if any rows were affected (i.e., update was successful)
//         if (results.affectedRows === 0) {
//             return res.status(404).json({ message: 'No club found with the provided ID' });
//         }
//         console.log('=== /DB/clubs/update/attribute =output= attribute: ', attribute, ', value: ', value);
//         res.json({ message: 'Club attribute updated successfully' });
//     });
// });

// Function to get all records from a given table
app.get('/DB/:table/get', (req, res) => {
    const { table } = req.params;
    console.log(`=== /DB/${table}/get =input=`);

    const query = `SELECT * FROM ??`;
    pool.query(query, [table], (err, results) => {
        if (err) {
            console.error(`Error fetching from ${table}:`, err);
            return res.status(500).json({ message: `Failed to retrieve data from ${table}` });
        }
        console.log(`=== /DB/${table}/get =output= success`);
        res.json(results);
    });
});
// Function to get a specific attribute of a record, given ID
app.get('/DB/:table/get/attribute', (req, res) => {
    const { table } = req.params;
    const { id, attribute } = req.query;
    console.log(`=== /DB/${table}/get/attribute =input= id: ${id}, attribute: ${attribute}`);

    if (!id || !attribute) {
        return res.status(400).json({ message: 'Both id and attribute are required.' });
    }

    const query = `SELECT ?? FROM ?? WHERE id = ?`;
    pool.query(query, [attribute, table, id], (err, results) => {
        if (err) {
            console.error(`Error fetching ${attribute} from ${table}:`, err);
            return res.status(500).json({ message: `Failed to retrieve ${attribute} from ${table}` });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: `No record found in ${table} with the provided ID` });
        }

        console.log(`=== /DB/${table}/get/attribute =output= ${attribute}: ${results[0][attribute]}`);
        res.json({ [attribute]: results[0][attribute] });
    });
});
// Function to update a specific attribute of a record, given ID
app.post('/DB/:table/update/attribute', (req, res) => {
    const { table } = req.params;
    const { id, attribute, value } = req.body;
    console.log(`=== /DB/${table}/update/attribute =input= id: ${id}, attribute: ${attribute}, value: ${value}`);

    if (!id || !attribute || value === undefined) {
        return res.status(400).json({ message: 'id, attribute, and value are required.' });
    }

    const query = `UPDATE ?? SET ?? = ? WHERE id = ?`;
    pool.query(query, [table, attribute, value, id], (err, results) => {
        if (err) {
            console.error(`Error updating ${attribute} in ${table}:`, err);
            return res.status(500).json({ message: `Failed to update ${attribute} in ${table}` });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: `No record found in ${table} with the provided ID` });
        }

        console.log(`=== /DB/${table}/update/attribute =output= ${attribute}: ${value}`);
        res.json({ message: `${attribute} updated successfully in ${table}` });
    });
});




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
