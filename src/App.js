import React, { useState, useEffect, useRef } from 'react';

const API_URL = "https://quantumgamemaster-08115932719b.herokuapp.com";

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const chatContainerRef = useRef(null); // Reference for chat container
  // new piece of state to hold the "last system message"

  const [avatarMessage, setAvatarMessage] = useState("");

  // check if name is known
  //const isNameKnown = currentPlayer && currentPlayer !== "No_name";

  // Read player name from localStorage on component mount:
  useEffect(() => {
    const storedName = localStorage.getItem("player_name");
    if (storedName) {
      setCurrentPlayer(storedName);
    } else {
        setCurrentPlayer(null); // Ensure state resets properly
    }
  }, []);

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

  // Each time messages change, extract the last system (Game Master) message:
  useEffect(() => {
    const lastGMMessage = [...messages].reverse()
      .find(msg => msg.role === "Game Master");
    if (lastGMMessage) {
      setAvatarMessage(lastGMMessage.text);
      // Potentially call D-ID speak logic here if needed
    }
  }, [messages]);

  const sendMessage = async () => {
    console.log("Current cookies before fetch:", document.cookie);
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
                    "Accept": "application/json",
                    "Origin": window.location.origin
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

            // Clear player name from localStorage if reset command is used
            if (userInput.toLowerCase() === "reset game") {
                console.log("Resetting game: Clearing player name...");
                localStorage.removeItem("player_name"); // Remove from localStorage
                setCurrentPlayer(null); // Reset state
            }

            if (data.cookie) {
              console.log("Server requested cookie set:", data.cookie);
            }
            
            console.log("Cookies after response:", document.cookie);
            if (data.cookie && data.cookie[0] === "player_name") {
                const newPlayerName = data.cookie[1];
                if (newPlayerName !== currentPlayer) {  // Avoid unnecessary re-renders
                  localStorage.setItem("player_name", newPlayerName);
                  setCurrentPlayer(newPlayerName);
              }
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


    const handleNameSubmit = async (name) => {
      setCurrentPlayer(name);
      // Optionally send "name" to the backend 
      // so the cookie is set properly right away:
      try {
        const response = await fetch(`${API_URL}/chat`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ message: name }),
        });
        // If backend sets the cookie, your next refresh should show it
        // in the chat. Or you can do more logic here if needed.
      } catch (err) {
        console.error(err);
      }
    };
  
    // Conditionally render
    /*if (!isNameKnown) {
      // Show the dark portal
      return <DarkPortal onNameSubmit={handleNameSubmit} />;
    }/*/

    // If we know the name, show the main interface
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        
        {/* TOP SECTION: D-ID Avatar or whatever "interdimensional" effect you want */}
        <div style={{
          backgroundColor: "#333", 
          color: "#fff", 
          padding: "10px", 
          display: "flex",
          justifyContent: "center",
        }}>
        {/* Commenting out the DIDAvatar component for now: */}
        {/* <DIDAvatar textToSpeak={avatarMessage} /> */}
        </div>
  
        {/* MIDDLE SECTION: Chat Area */}
        <div style={{
          flex: 1,
          maxWidth: "600px",
          margin: "0 auto",
          padding: "20px"
        }}>
          <h1>The Etherlink</h1>
          <div style={{
            marginBottom: "20px",
            padding: "10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px"
          }}>
            {currentPlayer 
              ? <p>Chatting as: <strong>{currentPlayer}</strong></p>
              : <p>...Establishing Connection...</p>
            }
          </div>
  
          <div
            ref={chatContainerRef}
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
              onKeyDown={(e) => {
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
      </div>
    );
  }
  
  export default App;
  