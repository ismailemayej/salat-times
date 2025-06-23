"use client";
import { useEffect, useState } from "react";

const getFormattedTime = () => {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const LiveClock = () => {
  const [time, setTime] = useState(getFormattedTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getFormattedTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div className="text-xl text-center font-semibold">⏰ {time}</div>;
};

export default LiveClock;
