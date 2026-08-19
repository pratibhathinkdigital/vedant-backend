const db = require("../config/db");

class Project {
    static async initTable() {
        try {
            const sql = `
                CREATE TABLE IF NOT EXISTS projects (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255),
                    subtitle VARCHAR(255),
                    media_type VARCHAR(50) DEFAULT 'image',
                    image VARCHAR(255),
                    video VARCHAR(255),
                    description LONGTEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await db.query(sql);

            // Add columns to existing table if they don't exist
            const [columnsInfo] = await db.query("SHOW COLUMNS FROM projects");
            const columns = columnsInfo.map(col => col.Field);

            const columnsToAdd = [
                ["title", "VARCHAR(255)"],
                ["subtitle", "VARCHAR(255)"],
                ["media_type", "VARCHAR(50) DEFAULT 'image'"],
                ["image", "VARCHAR(255)"],
                ["video", "VARCHAR(255)"],
                ["description", "LONGTEXT"]
            ];

            for (const [colName, colType] of columnsToAdd) {
                if (!columns.includes(colName)) {
                    await db.query(`ALTER TABLE projects ADD COLUMN ${colName} ${colType}`);
                }
            }

            console.log("Projects (Case Study) table ready");
        } catch (err) {
            console.error("Error creating/altering projects table:", err);
        }
    }

    // ─── More Case Studies Table ──────────────────────────────────────────────
    static async initCaseStudyItemsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS case_study_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_id INT NOT NULL,
                title VARCHAR(500),
                image VARCHAR(255),
                description TEXT,
                facility VARCHAR(500),
                sort_order INT DEFAULT 0,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        `;
        try {
            await db.query(sql);
            console.log("Case Study Items table ready");
        } catch (err) {
            console.error("Error creating case_study_items table:", err);
        }
    }

    // ─── CRUD for Projects ────────────────────────────────────────────────────

    static async getAll() {
        const [rows] = await db.query("SELECT * FROM projects ORDER BY id DESC");
        return rows;
    }

    static async count() {
        const [rows] = await db.query("SELECT COUNT(*) AS total FROM projects");
        return rows[0].total;
    }

    static async findById(id) {
        const [rows] = await db.query("SELECT * FROM projects WHERE id = ?", [id]);
        return rows[0] || null;
    }

    static async create(data) {
        const sql = `
            INSERT INTO projects (title, subtitle, media_type, image, video, description)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.title,
            data.subtitle,
            data.media_type || 'image',
            data.image || '',
            data.video || '',
            data.description || ''
        ];
        const [result] = await db.query(sql, params);
        return result.insertId;
    }

    static async update(id, data) {
        const sql = `
            UPDATE projects
            SET title = ?, subtitle = ?, media_type = ?, image = ?, video = ?, description = ?
            WHERE id = ?
        `;
        const params = [
            data.title,
            data.subtitle,
            data.media_type || 'image',
            data.image || '',
            data.video || '',
            data.description || '',
            id
        ];
        const [result] = await db.query(sql, params);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.query("DELETE FROM projects WHERE id=?", [id]);
        return result.affectedRows;
    }

    // ─── More Case Studies Items ──────────────────────────────────────────────

    static async getCaseStudyItems(projectId) {
        const [rows] = await db.query(
            "SELECT * FROM case_study_items WHERE project_id = ? ORDER BY sort_order ASC, id ASC",
            [projectId]
        );
        return rows;
    }

    static async deleteCaseStudyItems(projectId) {
        await db.query("DELETE FROM case_study_items WHERE project_id = ?", [projectId]);
    }

    static async addCaseStudyItem(projectId, data, sortOrder = 0) {
        await db.query(
            "INSERT INTO case_study_items (project_id, title, image, description, facility, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
            [projectId, data.title || '', data.image || '', data.description || '', data.facility || '', sortOrder]
        );
    }
}

Project.initTable();
Project.initCaseStudyItemsTable();

module.exports = Project;
