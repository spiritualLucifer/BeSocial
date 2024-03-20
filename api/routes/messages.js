const router = require("express").Router();
const Message = require("../models/Message");

//add messages

router.post('/',async(req,res)=>{
    const conversationId = req.body.conversationId;
    const sender = req.body.sender;
    const text = req.body.text;
    try {
        const message = await Message.create({
            conversationId:conversationId,
            sender:sender,
            text:text
        })
        res.status(200).json(message);
    } catch (error) {
        res.status(500).json(error);
    }
})
// get Messsages 

router.get('/:conversationId',async(req,res)=>{
     const conversationId = req.params.conversationId;
     try {
        const messages = await Message.find({
            conversationId:conversationId
        })
        res.status(200).json(messages);
     } catch (error) {
        res.status(500).json(error);
     }
})

module.exports = router;
