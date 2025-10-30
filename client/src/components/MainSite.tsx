import "./css/Centralized.css";
import InputContainer from "./InputContainer.tsx";
import ChatContainer from "./LiveComponents/ChatContainer.tsx";
import TikTokLiveConnection from "./LiveComponents/TikTokLiveConnection.tsx";
import SiteContainer from "./SiteContainer.tsx";

const MainSite = () => {
  return (
    <div>
      <SiteContainer className="body-container">
        <InputContainer className="top-container">
          <TikTokLiveConnection />
        </InputContainer>
        <ChatContainer />
      </SiteContainer>
    </div>
  );
};

export default MainSite;
