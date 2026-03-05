const NGO = require("../models/ngo");


exports.getNGOs = async(req,res)=>{

try{

const ngos = await NGO.find();

res.json(ngos);

}catch(err){

res.status(500).json({
error:err.message
});

}

};