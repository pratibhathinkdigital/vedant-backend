const db = require("../config/db");

// 1. Get all contact inquiries
exports.index = async (req, res) => {
    try {
        const [inquiries] = await db.query(
            "SELECT * FROM contact_inquiries ORDER BY id DESC"
        );

        res.render("pages/inquiry/index", {
            title: "Contact Inquiries - Vedant Admin",
            inquiries: inquiries || [],
            user: {
                name: "Vedant Admin",
                role: "Super Admin",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
            },
            activities: []
        });
    } catch (error) {
        console.error("Error fetching contact inquiries:", error);
        res.status(500).send("Database Error: " + error.message);
    }
};

// 2. Delete an inquiry
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM contact_inquiries WHERE id = ?", [id]);
        res.redirect("/inquiries");
    } catch (error) {
        console.error("Error deleting contact inquiry:", error);
        res.status(500).send("Database Error: " + error.message);
    }
};
