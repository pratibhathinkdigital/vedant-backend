const db = require("../config/db");

class Testimonial {
    static async initTable() {
        try {
            const sql = `
                CREATE TABLE IF NOT EXISTS testimonials (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(150) NOT NULL,
                    designation VARCHAR(150) NOT NULL,
                    description TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await db.query(sql);
            console.log("Testimonials table ready");
        } catch (err) {
            console.error("Error creating testimonials table:", err);
        }
    }

    static async getAll() {
        const [rows] = await db.query(
            "SELECT * FROM testimonials ORDER BY id DESC"
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM testimonials WHERE id=?",
            [id]
        );
        return rows[0];
    }

    static async create(data) {
        await db.query(
            "INSERT INTO testimonials(name,designation,description) VALUES(?,?,?)",
            [data.name, data.designation, data.description]
        );
    }

    static async update(id, data) {
        await db.query(
            "UPDATE testimonials SET name=?, designation=?, description=? WHERE id=?",
            [data.name, data.designation, data.description, id]
        );
    }

    static async delete(id) {
        await db.query(
            "DELETE FROM testimonials WHERE id=?",
            [id]
        );
    }
}

Testimonial.initTable();

module.exports = Testimonial;