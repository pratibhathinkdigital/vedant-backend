

const Banner = require("../models/banner");

// ===========================
// Banner List
// ===========================
exports.index = async (req, res) => {
    try {

        const banners = await Banner.getAll();

        res.render("pages/banner/index", {
            title: "Banner List - Vedant Admin",
            banners,
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

    res.render("pages/banner/create", {
        title: "Create Banner - Vedant Admin",
        user: {
            name: "Vedant Admin",
            role: "Super Admin",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
        },
        activities: []
    });

};


// ===========================
// Store Banner
// ===========================
exports.store = async (req, res) => {

    try {

        const image = req.file
            ? "/uploads/" + req.file.filename
            : "";

        await Banner.create({
            image
        });

        res.redirect("/banners");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error Creating Banner");

    }

};


// ===========================
// Edit Page
// ===========================
exports.edit = async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        const banner = await Banner.findById(id);

        if (!banner) {
            return res.status(404).send("Banner Not Found");
        }

        res.render("pages/banner/edit", {
            title: "Edit Banner - Vedant Admin",
            banner,
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
// Update Banner
// ===========================
exports.update = async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        const oldBanner = await Banner.findById(id);

        if (!oldBanner) {
            return res.status(404).send("Banner Not Found");
        }

        const image = req.file
            ? "/uploads/" + req.file.filename
            : oldBanner.image;

        await Banner.update(id, {
            image
        });

        res.redirect("/banners");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error Updating Banner");

    }

};


// ===========================
// Delete Banner
// ===========================
exports.delete = async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        await Banner.delete(id);

        res.redirect("/banners");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error Deleting Banner");

    }

};

// ===========================
// API: Get All Banners
// ===========================
exports.apiGetAll = async (req, res) => {
    try {
        const banners = await Banner.getAll();
        res.json({ success: true, data: banners });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};