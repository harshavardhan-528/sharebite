const Donor = require("../models/donor");

exports.addDonor = async(req,res)=>{

try{

const donor = new Donor(req.body);

await donor.save();

res.json({
message:"Donor added successfully",
donor
});

}catch(err){

res.status(500).json({
error:err.message
});

}

};



exports.getDonors = async(req,res)=>{

try{

const donors = await Donor.find();

res.json(donors);

}catch(err){

res.status(500).json({
error:err.message
});

}

};