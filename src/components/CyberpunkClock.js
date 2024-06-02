// src/CyberpunkClock.js
import React, { useEffect, useState } from "react";
import "./css/CyberpunkClock.css";

const CyberpunkClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${hours}:${minutes}:${seconds}`;
  };

  return <div className="cyberpunk-clock">{formatTime(time)}</div>;
};

export default CyberpunkClock;
