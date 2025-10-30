import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import MainSite from "./components/MainSite.tsx";
import ModerationPanel from "./components/ModerationPanel.tsx";
import { SocketProvider } from "./components/SocketProvider.tsx";

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
