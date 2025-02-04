import React, { useEffect, useRef, useState } from "react";
import { createStream, sendMessage } from "./didService";

function DIDAvatar({ textToSpeak }) {
  const videoRef = useRef(null);
  const [streamId, setStreamId] = useState(null);

  useEffect(() => {
    const initializeStream = async () => {
      console.log("Initializing D-ID stream...");
      const streamData = await createStream();
      if (!streamData || !streamData.id || !streamData.source_url) {
        console.error("Failed to create D-ID stream.", streamData);
        return;
      }

      setStreamId(streamData.id);

      // ✅ Set the video source to the returned stream URL
      if (videoRef.current) {
        videoRef.current.src = streamData.source_url;
      }
    };

    initializeStream();
  }, []);

  useEffect(() => {
    if (textToSpeak && streamId) {
      console.log("Sending text to D-ID Avatar:", textToSpeak);
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
