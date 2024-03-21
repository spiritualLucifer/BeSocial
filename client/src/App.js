import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Profile from "./pages/profile/Profile";
import Register from "./pages/register/Register";
import Messenger from "./pages/messenger/Messenger";
import ForgotPassword from "./pages/forgotPassword/ForgotPassword";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";


function App() {
  const { user } = useContext(AuthContext);
  return (
    <Router>
    <Routes>
      <Route path="/" element={user ? <Home /> : <Navigate to="/register" />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/messenger" element={!user ? <Navigate to="/" /> : <Messenger/>} />
      <Route path="/profile/:username" element={user?<Profile />:<Navigate to="/login"/>} />
      <Route path="/forgotPassword" element={user?<Navigate to="/" />:<ForgotPassword/>} />
    </Routes>
  </Router>
  );
}

export default App;
