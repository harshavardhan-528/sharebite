const Food = require("../models/food");
const User = require("../models/User");
const Request = require("../models/request");

exports.getStats = async (req,res)=>{

try{

const totalFood = await Food.countDocuments();

const deliveredFood =
await Food.countDocuments({status:"delivered"});

const totalUsers =
await User.countDocuments();

const volunteers =
await User.countDocuments({role:"volunteer"});

const requests =
await Request.countDocuments();

res.json({

totalFood,
deliveredFood,
totalUsers,
volunteers,
requests

});

}catch(err){

res.status(500).json({
error:err.message
});

}

};