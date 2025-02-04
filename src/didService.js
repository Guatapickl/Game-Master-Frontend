import axios from "axios";

const API_URL = "https://quantumgamemaster-08115932719b.herokuapp.com/proxy/did";  // ✅ Use the proxy instead of D-ID directly

const API_KEY = btoa("cm9iZXJ0Lndhc2hrb0BnbWFpbC5jb20:ZSjinQdKYG7SxjfrwGenn"); // Replace with your actual API Key


// Create a D-ID streaming session
export const createStream = async () => {
  try {
    const response = await axios.post(`${API_URL}`, {
      source_url: "https://quantumgamemaster.netlify.app/QGM.png",   // ✅ Avatar image
      script: {
        type: "text",
        input: "Initializing response...",
        provider: { type: "microsoft", voice_id: "JennyNeural", language: "en-US" }
      },
      config: { stitch: true }
    });

    return response.data;
  } catch (error) {
    console.error("Error creating D-ID stream:", error);
    return null;
  }
};

export const sendMessage = async (streamId, message) => {
  try {
    await axios.post(`${API_URL}/messages/${streamId}`, { text: message });
  } catch (error) {
    console.error("Error sending message to D-ID avatar:", error);
  }
};
