import { useEffect, useState } from 'react';
import './chatOnline.css'
import axios from "axios";

export default function ChatOnline({user}) {
  const[profile,setProfile] = useState(null);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  
  useEffect(() => {
    const getUser = async () => {
        try {
            const res = await axios.get("/users?userId=" + user.userId);
            setProfile(res.data);
        } catch (error) {
            console.log(error)
        }
    };
    getUser();
}, [user.useId]);


  return (
    <div className='chatOnline'>
        <div className="chatOnlineFriend">
            <div className="chatOnlineImgContainer">
                <img src={profile?.profilePicture?PF+profile?.profilePicture:PF+"person/noAvatar.png"} alt="" className="chatOnlineImg" />
                <div className="chatOnlineBadge" style={{display:user.online?"block":"none"}}></div>
            </div>
            <span className="chatOnlineName">
             {profile?.username}
            </span>
        </div>
    </div>
  )
}
