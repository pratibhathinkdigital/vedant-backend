const Product = require("../models/product");
const Category = require("../models/category");
const Gallery = require("../models/gallery");
const Project = require("../models/project");
const Offering = require("../models/offering");
const db = require("../config/db");

exports.renderDashboard = async (req, res) => {
    let totalProducts = 0;
    let totalCategories = 0;
    let totalBlogs = 0;
    let totalProjects = 0;
    let totalOfferings = 0;
    let totalInquiries = 0;
    let recentProducts = [];
    let recentCategories = [];

    try {
        // Real counts from database
        const [
            prodCount,
            catCount,
            galCount,
            projCount,
            offCount,
            [inqRows]
        ] = await Promise.all([
            Product.count(),
            Category.count(),
            Gallery.count(),
            Project.count(),
            Offering.count(),
            db.query("SELECT COUNT(*) AS total FROM contact_inquiries").catch(() => [[{ total: 0 }]])
        ]);

        totalProducts = prodCount || 0;
        totalCategories = catCount || 0;
        totalBlogs = galCount || 0;
        totalProjects = projCount || 0;
        totalOfferings = offCount || 0;
        totalInquiries = (inqRows && inqRows[0] && inqRows[0].total) ? inqRows[0].total : 0;

        // Fetch recent 5 products and categories
        const allProducts = await Product.getAll();
        recentProducts = allProducts.slice(0, 5);

        const allCategories = await Category.getAll();
        recentCategories = allCategories.slice(0, 5);

    } catch (error) {
        console.error("Error fetching dashboard counts:", error);
    }

    const stats = {
        totalProducts,
        totalCategories,
        totalBlogs,
        totalProjects,
        totalOfferings,
        totalInquiries
    };

    // Demo recent transactions
    const transactions = [
        { id: "TX-1001", customer: "Ananya Sharma", date: "2026-07-24", amount: "$150.00", status: "Completed", type: "Subscription" },
        { id: "TX-1002", customer: "Rahul Verma", date: "2026-07-23", amount: "$85.50", status: "Completed", type: "One-Time" },
        { id: "TX-1003", customer: "Pooja Patel", date: "2026-07-23", amount: "$299.00", status: "Pending", type: "Enterprise" },
        { id: "TX-1004", customer: "Amit Singh", date: "2026-07-22", amount: "$45.00", status: "Failed", type: "Add-on" },
        { id: "TX-1005", customer: "Sneha Reddy", date: "2026-07-21", amount: "$120.00", status: "Completed", type: "Subscription" }
    ];

    // Demo system alerts / activities
    const activities = [
        { type: "user", text: "New user registered: Devendra Kumar", time: "5 mins ago", icon: "user-plus" },
        { type: "server", text: "Server CPU spike detected (88%)", time: "15 mins ago", icon: "exclamation-triangle" },
        { type: "payment", text: "Payment received from TX-1001", time: "1 hour ago", icon: "credit-card" },
        { type: "system", text: "Backup completed successfully", time: "4 hours ago", icon: "check-circle" }
    ];

    res.render("dashboard", {
        title: "Vedant Admin Dashboard",
        stats,
        transactions,
        activities,
        recentProducts,
        recentCategories,
        user: {
            name: "Vedant Admin",
            role: "Super Admin",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
        }
    });
};
