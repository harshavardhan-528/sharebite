const Request = require("../models/request");


/* Create request */

exports.createRequest = async(req,res)=>{

try{

const request = new Request(req.body);

await request.save();

res.json({
message:"Food request created",
request
});

}catch(err){

res.status(500).json({
error:err.message
});

}

};


/* Get all requests */

exports.getRequests = async(req,res)=>{

try{

const requests = await Request.find()
.populate("requester","name phone");

res.json(requests);

}catch(err){

res.status(500).json({
error:err.message
});

}

};


/* Accept request */

exports.acceptRequest = async(req,res)=>{

try{

const {requestId} = req.body;

const request = await Request.findById(requestId);

request.status="accepted";

await request.save();

res.json({
message:"Request accepted"
});

}catch(err){

res.status(500).json({
error:err.message
});

}

};