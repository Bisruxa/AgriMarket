'use client'
import Image from "next/image";
import Link from "next/link";
import { ThermometerSun, Calendar, Moon, MapPin, Sun } from 'lucide-react';
import image from "../../public/images/secondpage.png";
import { useState } from 'react';
import { useCurrentDateTime } from "../hooks/useCurrentDateTime";
import { useTranslations } from "../hooks/useTranlations";
import { useAuth } from "@/app/context/UserContext";
function WelcomeCard() {
  const { dayName, formattedDate, currentTime } = useCurrentDateTime();
  const t = useTranslations()
  const {user} = useAuth();
  const [temperatureUnit, setTemperatureUnit] = useState('C');
  const [weatherData] = useState({
    temp: 28,
    high: 32,
    low: 18,
  });

  const toggleUnit = () => {
    setTemperatureUnit(unit => unit === 'C' ? 'F' : 'C');
  };

  const convertTemp = (celsius: number) => {
    return temperatureUnit === 'C' ? celsius : Math.round((celsius * 9/5) + 32);
  };

  const UnitButton = ({ unit }: { unit: string }) => (
    <button 
      onClick={toggleUnit}
      className={`text-xs sm:text-sm font-medium transition-colors ${
        temperatureUnit === unit 
          ? 'text-[#5B8C51] border-b-2 border-[#5B8C51]' 
          : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      °{unit}
    </button>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 sm:px-5 text-black mt-20 sm:mt-0 mb-5 md:-ml-5 ml-0 ">
      <Link href="/portfolio" className="w-full">
        <div className="bg-whitek rounded-lg shadow-sm p-4 sm:p-5 h-48 sm:h-56 md:h-60 relative cursor-pointer overflow-hidden group border border-[#5B8C51]/30 hover:shadow-lg transition-all ">
          <div className="absolute inset-0">
            <Image
              src={image}
              alt="Ethiopian farmland"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
            />
           
          </div>
          <div className="relative z-10 h-full flex flex-col justify-end p-3 sm:p-4 -mt-10">
            <p className=" text-xs sm:text-sm drop-shadow-lg">{t.welcomeCard.title}</p>
            <h2 className=" py-1 sm:py-2 text-base sm:text-lg md:text-xl font-bold drop-shadow-lg">
              {user?.name}
            </h2>
            <p className=" text-xs sm:text-sm drop-shadow-lg">{t.welcomeCard.message}</p>
            <p className="mt-2 text-xs ">{currentTime}</p>
          </div>
        </div>
      </Link>

      <div className="bg-white text-black p-4 sm:p-5 md:p-6 rounded-lg shadow-sm h-48 sm:h-56 md:h-60 border border-[#5B8C51]/30 flex flex-col hover:shadow-lg transition-all">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2 bg-gray-100 p-1 px-2 rounded-lg">
            <MapPin size={16} className="text-[#5B8C51]" />
            <span className="font-semibold text-xs sm:text-sm text-[#5B8C51] truncate">
              Addis Ababa, Ethiopia
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* <UnitButton unit="C" />
            <UnitButton unit="F" /> */}
          </div>
        </div>

        <div className="mt-2 sm:mt-3">
          <div className="flex items-center gap-1 sm:gap-2 mt-5">
            <Calendar size={14} className="text-gray-500" />
            <h3 className="text-base sm:text-sm md:text-lg font-bold ">{dayName},</h3>
          </div>
          <p className="mt-1 ml-5 sm:ml-6 text-xs sm:text-sm text-gray-500">{formattedDate}</p>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-lg sm:text-xl md:text-2xl font-bold ">
              {convertTemp(weatherData.temp)}°{temperatureUnit}
            </p>
            <div className="flex gap-3 text-xs sm:text-sm text-gray-600 mt-1">
              <span className="flex items-center gap-1">
                <ThermometerSun size={12} className="text-orange-500" /> 
                H: {convertTemp(weatherData.high)}°
              </span>
              <span className="flex items-center gap-1">
                <Moon size={12} className="text-blue-400" /> 
                L: {convertTemp(weatherData.low)}°
              </span>
            </div>
          </div>
          <div className="bg-yellow-100 p-2 sm:p-3 rounded-full">
            <Sun size={24} className="text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-lg shadow-sm h-48 sm:h-56 md:h-60 border border-[#5B8C51]/30 flex items-center justify-center text-gray-500 hover:shadow-sm transition-all">
        <p className="text-xs sm:text-sm text-center">Coming Soon</p>
      </div>
    </div>
  );
}

export default WelcomeCard;