import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import App from "./App";
import DIDChat from "./DIDChat";

function MainApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DIDChat />} /> {/* Default homepage */}
        <Route path="/quantumchat" element={<App />} /> {/* Etherlink Chat */}
      </Routes>
    </Router>
  );
}

//async function startSession(playerName) {
//  const response = await fetch("/session", {
//      method: "POST",
//      headers: { "Content-Type": "application/json" },
//      body: JSON.stringify({ player_name: playerName })
//  });
//  const data = await response.json();
//  if (data.token) {
//      localStorage.setItem("sessionToken", data.token);
//  }
//}

export default MainApp;
