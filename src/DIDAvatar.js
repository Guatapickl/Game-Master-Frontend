import React, { useEffect, useRef, useState } from "react";
import { createStream, sendMessage } from "./didService";

function DIDAvatar({ textToSpeak }) {
  const videoRef = useRef(null);
  const [streamId, setStreamId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null); // ✅ Store video stream URL

  useEffect(() => {
    const initializeStream = async () => {
      console.log("Initializing D-ID stream...");
      const streamData = await createStream();
      console.log("D-ID Response:", streamData);

      if (!streamData || !streamData.id) {
        console.error("Failed to create D-ID stream.", streamData);
        return;
      }

      setStreamId(streamData.id);

      // ✅ If `streamData.source_url` exists, use it
      if (streamData.source_url) {
        setVideoUrl(streamData.source_url);
      } else {
        console.warn("No `source_url` provided by D-ID.");
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
      {videoUrl ? (
        <video src={videoUrl} autoPlay playsInline style={{ width: "300px", height: "300px" }} />
      ) : (
        <p>Loading avatar...</p>
      )}
    </div>
  );
}

export default DIDAvatar;
