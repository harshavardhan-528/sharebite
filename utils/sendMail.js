const transporter = require("../config/email");

const sendMail = async(to,subject,message)=>{

await transporter.sendMail({

from: `"ShareBite" <${process.env.EMAIL_USER}>`,

to: to,

subject: subject,

html: message

});

};

module.exports = sendMail;