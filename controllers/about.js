const About = require("../models/about");

// ===========================
// About List
// ===========================
exports.index = async (req, res) => {
    try {

        const abouts = await About.getAll();

        res.render("pages/about/index", {
            title: "About List - Vedant Admin",
            abouts,
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

    res.render("pages/about/create", {
        title: "Create About - Vedant Admin",
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

        const image = req.file
            ? "/uploads/" + req.file.filename
            : "";

        await About.create({ image });

        res.redirect("/about");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error Creating About");

    }

};


// ===========================
// Edit Page
// ===========================
exports.edit = async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        const about = await About.findById(id);

        if (!about) {
            return res.status(404).send("About Not Found");
        }

        res.render("pages/about/edit", {
            title: "Edit About - Vedant Admin",
            about,
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

        const oldAbout = await About.findById(id);

        if (!oldAbout) {
            return res.status(404).send("About Not Found");
        }

        const image = req.file
            ? "/uploads/" + req.file.filename
            : oldAbout.image;

        await About.update(id, { image });

        res.redirect("/about");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error Updating About");

    }

};


// ===========================
// Delete
// ===========================
exports.delete = async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        await About.delete(id);

        res.redirect("/about");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error Deleting About");

    }

};


// ===========================
// API: Get All
// ===========================
exports.apiGetAll = async (req, res) => {
    try {
        const abouts = await About.getAll();
        res.json({ success: true, data: abouts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};
