import React, { useCallback, useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketProvider";

function SettingsComponent() {
  const socket = useContext(SocketContext); // Get the socket instance from SocketContext

  // State variables for the timeout and the range of time values
  const [timeout, setTimeout] = useState(() => parseInt(localStorage.getItem("timeout")) || 2);
  const [range] = useState({ min: 1, max: 10 });
  const [showButton, setShowButton] = useState(false); // State variable for showing the "Apply" button

  useEffect(() => {
    localStorage.setItem("timeout", timeout);
  }, [timeout]);

  // Emit only when button pressed
  useEffect(() => {
    if (!showButton && socket) {
      socket.emit("TimeBetweenComments", timeout * 1000);
    }
  }, [showButton, socket, timeout]);

  // Handler function for timeout change
  const handleTimeoutChange = useCallback(
    (event) => {
      setTimeout(Math.min(Math.max(event.target.value, range.min), range.max));
      setShowButton(true);
    },
    [range.min, range.max]
  );

  // Handler function for submitting the timeout value
  function handleTimeoutSubmit() {
    console.log(timeout); // Log the new timeout value
    setShowButton(false); // Hide the "Apply" button
  }
  return (
    <>
      <div className="settings-item">
        <label htmlFor="timeout">Comment interval(s):</label>
        <div className="timeout">
          <input min={range.min} max={range.max} onChange={handleTimeoutChange} value={timeout} type="number" name="timeout"></input>
          {showButton && <button onClick={handleTimeoutSubmit}>Apply</button>} {/* Render the "Apply" button if it should be shown */}
        </div>
      </div>
    </>
  );
}

export default SettingsComponent;
