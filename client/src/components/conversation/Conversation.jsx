import { useEffect, useState } from "react";
import "./conversation.css";
import axios from "axios";

export default function Conversation({conversation,curUserId}) {
  const [user,setUser] = useState(null);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  useEffect(()=>{
    const friendId = conversation.member.find((m)=>m!==curUserId);
    const getUser=async()=>{
      try {
        const res = await axios.get("/users?userId="+friendId);
        setUser(res.data);
      } catch (error) {
        console.log(error)
      }
    }
    getUser();
  },[curUserId,conversation]);

  return (
    <div className='conversation'>
        <img src={user?.profilePicture?PF+user.profilePicture:PF + "person/noAvatar.png"} alt="" className="conversationImg" />
        <span className="conversationName">{user?.username}</span>
    </div>
  )
}
