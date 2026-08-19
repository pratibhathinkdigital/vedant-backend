const db = require("../config/db");

class Client {

    // Create Clients Table
    static async initTable() {

        const sql = `
            CREATE TABLE IF NOT EXISTS clients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                image VARCHAR(255),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        try {

            await db.execute(sql);
            console.log("Clients table checked/created successfully.");

        } catch (error) {

            console.error("Error creating clients table:", error);

        }

    }

    // Get All Clients
    static async getAll() {

        const [rows] = await db.query(
            "SELECT * FROM clients ORDER BY id DESC"
        );

        return rows;

    }

    // Find Client By ID
    static async findById(id) {

        const [rows] = await db.query(
            "SELECT * FROM clients WHERE id = ?",
            [id]
        );

        return rows[0] || null;

    }

    // Count All Clients
    static async count() {

        const [rows] = await db.query(
            "SELECT COUNT(*) AS total FROM clients"
        );

        return rows[0].total;

    }

    // Create Client
    static async create(data) {

        const sql = `
            INSERT INTO clients
            (image)
            VALUES (?)
        `;

        const [result] = await db.execute(sql, [data.image]);

        return result.insertId;

    }

    // Update Client
    static async update(id, data) {

        const sql = `
            UPDATE clients
            SET image = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(sql, [data.image, id]);

        return result.affectedRows;

    }

    // Delete Client
    static async delete(id) {

        const [result] = await db.execute(
            "DELETE FROM clients WHERE id = ?",
            [id]
        );

        return result.affectedRows;

    }

}

// Auto Create Table
Client.initTable();

module.exports = Client;
