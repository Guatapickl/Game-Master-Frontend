import axios from "axios";

const API_URL = "https://quantumgamemaster-08115932719b.herokuapp.com/proxy/did";  // ✅ Use the proxy instead of D-ID directly

const API_KEY = btoa("cm9iZXJ0Lndhc2hrb0BnbWFpbC5jb20:ZSjinQdKYG7SxjfrwGenn"); // Replace with your actual API Key


// Create a D-ID streaming session
export const createStream = async () => {
  try {
    const response = await axios.post(`${API_URL}/create`, {});  // ✅ Match proxy backend
    return response.data;
  } catch (error) {
    console.error("Error creating D-ID stream:", error);
    return null;
  }
};

// Start a WebRTC connection
export const startWebRTCConnection = async (streamId, offer) => {
  try {
    const response = await axios.post(
      `${API_URL}/webrtc/${streamId}`,
      { offer }
    );
    return response.data;
  } catch (error) {
    console.error("Error starting WebRTC connection:", error);
    return null;
  }
};

// Send a message to the avatar
export const sendMessage = async (streamId, message) => {
  try {
    await axios.post(
      `${API_URL}/messages/${streamId}`,
      { text: message }
    );
  } catch (error) {
    console.error("Error sending message to D-ID avatar:", error);
  }
};
