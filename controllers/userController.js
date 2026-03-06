const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ======================
// Register User
// ======================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};



// ======================
// Login User
// ======================
exports.loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      message: "Login successful",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};
exports.updateLocation = async(req,res)=>{

try{

const {userId,latitude,longitude} = req.body;

const user = await User.findById(userId);

user.latitude = latitude;
user.longitude = longitude;

await user.save();

res.json({
message:"Location updated"
});

}catch(err){

res.status(500).json({
error:err.message
});

}

};

exports.forgotPassword = async (req,res)=>{

try{

const {email} = req.body;

const user = await User.findOne({email});

if(!user){

return res.json({message:"User not found"});
}

const token = crypto.randomBytes(32).toString("hex");

user.resetToken = token;

await user.save();

const resetLink = `https://sharebite-x3dv.onrender.com/reset.html?token=${token}`;

const transporter = nodemailer.createTransport({

service:"gmail",

auth:{
user:process.env.EMAIL_USER,
pass:process.env.EMAIL_PASS
}

});

await transporter.sendMail({

to:email,

subject:"Password Reset",

html:`Click this link to reset password: <a href="${resetLink}">${resetLink}</a>`

});

res.json({message:"Reset link sent to email"});

}catch(err){

res.status(500).json({error:err.message});

}

};
// ======================
// Reset Password
// ======================
exports.resetPassword = async (req,res)=>{

try{

const {token,password} = req.body;

/* find user with reset token */

const user = await User.findOne({resetToken:token});

if(!user){

return res.status(400).json({
message:"Invalid or expired token"
});

}

/* hash new password */

const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password,salt);

/* update password */

user.password = hashedPassword;
user.resetToken = undefined;

await user.save();

res.json({
message:"Password reset successful"
});

}catch(err){

res.status(500).json({
error:err.message
});

}

};