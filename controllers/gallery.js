const Gallery = require("../models/gallery");

// ===========================
// Gallery List
// ===========================
exports.index = async (req, res) => {
    try {
        const galleries = await Gallery.getAll();

        res.render("pages/gallery/index", {
            title: "Blog - Vedant Admin",
            galleries,
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
    res.render("pages/gallery/create", {
        title: "Create Blog - Vedant Admin",
        user: {
            name: "Vedant Admin",
            role: "Super Admin",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
        },
        activities: []
    });
};

// ===========================
// Store Gallery Image
// ===========================
exports.store = async (req, res) => {
    try {
        const { title, subtitle, date, time, description } = req.body;
        const image = req.file
            ? "/uploads/" + req.file.filename
            : "";

        await Gallery.create({
            title,
            subtitle,
            image,
            date,
            time,
            description
        });

        res.redirect("/gallery");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error Uploading Gallery Image");
    }
};

// ===========================
// Edit Page
// ===========================
exports.edit = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const gallery = await Gallery.findById(id);

        if (!gallery) {
            return res.status(404).send("Gallery Image Not Found");
        }

        res.render("pages/gallery/edit", {
            title: "Edit Blog - Vedant Admin",
            gallery,
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
// Update Gallery Image
// ===========================
exports.update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const oldGallery = await Gallery.findById(id);

        if (!oldGallery) {
            return res.status(404).send("Gallery Image Not Found");
        }

        const { title, subtitle, date, time, description } = req.body;
        const image = req.file
            ? "/uploads/" + req.file.filename
            : oldGallery.image;

        await Gallery.update(id, {
            title,
            subtitle,
            image,
            date,
            time,
            description
        });

        res.redirect("/gallery");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error Updating Gallery Image");
    }
};

// ===========================
// Delete Blog Post (Gallery)
// ===========================
exports.delete = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await Gallery.delete(id);

        res.redirect("/gallery");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error Deleting Blog Post");
    }
};

// ===========================
// API: Get All Blog Posts (JSON)
// ===========================
exports.apiGetAll = async (req, res) => {
    try {
        const blogs = await Gallery.getAll();
        // Map to blog-friendly field names for the frontend
        const mapped = blogs.map(b => ({
            id: b.id,
            title: b.title || "",
            category: b.subtitle || "",
            date: b.date || "",
            readTime: b.time ? b.time + " min read" : "",
            summary: b.description ? b.description.replace(/<[^>]*>/g, "").substring(0, 200) : "",
            image: b.image
                ? (b.image.startsWith("http") ? b.image : "http://localhost:5000" + b.image)
                : "",
            content: b.description || "",
            created_at: b.created_at
        }));
        res.json(mapped);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    }
};
