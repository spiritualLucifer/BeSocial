import "./message.css"
import {format} from "timeago.js"

export default function Message({message,own,profile}) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  return (
    <div className={own? 'message own' : 'message'}>
        <div className="messageTop">
           <img src={profile?PF+profile:PF+"person/noAvatar.png"} alt="" className="messageImg" />
           <p className="messageText" style={{marginBottom:"3px"}}>{message.text}</p>
        </div>
        <div className="messageBottom" style={{marginTop:"0px"}}>
            {format(message.createdAt)}
        </div>
    </div>
  )
}
