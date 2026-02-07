'use client'
import Image from "next/image";
import landing from "@/public/images/landing.png";
import { Zap, Lock, Brain, Smile } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from '../hooks/useTranlations';
export default function HeroSection() {
  
  const t = useTranslations();
  const features =[
    {icon:<Zap className='mr-2' size={18}/>},
     {icon:<Lock className='mr-2' size={18}/>},
      {icon:<Brain className='mr-2' size={18}/>},
       {icon:<Smile className='mr-2' size={18}/>},
  ]
  return (
    <div className='min-h-screen flex flex-col md:flex-row items-center justify-between px-4 md:px-8 lg:px-20 py-20 pt-32 bg-linear-to-br from-[#0A1F0A] via-[#1A3C1A] to-[#2A5A2A]'>
      
      {/* Content Section */}
      <div className="relative z-10 flex flex-col items-center md:items-start w-full md:w-1/2 text-center md:text-left space-y-6 md:space-y-8">
        <div className="text-3xl sm:text-4xl md:text-[40px] font-extrabold leading-tight">
          <h1 className="text-white">
           {t.hero.title} <br />
            <span className="bg-linear-to-r from-[#A3D9A5] to-[#5B8C51] bg-clip-text text-transparent ">
             {t.hero.titleHighlight}
            </span> {t.hero.subtitle}
          </h1>
        </div>
        
        <p className="text-gray-200 text-base sm:text-lg md:text-[20px] leading-relaxed max-w-2xl ">
        {t.hero.description}
        </p>

<div className="flex flex-wrap justify-center md:justify-start gap-3">
          {features.map((item, index) => (
            <span
  key={index}
  className="flex bg-linear-to-r from-[#5B8C51] to-green-800 bg-clip-text text-transparentflex items-center text-sm font-semibold px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full hover:bg-white/15 hover:border-[#5B8C51] transition-all duration-300"
>
  {item.icon}
  {t.hero.features[index]}
</span>
          ))}
        </div>
        {/* Buttons */}
        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6 mb-6">
          <Link href="/signup">
            <button className="px-8 py-3 text-[14px] bg-linear-to-r from-[#5B8C51] to-[#3A6B31] text-white font-semibold rounded-full hover:from-[#6DA562] hover:to-[#4A7B41] transition-all duration-300 shadow-xl text-lg transform hover:scale-105 flex items-center gap-2">
           {t.hero.buttons.getStarted} 
            </button>
          </Link>
          
          <button className="px-8 py-3 text-[14px] bg-transparent text-white font-semibold rounded-full border-2 border-white/50 hover:border-white hover:bg-white/10 transition-all duration-300 text-lg flex items-center gap-2">
         {t.hero.buttons.learnMore}
          </button>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative w-full md:w-1/2 mt-12 md:mt-0">
        <div className="relative w-full h-64 md:h-96 lg:h-400px rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
          <Image
            src={landing}
            alt={t.hero.altText}
            fill
            className="object-cover"
            priority
            quality={100}
          />
          {/* Subtle overlay for better integration with green background */}
          <div className="absolute inset-0 bg-linear-to-t from-[#0A1F0A]/40 to-transparent"></div>
        </div>
        
        {/* Floating testimonial card */}
        <div className="absolute -bottom-6 -right-4 md:-bottom-10 md:-right-10 bg-white p-3 md:p-6 rounded-xl shadow-2xl border border-gray-200 max-w-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-10 rounded-full bg-linear-to-r from-[#5B8C51] to-[#3A6B31] flex items-center justify-center">
              <span className="text-white font-bold">👨‍🌾</span>
            </div>
            <div>
              <div className="font-semibold text-gray-800">{t.hero.testimonialName}</div>
              <div className="text-sm text-gray-600">{t.hero.testimonialRole}</div>
            </div>
          </div>
          <p className="text-sm text-gray-600 italic">
           {t.hero.testimonial}
          </p>
          <div className="flex mt-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}