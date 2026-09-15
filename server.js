const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 3000;

// ===== MIDDLEWARE =====
app.use(express.json()); // JSON ke liye zaroori
app.use(express.urlencoded({ extended: true })); // Form ke liye
app.use(express.static("public")); // CSS, JS, Images ke liye
app.use(session({
    secret: "ChitralRepair@Fast$2026#VeryLongRandomSecretKey", // Isko change kar dena
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 din
}));

const ADMIN_USER = "admin";
const ADMIN_PASS = "191987"; // Apna password yahan
const DB_FILE = path.join(__dirname, "request.json");

// ===== HELPER FUNCTIONS =====
function readData() {
    try {
        if (!fs.existsSync(DB_FILE)) return [];
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (err) {
        console.error("DB Read Error:", err);
        return [];
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("DB Write Error:", err);
        return false;
    }
}
// ===== PUBLIC FORM SUBMIT ROUTE =====
app.post("/submit-request", (req, res) => {
    const { name, phone, message } = req.body;
    let data = readData();
    
    const newRequest = {
        id: Date.now(),
        name,
        phone,
        message,
        date: new Date().toLocaleString("en-PK")
    };
    
    data.push(newRequest);
    
    if(writeData(data)){
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, error: "DB Error" });
    }
});

// Auth middleware
function requireLogin(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect("/login"); // 401 ki jagah login pe bhej do
    }
}
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if(username === ADMIN_USER && password === ADMIN_PASS){
        req.session.loggedIn = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});
// ===== AUTH ROUTES =====
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public/login.html"));
});
app.get("/admin", requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "public/admin.html"));
});
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
    