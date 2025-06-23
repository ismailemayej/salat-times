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
    if (search.trim()) setLocation(search);
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
      }
    );
  }, []);
  //   24 hours format
  const formatTo12Hour = (time24: string): string => {
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${period}`;
  };

  // This is  AutoLocation
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
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  //   this is useEffect for fetching prayer times
  useEffect(() => {
    const fetchPrayerTimes = async () => {
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
    <div className=" min-h-screen bg-gradient-to-l from blue-500 to-blue-300 flex flex-col items-center justify-center mx-auto ">
      <div className="bg-white w-96 shadow-2xl p-4 rounded-2xl">
        <div className="bg-gradient-to-t from blue-500 to-blue-500 rounded-2xl p-2 shadow-2xl">
          <p className="text-center font-bold  text-2xl ">
            Salat <span className="text-amber-900">Times</span>
          </p>
          {location && (
            <p className="text-center text-lg font-semibold">
              Location:{location}
            </p>
          )}

          <p className="text-center">Tody {getCurrentDate()}</p>
        </div>
        <div className="flex justify-between  shadow-2xl rounded-xl px-2 text-blue-500 items-center">
          <p className="text-center mt-2 text-lg font-semibold">
            Sunrise: {salatTime.sunrise}
          </p>
          <p className="text-center text-lg font-semibold">
            Sunset: {salatTime.sunset}
          </p>
        </div>
        <LiveClock />
        {/* this is Search Section */}
        <form onSubmit={handleSearch} className="mt-4">
          <input
            type="text"
            placeholder="Search City Location"
            value={search}
            onChange={(e) => setSeach(e.target.value)}
            className="w-full mt-3 p-2 rounded-lg border-2 border-blue-500 focus:outline-none focus:border-blue-700"
          />
        </form>

        {/* All Salat Section Section */}
        {location ? (
          <div>
            {allSalatTimes.map((salat, index) => (
              <div
                key={index}
                className=" text-white flex justify-between mt-3 bg-gradient-to-t from-blue-300 to-blue-600 shadow-2xl rounded-xl p-2"
              >
                <p>{salat.name}</p>
                <p>{salat.time}</p>
              </div>
            ))}
          </div>
        ) : (
          "location Finding..."
        )}
      </div>
    </div>
  );
};

export default SalatTimes;
