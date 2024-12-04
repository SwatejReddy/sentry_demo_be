require("./instrument.js");

const { ApolloServer } = require('apollo-server')
const { typeDefs } = require('./schema/type-defs')
const { resolvers } = require('./schema/resolvers')
const connection = require('./db')
const authMiddleware = require('./authMiddleware')

const Sentry = require("@sentry/node");

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        try {
            const user = await authMiddleware(req);
            if (user && user.userId) {
                Sentry.setUser({ id: user.userId });
            } else {
                Sentry.setUser({ id: null });
            }
            return { user }; // Attach user context
        } catch (error) {
            console.error("Authentication error:", error.message);
            Sentry.setUser({ id: null });
            return {}; // No user context if authentication fails
        }
    },
    // Global error handler for all GraphQL queries
    formatError: (error) => {
        // Automatically send any error to Sentry
        Sentry.captureException(error);
        // Optionally, you can hide sensitive information or mask errors for the client
        return error;
    },
})


server.listen().then(async ({ url }) => {
    console.log(`The server is running at ${url}`)
})















// import express from 'express';
// import mysql from 'mysql2';

// // Create an Express app
// const app = express();
// const port = 3000;

// // MySQL connection
// const connection = mysql.createConnection({
//     host: 'localhost',           // MySQL host (default is 'localhost')
//     user: 'root',                // MySQL username (root by default)
//     password: '12345678', // Replace with your MySQL password
//     database: 'sentry_demo',
//     port: 3306   // Replace with your database name
// }).promise()

// // Middleware to handle requests
// app.use(express.json());


// // PRODUCT ROUTES:
// app.get('/products', async (req, res) => {
//     try {
//         console.log('Fetching products from MySQL');
//         const [products] = await connection.query('SELECT * FROM products');
//         res.json(products);
//     } catch (e) {
//         console.error(e);
//         res.status(500).json({ error: 'Error fetching from MySQL' });
//     }
// });

// app.post('/products', sync(req, res) => {
//     try {

//     }
// })

// // Route 1: Basic route for testing
// app.get('/', (req, res) => {
//     res.send('Hello, World!');
// });

// // Route 2: Route that queries the MySQL database
// app.get('/db', (req, res) => {
//     connection.query('SELECT NOW()', (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: 'Error fetching from MySQL' });
//         }
//         res.json(results);
//     });
// });

// app.get('/products', (req, res) => {
//     connection.query('SELECT * FROM products', (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: 'Error fetching from MySQL' });
//         }
//         res.json(results);
//     });
// })

// // Start the server
// app.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}`);
// });
