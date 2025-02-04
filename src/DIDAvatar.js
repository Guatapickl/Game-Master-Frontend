import React, { useEffect, useRef, useState } from "react";
import { createStream, sendMessage } from "./didService";

function DIDAvatar({ textToSpeak }) {
  const videoRef = useRef(null);
  const [streamId, setStreamId] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);

  useEffect(() => {
    const initializeStream = async () => {
      console.log("🔍 Initializing D-ID WebRTC stream...");

      const streamData = await createStream();
      console.log("🟢 D-ID Full Response:", JSON.stringify(streamData, null, 2));

      if (!streamData || !streamData.id || !streamData.offer) {
        console.error("❌ Failed to create D-ID stream.", streamData);
        return;
      }

      setStreamId(streamData.id);

      // ✅ Set up WebRTC PeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:turn.example.com:3478",
            username: "user",
            credential: "password"
          }
        ]
      });
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("🔹 ICE Candidate:", event.candidate);
        }
      };

      pc.ontrack = (event) => {
        console.log("🎥 WebRTC track received:", event);
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      try {
        // ✅ Set the remote offer from D-ID
        await pc.setRemoteDescription(new RTCSessionDescription(streamData.offer));

        // ✅ Create and send an answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("📡 Sending WebRTC answer:", JSON.stringify(answer, null, 2));

        console.log("📡 Sending WebRTC answer to D-ID...");
        await fetch(`https://quantumgamemaster-08115932719b.herokuapp.com/proxy/did/webrtc/${streamData.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answer: {
              type: "answer",
              sdp: answer.sdp
            }
          })
        });
        

        setPeerConnection(pc);
      } catch (error) {
        console.error("❌ WebRTC setup failed:", error);
      }
    };

    initializeStream();
  }, []);

  useEffect(() => {
    if (textToSpeak && streamId) {
      console.log("💬 Sending text to D-ID Avatar:", textToSpeak);
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
