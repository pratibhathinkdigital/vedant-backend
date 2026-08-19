const db = require("../config/db");

class IProject {

    // Create i_projects Table (same fields as Blog/Gallery)
    static async initTable() {
        try {

            const sql = `
                CREATE TABLE IF NOT EXISTS i_projects (
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
            console.log("i_projects table ready");

        } catch (err) {

            console.error("Error creating i_projects table:", err);

        }
    }

    // Get All
    static async getAll() {

        const [rows] = await db.query(
            "SELECT * FROM i_projects ORDER BY id DESC"
        );

        return rows;

    }

    // Count
    static async count() {

        const [rows] = await db.query(
            "SELECT COUNT(*) AS total FROM i_projects"
        );

        return rows[0].total;

    }

    // Find By ID
    static async findById(id) {

        const [rows] = await db.query(
            "SELECT * FROM i_projects WHERE id = ?",
            [id]
        );

        return rows[0] || null;

    }

    // Create
    static async create(data) {

        const sql = `
            INSERT INTO i_projects (title, subtitle, image, date, time, description)
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

    // Update
    static async update(id, data) {

        const sql = `
            UPDATE i_projects
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

    // Delete
    static async delete(id) {

        const [result] = await db.query(
            "DELETE FROM i_projects WHERE id = ?",
            [id]
        );

        return result.affectedRows;

    }

}

// Auto Create Table
IProject.initTable();

module.exports = IProject;
