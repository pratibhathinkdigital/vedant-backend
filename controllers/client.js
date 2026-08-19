const Client = require("../models/client");

// ===========================
// Client List
// ===========================
exports.index = async (req, res) => {
    try {

        const clients = await Client.getAll();

        res.render("pages/client/index", {
            title: "Client List - Vedant Admin",
            clients,
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

    res.render("pages/client/create", {
        title: "Create Client - Vedant Admin",
        user: {
            name: "Vedant Admin",
            role: "Super Admin",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
        },
        activities: []
    });

};


// ===========================
// Store Client
// ===========================
exports.store = async (req, res) => {

    try {

        const image = req.file
            ? "/uploads/" + req.file.filename
            : "";

        await Client.create({ image });

        res.redirect("/clients");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error Creating Client");

    }

};


// ===========================
// Edit Page
// ===========================
exports.edit = async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        const client = await Client.findById(id);

        if (!client) {
            return res.status(404).send("Client Not Found");
        }

        res.render("pages/client/edit", {
            title: "Edit Client - Vedant Admin",
            client,
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
// Update Client
// ===========================
exports.update = async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        const oldClient = await Client.findById(id);

        if (!oldClient) {
            return res.status(404).send("Client Not Found");
        }

        const image = req.file
            ? "/uploads/" + req.file.filename
            : oldClient.image;

        await Client.update(id, { image });

        res.redirect("/clients");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error Updating Client");

    }

};


// ===========================
// Delete Client
// ===========================
exports.delete = async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        await Client.delete(id);

        res.redirect("/clients");

    } catch (error) {

        console.error(error);
        res.status(500).send("Error Deleting Client");

    }

};


// ===========================
// API: Get All Clients
// ===========================
exports.apiGetAll = async (req, res) => {
    try {
        const clients = await Client.getAll();
        res.json({ success: true, data: clients });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};
