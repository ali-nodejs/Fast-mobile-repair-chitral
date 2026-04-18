const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();
app.use(express.json());
const fs = require("fs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // HTML serve karne ke liye

app.use(session({
  secret: "mysecretkey",
  resave: false,
  saveUninitialized: true
}));

const ADMIN_USER = "admin";
const ADMIN_PASS = "1122";

// Login GET
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

// Login POST
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if(username === ADMIN_USER && password === ADMIN_PASS){
    req.session.loggedIn = true;
    res.redirect("/admin.html"); // tumhara existing admin page
  } else {
    res.send("Invalid credentials ❌ <a href='/login'>Try Again</a>");
  }
});

// Admin route protect (optional)
app.get("/admin", (req, res, next) => {
  if(!req.session.loggedIn){
    return res.redirect("/login");
  }
  next(); // agla middleware (static serve) execute hoga
});

app.use(express.json());
app.use(express.static("public"));

let file = path.join(__dirname, "request.json");

function readData(){
  if(!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file));
}

function writeData(data){
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
app.post("/submit", (req, res) => {
  const { name, phone, problem } = req.body;

  const newRequest = {
    id: Date.now(), // 🔥 UNIQUE ID
    name,
    phone,
    problem,
    status: "pending"
  };

  let data = [];

  if (fs.existsSync("request.json")) {
    data = JSON.parse(fs.readFileSync("request.json"));
  }
  data.push(newRequest);

  fs.writeFileSync("request.json", JSON.stringify(data, null, 2));

  res.send("Saved");
});
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect("/admin");
        }
        res.redirect("/login");
    });
});
app.get("/requests", (req, res) => {
  if (fs.existsSync("request.json")) {
    const data = fs.readFileSync("request.json");
    res.json(JSON.parse(data));
  } else {
    res.json([]);
  }
});
app.put("/update/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, phone, problem } = req.body;

  let data = JSON.parse(fs.readFileSync("request.json"));

  data = data.map(item =>
    item.id === id ? { ...item, name, phone, problem } : item
  );

  fs.writeFileSync("request.json", JSON.stringify(data, null, 2));

  res.send("Updated")
  
});
app.post("/toggle/:id", (req, res) => {
  const id = Number(req.params.id);

  let data = JSON.parse(fs.readFileSync("request.json"));

  data = data.map(item => {
    if (item.id === id) {
      return {
        ...item,
        status: item.status === "pending" ? "done" : "pending"
      };
    }
    return item;
  });

  fs.writeFileSync("request.json", JSON.stringify(data, null, 2));

  res.send("Toggled");
});
app.post("/delete/:id", (req, res) => {
  const id = Number(req.params.id);

  let data = JSON.parse(fs.readFileSync("request.json"));

  data = data.filter(item => item.id !== id);

  fs.writeFileSync("request.json", JSON.stringify(data, null, 2));

  res.send("Deleted");
});
/*let data = JSON.parse(fs.readFileSync("request.json"));

data = data.map((item, index) => ({
  id: Date.now() + index,
  ...item
}));
fs.writeFileSync("request.json", JSON.stringify(data, null, 2));
console.log("IDs added");*/
app.listen(3000, () => console.log("Server running on http://localhost:3000"));