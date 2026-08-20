const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({
    host: 'shinkansen.proxy.rlwy.net',
    user: 'root',
    password: 'mCXwFCvpvAaatXAnQXJHkPesoLxsdMCq',
    database: 'railway',
    port: 51954
  });
  await conn.execute('CREATE TABLE IF NOT EXISTS contact_inquiries (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, phone VARCHAR(50) NOT NULL, company_name VARCHAR(255), email VARCHAR(255) NOT NULL, address TEXT, message TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
  const [rows] = await conn.execute("SHOW TABLES LIKE 'contact_inquiries'");
  console.log('Done. Table exists:', rows.length > 0);
  await conn.end();
}
run().catch(console.error);
