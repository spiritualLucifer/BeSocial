import axios from "axios";
import { useState } from "react";
import "./register.css";
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { CircularProgress } from '@mui/material';

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const navigate = useNavigate();
  const [emailVerify, setEmailVerify] = useState(false);
  const [usernameVerify, setUsernameVerify] = useState(false);
  const [sentOtp, setSentOtp] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [loader,setLoader] = useState(false);

  const EmailVerify = async (e) => {
    setEmail(e.target.value);
    try {
      const res = await axios.post("/auth/emailVerify", { email:email.trim() });
      setEmailVerify(res.status === 201);
    } catch (error) {
      console.log(error);
      setEmailVerify(false);
    }
  };

  const UsernameVerify = async (e) => {
    setUsername(e.target.value);
    try {
      const res = await axios.post("/auth/usernameVerify", { username:username.trim() });
      setUsernameVerify(res.status === 201);
    } catch (error) {
      console.log(error);
      setUsernameVerify(false);
    }
  };

  const verifyAndCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/registerOtp/confirmOtp', { email:email.trim(), otp: otpInput.trim() });
      if (res.data === "Otp Verified") {
        const user = {
          username:username.trim(),
          email:email.trim(),
          password:password.trim(),
        };
        try {
          await axios.post("/auth/register", user);
          navigate('/login');
        } catch (err) {
          console.log(err);
        }
        setOtpError(false);
        setOtpInput("");
      } else {
        setOtpError(true);
        setOtpInput("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleOtp = async (e) => {
    e.preventDefault();
    setLoader(true);
    if (password.trim() !== passwordAgain.trim()) {
      alert("Passwords don't match!");
    } else if (emailVerify && usernameVerify) {
      try {
        const res = await axios.post('/registerOtp/OptGenerate', { email : email.trim()});
        if(res.data !== "No User exist"){
          setSentOtp(true);
          setLoader(false)
        }
      } catch (error) {
        console.log(error);
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
          <form className="loginBox" onSubmit={handleOtp}>
            {!sentOtp ? (
              <>
                {username.length > 0 && (
                  <div className="usernameVerify" style={{ fontSize: "13px", color: usernameVerify ? "green" : "red", marginLeft: "9px" }}>
                    {usernameVerify ? "*seems good" : "This username is already taken! Try another one."}
                  </div>
                )}
                <input
                  placeholder="Username"
                  required
                  value={username}
                  minLength={4}
                  maxLength={20}
                  className="loginInput"
                  onChange={UsernameVerify}
                />
                {email.length > 0 && (
                  <div className="emailVerify" style={{ fontSize: "13px", color: emailVerify ? "green" : "red", marginLeft: "9px" }}>
                    {emailVerify ? "*seems good" : "This email already exists!"}
                  </div>
                )}
                <input
                  placeholder="Email"
                  required
                  value={email}
                  className="loginInput"
                  type="email"
                  onChange={EmailVerify}
                />
                <input
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="loginInput"
                  type="password"
                  minLength="6"
                />
                <input
                  placeholder="Password Again"
                  required
                  value={passwordAgain}
                  onChange={(e) => setPasswordAgain(e.target.value)}
                  className="loginInput"
                  type="password"
                />
                <button className="loginButton" type="submit">
                  {loader?<CircularProgress color="secondary" size="30px" />:("Sign Up")}
                </button>
              </>
            ) : (
              <div className="loginRight" style={{ padding: "20%" }}>
                {!otpError ? (
                  <div style={{ textAlign: "center", fontSize: "large" }}>Email Sent!</div>
                ) : (
                  <div style={{ textAlign: "center", fontSize: "large", color: "red" }}>Wrong OTP!</div>
                )}
                <input
                  type="text"
                  placeholder="ENTER OTP"
                  className="loginInput"
                  onChange={(e) => setOtpInput(e.target.value)}
                  style={{ marginBottom: "20px", textAlign: "center" }}
                  value={otpInput}
                />
                <button className="loginButton" onClick={verifyAndCreate}>Verify</button>
              </div>
            )}
            <div className="LoginToAccount">
              Already have an account?
              <Link to="/login" className="alreadyHaveAccount" style={{ textAlign: "center", marginLeft: "2px", width: "auto" }}>
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
