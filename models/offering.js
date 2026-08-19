const db = require("../config/db");

class Offering {

    // Create Offerings Table
    static async initTable() {

        const sql = `
            CREATE TABLE IF NOT EXISTS offerings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                image VARCHAR(255),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        try {

            await db.execute(sql);
            console.log("Offerings table checked/created successfully.");

        } catch (error) {

            console.error("Error creating offerings table:", error);

        }

    }

    // Get All Offerings
    static async getAll() {

        const [rows] = await db.query(
            "SELECT * FROM offerings ORDER BY id DESC"
        );

        return rows;

    }

    // Find Offering By ID
    static async findById(id) {

        const [rows] = await db.query(
            "SELECT * FROM offerings WHERE id = ?",
            [id]
        );

        return rows[0] || null;

    }

    // Create Offering
    static async create(data) {

        const sql = `
            INSERT INTO offerings
            (image)
            VALUES (?)
        `;

        const params = [
            data.image
        ];

        const [result] = await db.execute(sql, params);

        return result.insertId;

    }

    // Update Offering
    static async update(id, data) {

        const sql = `
            UPDATE offerings
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

    // Count All Offerings
    static async count() {

        const [rows] = await db.query(
            "SELECT COUNT(*) AS total FROM offerings"
        );

        return rows[0].total;

    }

    // Delete Offering
    static async delete(id) {

        const [result] = await db.execute(
            "DELETE FROM offerings WHERE id = ?",
            [id]
        );

        return result.affectedRows;

    }

}

// Auto Create Table
Offering.initTable();

module.exports = Offering;
