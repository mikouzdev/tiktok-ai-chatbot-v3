import React from "react";

import "./css/Centralized.css";
import InputContainer from "./InputContainer";
import ChatContainer from "./LiveComponents/ChatContainer";
import TikTokLiveConnection from "./LiveComponents/TikTokLiveConnection";
import SiteContainer from "./SiteContainer";

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
