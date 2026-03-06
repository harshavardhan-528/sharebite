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
type:Number,
required:true
},

location:{
type:String,
required:true
},

/* Coordinates */

latitude:{
type:Number
},

longitude:{
type:Number
},

/* GeoJSON location for map queries */

locationPoint:{
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

volunteer:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

status:{
type:String,
enum:["pending","accepted","completed"],
default:"pending"
},

createdAt:{
type:Date,
default:Date.now
}

});

/* Enable geospatial queries */

requestSchema.index({locationPoint:"2dsphere"});

module.exports = mongoose.model("Request",requestSchema);