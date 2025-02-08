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

export default MainApp;
