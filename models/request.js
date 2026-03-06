const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({

requester:{
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

location:{
type:String,
required:true
},

latitude:Number,

longitude:Number,

volunteer:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

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