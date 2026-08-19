
const Offering = require("../models/offering");

// ===========================
// Offering List
// ===========================
exports.index = async (req, res) => {
    try {

        const offerings = await Offering.getAll();

        res.render("pages/offering/index", {
            title: "Offering List - Vedant Admin",
            offerings,
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

    res.render("pages/offering/create", {
        title: "Create Offering - Vedant Admin",
        user: {
            name: "Vedant Admin",
            role: "Super Admin",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
        },
        activities: []
    });

};


// ===========================
// Store Offering
// ===========================
exports.store = async (req, res) => {

    try {

        const image = req.file
            ? "/uploads/" + req.file.filename
            : "";

        await Offering.create({ image });

        res.redirect("/offerings");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error Creating Offering");

    }

};


// ===========================
// Edit Page
// ===========================
exports.edit = async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        const offering = await Offering.findById(id);

        if (!offering) {
            return res.status(404).send("Offering Not Found");
        }

        res.render("pages/offering/edit", {
            title: "Edit Offering - Vedant Admin",
            offering,
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
// Update Offering
// ===========================
exports.update = async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        const oldOffering = await Offering.findById(id);

        if (!oldOffering) {
            return res.status(404).send("Offering Not Found");
        }

        const image = req.file
            ? "/uploads/" + req.file.filename
            : oldOffering.image;

        await Offering.update(id, { image });

        res.redirect("/offerings");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error Updating Offering");

    }

};


// ===========================
// Delete Offering
// ===========================
exports.delete = async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        await Offering.delete(id);

        res.redirect("/offerings");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error Deleting Offering");

    }

};


// ===========================
// API: Get All Offerings
// ===========================
exports.apiGetAll = async (req, res) => {
    try {
        const offerings = await Offering.getAll();
        res.json({ success: true, data: offerings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};
