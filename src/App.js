import React, { useState, useEffect, useRef } from 'react';


const API_URL = "https://quantumgamemaster-08115932719b.herokuapp.com";

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const chatContainerRef = useRef(null); // Reference for chat container
  

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
    // Auto-scroll to the bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
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

  const sendMessage = async () => {
    console.log("Current cookies before fetch:", document.cookie);
        if (!userInput.trim()) return;

        const displayName = currentPlayer || "Unknown Player";
        const newMessages = [...messages, { role: displayName, text: userInput }];
        setMessages(newMessages);

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

            const response = await fetch(`${API_URL}/chat`, fetchOptions);

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


    // const handleNameSubmit = async (name) => {
    //   setCurrentPlayer(name);
    //   // Optionally send "name" to the backend 
    //   // so the cookie is set properly right away:
    //   try {
    //     const response = await fetch(`${API_URL}/chat`, {
    //       method: "POST",
    //       credentials: "include",
    //       headers: {
    //         "Content-Type": "application/json",
    //         "Accept": "application/json"
    //       },
    //       body: JSON.stringify({ message: name }),
    //     });
    //     // If backend sets the cookie, your next refresh should show it
    //     // in the chat. Or you can do more logic here if needed.
    //   } catch (err) {
    //     console.error(err);
    //   }
    // };
  

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
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    );
  }
  
  export default App;
  