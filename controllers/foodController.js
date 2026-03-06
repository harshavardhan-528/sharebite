const Food = require("../models/food");
const User = require("../models/user");
const sendMail = require("../utils/sendMail");


/* ===========================
   DISTANCE FUNCTION
=========================== */

function calculateDistance(lat1, lon1, lat2, lon2){

const R = 6371;

const dLat = (lat2 - lat1) * Math.PI / 180;
const dLon = (lon2 - lon1) * Math.PI / 180;

const a =
Math.sin(dLat/2) * Math.sin(dLat/2) +
Math.cos(lat1 * Math.PI/180) *
Math.cos(lat2 * Math.PI/180) *
Math.sin(dLon/2) * Math.sin(dLon/2);

const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

return R * c;

}



/* ===========================
   DONATE FOOD
=========================== */

exports.donateFood = async (req, res) => {

try {

const {
donor,
foodType,
quantity,
description,
pickupAddress,
latitude,
longitude,
donationTime,
expiryTime
} = req.body;

const lat = parseFloat(latitude);
const lng = parseFloat(longitude);

const image = req.file ? req.file.filename : null;

const food = new Food({

donor,
foodType,
quantity,
description,
pickupAddress,

latitude: lat,
longitude: lng,

donationTime: donationTime || new Date(),

location:{
type:"Point",
coordinates:[lng,lat]
},

expiryTime,
image,
status:"available"

});

await food.save();


/* ===========================
   FIND NEAREST VOLUNTEER
=========================== */

const volunteers = await User.find({ role:"volunteer" });

let nearestVolunteer = null;
let minDistance = Infinity;

volunteers.forEach(v => {

if(v.latitude && v.longitude){

const distance = calculateDistance(
lat,
lng,
v.latitude,
v.longitude
);

if(distance < minDistance){

minDistance = distance;
nearestVolunteer = v;

}

}

});

if(nearestVolunteer){

food.volunteer = nearestVolunteer._id;
food.status = "assigned";

await food.save();

}



/* ===========================
   SOCKET NOTIFICATION
=========================== */

const io = req.app.get("io");

if(io){

io.emit("newFoodDonation",{
foodType,
quantity,
location:pickupAddress
});

}



/* ===========================
   EMAIL TO DONOR
=========================== */

const donorUser = await User.findById(donor);

if(donorUser){

await sendMail(

donorUser.email,

"Food Donation Confirmed",

`<h2>Thank you for donating food!</h2>

Food Type: ${foodType}<br>
Quantity: ${quantity}<br>
Location: ${pickupAddress}

<p>Your food will reach someone in need ❤️</p>

ShareBite Team`

);

}



/* ===========================
   EMAIL TO ADMIN
=========================== */

if(process.env.ADMIN_EMAIL){

await sendMail(

process.env.ADMIN_EMAIL,

"New Food Donation",

`<h3>New donation received</h3>

Food: ${foodType}<br>
Quantity: ${quantity}<br>
Location: ${pickupAddress}`

);

}



res.status(201).json({

message:"Food donation posted successfully",
food

});

} catch(error){

res.status(500).json({
error:error.message
});

}

};



/* ===========================
   GET ALL FOOD
=========================== */

exports.getAllFood = async (req,res)=>{

try{

const foods = await Food.find()
.populate("donor","name email phone");

res.json(foods);

}catch(error){

res.status(500).json({
error:error.message
});

}

};



/* ===========================
   GET NEARBY FOOD
=========================== */

exports.getNearbyFood = async(req,res)=>{

try{

const {lat,lng} = req.query;

const latitude = parseFloat(lat);
const longitude = parseFloat(lng);

const foods = await Food.find({

location:{
$near:{
$geometry:{
type:"Point",
coordinates:[longitude,latitude]
},
$maxDistance:5000
}
},

status:"available"

}).populate("donor","name phone");


/* Add distance to response */

const foodsWithDistance = foods.map(food => {

const distance = calculateDistance(
latitude,
longitude,
food.latitude,
food.longitude
);

return {
...food._doc,
distance: distance.toFixed(2)
};

});


res.json({

count:foodsWithDistance.length,
foods:foodsWithDistance

});

}catch(error){

res.status(500).json({
error:error.message
});

}

};



/* ===========================
   ACCEPT FOOD
=========================== */

exports.acceptFood = async(req,res)=>{

try{

const {foodId,volunteerId} = req.body;

const food = await Food.findById(foodId);

if(!food){

return res.status(404).json({
message:"Food donation not found"
});

}

food.status = "accepted";
food.volunteer = volunteerId;

await food.save();


const volunteer = await User.findById(volunteerId);
const donorUser = await User.findById(food.donor);



/* EMAIL TO VOLUNTEER */

if(volunteer){

await sendMail(

volunteer.email,

"Food Pickup Assigned",

`<h2>You have been assigned a food pickup</h2>

Food: ${food.foodType}<br>
Quantity: ${food.quantity}<br>
Location: ${food.pickupAddress}`

);

}



/* EMAIL TO DONOR */

if(donorUser && volunteer){

await sendMail(

donorUser.email,

"Volunteer Assigned",

`<h2>Your food donation is being picked up</h2>

Volunteer: ${volunteer.name}<br>
Phone: ${volunteer.phone}`

);

}



res.json({

message:"Food accepted by volunteer",
food

});

}catch(error){

res.status(500).json({
error:error.message
});

}

};



/* ===========================
   UPDATE FOOD STATUS
=========================== */

exports.updateFoodStatus = async(req,res)=>{

try{

const {foodId,status} = req.body;

const food = await Food.findById(foodId);

if(!food){

return res.status(404).json({
message:"Food not found"
});

}

const validStatus = ["available","accepted","picked","delivered"];

if(!validStatus.includes(status)){
return res.status(400).json({message:"Invalid status"});
}

food.status = status;

await food.save();


/* SOCKET DELIVERY UPDATE */

const io = req.app.get("io");

if(io){

io.emit("deliveryUpdate",{
foodId,
status
});

}



/* EMAIL WHEN DELIVERED */

if(status === "delivered"){

const donorUser = await User.findById(food.donor);

if(donorUser){

await sendMail(

donorUser.email,

"Food Delivered Successfully",

`<h2>Your food donation reached people in need!</h2>

Food: ${food.foodType}<br>
Quantity: ${food.quantity}

<p>Thank you for helping others ❤️</p>

ShareBite Team`

);

}

}


res.json({

message:"Food status updated",
food

});

}catch(error){

res.status(500).json({
error:error.message
});

}

};

/* =========================
AUTO REMOVE EXPIRED FOOD
========================= */

exports.removeExpiredFood = async ()=>{

try{

const now = new Date();

const expiredFoods = await Food.updateMany(
{
expiryTime:{ $lt: now },
status:"available"
},
{
status:"expired"
}
);

console.log("Expired food cleaned");

}catch(err){

console.log("Expiry cleanup error:",err.message);

}

};