import React, { useState, useEffect, useRef } from 'react';


const API_URL = "https://quantumgamemaster-08115932719b.herokuapp.com";

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef(null); // Reference for chat container
  

  useEffect(() => {
    // Auto-scroll to the bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

 
  const sendMessage = async () => {
        if (!userInput.trim()) return;
        if (isSending || !userInput.trim()) return; // Block if already sending
        setIsSending(true);

        const token = localStorage.getItem("sessionToken");
        console.log("SESSION TOKEN Frontend:", {token});
        const displayName = currentPlayer || "Unknown Player";
        const newMessages = [...messages, { role: displayName, text: userInput }];
        setMessages(newMessages);

        try {
            const fetchOptions = {
                method: "POST",
                credentials: 'include',
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": token,
                    "Accept": "application/json",
                    "Origin": window.location.origin
                },
                body: JSON.stringify({ 
                    message: userInput
                }),
            };

            const response = await fetch(`${API_URL}/chat`, fetchOptions);

           // Check if the response contains a token
            const token = response.headers.get("token");
            const newToken = response.headers.get("X-Session-Token");
            if (token) {
              localStorage.setItem("sessionToken", token);
            } else if (newToken) {
              localStorage.setItem("sessionToken", newToken);
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error response body:", errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log("Parsed response data:", data);

            // Clear player name from localStorage if reset command is used
            if (userInput.toLowerCase() === "reset game") {
                console.log("Resetting game: Clearing player name...");
                setCurrentPlayer(null); // Reset state
            }

            const botMessage = data.response || "No response";
            console.log("Bot message:", botMessage);

            setMessages([
                ...newMessages,
                { role: "Game Master", text: botMessage },
            ]);
        } catch (err) {
            console.error("Detailed error:", {
                name: err.name,
                message: err.message,
                stack: err.stack
            });

            setMessages([
                ...newMessages,
                { role: "Game Master", text: `Error: ${err.message}` },
            ]);
        }

        setUserInput("");
        setIsSending(false);
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", maxWidth: "600px", margin: "0 auto", padding: "20px", boxSizing: "border-box" }}>
        <h1>Etherlink Chat Interface</h1>
        <div ref={chatContainerRef} style={{ border: "1px solid #ccc", padding: 10, minHeight: 300, overflowY: "auto" }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <strong>{msg.role}:</strong> {msg.text}
            </div>
          ))}
        </div>
        <input
          style={{ width: "80%", padding: 8 }}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault(); // Prevent any default form submission behavior
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    );
  }
  
  export default App;
  