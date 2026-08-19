const mysql = require("mysql2");

// Create a database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "vedant_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export the pool promise wrapper to use async/await
const db = pool.promise();

module.exports = db;
