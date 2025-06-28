"use client";
import React, { useEffect, useState } from "react";
import LiveClock from "./LiveClock";

const SalatTimes = () => {
  const getCurrentDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const [search, setSeach] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [salatTime, setSalatTime] = useState({
    fajr: "",
    dhuhr: "",
    asr: "",
    maghrib: "",
    isha: "",
    sunrise: "",
    sunset: "",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setIsLoading(true);
      setLocation(search);
      setSeach("");
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        await getCityName(lat, lon);
      },

      (error) => {
        console.error("Error getting location:", error);
        setIsLoading(false);
      }
    );
  }, []);

  const formatTo12Hour = (time24: string): string => {
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${period}`;
  };

  const getCityName = async (lat: number, lon: number) => {
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    if (!apiKey) {
      console.error("API key is not defined");
      return;
    }
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      if (!res.ok) throw new Error("Location weather not found");
      const data = await res.json();
      setLocation(data.name);
      setIsLoading(false);
      setSeach(data.name);
      console.log("Location fetched:", data.name);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const response = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${location}&country=Bangladesh&method=1`
        );
        const data = await response.json();
        const salatTime = data.data.timings;
        setSalatTime({
          fajr: formatTo12Hour(salatTime.Fajr),
          dhuhr: formatTo12Hour(salatTime.Dhuhr),
          asr: formatTo12Hour(salatTime.Asr),
          maghrib: formatTo12Hour(salatTime.Maghrib),
          isha: formatTo12Hour(salatTime.Isha),
          sunrise: formatTo12Hour(salatTime.Sunrise),
          sunset: formatTo12Hour(salatTime.Sunset),
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching prayer times", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (location) {
      fetchPrayerTimes();
    }
  }, [location]);

  const allSalatTimes = [
    { name: "Fajr", time: salatTime.fajr },
    { name: "Dhuhr", time: salatTime.dhuhr },
    { name: "Asr", time: salatTime.asr },
    { name: "Maghrib", time: salatTime.maghrib },
    { name: "Isha", time: salatTime.isha },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-l from-blue-500 to-blue-300 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md shadow-2xl p-4 rounded-2xl">
        <div className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-2xl p-3 shadow-md mb-4">
          <p className="text-center font-bold text-2xl">
            Salat <span className="text-amber-900">Times</span>
          </p>
          {location && (
            <p className="text-center text-lg font-semibold">
              Location: {location}
            </p>
          )}
          <p className="text-center">Today {getCurrentDate()}</p>
        </div>
        {location && (
          <div className="flex flex-col sm:flex-row justify-between shadow-md rounded-xl px-4 py-2 text-blue-600 items-center mb-2 bg-blue-100">
            <p className="text-center text-sm sm:text-base font-semibold">
              🌅 Sunrise: {salatTime.sunrise}
            </p>
            <p className="text-center text-sm sm:text-base font-semibold">
              🌇 Sunset: {salatTime.sunset}
            </p>
          </div>
        )}
        <LiveClock />
        <form onSubmit={handleSearch} className="mt-4">
          <input
            type="text"
            placeholder="Search City Location"
            onChange={(e) => setSeach(e.target.value)}
            className="w-full p-2 rounded-lg border-2 border-blue-500 focus:outline-none focus:border-blue-700"
          />
        </form>

        {/* Loader / Content */}
        {isLoading ? (
          <div className="text-center mt-4 text-blue-600 font-semibold animate-pulse">
            ⏳ Loading prayer times...
          </div>
        ) : location ? (
          <div className="mt-4 space-y-2">
            {allSalatTimes.map((salat, index) => (
              <div
                key={index}
                className="text-white flex justify-between items-center bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg px-4 py-2 shadow-md"
              >
                <p className="font-medium">{salat.name}</p>
                <p className="font-bold">{salat.time}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center mt-4 text-red-600 font-medium">
            ❌ Could not detect location.
          </p>
        )}
      </div>
    </div>
  );
};

export default SalatTimes;
