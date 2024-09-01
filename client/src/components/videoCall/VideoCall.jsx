import { useCallback, useContext, useEffect,useState } from "react"
import { ReactPlayer } from "react-player"
import { AuthContext } from "../../context/AuthContext"
import peer from "../../service/peer"

function VideoCall({ frontUser,isVideoCall,setIsVideoCall,setFrontPersonId, incommingCall,frontPersonId, socket}) {
  const { user } = useContext(AuthContext);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  //start video Call
  const handleVideoCall = useCallback(() => {
    setIsVideoCall(true);
    if (frontPersonId && frontUser) {
      OfferCreate();
    }
  }, [isVideoCall, frontPersonId, frontUser]);


  // offer send
  const OfferCreate = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.current?.emit("offer:send", { offer, to: frontUser?._id, from: user._id });
    const streams = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    setLocalStream(streams);
  }, [frontUser, user]);

  //handle offer recieved 
  const handleRecieveOffer = useCallback(async (data) => {
    const { offer, from } = data;
    setFrontPersonId(from)
    //set stream 
    const streams = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    setLocalStream(streams);
    setIsVideoCall(true)
    const ans = await peer.getAnswer(offer);
    socket.current?.emit("answer:send", { ans, from: user._id, to: from })
  }, [socket, user])


  //sending the stream
  const sendStream = useCallback(() => {
    console.log(localStream); handleNegoOffer();
    const tracksArray = Array.from(localStream?.getTracks() || []);
    for (const track of tracksArray) {
      peer.peer.addTrack(track, localStream);
    }
  }, [localStream]);


  //handle recieved answer
  const handleRecievedAns = useCallback(async (data) => {
    const { ans } = data;
    await peer.setRemoteDescription(ans);
    sendStream();
  }, [sendStream])


  // nagosiation start send offer
  const handleNegoOffer = useCallback(async () => {
    const offer = await peer.getOffer();
    console.log(offer)
    socket.current?.emit("nego:offer:send", { from: user._id, to: frontUser._id, offer });
  }, [frontUser, socket, user])


  useEffect(() => {
    peer.peer.addEventListener("nego:offer:send", handleNegoOffer);
    return () => {
      peer.peer.removeEventListener("nego:offer:send", handleNegoOffer);
    }
  }, [handleNegoOffer])


  //recieved nego offer 
  const handleNagoOfferRecieved = useCallback(async (data) => {
    const { offer, from } = data;
    const ans = await peer.getAnswer(offer);
    socket.current?.emit("nego:ans:send", { ans, from: user._id, to: from })
  }, [socket, user, frontUser])

  // set ans recieved
  const handleNegoAnsRecieved = useCallback(async (data) => {
    const { ans } = data;
    await peer.setRemoteDescription(ans);
  }, [])

  //set remote stream;
  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log(remoteStream)
      setRemoteStream(remoteStream[0]);
    })
  }, [])

  useEffect(() => {
    socket.current?.on("offer:recieved", handleRecieveOffer);
    socket.current?.on("answer:recieved", handleRecievedAns);
    socket.current?.on("nego:Offer:recieved", handleNagoOfferRecieved)
    socket.current?.on("nego:ans:recieved", handleNegoAnsRecieved)
    return () => {
      socket.current?.off("offer:recieved", handleRecieveOffer);
      socket.current?.off("answer:recieved", handleRecievedAns);
      socket.current?.off("nego:Offer:recieved", handleNagoOfferRecieved)
      socket.current?.off("nego:ans:recieved", handleNegoAnsRecieved)
    }
  }, [socket, handleRecieveOffer, handleRecievedAns, handleNagoOfferRecieved, handleNegoAnsRecieved])

  return (<>
    <div>Your Stream</div>
    <ReactPlayer playing muted url={localStream} height="100px" width="150px" />
    <div>remote Stream</div>
    {<button onClick={sendStream}> send starem</button>}
    {remoteStream && <ReactPlayer playing muted url={remoteStream} height="100px" width="150px" />}
  </>)

}

export default VideoCall