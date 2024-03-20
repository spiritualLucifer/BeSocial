import "./sidebar.css";
import {
  RssFeed,
  Chat,
} from "@mui/icons-material";
import {Link} from "react-router-dom";
import AllUsers from "../allusers/AllUsers";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

export default function Sidebar({ isOpen }) {
  const  [alluser,setAlluser] = useState(null);
  const  {user} = useContext(AuthContext);
  useEffect(()=>{
       const getAllUser = async() =>{
        try {
          const res = await axios.get('/users/AllUsers');
          setAlluser(res.data);
          
        } catch (error) {
            console.log(error);
        }
       }
       getAllUser();
  },[isOpen])
  
  return (
    <div className="sidebar">
      <div className="sidebarWrapper">
        <ul className="sidebarList">
                <Link to='/' style={{ textDecoration: 'none' }}>
          <li className="sidebarListItem">
            <RssFeed className="sidebarIcon" />
            <span className="sidebarListItemText">Feed</span>
          </li>
        </Link>
        <Link to="/messenger" style={{ textDecoration: 'none' }}>
          <li className="sidebarListItem">
            <Chat className="sidebarIcon" />
            <span className="sidebarListItemText">Chats</span>
          </li>
        </Link>
        </ul>
        <hr className="sidebarHr" />
        <div className="sideBarAlluser">
          All Users
        </div>
        <ul className="sidebarFriendList">
          {alluser?.map((u) => (
            u._id !== user._id && <AllUsers key={u.id} user={u} />
          ))}
        </ul>
      </div>
    </div>
  );
}
