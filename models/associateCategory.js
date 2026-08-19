const db = require("../config/db");

// Associate Category Model
class AssociateCategory {
    // 1. Initialize table (Run at startup if table doesn't exist)
    static async initTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS associate_categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                status ENUM('Active', 'Inactive') DEFAULT 'Active',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        try {
            await db.execute(sql);
            console.log("MySQL 'associate_categories' table checked/created successfully.");
        } catch (error) {
            console.error("Error creating associate_categories table:", error);
        }
    }

    // 2. Fetch all categories
    static async getAll() {
        const [rows] = await db.query("SELECT * FROM associate_categories ORDER BY id DESC");
        return rows;
    }

    // Count total categories
    static async count() {
        const [rows] = await db.query("SELECT COUNT(*) AS total FROM associate_categories");
        return rows[0].total;
    }

    // 3. Find a single category by ID
    static async findById(id) {
        const [rows] = await db.query("SELECT * FROM associate_categories WHERE id = ?", [id]);
        return rows[0] || null;
    }

    // 4. Create a new category
    static async create(data) {
        const sql = "INSERT INTO associate_categories (name, status) VALUES (?, ?)";
        const params = [
            data.name,
            data.status || "Active"
        ];
        const [result] = await db.execute(sql, params);
        return result.insertId;
    }

    // 5. Update an existing category
    static async update(id, data) {
        const sql = "UPDATE associate_categories SET name = ?, status = ? WHERE id = ?";
        const params = [
            data.name,
            data.status,
            id
        ];
        const [result] = await db.execute(sql, params);
        return result.affectedRows;
    }

    // 6. Delete a category
    static async delete(id) {
        const [result] = await db.execute("DELETE FROM associate_categories WHERE id = ?", [id]);
        return result.affectedRows;
    }
}

// Automatically check / create table when model is imported
AssociateCategory.initTable();

module.exports = AssociateCategory;
