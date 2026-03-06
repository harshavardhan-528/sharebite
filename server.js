const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

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

/* Make socket available globally */
app.set("io",io);

/* Connect Database */
connectDB();

/* Middleware */
app.use(express.json());
app.use(express.urlencoded({extended:true}));

/* Static folders */
app.use(express.static("public"));
app.use("/uploads",express.static("public/uploads"));

/* Routes */
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

/* Default route */
app.get("/",(req,res)=>{
  res.sendFile(__dirname+"/public/index.html");
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


/* Server port */

const PORT = process.env.PORT || 5000;

server.listen(PORT,()=>{

console.log(`Server running on port ${PORT}`);

});