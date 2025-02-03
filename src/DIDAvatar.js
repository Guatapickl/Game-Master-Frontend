import React, { useEffect, useState } from "react";
import axios from "axios";

const DID_API_URL = "https://api.d-id.com/talks"; // D-ID API endpoint

function DIDAvatar({ textToSpeak }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const apiKey = process.env.DID_API_KEY;

  useEffect(() => {
    if (textToSpeak) {
      generateAvatarSpeech(textToSpeak);
    }
  }, [textToSpeak]);

  const generateAvatarSpeech = async (text) => {
    try {
      const response = await axios.post(
        DID_API_URL,
        {
          script: {
            type: "text",
            input: text,
            provider: { type: "microsoft", voice_id: "en-US-JennyNeural" } // Voice selection
          },
          config: { stitch: true },
          source_url: "https://your-avatar-image-url.com/avatar.png" // Replace with a real avatar URL
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          }
        }
      );

      if (response.data && response.data.result_url) {
        setVideoUrl(response.data.result_url);
      } else {
        console.error("Error: No video URL returned from D-ID");
      }
    } catch (error) {
      console.error("D-ID API error:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginBottom: "20px" }}>
      <h2>AI Avatar</h2>
      {videoUrl ? (
        <video width="300" height="300" autoPlay loop>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div style={{
          width: "300px",
          height: "300px",
          backgroundColor: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          No video available
        </div>
      )}
    </div>
  );
}

export default DIDAvatar;
