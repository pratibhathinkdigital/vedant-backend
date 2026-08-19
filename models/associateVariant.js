const db = require("../config/db");

class AssociateVariant {
    static async initTables() {
        try {
            // Main table for associate variants
            const sqlMain = `
                CREATE TABLE IF NOT EXISTS associate_variants (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    associate_category_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    image VARCHAR(255),
                    logo VARCHAR(255),
                    pdf VARCHAR(255),
                    description LONGTEXT,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (associate_category_id) REFERENCES associate_categories(id) ON DELETE CASCADE
                )
            `;
            await db.execute(sqlMain);

            // Ensure logo column exists if table was created previously without it
            try {
                await db.execute("ALTER TABLE associate_variants ADD COLUMN logo VARCHAR(255)");
            } catch (e) {
                // Column already exists, ignore
            }

            // Sub-table for 'PLC We Offer' (Variant Types)
            const sqlPlc = `
                CREATE TABLE IF NOT EXISTS associate_variant_plcs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    associate_variant_id INT NOT NULL,
                    title VARCHAR(255),
                    image VARCHAR(255),
                    sort_order INT DEFAULT 0,
                    FOREIGN KEY (associate_variant_id) REFERENCES associate_variants(id) ON DELETE CASCADE
                )
            `;
            await db.execute(sqlPlc);

            console.log("MySQL 'associate_variants' and 'associate_variant_plcs' tables checked/created successfully.");
        } catch (error) {
            console.error("Error creating associate_variants tables:", error);
        }
    }

    // ─── CRUD for Main Variant ────────────────────────────────────────────────

    static async getAll() {
        const sql = `
            SELECT av.*, ac.name as category_name
            FROM associate_variants av
            LEFT JOIN associate_categories ac ON av.associate_category_id = ac.id
            ORDER BY av.id DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }

    static async findById(id) {
        const sql = `
            SELECT av.*, ac.name as category_name
            FROM associate_variants av
            LEFT JOIN associate_categories ac ON av.associate_category_id = ac.id
            WHERE av.id = ?
        `;
        const [rows] = await db.query(sql, [id]);
        return rows[0] || null;
    }

    static async create(data) {
        const sql = `
            INSERT INTO associate_variants (associate_category_id, title, image, logo, pdf, description)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.associate_category_id,
            data.title,
            data.image || "",
            data.logo || "",
            data.pdf || "",
            data.description || ""
        ];
        const [result] = await db.execute(sql, params);
        return result.insertId;
    }

    static async update(id, data) {
        const sql = `
            UPDATE associate_variants
            SET associate_category_id = ?, title = ?, image = ?, logo = ?, pdf = ?, description = ?
            WHERE id = ?
        `;
        const params = [
            data.associate_category_id,
            data.title,
            data.image,
            data.logo || "",
            data.pdf,
            data.description,
            id
        ];
        const [result] = await db.execute(sql, params);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.execute("DELETE FROM associate_variants WHERE id = ?", [id]);
        return result.affectedRows;
    }

    // ─── CRUD for PLC We Offer (Sub-variants) ───────────────────────────────

    static async getPlcs(variantId) {
        const [rows] = await db.query(
            "SELECT * FROM associate_variant_plcs WHERE associate_variant_id = ? ORDER BY sort_order ASC, id ASC",
            [variantId]
        );
        return rows;
    }

    static async deletePlcs(variantId) {
        await db.execute("DELETE FROM associate_variant_plcs WHERE associate_variant_id = ?", [variantId]);
    }

    static async addPlc(variantId, title, image, sortOrder = 0) {
        await db.execute(
            "INSERT INTO associate_variant_plcs (associate_variant_id, title, image, sort_order) VALUES (?, ?, ?, ?)",
            [variantId, title, image, sortOrder]
        );
    }
}

AssociateVariant.initTables();

module.exports = AssociateVariant;
