"use client";
import React, { useState } from "react";
import { MapPin, Sunrise, Wind, Droplets } from 'lucide-react';
import Image from "next/image";

const WeatherCard = () => {
  const [unit, setUnit] = useState("C");
  
  const toggleUnit = () => {
    setUnit(unit === "C" ? "F" : "C");
  };

  const weather = {
    location: "Addis Ababa, Ethiopia",
    day: "Sunday",
    date: "16 Nov, 2025",
    temperatureC: 28,
    highC: 32,
    lowC: 18,
    sunrise: "6:08 AM",
    humidity: 55,
    wind: 7,
  };

  const temperature =
    unit === "C"
      ? weather.temperatureC
      : ((weather.temperatureC * 9) / 5 + 32).toFixed(1);
  const high =
    unit === "C" ? weather.highC : ((weather.highC * 9) / 5 + 32).toFixed(1);
  const low =
    unit === "C" ? weather.lowC : ((weather.lowC * 9) / 5 + 32).toFixed(1);

  return (
    <div className="bg-linear-to-br h-50 from-green-50 to-emerald-50 p-5 border border-green-100 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-1.5 text-green-700 bg-white/80 backdrop-blur-sm py-1.5 px-3 rounded-full shadow-sm border border-green-200">
          <MapPin size={14} className="text-green-600" />
          <span className="text-xs font-medium truncate max-w-35">{weather.location}</span>
        </div>
        <div className="flex bg-gray-800 rounded-full p-0.5 shadow-inner">
          <button
            onClick={() => setUnit("C")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
              unit === "C" 
                ? "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-md" 
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            °C
          </button>
          <button
            onClick={() => setUnit("F")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
              unit === "F" 
                ? "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-md" 
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            °F
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{weather.day}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{weather.date}</p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-green-600 font-medium">H: {high}°{unit}</span>
            <span className="text-gray-300">|</span>
            <span className="text-blue-600 font-medium">L: {low}°{unit}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Image 
              width={60} 
              height={60} 
              src="/icon-overcast.webp" 
              alt="weather" 
              className="drop-shadow-lg"
            />
          </div>
          <div className="text-4xl font-bold text-gray-800">
            {temperature}<span className="text-xl text-gray-500">°{unit}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3  pt-4 border-t border-green-200/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-100 rounded-lg">
            <Sunrise size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Sunrise</p>
            <p className="text-sm font-semibold text-gray-700">{weather.sunrise}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <Droplets size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Humidity</p>
            <p className="text-sm font-semibold text-gray-700">{weather.humidity}%</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-100 rounded-lg">
            <Wind size={16} className="text-gray-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Wind</p>
            <p className="text-sm font-semibold text-gray-700">{weather.wind} km/h</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;