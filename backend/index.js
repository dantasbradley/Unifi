const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const multerS3 = require('multer-s3');
const multer = require('multer');
const bodyParser = require('body-parser');
const axios = require('axios');

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
        const value = attribute ? attribute.Value : "";

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

app.get('/validate-location', async (req, res) => {
    const input = req.query.location;
    const apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyDnsDgrS88fP7IKbkbRuvK-sU4G__7mG7k'; // Ensure your API key is stored safely in environment variables
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(input)}&inputtype=textquery&fields=formatted_address&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            res.json({ valid: true, data: response.data.candidates[0] });
        } else {
            res.status(404).json({ valid: false, message: "No valid location found" });
        }
    } catch (error) {
        console.error('Error validating location:', error);
        res.status(500).json({ message: 'Failed to validate location' });
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
// helper functions for insert
function handleInsert(res, query, params, successMessage) {
    pool.query(query, params, (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ message: 'Database error', error });
        }
        console.error(successMessage);
        res.status(201).json({ message: successMessage, id: results.insertId });
    });
}
function validateFields(fields, res) {
    for (const key in fields) {
        if (!fields[key]) {
            res.status(400).json({ message: `Missing required field: ${key}` });
            return false;
        }
    }
    return true;
}
//DATABASE FUNCTIONS
// === Add Club ===
app.post('/DB/clubs/add', (req, res) => {
    const { name, location, admin_id } = req.body;
    console.log('=== /DB/clubs/add =input=', { name, location, admin_id });
    if (!validateFields({ name, location, admin_id }, res)) return;

    const query = 'INSERT INTO test.clubs (name, location) VALUES (?, ?)';
    pool.query(query, [name, location], (error, results) => {
        if (error) {
            console.error('Error inserting club:', error);
            return res.status(500).json({ message: 'Database error', error });
        }

        const club_id = results.insertId; // Get the new club's ID
        console.log('=== /DB/clubs/add =output1= Club added with ID: ', club_id);
        

        // Add the admin for the newly created club
        const adminQuery = 'INSERT INTO test.club_admins (admin_id, club_id) VALUES (?, ?)';
        pool.query(adminQuery, [admin_id, club_id], (adminError, adminResults) => {
            if (adminError) {
                console.error('Error inserting club admin:', adminError);
                return res.status(500).json({ message: 'Error adding admin to club', error: adminError });
            }
            
            console.log('Club and admin added successfully');
            res.status(201).json({
                message: 'Club and admin added successfully',
                id: club_id,
            });
        });
    });
});
// === Add Event ===
app.post('/DB/events/add', (req, res) => {
    const { title, date, start_time, end_time, location, description, club_id } = req.body;

    console.log('=== 📥 /DB/events/add =input=');
    console.log('   • Title:', title);
    console.log('   • Date:', date);
    console.log('   • Start Time:', start_time);
    console.log('   • Start Time:', end_time);
    console.log('   • Location:', location);
    console.log('   • Description:', description);
    console.log('   • Club ID:', club_id);

    if (!validateFields({ title, date, start_time, end_time, location, description, club_id }, res)) return;

    const query = 'INSERT INTO test.events (title, date, start_time, end_time, location, description, club_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    console.log('📦 Inserting event into database...');
    
    handleInsert(res, query, [title, date, start_time, end_time, location, description, club_id], 'Event added successfully');
});

// === Add Post ===
app.post('/DB/posts/add', (req, res) => {
    const { title, content, filePath, club_id } = req.body;
    console.log('=== /DB/posts/add =input=', { title, content, filePath, club_id });
    if (!validateFields({ title, content, club_id }, res)) return;

    const query = 'INSERT INTO test.posts (title, content, filePath, club_id) VALUES (?, ?, ?, ?)';
    handleInsert(res, query, [title, content, filePath, club_id], 'Post added successfully');
});

app.delete('/DB/posts/delete/:post_id', async (req, res) => {
    const { post_id } = req.params;

    if (!post_id) {
        return res.status(400).json({ message: 'Post ID is required.' });
    }

    try {
        const query = 'DELETE FROM test.posts WHERE id = ?';
        pool.query(query, [post_id], (err, result) => {
            if (err) {
                console.error('Error deleting post:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'No post found with the provided ID.' });
            }

            console.log(`Post with ID ${post_id} deleted.`);
            res.json({ message: 'Post deleted successfully', post_id });
        });
    } catch (error) {
        console.error('Error during post deletion:', error);
        res.status(500).json({ message: 'Failed to delete post.', error });
    }
});

// === Add Notification ===
app.post('/DB/notifications/add', (req, res) => {
    const { title, type, club_id } = req.body;
    console.log('=== /DB/notifications/add =input=', { title, type, club_id });
    if (!validateFields({ title, type, club_id }, res)) return;

    const query = 'INSERT INTO test.notifications (title, type, club_id) VALUES (?, ?, ?)';
    handleInsert(res, query, [title, type, club_id], 'Notification added successfully');
});
// === Add Following ===
app.post('/DB/following/add', (req, res) => {
    const { user_id, club_id } = req.body;
    console.log('=== /DB/following/add =input=', { user_id, club_id });
    if (!validateFields({ user_id, club_id }, res)) return;

    const query = 'INSERT INTO test.following (user_id, club_id) VALUES (?, ?)';
    handleInsert(res, query, [user_id, club_id], 'Following added successfully');
});
// === Add Like ===
app.post('/DB/likes/add', (req, res) => {
    const { user_id, post_id } = req.body;
    console.log('=== /DB/likes/add =input=', { user_id, post_id });
    if (!validateFields({ user_id, post_id }, res)) return;

    const query = 'INSERT INTO test.likes (user_id, post_id) VALUES (?, ?)';
    handleInsert(res, query, [user_id, post_id], 'Like added successfully');
});
// === Add Attending ===
app.post('/DB/attending/add', (req, res) => {
    const { user_id, event_id } = req.body;
    console.log('=== /DB/attending/add =input=', { user_id, event_id });
    if (!validateFields({ user_id, event_id }, res)) return;

    const query = 'INSERT INTO test.attending (user_id, event_id) VALUES (?, ?)';
    handleInsert(res, query, [user_id, event_id], 'Attending added successfully');
});



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
// Function to get records from a given table based on a column identifier and its value
app.get('/DB/:table/get/:identifier=:value', (req, res) => {
    const { table, identifier, value } = req.params;
    console.log(`=== /DB/${table}/get/${identifier}=${value} =input=`);

    const query = `SELECT * FROM ?? WHERE ?? = ?`;
    pool.query(query, [table, identifier, value], (err, results) => {
        if (err) {
            console.error(`Error fetching from ${table} where ${identifier} = ${value}:`, err);
            return res.status(500).json({ message: `Failed to retrieve data from ${table}` });
        }
        console.log(`=== /DB/${table}/get/${identifier}=${value} =output= success`);
        res.json(results);
    });
});
// Function to check if a record exists based on two identifiers and their values
app.get('/DB/:table/exists/:id1=:val1/:id2=:val2', (req, res) => {
    const { table, id1, val1, id2, val2 } = req.params;
    console.log(`=== /DB/${table}/exists/${id1}=${val1}/${id2}=${val2} =input=`);

    const query = `SELECT EXISTS(SELECT 1 FROM ?? WHERE ?? = ? AND ?? = ?) AS exists`;
    pool.query(query, [table, id1, val1, id2, val2], (err, results) => {
        if (err) {
            console.error(`Error checking existence in ${table}:`, err);
            return res.status(500).json({ message: `Failed to check record existence in ${table}` });
        }

        const exists = !!results[0].exists;
        console.log(`=== /DB/${table}/exists/${id1}=${val1}/${id2}=${val2} =output= ${exists}`);
        res.json({ exists });
    });
});
// Function to delete records from a given table based on two column identifiers and their values
app.delete('/DB/:table/delete/:id1=:val1/:id2=:val2', (req, res) => {
    const { table, id1, val1, id2, val2 } = req.params;
    console.log(`=== /DB/${table}/delete/${id1}=${val1}/${id2}=${val2} =input=`);

    const query = `DELETE FROM ?? WHERE ?? = ? AND ?? = ?`;
    pool.query(query, [table, id1, val1, id2, val2], (err, results) => {
        if (err) {
            console.error(`Error deleting from ${table} where ${id1} = ${val1} and ${id2} = ${val2}:`, err);
            return res.status(500).json({ message: `Failed to delete data from ${table}` });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: `No records found to delete in ${table} where ${id1} = ${val1} and ${id2} = ${val2}` });
        }

        console.log(`=== /DB/${table}/delete/${id1}=${val1}/${id2}=${val2} =output= success`);
        res.json({ message: `Successfully deleted ${results.affectedRows} record(s) from ${table}` });
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


app.get('/DB/posts/get', async (req, res) => {
    const { club_id } = req.query;  // Get club_id from the query string

    if (!club_id) {
        return res.status(400).json({ message: 'Club ID is required.' });
    }

    // SQL query to select all posts where the club_id matches
    const query = 'SELECT * FROM test.posts WHERE club_id = ?';

    try {
        pool.query(query, [club_id], (error, results) => {
            if (error) {
                console.error('Error fetching posts:', error);
                return res.status(500).json({ message: 'Database error', error });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No posts found for this club.' });
            }
            res.json({ message: 'Posts retrieved successfully', posts: results });
        });
    } catch (error) {
        console.error('Server error while fetching posts:', error);
        res.status(500).json({ message: 'Failed to retrieve posts.' });
    }
});

app.delete('/DB/clubs/delete/:club_id', async (req, res) => {
    const club_id = req.params.club_id;

    if (!club_id) {
        return res.status(400).json({ message: 'Club ID is required.' });
    }

    try{
        // Then, delete the club itself
        const deleteClubQuery = 'DELETE FROM test.clubs WHERE id = ?';
        pool.query(deleteClubQuery, [club_id], (err, result) => {
            if (err) {
                console.error('Error deleting club:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'No club found with the provided ID.' });
            }

            console.log(`Club with id ${club_id} deleted.`);
            res.json({ message: 'Club deleted successfully', club_id });
        });

    } catch (error) {
        console.error('Error during club deletion:', error);
        res.status(500).json({ message: 'Failed to delete club and related data.', error });
    }
});

app.put('/DB/posts/update/:post_id', (req, res) => {
    const { post_id } = req.params;
    const { title, content } = req.body;

    console.log('=== /DB/posts/update/:post_id =input=', { post_id, title, content });

    if (!post_id || !title || !content) {
        return res.status(400).json({ message: 'Post ID, title, and content are required.' });
    }

    const query = 'UPDATE test.posts SET title = ?, content = ?, updated_at = NOW() WHERE id = ?';
    pool.query(query, [title, content, post_id], (err, results) => {
        if (err) {
            console.error('Error updating post:', err);
            return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'No post found with the provided ID.' });
        }

        console.log(`Post with ID ${post_id} updated.`);
        res.json({ message: 'Post updated successfully', post_id });
    });
});


app.put('/DB/events/update/:event_id', (req, res) => {
    const { event_id } = req.params;
    const { title, date, start_time, end_time, location, description } = req.body;
  
    console.log("=== /DB/events/update/:event_id =input=", {
      event_id, title, date, start_time, end_time, location, description
    });
  
    if (!event_id || !title || !date || !start_time || !end_time|| !location || !description) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    const query = `
      UPDATE test.events
      SET title = ?, date = ?, start_time = ?, end_time=?, location = ?, description = ?, updated_at = NOW()
      WHERE id = ?
    `;
  
    pool.query(query, [title, date, start_time, end_time, location, description, event_id], (err, result) => {
      if (err) {
        console.error("Error updating event:", err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'No event found with the provided ID.' });
      }
  
      console.log(`✅ Event with ID ${event_id} updated.`);
      res.json({ message: "Event updated successfully", event_id });
    });
  });
  

app.delete('/DB/events/delete/:event_id', async (req, res) => {
    const { event_id } = req.params;

    if (!event_id) {
        return res.status(400).json({ message: 'Event ID is required.' });
    }

    try {
        const query = 'DELETE FROM test.events WHERE id = ?';
        pool.query(query, [event_id], (err, result) => {
            if (err) {
                console.error('Error deleting event:', err);
                return res.status(500).json({ message: 'Database error', error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'No event found with the provided ID.' });
            }

            console.log(`Event with ID ${event_id} deleted.`);
            res.json({ message: 'Event deleted successfully', event_id });
        });
    } catch (error) {
        console.error('Error during event deletion:', error);
        res.status(500).json({ message: 'Failed to delete event.', error });
    }
});



app.get('/likes/count/:post_id', (req, res) => {
    const post_id = req.params.post_id;

    const query = 'SELECT COUNT(*) AS likesCount FROM likes WHERE post_id = ?';
    pool.query(query, [post_id], (err, results) => {
        if (err) {
            console.error('Error fetching likes:', err);
            return res.status(500).json({ message: 'Database error', err });
        }
        res.json({ postId: post_id, likesCount: results[0].likesCount });
    });
});

app.get('/likes/user_likes', (req, res) => {
    const { post_id, user_id } = req.query;
    if (!post_id || !user_id) {
        return res.status(400).json({ message: "post_id and user_id are required" });
    }
    const query = 'SELECT EXISTS(SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?) AS liked';
    pool.query(query, [post_id, user_id], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Database error', error });
        }
        res.json({ isLikedByUser: !!results[0].liked });
    });
});

app.post('/likes/add', (req, res) => {
    const { post_id, user_id } = req.body;

    if (!post_id || !user_id) {
        return res.status(400).json({ message: 'Both post_id and user_id are required.' });
    }

    const query = 'INSERT INTO likes (post_id, user_id) VALUES (?, ?)';
    pool.query(query, [post_id, user_id], (error, results) => {
        if (error) {
            console.error('Error adding like:', error);
            return res.status(500).json({ message: 'Database error', error });
        }
        res.status(201).json({ message: 'Like added successfully', post_id, user_id });
    });
});

app.delete('/likes/remove', (req, res) => {
    const { post_id, user_id } = req.body;

    if (!post_id || !user_id) {
        return res.status(400).json({ message: 'Both post_id and user_id are required.' });
    }

    const query = 'DELETE FROM likes WHERE post_id = ? AND user_id = ?';
    pool.query(query, [post_id, user_id], (error, results) => {
        if (error) {
            console.error('Error removing like:', error);
            return res.status(500).json({ message: 'Database error', error });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'No like found with the given user_id and post_id' });
        }
        res.json({ message: 'Like removed successfully', post_id, user_id });
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