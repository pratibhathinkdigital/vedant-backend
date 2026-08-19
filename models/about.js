const db = require("../config/db");

class About {

    // Create About Table
    static async initTable() {

        const sql = `
            CREATE TABLE IF NOT EXISTS about (
                id INT AUTO_INCREMENT PRIMARY KEY,
                image VARCHAR(255),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        try {

            await db.execute(sql);
            console.log("About table checked/created successfully.");

        } catch (error) {

            console.error("Error creating about table:", error);

        }

    }

    // Get All
    static async getAll() {

        const [rows] = await db.query(
            "SELECT * FROM about ORDER BY id DESC"
        );

        return rows;

    }

    // Find By ID
    static async findById(id) {

        const [rows] = await db.query(
            "SELECT * FROM about WHERE id = ?",
            [id]
        );

        return rows[0] || null;

    }

    // Count
    static async count() {

        const [rows] = await db.query(
            "SELECT COUNT(*) AS total FROM about"
        );

        return rows[0].total;

    }

    // Create
    static async create(data) {

        const sql = `INSERT INTO about (image) VALUES (?)`;

        const [result] = await db.execute(sql, [data.image]);

        return result.insertId;

    }

    // Update
    static async update(id, data) {

        const sql = `UPDATE about SET image = ? WHERE id = ?`;

        const [result] = await db.execute(sql, [data.image, id]);

        return result.affectedRows;

    }

    // Delete
    static async delete(id) {

        const [result] = await db.execute(
            "DELETE FROM about WHERE id = ?",
            [id]
        );

        return result.affectedRows;

    }

}

// Auto Create Table
About.initTable();

module.exports = About;
