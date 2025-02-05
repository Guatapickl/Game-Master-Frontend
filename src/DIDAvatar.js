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
                            videoRef.current.play().then(() => console.log("🎥 Video playback started successfully after ICE!"))
                            .catch((err) => console.error("❌ Video play error after ICE:", err));
                        }
                    }, 500);
                }
            };

            pc.ontrack = (event) => {
                console.log("🎥 Received 'ontrack' event!");
                event.streams.forEach((stream) => mediaStream.addTrack(stream.getTracks()[0]));

                setTimeout(() => {
                    if (videoRef.current && !videoRef.current.srcObject) {
                        console.log("📡 Setting video source object...");
                        videoRef.current.srcObject = mediaStream;
                        videoRef.current.play().catch((err) => console.error("❌ Video play error:", err));
                    }
                }, 500);
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

    return (
        <div>
            <h2>AI Avatar</h2>
            <video ref={videoRef} autoPlay playsInline muted />
            <button onClick={() => videoRef.current?.play()}>
                ▶️ Force Video Play
            </button>
        </div>
    );
}

export default DIDAvatar;
