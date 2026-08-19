const db = require("../config/db");

// Category Model
class Category {
    // 1. Initialize table (Run at startup if table doesn't exist)
    static async initTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                title VARCHAR(255),
                subtitle VARCHAR(255),
                description TEXT,
                image VARCHAR(255),
                status ENUM('Active', 'Inactive') DEFAULT 'Active',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        try {
            await db.execute(sql);
            // Check if column needs to be appended to existing tables
            await db.execute("ALTER TABLE categories ADD COLUMN image VARCHAR(255) AFTER description").catch(err => {
                // Ignore error if column already exists
            });
            await db.execute("ALTER TABLE categories ADD COLUMN title VARCHAR(255) AFTER slug").catch(err => {
                // Ignore error if column already exists
            });
            await db.execute("ALTER TABLE categories ADD COLUMN subtitle VARCHAR(255) AFTER title").catch(err => {
                // Ignore error if column already exists
            });
            console.log("MySQL 'categories' table checked/created successfully.");
        } catch (error) {
            console.error("Error creating categories table:", error);
        }
    }

    // 2. Fetch all categories
    static async getAll() {
        const [rows] = await db.query("SELECT * FROM categories ORDER BY id DESC");
        return rows;
    }

    // Count total categories
    static async count() {
        const [rows] = await db.query("SELECT COUNT(*) AS total FROM categories");
        return rows[0].total;
    }

    // 3. Find a single category by ID
    static async findById(id) {
        const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [id]);
        return rows[0] || null;
    }

    // 4. Create a new category
    static async create(data) {
        const sql = "INSERT INTO categories (name, slug, title, subtitle, description, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const params = [
            data.name,
            data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            data.title || "",
            data.subtitle || "",
            data.description || "",
            data.image || "",
            data.status || "Active"
        ];
        const [result] = await db.execute(sql, params);
        return result.insertId;
    }

    // 5. Update an existing category
    static async update(id, data) {
        const sql = "UPDATE categories SET name = ?, slug = ?, title = ?, subtitle = ?, description = ?, image = ?, status = ? WHERE id = ?";
        const params = [
            data.name,
            data.slug,
            data.title || "",
            data.subtitle || "",
            data.description,
            data.image || "",
            data.status,
            id
        ];
        const [result] = await db.execute(sql, params);
        return result.affectedRows;
    }

    // 6. Delete a category
    static async delete(id) {
        const [result] = await db.execute("DELETE FROM categories WHERE id = ?", [id]);
        return result.affectedRows;
    }
}

// Automatically check / create table when model is imported
Category.initTable();

module.exports = Category;
