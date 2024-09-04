import React, { useState } from 'react';
import {useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import "./forgotPassword.css"

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  // const [receivedOtp, setReceivedOtp] = useState(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [confirmNewPasswordValue, setConfirmNewPasswordValue] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [mailSent, setMailSent] = useState(false);
  const [mailSentError,setMailSentError] = useState(false);
  const [otpMatch,setOtpMatch] = useState(true);
  const [otpVerify, setOtpVerify] = useState(false);
  const [passwordMatch,setPasswordMatch] = useState(true);
  const navigate = useNavigate();

  const sendOTP = async () => {
    try {
      localStorage.setItem("email", email);
      console.log(email);
      setMailSent(true);
      const res = await axios.post('/forgetPassword/OptGenerate', { email });
      if (res.data === 'No User exist') {
        setMailSentError(true);
        setMailSent(false);
        localStorage.removeItem("email");
      } else {
        setMailSent(false);
        // setReceivedOtp(res.data);
        setOtpSent(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const verifyOtp = async() => {
     try {
      const res = await axios.post('/forgetPassword/confirmOtp', { email,otp });
       if(res.data === "Otp Verified"){
          setOtpVerify(true);
        }else{
          setOtpMatch(false);
          setOtpVerify(false);
        }
     } catch (error) {
      console.log(error)
     }
  };

  const resetPassword = async () => {
    // console.log(newPasswordValue, confirmNewPasswordValue, email);

    if (newPasswordValue !== '' && confirmNewPasswordValue !== '' && newPasswordValue === confirmNewPasswordValue) {
      try {
        const res = await axios.post(`/forgetPassword/setPassword/${localStorage.getItem("email")}`, { newpassword: newPasswordValue });
        if (res.data === 'No User exist') {
          alert('You Are Not Found in Our Data Base');
        } else {
          navigate('/login');
          localStorage.removeItem("email");
        }
      } catch (error) {
        console.log(error);
      }
    }else{
      setPasswordMatch(false);
    }
  };
  
  return (  
    <div className="MainForgotBody">
      <div className='MainForgotBodyWrapper'>
        {!otpVerify ? (!otpSent ? (
          <>
            <div style={{ display: "flex", height: "100%", width: "100%", flexDirection: "column" ,padding:"10px"}}>
              <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>{!mailSentError?(mailSent?(<div style={{width:"30px",height:"30px"}}><CircularProgress color="secondary" size="30px" /></div>):null):<div style={{fontSize:"13px",color:"red",marginLeft:"9px"}}>Your Email Does Not Exist!</div>}</div>
              <input className="MailInput" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Your Email" />
              <button onClick={sendOTP} className="otpSentButton">Send OTP</button>
            </div>
          </>
        ) : (
          <div className="otpMainBody">
            {otpMatch?(<div className="emailSentText">Email sent!</div>):<div style={{fontSize:"13px",color:"red",marginLeft:"9px"}}>Wrong Otp!</div>}
            <div className='otpMainBodyContent'>
              <input className="OtpInput" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter Your 4 Digit OTP" />
              <button onClick={verifyOtp} className="otpVerifyButton">Verify OTP</button>
            </div>
          </div>
        )) : (
          <div className="PasswordBody">
            {!passwordMatch?(<div style={{fontSize:"13px",color:"red",marginLeft:"9px"}}>Comfirm Password Not Matched!</div>):null}
            <input className="newpassword" type="password" value={newPasswordValue} onChange={(e) => setNewPasswordValue(e.target.value)} placeholder="New Password" />
            <input className="cnewpassword" type="password" value={confirmNewPasswordValue} onChange={(e) => setConfirmNewPasswordValue(e.target.value)} placeholder="Confirm New Password" />
            <button onClick={resetPassword} className="passwordResetbutton">Reset Password</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
