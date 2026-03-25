'use client'
import Link from 'next/link';
import { useTranslations } from '../hooks/useTranlations';
import { useState } from 'react';
export default function HeroSection() {
  const t = useTranslations();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videos = [
    { src: "/Farm_Truck.mp4", brightness: 0.7 },
    { src: "/Farm_Land.mp4", brightness: 0.7 }
  ];
  const handlePrevious = () => {
    setCurrentVideoIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setCurrentVideoIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };
  return (
    <div className='relative min-h-screen flex flex-col md:flex-row items-center justify-between px-4 md:px-8 lg:px-20 py-20 pt-32 overflow-hidden'>
      
      {videos.map((video, index) => (
        <video 
          key={index}
          autoPlay 
          loop 
          muted 
          playsInline
          className={`absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${
            index === currentVideoIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ filter: `brightness(${video.brightness})` }}
        >
          <source src={video.src} type="video/mp4" />
        </video>
      ))}
      
      <div className="absolute top-0 left-0 w-full h-full bg-[#153415]/30 z-0"></div>

      <button 
        onClick={handlePrevious}
        className="absolute left-4 md:left-8 bottom-8 z-20 group flex items-center gap-3 text-[#e4e5ba]"
        aria-label="Previous video"
      >
        <svg 
          width="60" 
          height="20" 
          viewBox="0 0 60 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="transform group-hover:scale-x-110 transition-transform duration-300 origin-left"
        >
          <path 
            d="M50 10H0M10 2L0 10L10 18" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-4 md:right-8 bottom-8 z-20 group flex items-center gap-3 text-[#e4e5ba]"
        aria-label="Next video"
      >
        <svg 
          width="60" 
          height="20" 
          viewBox="0 0 60 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="transform group-hover:scale-x-110 transition-transform duration-300 origin-right"
        >
          <path 
            d="M10 10H60M50 2L60 10L50 18" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-8 z-20 flex gap-4">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentVideoIndex(index)}
            className={`transition-all duration-300 ${
              index === currentVideoIndex 
                ? 'w-3 h-3 bg-white scale-125' 
                : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/70'
            } rounded-full`}
            aria-label={`Go to video ${index + 1}`}
          />
        ))}
      </div>
      <div className="relative z-10 flex flex-col items-center md:items-start w-full md:w-1/2 text-center md:text-left space-y-6 md:space-y-8">
        <div className="text-4xl sm:text-4xl md:text-[40px] font-extrabold leading-tight">
          <h1 className="text-[#e4e5ba]">
           {t.hero.title} <br />
            <span className="text-[#4A7342]">
             {t.hero.titleHighlight}
            </span> {t.hero.subtitle}
          </h1>
        </div>   
        <p className="text-[#e4e5ba] text-sm sm:text-sm md:text-[20px] leading-relaxed max-w-2xl ">
        {t.hero.description}
        </p>
        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6 mb-6">
          <Link href="/signup">
            <button className="px-8 py-3 text-[14px] bg-[#668B57] cursor-pointer  text-[#e4e5ba] font-semibold text-lg transform flex items-center gap-2">
              {t.hero.buttons.getStarted} 
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}