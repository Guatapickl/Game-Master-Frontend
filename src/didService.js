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
        provider: { type: "microsoft", voice_id: "Andrew Dragon HD Latest", language: "en-US" }
      },
      config: { stitch: true }
    });

    return response.data;
  } catch (error) {
    console.error("Error creating D-ID stream:", error);
    return null;
  }
};

export const sendMessage = async (streamId, message, sessionId) => {
  try {
    await axios.post(`${API_URL}/messages/${streamId}`, {
      session_id: sessionId,
      text: message,
    });
  } catch (error) {
    console.error("Error sending message to D-ID avatar:", error);
  }
};
