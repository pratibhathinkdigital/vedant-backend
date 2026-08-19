const Testimonial = require("../models/testimonial");

const defaultUser = {
    name: "Vedant Admin",
    role: "Super Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
};

exports.index = async (req, res) => {
    try {
        const testimonials = await Testimonial.getAll();

        res.render("pages/testimonial/index", {
            title: "Testimonials - Vedant Admin",
            testimonials,
            user: defaultUser,
            activities: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};

exports.create = (req, res) => {
    res.render("pages/testimonial/create", {
        title: "Add Testimonial - Vedant Admin",
        user: defaultUser,
        activities: []
    });
};

exports.store = async (req, res) => {
    try {
        await Testimonial.create(req.body);
        res.redirect("/testimonials");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error Creating Testimonial");
    }
};

exports.edit = async (req, res) => {
    try {
        const testimonial = await Testimonial.getById(req.params.id);
        if (!testimonial) {
            return res.status(404).send("Testimonial Not Found");
        }

        res.render("pages/testimonial/edit", {
            title: "Edit Testimonial - Vedant Admin",
            testimonial,
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
        await Testimonial.update(req.params.id, req.body);
        res.redirect("/testimonials");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error Updating Testimonial");
    }
};

exports.delete = async (req, res) => {
    try {
        await Testimonial.delete(req.params.id);
        res.redirect("/testimonials");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error Deleting Testimonial");
    }
};