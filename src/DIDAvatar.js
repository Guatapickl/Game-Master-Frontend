import React, { useEffect, useRef, useState } from "react";
import { createStream, sendMessage } from "./didService";

const API_URL = "https://quantumgamemaster-08115932719b.herokuapp.com/proxy/did";  
const DID_API_KEY = "cm9iZXJ0Lndhc2hrb0BnbWFpbC5jb20:ZSjinQdKYG7SxjfrwGenn";

function DIDAvatar({ textToSpeak }) {
    const videoRef = useRef(null);
    const [streamId, setStreamId] = useState(null);
    const [sanitizedSessionId, setSanitizedSessionId] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const mediaStream = new MediaStream();

    useEffect(() => {
        const initializeStream = async () => {
            console.log("🔍 Initializing D-ID WebRTC stream...");

            const streamData = await createStream();
            console.log("🟢 D-ID Full Response:", JSON.stringify(streamData, null, 2));

            if (!streamData || !streamData.id || !streamData.offer) {
                console.error("❌ Failed to create D-ID stream.", streamData);
                return;
            }

            const { id, offer, session_id, ice_servers } = streamData;
            setStreamId(id);

            const cleanSessionId = session_id.split(";")[0]; 
            setSanitizedSessionId(cleanSessionId);

            console.log("🚀 New D-ID Stream ID:", id);
            console.log("🚀 New D-ID Session ID:", cleanSessionId);

            const pc = new RTCPeerConnection({ iceServers: ice_servers });

            pc.oniceconnectionstatechange = () => {
              console.log("🔍 ICE Connection State:", pc.iceConnectionState);
              if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
                  console.log("✅ WebRTC is now fully connected!");
          
                  setTimeout(() => {
                      if (videoRef.current && videoRef.current.srcObject) {
                          console.log("🔄 Forcing video playback after ICE connection...");
                          
                          // ✅ NEW: Check if video tracks are still present
                          console.log("🎥 Video Tracks after ICE:", videoRef.current.srcObject?.getVideoTracks());
          
                          videoRef.current.play()
                              .then(() => {
                                  console.log("🎥 Video playback started successfully after ICE!");
                                  console.log("🎥 Video Ready State after ICE:", videoRef.current.readyState);
                              })
                              .catch((err) => console.error("❌ Video play error after ICE:", err));
                      }
                  }, 500);
              }
          };
          

            pc.ontrack = (event) => {
              console.log("🎥 Received 'ontrack' event!");
              console.log(`🔍 Number of streams: ${event.streams.length}`);
          
              event.streams.forEach((stream, index) => {
                  console.log(`📡 Stream ${index} ID: ${stream.id}`);
                  stream.getTracks().forEach((track, trackIndex) => {
                      console.log(`🎬 Track ${trackIndex} - ID: ${track.id}, Kind: ${track.kind}`);
                      mediaStream.addTrack(track);
                  });
              });
          
              if (videoRef.current) {
                  console.log("🔍 Checking video element state before setting srcObject...");
                  console.log("🔍 Current video srcObject:", videoRef.current.srcObject);
          
                  // ✅ NEW: Check if video tracks are present
                  console.log("🎥 Video Tracks:", mediaStream.getVideoTracks());
          
                  if (!videoRef.current.srcObject || videoRef.current.srcObject !== mediaStream) {
                      console.log("📡 Setting video source object...");
                      videoRef.current.srcObject = mediaStream;
          
                      setTimeout(() => {
                          // ✅ NEW: Check if video is actually playing
                          console.log("🎥 Is Video Playing?", !videoRef.current.paused);
          
                          videoRef.current.play()
                              .then(() => {
                                  console.log("🎥 Video playback started successfully!");
                                  console.log("🎥 Video Ready State:", videoRef.current.readyState); // Check readiness
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

            await fetch(`${API_URL}/sdp/${id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${DID_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    answer: { type: "answer", sdp: answer.sdp },
                    session_id: cleanSessionId,
                }),
            });

            setPeerConnection(pc);
        };

        initializeStream();
    }, []);

    useEffect(() => {
      if (textToSpeak && streamId && sanitizedSessionId) {
          console.log("💬 Preparing to send text to D-ID Avatar...");
          console.log("📡 TextToSpeak:", textToSpeak);
          console.log("📡 Stream ID:", streamId);
          console.log("📡 Session ID:", sanitizedSessionId);
  
          sendMessage(streamId, textToSpeak, sanitizedSessionId);
      } else {
          console.warn("⚠️ TextToSpeak, Stream ID, or Session ID missing! Not sending message.");
      }
  }, [textToSpeak, streamId, sanitizedSessionId]);  // ✅ Runs whenever textToSpeak updates
  

    return (
        <div>
            <h2>AI Avatar</h2>
            <video ref={videoRef} autoPlay playsInline muted />
            <button onClick={() => {
    console.log("🛠️ Manually trying to play video...");
    console.log("🎥 Video Tracks on button click:", videoRef.current?.srcObject?.getVideoTracks());
    console.log("🎥 Video Ready State on button click:", videoRef.current?.readyState);

    videoRef.current?.play()
        .then(() => console.log("✅ Video playback started manually!"))
        .catch((err) => console.error("❌ Video play error on button click:", err));
}}>
    ▶️ Force Video Play (Debug)
</button>

        </div>
    );
}

export default DIDAvatar;
