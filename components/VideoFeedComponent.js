import { useParams } from "react-router-dom";
import { useRef, useEffect } from "react";
import socketio from "socket.io-client";
// import styles from '../styles/VideoFeed.modul e.css'

export default function VideoFeed() {
    const params = useParams();
    const username = "Abdul";//params.username;
    const room = "Hello"; //params.room;
    const currentUserVideo = useRef(null);
    const remoteUserVideo = useRef(null);
  
    const s_webrtc = socketio("http://localhost:9000", {
      autoConnect: false,
    });

    // rtc peer connection that will enable 2 way video between the 2 users
  // made using the WebRTC standard
  let peerConnection; 

  const transmitData = (data) => {
    s_webrtc.emit("data", {
      username: username,
      room: room,
      data: data,
    });
  };

  const connectSocket = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          height: 350,
          width: 350,
        },
      })
      .then((stream) => {
        console.log("Local Stream found");

        currentUserVideo.current.srcObject = stream;
        stream.getAudioTracks()[0].enabled = true;
        s_webrtc.connect();
        
        s_webrtc.emit("join", { username: username, room: room }); // enit function must call same "join" function on backend

        console.log("Socket", s_webrtc);
      })
      .catch((error) => {
        console.error("Stream not found: ", error);
      });

  };

  const onCandidateEstablished = (event) => {
    if (event.candidate) {
      console.log("Sending ICE candidate");
      transmitData({
        type: "candidate",
        candidate: event.candidate,
      });
    }
  };

  const onVideoFeedTrackFound = (event) => {
    console.log("Adding remote track");
    remoteUserVideo.current.srcObject = event.streams[0];
  };

  const createPeerConnection = () => {
    try {
      peerConnection = new RTCPeerConnection({});
      peerConnection.onicecandidate = onCandidateEstablished;
      peerConnection.ontrack = onVideoFeedTrackFound;
      const localStream = currentUserVideo.current.srcObject;
      for (const track of localStream.getTracks()) {
        peerConnection.addTrack(track, localStream);
      }
      console.log("PeerConnection created");
    } catch (error) {
      console.error("PeerConnection failed: ", error);
    }
  };

  const setAndSendLocalDescription = (sessionDescription) => {
    peerConnection.setLocalDescription(sessionDescription);
    console.log("Local description set");
    transmitData(sessionDescription);
  };

  const sendConnectionOffer = () => {
    console.log("Sending offer");
    peerConnection.createOffer().then(setAndSendLocalDescription, (error) => {
      console.error("Send offer failed: ", error);
    });
  };

  const sendConnectionAnswer = () => {
    console.log("Sending answer");
    peerConnection.createAnswer().then(setAndSendLocalDescription, (error) => {
      console.error("Send answer failed: ", error);
    });
  };

  const signalingDataHandler = (data) => {
    if (data.type === "offer") {
      createPeerConnection();
      peerConnection.setRemoteDescription(new RTCSessionDescription(data));
      sendConnectionAnswer();
    } else if (data.type === "answer") {
      peerConnection.setRemoteDescription(new RTCSessionDescription(data));
    } else if (data.type === "candidate") {
      peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } else {
      console.log("Unknown Data");
    }
  };

  s_webrtc.on("ready", () => {
    console.log("Ready to Connect!");
    createPeerConnection();
    sendConnectionOffer();
  });

  s_webrtc.on("data", (data) => {
    console.log("Data received: ", data);
    signalingDataHandler(data);
  });

  useEffect(() => {
    connectSocket();
    return () => peerConnection?.close();
    // TODO: Fix Use effect t
    //eslint-disable-next-line
  }, []);

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1>Host</h1>
                    <div>
                        <video autoPlay muted playsInline ref={currentUserVideo} style={{ width: '98%', height: 'auto' }} />

                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h1>Guest</h1>
                    <div>
                        <video autoPlay playsInline ref={remoteUserVideo} style={{ width: '98%', height: 'auto' }} />
                    </div>
                </div>
            </div>
        </>
    )
}
