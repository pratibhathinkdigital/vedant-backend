const Project = require("../models/project");

const defaultUser = {
    name: "Vedant Admin",
    role: "Super Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
};

// 1. Case Study List
exports.index = async (req, res) => {
    try {
        const projects = await Project.getAll();
        res.render("pages/project/index", {
            title: "Case Study List - Vedant Admin",
            projects,
            user: defaultUser,
            activities: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};

// 2. Create Page
exports.create = (req, res) => {
    res.render("pages/project/create", {
        title: "Create Case Study",
        user: defaultUser,
        activities: []
    });
};

// 3. Store Case Study
exports.store = async (req, res) => {
    try {
        const { title, subtitle, media_type, description } = req.body;

        const imageFile = req.files ? req.files.find(f => f.fieldname === "image") : null;
        const videoFile = req.files ? req.files.find(f => f.fieldname === "video") : null;

        let image = imageFile ? "/uploads/" + imageFile.filename : "";
        let video = videoFile ? "/uploads/" + videoFile.filename : "";

        if (media_type === "image") {
            video = "";
        } else {
            image = "";
        }

        const projectId = await Project.create({
            title,
            subtitle,
            media_type,
            image,
            video,
            description: description || ""
        });

        // Handle More Case Studies items
        const itemTitles = req.body.item_title || [];
        const itemDescriptions = req.body.item_description || [];
        const itemFacilities = req.body.item_facility || [];

        const titleArr = Array.isArray(itemTitles) ? itemTitles : [itemTitles];
        const descArr = Array.isArray(itemDescriptions) ? itemDescriptions : [itemDescriptions];
        const facilityArr = Array.isArray(itemFacilities) ? itemFacilities : [itemFacilities];

        const itemCount = Math.max(titleArr.length, descArr.length, facilityArr.length);

        for (let i = 0; i < itemCount; i++) {
            const t = (titleArr[i] || "").trim();
            const d = (descArr[i] || "").trim();
            const f = (facilityArr[i] || "").trim();

            if (!t && !d && !f) continue;

            const itemImageFile = req.files ? req.files.find(file => file.fieldname === `item_image_${i}`) : null;
            const itemImage = itemImageFile ? "/uploads/" + itemImageFile.filename : "";

            await Project.addCaseStudyItem(projectId, {
                title: t,
                image: itemImage,
                description: d,
                facility: f
            }, i);
        }

        res.redirect("/projects");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error Creating Case Study");
    }
};

// 4. Edit Page
exports.edit = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const project = await Project.findById(id);

        if (!project) return res.status(404).send("Case Study Not Found");

        const caseStudyItems = await Project.getCaseStudyItems(id);

        res.render("pages/project/edit", {
            title: "Edit Case Study",
            project,
            caseStudyItems,
            user: defaultUser,
            activities: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};

// 5. Update Case Study
exports.update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const oldProject = await Project.findById(id);

        if (!oldProject) return res.status(404).send("Case Study Not Found");

        const { title, subtitle, media_type, description } = req.body;

        const imageFile = req.files ? req.files.find(f => f.fieldname === "image") : null;
        const videoFile = req.files ? req.files.find(f => f.fieldname === "video") : null;

        let image = imageFile ? "/uploads/" + imageFile.filename : oldProject.image;
        let video = videoFile ? "/uploads/" + videoFile.filename : oldProject.video;

        if (media_type === "image") {
            video = "";
            if (!imageFile && oldProject.image) image = oldProject.image;
        } else {
            image = "";
            if (!videoFile && oldProject.video) video = oldProject.video;
        }

        await Project.update(id, {
            title,
            subtitle,
            media_type,
            image,
            video,
            description: description || ""
        });

        // Replace More Case Studies items
        await Project.deleteCaseStudyItems(id);

        const itemTitles = req.body.item_title || [];
        const itemDescriptions = req.body.item_description || [];
        const itemFacilities = req.body.item_facility || [];
        const existingItemImages = req.body.existing_item_image || [];

        const titleArr = Array.isArray(itemTitles) ? itemTitles : [itemTitles];
        const descArr = Array.isArray(itemDescriptions) ? itemDescriptions : [itemDescriptions];
        const facilityArr = Array.isArray(itemFacilities) ? itemFacilities : [itemFacilities];
        const existingImgArr = Array.isArray(existingItemImages) ? existingItemImages : [existingItemImages];

        const itemCount = Math.max(titleArr.length, descArr.length, facilityArr.length);

        for (let i = 0; i < itemCount; i++) {
            const t = (titleArr[i] || "").trim();
            const d = (descArr[i] || "").trim();
            const f = (facilityArr[i] || "").trim();

            if (!t && !d && !f) continue;

            const itemImageFile = req.files ? req.files.find(file => file.fieldname === `item_image_${i}`) : null;
            const itemImage = itemImageFile
                ? "/uploads/" + itemImageFile.filename
                : (existingImgArr[i] || "");

            await Project.addCaseStudyItem(id, {
                title: t,
                image: itemImage,
                description: d,
                facility: f
            }, i);
        }

        res.redirect("/projects");
    } catch (error) {
        console.error(error);
        res.status(500).send("Update Failed");
    }
};

// 6. Delete Case Study
exports.delete = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await Project.delete(id);
        res.redirect("/projects");
    } catch (error) {
        console.error(error);
        res.status(500).send("Delete Failed");
    }
};

// 7. API: Get All Case Studies as JSON (for frontend)
exports.apiGetAll = async (req, res) => {
    try {
        const projects = await Project.getAll();
        const mapped = await Promise.all(projects.map(async p => {
            const items = await Project.getCaseStudyItems(p.id);
            return {
                id: p.id,
                title: p.title || "",
                subtitle: p.subtitle || "",
                media_type: p.media_type || "image",
                image: p.image
                    ? (p.image.startsWith("http") ? p.image : "http://localhost:5000" + p.image)
                    : "",
                video: p.video
                    ? (p.video.startsWith("http") ? p.video : "http://localhost:5000" + p.video)
                    : "",
                description: p.description || "",
                created_at: p.created_at,
                caseStudyItems: items.map(item => ({
                    id: item.id,
                    title: item.title || "",
                    image: item.image
                        ? (item.image.startsWith("http") ? item.image : "http://localhost:5000" + item.image)
                        : "",
                    description: item.description || "",
                    facility: item.facility || ""
                }))
            };
        }));
        res.json(mapped);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database Error" });
    }
};
