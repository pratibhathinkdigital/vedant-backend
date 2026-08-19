const IProject = require("../models/iproject");

// ===========================
// IProject List
// ===========================
exports.index = async (req, res) => {
    try {

        const iprojects = await IProject.getAll();

        res.render("pages/iproject/index", {
            title: "IProject List - Vedant Admin",
            iprojects,
            user: {
                name: "Vedant Admin",
                role: "Super Admin",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
            },
            activities: []
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};


// ===========================
// Create Page
// ===========================
exports.create = (req, res) => {

    res.render("pages/iproject/create", {
        title: "Create IProject - Vedant Admin",
        user: {
            name: "Vedant Admin",
            role: "Super Admin",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
        },
        activities: []
    });

};


// ===========================
// Store
// ===========================
exports.store = async (req, res) => {
    try {

        const { title, subtitle, date, time, description } = req.body;

        const image = req.file
            ? "/uploads/" + req.file.filename
            : "";

        await IProject.create({ title, subtitle, image, date, time, description });

        res.redirect("/iprojects");

    } catch (error) {
        console.error(error);
        res.status(500).send("Error Creating IProject");
    }
};


// ===========================
// Edit Page
// ===========================
exports.edit = async (req, res) => {
    try {

        const id = parseInt(req.params.id);
        const iproject = await IProject.findById(id);

        if (!iproject) {
            return res.status(404).send("IProject Not Found");
        }

        res.render("pages/iproject/edit", {
            title: "Edit IProject - Vedant Admin",
            iproject,
            user: {
                name: "Vedant Admin",
                role: "Super Admin",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
            },
            activities: []
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};


// ===========================
// Update
// ===========================
exports.update = async (req, res) => {
    try {

        const id = parseInt(req.params.id);
        const oldIProject = await IProject.findById(id);

        if (!oldIProject) {
            return res.status(404).send("IProject Not Found");
        }

        const { title, subtitle, date, time, description } = req.body;

        const image = req.file
            ? "/uploads/" + req.file.filename
            : oldIProject.image;

        await IProject.update(id, { title, subtitle, image, date, time, description });

        res.redirect("/iprojects");

    } catch (error) {
        console.error(error);
        res.status(500).send("Error Updating IProject");
    }
};


// ===========================
// Delete
// ===========================
exports.delete = async (req, res) => {
    try {

        const id = parseInt(req.params.id);
        await IProject.delete(id);

        res.redirect("/iprojects");

    } catch (error) {
        console.error(error);
        res.status(500).send("Error Deleting IProject");
    }
};


// ===========================
// API: Get All IProjects (JSON)
// ===========================
exports.apiGetAll = async (req, res) => {
    try {

        const iprojects = await IProject.getAll();

        const mapped = iprojects.map(p => ({
            id: p.id,
            title: p.title || "",
            category: p.subtitle || "",
            date: p.date || "",
            readTime: p.time ? p.time + " min read" : "",
            summary: p.description
                ? p.description.replace(/<[^>]*>/g, "").substring(0, 200)
                : "",
            image: p.image
                ? (p.image.startsWith("http") ? p.image : "http://localhost:5000" + p.image)
                : "",
            content: p.description || "",
            created_at: p.created_at
        }));

        res.json(mapped);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    }
};
