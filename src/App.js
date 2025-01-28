import React, { useState, useEffect, useRef } from 'react';

const API_URL = "https://fierce-river-12633-8859b9aa71cd.herokuapp.com";

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const chatContainerRef = useRef(null); // Reference for chat container

  useEffect(() => {
   // console.log("Checking cookies on mount:");
   // console.log("All cookies:", document.cookie);

    const cookies = document.cookie.split(';').reduce((acc, curr) => {
      const [key, value] = curr.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});

    if (cookies.player_name) {
      //console.log("Found player_name cookie:", cookies.player_name);
      setCurrentPlayer(decodeURIComponent(cookies.player_name));
      
    } else {
      //console.log("No player_name cookie found");
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to the bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
        if (!userInput.trim()) return;

        const displayName = currentPlayer || "Unknown Player";
        const newMessages = [...messages, { role: displayName, text: userInput }];
        setMessages(newMessages);

        // Log the request details
        console.log("Starting request to backend:");
        console.log("API URL:", `${API_URL}/chat`);
        console.log("Request payload:", {
            message: userInput
        });
        console.log("Current cookies:", document.cookie);

        try {
            const fetchOptions = {
                method: "POST",
                credentials: 'include',
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ 
                    message: userInput
                }),
            };

            console.log("Fetch options:", fetchOptions);

            // Make the request
            console.log("Sending fetch request...");
            const response = await fetch(`${API_URL}/chat`, fetchOptions);
            
            console.log("Response received:");
            console.log("Status:", response.status);
            console.log("Status text:", response.statusText);
            console.log("Headers:", [...response.headers.entries()]);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error response body:", errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log("Parsed response data:", data);

            if (data.cookie && data.cookie[0] === "player_name") {
                const newPlayerName = data.cookie[1];
                console.log("Setting new player name:", newPlayerName);
                setCurrentPlayer(newPlayerName);
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
    };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Game Master Chat</h1>
      
      <div style={{ 
        marginBottom: "20px", 
        padding: "10px", 
        backgroundColor: "#f0f0f0", 
        borderRadius: "4px" 
      }}>
        {/* Display current player or Team Chat status */}
        {currentPlayer === "Team Chat" ? (
          <p>Currently using Team Chat interface.</p>
        ) : currentPlayer ? (
          <p>Playing as: <strong>{currentPlayer}</strong>
          </p>
        ) : (
          <p>....Establishing Connection....</p>
        )}
      </div>

      <div
        ref={chatContainerRef} // Add ref to chat container
        style={{ 
          border: "1px solid #ccc", 
          padding: 10, 
          minHeight: 300,
          maxHeight: "60vh",
          overflowY: "auto"
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ 
            marginBottom: 8,
            padding: "8px",
            backgroundColor: msg.role === currentPlayer ? "#f0f0f0" : 
                           msg.role === "Game Master" ? "#e6f3ff" : "#fff0e6",
            borderRadius: "4px"
          }}>
            <strong>{msg.role}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10 }}>
        <input
          style={{ 
            width: "80%", 
            padding: 8,
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
          type="text"
          placeholder="Type your message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
        />
        <button 
          onClick={sendMessage} 
          style={{ 
            padding: "8px 16px", 
            marginLeft: 5,
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
