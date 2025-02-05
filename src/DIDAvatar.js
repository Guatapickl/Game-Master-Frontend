import React, { useEffect, useRef, useState } from "react";
import { createStream, sendMessage } from "./didService";

const API_URL = "https://quantumgamemaster-08115932719b.herokuapp.com/proxy/did";  
const DID_API_KEY = "cm9iZXJ0Lndhc2hrb0BnbWFpbC5jb20:ZSjinQdKYG7SxjfrwGenn";

function DIDAvatar({ textToSpeak }) {
  const videoRef = useRef(null);
  const [streamId, setStreamId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
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
      setSessionId(session_id);

      // Sanitize session ID
      const cleanSessionId = session_id.split(";")[0]; 
      setSanitizedSessionId(cleanSessionId);

      console.log("🚀 New D-ID Stream ID:", id);
      console.log("🚀 New D-ID Session ID:", cleanSessionId);

      const pc = new RTCPeerConnection({ iceServers: ice_servers });

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
          console.log("✅ WebRTC is now fully connected!");
        }
      };

      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          try {
            const response = await fetch(`${API_URL}/ice/${id}`, {
              method: "POST",
              headers: {
                "Authorization": `Basic ${DID_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                candidate: event.candidate.candidate,
                sdpMid: event.candidate.sdpMid,
                sdpMLineIndex: event.candidate.sdpMLineIndex,
                session_id: cleanSessionId, // ✅ Use the sanitized version
              }),
            });

            console.log("✅ ICE Candidate Sent:", await response.text());
          } catch (err) {
            console.error("❌ Failed to send ICE candidate:", err);
          }
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
          if (!videoRef.current.srcObject || videoRef.current.srcObject !== mediaStream) {
            console.log("📡 Setting video source object...");
            videoRef.current.srcObject = mediaStream;
            videoRef.current
              .play()
              .then(() => console.log("🎥 Video playback started successfully"))
              .catch((err) => console.error("❌ Video play error:", err));
          } else {
            console.log("✅ Video element already has the correct media stream.");
          }
        } else {
          console.error("❌ Video reference is null!");
        }
      };

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        console.log("📡 Sending WebRTC answer for Stream ID:", id);
        const sdpResponse = await fetch(`${API_URL}/sdp/${id}`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${DID_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answer: { type: "answer", sdp: answer.sdp },
            session_id: cleanSessionId, // ✅ Use sanitized version
          }),
        });

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
    if (textToSpeak && streamId && sanitizedSessionId) {
      console.log("💬 Sending text to D-ID Avatar:", textToSpeak);
      sendMessage(streamId, textToSpeak, sanitizedSessionId);
    }
  }, [textToSpeak, streamId, sanitizedSessionId]); // ✅ Ensure sanitizedSessionId is in dependency array

  return (
    <div>
      <h2>AI Avatar</h2>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "300px",
          height: "300px",
          backgroundColor: "white",
          display: "block",
        }}
      />
    </div>
  );
}

export default DIDAvatar;
