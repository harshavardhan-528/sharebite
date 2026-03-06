const Request = require("../models/request");


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

const request = new Request({

requester,
foodType,
quantity,
location,
latitude,
longitude,
status:"pending"

});

await request.save();

const io = req.app.get("io");

io.emit("newFoodRequest",{
foodType,
quantity,
location
});

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

request.status="accepted";
request.volunteer=volunteerId;

await request.save();

const io = req.app.get("io");

io.emit("requestAccepted",{
requestId,
status:"accepted"
});

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

const requests = await Request.find({

latitude:{
$gte: latitude - 0.1,
$lte: latitude + 0.1
},

longitude:{
$gte: longitude - 0.1,
$lte: longitude + 0.1
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