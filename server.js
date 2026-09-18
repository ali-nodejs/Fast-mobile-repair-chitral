const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: "ChitralRepair@Fast$2026#VeryLongRandomSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

const ADMIN_USER = "admin";
const ADMIN_PASS = "191987";
const DB_FILE = path.join(__dirname, "request.json");

function readData() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, "[]");
            return [];
        }
        const raw = fs.readFileSync(DB_FILE, 'utf8').trim();
        if(!raw) return [];
        return JSON.parse(raw);
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
        console.error("DB Write Error Detailed:", err);
        return false;
    }
}

// Form submit
app.post("/submit-request", (req, res) => {
    const name = req.body.name;
    const phone = req.body.phone;
    const message = req.body.message || req.body.problem; // dono naam support karega

    if(!name || !phone || !message){
        return res.status(400).json({ success: false, error: "Fields missing" });
    }

    let data = readData();
    data.push({
        id: Date.now(),
        name, phone, message,
        date: new Date().toLocaleString("en-PK", {timeZone: "Asia/Karachi"})
    });
    
    if(writeData(data)){
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, error: "DB Error" });
    }
});

// Admin API - ye missing tha Sir
app.get("/api/requests", (req, res) => {
    if(!req.session.loggedIn) return res.status(401).json([]);
    res.json(readData());
});

function requireLogin(req, res, next) {
    if (req.session.loggedIn) next();
    else res.redirect("/login");
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

app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public/login.html")));
app.get("/admin", requireLogin, (req, res) => res.sendFile(path.join(__dirname, "public/admin.html")));
app.get("/logout", (req, res) => req.session.destroy(() => res.redirect("/login")));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));