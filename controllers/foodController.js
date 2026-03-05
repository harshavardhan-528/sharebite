const Food = require("../models/food");
const User = require("../models/user");
const sendMail = require("../utils/sendMail");


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
expiryTime
} = req.body;

const image = req.file ? req.file.filename : null;

const food = new Food({

donor,
foodType,
quantity,
description,
pickupAddress,
latitude: parseFloat(latitude),
longitude: parseFloat(longitude),

location:{
type:"Point",
coordinates:[
parseFloat(longitude),
parseFloat(latitude)
]
},

expiryTime,
image,
status:"available"

});

await food.save();


/* EMAIL TO DONOR */

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

ShareBite Team

`

);

}


/* EMAIL TO ADMIN */

await sendMail(

process.env.ADMIN_EMAIL,

"New Food Donation",

`<h3>New donation received</h3>

Food: ${foodType}<br>
Quantity: ${quantity}<br>
Location: ${pickupAddress}

`

);


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

const foods = await Food.find({

location:{
$near:{
$geometry:{
type:"Point",
coordinates:[
parseFloat(lng),
parseFloat(lat)
]
},
$maxDistance:5000
}
},

status:"available"

}).populate("donor","name phone");


res.json({

count:foods.length,
foods

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

food.status="accepted";
food.volunteer=volunteerId;

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
Location: ${food.pickupAddress}

`

);

}


/* EMAIL TO DONOR */

if(donorUser){

await sendMail(

donorUser.email,

"Volunteer Assigned",

`<h2>Your food donation is being picked up</h2>

Volunteer: ${volunteer.name}<br>
Phone: ${volunteer.phone}

`

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

food.status = status;

await food.save();


/* EMAIL WHEN DELIVERED */

if(status==="delivered"){

const donorUser = await User.findById(food.donor);

if(donorUser){

await sendMail(

donorUser.email,

"Food Delivered Successfully",

`<h2>Your food donation reached people in need!</h2>

Food: ${food.foodType}<br>
Quantity: ${food.quantity}

<p>Thank you for helping others ❤️</p>

ShareBite Team

`

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