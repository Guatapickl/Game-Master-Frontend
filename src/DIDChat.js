import React, { useState, useEffect, useRef } from 'react';
import DIDAvatar from './DIDAvatar';

const API_URL = "https://quantumgamemaster-08115932719b.herokuapp.com";

function DIDChat() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [avatarMessage, setAvatarMessage] = useState("");  // ✅ Keep state outside
  const chatContainerRef = useRef(null);

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

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { role: "User", text: userInput }];
    setMessages(newMessages);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userInput }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setMessages([...newMessages, { role: "Game Master", text: data.response }]);

      setAvatarMessage(data.response);  // ✅ Now properly updates avatarMessage

    } catch (error) {
      console.error("Error:", error);
      setMessages([...newMessages, { role: "Game Master", text: "Error processing request." }]);
    }

    setUserInput("");
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
        <DIDAvatar textToSpeak={avatarMessage} />
      </div>

      <div ref={chatContainerRef} style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: "10px", backgroundColor: msg.role === "User" ? "#f0f0f0" : "#e0e0e0", padding: "10px", borderRadius: "5px" }}>
            <strong>{msg.role}:</strong> {msg.text}
          </div>
        ))}
      </div>

      {showResonatorButton && (
        <div style={{ textAlign: "center", margin: "10px 0" }}>
          <button
            onClick={handleResonatorClick}
            style={{ padding: "10px 20px", backgroundColor: "#1e90ff", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            Align Resonators
          </button>
        </div>
      )}

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
