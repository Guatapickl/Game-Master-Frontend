import React, { useEffect, useRef, useState } from "react";
import { createStream, startWebRTCConnection, sendMessage } from "../didService";

function DIDAvatar({ textToSpeak }) {
  const videoRef = useRef(null);
  const [streamId, setStreamId] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);

  useEffect(() => {
    const initializeStream = async () => {
      const streamData = await createStream();
      if (!streamData) return;

      setStreamId(streamData.id);
      const pc = new RTCPeerConnection();

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("ICE Candidate:", event.candidate);
        }
      };

      pc.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await startWebRTCConnection(streamData.id, offer);
      if (response && response.answer) {
        await pc.setRemoteDescription(new RTCSessionDescription(response.answer));
      }

      setPeerConnection(pc);
    };

    initializeStream();
  }, []);

  useEffect(() => {
    if (textToSpeak && streamId) {
      sendMessage(streamId, textToSpeak);
    }
  }, [textToSpeak, streamId]);

  return (
    <div>
      <h2>AI Avatar</h2>
      <video ref={videoRef} autoPlay playsInline style={{ width: "300px", height: "300px" }} />
    </div>
  );
}

export default DIDAvatar;
