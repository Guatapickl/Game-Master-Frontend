import axios from "axios";

const API_URL = "https://quantumgamemaster-08115932719b.herokuapp.com/proxy/did";  // ✅ Use the proxy instead of D-ID directly

// Create a D-ID streaming session
export const createStream = async () => {
  try {
    const response = await axios.post(`${API_URL}`, {
      source_url: "https://quantumgamemaster.netlify.app/QGM.png",   // ✅ Avatar image
      script: {
        type: "text",
        input: "Initializing response...",
        provider: { type: "microsoft", voice_id: "Daniel", language: "en-US" }
      },
      config: { stitch: true }
    });

    return response.data;
  } catch (error) {
    console.error("Error creating D-ID stream:", error);
    return null;
  }
};

export const sendMessage = async (streamId, message, didSessionID) => {
  try {
    const requestBody = {
      did_session_id: didSessionId,
      text: message,
    };

    console.log("📡 Sending Message to D-ID:", JSON.stringify(requestBody, null, 2));

    const response = await axios.post(`${API_URL}/messages/${streamId}`, requestBody);

    console.log("✅ D-ID Response Status:", response.status);
    console.log("✅ D-ID Response Data:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error("❌ Error sending message to D-ID avatar:", error);
  }
};
