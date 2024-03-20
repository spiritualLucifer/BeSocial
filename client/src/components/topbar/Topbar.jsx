import React, { useContext, useState,useRef } from "react";
import "./topbar.css";
import { Search, Person, Chat, Notifications } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import AllUsers from "../allusers/AllUsers";
import axios from "axios";

export default function Topbar() {
  const { user } = useContext(AuthContext);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const  [searchResult, setSearchResult] = useState([]);
  const  searchItem = useRef();

  const handleLogOut = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  const searchUser = async()=>{
       const userName = searchItem.current?.value.trim();
       try {
        if(userName){
          const res = await axios.post("/searchUser",{userName});
          if(res.status==200){
              setSearchResult(res.data);
          }
        }
       } catch (error) {
          console.log(error);
       }
       if(!userName){
        setSearchResult([]);
       }
  }
 
  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">BeSocial</span>
        </Link>
      </div>
      <div className="topbarCenter">
        <div className="mainSuggestion">
        <div className="searchbar">
          <Search className="searchIcon" />
          <input
            placeholder="Search for friend here"
            className="searchInput"
            ref={searchItem}
            onChange={searchUser}
          />
          {searchResult.length>0?(<div className="suggestion">
               {searchResult.map((u)=>
                  <AllUsers user={u}/>
               )}
          </div>):null}
        </div>
        </div>
      </div>
      <div className="topbarRight">
        <div className="topbarLinks">
          <Link to="/" style={{textDecoration:"none",color:"white"}}>
            <span className="topbarLink">Timeline</span>
          </Link>
        </div>
        <div className="topBarProfile">
          <Link to={`/profile/${user.username}`}>
            <img
              src={
                user.profilePicture
                  ? PF + user.profilePicture
                  : PF + "person/noAvatar.png"
              }
              alt=""
              className="topbarImg"
            />
          </Link>
          <div className="LogOut" onClick={handleLogOut}>
            LogOut
          </div>
        </div>
      </div>
    </div>
  );
}
