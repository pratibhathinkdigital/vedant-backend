const db = require("../config/db");

class Gallery {
    static async initTable() {
        try {
            const sql = `
                CREATE TABLE IF NOT EXISTS galleries (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255),
                    subtitle VARCHAR(255),
                    image VARCHAR(255) NOT NULL,
                    date VARCHAR(100),
                    time VARCHAR(100),
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await db.query(sql);

            // Add columns to existing table if they don't exist
            const [columnsInfo] = await db.query("SHOW COLUMNS FROM galleries");
            const columns = columnsInfo.map(col => col.Field);
            
            if (!columns.includes("title")) {
                await db.query("ALTER TABLE galleries ADD COLUMN title VARCHAR(255)");
            }
            if (!columns.includes("subtitle")) {
                await db.query("ALTER TABLE galleries ADD COLUMN subtitle VARCHAR(255)");
            }
            if (!columns.includes("date")) {
                await db.query("ALTER TABLE galleries ADD COLUMN date VARCHAR(100)");
            }
            if (!columns.includes("time")) {
                await db.query("ALTER TABLE galleries ADD COLUMN time VARCHAR(100)");
            }
            if (!columns.includes("description")) {
                await db.query("ALTER TABLE galleries ADD COLUMN description TEXT");
            }

            console.log("Galleries table ready");
        } catch (err) {
            console.error("Error creating/altering galleries table:", err);
        }
    }

    static async getAll() {
        const [rows] = await db.query(
            "SELECT * FROM galleries ORDER BY id DESC"
        );
        return rows;
    }

    static async count() {
        const [rows] = await db.query("SELECT COUNT(*) AS total FROM galleries");
        return rows[0].total;
    }

    static async findById(id) {
        const [rows] = await db.query(
            "SELECT * FROM galleries WHERE id = ?",
            [id]
        );
        return rows[0] || null;
    }

    static async create(data) {
        const sql = `
            INSERT INTO galleries (title, subtitle, image, date, time, description)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.title,
            data.subtitle,
            data.image,
            data.date,
            data.time,
            data.description
        ];
        const [result] = await db.query(sql, params);
        return result.insertId;
    }

    static async update(id, data) {
        const sql = `
            UPDATE galleries 
            SET title = ?, subtitle = ?, image = ?, date = ?, time = ?, description = ?
            WHERE id = ?
        `;
        const params = [
            data.title,
            data.subtitle,
            data.image,
            data.date,
            data.time,
            data.description,
            id
        ];
        const [result] = await db.query(sql, params);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.query(
            "DELETE FROM galleries WHERE id=?",
            [id]
        );
        return result.affectedRows;
    }
}

Gallery.initTable();

module.exports = Gallery;