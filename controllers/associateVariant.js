const AssociateVariant = require("../models/associateVariant");
const AssociateCategory = require("../models/associateCategory");

const defaultUser = {
    name: "Vedant Admin",
    role: "Super Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
};

// ===========================
// 1. List Associate Variants
// ===========================
exports.index = async (req, res) => {
    try {
        const variants = await AssociateVariant.getAll();
        res.render("pages/associateVariant/index", {
            title: "Associate Variant List",
            variants,
            user: defaultUser,
            activities: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};

// ===========================
// 2. Create Page
// ===========================
exports.create = async (req, res) => {
    try {
        const categories = await AssociateCategory.getAll();
        const activeCategories = categories.filter(c => c.status === 'Active');

        res.render("pages/associateVariant/create", {
            title: "Create Associate Variant",
            categories: activeCategories,
            user: defaultUser,
            activities: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};

// ===========================
// 3. Store Associate Variant
// ===========================
exports.store = async (req, res) => {
    try {
        const { associate_category_id, title, description } = req.body;

        // Main Image, Logo & PDF
        const imageFile = req.files ? req.files.find(f => f.fieldname === "image") : null;
        const logoFile = req.files ? req.files.find(f => f.fieldname === "logo") : null;
        const pdfFile = req.files ? req.files.find(f => f.fieldname === "pdf") : null;

        const image = imageFile ? "/uploads/" + imageFile.filename : "";
        const logo = logoFile ? "/uploads/" + logoFile.filename : "";
        const pdf = pdfFile ? "/uploads/" + pdfFile.filename : "";

        const variantId = await AssociateVariant.create({
            associate_category_id,
            title,
            description: description || "",
            image,
            logo,
            pdf
        });

        // Handle PLC We Offer (Sub-variants)
        const plcTitles = req.body.plc_title || [];
        const titleArr = Array.isArray(plcTitles) ? plcTitles : [plcTitles];

        for (let i = 0; i < titleArr.length; i++) {
            const t = (titleArr[i] || "").trim();
            if (!t) continue;

            const plcImageFile = req.files ? req.files.find(file => file.fieldname === `plc_image_${i}`) : null;
            const plcImage = plcImageFile ? "/uploads/" + plcImageFile.filename : "";

            await AssociateVariant.addPlc(variantId, t, plcImage, i);
        }

        res.redirect("/associate-variants");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error Creating Associate Variant");
    }
};

// ===========================
// 4. Edit Page
// ===========================
exports.edit = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const variant = await AssociateVariant.findById(id);

        if (!variant) return res.status(404).send("Variant Not Found");

        const categories = await AssociateCategory.getAll();
        const activeCategories = categories.filter(c => c.status === 'Active');
        const plcs = await AssociateVariant.getPlcs(id);

        res.render("pages/associateVariant/edit", {
            title: "Edit Associate Variant",
            variant,
            categories: activeCategories,
            plcs,
            user: defaultUser,
            activities: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};

// ===========================
// 5. Update Associate Variant
// ===========================
exports.update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const oldVariant = await AssociateVariant.findById(id);
        if (!oldVariant) return res.status(404).send("Variant Not Found");

        const { associate_category_id, title, description } = req.body;

        // Main Image, Logo & PDF
        const imageFile = req.files ? req.files.find(f => f.fieldname === "image") : null;
        const logoFile = req.files ? req.files.find(f => f.fieldname === "logo") : null;
        const pdfFile = req.files ? req.files.find(f => f.fieldname === "pdf") : null;

        const image = imageFile ? "/uploads/" + imageFile.filename : oldVariant.image;
        const logo = logoFile ? "/uploads/" + logoFile.filename : (oldVariant.logo || "");
        const pdf = pdfFile ? "/uploads/" + pdfFile.filename : oldVariant.pdf;

        await AssociateVariant.update(id, {
            associate_category_id,
            title,
            description: description || "",
            image,
            logo,
            pdf
        });

        // Replace PLC We Offer
        await AssociateVariant.deletePlcs(id);

        const plcTitles = req.body.plc_title || [];
        const existingPlcImages = req.body.existing_plc_image || [];

        const titleArr = Array.isArray(plcTitles) ? plcTitles : [plcTitles];
        const existingImgArr = Array.isArray(existingPlcImages) ? existingPlcImages : [existingPlcImages];

        for (let i = 0; i < titleArr.length; i++) {
            const t = (titleArr[i] || "").trim();
            if (!t) continue;

            const plcImageFile = req.files ? req.files.find(file => file.fieldname === `plc_image_${i}`) : null;
            const plcImage = plcImageFile 
                ? "/uploads/" + plcImageFile.filename 
                : (existingImgArr[i] || "");

            await AssociateVariant.addPlc(id, t, plcImage, i);
        }

        res.redirect("/associate-variants");
    } catch (error) {
        console.error(error);
        res.status(500).send("Update Failed");
    }
};

// ===========================
// 6. Delete Associate Variant
// ===========================
exports.delete = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await AssociateVariant.delete(id);
        res.redirect("/associate-variants");
    } catch (error) {
        console.error(error);
        res.status(500).send("Delete Failed");
    }
};

// ===========================
// API Route
// ===========================
exports.apiGetAll = async (req, res) => {
    try {
        const variants = await AssociateVariant.getAll();
        
        // Fetch sub-items
        const mapped = await Promise.all(variants.map(async v => {
            const plcs = await AssociateVariant.getPlcs(v.id);
            return {
                id: v.id,
                associate_category_id: v.associate_category_id,
                category_name: v.category_name,
                title: v.title,
                image: v.image ? (v.image.startsWith("http") ? v.image : "http://localhost:5000" + v.image) : "",
                logo: v.logo ? (v.logo.startsWith("http") ? v.logo : "http://localhost:5000" + v.logo) : "",
                pdf: v.pdf ? (v.pdf.startsWith("http") ? v.pdf : "http://localhost:5000" + v.pdf) : "",
                description: v.description,
                createdAt: v.createdAt,
                plcs: plcs.map(p => ({
                    id: p.id,
                    title: p.title,
                    image: p.image ? (p.image.startsWith("http") ? p.image : "http://localhost:5000" + p.image) : ""
                }))
            };
        }));
        
        res.json({ success: true, data: mapped });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};
