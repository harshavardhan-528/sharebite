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
type:String,
required:true
},

description:String,

pickupAddress:String,

latitude:Number,

longitude:Number,

donationTime:Date,

location:{
type:{
type:String,
enum:["Point"],
default:"Point"
},
coordinates:[Number]
},

expiryTime:Date,

image:String,

donorType:{
type:String,
enum:["instant","restaurant"],
default:"instant"
},

status:{
type:String,
default:"available"
},

createdAt:{
type:Date,
default:Date.now
}

});

foodSchema.index({location:"2dsphere"});

module.exports=mongoose.model("Food",foodSchema);