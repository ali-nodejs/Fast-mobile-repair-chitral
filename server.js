require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;


// ===== MIDDLEWARE =====

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 24 * 60 * 60 * 1000
}
}));
app.get("/admin.html", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});
app.use(express.static("public"));

// ===== ADMIN LOGIN =====

const ADMIN_USER = "admin";
const ADMIN_PASS = process.env.ADMIN_PASS;


// ===== DATABASE FILE =====

const DB_FILE = path.join(__dirname, "request.json");


// ===== READ DATA =====

function readData() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return [];
    }

    const raw = fs.readFileSync(DB_FILE, "utf8").trim();

    if (!raw) {
      return [];
    }

    const data = JSON.parse(raw);

    // Old + new format ko normalize karo
    return data.map(item => ({
      id: item.id || Date.now(),
      name: item.name || "",
      phone: item.phone || "",

      // Old data me "message" hai
      // New data me "problem" hai
      problem: item.problem || item.message || "",

      // Compatibility ke liye message bhi rakhein
      message: item.problem || item.message || "",

      status: item.status || "pending",

      date: item.date || new Date().toLocaleString("en-PK", {
        timeZone: "Asia/Karachi"
      })
    }));

  } catch (error) {
    console.error("DB Read Error:", error);
    return [];
  }
}


// ===== WRITE DATA =====

function writeData(data) {
  try {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(data, null, 2)
    );

    return true;

  } catch (error) {
    console.error("DB Write Error:", error);
    return false;
  }
}


// ===== LOGIN MIDDLEWARE =====

function requireLogin(req, res, next) {
  if (req.session.loggedIn) {
    return next();
  }

  res.status(401).json({
    error: "Unauthorized. Please login."
  });
}


// ===== LOGIN PAGE =====

app.get("/login", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public/login.html")
  );
});


// ===== LOGIN =====

app.post("/login", (req, res) => {

  const {
    username,
    password
  } = req.body;

  if (
    username === ADMIN_USER &&
    password === ADMIN_PASS
  ) {

    req.session.loggedIn = true;

    res.redirect("/admin");

  } else {

    res.send(
      "Invalid credentials ❌ <a href='/login'>Try Again</a>"
    );
  }
});


// ===== LOGOUT =====

app.get("/logout", (req, res) => {

  req.session.destroy(() => {
    res.redirect("/login");
  });

});


// ===== PROTECTED ADMIN PAGE =====

app.get("/admin", (req, res) => {

  if (!req.session.loggedIn) {
    return res.redirect("/login");
  }

  res.sendFile(
    path.join(__dirname, "public/admin.html")
  );

});


// ===== SUBMIT REQUEST =====

app.post("/submit-request", (req, res) => {

  const name = req.body.name;
  const phone = req.body.phone;
  const problem = req.body.problem || req.body.message;

  if (!name || !phone || !problem) {

    return res.status(400).json({
      success: false,
      error: "All fields are required"
    });

  }

  const data = readData();

  const newRequest = {

    id: Date.now(),

    name: name.trim(),

    phone: phone.trim(),

    problem: problem.trim(),

    message: problem.trim(),

    status: "pending",

    date: new Date().toLocaleString("en-PK", {
      timeZone: "Asia/Karachi"
    })

  };

  data.push(newRequest);

  if (!writeData(data)) {

    return res.status(500).json({
      success: false,
      error: "Could not save request"
    });

  }

  res.json({
    success: true,
    message: "Request saved successfully"
  });

});


// ===== GET ALL REQUESTS =====

app.get("/api/requests", requireLogin, (req, res) => {

  res.json(readData());

});


// ===== ALSO SUPPORT OLD ADMIN.JS ROUTE =====

app.get("/requests", requireLogin, (req, res) => {

  res.json(readData());

});


// ===== UPDATE REQUEST =====

app.put("/update/:id", requireLogin, (req, res) => {

  const id = Number(req.params.id);

  const name = req.body.name;
  const phone = req.body.phone;
  const problem = req.body.problem || req.body.message;

  if (!name || !phone || !problem) {

    return res.status(400).json({
      success: false,
      error: "Name, phone and problem are required"
    });

  }

  const data = readData();

  const index = data.findIndex(
    item => Number(item.id) === id
  );

  if (index === -1) {

    return res.status(404).json({
      success: false,
      error: "Request not found"
    });

  }

  data[index] = {

    ...data[index],

    name: name.trim(),

    phone: phone.trim(),

    problem: problem.trim(),

    message: problem.trim()

  };

  if (!writeData(data)) {

    return res.status(500).json({
      success: false,
      error: "Could not update request"
    });

  }

  res.json({
    success: true,
    message: "Request updated successfully"
  });

});


// ===== TOGGLE STATUS =====

app.post("/toggle/:id", requireLogin, (req, res) => {

  const id = Number(req.params.id);

  const data = readData();

  const item = data.find(
    item => Number(item.id) === id
  );

  if (!item) {

    return res.status(404).json({
      success: false,
      error: "Request not found"
    });

  }

  item.status =
    item.status === "done"
      ? "pending"
      : "done";

  if (!writeData(data)) {

    return res.status(500).json({
      success: false,
      error: "Could not update status"
    });

  }

  res.json({
    success: true,
    status: item.status
  });

});


// ===== DELETE REQUEST =====

app.post("/delete/:id", requireLogin, (req, res) => {

  const id = Number(req.params.id);

  const data = readData();

  const filteredData = data.filter(
    item => Number(item.id) !== id
  );

  if (filteredData.length === data.length) {

    return res.status(404).json({
      success: false,
      error: "Request not found"
    });

  }

  if (!writeData(filteredData)) {

    return res.status(500).json({
      success: false,
      error: "Could not delete request"
    });

  }

  res.json({
    success: true,
    message: "Request deleted successfully"
  });

});


// ===== SERVER START =====

app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );

});
