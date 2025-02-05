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

      const { id, offer, session_id, ice_servers } = streamData;;
      const localStreamId = id;
      const localSessionId = session_id;     
      console.log("🚀 New D-ID Stream LocalID:", localStreamId);
      console.log("🚀 New D-ID Session LocalID:", localSessionId);
      setStreamId(id);
      setSessionId(session_id);
      console.log("🚀 New D-ID Session ID:", session_id);
      console.log("🚀 New D-ID Stream ID:", id);
      

      // ✅ Set up WebRTC PeerConnection
      const pc = new RTCPeerConnection({
        iceServers: ice_servers
      });

      pc.oniceconnectionstatechange = () => {
        console.log("🔍 ICE Connection State:", pc.iceConnectionState);
        if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
            console.log("✅ WebRTC is now fully connected!");
        }
    };
    
    pc.onicecandidate = async (event) => {
      if (!localStreamId) {  
          console.error("❌ ICE Candidate Error: Missing streamId! Cannot send ICE candidates.");
          return;
      }
      if (!localSessionId) {
          console.error("❌ ICE Candidate Error: Missing sessionId! Cannot send ICE candidates.");
          return;
      }
  
      if (event.candidate) {
          console.log("📡 Sending ICE Candidate:", event.candidate);
          const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
  
          try {
              const response = await fetch(`${API_URL}/ice/${localStreamId}`, {  
                  method: "POST",
                  headers: {
                      "Authorization": `Basic ${DID_API_KEY}`,
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                      candidate,
                      sdpMid,
                      sdpMLineIndex,
                      session_id, 
                  }),
              });
  
              console.log("✅ ICE Candidate Sent:", await response.text());
          } catch (err) {
              console.error("❌ Failed to send ICE candidate:", err);
          }
      }
  };
  
  
    

  pc.ontrack = async (event) => {
    console.log("🎥 WebRTC track received:", event);

    if (videoRef.current) {
        console.log("🎥 Attaching stream to video element");
        videoRef.current.srcObject = event.streams[0];

        // ✅ Force immediate playback attempt
        try {
            await videoRef.current.play();
            console.log("✅ Video playback started!");
        } catch (err) {
            console.error("❌ Video play error:", err);
        }
    } else {
        console.error("❌ Video element not found!");
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
        sendMessage(streamId, textToSpeak, sessionId);
        console.log("📡 Sending message to D-ID:", { streamId, sessionId, textToSpeak });
    }
  }, [textToSpeak, streamId, sessionId]);

  
  return (
    <div>
        <h2>AI Avatary</h2>
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted  // 🔥 Adding this ensures autoplay isn't blocked!
            style={{ 
                width: "300px", 
                height: "300px", 
                backgroundColor: "white",  // Ensures visibility
                display: "block"  // Forces video to be rendered
            }} 
        />
    </div>
);

}

export default DIDAvatar;

