const router = require("express").Router();
const User = require("../models/User");

//seacrh for the user
router.post("/",async(req,res)=>{
    try {
        const searchItem = req.body.userName;
        const users = await User.aggregate([
            {$match : {username:{$regex: searchItem, $options: 'i' }}},//find put the main matches
            {$addFields:{matchPositions:{$indexOfCP: ["$username", searchItem]}}},//putting the matches in the main different valriable on the basis of the indexOfCP
            {$sort: { matchPosition: 1 }}// Sort by matchPosition in ascending order
        ])
        if(users){
            return res.status(200).json(users);
        }else{
            return res.status(200).json("No User Found");
        }
    } catch (error) {
        return res.status(500).json(error);
    }
})

module.exports = router;