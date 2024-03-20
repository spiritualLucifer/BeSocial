const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    //create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    //save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err)
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    console.log(user,req.body)
    if(!user){
      console.log("user not exist")
      return res.status(200).json("User Does not Exist");
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    console.log(validPassword)
    if(validPassword){
      return res.status(200).json(user);
    }else{
      return res.status(200).json("wrong password")
    } 
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
});

// verifie the passwords
router.post("/verify/:id",async(req,res)=>{
     try {
        const userId = req.params.id; 
        const password = req.body.password;
        const user = await User.findById(userId);
        if(user){
           const mainPassword = user.password;
           const validPassword = await bcrypt.compare(password, mainPassword);
          if(validPassword){
             res.status(200).json("Right Password");
          }else{
             res.status(200).json('Wrong Password');
          }
        }else{
           res.status(400).json( "No such user exists!");  
        }  
     } catch (error) {
         res.status(500).json(error);
     }
})

//username verify 
router.post("/usernameVerify", async (req,res)=>{
    const username = req.body.username;
    console.log(username)
    try {
       const user = await User.findOne({username : username });
       if(user){
        res.status(200).json("Username already in use! Please choose another one.");
       }else{
        res.status(201).json("This username is available");
       }
    } catch (error) {
       res.status(500).json(error);
    }
})

//email verify 
router.post("/emailVerify", async (req,res)=>{
  const email = req.body.email;
  try {
     const user = await User.findOne({email : email });
     if(user){
      res.status(200).json("Username email in use! Please choose another one.");
     }else{
      res.status(201).json("This email is available");
     }
  } catch (error) {
     res.status(500).json(error);
  }
})

module.exports = router;
