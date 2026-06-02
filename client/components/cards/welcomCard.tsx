'use client';

import Image from "next/image";
import Link from "next/link";
import { ThermometerSun, Calendar, Moon, MapPin, Sun } from 'lucide-react';
import image from "../../public/images/secondpage.png";
import { useState } from 'react';
import { useCurrentDateTime } from "../hooks/useCurrentDateTime";
import { useTranslations } from "../hooks/useTranlations";
import { useAuth } from "@/app/context/UserContext";
import { useLanguage } from "@/app/context/LanguageContext";
import FarmFactsCarousel from "./FarmFactsCarousel";

const CARD_HEIGHT = "h-32 sm:h-36";

function WelcomeCard() {
  const { dayName, formattedDate, currentTime } = useCurrentDateTime();
  const t = useTranslations();
  const { language } = useLanguage();
  const w = t.dashboard.weather;
  const { user } = useAuth();
  const [temperatureUnit] = useState('C');
  const [weatherData] = useState({
    temp: 28,
    high: 32,
    low: 18,
  });

  const convertTemp = (celsius: number) => {
    return temperatureUnit === 'C' ? celsius : Math.round((celsius * 9/5) + 32);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-4 sm:px-5 text-black mt-16 sm:mt-0 mb-3 md:-ml-5 ml-0 ${language === 'am' ? 'amharic' : ''}`}>
      <Link href="/farmer/portfolio" className="w-full">
        <div className={`bg-white rounded-lg shadow-sm p-3 sm:p-4 ${CARD_HEIGHT} relative cursor-pointer overflow-hidden group border border-[#5B8C51]/30 hover:shadow-lg transition-all`}>
          <div className="absolute inset-0">
            <Image
              src={image}
              alt="Ethiopian farmland"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-end p-2 sm:p-3">
            <p className="text-xs drop-shadow-lg">{t.welcomeCard.title}</p>
            <h2 className="py-0.5 text-sm sm:text-base font-bold drop-shadow-lg">
              {user?.name}
            </h2>
            <p className="text-xs drop-shadow-lg">{t.welcomeCard.message}</p>
            <p className="mt-1 text-[10px]">{currentTime}</p>
          </div>
        </div>
      </Link>

      <div className={`bg-white text-black p-3 sm:p-4 rounded-lg shadow-sm ${CARD_HEIGHT} border border-[#5B8C51]/30 flex flex-col hover:shadow-lg transition-all`}>
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2 bg-gray-100 p-1 px-2 rounded-lg">
            <MapPin size={14} className="text-[#5B8C51]" />
            <span className="font-semibold text-xs text-[#5B8C51] truncate">
              {w.location}
            </span>
          </div>
        </div>

        <div className="mt-1">
          <div className="flex items-center gap-1 mt-2">
            <Calendar size={12} className="text-gray-500" />
            <h3 className="text-sm font-bold">{dayName},</h3>
          </div>
          <p className="mt-0.5 ml-4 text-[10px] sm:text-xs text-gray-500">{formattedDate}</p>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-lg sm:text-xl font-bold">
              {convertTemp(weatherData.temp)}°{temperatureUnit}
            </p>
            <div className="flex gap-2 text-[10px] sm:text-xs text-gray-600 mt-0.5">
              <span className="flex items-center gap-1">
                <ThermometerSun size={11} className="text-orange-500" />
                {w.tempHigh}: {convertTemp(weatherData.high)}°
              </span>
              <span className="flex items-center gap-1">
                <Moon size={11} className="text-blue-400" />
                {w.tempLow}: {convertTemp(weatherData.low)}°
              </span>
            </div>
          </div>
          <div className="bg-yellow-100 p-2 rounded-full">
            <Sun size={20} className="text-yellow-500" />
          </div>
        </div>
      </div>

      <FarmFactsCarousel />
    </div>
  );
}

export default WelcomeCard;
