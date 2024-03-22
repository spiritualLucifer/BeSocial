const router = require("express").Router();
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt");
const User = require("../models/User");

router.post('/OptGenerate',async(req,res)=>{
        const email = req.body.email;
        const user = await User.findOne({email:email})
        if(!user){
            return res.status(200).json("No User exist");
        }
        function generateOTP() {
            const otp = Math.floor(1000 + Math.random() * 9000);
            return otp.toString();
        }
        const otp = generateOTP(); 

        const body = `Your OTP: ${otp}
    
        Please keep this OTP confidential. It's for resetting your password. Use it once within a limited time.
    
        If you didn't request this OTP, please ignore this email.
    
        Thanks.`;
        const transport = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:"virendryadav453@gmail.com",
                pass:"faigsfdehmpyfgyp"
            }
        })
        const mailOptions = {
            from:"virendryadav453@gmail.com",
            to:email,
            subject:"Set Forgote Password",
            text:body,
        }
        await transport.sendMail(mailOptions,(err,info)=>{
            if (err){
                return res.status(200).json("you Email not Found");
            }
            else{
                return res.status(200).json(otp);
            }
        })
}) 

router.post("/setPassword/:email",async(req,res)=>{
      const newPassword = req.body.newpassword;
      const email = req.params.email;
      try {
        const user = await User.findOne({email:email})
        if(!user){
            return res.status(200).json("no User exist");
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword,salt);
        const upadate = await user.updateOne({$set:{password:hashPassword}});
        if (upadate) {
            return res.status(200).json("Your Password is Updated");
        }else{
            return res.status(200).json("Something Went wrong");
        }
      } catch (error) {
          res.status(500).json(error)
      }
})

module.exports = router;
