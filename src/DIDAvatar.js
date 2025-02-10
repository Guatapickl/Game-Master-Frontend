import React, { useEffect, useRef, useState } from "react";
import { createStream, sendMessage } from "./didService";

const API_URL = "https://quantumgamemaster-08115932719b.herokuapp.com/proxy/did";  
const DID_API_KEY = "cm9iZXJ0Lndhc2hrb0BnbWFpbC5jb20:ZSjinQdKYG7SxjfrwGenn";

function DIDAvatar({ textToSpeak }) {
    const videoRef = useRef(null);
    const [streamId, setStreamId] = useState(null);
    const [didSessionID, setdidSessionID] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const mediaStream = new MediaStream();

    useEffect(() => {
        const initializeStream = async () => {
            //console.log("🔍 Initializing D-ID WebRTC stream...");

            const streamData = await createStream();
            console.log("🟢 D-ID Full Response:", JSON.stringify(streamData, null, 2));

            if (!streamData || !streamData.id || !streamData.offer) {
                console.error("❌ Failed to create D-ID stream.", streamData);
                return;
            }

            const { id, offer, session_id, ice_servers } = streamData;
            setStreamId(id);
            setdidSessionID(session_id)

            console.log("🚀 New D-ID Stream ID:", id);
            console.log("🚀 New D-ID Session ID:", session_id);

            const pc = new RTCPeerConnection({ iceServers: ice_servers });

            pc.oniceconnectionstatechange = () => {
              //console.log("🔍 ICE Connection State:", pc.iceConnectionState);
              if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
                 
              }
          };
          

            pc.ontrack = (event) => {
                        
              event.streams.forEach((stream, index) => {
                  //console.log(`📡 Stream ${index} ID: ${stream.id}`);
                  stream.getTracks().forEach((track, trackIndex) => {
                      //console.log(`🎬 Track ${trackIndex} - ID: ${track.id}, Kind: ${track.kind}`);
                      mediaStream.addTrack(track);
                  });
              });
          
              if (videoRef.current) {
                  //console.log("🔍 Checking video element state before setting srcObject...");
                  //console.log("🔍 Current video srcObject:", videoRef.current.srcObject);
          
                  // ✅ NEW: Check if video tracks are present
                  //console.log("🎥 Video Tracks:", mediaStream.getVideoTracks());
          
                  if (!videoRef.current.srcObject || videoRef.current.srcObject !== mediaStream) {
                      //console.log("📡 Setting video source object...");
                      videoRef.current.srcObject = mediaStream;
          
                      setTimeout(() => {
                          // ✅ NEW: Check if video is actually playing
                          //console.log("🎥 Is Video Playing?", !videoRef.current.paused);
          
                          videoRef.current.play()
                              .then(() => {
                                  //console.log("🎥 Video playback started successfully!");
                                  //console.log("🎥 Video Ready State:", videoRef.current.readyState); // Check readiness
                              })
                              .catch((err) => console.error("❌ Video play error:", err));
                      }, 500);
                  } else {
                      console.log("✅ Video element already has the correct media stream.");
                  }
              } else {
                  console.error("❌ Video reference is null!");
              }
          };
          

            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            console.log()

            await fetch(`${API_URL}/sdp/${id}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Authorization": `Basic ${DID_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    answer: { type: "answer", sdp: answer.sdp },
                    session_id: session_id,
                }),
            });

            setPeerConnection(pc);
        };

        initializeStream();
    }, []);

    useEffect(() => {
      if (textToSpeak && streamId && didSessionID) {
          console.log("💬 Preparing to send text to D-ID Avatar...");
          console.log("📡 TextToSpeak:", textToSpeak);
          console.log("📡 Stream ID:", streamId);
          console.log("📡 Session ID:", didSessionID);
  
          sendMessage(streamId, textToSpeak, didSessionID);
      } else {
          console.warn("⚠️ TextToSpeak, Stream ID, or Session ID missing! Not sending message.");
      }
  }, [textToSpeak, streamId, didSessionID]);  // ✅ Runs whenever textToSpeak updates
  

    return (
        <div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", height: "auto", maxWidth: "100%",     position: "relative", // Ensures it appears on top
                zIndex: 2,            // Layering priority
                borderRadius: "10px", // Optional: adds rounded corners
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)" // Optional: adds subtle shadow 
               }} 
            />

        </div>
    );
}

export default DIDAvatar;