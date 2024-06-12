import React from "react"; // Import React library
import SettingsComponent from "./SettingsComponent";
import StylesComponent from "./StylesComponent";

function Tools() {
  return (
    <>
      <div className="settings-container">
        <SettingsComponent />
        {/* <StylesComponent /> */}
      </div>
    </>
  );
}

export default Tools; // Export the Tools component as the default export of the module
