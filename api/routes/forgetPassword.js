const router = require("express").Router();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const User = require("../models/User");
let OTP = [];

router.post('/OptGenerate', async (req, res) => {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(200).json("No User exist");
    }

    function generateOTP() {
        const otp = Math.floor(1000 + Math.random() * 9000);
        return otp.toString();
    }
    const otp = generateOTP();
    OTP.push({ email, otp });

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="text-align: center; color: #4CAF50; animation: fadeIn 1s ease-in-out;">Password Reset OTP</h2>
            <p style="animation: slideIn 1.5s ease-in-out;">Dear User,</p>
            <p style="animation: slideIn 1.5s ease-in-out;">You requested to reset your password. Use the following OTP to proceed:</p>
            <div style="text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; color: #333; animation: fadeIn 2s ease-in-out;">
                ${otp}
            </div>
            <p style="font-size: 14px; color: #777; animation: fadeIn 2.5s ease-in-out;">
                Please keep this OTP confidential. It's valid for a limited time and can only be used once.
            </p>
            <p style="animation: slideIn 2s ease-in-out;">If you didn't request this OTP, please ignore this email.</p>
            <p style="text-align: center; color: #888; font-size: 12px; animation: fadeIn 3s ease-in-out;">
                &copy; 2024 Your Company Name. All rights reserved.
            </p>
        </div>
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        </style>
    `;

    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "virendryadav453@gmail.com",
            pass: "faigsfdehmpyfgyp" 
        }
    });

    const mailOptions = {
        from: "virendryadav453@gmail.com",
        to: email,
        subject: "Password Reset OTP",
        html: htmlBody,
    };

    await transport.sendMail(mailOptions, (err, info) => {
        if (err) {
            return res.status(200).json("Email not sent");
        } else {
            return res.status(200).json("OTP Sent");
        }
    });
});

router.post("/confirmOtp", async (req, res) => {
    console.log(req.body);
    const email = req.body.email;
    const otp = req.body.otp;
    try {
        const otpIndex = OTP.findIndex(record => record.email === email && record.otp === otp);
        if (otpIndex !== -1) {
            OTP.splice(otpIndex, 1);
            res.status(200).json("Otp Verified");
        } else {
            res.status(200).json("Wrong Otp");
        }
    } catch (error) {
        res.status(500).json({ error: "An error occurred while verifying OTP" });
    }
});

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
