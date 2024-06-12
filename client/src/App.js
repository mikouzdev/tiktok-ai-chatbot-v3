import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import MainSite from "./components/MainSite.js";
import ModerationPanel from "./components/ModerationPanel.js";
import { SocketProvider } from "./components/SocketProvider.js";

function App() {
  return (
    <Router>
      <SocketProvider>
        <Routes>
          <Route path="/" Component={MainSite} />
          <Route path="/moderation" Component={ModerationPanel} />
        </Routes>
      </SocketProvider>
    </Router>
  );
}

export default App;
