const Product = require("../models/product");
const Category = require("../models/category");

const defaultUser = {
    name: "Vedant Admin",
    role: "Super Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
};

// ===========================
// 1. Product List
// ===========================
exports.index = async (req, res) => {
    try {
        const products = await Product.getAll();
        res.render("pages/product/index", {
            title: "We Manufacture List - Vedant Admin",
            products,
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
        const categories = await Category.getAll();
        res.render("pages/product/create", {
            title: "Create We Manufacture",
            categories,
            user: defaultUser,
            activities: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};

// ===========================
// 3. Store Product
// ===========================
exports.store = async (req, res) => {
    try {
        const { category_id, name, desc, why_choose_desc } = req.body;

        // Main Image
        const mainFile = req.files ? req.files.find(f => f.fieldname === "image") : null;
        const image = mainFile ? "/uploads/" + mainFile.filename : "";

        // Long Image
        const longImageFile = req.files ? req.files.find(f => f.fieldname === "long_image") : null;
        const long_image = longImageFile ? "/uploads/" + longImageFile.filename : "";

        const productId = await Product.create({
            category_id,
            name,
            desc,
            image,
            long_image,
            youtube_link: req.body.youtube_link || "",
            why_choose_desc: why_choose_desc || ""
        });

        // Why Choose Variants
        const whyVariants = req.body.why_choose_variants || [];
        const whyArr = Array.isArray(whyVariants) ? whyVariants : [whyVariants];
        for (let i = 0; i < whyArr.length; i++) {
            const v = (whyArr[i] || "").trim();
            if (v) await Product.addWhyChooseVariant(productId, v, i);
        }

        // Industry Solutions Variants
        const industryVariants = req.body.industry_variants || [];
        const industryArr = Array.isArray(industryVariants) ? industryVariants : [industryVariants];
        for (let i = 0; i < industryArr.length; i++) {
            const v = (industryArr[i] || "").trim();
            if (v) await Product.addIndustrySolution(productId, v, i);
        }

        // Smart Manufacturing Benefits
        const benefitSmallDescs = req.body.benefit_small_desc || [];
        const benefitTitles = req.body.benefit_title || [];
        const benefitDescs = req.body.benefit_desc || [];

        const smallDescArr = Array.isArray(benefitSmallDescs) ? benefitSmallDescs : [benefitSmallDescs];
        const titleArr = Array.isArray(benefitTitles) ? benefitTitles : [benefitTitles];
        const descArr = Array.isArray(benefitDescs) ? benefitDescs : [benefitDescs];

        const benefitCount = Math.max(smallDescArr.length, titleArr.length, descArr.length);
        for (let i = 0; i < benefitCount; i++) {
            const sd = (smallDescArr[i] || "").trim();
            const t = (titleArr[i] || "").trim();
            const d = (descArr[i] || "").trim();
            if (sd || t || d) {
                await Product.addSmartBenefit(productId, sd, t, d, i);
            }
        }

        res.redirect("/products");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error Creating Product");
    }
};

// ===========================
// 4. Edit Page
// ===========================
exports.edit = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const product = await Product.findById(id);
        const categories = await Category.getAll();

        if (!product) return res.status(404).send("Product Not Found");

        const whyChooseVariants = await Product.getWhyChooseVariants(id);
        const industrySolutions = await Product.getIndustrySolutions(id);
        const smartBenefits = await Product.getSmartBenefits(id);

        res.render("pages/product/edit", {
            title: "Edit We Manufacture",
            product,
            categories,
            whyChooseVariants,
            industrySolutions,
            smartBenefits,
            user: defaultUser,
            activities: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Database Error");
    }
};

// ===========================
// 5. Update Product
// ===========================
exports.update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = await Product.findById(id);
        if (!existing) return res.status(404).send("Product Not Found");

        const { category_id, name, desc, why_choose_desc } = req.body;

        // Main Image
        const mainFile = req.files ? req.files.find(f => f.fieldname === "image") : null;
        const image = mainFile ? "/uploads/" + mainFile.filename : existing.image;

        // Long Image
        const longImageFile = req.files ? req.files.find(f => f.fieldname === "long_image") : null;
        const long_image = longImageFile ? "/uploads/" + longImageFile.filename : existing.long_image;

        await Product.update(id, {
            category_id,
            name,
            desc,
            image,
            long_image,
            youtube_link: req.body.youtube_link || "",
            why_choose_desc: why_choose_desc || ""
        });

        // Why Choose Variants — replace all
        await Product.deleteWhyChooseVariants(id);
        const whyVariants = req.body.why_choose_variants || [];
        const whyArr = Array.isArray(whyVariants) ? whyVariants : [whyVariants];
        for (let i = 0; i < whyArr.length; i++) {
            const v = (whyArr[i] || "").trim();
            if (v) await Product.addWhyChooseVariant(id, v, i);
        }

        // Industry Solutions — replace all
        await Product.deleteIndustrySolutions(id);
        const industryVariants = req.body.industry_variants || [];
        const industryArr = Array.isArray(industryVariants) ? industryVariants : [industryVariants];
        for (let i = 0; i < industryArr.length; i++) {
            const v = (industryArr[i] || "").trim();
            if (v) await Product.addIndustrySolution(id, v, i);
        }

        // Smart Benefits — replace all
        await Product.deleteSmartBenefits(id);
        const benefitSmallDescs = req.body.benefit_small_desc || [];
        const benefitTitles = req.body.benefit_title || [];
        const benefitDescs = req.body.benefit_desc || [];

        const smallDescArr = Array.isArray(benefitSmallDescs) ? benefitSmallDescs : [benefitSmallDescs];
        const titleArr = Array.isArray(benefitTitles) ? benefitTitles : [benefitTitles];
        const descArr = Array.isArray(benefitDescs) ? benefitDescs : [benefitDescs];

        const benefitCount = Math.max(smallDescArr.length, titleArr.length, descArr.length);
        for (let i = 0; i < benefitCount; i++) {
            const sd = (smallDescArr[i] || "").trim();
            const t = (titleArr[i] || "").trim();
            const d = (descArr[i] || "").trim();
            if (sd || t || d) {
                await Product.addSmartBenefit(id, sd, t, d, i);
            }
        }

        res.redirect("/products");
    } catch (error) {
        console.error(error);
        res.status(500).send("Update Failed");
    }
};

// ===========================
// 6. Delete Product
// ===========================
exports.delete = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await Product.delete(id);
        res.redirect("/products");
    } catch (error) {
        console.error(error);
        res.status(500).send("Delete Failed");
    }
};

// ===========================
// API: Get Nav Products (Grouped by Category)
// ===========================
exports.apiGetNavProducts = async (req, res) => {
    try {
        const categories = await Category.getAll();
        const products = await Product.getAll();

        const activeCategories = categories.filter(c => c.status === 'Active');

        let sections = [];
        for (const cat of activeCategories) {
            const catProducts = products.filter(p => p.category_id === cat.id);
            if (catProducts.length > 0) {
                sections.push({
                    title: cat.name,
                    items: catProducts.map(p => ({
                        name: p.name,
                        link: `/product/${p.id}`
                    }))
                });
            }
        }

        const columns = [
            { column: 1, sections: [] },
            { column: 2, sections: [] },
            { column: 3, sections: [] },
            { column: 4, sections: [] }
        ];

        sections.forEach((section, index) => {
            columns[index % 4].sections.push(section);
        });

        res.json({ success: true, data: columns });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};

// ===========================
// API: Get Single Product by ID
// ===========================
exports.apiGetProductById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const product = await Product.findById(id);

        if (!product) return res.status(404).json({ success: false, message: "Product Not Found" });

        const category = await Category.findById(product.category_id);
        product.categoryLabel = category ? category.name : "";

        product.whyChooseVariants = await Product.getWhyChooseVariants(id);
        product.industrySolutions = await Product.getIndustrySolutions(id);
        product.smartBenefits = await Product.getSmartBenefits(id);

        res.json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};

// ===========================
// API: Get Related Products by Category
// ===========================
exports.apiGetRelatedProducts = async (req, res) => {
    try {
        const { category_id, exclude_id } = req.query;
        const db = require("../config/db");

        const sql = `
            SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.category_id = ? AND p.id != ?
            ORDER BY p.id DESC
            LIMIT 8
        `;

        const [rows] = await db.query(sql, [category_id, exclude_id || 0]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};

// ===========================
// API: Get Products by Category ID
// ===========================
exports.apiGetByCategory = async (req, res) => {
    try {
        const categoryId = parseInt(req.params.categoryId);
        const db = require("../config/db");

        const sql = `
            SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.category_id = ?
            ORDER BY p.id DESC
        `;

        const [rows] = await db.query(sql, [categoryId]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};
