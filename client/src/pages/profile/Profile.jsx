import "./profile.css";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import Feed from "../../components/feed/Feed";
import Rightbar from "../../components/rightbar/Rightbar";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router";
import { AuthContext } from "../../context/AuthContext";

export default function Profile() {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [user, setUser] = useState({});
  const { user: currUser } = useContext(AuthContext);
  const username = useParams().username;
  const [verify, setVerify] = useState(false);
  const [falsePassword, setFalsePassword] = useState(false);
  const Password = useRef();
  const [name, setName] = useState(null);
  const [newPassword, setnewPassword] = useState(null);
  const [city, setCity] = useState(null);
  const [from, setFrom] = useState(null);
  const [relationship, setRelationship] = useState(null);
  const [desc, setDesc] = useState(null);

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [coverPictureFile, setCoverPictureFile] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/users?username=${username}`);
        setUser(res.data);        
      } catch (error) {
         console.log(error)
      }
    };
    fetchUser();
  }, [username]);


  const verifyPassword = async () => {
    const password = Password.current.value.trim();
    if (password) {
      try {
        const res = await axios.post(`/auth/verify/${currUser._id}`, { password: password });
        if (res.data === "Right Password") {
          setVerify(true)
        } else if (res.data === "Wrong Password") {
          setFalsePassword(true)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  const handleUpdate = async () => {
    const updateData = {
      name: name?.trim(),
      profilePicture: null,
      coverPicture:null,
      desc: desc?.trim(),
      password: newPassword?.trim(),
      city: city?.trim(),
      from: from?.trim(),
      relationship: relationship?.trim(),
    }
    try {
      if (profilePictureFile) {
        const Data = new FormData();
        const fileName = Date.now() + profilePictureFile.name;
        updateData.profilePicture = fileName;
        Data.append('name', fileName);
        Data.append("file", profilePictureFile);
        try {
          await axios.post("/upload", Data);
        } catch (error) {
          console.log(error)
        }
      }
      if (coverPictureFile) {
        const Data = new FormData();
        const fileName = Date.now() + coverPictureFile.name;
        updateData.coverPicture = fileName;
        Data.append('name', fileName);
        Data.append("file", coverPictureFile)
        try {
          await axios.post("/upload", Data);
        } catch (error) {
          console.log(error)
        }
      }
      try {
        const res = await axios.put(`/users/${currUser._id}`, { updateData });
        window.location.reload();
      } catch (error) {
        console.log(error)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Topbar />
      <div className="profile">
        <Sidebar />

        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
              <img
                className="profileCoverImg"
                src={
                  user.coverPicture
                    ? PF + user.coverPicture
                    : PF + "person/noCover.png"
                }
                alt=""
              />
              <img
                className="profileUserImg"
                src={
                  user.profilePicture
                    ? PF + user.profilePicture
                    : PF + "person/noAvatar.png"
                }
                alt=""
              />
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">{user.username}</h4>
              <span className="profileInfoDesc">{user.desc ? user.desc : "kya bolti public"}</span>
              {username === currUser.username ? (<button className="editButton" data-bs-toggle="modal" data-bs-target="#staticBackdrop">Edit</button>) : null}
              <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h1 className="modal-title fs-5" id="staticBackdropLabel">{verify ? "Edit Info" : "Verify Passwords"}</h1>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      {falsePassword ? (
                        <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
                          <span>Incorrect password! Please try again.</span>
                          <button type="button" className="btn-close" aria-label="Close" onClick={() => setFalsePassword(false)}></button>
                        </div>
                      ) : null}
                      {!verify ? (<div className="input-group mb-3">
                        <input type="password" className="form-control" placeholder="Enter Passwords" aria-label="Recipient's username" aria-describedby="button-addon2" ref={Password} />
                        <button className="btn btn-secondary" type="button" id="button-addon2" onClick={verifyPassword}>Verify</button>
                      </div>) : (
                        <>
                          <div className="mb-3">
                            <label htmlFor="name" className="form-label" >Name: </label>
                            <input type="text" className="form-control" id="name" name="name" placeholder="Enter Name" onChange={(e) => setName(e.target.value)} />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="password" className="form-label" >New Password:</label>
                            <input type="password" className="form-control" id="password" placeholder="Enter Password" onChange={(e) => setnewPassword(e.target.value)} />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="city" className="form-label">City:</label>
                            <input type="text" className="form-control" id="city" placeholder="Enter City" onChange={(e) => setCity(e.target.value)} />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="profilePicture" className="form-label">Profile Picture: </label>
                            <input
                              type="file"
                              className="form-control"
                              id="profilePicture"
                              onChange={(e) => setProfilePictureFile(e.target.files[0])}
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="coverPicture" className="form-label">Cover Picture:</label>
                            <input
                              type="file"
                              className="form-control"
                              id="coverPicture"
                              onChange={(e) => setCoverPictureFile(e.target.files[0])}
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="desc" className="form-label">Description:</label>
                            <input type="text" className="form-control" id="desc" placeholder="Enter Description" onChange={(e) => setDesc(e.target.value)} />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="from" className="form-label">From: </label>
                            <input type="text" className="form-control" id="from" placeholder="Enter From" onChange={(e) => setFrom(e.target.value)} />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="relationship" className="form-label">Relationship: </label>
                            <input type="text" className="form-control" id="relationship" placeholder="Married, Unmaried or Other" onChange={(e) => setRelationship(e.target.value)} />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="modal-footer">
                      {verify ? <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={handleUpdate}>update</button> : null}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div className="profileRightBottom">
            <Feed username={username} />
            <Rightbar user={user} />
          </div>
        </div>
      </div>
    </>
  );
}
