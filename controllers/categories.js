const Category = require("../models/category");

// 1. Get all categories (Index Table)
exports.index = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.render("pages/category/index", {
            title: "Category List - Vedant Admin",
            categories: categories,
            user: {
                name: "Vedant Admin",
                role: "Super Admin",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
            },
            activities: [] // Required for layout compatibility
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};

// 2. Show Create Category Form
exports.create = (req, res) => {
    res.render("pages/category/create", {
        title: "Create Category - Vedant Admin",
        user: {
            name: "Vedant Admin",
            role: "Super Admin",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
        },
        activities: []
    });
};

// 3. Store Category (POST Action)
exports.store = async (req, res) => {
    try {
        const { name, slug, title, subtitle, description, status } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : "";
        await Category.create({ name, slug, title, subtitle, description, image: imagePath, status });
        res.redirect("/categories");
    } catch (error) {
        console.error("[Category Store Error]", error.message, error.code);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).send(
                `<h3>Error: A category with this slug already exists.</h3>
                 <p>Please go back and use a different name or slug.</p>
                 <a href="/categories/create">Try Again</a>`
            );
        }

        res.status(500).send(`Error creating category: ${error.message}`);
    }
};

// 4. Show Edit Category Form
exports.edit = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        const category = await Category.findById(categoryId);
        
        if (!category) {
            return res.status(404).send("Category not found");
        }
        
        res.render("pages/category/edit", {
            title: "Edit Category - Vedant Admin",
            category: category,
            user: {
                name: "Vedant Admin",
                role: "Super Admin",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
            },
            activities: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

// 5. Update Category (POST Action)
exports.update = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        const { name, slug, title, subtitle, description, status } = req.body;
        
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).send("Category not found");
        }

        const imagePath = req.file ? `/uploads/${req.file.filename}` : category.image;
        
        await Category.update(categoryId, { name, slug, title, subtitle, description, image: imagePath, status });
        res.redirect("/categories");
    } catch (error) {
        console.error("[Category Update Error]", error.message, error.code);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).send(
                `<h3>Error: A category with this slug already exists.</h3>
                 <p>Please go back and use a different slug.</p>
                 <a href="/categories/edit/${req.params.id}">Try Again</a>`
            );
        }

        res.status(500).send(`Error updating category: ${error.message}`);
    }
};

// 6. Delete Category (POST/GET Action)
exports.delete = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        await Category.delete(categoryId);
        res.redirect("/categories");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting category");
    }
};

// ===========================
// API: Get All Categories
// ===========================
exports.apiGetAll = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error("apiGetAll error:", error);
        res.status(500).json({ success: false, message: "Database Error", error: error.message, code: error.code });
    }
};

// ===========================
// API: Get Single Category
// ===========================
exports.apiGetById = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.json({ success: true, data: category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};
