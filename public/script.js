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
    cookie: { maxAge: 24*60*60*1000 }
}));

const ADMIN_USER = "admin";
const ADMIN_PASS = "191987";
const DB_FILE = path.join(__dirname, "request.json");

function readData(){
  try{
    if(!fs.existsSync(DB_FILE)) return [];
    const raw = fs.readFileSync(DB_FILE,'utf8').trim();
    if(!raw) return [];
    let data = JSON.parse(raw);
    // Normalize - purane aur naye dono format ko ek jaisa banao
    return data.map(r => ({
      id: r.id || Date.now(),
      name: r.name || "",
      phone: r.phone || "",
      problem: r.problem || r.message || "",
      message: r.problem || r.message || "",
      status: r.status || "pending",
      date: r.date || new Date().toLocaleString("en-PK",{timeZone:"Asia/Karachi"})
    }));
  }catch(e){ console.error(e); return []; }
}
function writeData(data){ 
  try{ fs.writeFileSync(DB_FILE, JSON.stringify(data,null,2)); return true; } 
  catch(e){ console.error("Write Error:", e); return false; } 
}

app.post("/submit-request",(req,res)=>{
  const name = req.body.name;
  const phone = req.body.phone;
  const problem = req.body.problem || req.body.message;
  if(!name || !phone || !problem) return res.status(400).json({success:false});

  let data = [];
  try{ data = JSON.parse(fs.readFileSync(DB_FILE,'utf8')); } catch{ data=[]; }
  data.push({ id: Date.now(), name, phone, problem, message: problem, status: "pending", date: new Date().toLocaleString("en-PK",{timeZone:"Asia/Karachi"}) });
  
  if(writeData(data)) res.json({success:true});
  else res.status(500).json({success:false});
});

// Admin API - yehi admin panel use karega
app.get("/api/requests",(req,res)=>{
  if(!req.session.loggedIn) return res.status(401).json({error:"login"});
  res.json(readData());
});
app.post("/api/status/:id",(req,res)=>{
  if(!req.session.loggedIn) return res.status(401).json({});
  let data = [];
  try{ data = JSON.parse(fs.readFileSync(DB_FILE,'utf8')); } catch{ data=[]; }
  const item = data.find(x=> String(x.id)===String(req.params.id));
  if(item){ item.status = req.body.status; writeData(data); }
  res.json({success:true});
});

function requireLogin(req,res,next){ if(req.session.loggedIn) next(); else res.redirect("/login"); }
app.post("/login",(req,res)=>{
  if(req.body.username==="admin" && req.body.password==="191987"){ req.session.loggedIn=true; res.json({success:true}); }
  else res.status(401).json({success:false});
});
app.get("/login",(req,res)=> res.sendFile(path.join(__dirname,"public/login.html")));
app.get("/admin",requireLogin,(req,res)=> res.sendFile(path.join(__dirname,"public/admin.html")));
app.get("/logout",(req,res)=> req.session.destroy(()=> res.redirect("/login")));

app.listen(PORT,()=> console.log("Server running on http://localhost:"+PORT));