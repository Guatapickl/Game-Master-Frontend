import React, { useEffect } from "react";

function DIDAvatar() {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://agent.d-id.com/v1/index.js";
    script.dataset.name = "did-agent";
    script.dataset.mode = "fabio"; // Change if you use another mode
    script.dataset.clientKey = "Z29vZ2xlLW9hdXRoMnwxMDI3MDM1NTk0NDM5ODI5NzkyNzE6WThFQ00wdzAwM2xVdkQyaUs1Tl90";
    script.dataset.agentId = "agt_uZKKGAXQ";
    script.dataset.monitor = "true";

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div id="did-avatar-container" style={{ width: "300px", height: "400px" }}>
      {/* This is where your agent will appear */}
    </div>
  );
}

export default DIDAvatar;
