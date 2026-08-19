const db = require('./config/db');

async function main() {
    // Create admin_users table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('Table created/verified');

    // Check existing admins
    const [rows] = await db.query('SELECT * FROM admin_users');
    if (rows.length === 0) {
        await db.execute('INSERT INTO admin_users (username, password) VALUES (?, ?)', ['admin', 'admin']);
        console.log('Default admin created: username=admin, password=admin');
    } else {
        console.log('Existing admin users:', rows);
    }
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
