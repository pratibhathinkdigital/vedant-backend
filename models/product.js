const db = require("../config/db");

class Product {

    // Create main products table
    static async initTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                \`desc\` LONGTEXT,
                image VARCHAR(255),
                video VARCHAR(255),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
            )
        `;

        try {
            await db.execute(sql);

            // Add new columns to existing table if they don't exist
            const columnsToAdd = [
                ["image", "VARCHAR(255)"],
                ["video", "VARCHAR(255)"]
            ];

            const [columnsInfo] = await db.query("SHOW COLUMNS FROM products");
            const columns = columnsInfo.map(col => col.Field);

            for (const [colName, colType] of columnsToAdd) {
                if (!columns.includes(colName)) {
                    await db.query(`ALTER TABLE products ADD COLUMN ${colName} ${colType}`);
                }
            }

            console.log("Products table checked/created successfully.");
        } catch (error) {
            console.error("Error creating products table:", error);
        }
    }

    // ─── Why Choose Section ───────────────────────────────────────────────────

    static async initWhyChooseTable() {
        // Main why_choose description stored in product row (why_choose_desc column)
        // Variants stored in this table
        const sql = `
            CREATE TABLE IF NOT EXISTS product_why_choose_variants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                variant_name VARCHAR(500) NOT NULL,
                sort_order INT DEFAULT 0,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `;
        try {
            await db.execute(sql);

            // Add why_choose_desc column to products if not exists
            const [cols] = await db.query("SHOW COLUMNS FROM products");
            const colNames = cols.map(c => c.Field);
            if (!colNames.includes("why_choose_desc")) {
                await db.query("ALTER TABLE products ADD COLUMN why_choose_desc TEXT");
            }

            console.log("Why Choose table checked/created successfully.");
        } catch (error) {
            console.error("Error creating why_choose table:", error);
        }
    }

    // ─── Industry Solutions Section ───────────────────────────────────────────

    static async initIndustrySolutionsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS product_industry_solutions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                variant_name VARCHAR(500) NOT NULL,
                sort_order INT DEFAULT 0,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `;
        try {
            await db.execute(sql);
            console.log("Industry Solutions table checked/created successfully.");
        } catch (error) {
            console.error("Error creating industry_solutions table:", error);
        }
    }

    // ─── Smart Manufacturing Benefits Section ─────────────────────────────────

    static async initSmartBenefitsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS product_smart_benefits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                small_desc VARCHAR(500),
                title VARCHAR(500),
                description TEXT,
                sort_order INT DEFAULT 0,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `;
        try {
            await db.execute(sql);
            console.log("Smart Benefits table checked/created successfully.");
        } catch (error) {
            console.error("Error creating smart_benefits table:", error);
        }
    }

    // ─── Get All Products ─────────────────────────────────────────────────────

    static async getAll() {
        const sql = `
            SELECT
                p.*,
                c.name AS category_name
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            ORDER BY p.id DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }

    static async count() {
        const [rows] = await db.query("SELECT COUNT(*) AS total FROM products");
        return rows[0].total;
    }

    static async findById(id) {
        const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
        return rows[0] || null;
    }

    // ─── Create Product ───────────────────────────────────────────────────────

    static async create(data) {
        const sql = `
            INSERT INTO products 
            (category_id, name, \`desc\`, image, long_image, youtube_link, why_choose_desc) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.category_id,
            data.name,
            data.desc || "",
            data.image || "",
            data.long_image || "",
            data.youtube_link || "",
            data.why_choose_desc || ""
        ];
        const [result] = await db.execute(sql, params);
        return result.insertId;
    }

    // ─── Update Product ───────────────────────────────────────────────────────

    static async update(id, data) {
        const sql = `
            UPDATE products
            SET
                category_id = ?,
                name = ?,
                \`desc\` = ?,
                image = ?,
                long_image = ?,
                youtube_link = ?,
                why_choose_desc = ?
            WHERE id = ?
        `;
        const params = [
            data.category_id,
            data.name,
            data.desc || "",
            data.image || "",
            data.long_image || "",
            data.youtube_link || "",
            data.why_choose_desc || "",
            id
        ];
        const [result] = await db.execute(sql, params);
        return result.affectedRows;
    }

    // ─── Delete Product ───────────────────────────────────────────────────────

    static async delete(id) {
        const [result] = await db.execute("DELETE FROM products WHERE id = ?", [id]);
        return result.affectedRows;
    }

    // ─── Why Choose Variants ──────────────────────────────────────────────────

    static async getWhyChooseVariants(productId) {
        const [rows] = await db.query(
            "SELECT * FROM product_why_choose_variants WHERE product_id = ? ORDER BY sort_order ASC, id ASC",
            [productId]
        );
        return rows;
    }

    static async deleteWhyChooseVariants(productId) {
        await db.execute("DELETE FROM product_why_choose_variants WHERE product_id = ?", [productId]);
    }

    static async addWhyChooseVariant(productId, variantName, sortOrder = 0) {
        await db.execute(
            "INSERT INTO product_why_choose_variants (product_id, variant_name, sort_order) VALUES (?, ?, ?)",
            [productId, variantName, sortOrder]
        );
    }

    // ─── Industry Solutions Variants ──────────────────────────────────────────

    static async getIndustrySolutions(productId) {
        const [rows] = await db.query(
            "SELECT * FROM product_industry_solutions WHERE product_id = ? ORDER BY sort_order ASC, id ASC",
            [productId]
        );
        return rows;
    }

    static async deleteIndustrySolutions(productId) {
        await db.execute("DELETE FROM product_industry_solutions WHERE product_id = ?", [productId]);
    }

    static async addIndustrySolution(productId, variantName, sortOrder = 0) {
        await db.execute(
            "INSERT INTO product_industry_solutions (product_id, variant_name, sort_order) VALUES (?, ?, ?)",
            [productId, variantName, sortOrder]
        );
    }

    // ─── Smart Manufacturing Benefits ─────────────────────────────────────────

    static async getSmartBenefits(productId) {
        const [rows] = await db.query(
            "SELECT * FROM product_smart_benefits WHERE product_id = ? ORDER BY sort_order ASC, id ASC",
            [productId]
        );
        return rows;
    }

    static async deleteSmartBenefits(productId) {
        await db.execute("DELETE FROM product_smart_benefits WHERE product_id = ?", [productId]);
    }

    static async addSmartBenefit(productId, smallDesc, title, description, sortOrder = 0) {
        await db.execute(
            "INSERT INTO product_smart_benefits (product_id, small_desc, title, description, sort_order) VALUES (?, ?, ?, ?, ?)",
            [productId, smallDesc, title, description, sortOrder]
        );
    }

}

// Auto create tables
Product.initTable();
Product.initWhyChooseTable();
Product.initIndustrySolutionsTable();
Product.initSmartBenefitsTable();

module.exports = Product;
