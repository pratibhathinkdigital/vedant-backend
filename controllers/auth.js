const db = require("../config/db");

// ─── Login / Logout ───────────────────────────────────────────────────────────
exports.renderLogin = (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        return res.redirect("/dashboard");
    }
    res.render("pages/login", {
        title: "Admin Login - Vedant Engineering",
        error: null
    });
};

exports.login = async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
        return res.render("pages/login", {
            title: "Admin Login - Vedant Engineering",
            error: "Please enter both username and password."
        });
    }
    try {
        const [rows] = await db.query(
            "SELECT * FROM admin_users WHERE username = ? AND password = ? LIMIT 1",
            [username, password]
        );
        if (rows.length > 0) {
            req.session.isAuthenticated = true;
            req.session.adminId = rows[0].id;
            req.session.username = rows[0].username;
            return res.redirect("/dashboard");
        }
        res.render("pages/login", {
            title: "Admin Login - Vedant Engineering",
            error: "Invalid username or password. Please try again."
        });
    } catch (err) {
        console.error(err);
        res.render("pages/login", {
            title: "Admin Login - Vedant Engineering",
            error: "Server error. Please try again."
        });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/admin/login");
    });
};

// ─── Admin Settings ─────────────────────────────────────────────────────────
exports.renderSettings = async (req, res) => {
    try {
        const adminId = req.session.adminId;
        let admin = null;
        if (adminId) {
            const [rows] = await db.query("SELECT * FROM admin_users WHERE id = ? LIMIT 1", [adminId]);
            if (rows.length) admin = rows[0];
        }
        if (!admin) {
            const [rows] = await db.query("SELECT * FROM admin_users LIMIT 1");
            if (rows.length) admin = rows[0];
        }

        const currentUsername = admin ? admin.username : (req.session.username || "admin");
        const currentPassword = admin ? admin.password : "admin123";

        res.render("pages/admin/settings", {
            title: "Admin Settings - Vedant Engineering",
            user: {
                name: req.session.username || "Admin",
                role: "Super Admin",
                avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VA"
            },
            currentUsername,
            currentPassword,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.error("Error loading admin settings:", err);
        res.redirect("/dashboard");
    }
};

exports.updateSettings = async (req, res) => {
    const { new_username, new_password, current_password } = req.body;
    try {
        const adminId = req.session.adminId;
        let admin = null;
        if (adminId) {
            const [rows] = await db.query("SELECT * FROM admin_users WHERE id = ? LIMIT 1", [adminId]);
            if (rows.length) admin = rows[0];
        }
        if (!admin) {
            const [rows] = await db.query("SELECT * FROM admin_users LIMIT 1");
            if (rows.length) admin = rows[0];
        }

        if (!admin || admin.password !== (current_password || "").trim()) {
            return res.render("pages/admin/settings", {
                title: "Admin Settings - Vedant Engineering",
                user: {
                    name: req.session.username || "Admin",
                    role: "Super Admin",
                    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VA"
                },
                currentUsername: admin ? admin.username : new_username,
                currentPassword: admin ? admin.password : "",
                success: null,
                error: "Current password is incorrect."
            });
        }

        const targetId = admin.id;
        const updatedUsername = (new_username || "").trim();
        const updatedPassword = (new_password && new_password.trim()) ? new_password.trim() : admin.password;

        await db.execute("UPDATE admin_users SET username = ?, password = ? WHERE id = ?", [
            updatedUsername,
            updatedPassword,
            targetId
        ]);

        req.session.username = updatedUsername;

        return res.render("pages/admin/settings", {
            title: "Admin Settings - Vedant Engineering",
            user: {
                name: req.session.username || "Admin",
                role: "Super Admin",
                avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VA"
            },
            currentUsername: updatedUsername,
            currentPassword: updatedPassword,
            success: "Credentials updated successfully!",
            error: null
        });
    } catch (err) {
        console.error("Error updating admin settings:", err);
        return res.redirect("/admin/settings?error=" + encodeURIComponent("Failed to update settings"));
    }
};

// ─── Admin Users Management ───────────────────────────────────────────────────
exports.renderAdminUsers = async (req, res) => {
    try {
        const [admins] = await db.query("SELECT id, username, created_at FROM admin_users ORDER BY id ASC");
        res.render("pages/admin/users", {
            title: "Admin Settings - Vedant Engineering",
            admins,
            user: { name: req.session.username || "Admin", role: "Super Admin", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VA" },
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.error(err);
        res.redirect("/dashboard");
    }
};

exports.renderCreateAdmin = (req, res) => {
    res.render("pages/admin/create", {
        title: "Admin Settings - Vedant Engineering",
        user: { name: req.session.username || "Admin", role: "Super Admin", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VA" },
        error: null
    });
};

exports.storeAdmin = async (req, res) => {
    const { username, password } = req.body;
    try {
        await db.execute("INSERT INTO admin_users (username, password) VALUES (?, ?)", [username.trim(), password.trim()]);
        res.redirect("/admin/users?success=Admin created successfully");
    } catch (err) {
        res.render("pages/admin/create", {
            title: "Admin Settings - Vedant Engineering",
            user: { name: req.session.username || "Admin", role: "Super Admin", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VA" },
            error: "Username already exists or an error occurred."
        });
    }
};

exports.renderEditAdmin = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, username FROM admin_users WHERE id = ?", [req.params.id]);
        if (!rows.length) return res.redirect("/admin/users");
        res.render("pages/admin/edit", {
            title: "Admin Settings - Vedant Engineering",
            admin: rows[0],
            user: { name: req.session.username || "Admin", role: "Super Admin", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VA" },
            error: null
        });
    } catch (err) {
        res.redirect("/admin/users");
    }
};

exports.updateAdmin = async (req, res) => {
    const { username, password } = req.body;
    try {
        if (password && password.trim()) {
            await db.execute("UPDATE admin_users SET username = ?, password = ? WHERE id = ?", [username.trim(), password.trim(), req.params.id]);
        } else {
            await db.execute("UPDATE admin_users SET username = ? WHERE id = ?", [username.trim(), req.params.id]);
        }
        res.redirect("/admin/users?success=Admin updated successfully");
    } catch (err) {
        res.redirect("/admin/users?error=Update failed");
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const [all] = await db.query("SELECT COUNT(*) AS cnt FROM admin_users");
        if (all[0].cnt <= 1) {
            return res.redirect("/admin/users?error=Cannot delete the last admin account");
        }
        // Prevent self-deletion
        if (parseInt(req.params.id) === req.session.adminId) {
            return res.redirect("/admin/users?error=Cannot delete your own account");
        }
        await db.execute("DELETE FROM admin_users WHERE id = ?", [req.params.id]);
        res.redirect("/admin/users?success=Admin deleted successfully");
    } catch (err) {
        res.redirect("/admin/users?error=Delete failed");
    }
};
