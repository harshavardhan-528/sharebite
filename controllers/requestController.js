const Request = require("../models/request");
const User = require("../models/user");


/* =========================
   Create Food Request
========================= */

exports.createRequest = async (req,res)=>{

try{

const {
requester,
foodType,
quantity,
location,
latitude,
longitude
} = req.body;


/* VALIDATION */

if(!foodType || !quantity || !location){

return res.status(400).json({
error:"Food type, quantity and location are required"
});

}


const lat = parseFloat(latitude);
const lng = parseFloat(longitude);


/* CREATE REQUEST */

const request = new Request({

requester: requester || null,

foodType,
quantity,
location,

latitude: lat,
longitude: lng,

locationPoint:{
type:"Point",
coordinates:[lng,lat]
},

status:"pending"

});

await request.save();


/* SOCKET NOTIFICATION */

const io = req.app.get("io");

if(io){

io.emit("newFoodRequest",{
foodType,
quantity,
location
});

}


res.status(201).json({

message:"Food request created successfully",
request

});

}catch(err){

res.status(500).json({
error:err.message
});

}

};



/* =========================
   Get All Requests
========================= */

exports.getRequests = async(req,res)=>{

try{

const requests = await Request.find()
.populate("requester","name email phone");

res.json(requests);

}catch(err){

res.status(500).json({
error:err.message
});

}

};



/* =========================
   Accept Request (Volunteer)
========================= */

exports.acceptRequest = async(req,res)=>{

try{

const {requestId,volunteerId} = req.body;

const request = await Request.findById(requestId);

if(!request){

return res.status(404).json({
message:"Request not found"
});

}

/* Prevent multiple accepts */

if(request.status !== "pending"){

return res.status(400).json({
message:"Request already accepted"
});

}

request.status="accepted";
request.volunteer=volunteerId;

await request.save();


/* SOCKET */

const io = req.app.get("io");

if(io){

io.emit("requestAccepted",{
requestId,
status:"accepted"
});

}


res.json({

message:"Request accepted successfully",
request

});

}catch(err){

res.status(500).json({
error:err.message
});

}

};



/* =========================
   Mark Request Delivered
========================= */

exports.markDelivered = async(req,res)=>{

try{

const {requestId} = req.body;

const request = await Request.findById(requestId);

if(!request){

return res.status(404).json({
message:"Request not found"
});

}

request.status="delivered";

await request.save();

res.json({

message:"Food delivered successfully",
request

});

}catch(err){

res.status(500).json({
error:err.message
});

}

};



/* =========================
   Delete Request
========================= */

exports.deleteRequest = async(req,res)=>{

try{

const {requestId} = req.body;

await Request.findByIdAndDelete(requestId);

res.json({

message:"Request deleted successfully"

});

}catch(err){

res.status(500).json({
error:err.message
});

}

};



/* =========================
   Get Nearby Requests
========================= */

exports.getNearbyRequests = async(req,res)=>{

try{

const {lat,lng} = req.query;

const latitude = parseFloat(lat);
const longitude = parseFloat(lng);

if(!latitude || !longitude){

return res.status(400).json({
error:"Latitude and Longitude required"
});

}

const requests = await Request.find({

locationPoint:{
$near:{
$geometry:{
type:"Point",
coordinates:[longitude,latitude]
},
$maxDistance:5000
}
},

status:"pending"

}).populate("requester","name phone");


res.json({

count:requests.length,
requests

});

}catch(err){

res.status(500).json({
error:err.message
});

}

};