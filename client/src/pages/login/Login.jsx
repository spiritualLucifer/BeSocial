import "./login.css";
import { useRef, useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom'
import axios from "axios";

export default function Login() {
  const email = useRef();
  const password = useRef();
  const { isFetching, dispatch } = useContext(AuthContext);
  const [userExist,setUserExist] = useState(true);
  const [passwordVerify,setPasswordVerify] = useState(true);

  const isEmailValid = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };
  const isPasswordValid = (value) => {
    return value.length >= 6;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!isEmailValid(email.current.value)) {
      alert("Please enter a valid email address");
      return;
    }
    if (!isPasswordValid(password.current.value)) {
      alert("Password should have at least 6 characters");
      return;
    }
    const userCredential={
    email: email.current.value.trim(),
    password: password.current.value.trim()
    };
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await axios.post("/auth/login",userCredential);
      console.log(res)
      if(res.data ==="User Does not Exist"){
           setUserExist(false);
           dispatch({ type: "LOGIN_FAILURE", payload: "User Does not Exist" });
      }else if(res.data ==="wrong password"){
        setPasswordVerify(false)
        dispatch({ type: "LOGIN_FAILURE", payload: "wrong password" });
      }else if(res.status == 200){
        dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
      }
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE", payload: err });
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
          <form className="loginBox" style={{height:"250px"}} onSubmit={handleSubmit}>
            {!userExist?<div className="userExist" style={{fontSize:"13px",color:"red",marginLeft:"9px"}}>*Email Does Not exist!</div>:null}
            <input placeholder="Email" type="email" required className="loginInput" ref={email} />
            {!passwordVerify?<div className="userExist" style={{fontSize:"13px",color:"red",marginLeft:"9px"}}>*Email Or Password is Wrong!</div>:null}
            <input placeholder="Password" type="password" required minLength="6" ref={password} className="loginInput" />
            <button className="loginButton" type="submit" disabled={isFetching}>
              {isFetching ? <CircularProgress color="secondary" size="30px" /> : "Log In"}
            </button>
            
            {/* <span className="loginForgot">Forgot Password?</span> */}
            <div className="LoginToAcount" style={{}}>
              Don't have acount?
              <Link to="/register" className="alreadyHaveAccount" style={{textAlign:"center",marginLeft:"2px",width:"auto"}}>
                sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
