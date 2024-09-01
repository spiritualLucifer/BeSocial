import "./post.css";
import { Delete } from "@mui/icons-material";
import { useContext, useEffect, useState } from "react";
import axios, { Axios } from "axios";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useRef } from "react";


export default function Post({ post, fetchPosts }) {
  const [like, setLike] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState({});
  const newComment = useRef();
  const [isCommentsOpen, setIsCommenstOpen] = useState(false);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const { user: currentUser } = useContext(AuthContext);
  const [confirmation, setConfirmation] = useState(false);
  const [verify, setVerify] = useState(false);
  const [falsePassword, setFalsePassword] = useState(false);
  const Password = useRef();


  //verify the password 
  const verifyPassword = async () => {
    const password = Password.current.value.trim();
    if (password) {
      try {
        const res = await axios.post(`/auth/verify/${currentUser._id}`, { password: password });
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

  //handle  like and unlike functionality
  useEffect(() => {
    setIsLiked(post.likes.includes(currentUser._id));
  }, [currentUser._id, post.likes]);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get(`/users?userId=${post.userId}`);
      setUser(res.data);
    };
    fetchUser();
  }, [post.userId]);

  const likeHandler = () => {
    try {
      axios.put("/posts/" + post._id + "/like", { userId: currentUser._id });
    } catch (err) { }
    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);
  };



  //handle post delete 
  const confrimationHandler = () => {
    setConfirmation(!confirmation);
  }
  
  const handleDelete = async () => {
    try {
      const res = await axios.delete(`/posts/${post._id}`, { data: { userId: currentUser._id } });
      console.log(res);
    } catch (error) {
      console.log(error);
    }
    fetchPosts();
    setConfirmation(!confirmation);
  };


  //handle  comment section open and close
  const openCommenst = async () => {
    setIsCommenstOpen(!isCommentsOpen);
  }

  const sendComment = async () => {
    const text = newComment.current.value;
    if (text) {
      const senderId = currentUser._id;
      try {
        const res = await axios.post(`/posts/comments/${post._id}`, {
          senderId: senderId,
          text: text,
        });
        console.log(res.data);
      } catch (error) {
        console.error(error);
      }
      newComment.current.value = "";
      fetchPosts();
    }
  };

  const Comment = (c) => {
    const [commentUser, setCommenstUser] = useState(null);

    useEffect(() => {
      const fetchCommentPhoto = async () => {
        try {
          const res = await axios.get(`/users?userId=${c.SenderId}`);
          setCommenstUser(res.data);
        } catch (error) {
          console.log(error);
        }
      };

      fetchCommentPhoto();
    }, [c]);

    return (
      <>
        <div className="Maincomment">
          <Link to={"/profile/" + commentUser?.username} style={{ textDecoration: "none" }}>
            <div className="userMain">
              <img
                src={
                  commentUser?.profilePicture
                    ? PF + commentUser?.profilePicture
                    : PF + "person/noAvatar.png"
                }
                alt=""
                className="commentImg"
              />
              <p className="commentUserName">@{commentUser?.username}</p>
            </div>
          </Link>
          <div>
            <p className="commentText">{c.comment}</p>
          </div>
        </div>
      </>
    );
  };

  const CommenstSection = () => {
    return (
      <>
        <div className="comments">
          <div className="commetsTop">
            <div className="commentsTopWrap">
              {post.comments.map((c) => (
                <Comment key={c._id} {...c} />
              ))}
            </div>
          </div>
          <div className="commenstBottom">
            <div className="commentsBottomWrap">
              <input type="text" placeholder="Comment what you Wish...." className="commentsInput" ref={newComment} />
              <button className="commentsBottomButton" onClick={sendComment}>comment</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <Link to={`/profile/${user.username}`}>
              <img
                className="postProfileImg"
                src={
                  user.profilePicture
                    ? PF + user.profilePicture
                    : PF + "person/noAvatar.png"
                }
                alt=""
              />
            </Link>
            <span className="postUsername">{user.username}</span>
            <span className="postDate">{format(post.createdAt)}</span>
          </div>
          <div className="postTopRight">
            {(currentUser._id === post.userId ?
              <Delete className="deleIcon" data-bs-toggle="modal" data-bs-target="#staticBackdrop" />
              : null)
            }
          </div>
          <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="staticBackdropLabel">{verify ? "Delete Post" : "Verify Passwords"}</h1>
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
                      <div className="mainDelete">
                        <p className="confirmText">Do you want to Delete The Post!</p>
                        <div className="Confirmation">
                          <button className="confirmDeleteButton" style={{backgroundColor:"red"}}data-bs-dismiss="modal" onClick={handleDelete}>Yes</button>
                          <button className="confirmDeleteButton" style={{backgroundColor:"#1866f2"}}data-bs-dismiss="modal" >No</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
        <div className="postCenter">
          <span className="postText">{post?.desc}</span>
          <img className="postImg" src={PF + post.img} alt="" />
        </div>
        <div className="postBottom">
          <div className="postBottomLeft">
            <img
              className="likeIcon"
              src={`${PF}like.png`}
              onClick={likeHandler}
              alt=""
            />
            <img
              className="likeIcon"
              src={`${PF}heart.png`}
              onClick={likeHandler}
              alt=""
            />
            <span className="postLikeCounter">{like} people like it</span>
          </div>
          <div className="postBottomRight" onClick={openCommenst}>
            {post.comments.length} comments
          </div>
        </div>
        <div className="PostComments">
          {isCommentsOpen && <CommenstSection />}
        </div>
      </div>
    </div>
  );
}
