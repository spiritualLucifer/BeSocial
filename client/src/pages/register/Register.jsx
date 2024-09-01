import axios from "axios";
import { useRef, useState } from "react";
import "./register.css";
import { useNavigate } from 'react-router-dom';
import {Link} from "react-router-dom"

export default function Register() {
  const username = useRef();
  const email = useRef();
  const password = useRef();
  const passwordAgain = useRef();
  const navigate = useNavigate();
  const [emailVerify,setEmailVerify] = useState(false);
  const [usernamVerify,setUsernameVerify] = useState(false);

  const EmailVerify = async(e) =>{
      const newEmail = email.current?.value;
      try {
         const res = await axios.post("/auth/emailVerify",{email:newEmail});
         if(res.status==201){
          setEmailVerify(true);
         }else{
          setEmailVerify(false);
         }
      } catch (error) {
        console.log(error)
      }
  }

  const UsernameVerify = async(e) =>{
    const newUsername = username.current?.value.trim();
    try {
       const res = await axios.post("/auth/usernameVerify",{username:newUsername});
       if(res.status==201){
        setUsernameVerify(true);
       }else{
        setUsernameVerify(false);
       }
    } catch (error) {
      console.log(error)
    }
}
  const handleClick = async (e) => {
    e.preventDefault();
    if (passwordAgain.current.value !== password.current.value) {
      passwordAgain.current.setCustomValidity("Passwords don't match!");
      e.target.reportValidity();
    } else if(emailVerify && usernamVerify) {
      const user = {
        username: username.current.value.trim(),
        email: email.current.value.trim(),
        password: password.current.value.trim(),
      };
      try {
        await axios.post("/auth/register", user);
        navigate('/login');
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div className="login">
      <div className="loginWrapper">
        <div className="loginLeft">
          <h3 className="loginLogo">BeSocial</h3>
          <span className="loginDesc">
          Social media is about sociology and psychology more than technology.
          </span>
        </div>
        <div className="loginRight">
          <form className="loginBox" onSubmit={handleClick}>
              {username.current?.value?(usernamVerify?<div className="usernameVerify" style={{fontSize:"13px",color:"green",marginLeft:"9px"}}>*seems good</div>:<div className="usernameVerify" style={{fontSize:"13px",color:"red",marginLeft:"9px"}}>this username is already taken!! try another one</div>):null}
              <input
                placeholder="Username"
                required
                ref={username}
                min={4}
                max={20}
                className="loginInput"
                onChange={UsernameVerify}
              />
            {email.current?.value?(emailVerify?<div className="emailVerify" style={{fontSize:"13px",color:"green",marginLeft:"9px"}}>*seems good</div>:<div className="emailVerify" style={{fontSize:"13px",color:"red",marginLeft:"9px"}}>this email is already exist!</div>):null}
            <input
              placeholder="Email"
              required
              ref={email}
              className="loginInput"
              type="email"
              onChange={EmailVerify}
            />

            <input
              placeholder="Password"
              required
              ref={password}
              className="loginInput"
              type="password"
              minLength="6"
            />
            <input
              placeholder="Password Again"
              required
              ref={passwordAgain}
              className="loginInput"
              type="password"
            />
            <button className="loginButton" type="submit">
              Sign Up
            </button>
            <div className="LoginToAcount" style={{}}>
              already have acount?
              <Link to="/login" className="alreadyHaveAccount" style={{textAlign:"center",marginLeft:"2px",width:"auto"}}>
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
