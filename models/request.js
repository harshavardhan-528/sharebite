const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({

requester:{
type: mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

foodType:String,

quantity:String,

description:String,

location:String,

latitude:Number,
longitude:Number,

status:{
type:String,
default:"pending"
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Request",requestSchema);