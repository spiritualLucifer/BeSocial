const router = require("express").Router();
const Conversation = require("../models/Conversation");

//create conversation
router.post('/',async(req,res)=>{
    const conversation = new Conversation({
        member : [req.body.senderId,req.body.receiverId],
        userNameArray:[req.body.senderUsername,req.body.receiverUsername]
    });
    try {
        const createdConversation = await conversation.save();
        res.status(200).json(createdConversation);
    } catch (error) {
        res.status(500).json(error);
    }
})

//get conversation 
router.get('/:userId',async(req,res)=>{
    const  userId= req.params.userId;
    try {
        const AllConversation = await Conversation.find({
            member:{$in:[userId]}
        })
        if(AllConversation){
            return res.status(200).json(AllConversation);
        }
        else return res.status(200).json("No Conversation Exists");
    } catch (error) {
         res.status(200).json(error);
    }
})

//get conversation with the two id 
router.get("/find/:userId/:receiverId",async(req,res)=>{
    console.log(req.params.userId,req.params.receiverId);
     try {
        const singleConversation = await Conversation.findOne({
            member:{$all:[req.params.userId,req.params.receiverId]}
        })
        if(singleConversation){
            return res.status(200).json(singleConversation);
        }else return res.status(200).json("No Conversation Exists"); 
     } catch (error) {
        return res.status(500).json(error)
     }
})
module.exports = router;
