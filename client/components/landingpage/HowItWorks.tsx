'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { UserPlus, Map, Brain, Handshake } from 'lucide-react';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useLanguage } from '@/app/context/LanguageContext';

const HowItWorks = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const t = useTranslations();
  const { language } = useLanguage();
  
  const steps = [
    {
      icon: <UserPlus className="text-[#5B8C51]" size={48} />,
      link: "/signup"
    },
    {
      icon: <Map className="text-[#5B8C51]" size={48} />,
      link: "/signup"
    },
    {
      icon: <Brain className="text-[#5B8C51]" size={48} />,
      link: "/signup"
    },
    {
      icon: <Handshake className="text-[#5B8C51]" size={48} />,
      link: "/signup"
    },
  ];

  const stepTitles = [
    t.howItWorks.steps.signup,
    t.howItWorks.steps.addFarm,
    t.howItWorks.steps.getInsights,
    t.howItWorks.steps.connectGrow
  ];

  const stepDescriptions = [
    t.howItWorks.stepDescriptions.signup,
    t.howItWorks.stepDescriptions.addFarm,
    t.howItWorks.stepDescriptions.getInsights,
    t.howItWorks.stepDescriptions.connectGrow
  ];

  return (
    <section className={`py-16 md:py-20 px-4 md:px-8 bg-linear-to-b from-white to-[#F0F9F0] ${language === 'am' ? 'amharic' : ''}`}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-[28px] font-bold text-center mb-4 bg-linear-to-r from-[#5B8C51] to-[#3A6B31] bg-clip-text text-transparent">
          {t.howItWorks.title}
        </h2>
        
        <p className="text-gray-700 text-center text-lg mb-12 max-w-2xl mx-auto">
          {t.howItWorks.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const isHovered = hoveredIndex === index;
            
            return (
              <Link href={step.link} key={index} className="block">
                <div
                  className={`relative h-64 overflow-hidden bg-white rounded-xl border-2 transition-all duration-300 cursor-pointer p-6 ${
                    isHovered 
                      ? 'border-[#5B8C51] shadow-2xl shadow-[#5B8C51]/20 transform scale-[1.03]' 
                      : 'border-gray-200 shadow-lg'
                  }`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Step number */}
                  <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-linear-to-r from-[#5B8C51] to-[#3A6B31] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  
                  {/* Icon */}
                  <div className="flex justify-center mb-6 mt-8">
                    <div className="w-16 h-16 flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-[20px] font-bold text-gray-800 text-center mb-3">
                    {stepTitles[index]}
                  </h3>
                  
                  {/* Description with hover effect */}
                  <p className={`text-gray-600 text-center text-sm transition-all duration-300 ${
                    isHovered 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-4 h-0'
                  }`}>
                    {stepDescriptions[index]}
                  </p>
                  {/* Hover linear overlay */}
                  <div className={`absolute inset-0 bg-linear-to-t from-[#5B8C51]/5 to-transparent rounded-xl transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}></div>
                </div>
              </Link>
            );
          })}
        </div>
        {/* Call to action */}
        <div className="text-center mt-12">
          <p className="text-gray-700 mb-6 text-[14px]">
            {t.howItWorks.ctaDescription}
          </p>
          <Link href="/signup">
            <button className="px-8 py-3 bg-linear-to-r text-[14px] from-[#5B8C51] to-[#3A6B31] text-white font-semibold rounded-full hover:from-[#6DA562] hover:to-[#4A7B41] transition-all duration-300 shadow-lg text-lg transform hover:scale-105">
              {t.howItWorks.cta}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;