const InstaLink = require("../models/instalink");

const defaultUser = {
    name: "Vedant Admin",
    role: "Super Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
};

exports.index = async (req, res) => {
    try {
        const instalinks = await InstaLink.getAll();

        res.render("pages/instalink/index", {
            title: "Insta Link - Vedant Admin",
            instalinks,
            user: defaultUser,
            activities: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};

exports.create = (req, res) => {
    res.render("pages/instalink/create", {
        title: "Add Insta Link - Vedant Admin",
        user: defaultUser,
        activities: []
    });
};

exports.store = async (req, res) => {
    try {
        await InstaLink.create(req.body);
        res.redirect("/instalinks");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error Creating Insta Link");
    }
};

exports.edit = async (req, res) => {
    try {
        const instalink = await InstaLink.getById(req.params.id);
        if (!instalink) {
            return res.status(404).send("Insta Link Not Found");
        }

        res.render("pages/instalink/edit", {
            title: "Edit Insta Link - Vedant Admin",
            instalink,
            user: defaultUser,
            activities: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};

exports.update = async (req, res) => {
    try {
        await InstaLink.update(req.params.id, req.body);
        res.redirect("/instalinks");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error Updating Insta Link");
    }
};

exports.delete = async (req, res) => {
    try {
        await InstaLink.delete(req.params.id);
        res.redirect("/instalinks");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error Deleting Insta Link");
    }
};

// ===========================
// API: Get All Insta Links
// ===========================
exports.apiGetAll = async (req, res) => {
    try {
        const instalinks = await InstaLink.getAll();
        res.json({ success: true, data: instalinks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};
