import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketProvider";
import "./css/StylesComponent.css";

function StylesComponent() {
  const socket = useContext(SocketContext);
  const [selectedStyle, setSelectedStyle] = useState(
    localStorage.getItem("selectedStyle") || "Normal"
  );

  useEffect(() => {
    if (socket) {
      socket.emit("SetStyle", selectedStyle);
      localStorage.setItem("selectedStyle", selectedStyle);
    }
  }, [selectedStyle, socket]);

  function handleChange(event) {
    const newStyle = event.target.value;
    setSelectedStyle(newStyle);
  }

  return (
    <>
      <div className="settings-item">
        <label htmlFor="styles">Style: </label>
        <select id="dropdown" value={selectedStyle} onChange={handleChange}>
          <option value="normaali puhekieli">Normal</option>
          <option value="hauska ja ironinen">Funny</option>
          <option value="ärsyttävä ja vittumainen">Annoying</option>
          <option value="sarkastinen ja kyrpä">Sarcastic</option>
        </select>
      </div>
    </>
  );
}

export default StylesComponent;
