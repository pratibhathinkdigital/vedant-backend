const AssociateCategory = require("../models/associateCategory");

const defaultUser = {
    name: "Vedant Admin",
    role: "Super Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
};

// ===========================
// 1. List Associate Categories
// ===========================
exports.index = async (req, res) => {
    try {
        const categories = await AssociateCategory.getAll();
        res.render("pages/associateCategory/index", {
            title: "Associate Category List",
            categories,
            user: defaultUser,
            activities: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};

// ===========================
// 2. Create Page
// ===========================
exports.create = (req, res) => {
    res.render("pages/associateCategory/create", {
        title: "Create Associate Category",
        user: defaultUser,
        activities: []
    });
};

// ===========================
// 3. Store Associate Category
// ===========================
exports.store = async (req, res) => {
    try {
        const { name, status } = req.body;
        
        await AssociateCategory.create({
            name,
            status
        });

        res.redirect("/associate-categories");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error Creating Associate Category");
    }
};

// ===========================
// 4. Edit Page
// ===========================
exports.edit = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const category = await AssociateCategory.findById(id);

        if (!category) return res.status(404).send("Category Not Found");

        res.render("pages/associateCategory/edit", {
            title: "Edit Associate Category",
            category,
            user: defaultUser,
            activities: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};

// ===========================
// 5. Update Associate Category
// ===========================
exports.update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const oldCategory = await AssociateCategory.findById(id);
        if (!oldCategory) return res.status(404).send("Category Not Found");

        const { name, status } = req.body;

        await AssociateCategory.update(id, {
            name,
            status
        });

        res.redirect("/associate-categories");
    } catch (error) {
        console.error(error);
        res.status(500).send("Update Failed");
    }
};

// ===========================
// 6. Delete Associate Category
// ===========================
exports.delete = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await AssociateCategory.delete(id);
        res.redirect("/associate-categories");
    } catch (error) {
        console.error(error);
        res.status(500).send("Delete Failed");
    }
};

// ===========================
// API Route
// ===========================
exports.apiGetAll = async (req, res) => {
    try {
        const categories = await AssociateCategory.getAll();
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};
