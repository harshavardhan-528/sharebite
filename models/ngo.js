const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema({

name:String,

address:String,

phone:String,

email:String,

description:String,

latitude:Number,
longitude:Number

});

module.exports =
mongoose.model("NGO",ngoSchema);