import React, { useEffect, useRef, useState } from "react";
import { createStream, sendMessage } from "./didService";

const API_URL = "https://quantumgamemaster-08115932719b.herokuapp.com/proxy/did";  // ✅ Use the proxy instead of D-ID directly
//const API_URL = "https://api.d-id.com/talks/streams/{stream_id}/webrtc";
const DID_API_KEY = "cm9iZXJ0Lndhc2hrb0BnbWFpbC5jb20:ZSjinQdKYG7SxjfrwGenn"

function DIDAvatar({ textToSpeak }) {
  const videoRef = useRef(null);
  const [streamId, setStreamId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
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

      const { id, offer, session_id } = streamData;
      setStreamId(id);
      setSessionId(session_id);

      // ✅ Set up WebRTC PeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
      });

      // For passing ICE candidates back:
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
          await fetch(`${API_URL}/ice/${id}`, {
            method: "POST",
            headers: {
              "Authorization": `Basic ${DID_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              candidate,
              sdpMid,
              sdpMLineIndex,
              session_id, // must include session_id
            }),
          });
        }
      };

      pc.ontrack = (event) => {
        console.log("🎥 WebRTC track received:", event);
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        console.log("📡 Sending WebRTC answer for Stream ID:", streamData.id);
        console.log("➡️ WebRTC Answer Payload:", { type: "answer", sdp: answer.sdp });
        console.log("🔍 Sending WebRTC answer with API Key:", DID_API_KEY ? "✅ Exists" : "❌ MISSING");
        console.log("🔍 WebRTC Payload Before Sending:", JSON.stringify({
          answer: { type: "answer", sdp: answer.sdp }
        }, null, 2));
        
        const sdpResponse = await fetch(
          `${API_URL}/sdp/${streamData.id}`,   // Instead of /webrtc
          {
            method: "POST",
            headers: {
              "Authorization": `Basic ${DID_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              answer: { type: "answer", sdp: answer.sdp },
              session_id  
            }),
          }
        );
        
        
        console.log("🔍 WebRTC Answer Response Status:", sdpResponse.status);
        console.log("🔍 WebRTC Answer Response Text:", await sdpResponse.text());
        

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
      <video ref={videoRef} 
      autoPlay 
      playsInline 
      style={{ width: "300px", height: "300px" }} />
    </div>
  );
}

export default DIDAvatar;

