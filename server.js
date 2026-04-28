const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const app = express();

// ===== MIDDLEWARE - 1 baar bas =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
  secret: "ChitralRepair@Fast$2026#VeryLongRandomSecretKey", // 👈 Isko change kar dena
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 din
}));

const ADMIN_USER = "admin";
const ADMIN_PASS = "191987"; // 👈 Production me strong rakho
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

// Auth middleware - Fiverr ke liye zaroori
function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized. Please login." });
  }
}

// ===== AUTH ROUTES =====
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.loggedIn = true;
    res.redirect("/admin");
  } else {
    res.send("Invalid credentials ❌ <a href='/login'>Try Again</a>");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// ===== ADMIN PAGE - Protected =====
app.get("/admin", (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "public/admin.html"));
});

// ===== API ROUTES =====
// Public: Submit form
app.post("/submit", (req, res) => {
  const { name, phone, problem } = req.body;
  if (!name ||!phone ||!problem) {
    return res.status(400).json({ error: "All fields required" });
  }

  const data = readData();
  const newRequest = {
    id: Date.now(),
    name: name.trim(),
    phone: phone.trim(),
    problem: problem.trim(),
    status: "pending",
    date: new Date().toISOString()
  };

  data.push(newRequest);
  writeData(data);
  res.json({ success: true, message: "Saved" });
});

// Protected: Get all requests
app.get("/requests", requireLogin, (req, res) => {
  res.json(readData());
});

// Protected: Update request
app.put("/update/:id", requireLogin, (req, res) => {
  const id = Number(req.params.id);
  const { name, phone, problem } = req.body;

  let data = readData();
  const index = data.findIndex(item => item.id === id);

  if (index === -1) return res.status(404).json({ error: "Not found" });

  data[index] = {...data[index], name, phone, problem };
  writeData(data);
  res.json({ success: true });
});

// Protected: Toggle status
app.post("/toggle/:id", requireLogin, (req, res) => {
  const id = Number(req.params.id);
  let data = readData();

  data = data.map(item => {
    if (item.id === id) {
      item.status = item.status === "pending"? "done" : "pending";
    }
    return item;
  });

  writeData(data);
  res.json({ success: true });
});

// Protected: Delete request
app.post("/delete/:id", requireLogin, (req, res) => {
  const id = Number(req.params.id);
  let data = readData();
  data = data.filter(item => item.id!== id);
  writeData(data);
  res.json({ success: true });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
