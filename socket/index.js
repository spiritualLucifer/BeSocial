const io = require("socket.io")(8900, {
    cors: {
      origin: "http://localhost:3000",
    },
  });
  
  let users = [];
  
  const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
      users.push({ userId, socketId });
  };
  
  const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
  };
  
  const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
  };
  
  io.on("connection", (socket) => {
    //when ceonnect
    console.log("a user connected.");
  
    //take userId and socketId from user
    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      io.emit("getUsers", users);
    });


     // typing
     socket.on("typing",(conversation)=>{
        const  user=getUser(conversation.receiverId);
        io.to(user?.socketId).emit("setTping",{isTyping:true,receiverId:conversation.receiverId,senderId:conversation.senderId});
     })
     
     socket.on("stopTyping",(conversation)=>{
      const  user=getUser(conversation.receiverId);
      io.to(user?.socketId).emit("setTping",{isTyping:false,receiverId :conversation.receiverId,senderId:conversation.senderId});
   })


    //send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
      console.log(receiverId,senderId,text);
      const user = getUser(receiverId);
      console.log(user)
      io.to(user?.socketId).emit("getMessage", {
        senderId,
        text,
      });
    });


    //send Offer 
    socket.on("offer:send",({offer,to,from})=>{
      const To = getUser(to);
      io.to(To?.socketId).emit("offer:recieved",{offer,from});
    })

    //send Asnwer
    socket.on("answer:send",({ans,to,from})=>{
      const To = getUser(to);
      io.to(To?.socketId).emit("answer:recieved",{ans,from});
    })

     // negotiation offer
     socket.on("nego:offer:send",({from,to,offer})=>{
          const To = getUser(to);
          // console.log(offer,from,to)
          // console.log(To)
          io.to(To?.socketId).emit("nego:Offer:recieved",{from,offer});
     })

     //send nego answer
     socket.on("nego:ans:send",({ans,to,from})=>{
      console.log(to);
      const To = getUser(to);
      console.log(To+"Ans");
      io.to(To?.socketId).emit("nego:ans:recieved",{ans,from});
    })
    
    // when disconnect
    socket.on("disconnect", () => {
      console.log("a user disconnected!");
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });