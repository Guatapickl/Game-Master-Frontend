import React, { useState, useEffect, useRef } from 'react';
import DIDAvatar from './DIDAvatar';

const API_URL = "https://quantumgamemaster-08115932719b.herokuapp.com";

function DIDChat() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [avatarMessage, setAvatarMessage] = useState("");
  const chatContainerRef = useRef(null);
  const videoRef = useRef(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (avatarMessage) {
      console.log("Sending message to Avatar:", avatarMessage);
    }
  }, [avatarMessage]);  // ✅ Moved useEffect OUTSIDE sendMessage

  const sendMessage = async (message = userInput) => {
    console.log("🚀 sendMessage called with:", message);
    if (!message.trim()) return;

    setMessages(prevMessages => [...prevMessages, { role: "User", text: message }]);

    try {
      console.log("📡 Sending POST request to /chat with message:", message);
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      console.log("✅ Received response with status:", response.status); 

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log("📥 Response data:", data);
      setMessages(prevMessages => [...prevMessages, { role: "Game Master", text: data.response }]);


      setAvatarMessage(data.response); // ✅ Now properly updates avatarMessage
      
      handleNewMessage({ role: "Game Master", text: data.response });

    } catch (error) {
      console.error("Error:", error);
      setMessages(prevMessages => [...prevMessages, { role: "Game Master", text: "Error processing request." }]);
    }

    setUserInput("");
  };
  
  const handleNewMessage = (newMessage) => {
    setIsFadingOut(true); // Start fading out the current message

    setTimeout(() => {
      setIsFadingOut(false); // Start fading in the new message
    }, 500); // Matches the fadeOut animation duration
  };
  
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundImage: "url('https://quantumgamemaster.netlify.app/SLUT.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", maxWidth: "600px", margin: "0 auto", padding: "20px", boxSizing: "border-box" }}>
      <h1 style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '1.8rem',
        color: '#00FFFF',
        textAlign: 'center',
        textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF',
        letterSpacing: '2px',
        marginBottom: '10px'
      }}>
        <span style={{ textDecoration: 'underline' }}>S</span>ubspace <span style={{ textDecoration: 'underline' }}>L</span>iaison <span style={{ textDecoration: 'underline' }}>U</span>niversal <span style={{ textDecoration: 'underline' }}>T</span>ransceiver
      </h1>

      <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <DIDAvatar textToSpeak={avatarMessage} videoRef={videoRef} />
      </div>

      
      <div ref={chatContainerRef} style={{ flex: 1, position: "relative", padding: "10px", display: "flex", justifyContent: "center", alignItems: "center" }}>
  {messages.length > 0 && (
    <div
          key={messages[messages.length - 1].text}
          className={`message ${isFadingOut ? "fade-out" : "fade-in"}`}
          style={{
            position: "absolute",
            backgroundColor: messages[messages.length - 1].role === "User" ? "#f0f0f0" : "#e0e0e0",
            padding: "10px",
            borderRadius: "5px",
            maxWidth: "90%",
            textAlign: "center",
            opacity: isFadingOut ? 0 : 1,
            transition: "opacity 0.5s ease-in-out",
          }}
        >
          <strong>{messages[messages.length - 1].role}:</strong> {messages[messages.length - 1].text}
        </div>
      )}
    </div>


      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0, 0, 0, 0.8)", padding: "10px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
        <input
          style={{ width: "60%", padding: "10px", borderRadius: "8px", border: "1px solid #444" }}
          type="text"
          placeholder="Transcode communication relay:"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />

        <button
          onClick={sendMessage}
          style={{ padding: "10px 20px", backgroundColor: "#1e90ff", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          Transmit
        </button>
      </div>
    </div>
  );
}


export default DIDChat;
