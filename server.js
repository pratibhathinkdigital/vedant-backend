const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const session = require("express-session");
const multer = require("multer");
const authController = require("./controllers/auth");
const dashboardController = require("./controllers/dashboard");
const categoriesController = require("./controllers/categories");
const productController = require("./controllers/product");
const bannerController = require("./controllers/banner");
const testimonialController = require("./controllers/testimonial");
const galleryController = require("./controllers/gallery");
const instalinkController = require("./controllers/Instalink");
const projectController = require("./controllers/project");
const offeringController = require("./controllers/offering");
const clientController = require("./controllers/client");
const achievementController = require("./controllers/achievement");
const aboutController = require("./controllers/about");
const iprojectController = require("./controllers/iproject");
const associateCategoryController = require("./controllers/associateCategory");
const associateVariantController = require("./controllers/associateVariant");
const inquiryController = require("./controllers/inquiry");
const cors = require("cors");
const { Resend } = require("resend");
const app = express();

// Body parser middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || "vedant_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8 hours
}));

// Auth middleware - protects all non-API and non-login routes
const requireAuth = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) return next();
    res.redirect("/admin/login");
};

// Multer configurations for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "public/uploads/"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Login/Logout routes (public - no auth needed)
app.get("/admin/login", authController.renderLogin);
app.post("/admin/login", authController.login);
app.get("/admin/logout", authController.logout);

// Admin Settings routes (protected)
app.get("/admin/settings", requireAuth, authController.renderSettings);
app.post("/admin/settings", requireAuth, authController.updateSettings);

// Redirect root to dashboard
app.get("/", requireAuth, (req, res) => {
    res.redirect("/dashboard");
});

// Contact Form API
app.post("/api/contact", async (req, res) => {
    const { name, phone, companyName, email, address, message } = req.body;

    if (!name || !phone || !email || !message) {
        return res.status(400).json({ error: "Name, Phone, Email, and Message are required." });
    }

    try {
        // 1. Save inquiry to database first (always works)
        const db = require("./config/db");
        await db.execute(
            `INSERT INTO contact_inquiries (name, phone, company_name, email, address, message, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [name, phone, companyName || null, email, address || null, message]
        );

        // 2. Respond immediately to user (instant form submission, zero waiting)
        res.status(200).json({ success: true, message: "Inquiry submitted successfully." });

        // 3. Send email via Resend API (HTTPS - works on all cloud platforms)
        const resendApiKey = process.env.RESEND_API_KEY;
        const contactEmail = process.env.CONTACT_EMAIL || "web@vedantengineering.in";
        const fromEmail = process.env.FROM_EMAIL || "noreply@vedantengineering.in";

        if (!resendApiKey) {
            console.error("❌ [RESEND_API_KEY not set in environment variables]");
            return;
        }

        const resend = new Resend(resendApiKey);

        resend.emails.send({
            from: `Vedant Engineering <${fromEmail}>`,
            to: [contactEmail],
            replyTo: email,
            subject: `New Contact Inquiry from ${name}`,
            html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
    <h2 style="color: #e6820e; border-bottom: 2px solid #e6820e; padding-bottom: 8px;">New Contact Inquiry Received</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr><td style="padding: 8px; font-weight: bold; width: 120px; color: #475569;">Name:</td><td style="padding: 8px; color: #1e293b;">${name}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Company:</td><td style="padding: 8px; color: #1e293b;">${companyName || "N/A"}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Phone:</td><td style="padding: 8px; color: #1e293b;"><a href="tel:${phone}">${phone}</a></td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Email:</td><td style="padding: 8px; color: #1e293b;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Address:</td><td style="padding: 8px; color: #1e293b;">${address || "N/A"}</td></tr>
    </table>
    <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
        <strong style="color: #334155;">Message:</strong>
        <p style="color: #1e293b; line-height: 1.6; margin-top: 8px; white-space: pre-wrap;">${message}</p>
    </div>
</div>
            `
        })
        .then((result) => {
            if (result.error) {
                console.error("❌ [Resend Email Failed]:", result.error);
            } else {
                console.log("✅ [Resend Email Sent to]", contactEmail, "ID:", result.data?.id);
            }
        })
        .catch((err) => console.error("❌ [Resend Exception]:", err.message));

    } catch (error) {
        console.error("Error saving contact inquiry:", error);
        res.status(500).json({ error: `Failed to submit inquiry: ${error.message}` });
    }
});

// Diagnostic Resend Route
app.get("/api/test-smtp", async (req, res) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL || "web@vedantengineering.in";
    const fromEmail = process.env.FROM_EMAIL || "noreply@vedantengineering.in";

    if (!resendApiKey) {
        return res.status(500).json({ success: false, error: "RESEND_API_KEY not set in environment" });
    }

    try {
        const resend = new Resend(resendApiKey);
        const result = await resend.emails.send({
            from: `Vedant Engineering <${fromEmail}>`,
            to: [contactEmail],
            subject: "Live Resend API Test from Railway",
            text: "Resend API is working correctly from the Railway cloud server!"
        });

        if (result.error) {
            res.status(500).json({ success: false, error: result.error, fromEmail, contactEmail });
        } else {
            res.json({ success: true, id: result.data?.id, fromEmail, contactEmail });
        }
    } catch(err) {
        console.error("[Resend Test Error]:", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Dashboard Route
app.get("/dashboard", requireAuth, dashboardController.renderDashboard);

// Categories Routes
app.get("/categories", requireAuth, categoriesController.index);
app.get("/categories/create", requireAuth, categoriesController.create);
app.post("/categories/store", requireAuth, upload.single("image"), categoriesController.store);
app.get("/categories/edit/:id", requireAuth, categoriesController.edit);
app.post("/categories/update/:id", requireAuth, upload.single("image"), categoriesController.update);
app.get("/categories/delete/:id", requireAuth, categoriesController.delete);

// API Route for Categories
app.get("/api/categories", categoriesController.apiGetAll);
app.get("/api/categories/:id", categoriesController.apiGetById);

// Associate Categories Routes
app.get("/associate-categories", requireAuth, associateCategoryController.index);
app.get("/associate-categories/create", requireAuth, associateCategoryController.create);
app.post("/associate-categories/store", requireAuth, associateCategoryController.store);
app.get("/associate-categories/edit/:id", requireAuth, associateCategoryController.edit);
app.post("/associate-categories/update/:id", requireAuth, associateCategoryController.update);
app.get("/associate-categories/delete/:id", requireAuth, associateCategoryController.delete);
app.get("/api/associate-categories", associateCategoryController.apiGetAll);

// Associate Variants Routes
app.get("/associate-variants", requireAuth, associateVariantController.index);
app.get("/associate-variants/create", requireAuth, associateVariantController.create);
app.post("/associate-variants/store", requireAuth, upload.any(), associateVariantController.store);
app.get("/associate-variants/edit/:id", requireAuth, associateVariantController.edit);
app.post("/associate-variants/update/:id", requireAuth, upload.any(), associateVariantController.update);
app.get("/associate-variants/delete/:id", requireAuth, associateVariantController.delete);
app.get("/api/associate-variants", associateVariantController.apiGetAll);

//product routes
app.get("/product", requireAuth, (req, res) => res.redirect("/products"));
app.get("/products", requireAuth, productController.index);
app.get("/products/create", requireAuth, productController.create);
app.post("/products/store", requireAuth, upload.any(), productController.store);
app.get("/products/edit/:id", requireAuth, productController.edit);
app.post("/products/update/:id", requireAuth, upload.any(), productController.update);
app.get("/products/delete/:id", requireAuth, productController.delete);

// API Route for Nav Products
app.get("/api/nav-products", productController.apiGetNavProducts);

// API Route for Single Product
app.get("/api/products/:id", productController.apiGetProductById);

// API Route for Related Products by Category
app.get("/api/related-products", productController.apiGetRelatedProducts);

// API Route for Products by Category ID (with full details)
app.get("/api/products-by-category/:categoryId", productController.apiGetByCategory);

//banner routes
app.get("/banner", requireAuth, (req, res) => res.redirect("/banners"));
app.get("/banners", requireAuth, bannerController.index);
app.get("/banners/create", requireAuth, bannerController.create);
app.post("/banners/store", requireAuth, upload.single("image"), bannerController.store);
app.get("/banners/edit/:id", requireAuth, bannerController.edit);
app.post("/banners/update/:id", requireAuth, upload.single("image"), bannerController.update);
app.get("/banners/delete/:id", requireAuth, bannerController.delete);

// API Route for Banners
app.get("/api/banners", bannerController.apiGetAll);

// Offering Routes
app.get("/offering", requireAuth, (req, res) => res.redirect("/offerings"));
app.get("/offerings", requireAuth, offeringController.index);
app.get("/offerings/create", requireAuth, offeringController.create);
app.post("/offerings/store", requireAuth, upload.single("image"), offeringController.store);
app.get("/offerings/edit/:id", requireAuth, offeringController.edit);
app.post("/offerings/update/:id", requireAuth, upload.single("image"), offeringController.update);
app.get("/offerings/delete/:id", requireAuth, offeringController.delete);

// API Route for Offerings
app.get("/api/offerings", offeringController.apiGetAll);

// Client Routes
app.get("/client", requireAuth, (req, res) => res.redirect("/clients"));
app.get("/clients", requireAuth, clientController.index);
app.get("/clients/create", requireAuth, clientController.create);
app.post("/clients/store", requireAuth, upload.single("image"), clientController.store);
app.get("/clients/edit/:id", requireAuth, clientController.edit);
app.post("/clients/update/:id", requireAuth, upload.single("image"), clientController.update);
app.get("/clients/delete/:id", requireAuth, clientController.delete);

// API Route for Clients
app.get("/api/clients", clientController.apiGetAll);

// Achievement Routes
app.get("/achievement", requireAuth, (req, res) => res.redirect("/achievements"));
app.get("/achievements", requireAuth, achievementController.index);
app.get("/achievements/create", requireAuth, achievementController.create);
app.post("/achievements/store", requireAuth, upload.single("image"), achievementController.store);
app.get("/achievements/edit/:id", requireAuth, achievementController.edit);
app.post("/achievements/update/:id", requireAuth, upload.single("image"), achievementController.update);
app.get("/achievements/delete/:id", requireAuth, achievementController.delete);

// API Route for Achievements
app.get("/api/achievements", achievementController.apiGetAll);

// About Routes
app.get("/about", requireAuth, aboutController.index);
app.get("/about/create", requireAuth, aboutController.create);
app.post("/about/store", requireAuth, upload.single("image"), aboutController.store);
app.get("/about/edit/:id", requireAuth, aboutController.edit);
app.post("/about/update/:id", requireAuth, upload.single("image"), aboutController.update);
app.get("/about/delete/:id", requireAuth, aboutController.delete);

// API Route for About
app.get("/api/about", aboutController.apiGetAll);

// IProject Routes
app.get("/iprojects", requireAuth, iprojectController.index);
app.get("/iprojects/create", requireAuth, iprojectController.create);
app.post("/iprojects/store", requireAuth, upload.single("image"), iprojectController.store);
app.get("/iprojects/edit/:id", requireAuth, iprojectController.edit);
app.post("/iprojects/update/:id", requireAuth, upload.single("image"), iprojectController.update);
app.get("/iprojects/delete/:id", requireAuth, iprojectController.delete);

// API Route for IProjects
app.get("/api/iprojects", iprojectController.apiGetAll);

app.get("/testimonial", requireAuth, (req, res) => res.redirect("/testimonials"));
app.get("/testimonials", requireAuth, testimonialController.index);
app.get("/testimonials/create", requireAuth, testimonialController.create);
app.post("/testimonials/store", requireAuth, testimonialController.store);
app.get("/testimonials/edit/:id", requireAuth, testimonialController.edit);
app.post("/testimonials/update/:id", requireAuth, testimonialController.update);
app.get("/testimonials/delete/:id", requireAuth, testimonialController.delete);


app.get("/galleries", requireAuth, (req, res) => res.redirect("/gallery"));
// Gallery Routes
app.get("/gallery", requireAuth, galleryController.index);
app.get("/gallery/create", requireAuth, galleryController.create);
app.post("/gallery/store", requireAuth, upload.single("image"), galleryController.store);
app.get("/gallery/edit/:id", requireAuth, galleryController.edit);
app.post("/gallery/update/:id", requireAuth, upload.single("image"), galleryController.update);
app.get("/gallery/delete/:id", requireAuth, galleryController.delete);

// API Route for Blog Posts
app.get("/api/blogs", galleryController.apiGetAll);

// Insta Link Routes
app.get("/instalink", requireAuth, (req, res) => res.redirect("/instalinks"));
app.get("/instalinks", requireAuth, instalinkController.index);
app.get("/instalinks/create", requireAuth, instalinkController.create);
app.post("/instalinks/store", requireAuth, instalinkController.store);
app.get("/instalinks/edit/:id", requireAuth, instalinkController.edit);
app.post("/instalinks/update/:id", requireAuth, instalinkController.update);
app.get("/instalinks/delete/:id", requireAuth, instalinkController.delete);

// API Route for Insta Links
app.get("/api/instalinks", instalinkController.apiGetAll);

// Project Routes
app.get("/projects", requireAuth, projectController.index);
app.get("/projects/create", requireAuth, projectController.create);
app.post("/projects/store", requireAuth, upload.any(), projectController.store);
app.get("/projects/edit/:id", requireAuth, projectController.edit);
app.post("/projects/update/:id", requireAuth, upload.any(), projectController.update);
app.get("/projects/delete/:id", requireAuth, projectController.delete);

// API Route for Projects
app.get("/api/projects", projectController.apiGetAll);

// Contact Inquiries Routes (Admin)
app.get("/inquiry", requireAuth, (req, res) => res.redirect("/inquiries"));
app.get("/inquiries", requireAuth, inquiryController.index);
app.get("/inquiries/delete/:id", requireAuth, inquiryController.delete);

// Standalone mode (node server.js) - Passenger handles socket on its own
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log("SMTP Config - Host:", process.env.SMTP_HOST, "| User:", process.env.SMTP_USER);
    });
}

module.exports = app;

