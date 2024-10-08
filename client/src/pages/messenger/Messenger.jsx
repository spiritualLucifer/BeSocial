import Topbar from '../../components/topbar/Topbar'
import './messenger.css'
import Conversation from '../../components/conversation/Conversation'
import Message from '../../components/message/Message'
import ChatOnline from '../../components/chatOnline/ChatOnline'
import { useContext, useState, useEffect, useRef, useCallback } from 'react'
import { AuthContext } from '../../context/AuthContext'
import axios from 'axios';
import { io } from 'socket.io-client';
import  ReactPlayer  from "react-player"
import { VideoCallRounded } from '@mui/icons-material'
import peer from "../../service/peer";
// import VideoCall from '../../components/videoCall/VideoCall'

export default function Messenger() {
    const [conversation, setConversation] = useState(null);
    const [newConversation, setNewConversation] = useState(null);
    const searchUser = useRef();
    const [messages, setMessages] = useState(null);
    const [currentChat, setCurrentChat] = useState(null);
    const [newMessage, setNewMessage] = useState(null);
    const [arivaleMessage, setArivaleMessage] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [frontPersonId, setFrontPersonId] = useState(null);
    const [frontUser, setFrontUser] = useState(null);
    const [isVideoCall, setIsVideoCall] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const { user } = useContext(AuthContext);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef();
    const socket = useRef(null);
    const PF = process.env.REACT_APP_PUBLIC_FOLDER;

    //socket io
    useEffect(() => {
        socket.current = io('ws://localhost:8900');
        return () => {
            socket.current.disconnect();
        };
    }, []);

    useEffect(() => {
        socket.current?.on("getMessage", (data) => {
            setArivaleMessage({
                senderId: data.senderId,
                text: data.text,
                createdAt: Date.now(),
            });
        });
        return ()=>{
            socket.current?.off("getMessage");
        }
    }, []);

    useEffect(() => {
        if (arivaleMessage && currentChat && currentChat.member.includes(arivaleMessage.senderId)) {
            setMessages((prevMessages) => [...prevMessages, arivaleMessage]);
        }
    }, [arivaleMessage, currentChat]);

    useEffect(() => {
        socket.current?.emit('addUser', user._id);
        socket.current?.on("getUsers", (users) => {
            const newUsersList = user.followings?.map((userId) => {
                return {
                    userId: userId,
                    online: users.some((u) => { return u.userId === userId }) ? true : false
                }
            })
            setOnlineUsers(newUsersList);
        });
        return ()=>{
            socket.current?.off("getUsers")
        }
    }, [user.followings]);

    useEffect(() => {
        const getConversations = async () => {
            try {
                const res = await axios.get("/conversations/" + user._id);
                setNewConversation(res.data);
                setConversation(res.data);
            } catch (error) {
                console.log(error);
            }
        };
        getConversations();
    }, [user._id]);

    useEffect(() => {
        const getMessages = async () => {
            if (currentChat) {
                const frontPersonId = currentChat.member.find((id) => user._id !== id);
                setFrontPersonId(frontPersonId);
                try {
                    const res = await axios.get('/messages/' + currentChat?._id);
                    setMessages(res.data);
                } catch (error) {
                    console.log(error);
                }
            }
        };
        getMessages();
    }, [currentChat, user._id]);

    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await axios.get("/users?userId=" + frontPersonId);
                setFrontUser(res.data);
            } catch (error) {
                console.log(error)
            }
        };
        if (frontPersonId) {
            getUser();
        }
    }, [frontPersonId]);

    // uploading the messages
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentChat === null) {
            try {
                const res = await axios.post("/conversations", { senderId: user._id, receiverId: frontUser._id, senderUsername: user.username, receiverUsername: frontUser.username });
                setCurrentChat(res.data);
            } catch (error) {
                console.log(error)
            }
        }
            const message = {
                conversationId: currentChat?._id,
                sender: user._id,
                text: newMessage
            };
            console.log(message);
            socket.current?.emit("sendMessage", {
                senderId: user._id,
                receiverId: frontUser._id,
                text: newMessage,
            });
            try {
                const res = await axios.post('/messages', message);
                setMessages([...messages, res.data]);
                setNewMessage("");
            } catch (error) {
                console.log(error);
            }
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    //seacrching the user in conversaion
    const SearchUser = () => {
        const item = searchUser.current?.value;
        if (item === "") {
            setNewConversation(conversation);
        } else {
            const filterUser = conversation?.filter((con) => {
                return con.userNameArray.some((username) => {
                    return username !== null && username.toLowerCase().startsWith(item.toLowerCase())
                });
            });
            setNewConversation(filterUser);
        }
    };


    //set new Conversation 
    const [newFreindConversation, setNewFriendConversation] = useState(false);
    const openChat = async (userId) => {
        setNewFriendConversation(true);
        setFrontPersonId(userId);
        const getConversation = await axios.get("/conversations/find/" + user._id + "/" + userId);
        if (getConversation.data === "No Conversation Exists") {
            setMessages("");
            setCurrentChat(null);
        }
        else {
            setCurrentChat(getConversation.data);
            const getMessages = await axios.get("/messages/" + currentChat?._id);
            setMessages(getMessages.data);
        }
    }

    // handle typing 
    const handleTypingOn = async () => {
        socket.current?.emit("typing", { senderId: user._id, receiverId: frontUser._id });
    }

    const handleTypingOff = async () => {
        socket.current?.emit("stopTyping", { senderId: user._id, receiverId: frontUser._id });
    }

    useEffect(() => {
        socket.current?.on("setTping", (data) => {
            console.log(data?.userId, user?._id);
            if (data?.receiverId === user?._id && data?.senderId === frontUser?._id) {
                setIsTyping(data.isTyping);
            }
        })
    },[user,frontUser])

    //start video Call
    const handleVideoCall = useCallback(() => {
        setIsVideoCall(true);
        if (frontPersonId && frontUser) {
            OfferCreate();
        }
    }, [isVideoCall, frontPersonId, frontUser]);

    // offer send
    const OfferCreate = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.current?.emit("offer:send", { offer, to: frontUser?._id, from: user?._id });
        const streams = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        setLocalStream(streams);
    }, [frontUser, user]);

    //handle offer recieved 
    const handleRecieveOffer = useCallback(async (data) => {
        const { offer, from } = data;
        setFrontPersonId(from)
        //set stream 
        const streams = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        setLocalStream(streams);
        setIsVideoCall(true)
        const ans = await peer.getAnswer(offer);
        socket.current?.emit("answer:send", { ans, from: user?._id, to: from })
    }, [socket, user])
 

    //sending the stream
    const sendStream = useCallback(() => {
        handleNegoOffer();
        const tracksArray = Array.from(localStream?.getTracks() || []);
        for (const track of tracksArray) {
            peer.peer.addTrack(track, localStream);
        }
    }, [localStream]);
    

    //handle recieved answer
    const handleRecievedAns = useCallback(async (data) => {
        const { ans } = data;
        await peer.setRemoteDescription(ans);
        sendStream();
    }, [sendStream])
    

    // nagosiation start send offer
    const handleNegoOffer = useCallback(async() => {
        const offer = await peer.getOffer();
        // console.log(offer + "nego", frontUser);
          setTimeout(() => {
            socket.current?.emit("nego:offer:send", { from: user?._id, to: frontUser?._id, offer });
          }, 1000);
      }, [frontUser, socket, user]);
      


    useEffect(() => {
       peer.peer.addEventListener("nego:offer:send",handleNegoOffer);
      return () => {
       peer.peer.removeEventListener("nego:offer:send",handleNegoOffer);        
      }
    }, [handleNegoOffer])
    

    //recieved nego offer 
    const handleNagoOfferRecieved = useCallback(async (data) => {
        const { offer, from } = data;
        // console.log(data+"recieved nago offer")
        const ans = await peer.getAnswer(offer);
        socket.current?.emit("nego:ans:send", { ans, from: user?._id, to: from })
    }, [socket, user, frontUser])
   
    // set ans recieved
    const handleNegoAnsRecieved = useCallback(async(data)=>{
        const { ans } = data;
        // console.log(data+"receved ans");
        await peer.setRemoteDescription(ans);
        console.log(remoteStream);
    },[])
    
    //set remote stream;
    useEffect(()=>{
        peer.peer.addEventListener("track",async(ev)=>{
            const remoteStream = ev.streams;
            // console.log(remoteStream+"remote stream")
            setRemoteStream(remoteStream[0]);
        }) 
    },[])

    useEffect(() => {
        socket.current?.on("offer:recieved", handleRecieveOffer);
        socket.current?.on("answer:recieved", handleRecievedAns);
        socket.current?.on("nego:Offer:recieved",handleNagoOfferRecieved)
        socket.current?.on("nego:ans:recieved",handleNegoAnsRecieved)
        return () => {
            socket.current?.off("offer:recieved", handleRecieveOffer);
            socket.current?.off("answer:recieved", handleRecievedAns);
            socket.current?.off("nego:Offer:recieved",handleNagoOfferRecieved)
            socket.current?.off("nego:ans:recieved",handleNegoAnsRecieved)
        }
    }, [socket,handleRecieveOffer,handleRecievedAns,handleNagoOfferRecieved,handleNegoAnsRecieved])
   
    const VideoCall = () => {
        return (<>
            <div>Your Stream</div>
            <ReactPlayer playing muted url={localStream} height="200px" width="350px" />
            <div>remote Stream</div>
            {<button onClick={sendStream}> send starem</button>}
            {remoteStream &&<ReactPlayer playing muted url={remoteStream} height="200px" width="350px" />}
            
        </>)
    }

    return (
        <>
            <Topbar />
            <div className="messenger">
                <div className="chatMenu">
                    <input type="text" placeholder='Search For friends' className="chatMenuInput" onChange={SearchUser} ref={searchUser} />
                    <div className="chatMenuWrapper">
                        {newConversation?.length ? (newConversation?.map((c) =>
                            <div key={c._id} onClick={() => setCurrentChat(c)}>
                                <Conversation conversation={c} key={c._id} curUserId={user._id} />
                            </div>
                        )) : <div className='noOnlineUser' style={{ paddingLeft: "20%", paddingRight: "20%", fontSize: "30px", textAlign: "center", color: "rgb(208, 204, 204)" }}>No Conversation Found</div>}
                    </div>
                </div>
                <div className="chatBox">
                    <div className="chatBoxWrapper">
                        {isVideoCall ? <VideoCall/>:((currentChat || newFreindConversation) ? (
                            <>
                                <div className="topProfile">
                                    <div className="topProfileLeft"><img src={frontUser?.profilePicture ? PF + frontUser?.profilePicture : PF + "person/noAvatar.png"} alt="" className="topProfileImg" />
                                        <div className="maiUserOnline">
                                            <span className="topUserName">{frontUser?.username}</span>
                                            {isTyping ? <div style={{ marginLeft: "10px", fontSize: "11px", fontWeight: "500" }}>Typing...</div> : null}
                                        </div>
                                    </div>
                                    <VideoCallRounded style={{ height: "40px", width: "40px", cursor: "pointer" }} onClick={handleVideoCall} />
                                </div>
                                <div className="chatBoxTop">
                                    {messages && messages.map((m) =>
                                        <div key={m._id} ref={scrollRef}>
                                            <Message message={m} key={m._id} own={m.sender === user._id} profile={m.sender === user._id ? user?.profilePicture : frontUser?.profilePicture} />
                                        </div>
                                    )}
                                </div>
                                <div className="chatBoxBottom">
                                    <textarea className="chatMessageInput" onChange={(e) => setNewMessage(e.target.value)} value={newMessage} placeholder='Write Somthings.....' onFocus={handleTypingOn} onBlur={handleTypingOff}></textarea>
                                    <button className="chatSubmitButton" onClick={handleSubmit}>Send</button>
                                </div>
                            </>
                        ) : (
                            <span className="noConversationText">Open a conversation to start a chat.</span>
                        ))}
                    </div>
                </div>
                <div className="chatOnline">
                    <div className="topHeadingFreinds" style={{ fontSize: "25px", fontWeight: "300", padding: "10px", borderBottom: "1px solid black" }}>
                        Chat With Your Freinds
                    </div>
                    <div className="chatOnlineWrapper">
                        <div className="mainWrapper">
                            {onlineUsers.length > 0 ? onlineUsers.map((onlineUser) =>
                                <div className="onlineChatPrrfile" onClick={() => openChat(onlineUser.userId)}>
                                    <ChatOnline key={onlineUser.userId} user={onlineUser} />
                                </div>
                            ) : <div className='noOnlineUser' style={{ paddingLeft: "20%", paddingRight: "20%", fontSize: "30px", textAlign: "center", color: "rgb(208, 204, 204)" }}>Make Some Freinds &#x1F60D;</div>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
