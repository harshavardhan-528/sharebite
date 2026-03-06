const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const foodController = require("./controllers/foodController");


dotenv.config();

const app = express();

/* Create HTTP server */
const server = http.createServer(app);

/* Socket.IO setup */
const io = new Server(server,{
  cors:{
    origin:"*"
  }
});

/* =========================
RUN EXPIRY CLEANER
========================= */

setInterval(()=>{

foodController.removeExpiredFood();

},60000);

/* Make socket available globally */
app.set("io",io);

/* Connect Database */
connectDB();

/* Middleware */
app.use(express.json());
app.use(express.urlencoded({extended:true}));

/* Static folder */
app.use(express.static(path.join(__dirname,"public")));
app.use("/uploads",express.static(path.join(__dirname,"public/uploads")));


/* ================= API ROUTES ================= */

const userRoutes = require("./routes/userRoutes");
const foodRoutes = require("./routes/foodRoutes");
const donorRoutes = require("./routes/donorRoutes");
const requestRoutes = require("./routes/requestRoutes");
const ngoRoutes = require("./routes/ngoRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/users",userRoutes);
app.use("/api/food",foodRoutes);
app.use("/api/donors",donorRoutes);
app.use("/api/request",requestRoutes);
app.use("/api/ngo",ngoRoutes);
app.use("/api/admin",adminRoutes);


/* ================= FRONTEND ROUTES ================= */

/* Home page */
app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"public","index.html"));
});

/* Serve any HTML page from public */

app.get("/:page",(req,res)=>{

const page = req.params.page;

res.sendFile(path.join(__dirname,"public",page));

});


/* ================= SOCKET.IO ================= */

io.on("connection",(socket)=>{

console.log("Client connected:",socket.id);

/* Volunteer location */

socket.on("volunteerLocation",(data)=>{

console.log("Volunteer location:",data);

io.emit("updateVolunteerLocation",{
lat:data.lat,
lng:data.lng
});

});

/* New food donation */

socket.on("newDonation",(data)=>{

io.emit("newDonation",data);

});

/* New food request */

socket.on("newFoodRequest",(data)=>{

io.emit("newFoodRequest",data);

});

/* Request accepted */

socket.on("requestAccepted",(data)=>{

io.emit("requestAccepted",data);

});

socket.on("disconnect",()=>{

console.log("Client disconnected:",socket.id);

});

});


/* ================= SERVER START ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT,()=>{

console.log(`Server running on port ${PORT}`);

});