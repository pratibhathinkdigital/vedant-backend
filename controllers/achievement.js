const Achievement = require("../models/achievement");

// ===========================
// Achievement List
// ===========================
exports.index = async (req, res) => {
    try {

        const achievements = await Achievement.getAll();

        res.render("pages/achievement/index", {
            title: "Achievement List - Vedant Admin",
            achievements,
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

    res.render("pages/achievement/create", {
        title: "Create Achievement - Vedant Admin",
        user: {
            name: "Vedant Admin",
            role: "Super Admin",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
        },
        activities: []
    });

};


// ===========================
// Store Achievement
// ===========================
exports.store = async (req, res) => {

    try {

        const { description } = req.body;

        const image = req.file
            ? "/uploads/" + req.file.filename
            : "";

        await Achievement.create({ image, description });

        res.redirect("/achievements");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error Creating Achievement");

    }

};


// ===========================
// Edit Page
// ===========================
exports.edit = async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        const achievement = await Achievement.findById(id);

        if (!achievement) {
            return res.status(404).send("Achievement Not Found");
        }

        res.render("pages/achievement/edit", {
            title: "Edit Achievement - Vedant Admin",
            achievement,
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
// Update Achievement
// ===========================
exports.update = async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        const oldAchievement = await Achievement.findById(id);

        if (!oldAchievement) {
            return res.status(404).send("Achievement Not Found");
        }

        const image = req.file
            ? "/uploads/" + req.file.filename
            : oldAchievement.image;

        const description = req.body.description;

        await Achievement.update(id, { image, description });

        res.redirect("/achievements");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error Updating Achievement");

    }

};


// ===========================
// Delete Achievement
// ===========================
exports.delete = async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        await Achievement.delete(id);

        res.redirect("/achievements");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error Deleting Achievement");

    }

};


// ===========================
// API: Get All Achievements
// ===========================
exports.apiGetAll = async (req, res) => {
    try {
        const achievements = await Achievement.getAll();
        res.json({ success: true, data: achievements });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};
