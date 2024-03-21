import React, { useRef, useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import  "./forgotPassword.css"


function ForgotPassword() {
  const email = useRef();
  const otp = useRef();
  const [receivedOtp, setReceivedOtp] = useState(null); 
  const newPassword = useRef();
  const confirmNewPassword = useRef();
  const [otpSent, setOtpSent] = useState(false); 
  const [otpVerify, setOtpVerify] = useState(false);
  const navigate = useNavigate();

  const sendOTP = async () => {
    try {
      localStorage.setItem("email",email.current?.value);
      console.log(email.current?.value);
      const res = await axios.post('/forgetPassword/OptGenerate', { email: email.current?.value });
      if (res.data === 'Your Email not Found') { 
        alert('Your email is not registered');
        localStorage.removeItem("email");
      } else {
        setReceivedOtp(res.data); 
        setOtpSent(true); 
      }
    } catch (error) {
      console.log(error);
    }
  };

  const verifyOtp = () => {
    console.log(email.current?.value);
    if (receivedOtp === otp.current.value) { 
      setOtpVerify(true);
    } else {
      alert('Wrong OTP');
    }
  };

  const resetPassword = async () => {
    console.log(newPassword?.current.value,confirmNewPassword.current?.value,email.current?.value);

    if (newPassword.current?.value !== '' && confirmNewPassword.current?.value !== '' && newPassword.current?.value === confirmNewPassword.current?.value) {
      try {
        const res = await axios.post(`/forgetPassword/setPassword/${localStorage.getItem("email")}`, { newpassword: newPassword.current?.value }); // Corrected interpolation and accessing value
        if (res.data === 'No User exist') { 
          alert('You Are Not Found in Our Data Base');
        } else {
          navigate('/login');
          localStorage.removeItem("email");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="MainForgotBody">
      <div className='MainForgotBodyWrapper'>
      {!otpVerify ? (!otpSent ? (
        <>
          <input className="MailInput" type="email" ref={email} placeholder="enter Mail" />
          <button onClick={sendOTP} className="otpSentButton">Send OTP</button>
        </>
      ) : (
        <div className="otpMainBody">
          <div className="emailSentText">Email sent!</div>
          <div className='otpMainBodyContent'>
          <input className="OtpInput" type="text" ref={otp} placeholder="Enter Your 4 Digit OTP" />
          <button onClick={verifyOtp} className="otpVerifyButton">Verify OTP</button>
          </div>
        </div>
      )) : (
        <div className="PasswordBody">
          <input className="newpassword" type="password" placeholder="New Password" ref={newPassword} /> 
          <input className="cnewpassword" type="password" placeholder="Confirm New Password" ref={confirmNewPassword} /> 
          <button onClick={resetPassword} className="passwordResetbutton">Reset Password</button> 
        </div>
      )}
      </div>
      
    </div>
  );
}

export default ForgotPassword;
