// const express = require('express');
// const cors = require('cors');
// const app = express();
// const port = 3000;
// let server;

// // Middleware to parse JSON
// app.use(express.json());

// // Enable CORS
// app.use(cors());

// // Simple route
// app.get('/', (req, res) => {
//     res.send('Hello, World!');
// });

// // API route
// app.get('/api/data', (req, res) => {
//     console.log('Frontend has successfully connected to the backend.');
//     res.json({ message: 'This is sample data' });
// });

// // Shutdown route
// app.get('/shutdown', (req, res) => {
//     res.send('Shutting down server...');
//     if (server) {
//         server.close(() => {
//             console.log('Server has been shut down via /shutdown endpoint.');
//             process.exit(0);
//         });
//     } else {
//         console.log('No active server to shut down.');
//         process.exit(1);
//     }
// });

// // Start the server
// server = app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });

// // Handle server shutdown gracefully
// const shutdownHandler = (signal) => {
//     console.log(`Received ${signal}. Closing server...`);
//     if (server) {
//         server.close(() => {
//             console.log('Server has been shut down. Releasing port.');
//             process.exit(0);
//         });
//     } else {
//         console.log('No active server to shut down.');
//         process.exit(1);
//     }
// };

// process.on('SIGINT', shutdownHandler);
// process.on('SIGTERM', shutdownHandler);


const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default to 3000
let server;

// Middleware to parse JSON
app.use(express.json());

// Enable CORS for all origins (temporarily for testing)
app.use(cors());

// Simple route
app.get('/', (req, res) => {
    res.send('Hello, World from AWS EC2!');
});

// API route
app.get('/api/data', (req, res) => {
    console.log('Frontend has successfully connected to the backend.');
    res.json({ message: 'This is sample data from AWS EC2' });
});

// Shutdown route (use cautiously in production)
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

// Handle EC2 shutdown gracefully
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
