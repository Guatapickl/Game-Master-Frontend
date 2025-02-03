import axios from 'axios';

const API_URL = 'https://api.d-id.com';
const API_KEY = process.env.REACT_APP_DID_API_KEY; // Ensure this is in your .env file

// Create a new D-ID streaming session
export const createStream = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/talks/streams`,
      {},
      {
        headers: {
          Authorization: `Basic ${API_KEY}`,
        },
      }
    );
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
      `${API_URL}/talks/streams/${streamId}/webrtc`,
      { offer },
      {
        headers: {
          Authorization: `Basic ${API_KEY}`,
        },
      }
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
      `${API_URL}/talks/streams/${streamId}/messages`,
      { text: message },
      {
        headers: {
          Authorization: `Basic ${API_KEY}`,
        },
      }
    );
  } catch (error) {
    console.error("Error sending message to D-ID avatar:", error);
  }
};
