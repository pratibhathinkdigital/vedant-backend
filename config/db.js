const mysql = require("mysql2");

// Create a database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || "103.21.59.170",
    user: process.env.DB_USER || "vedanten_vedant_user",
    password: process.env.DB_PASSWORD || "Vedant@2026",
    database: process.env.DB_NAME || "vedanten_vedant_db",
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 15000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Test connection on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ [Database Connection Error]:", err.message, "Host:", process.env.DB_HOST);
    } else {
        console.log("✅ [Database Connected Successfully] to", process.env.DB_HOST || "103.21.59.170");
        connection.release();
    }
});

// Export the pool promise wrapper to use async/await
const db = pool.promise();

module.exports = db;
