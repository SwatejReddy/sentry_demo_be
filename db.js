const mysql = require('mysql2')

const connection = mysql.createConnection({
    host: 'localhost',           // MySQL host (default is 'localhost')
    user: 'root',                // MySQL username (root by default)
    password: '12345678', // Replace with your MySQL password
    database: 'sentry_demo',
    port: 3306   // Replace with your database name
}).promise()

module.exports = connection;
