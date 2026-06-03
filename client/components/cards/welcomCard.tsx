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

const ROW_HEIGHT = "h-36 sm:h-48";

function WelcomeCard() {
  const { dayName, formattedDate, currentTime } = useCurrentDateTime();
  const t = useTranslations();
  const { language } = useLanguage();
  const w = t.dashboard.weather;
  const { user } = useAuth();
  const [temperatureUnit] = useState('C');
  const [weatherData] = useState({ temp: 28, high: 32, low: 18 });

  const convertTemp = (celsius: number) =>
    temperatureUnit === 'C' ? celsius : Math.round((celsius * 9 / 5) + 32);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-4 sm:px-5 mb-4 md:-ml-5 ml-0 ${language === 'am' ? 'amharic' : ''}`}>
      <Link href="/farmer/portfolio" className="w-full">
        <div className={`${ROW_HEIGHT} relative overflow-hidden rounded-lg border border-[#5B8C51]/20 group`}>
          <Image
            src={image}
            alt="Ethiopian farmland"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-end p-3 text-white">
            <p className="text-sm opacity-90">{t.welcomeCard.title}</p>
            <h2 className="font-semibold">{user?.name}</h2>
            <p className="text-sm opacity-90">{t.welcomeCard.message}</p>
            <p className="mt-1 text-xs opacity-75">{currentTime}</p>
          </div>
        </div>
      </Link>

      <div className={`${ROW_HEIGHT} flex flex-col rounded-lg border border-[#5B8C51]/20 p-3 sm:p-4`}>
        <div className="flex items-center gap-2 text-[#2A5A2A]">
          <MapPin size={14} />
          <span className="font-medium truncate">{w.location}</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-gray-600">
          <Calendar size={14} />
          <span className="font-medium">{dayName}</span>
        </div>
        <p className="ml-5 text-sm text-gray-500">{formattedDate}</p>
        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-xl font-semibold text-[#0B3D2E]">
              {convertTemp(weatherData.temp)}°{temperatureUnit}
            </p>
            <div className="mt-0.5 flex gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <ThermometerSun size={12} className="text-orange-500" />
                {w.tempHigh}: {convertTemp(weatherData.high)}°
              </span>
              <span className="flex items-center gap-1">
                <Moon size={12} className="text-blue-400" />
                {w.tempLow}: {convertTemp(weatherData.low)}°
              </span>
            </div>
          </div>
          <Sun size={22} className="text-yellow-500" />
        </div>
      </div>

      <FarmFactsCarousel />
    </div>
  );
}

export default WelcomeCard;
