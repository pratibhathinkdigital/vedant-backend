const db = require("../config/db");

class InstaLink {
    static async initTable() {
        try {
            const sql = `
                CREATE TABLE IF NOT EXISTS instalinks (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    link VARCHAR(500) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await db.query(sql);
            console.log("Instalinks table ready");
        } catch (err) {
            console.error("Error creating instalinks table:", err);
        }
    }

    static async getAll() {
        const [rows] = await db.query(
            "SELECT * FROM instalinks ORDER BY id DESC"
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM instalinks WHERE id=?",
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        await db.query(
            "INSERT INTO instalinks(link) VALUES(?)",
            [data.link]
        );
    }

    static async update(id, data) {
        await db.query(
            "UPDATE instalinks SET link=? WHERE id=?",
            [data.link, id]
        );
    }

    static async delete(id) {
        await db.query(
            "DELETE FROM instalinks WHERE id=?",
            [id]
        );
    }
}

InstaLink.initTable();

module.exports = InstaLink;
