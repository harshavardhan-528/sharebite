const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema({

name:{
type:String,
required:true
},

type:{
type:String,
default:"restaurant"
},

address:String,

latitude:Number,

longitude:Number,

phone:String,

email:String,

description:String,

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Donor", donorSchema);