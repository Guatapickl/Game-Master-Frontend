import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import App from "./App";
import DIDChat from "./DIDChat";

function MainApp() {
  return (
    <Router>
      <div style={{ textAlign: "center", padding: "10px" }}>
        <Link to="/" style={{ marginRight: "10px" }}>Etherlink Chat</Link>
        <Link to="/did-chat">D-ID Chat</Link>
      </div>
      
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/did-chat" element={<DIDChat />} />
      </Routes>
    </Router>
  );
}

export default MainApp;
