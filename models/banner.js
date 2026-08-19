const db = require("../config/db");

class Banner {

    // Create Banner Table
    static async initTable() {

        const sql = `
            CREATE TABLE IF NOT EXISTS banners (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                sub_title TEXT,
                image VARCHAR(255),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        try {

            await db.execute(sql);
            console.log("Banners table checked/created successfully.");

        } catch (error) {

            console.error("Error creating banners table:", error);

        }

    }

    // Get All Banners
    static async getAll() {

        const [rows] = await db.query(
            "SELECT * FROM banners ORDER BY id DESC"
        );

        return rows;

    }

    // Find Banner By ID
    static async findById(id) {

        const [rows] = await db.query(
            "SELECT * FROM banners WHERE id = ?",
            [id]
        );

        return rows[0] || null;

    }

    // Create Banner
    static async create(data) {

        const sql = `
            INSERT INTO banners
            (image)
            VALUES (?)
        `;

        const params = [
            data.image
        ];

        const [result] = await db.execute(sql, params);

        return result.insertId;

    }

    // Update Banner
    static async update(id, data) {

        const sql = `
            UPDATE banners
            SET
                image = ?
            WHERE id = ?
        `;

        const params = [
            data.image,
            id
        ];

        const [result] = await db.execute(sql, params);

        return result.affectedRows;

    }

    // Delete Banner
    static async delete(id) {

        const [result] = await db.execute(
            "DELETE FROM banners WHERE id = ?",
            [id]
        );

        return result.affectedRows;

    }

}

// Auto Create Table
Banner.initTable();

module.exports = Banner;