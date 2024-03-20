const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const fs = require('fs');
const path = require('path');


//update user
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const newData = req.body.updateData;
    if (req.params.id === user._id.toString()) {
      if (newData.password) {
        const salt = await bcrypt.genSalt(10);
        newData.password = await bcrypt.hash(newData.password, salt);
      }
      if (newData.profilePicture && user.profilePicture) {
        const fileName = user.profilePicture;
        const filePath = path.join(__dirname, "../public/images/", fileName);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("file removed");
          }
        });
      }

      if (newData.coverPicture && user.coverPicture) {
        const fileName = user.coverPicture;
        const filePath = path.join(__dirname, "../public/images/", fileName);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("file removed");
          }
        });
      }

      const updatedData = {};
      for (const key in newData) {
        if (newData[key] !== null && newData[key] !== undefined) {
          updatedData[key] = newData[key];
        }
      }
      console.log(updatedData);
      const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        $set: updatedData,
      });

      // console.log(updatedUser);
      res.status(200).json("Account has been updated");
    } else {
      return res.status(403).json("You can update only your account!");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});





//get all user 
router.get('/Allusers',async(req,res)=>{
    try {
      const allUsers = await User.find();
      if(allUsers){
        res.status(200).send(allUsers);
      }else {
        res.status(404).json("no user Found");
      }
    } catch (error) {
       res.status(500).json(error);
    }
})

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});


//get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList)
  } catch (err) {
    res.status(500).json(err);
  }
});


//follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});


//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

module.exports = router;
