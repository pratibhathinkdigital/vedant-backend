const db = require("../config/db");

class Achievement {

    // Create Achievements Table
    static async initTable() {

        const sql = `
            CREATE TABLE IF NOT EXISTS achievements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                image VARCHAR(255),
                description TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        try {

            await db.execute(sql);
            console.log("Achievements table checked/created successfully.");

        } catch (error) {

            console.error("Error creating achievements table:", error);

        }

    }

    // Get All Achievements
    static async getAll() {

        const [rows] = await db.query(
            "SELECT * FROM achievements ORDER BY id DESC"
        );

        return rows;

    }

    // Find Achievement By ID
    static async findById(id) {

        const [rows] = await db.query(
            "SELECT * FROM achievements WHERE id = ?",
            [id]
        );

        return rows[0] || null;

    }

    // Count All Achievements
    static async count() {

        const [rows] = await db.query(
            "SELECT COUNT(*) AS total FROM achievements"
        );

        return rows[0].total;

    }

    // Create Achievement
    static async create(data) {

        const sql = `
            INSERT INTO achievements (image, description)
            VALUES (?, ?)
        `;

        const [result] = await db.execute(sql, [data.image, data.description]);

        return result.insertId;

    }

    // Update Achievement
    static async update(id, data) {

        const sql = `
            UPDATE achievements
            SET image = ?, description = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(sql, [data.image, data.description, id]);

        return result.affectedRows;

    }

    // Delete Achievement
    static async delete(id) {

        const [result] = await db.execute(
            "DELETE FROM achievements WHERE id = ?",
            [id]
        );

        return result.affectedRows;

    }

}

// Auto Create Table
Achievement.initTable();

module.exports = Achievement;
