import "./AllUsers.css";
import {Link} from  'react-router-dom';

export default function AllUsers({user}) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  return (
    <>
    <Link to={"/profile/"+user.username} style={{textDecoration:"none"}}>
        <li className="sidebarFriend">
          <img className="sidebarFriendImg" src={user.profilePicture?PF+user.profilePicture:PF+"/person/noAvatar.png"} alt="" />
          <span className="sidebarFriendName">@{user.username}</span>
        </li>
    </Link>
    </>
  );
}
