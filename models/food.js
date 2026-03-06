const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({

donor:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

foodType:{
type:String,
required:true
},

quantity:{
type:Number,
required:true
},

description:{
type:String
},

pickupAddress:{
type:String
},

/* Coordinates for map */

latitude:{
type:Number
},

longitude:{
type:Number
},

/* GeoJSON location for distance queries */

location:{
type:{
type:String,
enum:["Point"],
default:"Point"
},
coordinates:{
type:[Number],
index:"2dsphere"
}
},

/* Donation time */

donationTime:{
type:Date,
default:Date.now
},

expiryTime:{
type:Date
},

image:{
type:String
},

donorType:{
type:String,
enum:["instant","restaurant"],
default:"instant"
},

status:{
type:String,
enum:["available","accepted","picked","delivered"],
default:"available"
},

createdAt:{
type:Date,
default:Date.now
}

});

/* Geo index for nearby search */

foodSchema.index({location:"2dsphere"});

module.exports = mongoose.model("Food",foodSchema);