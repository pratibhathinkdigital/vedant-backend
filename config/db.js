const mysql = require("mysql2");

let pool;

const connectionUrl = process.env.MYSQL_PRIVATE_URL || process.env.MYSQL_URL || process.env.DATABASE_URL;

if (connectionUrl) {
    pool = mysql.createPool(connectionUrl);
} else {
    pool = mysql.createPool({
        host: process.env.MYSQLHOST || process.env.DB_HOST || "shinkansen.proxy.rlwy.net",
        user: process.env.MYSQLUSER || process.env.DB_USER || "root",
        password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "mCXwFCvpvAaatXAnQXJHkPesoLxsdMCq",
        database: process.env.MYSQLDATABASE || process.env.DB_NAME || "railway",
        port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT, 10) || 51954,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 15000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000
    });
}

// Test connection on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ [Database Connection Error]:", err.message);
    } else {
        console.log("✅ [Database Connected Successfully]");
        connection.release();
    }
});

// Export the pool promise wrapper to use async/await
const db = pool.promise();

module.exports = db;
