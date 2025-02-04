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
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ backgroundColor: "#333", color: "#fff", padding: "10px", display: "flex", justifyContent: "center" }}>
        <DIDAvatar textToSpeak={avatarMessage} />
      </div>

      <div style={{ flex: 1, maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <h1>D-ID Chat</h1>
        <div ref={chatContainerRef} style={{ border: "1px solid #ccc", padding: 10, minHeight: 300, maxHeight: "60vh", overflowY: "auto" }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: 8, padding: "8px", backgroundColor: msg.role === "User" ? "#f0f0f0" : "#e6f3ff", borderRadius: "4px" }}>
              <strong>{msg.role}:</strong> {msg.text}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 10 }}>
          <input
            style={{ width: "80%", padding: 8, borderRadius: "4px", border: "1px solid #ccc" }}
            type="text"
            placeholder="Type your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} style={{ padding: "8px 16px", marginLeft: 5, backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default DIDChat;
